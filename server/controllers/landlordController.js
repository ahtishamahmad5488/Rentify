import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import Landlord from '../models/Landlord.js';
import { sendOTPEmail } from '../config/nodemailer.js';
import { uploadToCloudinary } from '../utils/cloudinaryUpload.js';

const OTP_MAX_ATTEMPTS = 5;
const OTP_LOCK_MS = 15 * 60 * 1000;

const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

const generateOTP = () => crypto.randomInt(100000, 999999).toString();

const compareOTP = (stored, submitted) => {
  try {
    const a = Buffer.from(String(stored).padEnd(6, '0'));
    const b = Buffer.from(String(submitted).padEnd(6, '0'));
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
};

// ─── @desc    Landlord Signup ─────────────────────────────────────────────────
// @route   POST /api/auth/landlord/signup
// @access  Public
export const signup = async (req, res, next) => {
  try {
    const { name, email, password, cnic, phone, businessAddress } = req.body;

    if (!name?.trim() || !email?.trim() || !password || !cnic?.trim() || !phone?.trim() || !businessAddress?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: name, email, password, cnic, phone, businessAddress',
      });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const existing = await Landlord.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    let profileImage = { public_id: null, secure_url: null };
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'rentify-landlords');
      profileImage = { public_id: result.public_id, secure_url: result.secure_url };
    }

    await Landlord.create({
      name, email, password, cnic, phone, businessAddress,
      profileImage, otp, otpExpiry,
      otpType: 'email_verify',
      isVerified: false,
    });

    await sendOTPEmail(email, otp, 'verify');

    res.status(201).json({
      success: true,
      message: 'Registration successful. Check your email for the OTP to activate your account.',
      data: { email },
    });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Verify Email via OTP ───────────────────────────────────────────
// @route   POST /api/auth/landlord/verify-email
// @access  Public
export const verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const landlord = await Landlord.findOne({ email }).select(
      '+otp +otpExpiry +otpType +otpAttempts +otpLockUntil'
    );
    if (!landlord) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }
    if (landlord.isVerified) {
      return res.status(400).json({ success: false, message: 'Email is already verified' });
    }
    if (landlord.otpLockUntil && landlord.otpLockUntil > Date.now()) {
      const wait = Math.ceil((landlord.otpLockUntil - Date.now()) / 60000);
      return res.status(429).json({ success: false, message: `Account locked. Try again in ${wait} minute(s).` });
    }
    if (!landlord.otp || landlord.otpType !== 'email_verify') {
      return res.status(400).json({ success: false, message: 'No verification OTP found. Request a new one.' });
    }
    if (new Date() > landlord.otpExpiry) {
      return res.status(400).json({ success: false, message: 'OTP expired. Please request a new one.' });
    }

    if (!compareOTP(landlord.otp, otp)) {
      landlord.otpAttempts = (landlord.otpAttempts || 0) + 1;
      if (landlord.otpAttempts >= OTP_MAX_ATTEMPTS) {
        landlord.otpLockUntil = new Date(Date.now() + OTP_LOCK_MS);
      }
      await landlord.save({ validateModifiedOnly: true });
      const left = Math.max(0, OTP_MAX_ATTEMPTS - landlord.otpAttempts);
      return res.status(400).json({
        success: false,
        message: left > 0 ? `Invalid OTP. ${left} attempt(s) remaining.` : 'Too many attempts. Account locked for 15 minutes.',
      });
    }

    landlord.isVerified = true;
    landlord.otp = undefined;
    landlord.otpExpiry = undefined;
    landlord.otpType = undefined;
    landlord.otpAttempts = 0;
    landlord.otpLockUntil = undefined;
    await landlord.save({ validateModifiedOnly: true });

    const token = generateToken(landlord._id, landlord.role);

    res.status(200).json({
      success: true,
      message: 'Email verified. Account is now active.',
      data: { token, user: landlord.toJSON() },
    });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Landlord Login ──────────────────────────────────────────────────
// @route   POST /api/auth/landlord/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const landlord = await Landlord.findOne({ email }).select('+password');
    if (!landlord) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    if (!landlord.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Contact support.' });
    }
    if (!landlord.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in.',
        data: { email, action: 'verify-email' },
      });
    }

    const isMatch = await landlord.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(landlord._id, landlord.role);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { token, user: landlord.toJSON() },
    });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Forgot Password ─────────────────────────────────────────────────
// @route   POST /api/auth/landlord/forgot-password
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const landlord = await Landlord.findOne({ email });

    if (!landlord) {
      return res.status(200).json({ success: true, message: 'If registered, a reset OTP has been sent.' });
    }

    const otp = generateOTP();
    landlord.otp = otp;
    landlord.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    landlord.otpType = 'password_reset';
    landlord.otpAttempts = 0;
    landlord.otpLockUntil = undefined;
    await landlord.save({ validateModifiedOnly: true });

    await sendOTPEmail(email, otp, 'reset');

    res.status(200).json({ success: true, message: 'If registered, a reset OTP has been sent.' });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Reset Password ──────────────────────────────────────────────────
// @route   POST /api/auth/landlord/reset-password
export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    const landlord = await Landlord.findOne({ email }).select(
      '+otp +otpExpiry +otpType +password +otpAttempts +otpLockUntil'
    );
    if (!landlord) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }
    if (!landlord.otp || landlord.otpType !== 'password_reset') {
      return res.status(400).json({ success: false, message: 'No reset request found. Request a new OTP.' });
    }
    if (landlord.otpLockUntil && landlord.otpLockUntil > Date.now()) {
      const wait = Math.ceil((landlord.otpLockUntil - Date.now()) / 60000);
      return res.status(429).json({ success: false, message: `Account locked. Try again in ${wait} minute(s).` });
    }
    if (new Date() > landlord.otpExpiry) {
      return res.status(400).json({ success: false, message: 'OTP expired. Request a new one.' });
    }

    if (!compareOTP(landlord.otp, otp)) {
      landlord.otpAttempts = (landlord.otpAttempts || 0) + 1;
      if (landlord.otpAttempts >= OTP_MAX_ATTEMPTS) {
        landlord.otpLockUntil = new Date(Date.now() + OTP_LOCK_MS);
      }
      await landlord.save({ validateModifiedOnly: true });
      const left = Math.max(0, OTP_MAX_ATTEMPTS - landlord.otpAttempts);
      return res.status(400).json({
        success: false,
        message: left > 0 ? `Invalid OTP. ${left} attempt(s) remaining.` : 'Too many attempts. Account locked.',
      });
    }

    landlord.password = newPassword;
    landlord.otp = undefined;
    landlord.otpExpiry = undefined;
    landlord.otpType = undefined;
    landlord.otpAttempts = 0;
    landlord.otpLockUntil = undefined;
    await landlord.save({ validateModifiedOnly: true });

    res.status(200).json({ success: true, message: 'Password reset successful.' });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Resend Email Verification OTP ───────────────────────────────────
// @route   POST /api/auth/landlord/resend-otp
export const resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    const landlord = await Landlord.findOne({ email });

    if (!landlord || landlord.isVerified) {
      return res.status(200).json({ success: true, message: 'If unverified, a new OTP has been sent.' });
    }

    const otp = generateOTP();
    landlord.otp = otp;
    landlord.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    landlord.otpType = 'email_verify';
    landlord.otpAttempts = 0;
    landlord.otpLockUntil = undefined;
    await landlord.save({ validateModifiedOnly: true });

    await sendOTPEmail(email, otp, 'verify');

    res.status(200).json({ success: true, message: 'If unverified, a new OTP has been sent.' });
  } catch (error) {
    next(error);
  }
};
