import Hostel from '../models/Hostel.js';
import HostelOwner from '../models/HostelOwner.js';
import User from '../models/User.js';

// ─── @desc    Get Admin Dashboard Analytics ─────────────────────────────────
// @route   GET /api/auth/admin/analytics
// @access  Private (admin only)
export const getDashboardAnalytics = async (req, res, next) => {
  try {
    // ─── Period filter ────────────────────────────────────────────────────────
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
    // 'all' → no date filter

    // Run all counts in parallel
    const [
      totalHostels,
      pendingHostels,
      approvedHostels,
      rejectedHostels,
      pendingReviewHostels,
      totalOwners,
      verifiedOwners,
      totalStudents,
    ] = await Promise.all([
      Hostel.countDocuments({ ...dateFilter }),
      Hostel.countDocuments({ ...dateFilter, status: 'PENDING' }),
      Hostel.countDocuments({ ...dateFilter, status: 'APPROVED' }),
      Hostel.countDocuments({ ...dateFilter, status: 'REJECTED' }),
      Hostel.countDocuments({ ...dateFilter, status: 'PENDING_REVIEW' }),
      HostelOwner.countDocuments({ ...dateFilter }),
      HostelOwner.countDocuments({ ...dateFilter, isVerified: true }),
      User.countDocuments({ ...dateFilter }),
    ]);

    // Recent activity — always latest 3, bypass isDeleted pre-find middleware
    // $ne: true matches documents where isDeleted is false OR field doesn't exist
    const recentHostels = await Hostel.find({ isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .limit(3)
      .select('name status city owner createdAt')
      .populate('owner', 'name email');

    const recentOwners = await HostelOwner.find({ ...dateFilter })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email isVerified createdAt');

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalHostels,
          pendingHostels,
          approvedHostels,
          rejectedHostels,
          pendingReviewHostels,
          totalOwners,
          verifiedOwners,
          totalStudents,
        },
        recentHostels,
        recentOwners,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Get All Hostels (Admin — with filters & pagination) ───────────
// @route   GET /api/auth/admin/hostels
// @access  Private (admin only)
export const getAllHostels = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, city, search } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

    const query = { isDeleted: { $in: [true, false] } }; // admin sees all

    if (status && status !== 'all') {
      query.status = status.toUpperCase();
    }
    if (city && city !== 'all') {
      query.city = { $regex: city, $options: 'i' };
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ];
    }

    const [hostels, total] = await Promise.all([
      Hostel.find(query)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .populate('owner', 'name email'),
      Hostel.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: hostels,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Get Single Hostel Detail (Admin) ──────────────────────────────
// @route   GET /api/auth/admin/hostels/:id
// @access  Private (admin only)
export const getHostelDetail = async (req, res, next) => {
  try {
    const hostel = await Hostel.findOne({
      _id: req.params.id,
      isDeleted: { $in: [true, false] },
    }).populate('owner', 'name email contactNumber cnic profileImage businessAddress');

    if (!hostel) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }

    res.status(200).json({ success: true, data: hostel });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Get All Hostel Owners (Admin — with filters & pagination) ─────
// @route   GET /api/auth/admin/owners
// @access  Private (admin only)
export const getAllOwners = async (req, res, next) => {
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

    const [owners, total] = await Promise.all([
      HostelOwner.find(query)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .select('name email contactNumber cnic profileImage isVerified isActive createdAt'),
      HostelOwner.countDocuments(query),
    ]);

    // Get hostel count per owner
    const ownerIds = owners.map((o) => o._id);
    const hostelCounts = await Hostel.aggregate([
      { $match: { owner: { $in: ownerIds }, isDeleted: false } },
      { $group: { _id: '$owner', count: { $sum: 1 } } },
    ]);
    const countMap = {};
    hostelCounts.forEach((h) => { countMap[h._id.toString()] = h.count; });

    const ownersWithCount = owners.map((o) => ({
      ...o.toJSON(),
      hostelCount: countMap[o._id.toString()] || 0,
    }));

    res.status(200).json({
      success: true,
      data: ownersWithCount,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Update Owner Status (Admin — verify or suspend) ───────────────
// @route   PATCH /api/auth/admin/owners/:id/status
// @access  Private (admin only)
export const updateOwnerStatus = async (req, res, next) => {
  try {
    const { action } = req.body; // 'verify' | 'unverify' | 'suspend' | 'unsuspend'

    if (!['verify', 'unverify', 'suspend', 'unsuspend'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Invalid action' });
    }

    const owner = await HostelOwner.findById(req.params.id);
    if (!owner) {
      return res.status(404).json({ success: false, message: 'Owner not found' });
    }

    if (action === 'verify') owner.isVerified = true;
    else if (action === 'unverify') owner.isVerified = false;
    else if (action === 'suspend') owner.isActive = false;
    else if (action === 'unsuspend') owner.isActive = true;

    await owner.save({ validateModifiedOnly: true });

    res.status(200).json({
      success: true,
      message: `Owner ${action}d successfully`,
      data: { _id: owner._id, isVerified: owner.isVerified, isActive: owner.isActive },
    });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Get All Students/Users (Admin) ────────────────────────────────
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
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};
