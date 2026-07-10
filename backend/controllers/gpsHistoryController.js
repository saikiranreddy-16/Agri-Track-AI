import GPSHistory from '../models/gpsHistoryModel.js';
import Machine from '../models/machineModel.js';
import { successResponse } from '../utils/responseHandler.js';

// @desc    Get GPS history paths for a machine
// @route   GET /api/v1/gps/:machineId
// @access  Private
export const getGPSHistory = async (req, res, next) => {
  try {
    const { machineId } = req.params;
    const history = await GPSHistory.find({ machineId }).sort({ timestamp: 1 });
    return successResponse(res, 200, 'GPS History paths retrieved successfully', history);
  } catch (error) {
    next(error);
  }
};

// @desc    Add new GPS telemetry log coordinate
// @route   POST /api/v1/gps
// @access  Private (System, Admin, Operator)
export const addGPSCoordinate = async (req, res, next) => {
  try {
    const { machineId, latitude, longitude, speed, timestamp } = req.body;

    const log = await GPSHistory.create({
      machineId,
      latitude,
      longitude,
      speed,
      timestamp: timestamp || new Date(),
    });

    // Side effect: update current machine location & speed & engine status
    await Machine.findByIdAndUpdate(machineId, {
      location: { lat: latitude, lng: longitude },
      speed: speed || 0,
      engineStatus: speed > 0 ? 'On' : 'Off', // basic dynamic engine status deduction
    });

    return successResponse(res, 201, 'GPS coordinate logged successfully', log);
  } catch (error) {
    next(error);
  }
};
