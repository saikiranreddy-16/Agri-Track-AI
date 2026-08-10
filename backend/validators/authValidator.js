import { body } from 'express-validator';
import { validateRequest } from '../middleware/validateMiddleware.js';

export const registerValidator = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .trim(),
  
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .trim(),
  
  body('company')
    .optional()
    .trim(),
  
  body('role')
    .optional()
    .isIn(['Company Admin', 'Farm Admin'])
    .withMessage('Role must be one of: Company Admin, Farm Admin'),
  
  validateRequest,
];

export const loginValidator = [
  body('password')
    .notEmpty()
    .withMessage('Password or PIN is required'),
  
  validateRequest,
];

export const changePINValidator = [
  body('currentPIN')
    .notEmpty()
    .withMessage('Current PIN is required')
    .isNumeric()
    .isLength({ min: 6, max: 6 })
    .withMessage('Current PIN must be a 6-digit numeric code')
    .trim(),
  
  body('newPIN')
    .notEmpty()
    .withMessage('New PIN is required')
    .isNumeric()
    .isLength({ min: 6, max: 6 })
    .withMessage('New PIN must be a 6-digit numeric code')
    .trim(),
  
  validateRequest,
];
