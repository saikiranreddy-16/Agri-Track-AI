import { getOperationsMetrics } from '../services/reportService.js';
import { successResponse } from '../utils/responseHandler.js';

// @desc    Get dynamically calculated operations report (without database table storage)
// @route   GET /api/v1/reports
// @access  Private
export const getOperationsReport = async (req, res, next) => {
  try {
    const { timeframe } = req.query;
    const ownerId = req.user.role === 'Farm Admin' ? req.user._id : null;

    if (timeframe) {
      const data = await getOperationsMetrics(timeframe, ownerId);
      return successResponse(res, 200, `${timeframe} report calculated successfully`, data);
    }

    // Fallback: calculate all standard timeframes to ease client side consumption
    const today = await getOperationsMetrics('Today', ownerId);
    const yesterday = await getOperationsMetrics('Yesterday', ownerId);
    const weekly = await getOperationsMetrics('Weekly', ownerId);
    const monthly = await getOperationsMetrics('Monthly', ownerId);

    return successResponse(res, 200, 'Operations reports calculated successfully', {
      Today: today,
      Yesterday: yesterday,
      Weekly: weekly,
      Monthly: monthly,
    });
  } catch (error) {
    next(error);
  }
};
