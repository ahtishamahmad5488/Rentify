import Hostel from '../models/Hostel.js';
import HostelOwner from '../models/HostelOwner.js';
import { getCloudinary } from '../config/cloudinary.js';
import { uploadToCloudinary } from '../utils/cloudinaryUpload.js';
import { sendHostelSubmittedEmail } from '../config/nodemailer.js';
import { getIO } from '../config/socket.js';

/**
 * Geocode an address string to GeoJSON coordinates using OpenStreetMap Nominatim.
 * Returns { type: 'Point', coordinates: [lng, lat] } or null if not found.
 */
const geocodeAddress = async (address) => {
  try {
    const encoded = encodeURIComponent(address);
    const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'AhsaanullahHostelApp/1.0' },
    });
    const data = await response.json();
    if (data && data.length > 0) {
      const { lon, lat } = data[0];
      return { type: 'Point', coordinates: [parseFloat(lon), parseFloat(lat)] };
    }
  } catch {
    // Geocoding failure is non-fatal — hostel still saves without coordinates
  }
  return null;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Auto-compute availabilityStatus based on available rooms.
 * Returns FULL when rooms === 0, AVAILABLE otherwise.
 * Owner can still override to CLOSED manually via updateAvailability.
 */
const computeAvailability = (availableRooms) =>
  Number(availableRooms) === 0 ? 'FULL' : 'AVAILABLE';

// ─── @desc    Create Hostel ───────────────────────────────────────────────────
// @route   POST /api/owner/hostels
// @access  Private (hostel_owner)
export const createHostel = async (req, res, next) => {
  try {
    const {
      name, description, city, area, fullAddress,
      pricePerMonth, roomType, genderType, facilities,
      totalRooms, availableRooms,
      latitude, longitude, // optional — sent by mobile map picker
    } = req.body;

    // Parse facilities — can arrive as JSON string from multipart/form-data
    let parsedFacilities = facilities || [];
    if (typeof parsedFacilities === 'string') {
      try { parsedFacilities = JSON.parse(parsedFacilities); } catch { parsedFacilities = [parsedFacilities]; }
    }

    // Prefer explicit coords from the mobile map picker. Fall back to geocoding
    // the address only when no coords were supplied.
    let location = null;
    if (latitude && longitude) {
      location = {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      };
    } else {
      location = await geocodeAddress(`${fullAddress}, ${city}, Pakistan`);
    }
    console.log('[GEOCODE] result:', location);

    // Upload all images to Cloudinary via shared utility
    const images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer, 'hostel-images');
        images.push({ public_id: result.public_id, secure_url: result.secure_url });
      }
    }

    const hostel = await Hostel.create({
      owner: req.user.id,
      name, description, city, area, fullAddress,
      pricePerMonth, roomType, genderType,
      facilities: parsedFacilities,
      totalRooms, availableRooms,
      images,
      // New hostel always starts as PENDING — admin must approve before it goes public
      status: 'PENDING',
      availabilityStatus: computeAvailability(availableRooms),
      ...(location && { location }),
    });

    // Notify owner via email + emit socket notification to admin (non-blocking)
    HostelOwner.findById(req.user.id).select('name email').then((owner) => {
      if (owner) {
        sendHostelSubmittedEmail(owner.email, owner.name, hostel.name).catch((err) =>
          console.error('Hostel submitted email failed:', err.message)
        );
        // Real-time notification to admin dashboard
        try {
          getIO().to('admin_room').emit('new_notification', {
            type: 'NEW_HOSTEL',
            title: 'New Hostel Submission',
            message: `"${hostel.name}" submitted by ${owner.name} (${hostel.city})`,
            hostelId: hostel._id,
            createdAt: new Date(),
          });
        } catch (e) { /* socket not ready — skip */ }
      }
    }).catch((err) => console.error('Owner fetch for email failed:', err.message));

    res.status(201).json({
      success: true,
      message: 'Hostel created successfully. It will be visible once an admin approves it.',
      data: hostel,
    });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Update Hostel ───────────────────────────────────────────────────
// @route   PUT /api/owner/hostels/:id
// @access  Private (hostel_owner)
export const updateHostel = async (req, res, next) => {
  try {
    const hostel = await Hostel.findById(req.params.id);
    if (!hostel) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }

    // Owners can only modify hostels they own — prevents cross-owner tampering
    if (hostel.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this hostel' });
    }

    const allowedFields = [
      'name', 'description', 'city', 'area', 'fullAddress',
      'pricePerMonth', 'roomType', 'genderType', 'facilities',
      'totalRooms', 'availableRooms',
    ];

    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    });

    // Parse facilities if sent as JSON string
    if (updateData.facilities && typeof updateData.facilities === 'string') {
      try { updateData.facilities = JSON.parse(updateData.facilities); } catch { /* ignore */ }
    }

    // Re-geocode if address or city changed
    if (updateData.fullAddress || updateData.city) {
      const newAddress = updateData.fullAddress || hostel.fullAddress;
      const newCity = updateData.city || hostel.city;
      const location = await geocodeAddress(`${newAddress}, ${newCity}, Pakistan`);
      if (location) updateData.location = location;
    }

    // Append newly uploaded images to existing array
    if (req.files && req.files.length > 0) {
      const newImages = [];
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer, 'hostel-images');
        newImages.push({ public_id: result.public_id, secure_url: result.secure_url });
      }
      updateData.images = [...hostel.images, ...newImages];
    }

    // Auto-recalculate availability if rooms count changed
    if (updateData.availableRooms !== undefined) {
      updateData.availabilityStatus = computeAvailability(updateData.availableRooms);
    }

    // Any content update requires admin re-approval before going public
    updateData.status = 'PENDING_REVIEW';

    const updated = await Hostel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Hostel updated. It is now under admin review and will be re-approved shortly.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Hard Delete Hostel ─────────────────────────────────────────────
