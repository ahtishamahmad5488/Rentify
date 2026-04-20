import crypto from 'crypto';
import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';

// @desc   Process a fake payment (always succeeds) and mark booking PAID
// @route  POST /api/payments
// @access Public (demo)
export const processFakePayment = async (req, res, next) => {
  try {
    const { bookingId, tenantUid, method = 'CARD' } = req.body;

    if (!bookingId || !tenantUid) {
      return res.status(400).json({
        success: false,
        message: 'bookingId and tenantUid are required',
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const transactionId = 'TXN-' + crypto.randomBytes(6).toString('hex').toUpperCase();

    const payment = await Payment.create({
      booking: booking._id,
      tenantUid,
      amount: booking.totalAmount,
      method,
      status: 'SUCCESS',
      transactionId,
    });

    booking.paymentStatus = 'PAID';
    booking.status = 'CONFIRMED';
    await booking.save();

    res.status(201).json({
      success: true,
      message: 'Payment successful',
      data: { payment, booking },
    });
  } catch (error) {
    next(error);
  }
};

// @desc   List ALL payments (admin)
// @route  GET /api/payments
export const listAllPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({})
      .populate({
        path: 'booking',
        populate: { path: 'property', select: 'name city pricePerMonth' },
      })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
};
