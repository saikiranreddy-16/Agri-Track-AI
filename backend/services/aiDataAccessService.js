import Machine from '../models/machineModel.js';
import Farm from '../models/farmModel.js';
import Job from '../models/jobModel.js';
import Alert from '../models/alertModel.js';
import Maintenance from '../models/maintenanceModel.js';
import GPSHistory from '../models/gpsHistoryModel.js';
import { getOperationsMetrics } from './reportService.js';

/**
 * Service providing a secure data access layer for AI algorithms and chatbot contexts.
 * Decouples MongoDB models from AI layer and enforces strict role-based data isolation.
 */
export const getVehiclesForAI = async (user) => {
  const query = user.role === 'Farm Admin' ? { owner: user._id } : {};
  return await Machine.find(query).lean();
};

export const getFarmsForAI = async (user) => {
  const query = user.role === 'Farm Admin' ? { owner: user._id } : {};
  return await Farm.find(query).lean();
};

export const getJobsForAI = async (user) => {
  if (user.role === 'Farm Admin') {
    const machines = await Machine.find({ owner: user._id }).select('_id');
    const machineIds = machines.map(m => m._id);
    return await Job.find({ machineId: { $in: machineIds } }).lean();
  }
  return await Job.find({}).lean();
};

export const getAlertsForAI = async (user) => {
  if (user.role === 'Farm Admin') {
    const machines = await Machine.find({ owner: user._id }).select('_id');
    const machineIds = machines.map(m => m._id);
    return await Alert.find({ machineId: { $in: machineIds } }).lean();
  }
  return await Alert.find({}).lean();
};

export const getMaintenanceForAI = async (user) => {
  if (user.role === 'Farm Admin') {
    const machines = await Machine.find({ owner: user._id }).select('_id');
    const machineIds = machines.map(m => m._id);
    return await Maintenance.find({ machineId: { $in: machineIds } }).lean();
  }
  return await Maintenance.find({}).lean();
};

export const getGPSHistoryForAI = async (user, machineId) => {
  const machine = await Machine.findById(machineId);
  if (!machine) return [];

  // Enforce isolation
  if (user.role === 'Farm Admin' && machine.owner.toString() !== user._id.toString()) {
    throw new Error('Access denied. Assigned vehicle does not belong to your account.');
  }

  return await GPSHistory.find({ machineId }).sort({ timestamp: -1 }).limit(100).lean();
};

export const getReportsForAI = async (user, timeframe) => {
  const ownerId = user.role === 'Farm Admin' ? user._id : null;
  return await getOperationsMetrics(timeframe, ownerId);
};

/**
 * Collects a unified snapshot context specifically for AI Copilot queries.
 */
export const collectAIContextData = async (user) => {
  const isFarmAdmin = user.role === 'Farm Admin';
  const ownerId = isFarmAdmin ? user._id : null;

  const machines = await getVehiclesForAI(user);
  const farms = await getFarmsForAI(user);
  const jobs = await getJobsForAI(user);
  const alerts = await getAlertsForAI(user);
  const maintenance = await getMaintenanceForAI(user);

  const reportToday = await getOperationsMetrics('Today', ownerId);
  const reportWeekly = await getOperationsMetrics('Weekly', ownerId);
  const reportMonthly = await getOperationsMetrics('Monthly', ownerId);

  return {
    userRole: user.role,
    userName: user.name,
    farmsCount: farms.length,
    machinesCount: machines.length,
    activeFarms: farms.map(f => f.name),
    machines: machines.map(m => ({
      id: m._id,
      name: m.name,
      type: m.type,
      chassisNumber: m.chassisNumber || m.registration,
      status: m.status,
      fuel: m.fuel,
      battery: m.battery,
      healthScore: m.healthScore || 100,
      speed: m.speed,
      workingHours: m.workingHours,
      distanceTravelled: m.distanceTravelled,
      currentAddress: m.currentAddress,
    })),
    jobs: jobs.map(j => ({ title: j.title, status: j.status, progress: j.progress })),
    alerts: alerts.map(a => ({ type: a.type, message: a.message, priority: a.priority, status: a.status })),
    maintenance: maintenance.map(m => ({ task: m.task, status: m.status, date: m.date })),
    reportToday,
    reportWeekly,
    reportMonthly,
  };
};
