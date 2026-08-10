import Machine from '../models/machineModel.js';
import Maintenance from '../models/maintenanceModel.js';
import GPSDevice from '../models/gpsDeviceModel.js';

/**
 * Calculates and updates the health score of a machine based on telemetry inputs.
 * Inputs: Fuel, Battery, Engine status, Maintenance records, GPS connectivity.
 * @param {string} machineId - MongoDB ObjectId of the Machine
 * @returns {Promise<number>} - The calculated health score (0-100)
 */
export const calculateAndUpdateVehicleHealth = async (machineId) => {
  try {
    const machine = await Machine.findById(machineId).populate('gpsDeviceId');
    if (!machine) return 100;

    // Weights:
    // Fuel: 20%
    // Battery: 20%
    // Engine Status: 20%
    // Maintenance: 20%
    // GPS Connectivity: 20%

    let fuelScore = machine.fuel; // 0-100
    let batteryScore = machine.battery; // 0-100

    // Engine: If off, 100 score, if on and speed matches but no anomalies, 100.
    // If engine is On but fuel is critical, penalty
    let engineScore = 100;
    if (machine.engineStatus === 'On' && machine.fuel < 10) {
      engineScore = 50; // high penalty if running dry
    }

    // Maintenance: Check if there is an active upcoming high/critical priority maintenance that is overdue
    let maintenanceScore = 100;
    const overdueMaintenance = await Maintenance.findOne({
      machineId,
      status: 'Upcoming',
      date: { $lt: new Date() },
    });
    if (overdueMaintenance) {
      if (overdueMaintenance.priority === 'Critical') {
        maintenanceScore = 30;
      } else if (overdueMaintenance.priority === 'High') {
        maintenanceScore = 60;
      } else {
        maintenanceScore = 80;
      }
    }

    // GPS Connectivity: Check if GPS device communicated in the last 15 minutes
    let gpsConnectivityScore = 100;
    if (machine.gpsDeviceId) {
      const gpsDevice = machine.gpsDeviceId;
      if (gpsDevice.lastCommunicationTime) {
        const diffMs = new Date() - new Date(gpsDevice.lastCommunicationTime);
        const diffMins = diffMs / 60000;
        if (diffMins > 60) {
          gpsConnectivityScore = 0; // Offline for over an hour
        } else if (diffMins > 15) {
          gpsConnectivityScore = 50; // Delay in heartbeats
        }
      } else {
        gpsConnectivityScore = 20; // No communication history
      }
    } else {
      gpsConnectivityScore = 0; // No GPS device mapped
    }

    // Weighted average
    const finalScore = Math.round(
      fuelScore * 0.2 +
      batteryScore * 0.2 +
      engineScore * 0.2 +
      maintenanceScore * 0.2 +
      gpsConnectivityScore * 0.2
    );

    // Save calculation to Machine document
    machine.healthScore = Math.max(0, Math.min(100, finalScore));
    await Machine.findByIdAndUpdate(machineId, { $set: { healthScore: machine.healthScore } });

    return machine.healthScore;
  } catch (error) {
    console.error(`Failed to calculate health score for vehicle ${machineId}:`, error);
    return 100;
  }
};
