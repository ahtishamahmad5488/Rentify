import jwt from 'jsonwebtoken';
import Landlord from '../models/Landlord.js';
import User from '../models/User.js';

/**
 * Protect routes — verify JWT and confirm the account still exists and is active.
 * Admin tokens are env-credential-based (no DB model), so no DB check is needed.
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ success: false, message: 'Token is not valid' });
    }

    // ─── DB existence + active check ─────────────────────────────────────────
    if (decoded.role === 'landlord') {
      const landlord = await Landlord.findById(decoded.id).select('isActive');
      if (!landlord || landlord.isActive === false) {
        return res.status(401).json({
          success: false,
          message: 'Account is no longer active or does not exist',
        });
      }
    } else if (decoded.role === 'user') {
      const user = await User.findById(decoded.id).select('isActive');
      if (!user || user.isActive === false) {
        return res.status(401).json({
          success: false,
          message: 'Account is no longer active or does not exist',
        });
      }
    }
    // Admin: no DB model — credentials validated at login via env only

    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...allowedRoles) => (req, res, next) => {
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Role '${req.user.role}' is not authorized to access this route`,
    });
  }
  next();
};

export const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

export const isLandlord = (req, res, next) => {
  if (req.user.role !== 'landlord') {
    return res.status(403).json({ success: false, message: 'Landlord access required' });
  }
  next();
};

export const isUser = (req, res, next) => {
  if (req.user.role !== 'user') {
    return res.status(403).json({ success: false, message: 'User access required' });
  }
  next();
};
