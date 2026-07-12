import User from '../models/userModel.js';
import Farm from '../models/farmModel.js';
import Machine from '../models/machineModel.js';
import GPSDevice from '../models/gpsDeviceModel.js';
import { successResponse } from '../utils/responseHandler.js';
import { logActivity } from '../utils/activityLogger.js';

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
  } = req.body;

  try {
    // 1. Validation rules
    // Validate deviceId must not already be linked
    const existingDevice = await GPSDevice.findOne({ deviceId, status: 'Active' });
    if (existingDevice) {
      res.status(400);
      return next(new Error('This GPS Device ID is already active and linked to a vehicle.'));
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
      // Generate a secure random 6-digit PIN
      generatedPin = Math.floor(100000 + Math.random() * 900000).toString();
      
      user = await User.create({
        name: customerName,
        phone: mobileNumber,
        password: generatedPin, // Hashing is handled by user pre-save hook
        role: 'Farm Admin',
        subscriptionStatus: subscriptionStatus || 'Active',
        isFirstLogin: true,
      });
    }

    // 3. Find or Create Farm (Allow multiple farms under one customer)
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
      owner: user._id,
      status: 'Active',
    });

    // 5. Create Vehicle (Machine)
    const machine = await Machine.create({
      name: displayName,
      type: vehicleType,
      registration: chassisNumber, // For backward compatibility with existing routes
      chassisNumber,
      gpsDeviceId: gpsDevice._id,
      farmId: farm._id,
      owner: user._id,
      status: 'Offline', // default status
      location: { lat: 30.902, lng: 75.853 }, // Ludhiana, Punjab area
    });

    // 6. Link vehicleId back to GPS device
    gpsDevice.vehicleId = machine._id;
    await gpsDevice.save();

    await logActivity(
      req.user._id,
      req.user.name,
      'Device Activated',
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
    const existingDevice = await GPSDevice.findOne({ deviceId: newDeviceId, status: 'Active' });
    if (existingDevice) {
      res.status(400);
      return next(new Error('The new GPS Device ID is already active on another vehicle.'));
    }

    // 3. Find and Deactivate Old GPS Device(s) linked to this vehicle
    const oldDevices = await GPSDevice.find({ vehicleId, status: 'Active' });
    for (const oldDevice of oldDevices) {
      oldDevice.status = 'Inactive';
      oldDevice.deactivationReason = reason || 'Warranty Replacement';
      oldDevice.deactivatedAt = new Date();
      await oldDevice.save();
    }

    // 4. Create and link new GPS Device
    const newGpsDevice = await GPSDevice.create({
      deviceId: newDeviceId,
      status: 'Active',
      vehicleId: vehicle._id,
      owner: vehicle.owner,
    });

    // 5. Update Vehicle reference
    vehicle.gpsDeviceId = newGpsDevice._id;
    await vehicle.save();

    await logActivity(
      req.user._id,
      req.user.name,
      'Device Replaced',
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
