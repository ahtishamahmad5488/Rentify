import jwt from 'jsonwebtoken';
import { uploadToCloudinary } from '../utils/cloudinaryUpload.js';
import { getCloudinary } from '../config/cloudinary.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const generateToken = (email, role) =>
  jwt.sign({ email, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

// ─── @desc    Admin Login (using env credentials) ────────────────────────────
// @route   POST /api/auth/admin/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials',
      });
    }

    const token = generateToken(email, 'admin');

    res.status(200).json({
      success: true,
      message: 'Admin login successful',
      token,
      user: {
        email: process.env.ADMIN_EMAIL,
        role: 'admin',
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Upload/Replace Admin Profile Image ────────────────────────────
// @route   POST /api/auth/admin/profile-image
// @access  Private (admin only)
export const uploadProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }

    // Delete old image from Cloudinary if public_id is sent
    const { oldPublicId } = req.body;
    if (oldPublicId) {
      try {
        await getCloudinary().uploader.destroy(oldPublicId);
      } catch (err) {
        // Ignore — old image might already be gone
      }
    }

    const result = await uploadToCloudinary(req.file.buffer, 'admin-profile');

    res.status(200).json({
      success: true,
      message: 'Profile image uploaded successfully',
      data: {
        url: result.secure_url,
        public_id: result.public_id,
      },
    });
  } catch (error) {
    next(error);
  }
};
