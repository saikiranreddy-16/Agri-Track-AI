import jwt from 'jsonwebtoken';

/**
 * Generates a JWT token and sets it as an HTTP-only cookie
 * @param {Object} res - Express response object
 * @param {string} userId - User ID to sign
 * @returns {string} Signed JWT token
 */
const generateToken = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

  // Calculate cookie expiration in ms (7 days default)
  const maxAgeMs = 7 * 24 * 60 * 60 * 1000;

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // true in production
    sameSite: 'strict', // Prevents CSRF attacks
    maxAge: maxAgeMs,
  });

  return token;
};

export default generateToken;
