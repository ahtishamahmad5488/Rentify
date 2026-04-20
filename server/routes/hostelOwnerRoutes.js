import express from 'express';
import {
  signup,
  login,
  verifyEmail,
  resendOTP,
  forgotPassword,
  resetPassword,
} from '../controllers/hostelOwnerController.js';
import { protect, isHostelOwner } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { authLimiter, forgotPasswordLimiter, otpVerifyLimiter } from '../middleware/rateLimiter.js';
import {
  signupValidator,
  loginValidator,
  otpValidator,
  resetPasswordValidator,
  emailValidator,
} from '../middleware/validate.js';

const router = express.Router();

// ─── Public Auth Routes ───────────────────────────────────────────────────────

// Signup — multer error handled inline to return clean JSON instead of default multer error
const uploadProfileImage = (req, res, next) => {
  upload.single('profileImage')(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    next();
  });
};

router.post('/signup', authLimiter, uploadProfileImage, signup);
router.post('/login', authLimiter, ...loginValidator, login);

// OTP email verification — rate-limited to prevent OTP brute-forcing
// Combined with per-account otpAttempts lock in the controller
router.post('/verify-email', otpVerifyLimiter, ...otpValidator, verifyEmail);

// Resend OTP — stricter hourly limit to prevent email flooding
router.post('/resend-otp', forgotPasswordLimiter, ...emailValidator, resendOTP);

// Forgot password — sends OTP via email
router.post('/forgot-password', forgotPasswordLimiter, ...emailValidator, forgotPassword);

// Reset password using OTP — rate-limited to prevent OTP brute-forcing
router.post('/reset-password', otpVerifyLimiter, ...resetPasswordValidator, resetPassword);

// ─── Protected Routes ─────────────────────────────────────────────────────────

router.get('/dashboard', protect, isHostelOwner, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to hostel owner dashboard',
    data: { user: req.user },
  });
});

export default router;
