import express from 'express';
import { incrementHostelViews } from '../controllers/hostelController.js';

const router = express.Router();

// ─── @route   PATCH /api/hostels/:id/view ────────────────────────────────────
// @desc    Increment hostel view count (public — no auth required)
// @access  Public
router.patch('/hostels/:id/view', incrementHostelViews);

export default router;
