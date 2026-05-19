import express from 'express';
import {
  createBooking,
  listUserBookings,
  listAllBookings,
} from '../controllers/bookingController.js';

const router = express.Router();

router.post('/', createBooking);
router.get('/', listAllBookings);
router.get('/user/:userId', listUserBookings);

export default router;
