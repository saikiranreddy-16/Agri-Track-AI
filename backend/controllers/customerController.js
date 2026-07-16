import User from '../models/userModel.js';
import Farm from '../models/farmModel.js';
import Machine from '../models/machineModel.js';
import GPSDevice from '../models/gpsDeviceModel.js';
import MobileChangeRequest from '../models/mobileChangeRequestModel.js';
import { successResponse } from '../utils/responseHandler.js';
import { logActivity } from '../utils/activityLogger.js';

// @desc    Get all customers with aggregate details
// @route   GET /api/v1/customers
// @access  Private (Company Admin only)
export const getCustomers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    let filter = { role: 'Farm Admin' };
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const count = await User.countDocuments(filter);
    const users = await User.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 })
      .lean();

    const customerDetails = [];

    for (const customer of users) {
      const farmsCount = await Farm.countDocuments({ owner: customer._id });
      const vehiclesCount = await Machine.countDocuments({ owner: customer._id });
      const activeDevicesCount = await GPSDevice.countDocuments({ owner: customer._id, status: 'Active' });

      // Determine last login across trusted devices
      let lastLoginDate = null;
      if (customer.trustedDevices && customer.trustedDevices.length > 0) {
        const logins = customer.trustedDevices
          .filter(d => d.lastLogin)
          .map(d => new Date(d.lastLogin).getTime());
        if (logins.length > 0) {
          lastLoginDate = new Date(Math.max(...logins));
        }
      }

      customerDetails.push({
        _id: customer._id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email || 'N/A',
        subscriptionStatus: customer.subscriptionStatus || 'Active',
        subscriptionPlan: customer.subscriptionPlan || 'Standard',
        trustedDevices: customer.trustedDevices || [],
        phoneHistory: customer.phoneHistory || [],
        farmsCount,
        vehiclesCount,
        activeDevicesCount,
        lastLogin: lastLoginDate || customer.updatedAt,
        createdAt: customer.createdAt,
      });
    }

    return successResponse(res, 200, 'Customers retrieved successfully', customerDetails, {
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(count / limit),
      totalResults: count
    });
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
      'Settings Update',
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
      'Settings Update',
      `Cleared all registered trusted login devices for customer: ${customer.name}`,
      req
    );

    return successResponse(res, 200, 'All trusted devices cleared successfully for customer.');
  } catch (error) {
    next(error);
  }
};

// @desc    Soft Delete a Customer (cascades soft-delete to farms, machines, and devices)
// @route   DELETE /api/v1/customers/:id
// @access  Private (Company Admin only)
export const deleteCustomer = async (req, res, next) => {
  try {
    const customer = await User.findById(req.params.id);
    if (!customer || customer.role !== 'Farm Admin') {
      res.status(404);
      return next(new Error('Customer not found.'));
    }

    // Soft delete the customer
    customer.isDeleted = true;
    customer.deletedAt = new Date();
    customer.deletedBy = req.user._id;
    await customer.save();

    const timestamp = new Date();

    // Cascade Soft Delete to Farms
    await Farm.updateMany(
      { owner: customer._id },
      { $set: { isDeleted: true, deletedAt: timestamp, deletedBy: req.user._id } }
    );

    // Cascade Soft Delete to Vehicles
    await Machine.updateMany(
      { owner: customer._id },
      { $set: { isDeleted: true, deletedAt: timestamp, deletedBy: req.user._id } }
    );

    // Cascade Soft Delete to GPS Devices
    await GPSDevice.updateMany(
      { owner: customer._id },
      { $set: { isDeleted: true, deletedAt: timestamp, deletedBy: req.user._id } }
    );

    await logActivity(
      req.user._id,
      req.user.name,
      'Settings Update',
      `Soft deleted customer ${customer.name} (Phone: ${customer.phone}) and archived associated farms, vehicles, and tracking hardware.`,
      req
    );

    return successResponse(res, 200, 'Customer and all associated data soft deleted successfully.');
  } catch (error) {
    next(error);
  }
};

