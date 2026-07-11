import GPSHistory from '../models/gpsHistoryModel.js';
import Machine from '../models/machineModel.js';
import { successResponse } from '../utils/responseHandler.js';
import { emitMachineUpdate } from '../services/socketService.js';

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

// @desc    Get current GPS location & telemetry for a machine
// @route   GET /api/v1/gps/:machineId/current
// @access  Private
export const getCurrentLocation = async (req, res, next) => {
  try {
    const { machineId } = req.params;
    const machine = await Machine.findById(machineId).populate('assignedDriverId', 'name phone');
    if (!machine) {
      res.status(404);
      return next(new Error('Machine not found'));
    }
    return successResponse(res, 200, 'Current GPS location and telemetry retrieved successfully', {
      machineId: machine._id,
      latitude: machine.location.lat,
      longitude: machine.location.lng,
      speed: machine.speed,
      heading: machine.heading || 0,
      timestamp: machine.updatedAt,
      engineStatus: machine.engineStatus,
      fuelLevel: machine.fuel,
      workingHours: machine.workingHours,
      distanceTravelled: machine.distanceTravelled,
      driverName: machine.assignedDriverId ? machine.assignedDriverId.name : 'Unassigned',
      status: machine.status,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get GPS history paths & computed stops for route playback
// @route   GET /api/v1/gps/:machineId/playback
// @access  Private
export const getRoutePlayback = async (req, res, next) => {
  try {
    const { machineId } = req.params;
    const history = await GPSHistory.find({ machineId }).sort({ timestamp: 1 });

    // Calculate stops dynamically: sequence of points where speed is 0 for >= 10 seconds
    const stops = [];
    let currentStop = null;

    for (let i = 0; i < history.length; i++) {
      const point = history[i];
      if (point.speed === 0) {
        if (!currentStop) {
          currentStop = {
            name: `Stop ${stops.length + 1}`,
            lat: point.latitude,
            lng: point.longitude,
            startTime: point.timestamp,
            pointsCount: 1,
          };
        } else {
          currentStop.pointsCount++;
        }
      } else {
        if (currentStop) {
          // Stop ended
          const endTime = history[i - 1].timestamp;
          const durationMs = new Date(endTime) - new Date(currentStop.startTime);
          const durationMins = Math.round(durationMs / 60000);
          
          if (durationMs >= 10000) { // 10 seconds threshold for test simulation
            const durationStr = durationMins > 0 ? `${durationMins} mins` : `${Math.round(durationMs / 1000)} secs`;
            stops.push({
              name: currentStop.name,
              lat: currentStop.lat,
              lng: currentStop.lng,
              duration: durationStr,
              timestamp: new Date(currentStop.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            });
          }
          currentStop = null;
        }
      }
    }

    // Ongoing stop at end
    if (currentStop && history.length > 0) {
      const endTime = history[history.length - 1].timestamp;
      const durationMs = new Date(endTime) - new Date(currentStop.startTime);
      const durationMins = Math.round(durationMs / 60000);
      if (durationMs >= 10000) {
        const durationStr = durationMins > 0 ? `${durationMins} mins` : `${Math.round(durationMs / 1000)} secs`;
        stops.push({
          name: currentStop.name,
          lat: currentStop.lat,
          lng: currentStop.lng,
          duration: durationStr,
          timestamp: new Date(currentStop.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      }
    }

    // Format coordinates trace for route playback rendering
    const coordinates = history.map((pt) => ({
      lat: pt.latitude,
      lng: pt.longitude,
      speed: pt.speed,
      heading: pt.heading || 0,
      fuel: pt.fuel !== undefined ? pt.fuel : 100,
      engineStatus: pt.engineStatus || 'Off',
      workingHours: pt.workingHours || 0,
      distanceTravelled: pt.distanceTravelled || 0,
      timestamp: new Date(pt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }));

    return successResponse(res, 200, 'Route playback data compiled successfully', {
      coordinates,
      stops,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add new GPS telemetry log coordinate
// @route   POST /api/v1/gps
// @access  Private (System, Admin, Operator)
export const addGPSCoordinate = async (req, res, next) => {
  try {
    const {
      machineId,
      latitude,
      longitude,
      speed,
      heading,
      engineStatus,
      fuel,
      workingHours,
      distanceTravelled,
      timestamp,
    } = req.body;

    const logTime = timestamp || new Date();

    const log = await GPSHistory.create({
      machineId,
      latitude,
      longitude,
      speed,
      heading: heading || 0,
      engineStatus: engineStatus || (speed > 0 ? 'On' : 'Off'),
      fuel: fuel !== undefined ? fuel : 100,
      workingHours: workingHours || 0,
      distanceTravelled: distanceTravelled || 0,
      timestamp: logTime,
    });

    // Side effect: update current machine location, speed, heading, and telemetry status
    const updatedMachine = await Machine.findByIdAndUpdate(
      machineId,
      {
        $set: {
          location: { lat: latitude, lng: longitude },
          speed: speed || 0,
          heading: heading || 0,
          engineStatus: engineStatus || (speed > 0 ? 'On' : 'Off'),
          ...(fuel !== undefined && { fuel }),
          ...(workingHours !== undefined && { workingHours }),
          ...(distanceTravelled !== undefined && { distanceTravelled }),
        },
      },
      { new: true }
    ).populate('assignedDriverId', 'name phone');

    if (updatedMachine) {
      // Emit the update via Socket.IO for real-time tracking page updates
      emitMachineUpdate(updatedMachine);
    }

    return successResponse(res, 201, 'GPS coordinate logged successfully', log);
  } catch (error) {
    next(error);
  }
};
