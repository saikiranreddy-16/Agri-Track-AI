import { validationResult } from 'express-validator';
import { errorResponse } from '../utils/responseHandler.js';

/**
 * Middleware to check validation results and handle errors
 */
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));
    return errorResponse(res, 400, 'Validation failed', formattedErrors);
  }
  next();
};
