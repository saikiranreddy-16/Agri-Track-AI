import GPSDevice from '../models/gpsDeviceModel.js';
import Machine from '../models/machineModel.js';
import GPSHistory from '../models/gpsHistoryModel.js';
import { calculateAndUpdateVehicleHealth } from '../services/vehicleHealthService.js';
import { emitMachineUpdate } from '../services/socketService.js';
import { successResponse } from '../utils/responseHandler.js';

// @desc    Future Hardware GPS Telemetry upload
// @route   POST /api/v1/hardware/gps-upload
// @access  Public (Devices use API/hardware keys or direct posts)
export const hardwareGPSUpload = async (req, res, next) => {
  const {
    deviceId,
    latitude,
    longitude,
    speed,
    heading,
    battery,
    signalStrength,
    network,
    fuel,
    engineStatus,
    timestamp,
  } = req.body;

  if (!deviceId) {
    res.status(400);
    return next(new Error('Device ID is required'));
  }

  try {
    // 1. Find the active GPS device in the master table
    const gpsDevice = await GPSDevice.findOne({ deviceId, activationStatus: 'Activated' });
    if (!gpsDevice) {
      res.status(404);
      return next(new Error(`GPS Device ID ${deviceId} is not registered or not activated.`));
    }

    const logTime = timestamp ? new Date(timestamp) : new Date();

    // 2. Update device status and heartbeat parameters
    gpsDevice.lastCommunicationTime = logTime;
    gpsDevice.lastSeen = logTime;
    gpsDevice.lastHeartbeat = logTime;
    gpsDevice.currentStatus = 'Online';
    gpsDevice.connectionStatus = 'Online';
    if (battery !== undefined) {
      gpsDevice.battery = battery;
      gpsDevice.batteryVoltage = battery;
    }
    if (signalStrength !== undefined) {
      gpsDevice.signalStrength = signalStrength;
      gpsDevice.gsmSignalStrength = signalStrength;
    }
    if (network) gpsDevice.network = network;
    await gpsDevice.save();

    let machine = null;
    let historyRecord = null;

    // 3. If connected to a vehicle, update vehicle telemetry & health
    const vehicleId = gpsDevice.currentVehicle || gpsDevice.vehicleId;
    if (vehicleId) {
      machine = await Machine.findById(vehicleId);
      if (machine) {
        // Update machine stats
        machine.location = { lat: Number(latitude), lng: Number(longitude) };
        if (speed !== undefined) machine.speed = Number(speed);
        if (heading !== undefined) machine.heading = Number(heading);
        if (engineStatus) machine.engineStatus = engineStatus;
        if (fuel !== undefined) machine.fuel = Number(fuel);
        if (battery !== undefined) machine.battery = Number(battery);
        machine.status = engineStatus === 'On' ? 'Working' : 'Idle';
        
        await machine.save();

        // Save trace in GPSHistory collection
        historyRecord = await GPSHistory.create({
          machineId: machine._id,
          latitude: Number(latitude),
          longitude: Number(longitude),
          speed: Number(speed) || 0,
          heading: Number(heading) || 0,
          engineStatus: engineStatus || 'Off',
          fuel: fuel !== undefined ? Number(fuel) : 100,
          timestamp: logTime,
        });

        // Recalculate health score dynamically
        await calculateAndUpdateVehicleHealth(machine._id);

        // Fetch freshly calculated machine details and emit socket
        const updatedMachine = await Machine.findById(machine._id).populate('assignedDriverId', 'name phone');
        if (updatedMachine) {
          emitMachineUpdate(updatedMachine);
        }
      }
    }

    return successResponse(res, 200, 'Device telemetry processed successfully', {
      deviceId,
      processedAt: new Date().toISOString(),
      vehicleUpdated: !!machine,
      historyLogged: !!historyRecord,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Hardware Heartbeat / ping checks
// @route   POST /api/v1/hardware/heartbeat
// @access  Public
export const hardwareHeartbeat = async (req, res, next) => {
  const { deviceId, battery, signalStrength, network } = req.body;

  if (!deviceId) {
    res.status(400);
    return next(new Error('Device ID is required'));
  }

  try {
    const gpsDevice = await GPSDevice.findOne({ deviceId, activationStatus: 'Activated' });
    if (!gpsDevice) {
      res.status(404);
      return next(new Error('GPS Device not found or is deactivated.'));
    }

    gpsDevice.lastHeartbeat = new Date();
    gpsDevice.lastCommunicationTime = new Date();
    gpsDevice.lastSeen = new Date();
    gpsDevice.currentStatus = 'Online';
    gpsDevice.connectionStatus = 'Online';
    if (battery !== undefined) {
      gpsDevice.battery = battery;
      gpsDevice.batteryVoltage = battery;
    }
    if (signalStrength !== undefined) {
      gpsDevice.signalStrength = signalStrength;
      gpsDevice.gsmSignalStrength = signalStrength;
    }
    if (network) gpsDevice.network = network;
    await gpsDevice.save();

    // Trigger health recalculation if vehicle is linked
    const vehicleId = gpsDevice.currentVehicle || gpsDevice.vehicleId;
    if (vehicleId) {
      await calculateAndUpdateVehicleHealth(vehicleId);
    }

    return successResponse(res, 200, 'Heartbeat registered successfully', {
      deviceId,
      lastHeartbeat: gpsDevice.lastHeartbeat,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check for firmware updates (Firmware updates not fully implemented yet)
// @route   GET /api/v1/hardware/firmware-update
// @access  Public
export const hardwareFirmwareCheck = async (req, res, next) => {
  const { deviceId, currentVersion } = req.query;

  if (!deviceId) {
    res.status(400);
    return next(new Error('Device ID parameter is required'));
  }

  try {
    // Architecture placeholder
    return successResponse(res, 200, 'Firmware details compiled', {
      deviceId,
      currentVersion: currentVersion || '1.0.0',
      updateAvailable: false,
      latestVersion: '1.0.0',
      downloadUrl: '',
      message: 'Device firmware is up to date. S3 bucket integration is pending.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit Diagnostic logs from hardware
// @route   POST /api/v1/hardware/diagnostics
// @access  Public
export const hardwareDiagnostics = async (req, res, next) => {
  const { deviceId, errorCodes, signalStrength, voltage, temperature } = req.body;

  if (!deviceId) {
    res.status(400);
    return next(new Error('Device ID is required'));
  }

  try {
    const gpsDevice = await GPSDevice.findOne({ deviceId, activationStatus: 'Activated' });
    if (!gpsDevice) {
      res.status(404);
      return next(new Error('GPS Device not registered or active.'));
    }

    // Determine device health status based on errors
    let health = 'Good';
    if (errorCodes && errorCodes.length > 0) {
      health = errorCodes.includes('ERR_CRITICAL') ? 'Poor' : 'Fair';
    }

    gpsDevice.deviceHealth = health;
    gpsDevice.lastCommunicationTime = new Date();
    await gpsDevice.save();

    return successResponse(res, 200, 'Diagnostics logged', {
      deviceId,
      healthStatus: health,
      voltage: voltage || 'N/A',
      tempCelsius: temperature || 'N/A',
    });
  } catch (error) {
    next(error);
  }
};
