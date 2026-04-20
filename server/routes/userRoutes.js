import express from 'express';
import {
  signup, login,
  forgotPassword, verifyOTP, resetPassword,
} from '../controllers/userController.js';
import { protect, isUser } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

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

export default router;
