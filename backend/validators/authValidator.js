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
    .isIn(['Admin', 'Farm Owner', 'Manager', 'Operator', 'Mechanic', 'Viewer'])
    .withMessage('Role must be one of: Admin, Farm Owner, Manager, Operator, Mechanic, Viewer'),
  
  validateRequest,
];

export const loginValidator = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  validateRequest,
];
