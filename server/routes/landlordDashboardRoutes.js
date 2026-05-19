import express from 'express';
import { protect, isLandlord } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import {
  updateProfileValidator,
  createPropertyValidator,
  updatePropertyValidator,
  availabilityValidator,
} from '../middleware/validate.js';

import { getProfile, updateProfile, uploadProfileImage } from '../controllers/profileController.js';
import {
  createProperty,
  updateProperty,
  deleteProperty,
  getMyProperties,
  getMyProperty,
  updateAvailability,
  deletePropertyImage,
} from '../controllers/propertyController.js';
import { getDashboardAnalytics } from '../controllers/analyticsController.js';

const router = express.Router();

router.use(protect, isLandlord);

// ─── Profile ──────────────────────────────────────────────────────────────────
router.get('/profile', getProfile);
router.put('/profile', ...updateProfileValidator, updateProfile);
router.put('/profile/image', upload.single('profileImage'), uploadProfileImage);

// ─── Property CRUD ────────────────────────────────────────────────────────────
router.get('/properties', getMyProperties);
router.post('/properties', upload.array('images', 10), ...createPropertyValidator, createProperty);
router.get('/properties/:id', getMyProperty);
router.put('/properties/:id', upload.array('images', 10), ...updatePropertyValidator, updateProperty);
router.delete('/properties/:id', deleteProperty);

// ─── Availability Management ──────────────────────────────────────────────────
router.patch('/properties/:id/availability', ...availabilityValidator, updateAvailability);

// ─── Image Management ─────────────────────────────────────────────────────────
router.delete('/properties/:id/images/:imageId', deletePropertyImage);

// ─── Analytics ───────────────────────────────────────────────────────────────
router.get('/analytics', getDashboardAnalytics);

export default router;
