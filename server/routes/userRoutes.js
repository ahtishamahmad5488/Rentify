import express from 'express';
import {
  signup, login,
  forgotPassword, verifyOTP, resetPassword,
  getProfile, updateProfile,
} from '../controllers/userController.js';
import { protect, isUser } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// ─── Public ───────────────────────────────────────────────────────────────────
router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/verify-otp', authLimiter, verifyOTP);
router.post('/reset-password', authLimiter, resetPassword);

// ─── Protected ────────────────────────────────────────────────────────────────
router.get('/dashboard', protect, isUser, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to user dashboard',
    user: req.user,
  });
});

// Profile — works for both 'user' and 'landlord' roles (no isUser check)
router.get('/profile', protect, getProfile);
router.patch('/profile', protect, upload.single('profileImage'), updateProfile);

export default router;
