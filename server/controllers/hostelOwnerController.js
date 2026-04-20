import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import HostelOwner from '../models/HostelOwner.js';
import { sendOTPEmail } from '../config/nodemailer.js';
import { uploadToCloudinary } from '../utils/cloudinaryUpload.js';

// ─── Constants ────────────────────────────────────────────────────────────────
const OTP_MAX_ATTEMPTS = 5;
const OTP_LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

// ─── Helpers ──────────────────────────────────────────────────────────────────

const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

/**
 * Generate a cryptographically secure 6-digit OTP.
 * crypto.randomInt is preferred over Math.random for security.
 */
const generateOTP = () => crypto.randomInt(100000, 999999).toString();

/**
 * Constant-time OTP comparison to prevent timing-based side-channel attacks.
 * Both buffers must be equal length for timingSafeEqual to work correctly.
 *
 * Returns true if OTPs match, false otherwise.
 */
const compareOTP = (storedOtp, submittedOtp) => {
  try {
    // Pad/truncate to equal length — both are always 6-digit strings but
    // we normalise lengths to ensure timingSafeEqual doesn't throw
    const a = Buffer.from(String(storedOtp).padEnd(6, '0'));
    const b = Buffer.from(String(submittedOtp).padEnd(6, '0'));
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
};

// ─── @desc    Hostel Owner Signup (OTP-based email verification) ─────────────
// @route   POST /api/auth/hostel-owner/signup
// @access  Public
export const signup = async (req, res, next) => {
  try {
    console.log('[SIGNUP] req.body:', req.body);
    console.log('[SIGNUP] req.file:', req.file ? { fieldname: req.file.fieldname, size: req.file.size } : null);
    const { name, email, password, cnic, contactNumber, businessAddress } = req.body;

    if (!name?.trim() || !email?.trim() || !password || !cnic?.trim() || !contactNumber?.trim() || !businessAddress?.trim()) {
      return res.status(400).json({ success: false, message: 'All fields are required: name, email, password, cnic, contactNumber, businessAddress' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const existing = await HostelOwner.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Generate OTP — valid for 10 minutes
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Profile image is required' });
    }

    const result = await uploadToCloudinary(req.file.buffer, 'hostel-owner-profiles');
    const profileImage = { public_id: result.public_id, secure_url: result.secure_url };

    // Create account (isVerified=false; login blocked until email is verified)
    await HostelOwner.create({
      name,
      email,
      password,
      cnic,
      contactNumber,
      businessAddress,
      profileImage,
      otp,
      otpExpiry,
      otpType: 'email_verify',
      isVerified: false,
    });

    await sendOTPEmail(email, otp, 'verify');

    res.status(201).json({
      success: true,
      message: 'Registration successful. A 6-digit OTP has been sent to your email. Please verify to activate your account.',
      data: { email },
    });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Verify Email via OTP ───────────────────────────────────────────
// @route   POST /api/auth/hostel-owner/verify-email
// @access  Public
export const verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    // Select all OTP + brute-force protection fields (excluded by default)
    const owner = await HostelOwner.findOne({ email }).select(
      '+otp +otpExpiry +otpType +otpAttempts +otpLockUntil'
    );
    if (!owner) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    if (owner.isVerified) {
      return res.status(400).json({ success: false, message: 'Email is already verified' });
    }

    // ─── Brute-force lock check ──────────────────────────────────────────────
    // If account is locked, block immediately without revealing OTP state
    if (owner.otpLockUntil && owner.otpLockUntil > Date.now()) {
      const waitMinutes = Math.ceil((owner.otpLockUntil - Date.now()) / 60000);
      return res.status(429).json({
        success: false,
        message: `Too many failed attempts. Account is locked. Try again in ${waitMinutes} minute(s).`,
      });
    }

    if (!owner.otp || owner.otpType !== 'email_verify') {
      return res.status(400).json({
        success: false,
        message: 'No verification OTP found. Please signup again or request a new OTP.',
      });
    }

    // Check OTP expiry
    if (new Date() > owner.otpExpiry) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    // ─── Constant-time OTP comparison ───────────────────────────────────────
    // Prevents timing attacks that could reveal valid OTPs through response time.
    if (!compareOTP(owner.otp, otp)) {
      // Increment attempt counter and lock if threshold exceeded
      owner.otpAttempts = (owner.otpAttempts || 0) + 1;

      if (owner.otpAttempts >= OTP_MAX_ATTEMPTS) {
        owner.otpLockUntil = new Date(Date.now() + OTP_LOCK_DURATION_MS);
      }

      await owner.save({ validateModifiedOnly: true });

      const attemptsLeft = Math.max(0, OTP_MAX_ATTEMPTS - owner.otpAttempts);
      return res.status(400).json({
        success: false,
        message: attemptsLeft > 0
          ? `Invalid OTP. ${attemptsLeft} attempt(s) remaining before account lock.`
          : 'Too many failed attempts. Account locked for 15 minutes.',
      });
    }

    // ─── Success: activate account and reset all OTP / lock fields ──────────
    owner.isVerified = true;
    owner.otp = undefined;
    owner.otpExpiry = undefined;
    owner.otpType = undefined;
    owner.otpAttempts = 0;
    owner.otpLockUntil = undefined;
    await owner.save({ validateModifiedOnly: true });

    const token = generateToken(owner._id, owner.role);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully. Account is now active.',
      data: { token, user: owner.toJSON() },
    });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Hostel Owner Login ─────────────────────────────────────────────
// @route   POST /api/auth/hostel-owner/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Include password field (excluded by default in schema)
    const owner = await HostelOwner.findOne({ email }).select('+password');
    if (!owner) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!owner.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Contact support.' });
    }

    // Block login if email hasn't been verified yet
    if (!owner.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in.',
        data: { email, action: 'verify-email' },
      });
    }

    const isMatch = await owner.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(owner._id, owner.role);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { token, user: owner.toJSON() },
    });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Forgot Password — Send OTP to email ────────────────────────────
