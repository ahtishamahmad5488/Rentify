import mongoose from 'mongoose';
import Hostel from '../models/Hostel.js';

// ─── @desc    Owner Dashboard Analytics ──────────────────────────────────────
// @route   GET /api/owner/analytics
// @access  Private (hostel_owner)
export const getDashboardAnalytics = async (req, res, next) => {
  try {
    const ownerObjectId = new mongoose.Types.ObjectId(req.user.id);

    /**
     * Single aggregation with $facet runs one DB round-trip to get:
     * - Total views across all owner hostels
     * - Status breakdown (PENDING / PENDING_REVIEW / APPROVED / REJECTED)
     */
    const [aggregationResult, mostPopular] = await Promise.all([
      Hostel.aggregate([
        { $match: { owner: ownerObjectId, isDeleted: false } },
        {
          $facet: {
            totalViews: [
              { $group: { _id: null, sum: { $sum: '$views' } } },
            ],
            statusBreakdown: [
              { $group: { _id: '$status', count: { $sum: 1 } } },
            ],
          },
        },
      ]),

      // Most popular hostel by views
      Hostel.findOne({ owner: req.user.id })
        .sort({ views: -1 })
        .select('name city views status availabilityStatus pricePerMonth'),
    ]);

    // ─── Parse aggregation results ───────────────────────────────────────────
    const facet = aggregationResult[0] || {};
    const totalViews = facet.totalViews?.[0]?.sum || 0;

    // Build status breakdown with default zeros for all possible statuses
    const statusBreakdown = { PENDING: 0, PENDING_REVIEW: 0, APPROVED: 0, REJECTED: 0 };
    (facet.statusBreakdown || []).forEach(({ _id, count }) => {
      if (statusBreakdown[_id] !== undefined) statusBreakdown[_id] = count;
    });

    const totalListings = Object.values(statusBreakdown).reduce((a, b) => a + b, 0);

    res.status(200).json({
      success: true,
      message: 'Dashboard analytics retrieved successfully',
      data: {
        totalListings,
        totalViews,
        mostPopularHostel: mostPopular || null,

        // Per-status hostel counts for owner dashboard overview
        hostelStatusBreakdown: statusBreakdown,

        // Future-ready placeholder for booking trends
        bookingTrends: {
          note: 'Booking module coming soon',
          data: [],
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
