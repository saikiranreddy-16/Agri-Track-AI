import Alert from '../models/alertModel.js';
import { successResponse } from '../utils/responseHandler.js';
import { logActivity } from '../utils/activityLogger.js';

// @desc    Get all alerts
// @route   GET /api/v1/alerts
// @access  Private
export const getAlerts = async (req, res, next) => {
  try {
    const alerts = await Alert.find({}).populate('machineId', 'name registration type');
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
