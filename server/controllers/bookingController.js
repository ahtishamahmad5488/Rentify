import Booking from '../models/Booking.js';
import Property from '../models/Property.js';

// @desc   Create a booking from the mobile client
// @route  POST /api/bookings
// @access Public (Firebase-auth identifies the tenant via tenantUid in body)
export const createBooking = async (req, res, next) => {
  try {
    const {
      tenantUid,
      tenantName,
      tenantEmail,
      propertyId,
      checkInDate,
      durationMonths = 1,
    } = req.body;

    if (!tenantUid || !propertyId || !checkInDate) {
      return res.status(400).json({
        success: false,
        message: 'tenantUid, propertyId and checkInDate are required',
      });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const totalAmount = (property.pricePerMonth || 0) * Number(durationMonths || 1);

    const booking = await Booking.create({
      tenantUid,
      tenantName,
      tenantEmail,
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

// @desc   List bookings for a tenant
// @route  GET /api/bookings/tenant/:uid
// @access Public (demo)
export const listTenantBookings = async (req, res, next) => {
  try {
    const { uid } = req.params;
    const bookings = await Booking.find({ tenantUid: uid })
      .populate('property', 'name city area pricePerMonth images')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    next(error);
  }
};

// @desc   List ALL bookings (admin panel)
// @route  GET /api/bookings
// @access Admin (mount under admin route or protect later)
export const listAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({})
      .populate('property', 'name city pricePerMonth')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    next(error);
  }
};
