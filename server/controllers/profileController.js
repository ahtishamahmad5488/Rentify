import Landlord from '../models/Landlord.js';
import { getCloudinary } from '../config/cloudinary.js';
import { uploadToCloudinary } from '../utils/cloudinaryUpload.js';

// ─── @desc    Get Landlord Profile ───────────────────────────────────────────
// @route   GET /api/landlord/profile
// @access  Private (landlord)
export const getProfile = async (req, res, next) => {
  try {
    const landlord = await Landlord.findById(req.user.id);
    if (!landlord) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: landlord,
    });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Update Landlord Profile ────────────────────────────────────────
// @route   PUT /api/landlord/profile
// @access  Private (landlord)
export const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'cnic', 'businessAddress', 'phone'];
    const updateData = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    });

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields provided to update' });
    }

    const landlord = await Landlord.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!landlord) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: landlord,
    });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Upload / Replace Profile Image ──────────────────────────────────
// @route   PUT /api/landlord/profile/image
// @access  Private (landlord)
export const uploadProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image file' });
    }

    const landlord = await Landlord.findById(req.user.id);
    if (!landlord) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    if (landlord.profileImage?.public_id) {
      await getCloudinary().uploader.destroy(landlord.profileImage.public_id);
    }

    const result = await uploadToCloudinary(req.file.buffer, 'rentify-landlords');

    landlord.profileImage = {
      public_id: result.public_id,
      secure_url: result.secure_url,
    };
    await landlord.save({ validateModifiedOnly: true });

    res.status(200).json({
      success: true,
      message: 'Profile image updated successfully',
      data: { profileImage: landlord.profileImage },
    });
  } catch (error) {
    next(error);
  }
};
