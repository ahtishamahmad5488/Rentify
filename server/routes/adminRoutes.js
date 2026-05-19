import express from 'express';
import { login, uploadProfileImage } from '../controllers/adminController.js';
import { upload } from '../middleware/upload.js';
import { updatePropertyStatus } from '../controllers/adminPropertyController.js';
import {
  getDashboardAnalytics,
  getAllProperties,
  getPropertyDetail,
  getAllLandlords,
  updateLandlordStatus,
  getAllUsers,
} from '../controllers/adminDashboardController.js';
import { protect, isAdmin } from '../middleware/auth.js';
import { propertyStatusValidator } from '../middleware/validate.js';

const router = express.Router();

// ─── Admin Login ──────────────────────────────────────────────────────────────
router.post('/login', login);

// ─── All routes below require a valid admin JWT ───────────────────────────────
router.use(protect, isAdmin);

// ─── Dashboard Analytics ──────────────────────────────────────────────────────
router.get('/analytics', getDashboardAnalytics);

// ─── Property Management ──────────────────────────────────────────────────────
router.get('/properties', getAllProperties);
router.get('/properties/:id', getPropertyDetail);
router.patch('/properties/:id/status', ...propertyStatusValidator, updatePropertyStatus);

// ─── Landlord Management ─────────────────────────────────────────────────────
router.get('/landlords', getAllLandlords);
router.patch('/landlords/:id/status', updateLandlordStatus);

// ─── User Management ─────────────────────────────────────────────────────────
router.get('/users', getAllUsers);

// ─── Admin Profile Image ──────────────────────────────────────────────────────
const uploadAdminImage = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    next();
  });
};
router.post('/profile-image', uploadAdminImage, uploadProfileImage);

export default router;
