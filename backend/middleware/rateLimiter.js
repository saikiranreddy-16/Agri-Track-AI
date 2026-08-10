const rateLimitStore = new Map();

/**
 * Lightweight in-memory rate limiting middleware
 * @param {object} options - Configuration options
 * @param {number} options.windowMs - Time frame window in milliseconds (default: 15 mins)
 * @param {number} options.max - Max number of requests allowed in the window (default: 5)
 * @param {string} options.message - Error message to return when rate limited
 */
export const authRateLimiter = (options = {}) => {
  const { 
    windowMs = 15 * 60 * 1000, 
    max = 5, 
    message = 'Too many requests from this IP, please try again after 15 minutes.' 
  } = options;
  
  return (req, res, next) => {
    // Get client IP address
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    // Create unique key per IP + route path
    const key = `${ip}:${req.baseUrl || req.path}`;
    
    const now = Date.now();
    let record = rateLimitStore.get(key);
    
    if (!record) {
      record = { count: 1, resetTime: now + windowMs };
      rateLimitStore.set(key, record);
    } else {
      if (now > record.resetTime) {
        record.count = 1;
        record.resetTime = now + windowMs;
      } else {
        record.count += 1;
      }
    }
    
    // Set headers for standard rate limiting debugging
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - record.count));
    res.setHeader('X-RateLimit-Reset', new Date(record.resetTime).toISOString());
    
    if (record.count > max) {
      res.status(429);
      return res.json({
        success: false,
        message,
        timestamp: new Date().toISOString()
      });
    }
    
    next();
  };
};

// Background worker to prune expired rate limit records periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000); // every 5 minutes
