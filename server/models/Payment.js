import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true,
    },
    userId: { type: String, required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    method: {
      type: String,
      enum: ['CARD', 'WALLET', 'CASH'],
      default: 'CARD',
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILED', 'PENDING'],
      default: 'SUCCESS',
    },
    transactionId: { type: String, required: true, unique: true },
    paidAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('Payment', paymentSchema);
