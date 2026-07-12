import Maintenance from '../models/maintenanceModel.js';
import Machine from '../models/machineModel.js';
import { successResponse } from '../utils/responseHandler.js';
import { logActivity } from '../utils/activityLogger.js';

// @desc    Get all maintenance records
// @route   GET /api/v1/maintenance
// @access  Private
export const getMaintenanceRecords = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'Farm Admin') {
      const myMachines = await Machine.find({ owner: req.user._id }).select('_id');
      const myMachineIds = myMachines.map(m => m._id);
      query = { machineId: { $in: myMachineIds } };
    }
    const records = await Maintenance.find(query).populate('machineId', 'name registration type');
    return successResponse(res, 200, 'Maintenance logs retrieved successfully', records);
  } catch (error) {
    next(error);
  }
};

// @desc    Create maintenance task
// @route   POST /api/v1/maintenance
// @access  Private (Admin, Farm Owner, Manager, Mechanic)
export const createMaintenanceRecord = async (req, res, next) => {
  try {
    const { machineId, task, date, priority, type, status, mechanic, cost, notes } = req.body;

    if (req.user.role === 'Farm Admin' && machineId) {
      const machine = await Machine.findById(machineId);
      if (!machine || machine.owner.toString() !== req.user._id.toString()) {
        res.status(403);
        return next(new Error('Access denied. Assigned vehicle does not belong to your account.'));
      }
    }

    const record = await Maintenance.create({
      machineId,
      task,
      date,
      priority,
      type,
      status,
      mechanic,
      cost,
      notes,
    });

    // Optionally update machine status to Maintenance if it's being serviced now
    if (status === 'Completed' || status === 'Upcoming') {
      await logActivity(
        req.user._id,
        req.user.name,
        'Maintenance Scheduled',
        `Registered maintenance task: "${task}" for machine ID ${machineId}`,
        req
      );
    }

    return successResponse(res, 201, 'Maintenance record created successfully', record);
  } catch (error) {
    next(error);
  }
};

// @desc    Update maintenance task details
// @route   PUT /api/v1/maintenance/:id
// @access  Private (Admin, Farm Owner, Manager, Mechanic)
export const updateMaintenanceRecord = async (req, res, next) => {
  try {
    const record = await Maintenance.findById(req.params.id);
    if (!record) {
      res.status(404);
      return next(new Error('Maintenance record not found'));
    }

    if (req.user.role === 'Farm Admin' && record.machineId) {
      const machine = await Machine.findById(record.machineId);
      if (!machine || machine.owner.toString() !== req.user._id.toString()) {
        res.status(403);
        return next(new Error('Access denied. Assigned vehicle does not belong to your account.'));
      }
    }

    const updatedRecord = await Maintenance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    // If completed, update machine status to Idle/Working and log activity
    if (req.body.status === 'Completed' && record.status !== 'Completed') {
      await logActivity(
        req.user._id,
        req.user.name,
        'Maintenance Completed',
        `Finished servicing task: "${updatedRecord.task}" (Cost: INR ${updatedRecord.cost || 0})`,
        req
      );
    } else {
      await logActivity(
        req.user._id,
        req.user.name,
        'Maintenance Updated',
        `Updated details for servicing task: "${updatedRecord.task}"`,
        req
      );
    }

    return successResponse(res, 200, 'Maintenance record updated successfully', updatedRecord);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete maintenance task
// @route   DELETE /api/v1/maintenance/:id
// @access  Private (Admin, Farm Owner)
export const deleteMaintenanceRecord = async (req, res, next) => {
  try {
    const record = await Maintenance.findById(req.params.id);
    if (!record) {
      res.status(404);
      return next(new Error('Maintenance record not found'));
    }

    if (req.user.role === 'Farm Admin' && record.machineId) {
      const machine = await Machine.findById(record.machineId);
      if (!machine || machine.owner.toString() !== req.user._id.toString()) {
        res.status(403);
        return next(new Error('Access denied. Assigned vehicle does not belong to your account.'));
      }
    }

    await Maintenance.findByIdAndDelete(req.params.id);

    await logActivity(
      req.user._id,
      req.user.name,
      'Maintenance Deleted',
      `Deleted servicing record: "${record.task}"`,
      req
    );

    return successResponse(res, 200, 'Maintenance record deleted successfully');
  } catch (error) {
    next(error);
  }
};
