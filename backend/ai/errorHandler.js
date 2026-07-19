import { ERROR_CODES } from '../constants/aiConstants.js';

/**
 * Standardized AI error handler middleware.
 */
export const aiErrorHandler = (err, req, res, next) => {
  console.error('AI Subsystem Error Intercepted:', err);

  let statusCode = 500;
  let message = 'An unexpected error occurred in the AI service.';
  let errorCode = ERROR_CODES.UNKNOWN_ERROR;
  
  const errMessage = err.message || '';

  if (errMessage.includes('unauthorized') || errMessage.includes('API Key') || errMessage.includes('key') || errMessage.includes('auth')) {
    statusCode = 401;
    message = 'Unauthorized: The AI provider API key is missing or invalid.';
    errorCode = ERROR_CODES.UNAUTHORIZED;
  } else if (errMessage.includes('timeout') || errMessage.includes('ETIMEDOUT') || errMessage.includes('timed out')) {
    statusCode = 504;
    message = 'Timeout: The AI provider did not respond in time.';
    errorCode = ERROR_CODES.TIMEOUT;
  } else if (errMessage.includes('offline') || errMessage.includes('unavailable') || errMessage.includes('connection') || errMessage.includes('connrefused')) {
    statusCode = 503;
    message = 'Provider Offline: The configured AI service is currently unreachable.';
    errorCode = ERROR_CODES.PROVIDER_OFFLINE;
  } else if (errMessage.includes('busy') || errMessage.includes('rate limit') || errMessage.includes('429')) {
    statusCode = 429;
    message = 'Rate Limit: Too many requests. The AI model is busy.';
    errorCode = ERROR_CODES.RATE_LIMIT;
  } else if (errMessage.includes('prompt') || errMessage.includes('length') || errMessage.includes('required') || errMessage.includes('empty')) {
    statusCode = 400;
    message = 'Invalid Prompt: The request prompt is empty or exceeds length limits.';
    errorCode = ERROR_CODES.INVALID_PROMPT;
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorCode,
    error: errMessage,
    timestamp: new Date().toISOString()
  });
};

export default aiErrorHandler;
