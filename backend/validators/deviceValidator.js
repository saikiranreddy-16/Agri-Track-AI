import { body } from 'express-validator';
import { validateRequest } from '../middleware/validateMiddleware.js';

export const activateValidator = [
  body('mobileNumber')
    .notEmpty()
    .withMessage('Mobile number is required')
    .matches(/^\+?[0-9]{10,15}$/)
    .withMessage('Please enter a valid 10-15 digit mobile number')
    .trim(),
  
  body('deviceId')
    .notEmpty()
    .withMessage('Device ID is required')
    .matches(/^[a-zA-Z0-9-_]+$/)
    .withMessage('Device ID must be alphanumeric and can include hyphens or underscores')
    .trim(),
  
  body('chassisNumber')
    .notEmpty()
    .withMessage('Chassis number is required')
    .matches(/^[a-zA-Z0-9-_]+$/)
    .withMessage('Chassis number must be alphanumeric and can include hyphens or underscores')
    .trim(),
  
  body('customerName')
    .notEmpty()
    .withMessage('Customer name is required')
    .trim(),
  
  body('displayName')
    .notEmpty()
    .withMessage('Vehicle name (displayName) is required')
    .trim(),
  
  body('vehicleType')
    .notEmpty()
    .withMessage('Vehicle type is required')
    .trim(),
  
  body('farmName')
    .notEmpty()
    .withMessage('Farm name is required')
    .trim(),
  
  validateRequest,
];

export const replaceValidator = [
  body('vehicleId')
    .notEmpty()
    .withMessage('Vehicle ID is required')
    .isMongoId()
    .withMessage('Vehicle ID must be a valid Mongo ID'),
  
  body('newDeviceId')
    .notEmpty()
    .withMessage('New Device ID is required')
    .matches(/^[a-zA-Z0-9-_]+$/)
    .withMessage('New Device ID must be alphanumeric and can include hyphens or underscores')
    .trim(),
  
  body('reason')
    .notEmpty()
    .withMessage('Replacement reason is required')
    .trim(),
  
  validateRequest,
];
