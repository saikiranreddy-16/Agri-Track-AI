import Machine from '../models/machineModel.js';
import Farm from '../models/farmModel.js';
import Job from '../models/jobModel.js';
import Alert from '../models/alertModel.js';
import Maintenance from '../models/maintenanceModel.js';
import FuelHistory from '../models/fuelHistoryModel.js';
import GPSHistory from '../models/gpsHistoryModel.js';
import { getOperationsMetrics } from '../services/reportService.js';

/**
 * Programmatically cleans and sanitizes database records.
 * Strips all sensitive information such as _id, deviceIds, passwords, tokens, JWT, trustedDevices, and internalNotes.
 * Keeps only relevant business context.
 */
export const sanitizeData = (data) => {
  if (data === null || data === undefined) return data;
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item));
  }
  
  if (typeof data === 'object') {
    // If it's a Mongoose Document, convert to raw object
    const obj = typeof data.toObject === 'function' ? data.toObject() : data;
    const cleaned = {};
    const keysToOmit = new Set([
      '_id', 'id', 'deviceId', 'gpsDeviceId', 'farmId', 'owner', 'ownerId', 
      'userId', 'user', 'jwt', 'password', 'passwordHash', 'trustedDevices', 
      'internalNotes', 'token', '__v'
    ]);
    
    for (const key of Object.keys(obj)) {
      if (keysToOmit.has(key)) {
        continue;
      }
      cleaned[key] = sanitizeData(obj[key]);
    }
    return cleaned;
  }
  
  return data;
};

/**
 * Gathers business data securely based on user role and prepares structured JSON context.
 * Enforces role isolation (Farm Admin can access only their own farm fleet data).
 */
export const buildAIContext = async (user) => {
  const isFarmAdmin = user.role === 'Farm Admin';
  const ownerId = isFarmAdmin ? user._id : null;

  // 1. Fetch Farms & Machines
  const farmQuery = isFarmAdmin ? { owner: user._id } : {};
  const farms = await Farm.find(farmQuery).lean();
  
  const machineQuery = isFarmAdmin ? { owner: user._id } : {};
  const machines = await Machine.find(machineQuery).lean();
  const machineIds = machines.map(m => m._id);

  // 2. Fetch Alerts, Jobs & Maintenance with populated machine names
  const alertQuery = isFarmAdmin ? { machineId: { $in: machineIds } } : {};
  const rawAlerts = await Alert.find(alertQuery).populate('machineId', 'name').lean();

  const jobQuery = isFarmAdmin ? { machineId: { $in: machineIds } } : {};
  const rawJobs = await Job.find(jobQuery).populate('machineId', 'name').lean();

  const maintenanceQuery = isFarmAdmin ? { machineId: { $in: machineIds } } : {};
  const rawMaintenance = await Maintenance.find(maintenanceQuery).populate('machineId', 'name').lean();

  // 3. Fetch Reports (using getOperationsMetrics)
  const todayMetrics = await getOperationsMetrics('Today', ownerId);
  const weeklyMetrics = await getOperationsMetrics('Weekly', ownerId);

  // 4. Fetch Fuel History & GPS History
  const fuelQuery = isFarmAdmin ? { machineId: { $in: machineIds } } : {};
  const rawFuelHistory = await FuelHistory.find(fuelQuery)
    .sort({ timestamp: -1 })
    .limit(50)
    .populate('machineId', 'name')
    .lean();

  // Latest GPS position for each machine
  const machinesPositions = [];
  for (const m of machines) {
    const latestGps = await GPSHistory.findOne({ machineId: m._id })
      .sort({ timestamp: -1 })
      .lean();
    if (latestGps) {
      machinesPositions.push({
        machine: m.name,
        latitude: latestGps.latitude,
        longitude: latestGps.longitude,
        speed: latestGps.speed,
        heading: latestGps.heading,
        engineStatus: latestGps.engineStatus,
        timestamp: latestGps.timestamp
      });
    }
  }

  // Construct structured data
  const rawContext = {
    fleetSummary: {
      totalMachines: machines.length,
      statusBreakdown: {
        Working: machines.filter(m => m.status === 'Working').length,
        Idle: machines.filter(m => m.status === 'Idle').length,
        Maintenance: machines.filter(m => m.status === 'Maintenance').length,
        Offline: machines.filter(m => m.status === 'Offline').length,
      },
      activeFarms: farms.map(f => f.name),
      machines: machines.map(m => ({
        name: m.name,
        type: m.type,
        registration: m.registration,
        chassisNumber: m.chassisNumber,
        status: m.status,
        fuel: m.fuel,
        battery: m.battery,
        healthScore: m.healthScore || 100,
        speed: m.speed || 0,
        workingHours: m.workingHours || 0,
      }))
    },
    todayReport: {
      timeframe: 'Today',
      totalHours: todayMetrics.reduce((sum, m) => sum + m.hours, 0),
      totalDistance: todayMetrics.reduce((sum, m) => sum + m.distance, 0),
      totalFuelBurned: todayMetrics.reduce((sum, m) => sum + m.fuel, 0),
      totalAreaCovered: todayMetrics.reduce((sum, m) => sum + m.area, 0),
      machineBreakdown: todayMetrics.map(m => ({
        name: m.name,
        activeHours: m.hours,
        fuelBurned: m.fuel,
        distanceCovered: m.distance,
        areaCovered: m.area
      }))
    },
    alerts: rawAlerts.map(a => ({
      type: a.type,
      message: a.message,
      priority: a.priority,
      status: a.status,
      machine: a.machineId ? a.machineId.name : 'Not Assigned',
      driverName: a.driverName,
      time: a.time
    })),
    maintenance: rawMaintenance.map(m => ({
      task: m.task,
      status: m.status,
      date: m.date,
      cost: m.cost,
      machine: m.machineId ? m.machineId.name : 'Unknown'
    })),
    fuelStatistics: {
      averageFuelLevel: machines.length > 0 
        ? Math.round(machines.reduce((sum, m) => sum + m.fuel, 0) / machines.length) 
        : 100,
      lowFuelMachines: machines
        .filter(m => m.fuel < 25)
        .map(m => ({ name: m.name, fuel: m.fuel })),
      recentLogs: rawFuelHistory.slice(0, 10).map(f => ({
        machine: f.machineId ? f.machineId.name : 'Unknown',
        level: f.level,
        timestamp: f.timestamp
      }))
    },
    gpsStatistics: {
      totalDistanceToday: todayMetrics.reduce((sum, m) => sum + m.distance, 0),
      machinesPositions,
    },
    jobs: rawJobs.map(j => ({
      title: j.title,
      status: j.status,
      progress: j.progress,
      machine: j.machineId ? j.machineId.name : 'Unknown'
    }))
  };

  // Perform recursive cleanup of sensitive properties
  return sanitizeData(rawContext);
};
