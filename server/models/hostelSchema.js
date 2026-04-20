import mongoose from 'mongoose';

const hostelSchema = new mongoose.Schema(
  {
    // ─── Owner Reference ─────────────────────────────────────────────────────
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HostelOwner',
      required: true,
      // index removed — covered by compound index below
    },

    // ─── Basic Info ──────────────────────────────────────────────────────────
    name: {
      type: String,
      required: [true, 'Hostel name is required'],
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
      // index removed — covered by compound index below
    },
    area: {
      type: String,
      required: [true, 'Area is required'],
      trim: true,
    },
    fullAddress: {
      type: String,
      required: [true, 'Full address is required'],
      trim: true,
    },
    // GeoJSON Point — auto-populated from fullAddress+city via Nominatim geocoding
    location: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
      },
    },

    // ─── Pricing & Room Details ──────────────────────────────────────────────
    pricePerMonth: {
      type: Number,
      required: [true, 'Price per month is required'],
      min: [0, 'Price cannot be negative'],
    },
    roomType: {
      type: String,
      enum: ['Shared', 'Private'],
      required: [true, 'Room type is required'],
    },
    totalRooms: {
      type: Number,
      required: [true, 'Total rooms count is required'],
      min: [1, 'Must have at least 1 room'],
    },
    availableRooms: {
      type: Number,
      required: [true, 'Available rooms count is required'],
      min: [0, 'Available rooms cannot be negative'],
    },

    // ─── Gender & Facilities ─────────────────────────────────────────────────
    genderType: {
      type: String,
      enum: ['Male', 'Female', 'Co-Ed'],
      required: [true, 'Gender type is required'],
    },
    facilities: {
      type: [String],
      default: [],
    },

    // ─── Images (Cloudinary) ─────────────────────────────────────────────────
    images: [
      {
        public_id: { type: String, required: true },
        secure_url: { type: String, required: true },
      },
    ],

    // ─── Analytics ───────────────────────────────────────────────────────────
    views: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ─── Approval Status (controlled by admin) ───────────────────────────────
    // PENDING        → newly created, awaiting admin approval
    // APPROVED       → admin has approved; publicly visible
    // REJECTED       → admin has rejected
    // PENDING_REVIEW → owner updated hostel; admin must re-approve
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'PENDING_REVIEW'],
      default: 'PENDING',
      // index removed — covered by compound index below
    },

    // ─── Availability Status (controlled by owner) ───────────────────────────
    // Auto-managed: FULL when availableRooms=0, AVAILABLE when >0.
    // Owner can manually set to CLOSED to stop new inquiries.
    availabilityStatus: {
      type: String,
      enum: ['AVAILABLE', 'FULL', 'CLOSED'],
      default: 'AVAILABLE',
    },

    // ─── Soft Delete ─────────────────────────────────────────────────────────
    // Owner performs soft delete; admin can hard delete separately.
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// ─── Compound Indexes ────────────────────────────────────────────────────────
// Speeds up the most common query: "get approved, non-deleted hostels by city"
hostelSchema.index({ city: 1, status: 1, isDeleted: 1 });

// Owner + status index for owner dashboard queries
hostelSchema.index({ owner: 1, status: 1 });

// 2dsphere index for geo-spatial queries — sparse allows docs without location
hostelSchema.index({ location: '2dsphere' }, { sparse: true });

// ─── Query Middleware: auto-exclude soft-deleted documents ───────────────────
// Applied to all find-based operations. Admin routes bypass this by explicitly
// passing { isDeleted: true } or { isDeleted: { $in: [true, false] } }.
hostelSchema.pre(/^find/, function () {
  // Only add the filter if the query hasn't explicitly set isDeleted
  if (!Object.prototype.hasOwnProperty.call(this.getQuery(), 'isDeleted')) {
    this.where({ isDeleted: false });
  }
});

export default hostelSchema;