// @desc    Submit a request to change mobile number
// @route   POST /api/v1/customers/mobile-change-request
// @access  Private (Farm Admin only)
export const requestMobileChange = async (req, res, next) => {
  const { newMobile } = req.body;

  if (!newMobile || !newMobile.trim()) {
    res.status(400);
    return next(new Error('New mobile number is required.'));
  }

  try {
    // Enforce role
    if (req.user.role !== 'Farm Admin') {
      res.status(403);
      return next(new Error('Only Farm Admins can request mobile number changes.'));
    }

    // Check if there is already a pending request
    const existingRequest = await MobileChangeRequest.findOne({ userId: req.user._id, status: 'Pending' });
    if (existingRequest) {
      res.status(400);
      return next(new Error('You already have a pending mobile number change request.'));
    }

    const request = await MobileChangeRequest.create({
      userId: req.user._id,
      currentMobile: req.user.phone,
      requestedMobile: newMobile,
      status: 'Pending',
      requestedAt: new Date(),
    });

    await logActivity(
      req.user._id,
      req.user.name,
      'Settings Update',
      `Submitted mobile change request from ${req.user.phone} to ${newMobile}`,
      req
    );

    return successResponse(res, 201, 'Mobile number change request submitted successfully', request);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all mobile number change requests
// @route   GET /api/v1/customers/mobile-change-requests
// @access  Private (Company Admin only)
export const getMobileChangeRequests = async (req, res, next) => {
  try {
    const requests = await MobileChangeRequest.find({}).populate('userId', 'name phone email role');
    return successResponse(res, 200, 'Mobile change requests retrieved successfully', requests);
  } catch (error) {
    next(error);
  }
};

// @desc    Approve mobile number change request
// @route   POST /api/v1/customers/mobile-change-requests/:id/approve
// @access  Private (Company Admin only)
export const approveMobileChange = async (req, res, next) => {
  try {
    const request = await MobileChangeRequest.findById(req.params.id);
    if (!request) {
      res.status(404);
      return next(new Error('Mobile change request not found.'));
    }

    if (request.status !== 'Pending') {
      res.status(400);
      return next(new Error(`Request is already ${request.status.toLowerCase()}.`));
    }

    const user = await User.findById(request.userId);
    if (!user) {
      res.status(404);
      return next(new Error('Associated customer account not found.'));
    }

    // Save previous phone number to history
    user.phoneHistory.push({
      phone: user.phone,
      changedAt: new Date(),
      changedBy: req.user._id,
    });

    // Update phone number
    user.phone = request.requestedMobile;
    await user.save();

    // Update request details
    request.status = 'Approved';
    request.approvedAt = new Date();
    request.approvedBy = req.user._id;
    await request.save();

    await logActivity(
      req.user._id,
      req.user.name,
      'Settings Update',
      `Approved mobile change request for ${user.name}. Updated phone from ${request.currentMobile} to ${request.requestedMobile}`,
      req
    );

    return successResponse(res, 200, 'Mobile change request approved and phone number updated successfully.', {
      user,
      request,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject mobile number change request
// @route   POST /api/v1/customers/mobile-change-requests/:id/reject
// @access  Private (Company Admin only)
export const rejectMobileChange = async (req, res, next) => {
  const { reason } = req.body;

  try {
    const request = await MobileChangeRequest.findById(req.params.id);
    if (!request) {
      res.status(404);
      return next(new Error('Mobile change request not found.'));
    }

    if (request.status !== 'Pending') {
      res.status(400);
      return next(new Error(`Request is already ${request.status.toLowerCase()}.`));
    }

    request.status = 'Rejected';
    request.approvedAt = new Date();
    request.approvedBy = req.user._id;
    request.rejectionReason = reason || 'Rejected by administrator';
    await request.save();

    const user = await User.findById(request.userId);
    const customerName = user ? user.name : 'Unknown';

    await logActivity(
      req.user._id,
      req.user.name,
      'Settings Update',
      `Rejected mobile change request for ${customerName} (from ${request.currentMobile} to ${request.requestedMobile}). Reason: ${request.rejectionReason}`,
      req
    );

    return successResponse(res, 200, 'Mobile change request rejected.', request);
  } catch (error) {
    next(error);
  }
};

// @desc    Get customer details
// @route   GET /api/v1/customers/:id
// @access  Private (Company Admin only)
export const getCustomerDetails = async (req, res, next) => {
  try {
    const customer = await User.findById(req.params.id).lean();
    if (!customer || customer.role !== 'Farm Admin') {
      res.status(404);
      return next(new Error('Customer not found.'));
    }

    const farms = await Farm.find({ owner: customer._id }).lean();
    const vehicles = await Machine.find({ owner: customer._id }).lean();
    const devices = await GPSDevice.find({ owner: customer._id }).lean();

    return successResponse(res, 200, 'Customer details retrieved successfully', {
      customer,
      farms,
      vehicles,
      devices,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get customer vehicles (paginated and searchable)
// @route   GET /api/v1/customers/:id/vehicles
// @access  Private (Company Admin only)
export const getCustomerVehicles = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    let filter = { owner: req.params.id };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } },
        { registration: { $regex: search, $options: 'i' } },
        { chassisNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const count = await Machine.countDocuments(filter);
    const vehicles = await Machine.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(res, 200, 'Customer vehicles retrieved successfully', vehicles, {
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(count / limit),
      totalResults: count,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get customer farms (paginated and searchable)
// @route   GET /api/v1/customers/:id/farms
// @access  Private (Company Admin only)
export const getCustomerFarms = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    let filter = { owner: req.params.id };

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const count = await Farm.countDocuments(filter);
    const farms = await Farm.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(res, 200, 'Customer farms retrieved successfully', farms, {
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(count / limit),
      totalResults: count,
    });
  } catch (error) {
    next(error);
  }
};
