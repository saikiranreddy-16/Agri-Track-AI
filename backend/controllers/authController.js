import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';
import { successResponse } from '../utils/responseHandler.js';

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const registerUser = async (req, res, next) => {
  const { name, email, password, phone, company, role } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      return next(new Error('User already exists with this email address'));
    }

    // Create user in the database
    const user = await User.create({
      name,
      email,
      password,
      phone,
      company: company || '',
      role: role || 'Operator', // defaults to Operator if unspecified
    });

    if (user) {
      // Generate JWT token and set HTTP-only cookie
      const token = generateToken(res, user._id);

      return successResponse(res, 201, 'User registered successfully', {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          company: user.company,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        token,
      });
    } else {
      res.status(400);
      return next(new Error('Invalid user data received'));
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token (Login)
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });

    // Verify user exists and password hashes match
    if (user && (await user.matchPassword(password))) {
      // Generate JWT token and set HTTP-only cookie
      const token = generateToken(res, user._id);

      return successResponse(res, 200, 'Login successful', {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          company: user.company,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        token,
      });
    } else {
      res.status(401);
      return next(new Error('Invalid email or password'));
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user & clear cookie
 * @route   POST /api/v1/auth/logout
 * @access  Private (but accessible generally)
 */
export const logoutUser = async (req, res, next) => {
  try {
    // Clear JWT cookie
    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0),
    });

    return successResponse(res, 200, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
export const getUserProfile = async (req, res, next) => {
  try {
    // req.user has already been retrieved in protect middleware
    return successResponse(res, 200, 'User profile retrieved successfully', {
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};
