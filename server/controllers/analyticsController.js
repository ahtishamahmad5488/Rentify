import mongoose from 'mongoose';
import Property from '../models/Property.js';

// ─── @desc    Landlord Dashboard Analytics ────────────────────────────────────
// @route   GET /api/landlord/analytics
// @access  Private (landlord)
export const getDashboardAnalytics = async (req, res, next) => {
  try {
    const ownerObjectId = new mongoose.Types.ObjectId(req.user.id);

    const [aggregationResult, mostPopular] = await Promise.all([
      Property.aggregate([
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

      Property.findOne({ owner: req.user.id })
        .sort({ views: -1 })
        .select('title city views status isAvailable price'),
    ]);

    const facet = aggregationResult[0] || {};
    const totalViews = facet.totalViews?.[0]?.sum || 0;

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
        mostPopular: mostPopular || null,
        propertyStatusBreakdown: statusBreakdown,
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
