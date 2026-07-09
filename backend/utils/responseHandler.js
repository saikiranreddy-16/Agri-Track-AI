/**
 * Sends a standardized success API response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code (default: 200)
 * @param {string} message - Success description message
 * @param {any} data - Payload data (default: null)
 */
export const successResponse = (res, statusCode = 200, message = 'Success', data = null) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Sends a standardized error API response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {string} message - Error description message
 * @param {any} errors - Detail array/object of errors (e.g. validator outputs) (default: null)
 */
export const errorResponse = (res, statusCode = 500, message = 'Error', errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};
