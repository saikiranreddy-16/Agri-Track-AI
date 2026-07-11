import Machine from '../models/machineModel.js';
import GPSHistory from '../models/gpsHistoryModel.js';
import { emitMachineUpdate } from './socketService.js';

let simulationInterval = null;

/**
 * Start the real-time GPS simulation loop
 */
export const startGPSSimulator = () => {
  if (simulationInterval) return;

  console.log('Initializing real-time GPS operations simulation...');

  simulationInterval = setInterval(async () => {
    try {
      // Find all machines in the database
      const machines = await Machine.find({}).populate('assignedDriverId', 'name phone');

      for (const machine of machines) {
        // If offline or maintenance, they do not move, but we might sync their status
        if (machine.status === 'Offline') {
          // Speed 0, Engine status Off
          if (machine.speed > 0 || machine.engineStatus === 'On') {
            machine.speed = 0;
            machine.engineStatus = 'Off';
            await machine.save();
            emitMachineUpdate(machine);
          }
          continue;
        }

        if (machine.status === 'Maintenance') {
          if (machine.speed > 0 || machine.engineStatus === 'On') {
            machine.speed = 0;
            machine.engineStatus = 'Off';
            await machine.save();
            emitMachineUpdate(machine);
          }
          continue;
        }

        if (machine.status === 'Idle') {
          // Idle machines: engine could be off, speed is 0
          if (machine.speed > 0 || machine.engineStatus === 'On') {
            machine.speed = 0;
            machine.engineStatus = 'Off';
            await machine.save();
            emitMachineUpdate(machine);
          }
          continue;
        }

        // Active/Working machinery simulation
        if (machine.status === 'Working') {
          // 1. Simulate coordinate movement (creeping in Punjab fields)
          const deltaLat = (Math.random() - 0.48) * 0.0004;
          const deltaLng = (Math.random() - 0.48) * 0.0004;

          const oldLocation = machine.location || { lat: 30.902, lng: 75.853 };
          const newLat = oldLocation.lat + deltaLat;
          const newLng = oldLocation.lng + deltaLng;

          // 2. Calculate Heading (Bearing) in degrees
          let newHeading = machine.heading || 0;
          if (deltaLat !== 0 || deltaLng !== 0) {
            const angle = Math.atan2(deltaLng, deltaLat) * (180 / Math.PI);
            newHeading = Math.round((angle + 360) % 360);
          }

          // 3. Fluctuate Speed (e.g. 8 - 25 km/h for machinery)
          const speedChange = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
          const currentSpeed = machine.speed || 10;
          const newSpeed = Math.max(6, Math.min(25, currentSpeed + speedChange));

          // 4. Deplete Fuel level slowly
          let newFuel = machine.fuel !== undefined ? machine.fuel : 100;
          newFuel -= Math.random() > 0.75 ? 1 : 0;
          if (newFuel < 5) {
            newFuel = 100; // Auto-refuel simulation
          }

          // 5. Update Distance: speed * time = speed * (4 seconds / 3600 seconds)
          const currentDistance = machine.distanceTravelled || 0;
          const distanceIncrement = newSpeed * (4 / 3600);
          const newDistance = parseFloat((currentDistance + distanceIncrement).toFixed(3));

          // 6. Update Working Hours: 4 seconds / 3600 seconds
          const currentHours = machine.workingHours || 0;
          const hoursIncrement = 4 / 3600;
          const newWorkingHours = parseFloat((currentHours + hoursIncrement).toFixed(3));

          // 7. Save telemetry back to Machine document
          machine.location = { lat: newLat, lng: newLng };
          machine.speed = newSpeed;
          machine.heading = newHeading;
          machine.fuel = newFuel;
          machine.engineStatus = 'On';
          machine.distanceTravelled = newDistance;
          machine.workingHours = newWorkingHours;

          await machine.save();

          // 8. Log coordinate trace entry in GPSHistory
          await GPSHistory.create({
            machineId: machine._id,
            latitude: newLat,
            longitude: newLng,
            speed: newSpeed,
            heading: newHeading,
            engineStatus: 'On',
            fuel: newFuel,
            workingHours: newWorkingHours,
            distanceTravelled: newDistance,
            timestamp: new Date(),
          });

          // 9. Broadcast live status to frontend via Socket.IO
          emitMachineUpdate(machine);
        }
      }
    } catch (error) {
      console.error('Error during GPS simulation update step:', error);
    }
  }, 4000);
};

/**
 * Stop the GPS simulation loop
 */
export const stopGPSSimulator = () => {
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
    console.log('GPS simulation loop stopped.');
  }
};
