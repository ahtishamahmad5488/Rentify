import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Landlord from '../models/Landlord.js';
import { sendWelcomeEmail, sendOTPEmail } from '../config/nodemailer.js';
import { getCloudinary } from '../config/cloudinary.js';
import { uploadToCloudinary } from '../utils/cloudinaryUpload.js';

const generateOTP = () => crypto.randomInt(100000, 999999).toString();

// ─── Helpers ──────────────────────────────────────────────────────────────────

const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

// ─── @desc    User Signup ─────────────────────────────────────────────────────
// @route   POST /api/auth/user/signup
// @access  Public
export const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    const user = new User({ name, email, password, role: 'user' });
    await user.save();

    // Send welcome email (non-blocking — never fail signup if email fails)
    sendWelcomeEmail(email, name).catch((err) =>
      console.error('Welcome email failed:', err.message)
    );

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    User Login ──────────────────────────────────────────────────────
// @route   POST /api/auth/user/login
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

    const user = await User.findOne({ email, role: 'user' }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'User account is deactivated',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Send forgot-password OTP ────────────────────────────────────────
// @route   POST /api/auth/user/forgot-password
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    // Generic 200 regardless of whether email exists (anti-enumeration)
    if (!user) {
      return res.status(200).json({ success: true, message: 'If registered, an OTP has been sent.' });
    }
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    user.otpAttempts = 0;
    await user.save({ validateModifiedOnly: true });
    await sendOTPEmail(email, otp, 'reset').catch(() => {});
    res.status(200).json({ success: true, message: 'OTP sent to your email.' });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Verify OTP ──────────────────────────────────────────────────────
// @route   POST /api/auth/user/verify-otp
export const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email }).select('+otp +otpExpiry +otpAttempts');
    if (!user || !user.otp) {
      return res.status(400).json({ success: false, message: 'No OTP found. Request a new one.' });
    }
    if (new Date() > user.otpExpiry) {
      return res.status(400).json({ success: false, message: 'OTP expired.' });
    }
    if (user.otp !== String(otp)) {
      user.otpAttempts = (user.otpAttempts || 0) + 1;
      await user.save({ validateModifiedOnly: true });
      return res.status(400).json({ success: false, message: 'Invalid OTP.' });
    }
    // Mark OTP as validated — client sends it again with reset-password
    res.status(200).json({ success: true, message: 'OTP verified.' });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Reset password (post-OTP) ───────────────────────────────────────
// @route   POST /api/auth/user/reset-password
export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email }).select('+otp +otpExpiry +password');
    if (!user || !user.otp) {
      return res.status(400).json({ success: false, message: 'Invalid request.' });
    }
    if (new Date() > user.otpExpiry) {
      return res.status(400).json({ success: false, message: 'OTP expired.' });
    }
    if (user.otp !== String(otp)) {
      return res.status(400).json({ success: false, message: 'Invalid OTP.' });
    }
    user.password = newPassword;
    user.otp = undefined;
    user.otpExpiry = undefined;
    user.otpAttempts = 0;
    await user.save({ validateModifiedOnly: true });
    res.status(200).json({ success: true, message: 'Password reset successfully.' });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Get Profile ─────────────────────────────────────────────────────
// @route   GET /api/auth/user/profile
// @access  Private
export const getProfile = async (req, res, next) => {
  try {
    const Model = req.user.role === 'landlord' ? Landlord : User;
    const doc = await Model.findById(req.user.id).select('-password -otp -otpExpiry -otpAttempts');
    if (!doc) return res.status(404).json({ success: false, message: 'Account not found' });
    res.status(200).json({ success: true, user: doc.toJSON() });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Update Profile ──────────────────────────────────────────────────
// @route   PATCH /api/auth/user/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const Model = req.user.role === 'landlord' ? Landlord : User;
    const doc = await Model.findById(req.user.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Account not found' });

    const { name, phone } = req.body;
    if (name && name.trim()) doc.name = name.trim();
    if (phone !== undefined) doc.phone = phone.trim() || null;

    if (req.file) {
      if (doc.profileImage?.public_id) {
        await getCloudinary().uploader.destroy(doc.profileImage.public_id).catch(() => {});
      }
      const result = await uploadToCloudinary(req.file.buffer, 'rentify-profiles');
      doc.profileImage = { public_id: result.public_id, secure_url: result.secure_url };
    }

    await doc.save({ validateModifiedOnly: true });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: doc.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};
