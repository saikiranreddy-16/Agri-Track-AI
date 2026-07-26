import User from '../models/userModel.js';
import Farm from '../models/farmModel.js';
import Machine from '../models/machineModel.js';
import GPSDevice from '../models/gpsDeviceModel.js';
import MobileChangeRequest from '../models/mobileChangeRequestModel.js';
import { State, District, Mandal, Village } from '../models/indiaLocationModel.js';
import CustomerLocationMapping from '../models/customerLocationMappingModel.js';
import CustomerDocument from '../models/customerDocumentModel.js';
import { successResponse } from '../utils/responseHandler.js';
import { logActivity } from '../utils/activityLogger.js';

export const getCustomers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    let filter = { role: 'Farm Admin' };

    // RBAC Scope Enforcement
    if (req.user && req.user.role === 'State Admin' && req.user.assignedState) {
      filter.state = req.user.assignedState;
    } else if (req.user && req.user.role === 'Master Admin' && req.user.assignedStates && req.user.assignedStates.length > 0) {
      filter.state = { $in: req.user.assignedStates };
    }
    
    if (search) {
      const matchOwnerIds = new Set();
      
      // 1. Search in Users (Name, Phone, Email)
      const usersMatched = await User.find({
        role: 'Farm Admin',
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      usersMatched.forEach(u => matchOwnerIds.add(u._id.toString()));

      // 2. Search in State / District
      const statesMatched = await State.find({ name: { $regex: search, $options: 'i' } }).select('_id');
      const districtsMatched = await District.find({ name: { $regex: search, $options: 'i' } }).select('_id');
      const stateIds = statesMatched.map(s => s._id);
      const districtIds = districtsMatched.map(d => d._id);
      
      if (stateIds.length > 0 || districtIds.length > 0) {
        const mappingsMatched = await CustomerLocationMapping.find({
          $or: [
            { state: { $in: stateIds } },
            { district: { $in: districtIds } }
          ]
        }).select('customer');
        mappingsMatched.forEach(m => m.customer && matchOwnerIds.add(m.customer.toString()));
      }

      // 3. Search in Machines (registration)
      const machinesMatched = await Machine.find({
        registration: { $regex: search, $options: 'i' }
      }).select('owner');
      machinesMatched.forEach(m => m.owner && matchOwnerIds.add(m.owner.toString()));

      // 4. Search in GPS Devices (deviceId, imei)
      const devicesMatched = await GPSDevice.find({
        $or: [
          { deviceId: { $regex: search, $options: 'i' } },
          { imei: { $regex: search, $options: 'i' } }
        ]
      }).select('owner');
      devicesMatched.forEach(d => d.owner && matchOwnerIds.add(d.owner.toString()));

      filter._id = { $in: Array.from(matchOwnerIds) };
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
      const activeDevicesCount = await GPSDevice.countDocuments({ owner: customer._id, activationStatus: 'Activated' });

      // Determine last login across trusted devices
      let lastLoginDate = null;
      if (customer.trustedDevices && customer.trustedDevices.length > 0) {
        const logins = customer.trustedDevices
          .filter(d => d.loginTime)
          .map(d => new Date(d.loginTime).getTime());
        if (logins.length > 0) {
          lastLoginDate = new Date(Math.max(...logins));
        }
      }

      const mapping = await CustomerLocationMapping.findOne({ customer: customer._id })
        .populate('state', 'name')
        .populate('district', 'name')
        .populate('mandal', 'name')
        .populate('village', 'name')
        .lean();

      customerDetails.push({
        _id: customer._id,
        name: customer.name,
        phone: customer.phone,
        alternatePhone: customer.alternatePhone || '',
        addressLine: customer.addressLine || '',
        aadhaarNumber: customer.aadhaarNumber || '',
        gstNumber: customer.gstNumber || '',
        planName: customer.planName || 'Standard',
        planStartDate: customer.planStartDate,
        planExpiryDate: customer.planExpiryDate,
        devicesAllowed: customer.devicesAllowed || 5,
        devicesUsed: customer.devicesUsed || 0,
        paymentStatus: customer.paymentStatus || 'Paid',
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
        location: mapping ? {
          state: mapping.state?._id,
          stateName: mapping.state?.name,
          district: mapping.district?._id,
          districtName: mapping.district?.name,
          mandal: mapping.mandal?._id,
          mandalName: mapping.mandal?.name,
          village: mapping.village?._id,
          villageName: mapping.village?.name,
          pincode: mapping.pincode,
          addressLine: mapping.addressLine
        } : null
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
    
    const mapping = await CustomerLocationMapping.findOne({ customer: customer._id })
      .populate('state', 'name')
      .populate('district', 'name')
      .populate('mandal', 'name')
      .populate('village', 'name')
      .lean();

    const documents = await CustomerDocument.find({ customerId: customer._id }).lean();

    return successResponse(res, 200, 'Customer details retrieved successfully', {
      customer: {
        ...customer,
        location: mapping ? {
          state: mapping.state?._id,
          stateName: mapping.state?.name,
          district: mapping.district?._id,
          districtName: mapping.district?.name,
          mandal: mapping.mandal?._id,
          mandalName: mapping.mandal?.name,
          village: mapping.village?._id,
          villageName: mapping.village?.name,
          pincode: mapping.pincode,
          addressLine: mapping.addressLine
        } : null,
        documents
      },
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

// @desc    Create customer (Company Admin only)
// @route   POST /api/v1/customers
// @access  Private (Company Admin only)
export const createCustomer = async (req, res, next) => {
  try {
    const {
      name, phone, alternatePhone, email, addressLine,
      state, district, mandal, village, pincode,
      aadhaarNumber, gstNumber, subscriptionPlan,
      planName, planExpiryDate, devicesAllowed, paymentStatus, status
    } = req.body;

    if (!name || !phone) {
      res.status(400);
      return next(new Error('Name and Phone number are required.'));
    }

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      res.status(400);
      return next(new Error('Customer with this mobile number already exists.'));
    }

    // Default password is set to password123
    const user = await User.create({
      name,
      phone,
      alternatePhone: alternatePhone || '',
      email: email || '',
      addressLine: addressLine || '',
      aadhaarNumber: aadhaarNumber || '',
      gstNumber: gstNumber || '',
      planName: planName || subscriptionPlan || 'Standard',
      planStartDate: new Date(),
      planExpiryDate: planExpiryDate ? new Date(planExpiryDate) : new Date(Date.now() + 365*24*60*60*1000),
      devicesAllowed: devicesAllowed || 5,
      devicesUsed: 0,
      paymentStatus: paymentStatus || 'Paid',
      password: 'password123',
      role: 'Farm Admin',
      subscriptionStatus: status || 'Active',
      subscriptionPlan: planName || subscriptionPlan || 'Standard',
      isFirstLogin: true,
    });

    if (state && district && mandal && village) {
      await CustomerLocationMapping.create({
        customer: user._id,
        state,
        district,
        mandal,
        village,
        pincode,
        addressLine: addressLine || ''
      });
    }

    await logActivity(
      req.user._id,
      req.user.name,
      'Customer Creation',
      `Created customer ${name} (Phone: ${phone})`,
      req
    );

    return successResponse(res, 201, 'Customer created successfully', user);
  } catch (error) {
    next(error);
  }
};

// @desc    Update customer (Company Admin only)
// @route   PUT /api/v1/customers/:id
// @access  Private (Company Admin only)
export const updateCustomer = async (req, res, next) => {
  try {
    const {
      name, phone, alternatePhone, email, addressLine,
      state, district, mandal, village, pincode,
      aadhaarNumber, gstNumber, subscriptionPlan,
      planName, planExpiryDate, devicesAllowed, paymentStatus, status
    } = req.body;

    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'Farm Admin') {
      res.status(404);
      return next(new Error('Customer not found.'));
    }

    // Save previous phone number to history if phone changed
    if (phone && phone !== user.phone) {
      user.phoneHistory.push({
        phone: user.phone,
        changedAt: new Date(),
        changedBy: req.user._id,
      });
      user.phone = phone;
    }

    user.name = name || user.name;
    user.alternatePhone = alternatePhone !== undefined ? alternatePhone : user.alternatePhone;
    user.email = email !== undefined ? email : user.email;
    user.addressLine = addressLine !== undefined ? addressLine : user.addressLine;
    user.aadhaarNumber = aadhaarNumber !== undefined ? aadhaarNumber : user.aadhaarNumber;
    user.gstNumber = gstNumber !== undefined ? gstNumber : user.gstNumber;
    user.planName = planName || subscriptionPlan || user.planName;
    user.subscriptionPlan = planName || subscriptionPlan || user.subscriptionPlan;
    if (planExpiryDate) user.planExpiryDate = new Date(planExpiryDate);
    if (devicesAllowed !== undefined) user.devicesAllowed = devicesAllowed;
    if (paymentStatus) user.paymentStatus = paymentStatus;
    if (status) user.subscriptionStatus = status;

    await user.save();

    if (state && district && mandal && village) {
      await CustomerLocationMapping.findOneAndUpdate(
        { customer: user._id },
        { state, district, mandal, village, pincode, addressLine: addressLine || '' },
        { upsert: true, new: true }
      );
    }

    await logActivity(
      req.user._id,
      req.user.name,
      'Customer Update',
      `Updated customer details for ${user.name}`,
      req
    );

    return successResponse(res, 200, 'Customer details updated successfully', user);
  } catch (error) {
    next(error);
  }
};

// @desc    Upload customer document
// @route   POST /api/v1/customers/:id/documents
// @access  Private (Company Admin only)
export const uploadCustomerDocument = async (req, res, next) => {
  try {
    const { documentType, fileName, filePath } = req.body;
    if (!documentType || !fileName || !filePath) {
      res.status(400);
      return next(new Error('documentType, fileName, and filePath are required.'));
    }

    const customer = await User.findById(req.params.id);
    if (!customer || customer.role !== 'Farm Admin') {
      res.status(404);
      return next(new Error('Customer not found.'));
    }

    const doc = await CustomerDocument.create({
      customerId: customer._id,
      documentType,
      fileName,
      filePath,
    });

    await logActivity(
      req.user._id,
      req.user.name,
      'Document Upload',
      `Uploaded ${documentType} document for customer: ${customer.name}`,
      req
    );

    return successResponse(res, 201, 'Customer document uploaded successfully', doc);
  } catch (error) {
    next(error);
  }
};

// @desc    Get India states
// @route   GET /api/v1/customers/locations/states
// @access  Private (Authenticated)
export const getStates = async (req, res, next) => {
  try {
    const states = await State.find({}).sort({ name: 1 }).lean();
    return successResponse(res, 200, 'States retrieved successfully', states);
  } catch (error) {
    next(error);
  }
};

// @desc    Get districts by state
// @route   GET /api/v1/customers/locations/districts
// @access  Private (Authenticated)
export const getDistricts = async (req, res, next) => {
  try {
    const { stateId } = req.query;
    const filter = stateId ? { state: stateId } : {};
    const districts = await District.find(filter).sort({ name: 1 }).lean();
    return successResponse(res, 200, 'Districts retrieved successfully', districts);
  } catch (error) {
    next(error);
  }
};

// @desc    Get mandals by district
// @route   GET /api/v1/customers/locations/mandals
// @access  Private (Authenticated)
export const getMandals = async (req, res, next) => {
  try {
    const { districtId } = req.query;
    const filter = districtId ? { district: districtId } : {};
    const mandals = await Mandal.find(filter).sort({ name: 1 }).lean();
    return successResponse(res, 200, 'Mandals retrieved successfully', mandals);
  } catch (error) {
    next(error);
  }
};

// @desc    Get villages by mandal
// @route   GET /api/v1/customers/locations/villages
// @access  Private (Authenticated)
export const getVillages = async (req, res, next) => {
  try {
    const { mandalId } = req.query;
    const filter = mandalId ? { mandal: mandalId } : {};
    const villages = await Village.find(filter).sort({ name: 1 }).lean();
    return successResponse(res, 200, 'Villages retrieved successfully', villages);
  } catch (error) {
    next(error);
  }
};
