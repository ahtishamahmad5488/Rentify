import express from 'express';
import { protect, isHostelOwner } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import {
  updateProfileValidator,
  createHostelValidator,
  updateHostelValidator,
  availabilityValidator,
} from '../middleware/validate.js';

import { getProfile, updateProfile, uploadProfileImage } from '../controllers/profileController.js';
import {
  createHostel,
  updateHostel,
  deleteHostel,
  getMyHostels,
  getMyHostel,
  updateAvailability,
  deleteHostelImage,
} from '../controllers/hostelController.js';
import { getDashboardAnalytics } from '../controllers/analyticsController.js';

const router = express.Router();

// ─── All routes require authentication as a hostel_owner ─────────────────────
router.use(protect, isHostelOwner);

// ─── Profile ─────────────────────────────────────────────────────────────────
router.get('/profile', getProfile);
router.put('/profile', ...updateProfileValidator, updateProfile);
router.put('/profile/image', upload.single('profileImage'), uploadProfileImage);

// ─── Hostel CRUD ──────────────────────────────────────────────────────────────
router.get('/hostels', getMyHostels);
router.post('/hostels', upload.array('images', 10), ...createHostelValidator, createHostel);
router.get('/hostels/:id', getMyHostel);
router.put('/hostels/:id', upload.array('images', 10), ...updateHostelValidator, updateHostel);
router.delete('/hostels/:id', deleteHostel);

// ─── Availability Management ──────────────────────────────────────────────────
router.patch('/hostels/:id/availability', ...availabilityValidator, updateAvailability);

// ─── Hostel Image Management ──────────────────────────────────────────────────
router.delete('/hostels/:id/images/:imageId', deleteHostelImage);

// ─── Analytics / Dashboard ────────────────────────────────────────────────────
router.get('/analytics', getDashboardAnalytics);

export default router;
