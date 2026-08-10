import Driver from '../models/driverModel.js';
import Machine from '../models/machineModel.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';
import { logActivity } from '../utils/activityLogger.js';

// @desc    Get all drivers
// @route   GET /api/v1/drivers
// @access  Private
export const getDrivers = async (req, res, next) => {
  try {
    const query = req.user.role === 'Farm Admin' ? { owner: req.user._id } : {};
    const drivers = await Driver.find(query).populate('assignedMachineId', 'name registration');
    return successResponse(res, 200, 'Drivers retrieved successfully', drivers);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single driver
// @route   GET /api/v1/drivers/:id
// @access  Private
export const getDriverById = async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.params.id).populate('assignedMachineId', 'name registration');
    if (!driver) {
      res.status(404);
      return next(new Error('Driver not found'));
    }
    if (req.user.role === 'Farm Admin' && driver.owner.toString() !== req.user._id.toString()) {
      res.status(403);
      return next(new Error('Access denied. This driver does not belong to your account.'));
    }
    return successResponse(res, 200, 'Driver details retrieved successfully', driver);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new driver
// @route   POST /api/v1/drivers
// @access  Private (Admin, Farm Owner, Manager)
export const createDriver = async (req, res, next) => {
  try {
    const { name, phone, experience, rating, status, assignedMachineId, workingHoursToday, acresWorked, fuelEfficiency, attendance, photo, performanceData } = req.body;

    const owner = req.user.role === 'Farm Admin' ? req.user._id : req.body.owner;

    const driver = await Driver.create({
      name,
      owner,
      phone,
      experience,
      rating,
      status,
      assignedMachineId: assignedMachineId || null,
      workingHoursToday,
      acresWorked,
      fuelEfficiency,
      attendance,
      photo,
      performanceData,
    });

    // Relational update: If machine assigned, update machine's driver ID
    if (assignedMachineId) {
      await Machine.findByIdAndUpdate(assignedMachineId, { assignedDriverId: driver._id });
    }

    await logActivity(
      req.user._id,
      req.user.name,
      'Driver Added',
      `Registered driver: ${name}`,
      req
    );

    return successResponse(res, 201, 'Driver created successfully', driver);
  } catch (error) {
    next(error);
  }
};

// @desc    Update driver
// @route   PUT /api/v1/drivers/:id
// @access  Private (Admin, Farm Owner, Manager)
export const updateDriver = async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      res.status(404);
      return next(new Error('Driver not found'));
    }

    if (req.user.role === 'Farm Admin' && driver.owner.toString() !== req.user._id.toString()) {
      res.status(403);
      return next(new Error('Access denied. This driver does not belong to your account.'));
    }

    const oldMachineId = driver.assignedMachineId ? driver.assignedMachineId.toString() : null;
    const newMachineId = req.body.assignedMachineId || null;

    const updatedDriver = await Driver.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    // Relational update: handle machine assignments
    if (oldMachineId !== newMachineId) {
      // Remove assignment from old machine
      if (oldMachineId) {
        await Machine.findByIdAndUpdate(oldMachineId, { assignedDriverId: null });
      }
      // Add assignment to new machine
      if (newMachineId) {
        await Machine.findByIdAndUpdate(newMachineId, { assignedDriverId: updatedDriver._id });
      }
    }

    await logActivity(
      req.user._id,
      req.user.name,
      'Driver Updated',
      `Updated details for driver: ${updatedDriver.name}`,
      req
    );

    return successResponse(res, 200, 'Driver updated successfully', updatedDriver);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete driver
// @route   DELETE /api/v1/drivers/:id
// @access  Private (Admin, Farm Owner)
export const deleteDriver = async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      res.status(404);
      return next(new Error('Driver not found'));
    }

    if (req.user.role === 'Farm Admin' && driver.owner.toString() !== req.user._id.toString()) {
      res.status(403);
      return next(new Error('Access denied. This driver does not belong to your account.'));
    }

    // Clear reference on machine if assigned
    if (driver.assignedMachineId) {
      await Machine.findByIdAndUpdate(driver.assignedMachineId, { assignedDriverId: null });
    }

    await Driver.findByIdAndDelete(req.params.id);

    await logActivity(
      req.user._id,
      req.user.name,
      'Driver Deleted',
      `Deleted driver profile: ${driver.name}`,
      req
    );

    return successResponse(res, 200, 'Driver deleted successfully');
  } catch (error) {
    next(error);
  }
};