// @route   POST /api/auth/hostel-owner/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const owner = await HostelOwner.findOne({ email });

    // Generic response to prevent email enumeration attacks.
    // We return 200 regardless of whether the email exists.
    if (!owner) {
      return res.status(200).json({
        success: true,
        message: 'If this email is registered, a password reset OTP has been sent.',
      });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    owner.otp = otp;
    owner.otpExpiry = otpExpiry;
    owner.otpType = 'password_reset';
    // Reset attempt counter when a new OTP is requested
    owner.otpAttempts = 0;
    owner.otpLockUntil = undefined;
    await owner.save({ validateModifiedOnly: true });

    await sendOTPEmail(email, otp, 'reset');

    res.status(200).json({
      success: true,
      message: 'If this email is registered, a password reset OTP has been sent.',
    });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Reset Password using OTP ───────────────────────────────────────
// @route   POST /api/auth/hostel-owner/reset-password
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    const owner = await HostelOwner.findOne({ email }).select(
      '+otp +otpExpiry +otpType +password +otpAttempts +otpLockUntil'
    );
    if (!owner) {
      // Generic 404 message is acceptable here since email was already submitted
      // in the forgot-password step; no new enumeration risk
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    if (!owner.otp || owner.otpType !== 'password_reset') {
      return res.status(400).json({
        success: false,
        message: 'No password reset request found. Please request a new OTP.',
      });
    }

    // ─── Brute-force lock check ──────────────────────────────────────────────
    if (owner.otpLockUntil && owner.otpLockUntil > Date.now()) {
      const waitMinutes = Math.ceil((owner.otpLockUntil - Date.now()) / 60000);
      return res.status(429).json({
        success: false,
        message: `Too many failed attempts. Account is locked. Try again in ${waitMinutes} minute(s).`,
      });
    }

    if (new Date() > owner.otpExpiry) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    // ─── Constant-time OTP comparison ───────────────────────────────────────
    if (!compareOTP(owner.otp, otp)) {
      owner.otpAttempts = (owner.otpAttempts || 0) + 1;

      if (owner.otpAttempts >= OTP_MAX_ATTEMPTS) {
        owner.otpLockUntil = new Date(Date.now() + OTP_LOCK_DURATION_MS);
      }

      await owner.save({ validateModifiedOnly: true });

      const attemptsLeft = Math.max(0, OTP_MAX_ATTEMPTS - owner.otpAttempts);
      return res.status(400).json({
        success: false,
        message: attemptsLeft > 0
          ? `Invalid OTP. ${attemptsLeft} attempt(s) remaining before account lock.`
          : 'Too many failed attempts. Account locked for 15 minutes.',
      });
    }

    // ─── Success: update password and clear all OTP / lock fields ───────────
    // pre-save hook will hash the new password automatically
    owner.password = newPassword;
    owner.otp = undefined;
    owner.otpExpiry = undefined;
    owner.otpType = undefined;
    owner.otpAttempts = 0;
    owner.otpLockUntil = undefined;
    await owner.save({ validateModifiedOnly: true });

    res.status(200).json({
      success: true,
      message: 'Password reset successful. You can now log in with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Resend Email Verification OTP ──────────────────────────────────
// @route   POST /api/auth/hostel-owner/resend-otp
// @access  Public
export const resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    const owner = await HostelOwner.findOne({ email });

    // Generic response regardless of whether account exists — prevents email
    // enumeration attacks (attacker cannot determine if an email is registered).
    if (!owner || owner.isVerified) {
      return res.status(200).json({
        success: true,
        message: 'If an unverified account exists for this email, a new OTP has been sent.',
      });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // Reset attempt counters when a fresh OTP is issued
    owner.otp = otp;
    owner.otpExpiry = otpExpiry;
    owner.otpType = 'email_verify';
    owner.otpAttempts = 0;
    owner.otpLockUntil = undefined;
    await owner.save({ validateModifiedOnly: true });

    await sendOTPEmail(email, otp, 'verify');

    res.status(200).json({
      success: true,
      message: 'If an unverified account exists for this email, a new OTP has been sent.',
    });
  } catch (error) {
    next(error);
  }
};
