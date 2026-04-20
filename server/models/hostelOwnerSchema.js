import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const hostelOwnerSchema = new mongoose.Schema(
  {
    // ─── Basic Info ─────────────────────────────────────────────────────────
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
      select: false, // never returned in queries unless explicitly selected
    },
    role: {
      type: String,
      enum: ['hostel_owner'],
      default: 'hostel_owner',
    },

    // ─── Email Verification ─────────────────────────────────────────────────
    // Account login is blocked until owner verifies their email via OTP.
    isVerified: {
      type: Boolean,
      default: false,
    },

    // ─── OTP Fields (hidden from all responses) ─────────────────────────────
    // Stores either an email-verification or password-reset OTP temporarily.
    otp: {
      type: String,
      select: false,
    },
    otpExpiry: {
      type: Date,
      select: false,
    },
    otpType: {
      type: String,
      enum: ['email_verify', 'password_reset'],
      select: false,
    },

    // ─── OTP Brute-force Protection ─────────────────────────────────────────
    // Tracks failed OTP attempts; locks account after 5 failures for 15 min.
    otpAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    otpLockUntil: {
      type: Date,
      select: false,
    },

    // ─── Profile Image (Cloudinary) ─────────────────────────────────────────
    profileImage: {
      public_id: { type: String, default: null },
      secure_url: { type: String, default: null },
    },

    // ─── Extended Business Details ──────────────────────────────────────────
    cnic: {
      type: String,
      trim: true,
      default: null,
    },
    businessAddress: {
      type: String,
      trim: true,
      default: null,
    },
    contactNumber: {
      type: String,
      trim: true,
      default: null,
    },

    hostelName: {
      type: String,
      trim: true,
      default: null,
    },
    hostelAddress: {
      type: String,
      trim: true,
      default: null,
    },
    hostelPhone: {
      type: String,
      trim: true,
      default: null,
    },

    // ─── Account Status ─────────────────────────────────────────────────────
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// ─── Pre-save: hash password only when it has been modified ─────────────────
hostelOwnerSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// ─── Instance method: verify plain password against stored hash ──────────────
hostelOwnerSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ─── toJSON: strip all sensitive fields before sending to client ─────────────
hostelOwnerSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.otp;
  delete obj.otpExpiry;
  delete obj.otpType;
  delete obj.otpAttempts;
  delete obj.otpLockUntil;
  return obj;
};

export default hostelOwnerSchema;
