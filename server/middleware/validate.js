import { body, validationResult } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      data: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ─── Auth Validators ──────────────────────────────────────────────────────────

export const signupValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('cnic').trim().notEmpty().withMessage('CNIC is required'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('businessAddress').trim().notEmpty().withMessage('Business address is required'),
  handleValidationErrors,
];

export const loginValidator = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

export const otpValidator = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('otp').isLength({ min: 6, max: 6 }).isNumeric().withMessage('OTP must be exactly 6 digits'),
  handleValidationErrors,
];

export const resetPasswordValidator = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('otp').isLength({ min: 6, max: 6 }).isNumeric().withMessage('OTP must be exactly 6 digits'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  handleValidationErrors,
];

export const emailValidator = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  handleValidationErrors,
];

// ─── Profile Validators ───────────────────────────────────────────────────────

export const updateProfileValidator = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('cnic').optional().trim().notEmpty().withMessage('CNIC cannot be empty'),
  body('businessAddress').optional().trim().notEmpty().withMessage('Business address cannot be empty'),
  body('phone').optional().trim().notEmpty().withMessage('Phone cannot be empty'),
  handleValidationErrors,
];

// ─── Property Validators ──────────────────────────────────────────────────────

export const createPropertyValidator = [
  body('title').trim().notEmpty().withMessage('Property title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('propertyType')
    .isIn(['Shared', 'Private', 'Apartment', 'House', 'Room'])
    .withMessage('Invalid property type'),
  body('totalRooms').optional().isInt({ min: 1 }).withMessage('Total rooms must be at least 1'),
  body('availableRooms').optional().isInt({ min: 0 }).withMessage('Available rooms cannot be negative'),
  body('ownerPhone').trim().notEmpty().withMessage('Phone number is required'),
  body('ownerCnic')
    .trim()
    .notEmpty()
    .withMessage('CNIC is required')
    .matches(/^\d{13}$|^\d{5}-\d{7}-\d{1}$/)
    .withMessage('CNIC must be 13 digits or in format XXXXX-XXXXXXX-X'),
  handleValidationErrors,
];

export const updatePropertyValidator = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('city').optional().trim().notEmpty().withMessage('City cannot be empty'),
  body('address').optional().trim().notEmpty().withMessage('Address cannot be empty'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('propertyType')
    .optional()
    .isIn(['Shared', 'Private', 'Apartment', 'House', 'Room'])
    .withMessage('Invalid property type'),
  body('totalRooms').optional().isInt({ min: 1 }).withMessage('Total rooms must be at least 1'),
  body('availableRooms').optional().isInt({ min: 0 }).withMessage('Available rooms cannot be negative'),
  handleValidationErrors,
];

export const availabilityValidator = [
  body('availableRooms').optional().isInt({ min: 0 }).withMessage('Available rooms cannot be negative'),
  body('isAvailable').optional().isBoolean().withMessage('isAvailable must be a boolean'),
  handleValidationErrors,
];

// ─── Admin Validators ─────────────────────────────────────────────────────────

export const propertyStatusValidator = [
  body('status')
    .isIn(['APPROVED', 'REJECTED'])
    .withMessage('Status must be APPROVED or REJECTED'),
  handleValidationErrors,
];
