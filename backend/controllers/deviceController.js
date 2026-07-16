import User from '../models/userModel.js';
import Farm from '../models/farmModel.js';
import Machine from '../models/machineModel.js';
import GPSDevice from '../models/gpsDeviceModel.js';
import DeviceReplacementHistory from '../models/deviceReplacementHistoryModel.js';
import { successResponse } from '../utils/responseHandler.js';
import { logActivity } from '../utils/activityLogger.js';

// @desc    Get all GPS Devices (filtered by ownership)
// @route   GET /api/v1/devices
// @access  Private
export const getDevices = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    let query = {};
    
    if (req.user.role === 'Farm Admin') {
      query.owner = req.user._id;
    } else {
      if (status) {
        query.activationStatus = status; // e.g. Activated or Deactivated
      }
      if (search) {
        query.$or = [
          { deviceId: { $regex: search, $options: 'i' } },
          { imei: { $regex: search, $options: 'i' } },
          { simNumber: { $regex: search, $options: 'i' } },
        ];
      }
    }

    const count = await GPSDevice.countDocuments(query);
    const devices = await GPSDevice.find(query)
      .populate('currentVehicle', 'name registration type')
      .populate('owner', 'name phone email')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(res, 200, 'GPS Devices retrieved successfully', devices, {
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(count / limit),
      totalResults: count
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single GPS Device details
// @route   GET /api/v1/devices/:id
// @access  Private
export const getDeviceById = async (req, res, next) => {
  try {
    const device = await GPSDevice.findById(req.params.id).populate('currentVehicle', 'name registration type');
    if (!device) {
      res.status(404);
      return next(new Error('GPS Device not found'));
    }

    if (req.user.role === 'Farm Admin' && device.owner.toString() !== req.user._id.toString()) {
      res.status(403);
      return next(new Error('Access denied. This device does not belong to your account.'));
    }

    return successResponse(res, 200, 'GPS Device details retrieved successfully', device);
  } catch (error) {
    next(error);
  }
};

// @desc    Activate a new GPS Device
// @route   POST /api/v1/devices/activate
// @access  Private (Company Admin only)
export const activateDevice = async (req, res, next) => {
  const {
    customerName,
    mobileNumber,
    farmName,
    vehicleType,
    displayName,
    chassisNumber,
    deviceId,
    subscriptionStatus,
    imei,
    simNumber,
    qrCode,
    firmwareVersion,
    hardwareVersion,
    manufacturingDate,
    warrantyExpiry,
  } = req.body;

  try {
    // 1. Validation rules
    const existingDevice = await GPSDevice.findOne({ deviceId, isDeleted: { $in: [true, false] } });
    if (existingDevice) {
      res.status(400);
      return next(new Error('This GPS Device ID is already registered in the platform.'));
    }

    // Validate Chassis Number must not already be linked
    const existingMachine = await Machine.findOne({ chassisNumber });
    if (existingMachine) {
      res.status(400);
      return next(new Error('This Vehicle Chassis Number is already registered in the platform.'));
    }

    // 2. Find or Create User (Customer)
    let user = await User.findOne({ phone: mobileNumber });
    let isNewUser = false;
    let generatedPin = '';

    if (!user) {
      isNewUser = true;
      generatedPin = Math.floor(100000 + Math.random() * 900000).toString();
      
      user = await User.create({
        name: customerName,
        phone: mobileNumber,
        password: generatedPin,
        role: 'Farm Admin',
        subscriptionStatus: subscriptionStatus || 'Active',
        isFirstLogin: true,
      });

      await logActivity(
        req.user._id,
        req.user.name,
        'Customer Creation',
        `Registered customer ${customerName} (Phone: ${mobileNumber})`,
        req
      );
    }

    // 3. Find or Create Farm
    let farm = await Farm.findOne({ name: farmName, owner: user._id });
    if (!farm) {
      farm = await Farm.create({
        name: farmName,
        owner: user._id,
      });
    }

    // 4. Create independent GPS Device
    const gpsDevice = await GPSDevice.create({
      deviceId,
      imei: imei || `imei-${deviceId}`,
      simNumber: simNumber || '',
      qrCode: qrCode || `qr-${deviceId}`,
      firmwareVersion: firmwareVersion || '1.0.0',
      hardwareVersion: hardwareVersion || '1.0.0',
      manufacturingDate: manufacturingDate || new Date(),
      installationDate: new Date(),
      warrantyExpiry: warrantyExpiry || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      activationStatus: 'Activated',
      currentStatus: 'Offline',
      deviceHealth: 'Good',
      owner: user._id,
      status: 'Active',
    });

    // 5. Create Vehicle (Machine)
    const machine = await Machine.create({
      name: displayName,
      type: vehicleType,
      registration: chassisNumber,
      chassisNumber,
      gpsDeviceId: gpsDevice._id,
      farmId: farm._id,
      owner: user._id,
      status: 'Offline',
      location: { lat: 30.902, lng: 75.853 },
      healthScore: 100,
    });

    // 6. Link vehicleId back to GPS device
    gpsDevice.currentVehicle = machine._id;
    gpsDevice.vehicleId = machine._id;
    await gpsDevice.save();

    await logActivity(
      req.user._id,
      req.user.name,
      'Device Activation',
      `Activated Device ID ${deviceId} on vehicle ${displayName} (Chassis: ${chassisNumber}) for customer ${customerName}`,
      req
    );

    return successResponse(res, 201, 'GPS Device activated successfully', {
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        isNewUser,
        generatedPin: isNewUser ? generatedPin : undefined,
      },
      farm,
      gpsDevice,
      machine,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Replace a damaged GPS Device
// @route   POST /api/v1/devices/replace
// @access  Private (Company Admin only)
export const replaceDevice = async (req, res, next) => {
  const { vehicleId, newDeviceId, reason } = req.body;

  try {
    // 1. Find Vehicle
    const vehicle = await Machine.findById(vehicleId);
    if (!vehicle) {
      res.status(404);
      return next(new Error('Vehicle not found.'));
    }

    // 2. Validate New Device ID is not already active
    const existingDevice = await GPSDevice.findOne({ deviceId: newDeviceId, isDeleted: { $in: [true, false] } });
    if (existingDevice) {
      res.status(400);
      return next(new Error('The new GPS Device ID is already registered in the platform.'));
    }

    // 3. Find and Deactivate Old GPS Device(s) linked to this vehicle
    const oldDevices = await GPSDevice.find({ 
      $or: [{ vehicleId: vehicle._id }, { currentVehicle: vehicle._id }], 
      activationStatus: 'Activated' 
    });

    let replacementCount = 0;
    for (const oldDevice of oldDevices) {
      replacementCount = Math.max(replacementCount, oldDevice.replacementCount || 0);

      // Archive parameters in Device Replacement History
      await DeviceReplacementHistory.create({
        oldDeviceId: oldDevice.deviceId,
        newDeviceId,
        replacementDate: new Date(),
        replacementReason: reason || 'Hardware Failure',
        companyAdmin: req.user._id,
        previousFirmware: oldDevice.firmwareVersion || '1.0.0',
        previousSim: oldDevice.simNumber || 'Unknown',
        previousVehicle: vehicle._id,
      });

      // Update old device status (Archived)
      oldDevice.activationStatus = 'Deactivated';
      oldDevice.currentStatus = 'Inactive';
      oldDevice.status = 'Inactive'; // backward compatibility
      oldDevice.deactivationReason = reason || 'Warranty Replacement';
      oldDevice.deactivatedAt = new Date();
      oldDevice.previousVehicle = vehicle._id;
      oldDevice.currentVehicle = null;
      oldDevice.vehicleId = null; // backward compatibility
      await oldDevice.save();
    }

    // Increment replacement count for vehicle swap
    const nextReplacementCount = replacementCount + 1;

    // 4. Create and link new GPS Device
    const newGpsDevice = await GPSDevice.create({
      deviceId: newDeviceId,
      imei: `imei-${newDeviceId}`,
      simNumber: 'Unknown',
      qrCode: `qr-${newDeviceId}`,
      firmwareVersion: '1.0.0',
      hardwareVersion: '1.0.0',
      manufacturingDate: new Date(),
      installationDate: new Date(),
      warrantyExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      activationStatus: 'Activated',
      currentStatus: 'Offline',
      status: 'Active', // backward compatibility
      currentVehicle: vehicle._id,
      vehicleId: vehicle._id, // backward compatibility
      owner: vehicle.owner,
      replacementCount: nextReplacementCount,
    });

    // 5. Update Vehicle reference
    vehicle.gpsDeviceId = newGpsDevice._id;
    await vehicle.save();

    await logActivity(
      req.user._id,
      req.user.name,
      'Device Replacement',
      `Replaced GPS hardware on vehicle ${vehicle.name}. New Device ID: ${newDeviceId}. Reason: ${reason}`,
      req
    );

    return successResponse(res, 200, 'GPS hardware replaced successfully. Historical records preserved.', {
      vehicle,
      newGpsDevice,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Soft Delete a GPS Device
// @route   DELETE /api/v1/devices/:id
// @access  Private (Company Admin only)
export const deleteDevice = async (req, res, next) => {
  try {
    const device = await GPSDevice.findById(req.params.id);
    if (!device) {
      res.status(404);
      return next(new Error('GPS Device not found'));
    }

    // Soft delete the device
    device.isDeleted = true;
    device.deletedAt = new Date();
    device.deletedBy = req.user._id;
    await device.save();

    // Disconnect vehicle link if active
    if (device.currentVehicle) {
      await Machine.findByIdAndUpdate(device.currentVehicle, { $set: { gpsDeviceId: null } });
    }

    await logActivity(
      req.user._id,
      req.user.name,
      'Settings Update',
      `Soft deleted GPS device (ID: ${device.deviceId})`,
      req
    );

    return successResponse(res, 200, 'GPS Device soft deleted successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get device replacement history
// @route   GET /api/v1/devices/replacement-history
// @access  Private (Company Admin only)
export const getReplacementHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    let query = {};
    if (search) {
      query.$or = [
        { oldDeviceId: { $regex: search, $options: 'i' } },
        { newDeviceId: { $regex: search, $options: 'i' } },
        { replacementReason: { $regex: search, $options: 'i' } },
      ];
    }
    const count = await DeviceReplacementHistory.countDocuments(query);
    const history = await DeviceReplacementHistory.find(query)
      .populate('companyAdmin', 'name email')
      .populate('previousVehicle', 'name registration')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ replacementDate: -1 })
      .lean();

    return successResponse(res, 200, 'Device replacement history retrieved successfully', history, {
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(count / limit),
      totalResults: count
    });
  } catch (error) {
    next(error);
  }
};
