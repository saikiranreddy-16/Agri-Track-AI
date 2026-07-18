// Rate Limiting Placeholder Middleware for AI endpoints
// In production, this can be configured to restrict requests (e.g. max 20 requests/minute)
export const aiRateLimiter = (req, res, next) => {
  // Placeholder - currently lets all requests pass through
  // To enable, we can do:
  // import rateLimit from 'express-rate-limit';
  // export const aiRateLimiter = rateLimit({ windowMs: 60 * 1000, max: 20 });
  next();
};
