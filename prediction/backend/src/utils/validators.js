const { body } = require('express-validator');

exports.validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  
  body('role')
    .optional()
    .isIn(['patient', 'doctor']).withMessage('Invalid role')
];

exports.validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty().withMessage('Password is required')
];

exports.validateDoctorRegistration = [
  body('specialization')
    .trim()
    .notEmpty().withMessage('Specialization is required'),
  
  body('qualification')
    .trim()
    .notEmpty().withMessage('Qualification is required'),
  
  body('experience')
    .notEmpty().withMessage('Experience is required')
    .isNumeric().withMessage('Experience must be a number'),
  
  body('licenseNumber')
    .trim()
    .notEmpty().withMessage('License number is required'),
  
  body('clinicAddress')
    .trim()
    .notEmpty().withMessage('Clinic address is required'),
  
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .isMobilePhone().withMessage('Please provide a valid phone number'),
  
  body('consultationFee')
    .notEmpty().withMessage('Consultation fee is required')
    .isNumeric().withMessage('Consultation fee must be a number')
];
