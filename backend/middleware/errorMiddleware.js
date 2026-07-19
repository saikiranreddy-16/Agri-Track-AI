import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { errorResponse } from '../utils/responseHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logDir = path.join(__dirname, '../logs');

// Ensure the logs directory exists
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

/**
 * Middleware to handle routes that are not found (404)
 */
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Centrally processes and formats thrown errors into uniform JSON payloads
 */
export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Handle typical Mongoose database errors
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 400;
    message = 'Resource not found (Invalid ID format)';
  } else if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered (Already exists)';
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((val) => val.message).join(', ');
  }

  // Mask raw system/DB details from the client response in production
  let responseMessage = message;
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    responseMessage = 'An unexpected server error occurred.';
  }

  // Create log message with details
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${req.method} ${req.originalUrl} - status: ${statusCode} - message: ${message}\nStack: ${err.stack}\n\n`;

  // Log to error file
  fs.appendFile(path.join(logDir, 'error.log'), logMessage, (writeErr) => {
    if (writeErr) {
      console.error('CRITICAL: Failed to write to error.log:', writeErr);
    }
  });

  const debugDetails = process.env.NODE_ENV === 'production' ? null : { stack: err.stack };

  return errorResponse(res, statusCode, responseMessage, debugDetails);
};
