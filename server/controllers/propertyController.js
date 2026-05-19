import Property from '../models/Property.js';
import Landlord from '../models/Landlord.js';
import { getCloudinary } from '../config/cloudinary.js';
import { uploadToCloudinary } from '../utils/cloudinaryUpload.js';
import { sendPropertySubmittedEmail } from '../config/nodemailer.js';
import { getIO } from '../config/socket.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const geocodeAddress = async (address) => {
  try {
    const encoded = encodeURIComponent(address);
    const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`;
    const response = await fetch(url, { headers: { 'User-Agent': 'RentifyApp/1.0' } });
    const data = await response.json();
    if (data && data.length > 0) {
      const { lon, lat } = data[0];
      return { type: 'Point', coordinates: [parseFloat(lon), parseFloat(lat)] };
    }
  } catch {
    // Non-fatal — property saves without coordinates
  }
  return null;
};

// ─── @desc    Create Property ─────────────────────────────────────────────────
// @route   POST /api/landlord/properties
// @access  Private (landlord)
export const createProperty = async (req, res, next) => {
  try {
    const {
      title, description, city, area, address,
      price, propertyType, genderType, facilities,
      totalRooms, availableRooms,
      latitude, longitude,
    } = req.body;

    let parsedFacilities = facilities || [];
    if (typeof parsedFacilities === 'string') {
      try { parsedFacilities = JSON.parse(parsedFacilities); } catch { parsedFacilities = [parsedFacilities]; }
    }

    let location = null;
    let lat = null;
    let lng = null;

    if (latitude && longitude) {
      lat = parseFloat(latitude);
      lng = parseFloat(longitude);
      location = { type: 'Point', coordinates: [lng, lat] };
    } else {
      location = await geocodeAddress(`${address}, ${city}, Pakistan`);
      if (location) {
        [lng, lat] = location.coordinates;
      }
    }

    const images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer, 'rentify-properties');
        images.push({ public_id: result.public_id, secure_url: result.secure_url });
      }
    }

    const property = await Property.create({
      owner: req.user.id,
      title, description, city, area, address,
      price, propertyType, genderType,
      facilities: parsedFacilities,
      totalRooms, availableRooms,
      images,
      latitude: lat,
      longitude: lng,
      isAvailable: true,
      status: 'PENDING',
      ...(location && { location }),
    });

    // Notify owner + admin (non-blocking)
    Landlord.findById(req.user.id).select('name email').then((owner) => {
      if (owner) {
        sendPropertySubmittedEmail(owner.email, owner.name, property.title).catch(() => {});
        try {
          getIO().to('admin_room').emit('new_notification', {
            type: 'NEW_PROPERTY',
            title: 'New Property Submission',
            message: `"${property.title}" submitted by ${owner.name}`,
            propertyId: property._id,
            createdAt: new Date(),
          });
        } catch { /* socket not ready */ }
      }
    }).catch(() => {});

    res.status(201).json({
      success: true,
      message: 'Property submitted. It will be visible after admin approval.',
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Update Property ─────────────────────────────────────────────────
// @route   PUT /api/landlord/properties/:id
// @access  Private (landlord)
export const updateProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }
    if (property.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this property' });
    }

    const allowed = [
      'title', 'description', 'city', 'area', 'address',
      'price', 'propertyType', 'genderType', 'facilities',
      'totalRooms', 'availableRooms', 'isAvailable',
    ];

    const updateData = {};
    allowed.forEach((f) => { if (req.body[f] !== undefined) updateData[f] = req.body[f]; });

    if (updateData.facilities && typeof updateData.facilities === 'string') {
      try { updateData.facilities = JSON.parse(updateData.facilities); } catch { /* ignore */ }
    }

    // Re-geocode if address/city changed
    if (updateData.address || updateData.city) {
      const newAddress = updateData.address || property.address;
      const newCity = updateData.city || property.city;
      const location = await geocodeAddress(`${newAddress}, ${newCity}, Pakistan`);
      if (location) {
        updateData.location = location;
        updateData.longitude = location.coordinates[0];
        updateData.latitude = location.coordinates[1];
      }
    }

    // Append new images
    if (req.files && req.files.length > 0) {
      const newImages = [];
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer, 'rentify-properties');
        newImages.push({ public_id: result.public_id, secure_url: result.secure_url });
      }
      updateData.images = [...property.images, ...newImages];
    }

    updateData.status = 'PENDING_REVIEW';

    const updated = await Property.findByIdAndUpdate(req.params.id, updateData, {
      new: true, runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Property updated. Re-approval required.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Delete Property ─────────────────────────────────────────────────
// @route   DELETE /api/landlord/properties/:id
// @access  Private (landlord)
export const deleteProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }
    if (property.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this property' });
    }

    const cloudinary = getCloudinary();
    if (property.images && property.images.length > 0) {
      await Promise.all(property.images.map((img) => cloudinary.uploader.destroy(img.public_id)));
    }

    await Property.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Property deleted successfully', data: null });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Get My Properties ───────────────────────────────────────────────
// @route   GET /api/landlord/properties
// @access  Private (landlord)
export const getMyProperties = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const [properties, total] = await Promise.all([
      Property.find({ owner: req.user.id }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Property.countDocuments({ owner: req.user.id }),
    ]);

    res.status(200).json({
      success: true,
      data: { properties, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } },
    });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Get Single Property (owner) ────────────────────────────────────
// @route   GET /api/landlord/properties/:id
// @access  Private (landlord)
export const getMyProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }
    if (property.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    res.status(200).json({ success: true, data: property });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Update Availability ────────────────────────────────────────────
// @route   PATCH /api/landlord/properties/:id/availability
// @access  Private (landlord)
export const updateAvailability = async (req, res, next) => {
  try {
    const { availableRooms, isAvailable } = req.body;

    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }
    if (property.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (availableRooms !== undefined) {
      const rooms = Number(availableRooms);
      if (rooms > property.totalRooms) {
        return res.status(400).json({
          success: false,
          message: `Available rooms (${rooms}) cannot exceed total rooms (${property.totalRooms})`,
        });
      }
      property.availableRooms = rooms;
      property.isAvailable = rooms > 0;
    }

    if (isAvailable !== undefined) {
      property.isAvailable = isAvailable;
    }

    await property.save({ validateModifiedOnly: true });

    res.status(200).json({
      success: true,
      message: 'Availability updated',
      data: { availableRooms: property.availableRooms, isAvailable: property.isAvailable },
    });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Delete Property Image ──────────────────────────────────────────
// @route   DELETE /api/landlord/properties/:id/images/:imageId
// @access  Private (landlord)
export const deletePropertyImage = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }
    if (property.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const image = property.images.id(req.params.imageId);
    if (!image) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }

    await getCloudinary().uploader.destroy(image.public_id);
    property.images.pull(req.params.imageId);
    await property.save({ validateModifiedOnly: true });

    res.status(200).json({ success: true, message: 'Image deleted', data: null });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Increment Property Views (public, atomic) ───────────────────────
// @route   PATCH /api/properties/:id/view
// @access  Public
export const incrementPropertyViews = async (req, res, next) => {
  try {
    const property = await Property.findOneAndUpdate(
      { _id: req.params.id, status: 'APPROVED' },
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found or not approved' });
    }

    res.status(200).json({ success: true, data: { views: property.views } });
  } catch (error) {
    next(error);
  }
};
