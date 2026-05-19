import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const landlordSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['landlord'],
      default: 'landlord',
    },

    // ─── Email Verification ───────────────────────────────────────────────────
    isVerified: { type: Boolean, default: false },

    // ─── OTP Fields ───────────────────────────────────────────────────────────
    otp: { type: String, select: false },
    otpExpiry: { type: Date, select: false },
    otpType: {
      type: String,
      enum: ['email_verify', 'password_reset'],
      select: false,
    },
    otpAttempts: { type: Number, default: 0, select: false },
    otpLockUntil: { type: Date, select: false },

    // ─── Profile ──────────────────────────────────────────────────────────────
    profileImage: {
      public_id: { type: String, default: null },
      secure_url: { type: String, default: null },
    },
    phone: { type: String, trim: true, default: null },
    cnic: { type: String, trim: true, default: null },
    businessAddress: { type: String, trim: true, default: null },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

landlordSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

landlordSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

landlordSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.otp;
  delete obj.otpExpiry;
  delete obj.otpType;
  delete obj.otpAttempts;
  delete obj.otpLockUntil;
  return obj;
};

export default mongoose.model('Landlord', landlordSchema);
