import User from '../models/userModel.js';
import GPSDevice from '../models/gpsDeviceModel.js';
import LoginHistory from '../models/loginHistoryModel.js';
import generateToken from '../utils/generateToken.js';
import { successResponse } from '../utils/responseHandler.js';
import { logActivity } from '../utils/activityLogger.js';

// Helper to extract client details from Express request
const getClientInfo = (req) => {
  const userAgent = req.headers['user-agent'] || '';
  let browser = 'Unknown Browser';
  let os = 'Unknown OS';

  // Simple UA Parser
  if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) browser = 'Chrome';
  else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
  else if (userAgent.includes('Edg')) browser = 'Edge';

  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Macintosh') || userAgent.includes('Mac OS')) os = 'macOS';
  else if (userAgent.includes('Linux') && !userAgent.includes('Android')) os = 'Linux';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';

  let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
  if (ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }
  return { browser, os, ip };
};

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
  const { browser, os, ip } = getClientInfo(req);
  const deviceDisplayName = phoneName || `${browser} on ${os}`;

  try {
    // 1. Company Admin Login (uses Email)
    if (email) {
      const user = await User.findOne({ email });
      const passwordMatch = user && (await user.matchPassword(password));

      // Record Login Audit Log
      await LoginHistory.create({
        user: user ? user._id : null,
        userEmail: email,
        time: new Date(),
        device: deviceDisplayName,
        browser,
        ip,
        success: !!(user && passwordMatch),
      });

      if (user && (user.role === 'Company Admin' || user.role === 'Admin') && passwordMatch) {
        const token = generateToken(res, user._id);
        
        await logActivity(user._id, user.name, 'User Logged In', `Company Admin logged in from IP ${ip}`, req);

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

      if (!user || !(await user.matchPassword(password))) {
        await LoginHistory.create({
          user: user ? user._id : null,
          userPhone: phone,
          time: new Date(),
          device: deviceDisplayName,
          browser,
          ip,
          success: false,
        });
        res.status(401);
        return next(new Error('Invalid mobile number or PIN'));
      }

      if (user.role !== 'Farm Admin' && user.role !== 'Farm Owner' && user.role !== 'Operator') {
        await LoginHistory.create({
          user: user._id,
          userPhone: phone,
          time: new Date(),
          device: deviceDisplayName,
          browser,
          ip,
          success: false,
        });
        res.status(451);
        return next(new Error('Access denied. Internal staff must use email login.'));
      }

      if (!clientDeviceId) {
        res.status(400);
        return next(new Error('Device fingerprint/identifier is required'));
      }

      // Check if current device is registered and trusted
      const trustedDevice = user.trustedDevices.find(d => d.deviceId === clientDeviceId);
      const isDeviceTrusted = trustedDevice && trustedDevice.trustedStatus === 'Trusted';

      if (!isDeviceTrusted) {
        // Device is untrusted, we require a GPS Device ID to authenticate and authorize this device
        if (!gpsDeviceId) {
          await LoginHistory.create({
            user: user._id,
            userPhone: phone,
            time: new Date(),
            device: deviceDisplayName,
            browser,
            ip,
            success: false,
          });
          res.status(202); // 202 Accepted, but requires verification parameters (untrusted device)
          return res.json({
            success: false,
            code: 'untrusted_device',
            message: 'This device is not trusted. GPS hardware verification is required.',
            data: null,
            pagination: null,
            timestamp: new Date().toISOString(),
          });
        }

        // Verify GPS Device ID belongs to one of the customer's vehicles
        const activeDevice = await GPSDevice.findOne({ deviceId: gpsDeviceId, status: 'Active', owner: user._id });
        if (!activeDevice) {
          await LoginHistory.create({
            user: user._id,
            userPhone: phone,
            time: new Date(),
            device: deviceDisplayName,
            browser,
            ip,
            success: false,
          });
          res.status(401);
          return next(new Error('GPS Device verification failed. Device ID does not match any vehicle in your account.'));
        }

        // Validate max trusted devices limit (Max 3 active Trusted ones)
        const activeTrustedCount = user.trustedDevices.filter(d => d.trustedStatus === 'Trusted').length;
        if (activeTrustedCount >= 3) {
          await LoginHistory.create({
            user: user._id,
            userPhone: phone,
            time: new Date(),
            device: deviceDisplayName,
            browser,
            ip,
            success: false,
          });
          res.status(403);
          return res.json({
            success: false,
            code: 'max_trusted_devices',
            message: 'Maximum 3 trusted devices allowed. Please remove a trusted device before logging in.',
            data: null,
            pagination: null,
            timestamp: new Date().toISOString(),
          });
        }

        // Register or re-activate trusted device
        const existingDeviceIndex = user.trustedDevices.findIndex(d => d.deviceId === clientDeviceId);
        if (existingDeviceIndex !== -1) {
          user.trustedDevices[existingDeviceIndex].trustedStatus = 'Trusted';
          user.trustedDevices[existingDeviceIndex].lastActive = new Date();
          user.trustedDevices[existingDeviceIndex].loginTime = new Date();
          user.trustedDevices[existingDeviceIndex].ipAddress = ip;
          user.trustedDevices[existingDeviceIndex].browser = browser;
          user.trustedDevices[existingDeviceIndex].os = os;
          user.trustedDevices[existingDeviceIndex].deviceName = phoneName || `${browser} on ${os}`;
        } else {
          user.trustedDevices.push({
            deviceId: clientDeviceId,
            deviceName: phoneName || `${browser} on ${os}`,
            browser,
            os,
            ipAddress: ip,
            loginTime: new Date(),
            lastActive: new Date(),
            trustedStatus: 'Trusted',
          });
        }

        await user.save();
      } else {
        // Update last login timestamp and status for existing trusted device
        await User.updateOne(
          { _id: user._id, 'trustedDevices.deviceId': clientDeviceId },
          { 
            $set: { 
              'trustedDevices.$.lastLogin': new Date(),
              'trustedDevices.$.lastActive': new Date(),
              'trustedDevices.$.ipAddress': ip,
              'trustedDevices.$.browser': browser,
              'trustedDevices.$.os': os,
            } 
          }
        );
      }

      // Record Login Audit Log for success
      await LoginHistory.create({
        user: user._id,
        userPhone: phone,
        time: new Date(),
        device: deviceDisplayName,
        browser,
        ip,
        success: true,
      });

      const token = generateToken(res, user._id);
      await logActivity(user._id, user.name, 'User Logged In', `Farm Admin logged in from device ${deviceDisplayName}`, req);

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

    await logActivity(
      user._id,
      user.name,
      'Password Changed',
      `PIN updated successfully for user ${user.name}`,
      req
    );

    return successResponse(res, 200, 'PIN updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove/Revoke a trusted device
 * @route   DELETE /api/v1/auth/trusted-devices/:deviceId
 * @access  Private
 */
export const removeTrustedDevice = async (req, res, next) => {
  const { deviceId } = req.params;
  const targetUserId = req.query.userId || req.user._id;

  try {
    // If the requester is not Company Admin and tries to revoke for someone else, deny
    if (req.user.role !== 'Company Admin' && targetUserId.toString() !== req.user._id.toString()) {
      res.status(403);
      return next(new Error('Not authorized to revoke trusted devices for this user.'));
    }

    const user = await User.findById(targetUserId);
    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    // Revoke the device status instead of hard-deleting
    const deviceIndex = user.trustedDevices.findIndex(d => d.deviceId === deviceId);
    if (deviceIndex === -1) {
      res.status(404);
      return next(new Error('Trusted device not found for this account.'));
    }

    user.trustedDevices[deviceIndex].trustedStatus = 'Revoked';
    user.trustedDevices[deviceIndex].lastActive = new Date();
    await user.save();

    await logActivity(
      req.user._id,
      req.user.name,
      'Settings Changed',
      `Revoked trusted device (ID: ${deviceId}) for user ${user.name}`,
      req
    );

    return successResponse(res, 200, 'Trusted device revoked successfully');
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
    // Audit logout time and calculate duration
    const latestLogin = await LoginHistory.findOne({
      user: req.user._id,
      success: true,
      logoutTime: null,
    }).sort({ time: -1 });

    if (latestLogin) {
      latestLogin.logoutTime = new Date();
      latestLogin.sessionDuration = Math.round((latestLogin.logoutTime - latestLogin.time) / 1000); // seconds
      await latestLogin.save();
    }

    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0),
    });

    await logActivity(req.user._id, req.user.name, 'User Logged Out', `Logged out and session terminated`, req);

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
