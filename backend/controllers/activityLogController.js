import ActivityLog from '../models/activityLogModel.js';
import { successResponse } from '../utils/responseHandler.js';

// @desc    Get all activity logs
// @route   GET /api/v1/activity-logs
// @access  Private (Admin, Farm Owner)
export const getActivityLogs = async (req, res, next) => {
  try {
    // Only return recent 100 logs to prevent overloading
    const logs = await ActivityLog.find({})
      .populate('user', 'name email role')
      .sort({ timestamp: -1 })
      .limit(100);

    return successResponse(res, 200, 'Activity logs retrieved successfully', logs);
  } catch (error) {
    next(error);
  }
};
