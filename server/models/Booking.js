import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    // Firebase UID of the tenant (mobile auth is via Firebase).
    // Stored as a string so we don't depend on a Mongo User row.
    tenantUid: {
      type: String,
      required: [true, 'tenantUid is required'],
      index: true,
    },
    tenantName: { type: String, trim: true, default: '' },
    tenantEmail: { type: String, trim: true, default: '' },

    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hostel', // underlying collection name
      required: true,
      index: true,
    },

    checkInDate: { type: Date, required: true },
    durationMonths: { type: Number, default: 1, min: 1 },

    totalAmount: { type: Number, required: true, min: 0 },

    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'],
      default: 'PENDING',
    },

    paymentStatus: {
      type: String,
      enum: ['UNPAID', 'PAID', 'REFUNDED'],
      default: 'UNPAID',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Booking', bookingSchema);
