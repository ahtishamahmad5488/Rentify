import express from 'express';
import {
  processFakePayment,
  listAllPayments,
} from '../controllers/paymentController.js';

const router = express.Router();

router.post('/', processFakePayment);
router.get('/', listAllPayments);

export default router;
