import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

/**
 * Authentication guard middleware to protect routes
 */
export const protect = async (req, res, next) => {
  let token;

  // Retrieve token from either the Authorization Header or request cookies
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // Check if token exists
  if (!token) {
    res.status(401);
    return next(new Error('Not authorized, login required'));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user details from database and exclude password
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      res.status(401);
      return next(new Error('User not found, session is invalid'));
    }

    next();
  } catch (error) {
    res.status(401);
    if (error.name === 'TokenExpiredError') {
      return next(new Error('Session expired, please login again'));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(new Error('Session invalid, authorization token is malformed'));
    }
    return next(new Error('Session expired or invalid token'));
  }
};

/**
 * Role authorization guard middleware
 * @param {...string} roles - Permitted user roles
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      return next(
        new Error(`Role ${req.user ? req.user.role : 'Guest'} is not authorized to access this resource`)
      );
    }
    next();
  };
};
