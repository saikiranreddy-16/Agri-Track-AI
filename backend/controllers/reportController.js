import { getOperationsMetrics } from '../services/reportService.js';
import { successResponse } from '../utils/responseHandler.js';

// @desc    Get dynamically calculated operations report (without database table storage)
// @route   GET /api/v1/reports
// @access  Private
export const getOperationsReport = async (req, res, next) => {
  try {
    const { timeframe } = req.query;

    if (timeframe) {
      const data = await getOperationsMetrics(timeframe);
      return successResponse(res, 200, `${timeframe} report calculated successfully`, data);
    }

    // Fallback: calculate all standard timeframes to ease client side consumption
    const today = await getOperationsMetrics('Today');
    const yesterday = await getOperationsMetrics('Yesterday');
    const weekly = await getOperationsMetrics('Weekly');
    const monthly = await getOperationsMetrics('Monthly');

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
