import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    // Firebase UID or local user identifier
    userId: {
      type: String,
      required: [true, 'userId is required'],
      index: true,
    },
    userName: { type: String, trim: true, default: '' },
    userEmail: { type: String, trim: true, default: '' },

    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
      index: true,
    },

    bookingDate: { type: Date, default: Date.now },
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
