import GPSDevice from '../models/gpsDeviceModel.js';
import Machine from '../models/machineModel.js';
import { emitMachineUpdate } from './socketService.js';

/**
 * Periodically flags active devices as Offline and updates connected vehicle status
 * if no heartbeat is received within the configured threshold (default: 5 minutes).
 */
export const startHeartbeatMonitor = () => {
  // Check every 60 seconds
  setInterval(async () => {
    try {
      const timeoutLimit = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago

      // Find devices that are Online but haven't sent a heartbeat in the last 5 minutes
      const offlineDevices = await GPSDevice.find({
        activationStatus: 'Activated',
        currentStatus: 'Online',
        $or: [
          { lastHeartbeat: { $lt: timeoutLimit } },
          { lastHeartbeat: null }
        ]
      });

      for (const device of offlineDevices) {
        device.currentStatus = 'Offline';
        device.connectionStatus = 'Offline';
        await device.save();

        const vehicleId = device.currentVehicle || device.vehicleId;
        if (vehicleId) {
          const machine = await Machine.findById(vehicleId);
          if (machine && machine.status !== 'Offline') {
            machine.status = 'Offline';
            await machine.save();

            // Emit update over socket to live frontend dashboards
            try {
              const updatedMachine = await Machine.findById(machine._id).populate('assignedDriverId', 'name phone');
              if (updatedMachine) {
                emitMachineUpdate(updatedMachine);
              }
            } catch (err) {
              console.error(`Socket broadcast failed for offline transition: ${err.message}`);
            }
          }
        }
      }
    } catch (error) {
      console.error(`Heartbeat Monitoring loop error: ${error.message}`);
    }
  }, 60 * 1000);
};
