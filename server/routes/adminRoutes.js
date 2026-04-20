import express from 'express';
import { login, uploadProfileImage } from '../controllers/adminController.js';
import { upload } from '../middleware/upload.js';
import { updateHostelStatus } from '../controllers/adminHostelController.js';
import {
  getDashboardAnalytics,
  getAllHostels,
  getHostelDetail,
  getAllOwners,
  updateOwnerStatus,
  getAllUsers,
} from '../controllers/adminDashboardController.js';
import { protect, isAdmin } from '../middleware/auth.js';
import { hostelStatusValidator } from '../middleware/validate.js';

const router = express.Router();

// ─── Admin Login ──────────────────────────────────────────────────────────────
router.post('/login', login);

// ─── All routes below require a valid admin JWT ───────────────────────────────
router.use(protect, isAdmin);

// ─── Dashboard Analytics ──────────────────────────────────────────────────────
router.get('/analytics', getDashboardAnalytics);

// ─── Hostel Management ────────────────────────────────────────────────────────
router.get('/hostels', getAllHostels);
router.get('/hostels/:id', getHostelDetail);
router.patch('/hostels/:id/status', ...hostelStatusValidator, updateHostelStatus);

// ─── Owner Management ─────────────────────────────────────────────────────────
router.get('/owners', getAllOwners);
router.patch('/owners/:id/status', updateOwnerStatus);

// ─── User/Student Management ──────────────────────────────────────────────────
router.get('/users', getAllUsers);

// ─── Admin Profile Image ────────────────────────────────────────────────────
const uploadAdminImage = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    next();
  });
};
router.post('/profile-image', uploadAdminImage, uploadProfileImage);


export default router;
