import User from '../models/userModel.js';
import Farm from '../models/farmModel.js';
import Machine from '../models/machineModel.js';
import GPSDevice from '../models/gpsDeviceModel.js';
import { successResponse } from '../utils/responseHandler.js';
import { logActivity } from '../utils/activityLogger.js';

// @desc    Get all customers with aggregate details
// @route   GET /api/v1/customers
// @access  Private (Company Admin only)
export const getCustomers = async (req, res, next) => {
  try {
    const users = await User.find({ role: 'Farm Admin' }).lean();

    const customerDetails = [];

    for (const customer of users) {
      const farmsCount = await Farm.countDocuments({ owner: customer._id });
      const vehiclesCount = await Machine.countDocuments({ owner: customer._id });
      const activeDevicesCount = await GPSDevice.countDocuments({ owner: customer._id, status: 'Active' });

      // Determine last login across trusted devices
      let lastLoginDate = null;
      if (customer.trustedDevices && customer.trustedDevices.length > 0) {
        const logins = customer.trustedDevices.map(d => new Date(d.lastLogin).getTime());
        lastLoginDate = new Date(Math.max(...logins));
      }

      customerDetails.push({
        _id: customer._id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email || 'N/A',
        subscriptionStatus: customer.subscriptionStatus || 'Active',
        subscriptionPlan: customer.subscriptionPlan || 'Standard',
        trustedDevices: customer.trustedDevices || [],
        farmsCount,
        vehiclesCount,
        activeDevicesCount,
        lastLogin: lastLoginDate || customer.updatedAt,
        createdAt: customer.createdAt,
      });
    }

    return successResponse(res, 200, 'Customers retrieved successfully', customerDetails);
  } catch (error) {
    next(error);
  }
};

// @desc    Reset a customer's PIN password
// @route   POST /api/v1/customers/:id/reset-password
// @access  Private (Company Admin only)
export const resetCustomerPassword = async (req, res, next) => {
  try {
    const customer = await User.findById(req.params.id);
    if (!customer) {
      res.status(404);
      return next(new Error('Customer not found.'));
    }

    // Generate random secure 6-digit PIN
    const newPin = Math.floor(100000 + Math.random() * 900000).toString();
    customer.password = newPin; // Hashing is handled by user schema save hook
    customer.isFirstLogin = true;
    await customer.save();

    await logActivity(
      req.user._id,
      req.user.name,
      'Customer PIN Reset',
      `Reset security PIN code for customer: ${customer.name} (Phone: ${customer.phone})`,
      req
    );

    return successResponse(res, 200, 'Customer PIN reset successfully', {
      newPin,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset all trusted devices of a customer
// @route   POST /api/v1/customers/:id/reset-trusted
// @access  Private (Company Admin only)
export const resetTrustedDevices = async (req, res, next) => {
  try {
    const customer = await User.findById(req.params.id);
    if (!customer) {
      res.status(404);
      return next(new Error('Customer not found.'));
    }

    customer.trustedDevices = [];
    await customer.save();

    await logActivity(
      req.user._id,
      req.user.name,
      'Customer Trusted Devices Reset',
      `Cleared all registered trusted login devices for customer: ${customer.name}`,
      req
    );

    return successResponse(res, 200, 'All trusted devices cleared successfully for customer.');
  } catch (error) {
    next(error);
  }
};
