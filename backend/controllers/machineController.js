import Machine from '../models/machineModel.js';
import Driver from '../models/driverModel.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';
import { logActivity } from '../utils/activityLogger.js';

// @desc    Get all machines
// @route   GET /api/v1/machines
// @access  Private
export const getMachines = async (req, res, next) => {
  try {
    const machines = await Machine.find({}).populate('assignedDriverId', 'name phone');
    return successResponse(res, 200, 'Machines retrieved successfully', machines);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single machine
// @route   GET /api/v1/machines/:id
// @access  Private
export const getMachineById = async (req, res, next) => {
  try {
    const machine = await Machine.findById(req.params.id).populate('assignedDriverId', 'name phone');
    if (!machine) {
      res.status(404);
      return next(new Error('Machine not found'));
    }
    return successResponse(res, 200, 'Machine details retrieved successfully', machine);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new machine
// @route   POST /api/v1/machines
// @access  Private (Admin, Farm Owner, Manager)
export const createMachine = async (req, res, next) => {
  try {
    const { name, type, brand, model, registration, status, fuel, battery, assignedDriverId, location, nextService, currentAddress, photo, documents } = req.body;

    const existingMachine = await Machine.findOne({ registration });
    if (existingMachine) {
      res.status(400);
      return next(new Error('Machine with this registration number already exists'));
    }

    const machine = await Machine.create({
      name,
      type,
      brand,
      model,
      registration,
      status,
      fuel,
      battery,
      assignedDriverId: assignedDriverId || null,
      location,
      nextService,
      currentAddress,
      photo,
      documents,
    });

    // Relational update: If driver assigned, update driver too
    if (assignedDriverId) {
      await Driver.findByIdAndUpdate(assignedDriverId, { assignedMachineId: machine._id });
    }

    await logActivity(
      req.user._id,
      req.user.name,
      'Machine Added',
      `Registered new vehicle ${name} (${registration})`,
      req
    );

    return successResponse(res, 201, 'Machine created successfully', machine);
  } catch (error) {
    next(error);
  }
};

// @desc    Update machine
// @route   PUT /api/v1/machines/:id
// @access  Private (Admin, Farm Owner, Manager)
export const updateMachine = async (req, res, next) => {
  try {
    const machine = await Machine.findById(req.params.id);
    if (!machine) {
      res.status(404);
      return next(new Error('Machine not found'));
    }

    const oldDriverId = machine.assignedDriverId ? machine.assignedDriverId.toString() : null;
    const newDriverId = req.body.assignedDriverId || null;

    const updatedMachine = await Machine.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    // Relational update: handle driver assignments
    if (oldDriverId !== newDriverId) {
      // Remove assignment from old driver
      if (oldDriverId) {
        await Driver.findByIdAndUpdate(oldDriverId, { assignedMachineId: null });
      }
      // Add assignment to new driver
      if (newDriverId) {
        await Driver.findByIdAndUpdate(newDriverId, { assignedMachineId: updatedMachine._id });
      }
    }

    await logActivity(
      req.user._id,
      req.user.name,
      'Machine Updated',
      `Updated details for machine: ${updatedMachine.name}`,
      req
    );

    return successResponse(res, 200, 'Machine updated successfully', updatedMachine);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete machine
// @route   DELETE /api/v1/machines/:id
// @access  Private (Admin, Farm Owner)
export const deleteMachine = async (req, res, next) => {
  try {
    const machine = await Machine.findById(req.params.id);
    if (!machine) {
      res.status(404);
      return next(new Error('Machine not found'));
    }

    // Clear reference on driver if assigned
    if (machine.assignedDriverId) {
      await Driver.findByIdAndUpdate(machine.assignedDriverId, { assignedMachineId: null });
    }

    await Machine.findByIdAndDelete(req.params.id);

    await logActivity(
      req.user._id,
      req.user.name,
      'Machine Deleted',
      `Deleted machine: ${machine.name} (${machine.registration})`,
      req
    );

    return successResponse(res, 200, 'Machine deleted successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get live status/telemetry of all machines
// @route   GET /api/v1/machines/live-status
// @access  Private
export const getMachineLiveStatus = async (req, res, next) => {
  try {
    const machines = await Machine.find({}, 'name type status location speed heading engineStatus fuel workingHours distanceTravelled updatedAt')
      .populate('assignedDriverId', 'name phone');
    return successResponse(res, 200, 'Live status of all machines retrieved successfully', machines);
  } catch (error) {
    next(error);
  }
};
