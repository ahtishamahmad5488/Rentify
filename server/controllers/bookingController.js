import Booking from '../models/Booking.js';
import Property from '../models/Property.js';

// @desc   Create a booking from the mobile client
// @route  POST /api/bookings
// @access Public (Firebase-auth identifies the tenant via userId in body)
export const createBooking = async (req, res, next) => {
  try {
    const {
      userId,
      userName,
      userEmail,
      propertyId,
      checkInDate,
      durationMonths = 1,
    } = req.body;

    if (!userId || !propertyId || !checkInDate) {
      return res.status(400).json({
        success: false,
        message: 'userId, propertyId and checkInDate are required',
      });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const totalAmount = (property.price || 0) * Number(durationMonths || 1);

    const booking = await Booking.create({
      userId,
      userName,
      userEmail,
      property: property._id,
      checkInDate,
      durationMonths,
      totalAmount,
      status: 'PENDING',
      paymentStatus: 'UNPAID',
    });

    res.status(201).json({ success: true, message: 'Booking created', data: booking });
  } catch (error) {
    next(error);
  }
};

// @desc   List bookings for a user
// @route  GET /api/bookings/user/:userId
// @access Public (demo)
export const listUserBookings = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const bookings = await Booking.find({ userId })
      .populate('property', 'title city area price images')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    next(error);
  }
};

// @desc   List ALL bookings (admin panel)
// @route  GET /api/bookings
// @access Admin
export const listAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({})
      .populate('property', 'title city price')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    next(error);
  }
};
