import express from 'express';
import userRoutes from './userRoutes.js';
import adminRoutes from './adminRoutes.js';
import landlordRoutes from './landlordRoutes.js';

const router = express.Router();

// ─── User Auth ────────────────────────────────────────────────────────────────
router.use('/user', userRoutes);

// ─── Admin Auth ───────────────────────────────────────────────────────────────
router.use('/admin', adminRoutes);

// ─── Landlord Auth ────────────────────────────────────────────────────────────
router.use('/landlord', landlordRoutes);

export default router;
