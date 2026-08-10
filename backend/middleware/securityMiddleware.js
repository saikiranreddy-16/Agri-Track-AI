/**
 * Custom request timeout protection middleware.
 */
export const requestTimeout = (req, res, next) => {
  const timeoutMs = Number(process.env.REQUEST_TIMEOUT) || 15000;
  
  res.setTimeout(timeoutMs, () => {
    if (!res.headersSent) {
      res.status(503).json({
        success: false,
        message: 'Request timed out.',
        statusCode: 503
      });
    }
  });
  
  next();
};

/**
 * Custom XSS sanitization middleware that recursively scrubs HTML tag tags.
 */
export const xssClean = (req, res, next) => {
  const sanitize = (val) => {
    if (typeof val === 'string') {
      // Basic RegExp HTML tag scrubbing
      return val.replace(/<[^>]*>/g, '');
    }
    
    if (Array.isArray(val)) {
      return val.map(sanitize);
    }
    
    if (typeof val === 'object' && val !== null) {
      const cleaned = {};
      for (const key of Object.keys(val)) {
        cleaned[key] = sanitize(val[key]);
      }
      return cleaned;
    }
    
    return val;
  };

  if (req.body) {
    req.body = sanitize(req.body);
  }
  if (req.query) {
    req.query = sanitize(req.query);
  }
  if (req.params) {
    req.params = sanitize(req.params);
  }

  next();
};