// @route   DELETE /api/owner/hostels/:id
// @access  Private (hostel_owner)
export const deleteHostel = async (req, res, next) => {
  try {
    const hostel = await Hostel.findById(req.params.id);
    if (!hostel) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }

    if (hostel.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this hostel' });
    }

    // Delete all hostel images from Cloudinary
    const cloudinary = getCloudinary();
    if (hostel.images && hostel.images.length > 0) {
      await Promise.all(
        hostel.images.map((img) => cloudinary.uploader.destroy(img.public_id))
      );
    }

    // Hard delete — permanently remove from DB
    await Hostel.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Hostel permanently deleted successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Get All Owner's Hostels (paginated) ────────────────────────────
// @route   GET /api/owner/hostels?page=1&limit=10
// @access  Private (hostel_owner)
export const getMyHostels = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const [hostels, total] = await Promise.all([
      Hostel.find({ owner: req.user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Hostel.countDocuments({ owner: req.user.id }),
    ]);

    res.status(200).json({
      success: true,
      message: 'Hostels retrieved successfully',
      data: {
        hostels,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Get Single Hostel (owner access only) ──────────────────────────
// @route   GET /api/owner/hostels/:id
// @access  Private (hostel_owner)
export const getMyHostel = async (req, res, next) => {
  try {
    const hostel = await Hostel.findById(req.params.id);
    if (!hostel) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }

    if (hostel.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this hostel' });
    }

    res.status(200).json({
      success: true,
      message: 'Hostel retrieved successfully',
      data: hostel,
    });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Update Hostel Availability ─────────────────────────────────────
// @route   PATCH /api/owner/hostels/:id/availability
// @access  Private (hostel_owner)
export const updateAvailability = async (req, res, next) => {
  try {
    const { availableRooms, availabilityStatus } = req.body;

    if (availableRooms === undefined && availabilityStatus === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Provide either availableRooms or availabilityStatus',
      });
    }

    const hostel = await Hostel.findById(req.params.id);
    if (!hostel) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }

    if (hostel.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // ─── Room count update: auto-computes FULL/AVAILABLE ────────────────────
    if (availableRooms !== undefined) {
      const rooms = Number(availableRooms);

      if (rooms > hostel.totalRooms) {
        return res.status(400).json({
          success: false,
          message: `Available rooms (${rooms}) cannot exceed total rooms (${hostel.totalRooms})`,
        });
      }

      hostel.availableRooms = rooms;
      hostel.availabilityStatus = computeAvailability(rooms);
    }

    // ─── Manual status override ──────────────────────────────────────────────
    // Applied after rooms logic so it always takes final precedence.
    if (availabilityStatus !== undefined) {
      hostel.availabilityStatus = availabilityStatus;
    }

    await hostel.save({ validateModifiedOnly: true });

    res.status(200).json({
      success: true,
      message: 'Availability updated successfully',
      data: {
        availableRooms: hostel.availableRooms,
        availabilityStatus: hostel.availabilityStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Delete a Single Hostel Image ───────────────────────────────────
// @route   DELETE /api/owner/hostels/:id/images/:imageId
// @access  Private (hostel_owner)
export const deleteHostelImage = async (req, res, next) => {
  try {
    const hostel = await Hostel.findById(req.params.id);
    if (!hostel) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }

    if (hostel.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this hostel' });
    }

    const image = hostel.images.id(req.params.imageId);
    if (!image) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }

    await getCloudinary().uploader.destroy(image.public_id);
    hostel.images.pull(req.params.imageId);
    await hostel.save({ validateModifiedOnly: true });

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Increment Hostel Views (atomic) ─────────────────────────────────
// @route   PATCH /api/hostels/:id/view
// @access  Public
export const incrementHostelViews = async (req, res, next) => {
  try {
    const hostel = await Hostel.findOneAndUpdate(
      { _id: req.params.id, status: 'APPROVED' },
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!hostel) {
      return res.status(404).json({
        success: false,
        message: 'Hostel not found or not yet approved',
      });
    }

    res.status(200).json({
      success: true,
      message: 'View recorded',
      data: { views: hostel.views },
    });
  } catch (error) {
    next(error);
  }
};

