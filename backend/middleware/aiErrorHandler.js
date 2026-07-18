// Specialized AI error handler middleware
export const aiErrorHandler = (err, req, res, next) => {
  console.error('AI Service Error Logged:', err);

  let statusCode = 500;
  let message = 'An unexpected error occurred in the AI service.';
  
  const errMessage = err.message || '';

  if (errMessage.includes('unauthorized') || errMessage.includes('token') || errMessage.includes('auth')) {
    statusCode = 401;
    message = 'Unauthorized: Access to the AI service is denied.';
  } else if (errMessage.includes('timeout') || errMessage.includes('ETIMEDOUT') || errMessage.includes('timed out')) {
    statusCode = 504;
    message = 'Timeout: The AI provider did not respond in time.';
  } else if (errMessage.includes('unavailable') || errMessage.includes('connection') || errMessage.includes('connrefused')) {
    statusCode = 503;
    message = 'Provider unavailable: The configured AI service is currently unreachable.';
  } else if (errMessage.includes('busy') || errMessage.includes('rate limit') || errMessage.includes('429')) {
    statusCode = 429;
    message = 'Model Busy: Too many requests. Please try again later.';
  } else if (errMessage.includes('prompt') || errMessage.includes('invalid input') || errMessage.includes('required')) {
    statusCode = 400;
    message = 'Invalid Prompt: The request format or input prompt is invalid.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    error: errMessage,
    timestamp: new Date().toISOString()
  });
};
