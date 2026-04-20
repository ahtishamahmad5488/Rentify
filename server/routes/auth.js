import express from 'express';
import userRoutes from './userRoutes.js';
import adminRoutes from './adminRoutes.js';
import hostelOwnerRoutes from './hostelOwnerRoutes.js';

const router = express.Router();

// ─── User Auth ────────────────────────────────────────────────────────────────
router.use('/user', userRoutes);

// ─── Admin Auth ───────────────────────────────────────────────────────────────
router.use('/admin', adminRoutes);

// ─── Hostel Owner Auth ────────────────────────────────────────────────────────
router.use('/hostel-owner', hostelOwnerRoutes);

export default router;
