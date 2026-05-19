import express from 'express';
import {
  signup,
  login,
  verifyEmail,
  resendOTP,
  forgotPassword,
  resetPassword,
} from '../controllers/landlordController.js';
import { protect, isLandlord } from '../middleware/auth.js';
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

const uploadProfileImage = (req, res, next) => {
  upload.single('profileImage')(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    next();
  });
};

router.post('/signup', authLimiter, uploadProfileImage, ...signupValidator, signup);
router.post('/login', authLimiter, ...loginValidator, login);
router.post('/verify-email', otpVerifyLimiter, ...otpValidator, verifyEmail);
router.post('/resend-otp', forgotPasswordLimiter, ...emailValidator, resendOTP);
router.post('/forgot-password', forgotPasswordLimiter, ...emailValidator, forgotPassword);
router.post('/reset-password', otpVerifyLimiter, ...resetPasswordValidator, resetPassword);

router.get('/dashboard', protect, isLandlord, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to landlord dashboard',
    data: { user: req.user },
  });
});

export default router;
