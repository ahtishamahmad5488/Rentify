import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Landlord',
      required: true,
    },

    // ─── Basic Info ──────────────────────────────────────────────────────────
    title: {
      type: String,
      required: [true, 'Property title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },

    // ─── Location ────────────────────────────────────────────────────────────
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    area: { type: String, trim: true, default: '' },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    // GeoJSON Point — populated from lat/lng or geocoded from address
    location: {
      type: { type: String, enum: ['Point'] },
      coordinates: { type: [Number] },
    },

    // ─── Pricing & Details ────────────────────────────────────────────────────
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    propertyType: {
      type: String,
      enum: ['Shared', 'Private', 'Apartment', 'House', 'Room'],
      required: [true, 'Property type is required'],
    },
    totalRooms: { type: Number, default: 1, min: 1 },
    availableRooms: { type: Number, default: 1, min: 0 },
    genderType: {
      type: String,
      enum: ['Male', 'Female', 'Co-Ed', 'Any'],
      default: 'Any',
    },
    facilities: { type: [String], default: [] },

    // ─── Images (Cloudinary) ─────────────────────────────────────────────────
    images: [
      {
        public_id: { type: String, required: true },
        secure_url: { type: String, required: true },
      },
    ],

    isAvailable: { type: Boolean, default: true },
    views: { type: Number, default: 0, min: 0 },

    // ─── Owner Contact (stored directly for mobile-created properties) ─────────
    ownerName:  { type: String, default: '' },
    ownerEmail: { type: String, default: '' },
    ownerPhone: { type: String, default: '' },
    ownerCnic:  { type: String, default: '' },

    // ─── Admin Approval ───────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'PENDING_REVIEW'],
      default: 'PENDING',
    },

    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
propertySchema.index({ city: 1, status: 1, isDeleted: 1 });
propertySchema.index({ owner: 1, status: 1 });
propertySchema.index({ location: '2dsphere' }, { sparse: true });

// ─── Auto-exclude soft-deleted docs from all find queries ────────────────────
propertySchema.pre(/^find/, function () {
  if (!Object.prototype.hasOwnProperty.call(this.getQuery(), 'isDeleted')) {
    this.where({ isDeleted: false });
  }
});

export default mongoose.model('Property', propertySchema);
