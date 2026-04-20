import Property from '../models/Property.js';

// @desc   Public list of approved properties (mobile home/search/filter)
// @route  GET /api/properties
// @query  q, city, minPrice, maxPrice, roomType, facilities (csv)
//         lat, lng, radiusKm (radius search — uses 2dsphere index)
// @access Public
export const listProperties = async (req, res, next) => {
  try {
    const {
      q, city, minPrice, maxPrice, roomType, facilities,
      lat, lng, radiusKm,
      page = 1, limit = 20,
    } = req.query;

    const filter = { status: 'APPROVED', isDeleted: false };

    if (q) filter.name = { $regex: q, $options: 'i' };
    if (city) filter.city = { $regex: `^${city}$`, $options: 'i' };
    if (roomType) filter.roomType = roomType;
    if (minPrice || maxPrice) {
      filter.pricePerMonth = {};
      if (minPrice) filter.pricePerMonth.$gte = Number(minPrice);
      if (maxPrice) filter.pricePerMonth.$lte = Number(maxPrice);
    }
    if (facilities) {
      const list = String(facilities).split(',').map((f) => f.trim()).filter(Boolean);
      if (list.length) filter.facilities = { $all: list };
    }

    // Radius-based geo filter (2km / 5km / 10km from spec).
    if (lat && lng && radiusKm) {
      const radiusMeters = Number(radiusKm) * 1000;
      filter.location = {
        $near: {
          $geometry: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
          $maxDistance: radiusMeters,
        },
      };
    }

    const pageNum = Math.max(1, parseInt(page) || 1);
    const lim = Math.min(50, Math.max(1, parseInt(limit) || 20));
    const skip = (pageNum - 1) * lim;

    const properties = await Property.find(filter)
      .skip(skip)
      .limit(lim)
      .select('-__v');

    res.status(200).json({
      success: true,
      data: properties,
      pagination: { page: pageNum, limit: lim, count: properties.length },
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Public get single property by id
// @route  GET /api/properties/:id
export const getProperty = async (req, res, next) => {
  try {
    const property = await Property.findOne({
      _id: req.params.id,
      status: 'APPROVED',
      isDeleted: false,
    }).populate('owner', 'name email contactNumber profileImage');

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    res.status(200).json({ success: true, data: property });
  } catch (error) {
    next(error);
  }
};
