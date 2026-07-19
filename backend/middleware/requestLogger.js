import logger from '../utils/logger.js';

/**
 * Middleware that logs HTTP request execution times and response statuses using Winston.
 */
export const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('User-Agent') || 'Unknown';
    const statusCode = res.statusCode;
    const userEmail = req.user ? req.user.email : 'Anonymous';

    const logString = `${method} ${originalUrl} ${statusCode} - ${duration}ms - User: ${userEmail} - IP: ${ip} - UA: ${userAgent}`;

    // Categorize logs based on HTTP status codes
    if (statusCode >= 500) {
      logger.error(logString);
    } else if (statusCode >= 400) {
      logger.warn(logString);
    } else {
      // Use custom http level for Winston
      logger.log('http', logString);
    }
  });

  next();
};

export default requestLogger;
