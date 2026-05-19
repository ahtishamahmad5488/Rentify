import Property from '../models/Property.js';
import Landlord from '../models/Landlord.js';
import User from '../models/User.js';

// ─── @desc    Get Admin Dashboard Analytics ─────────────────────────────────
// @route   GET /api/auth/admin/analytics
// @access  Private (admin only)
export const getDashboardAnalytics = async (req, res, next) => {
  try {
    const { period } = req.query; // 'week' | 'month' | 'year' | 'all'
    let dateFilter = {};
    const now = new Date();
    if (period === 'week') {
      const start = new Date(now);
      start.setDate(now.getDate() - 7);
      dateFilter = { createdAt: { $gte: start } };
    } else if (period === 'month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      dateFilter = { createdAt: { $gte: start } };
    } else if (period === 'year') {
      const start = new Date(now.getFullYear(), 0, 1);
      dateFilter = { createdAt: { $gte: start } };
    }

    const [
      totalProperties,
      pendingProperties,
      approvedProperties,
      rejectedProperties,
      pendingReviewProperties,
      totalLandlords,
      verifiedLandlords,
      totalUsers,
    ] = await Promise.all([
      Property.countDocuments({ ...dateFilter }),
      Property.countDocuments({ ...dateFilter, status: 'PENDING' }),
      Property.countDocuments({ ...dateFilter, status: 'APPROVED' }),
      Property.countDocuments({ ...dateFilter, status: 'REJECTED' }),
      Property.countDocuments({ ...dateFilter, status: 'PENDING_REVIEW' }),
      Landlord.countDocuments({ ...dateFilter }),
      Landlord.countDocuments({ ...dateFilter, isVerified: true }),
      User.countDocuments({ ...dateFilter }),
    ]);

    const recentProperties = await Property.find({ isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .limit(3)
      .select('title status city owner createdAt')
      .populate('owner', 'name email');

    const recentLandlords = await Landlord.find({ ...dateFilter })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email isVerified createdAt');

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalProperties,
          pendingProperties,
          approvedProperties,
          rejectedProperties,
          pendingReviewProperties,
          totalLandlords,
          verifiedLandlords,
          totalUsers,
        },
        recentProperties,
        recentLandlords,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Get All Properties (Admin — with filters & pagination) ─────────
// @route   GET /api/auth/admin/properties
// @access  Private (admin only)
export const getAllProperties = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, city, search } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

    const query = { isDeleted: { $in: [true, false] } };

    if (status && status !== 'all') query.status = status.toUpperCase();
    if (city && city !== 'all') query.city = { $regex: city, $options: 'i' };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ];
    }

    const [properties, total] = await Promise.all([
      Property.find(query)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .populate('owner', 'name email'),
      Property.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: properties,
      pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Get Single Property Detail (Admin) ────────────────────────────
// @route   GET /api/auth/admin/properties/:id
// @access  Private (admin only)
export const getPropertyDetail = async (req, res, next) => {
  try {
    const property = await Property.findOne({
      _id: req.params.id,
      isDeleted: { $in: [true, false] },
    }).populate('owner', 'name email phone cnic profileImage businessAddress');

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    res.status(200).json({ success: true, data: property });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Get All Landlords (Admin — with filters & pagination) ──────────
// @route   GET /api/auth/admin/landlords
// @access  Private (admin only)
export const getAllLandlords = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

    const query = {};
    if (status === 'verified') query.isVerified = true;
    else if (status === 'pending') query.isVerified = false;
    else if (status === 'suspended') query.isActive = false;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { cnic: { $regex: search, $options: 'i' } },
      ];
    }

    const [landlords, total] = await Promise.all([
      Landlord.find(query)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .select('name email phone cnic profileImage isVerified isActive createdAt'),
      Landlord.countDocuments(query),
    ]);

    const landlordIds = landlords.map((l) => l._id);
    const propertyCounts = await Property.aggregate([
      { $match: { owner: { $in: landlordIds }, isDeleted: false } },
      { $group: { _id: '$owner', count: { $sum: 1 } } },
    ]);
    const countMap = {};
    propertyCounts.forEach((p) => { countMap[p._id.toString()] = p.count; });

    const landlordsWithCount = landlords.map((l) => ({
      ...l.toJSON(),
      propertyCount: countMap[l._id.toString()] || 0,
    }));

    res.status(200).json({
      success: true,
      data: landlordsWithCount,
      pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Update Landlord Status (Admin — verify or suspend) ─────────────
// @route   PATCH /api/auth/admin/landlords/:id/status
// @access  Private (admin only)
export const updateLandlordStatus = async (req, res, next) => {
  try {
    const { action } = req.body; // 'verify' | 'unverify' | 'suspend' | 'unsuspend'

    if (!['verify', 'unverify', 'suspend', 'unsuspend'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Invalid action' });
    }

    const landlord = await Landlord.findById(req.params.id);
    if (!landlord) {
      return res.status(404).json({ success: false, message: 'Landlord not found' });
    }

    if (action === 'verify') landlord.isVerified = true;
    else if (action === 'unverify') landlord.isVerified = false;
    else if (action === 'suspend') landlord.isActive = false;
    else if (action === 'unsuspend') landlord.isActive = true;

    await landlord.save({ validateModifiedOnly: true });

    res.status(200).json({
      success: true,
      message: `Landlord ${action}d successfully`,
      data: { _id: landlord._id, isVerified: landlord.isVerified, isActive: landlord.isActive },
    });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Get All Users (Admin) ─────────────────────────────────────────
// @route   GET /api/auth/admin/users
// @access  Private (admin only)
export const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .select('name email isActive createdAt'),
      User.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: users,
      pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    next(error);
  }
};
