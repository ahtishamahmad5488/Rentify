import express from 'express';
import {
  createBooking,
  listTenantBookings,
  listAllBookings,
} from '../controllers/bookingController.js';

const router = express.Router();

router.post('/', createBooking);
router.get('/', listAllBookings);
router.get('/tenant/:uid', listTenantBookings);

export default router;
