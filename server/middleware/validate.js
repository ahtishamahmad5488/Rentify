import { body, validationResult } from 'express-validator';

/**
 * Central error handler for express-validator chains.
 * Always placed as the last item in a validator array.
 */
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
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('cnic').trim().notEmpty().withMessage('CNIC is required'),
  body('contactNumber').trim().notEmpty().withMessage('Contact number is required'),
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
  body('otp')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('OTP must be exactly 6 digits'),
  handleValidationErrors,
];

export const resetPasswordValidator = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('OTP must be exactly 6 digits'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters'),
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
  body('businessAddress')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Business address cannot be empty'),
  body('contactNumber')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Contact number cannot be empty'),
  handleValidationErrors,
];

// ─── Hostel Validators ────────────────────────────────────────────────────────

export const createHostelValidator = [
  body('name').trim().notEmpty().withMessage('Hostel name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('area').trim().notEmpty().withMessage('Area is required'),
  body('fullAddress').trim().notEmpty().withMessage('Full address is required'),
  body('pricePerMonth')
    .isFloat({ min: 0 })
    .withMessage('Price per month must be a positive number'),
  body('roomType')
    .isIn(['Shared', 'Private'])
    .withMessage('Room type must be Shared or Private'),
  body('genderType')
    .isIn(['Male', 'Female', 'Co-Ed'])
    .withMessage('Gender type must be Male, Female, or Co-Ed'),
  body('totalRooms')
    .isInt({ min: 1 })
    .withMessage('Total rooms must be at least 1'),
  body('availableRooms')
    .isInt({ min: 0 })
    .withMessage('Available rooms cannot be negative'),
  handleValidationErrors,
];

export const updateHostelValidator = [
  body('name').optional().trim().notEmpty().withMessage('Hostel name cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('city').optional().trim().notEmpty().withMessage('City cannot be empty'),
  body('area').optional().trim().notEmpty().withMessage('Area cannot be empty'),
  body('fullAddress').optional().trim().notEmpty().withMessage('Full address cannot be empty'),
  body('pricePerMonth')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price per month must be a positive number'),
  body('roomType')
    .optional()
    .isIn(['Shared', 'Private'])
    .withMessage('Room type must be Shared or Private'),
  body('genderType')
    .optional()
    .isIn(['Male', 'Female', 'Co-Ed'])
    .withMessage('Gender type must be Male, Female, or Co-Ed'),
  body('totalRooms')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Total rooms must be at least 1'),
  body('availableRooms')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Available rooms cannot be negative'),
  handleValidationErrors,
];

export const availabilityValidator = [
  body('availableRooms')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Available rooms cannot be negative'),
  body('availabilityStatus')
    .optional()
    .isIn(['AVAILABLE', 'FULL', 'CLOSED'])
    .withMessage('Status must be AVAILABLE, FULL, or CLOSED'),
  handleValidationErrors,
];


// ─── Admin Validators ─────────────────────────────────────────────────────────

export const hostelStatusValidator = [
  body('status')
    .isIn(['APPROVED', 'REJECTED'])
    .withMessage('Status must be APPROVED or REJECTED'),
  handleValidationErrors,
];
