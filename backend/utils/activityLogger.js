import ActivityLog from '../models/activityLogModel.js';

/**
 * Logs an activity to the database.
 * @param {string|null} userId - The user ID who performed the action.
 * @param {string} userName - The name of the user who performed the action.
 * @param {string} action - The action type (e.g. 'User Logged In', 'Machine Added').
 * @param {string} details - Additional descriptive details about the action.
 * @param {object|null} req - Express request object to extract IP address.
 */
export const logActivity = async (userId, userName, action, details = '', req = null) => {
  try {
    let ipAddress = '';
    if (req) {
      ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
      // Clean up IPv6 prefix for IPv4-mapped addresses
      if (ipAddress.startsWith('::ffff:')) {
        ipAddress = ipAddress.substring(7);
      }
    }

    await ActivityLog.create({
      user: userId || null,
      userName: userName || 'System',
      action,
      details,
      ipAddress,
    });
  } catch (error) {
    console.error(`Activity Logging failed: ${error.message}`);
  }
};
