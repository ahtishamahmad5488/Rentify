import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
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
      enum: ['user'],
      default: 'user',
    },

    // ─── Firebase ─────────────────────────────────────────────────────────────
    firebaseUid: { type: String, default: null, sparse: true },

    // ─── Profile ──────────────────────────────────────────────────────────────
    phone: { type: String, trim: true, default: null },
    profileImage: {
      public_id: { type: String, default: null },
      secure_url: { type: String, default: null },
    },

    // ─── Saved Favorites ──────────────────────────────────────────────────────
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }],

    isActive: { type: Boolean, default: true },

    // ─── Forgot-Password OTP ─────────────────────────────────────────────────
    otp: { type: String, select: false },
    otpExpiry: { type: Date, select: false },
    otpAttempts: { type: Number, default: 0, select: false },
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model('User', userSchema);
