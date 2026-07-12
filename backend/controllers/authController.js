import User from '../models/userModel.js';
import GPSDevice from '../models/gpsDeviceModel.js';
import Machine from '../models/machineModel.js';
import generateToken from '../utils/generateToken.js';
import { successResponse } from '../utils/responseHandler.js';

/**
 * @desc    Register a new user (Self-registration disabled)
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const registerUser = async (req, res, next) => {
  res.status(400);
  return next(new Error('Self-registration is disabled on this platform. Please contact a Company Admin for GPS hardware activation.'));
};

/**
 * @desc    Authenticate user & get token (Login)
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const loginUser = async (req, res, next) => {
  const { email, phone, password, clientDeviceId, phoneName, platform, gpsDeviceId } = req.body;

  try {
    // 1. Company Admin Login (uses Email)
    if (email) {
      const user = await User.findOne({ email });

      if (user && (user.role === 'Company Admin' || user.role === 'Admin') && (await user.matchPassword(password))) {
        const token = generateToken(res, user._id);

        return successResponse(res, 200, 'Company Admin login successful', {
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            company: user.company,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
          token,
        });
      } else {
        res.status(401);
        return next(new Error('Invalid email, role, or password'));
      }
    }

    // 2. Farm Admin Login (uses Mobile Number/Phone)
    if (phone) {
      const user = await User.findOne({ phone });

      if (!user) {
        res.status(401);
        return next(new Error('Invalid mobile number or PIN'));
      }

      if (!(await user.matchPassword(password))) {
        res.status(401);
        return next(new Error('Invalid mobile number or PIN'));
      }

      if (user.role !== 'Farm Admin' && user.role !== 'Farm Owner' && user.role !== 'Operator') {
        res.status(451);
        return next(new Error('Access denied. Internal staff must use email login.'));
      }

      if (!clientDeviceId) {
        res.status(400);
        return next(new Error('Device fingerprint/identifier is required'));
      }

      // Check if current phone/browser is registered as a trusted device
      const isDeviceTrusted = user.trustedDevices.some(d => d.deviceId === clientDeviceId);

      if (!isDeviceTrusted) {
        // Device is untrusted, we require a GPS Device ID to authenticate and authorize this device
        if (!gpsDeviceId) {
          res.status(202); // 202 Accepted, but requires verification parameters (untrusted device)
          return res.json({
            success: false,
            code: 'untrusted_device',
            message: 'This device is not trusted. GPS hardware verification is required.',
          });
        }

        // Verify GPS Device ID belongs to one of the customer's vehicles
        const activeDevice = await GPSDevice.findOne({ deviceId: gpsDeviceId, status: 'Active', owner: user._id });
        if (!activeDevice) {
          res.status(401);
          return next(new Error('GPS Device verification failed. Device ID does not match any vehicle in your account.'));
        }

        // Validate max trusted devices limit (Max 3)
        if (user.trustedDevices.length >= 3) {
          res.status(403);
          return res.json({
            success: false,
            code: 'max_trusted_devices',
            message: 'Maximum 3 trusted devices allowed. Please remove a trusted device before logging in.',
          });
        }

        // Register new trusted device
        user.trustedDevices.push({
          deviceId: clientDeviceId,
          phoneName: phoneName || 'Chrome Browser',
          platform: platform || 'Web Platform',
          lastLogin: new Date(),
          createdAt: new Date(),
        });

        await user.save();
      } else {
        // Update last login timestamp for existing trusted device
        await User.updateOne(
          { _id: user._id, 'trustedDevices.deviceId': clientDeviceId },
          { $set: { 'trustedDevices.$.lastLogin': new Date() } }
        );
      }

      const token = generateToken(res, user._id);
      return successResponse(res, 200, 'Login successful', {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email || '',
          phone: user.phone,
          role: user.role,
          company: user.company,
          isFirstLogin: user.isFirstLogin,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        token,
      });
    }

    res.status(400);
    return next(new Error('Please provide email or mobile number to login'));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change user PIN/Password
 * @route   PUT /api/v1/auth/change-pin
 * @access  Private
 */
export const changePIN = async (req, res, next) => {
  const { currentPIN, newPIN } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    // Verify current password
    if (!(await user.matchPassword(currentPIN))) {
      res.status(400);
      return next(new Error('Current PIN is incorrect.'));
    }

    user.password = newPIN;
    user.isFirstLogin = false; // Mark first login completed
    await user.save();

    return successResponse(res, 200, 'PIN updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove a trusted device
 * @route   DELETE /api/v1/auth/trusted-devices/:deviceId
 * @access  Private (Farm Admin only)
 */
export const removeTrustedDevice = async (req, res, next) => {
  const { deviceId } = req.params;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    user.trustedDevices = user.trustedDevices.filter(d => d.deviceId !== deviceId);
    await user.save();

    return successResponse(res, 200, 'Trusted device removed successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user & clear cookie
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
export const logoutUser = async (req, res, next) => {
  try {
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
    return successResponse(res, 200, 'User profile retrieved successfully', {
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};
