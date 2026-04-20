import HostelOwner from '../models/HostelOwner.js';
import { getCloudinary } from '../config/cloudinary.js';
import { uploadToCloudinary } from '../utils/cloudinaryUpload.js';

// ─── @desc    Get Owner Profile ──────────────────────────────────────────────
// @route   GET /api/owner/profile
// @access  Private (hostel_owner)
export const getProfile = async (req, res, next) => {
  try {
    const owner = await HostelOwner.findById(req.user.id);
    if (!owner) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: owner,
    });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Update Owner Profile ──────────────────────────────────────────
// @route   PUT /api/owner/profile
// @access  Private (hostel_owner)
export const updateProfile = async (req, res, next) => {
  try {
    // Whitelist of fields the owner is allowed to update
    const allowedFields = ['name', 'cnic', 'businessAddress', 'contactNumber'];
    const updateData = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields provided to update' });
    }

    const owner = await HostelOwner.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!owner) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: owner,
    });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Upload / Replace Profile Image ─────────────────────────────────
// @route   PUT /api/owner/profile/image
// @access  Private (hostel_owner)
export const uploadProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image file' });
    }

    const owner = await HostelOwner.findById(req.user.id);
    if (!owner) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    // Delete the previous Cloudinary image to avoid orphaned assets
    if (owner.profileImage?.public_id) {
      await getCloudinary().uploader.destroy(owner.profileImage.public_id);
    }

    // Upload new image to 'hostel-owner-profiles' folder via shared utility
    const result = await uploadToCloudinary(req.file.buffer, 'hostel-owner-profiles');

    owner.profileImage = {
      public_id: result.public_id,
      secure_url: result.secure_url,
    };
    await owner.save({ validateModifiedOnly: true });

    res.status(200).json({
      success: true,
      message: 'Profile image updated successfully',
      data: { profileImage: owner.profileImage },
    });
  } catch (error) {
    next(error);
  }
};
