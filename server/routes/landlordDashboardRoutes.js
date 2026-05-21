import express from 'express';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import {
  createPropertyValidator,
  updatePropertyValidator,
  availabilityValidator,
} from '../middleware/validate.js';
import {
  createProperty,
  updateProperty,
  deleteProperty,
  getMyProperties,
  getMyProperty,
  updateAvailability,
  deletePropertyImage,
} from '../controllers/propertyController.js';

const router = express.Router();

// Any authenticated user can manage their own properties — no landlord role required
router.use(protect);

// ─── Property CRUD ────────────────────────────────────────────────────────────
router.get('/properties', getMyProperties);
router.post('/properties', upload.array('images', 10), ...createPropertyValidator, createProperty);
router.get('/properties/:id', getMyProperty);
router.put('/properties/:id', upload.array('images', 10), ...updatePropertyValidator, updateProperty);
router.delete('/properties/:id', deleteProperty);

// ─── Availability ─────────────────────────────────────────────────────────────
router.patch('/properties/:id/availability', ...availabilityValidator, updateAvailability);

// ─── Image Management ─────────────────────────────────────────────────────────
router.delete('/properties/:id/images/:imageId', deletePropertyImage);

export default router;
