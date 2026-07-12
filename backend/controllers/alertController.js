import Alert from '../models/alertModel.js';
import Machine from '../models/machineModel.js';
import { successResponse } from '../utils/responseHandler.js';
import { logActivity } from '../utils/activityLogger.js';

// @desc    Get all alerts
// @route   GET /api/v1/alerts
// @access  Private
export const getAlerts = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'Farm Admin') {
      const myMachines = await Machine.find({ owner: req.user._id }).select('_id');
      const myMachineIds = myMachines.map(m => m._id);
      query = { machineId: { $in: myMachineIds } };
    }
    const alerts = await Alert.find(query).populate('machineId', 'name registration type');
    return successResponse(res, 200, 'Alerts retrieved successfully', alerts);
  } catch (error) {
    next(error);
  }
};

// @desc    Resolve an alert
// @route   PUT /api/v1/alerts/:id/resolve
// @access  Private (Admin, Farm Owner, Manager, Mechanic)
export const resolveAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      res.status(404);
      return next(new Error('Alert not found'));
    }

    if (req.user.role === 'Farm Admin' && alert.machineId) {
      const machine = await Machine.findById(alert.machineId);
      if (!machine || machine.owner.toString() !== req.user._id.toString()) {
        res.status(403);
        return next(new Error('Access denied. Assigned vehicle does not belong to your account.'));
      }
    }

    alert.status = 'Resolved';
    await alert.save();

    await logActivity(
      req.user._id,
      req.user.name,
      'Alert Resolved',
      `Resolved system alert: ${alert.type} - "${alert.message}"`,
      req
    );

    return successResponse(res, 200, 'Alert resolved successfully', alert);
  } catch (error) {
    next(error);
  }
};
