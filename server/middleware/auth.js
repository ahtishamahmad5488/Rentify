import jwt from 'jsonwebtoken';
import HostelOwner from '../models/HostelOwner.js';
import User from '../models/User.js';

/**
 * Protect routes — verify JWT and confirm the account still exists and is active.
 *
 * Security note: verifying only the JWT is insufficient because a token remains
 * valid after an account is deactivated or deleted until it expires. This
 * middleware performs a lightweight DB check (select only `isActive`) to catch
 * those cases for non-admin roles.
 *
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
      return res.status(401).json({
        success: false,
        message: 'Token is not valid',
      });
    }

    // ─── DB existence + active check (skipped for admin — env-based only) ───
    if (decoded.role === 'hostel_owner') {
      // Fetch only the isActive field to keep the check lightweight
      const owner = await HostelOwner.findById(decoded.id).select('isActive');
      if (!owner || owner.isActive === false) {
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
    // Admin role: no DB model — credentials are validated at login time via env

    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};

// ─── Role-based authorization helpers ────────────────────────────────────────

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};

export const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Only admins can access this route',
    });
  }
  next();
};

export const isHostelOwner = (req, res, next) => {
  if (req.user.role !== 'hostel_owner') {
    return res.status(403).json({
      success: false,
      message: 'Only hostel owners can access this route',
    });
  }
  next();
};

export const isUser = (req, res, next) => {
  if (req.user.role !== 'user') {
    return res.status(403).json({
      success: false,
      message: 'Only regular users can access this route',
    });
  }
  next();
};
