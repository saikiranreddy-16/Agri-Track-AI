import Machine from '../models/machineModel.js';
import GPSDevice from '../models/gpsDeviceModel.js';
import GPSHistory from '../models/gpsHistoryModel.js';
import FuelHistory from '../models/fuelHistoryModel.js';
import { emitMachineUpdate } from './socketService.js';

let simulationInterval = null;

/**
 * Start the real-time GPS simulation loop (Updates every 6 seconds)
 */
export const startGPSSimulator = () => {
  if (simulationInterval) return;

  console.log('Initializing real-time GPS operations simulation (6-second loop)...');

  simulationInterval = setInterval(async () => {
    try {
      // Find all machines in the database
      const machines = await Machine.find({}).populate('assignedDriverId', 'name phone');
      const dt = 6 / 3600; // time delta in hours (6 seconds)

      for (const machine of machines) {
        // Fallback coordinate mapping for Cheruvupally Telangana center
        const defaultLat = 16.978;
        const defaultLng = 79.432;

        let hasLocationChanged = false;
        let originalStatus = machine.status;

        // Fetch corresponding GPS device
        const gpsDevice = await GPSDevice.findById(machine.gpsDeviceId);

        // 1. Offline Asset Simulation
        if (machine.status === 'Offline') {
          machine.speed = 0;
          machine.engineStatus = 'Off';
          
          if (gpsDevice) {
            gpsDevice.connectionStatus = 'Offline';
            gpsDevice.detailedLiveStatus = 'GPS Lost';
            gpsDevice.lastCommunicationTime = new Date();
            await gpsDevice.save();
          }
          await machine.save();
          emitMachineUpdate(machine);
          continue;
        }

        // 2. Maintenance Asset Simulation
        if (machine.status === 'Maintenance') {
          machine.speed = 0;
          machine.engineStatus = 'Off';
          
          if (gpsDevice) {
            gpsDevice.connectionStatus = 'Online';
            gpsDevice.detailedLiveStatus = 'Stopped';
            gpsDevice.lastCommunicationTime = new Date();
            await gpsDevice.save();
          }
          await machine.save();
          emitMachineUpdate(machine);
          continue;
        }

        // 3. Idle Asset Simulation
        if (machine.status === 'Idle') {
          machine.speed = 0;
          // 50% chance engine is ON/OFF
          if (machine.engineStatus === undefined) machine.engineStatus = 'Off';
          
          // Increment idle time if engine is ON
          if (machine.engineStatus === 'On') {
            const currentIdle = machine.idleTime || 0;
            machine.idleTime = parseFloat((currentIdle + dt).toFixed(4));
            
            // Consume tiny amount of fuel during idle
            let newFuel = machine.fuel !== undefined ? machine.fuel : 100;
            newFuel -= Math.random() > 0.9 ? 1 : 0;
            machine.fuel = Math.max(5, newFuel);
          }

          if (gpsDevice) {
            gpsDevice.connectionStatus = 'Online';
            gpsDevice.detailedLiveStatus = machine.engineStatus === 'On' ? 'Idle' : 'Stopped';
            gpsDevice.lastCommunicationTime = new Date();
            await gpsDevice.save();
          }
          await machine.save();
          emitMachineUpdate(machine);
          continue;
        }

        // 4. Active/Working Asset Simulation
        if (machine.status === 'Working') {
          machine.engineStatus = 'On';

          // Simulate coordinate creep around Cheruvupally Telangana fields
          const deltaLat = (Math.random() - 0.49) * 0.0003;
          const deltaLng = (Math.random() - 0.49) * 0.0003;

          const oldLocation = machine.location && machine.location.lat && machine.location.lng
            ? machine.location
            : { lat: defaultLat, lng: defaultLng };

          const newLat = oldLocation.lat + deltaLat;
          const newLng = oldLocation.lng + deltaLng;
          hasLocationChanged = true;

          // Compute Bearing/Heading angle
          let newHeading = machine.heading || 0;
          if (deltaLat !== 0 || deltaLng !== 0) {
            const angle = Math.atan2(deltaLng, deltaLat) * (180 / Math.PI);
            newHeading = Math.round((angle + 360) % 360);
          }

          // Fluctuate speed between 6 and 22 km/h
          const speedChange = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
          const currentSpeed = machine.speed || 10;
          const newSpeed = Math.max(6, Math.min(22, currentSpeed + speedChange));

          // Deplete fuel level slowly (approx 0.02% per 6s, or 1% drop randomly)
          let newFuel = machine.fuel !== undefined ? machine.fuel : 100;
          newFuel -= Math.random() > 0.8 ? 1 : 0;
          if (newFuel < 5) {
            newFuel = 100; // Auto-refuel simulation
          }

          // Increment distance: speed * dt
          const currentDistance = machine.distanceTravelled || 0;
          const distanceIncrement = newSpeed * dt;
          const newDistance = parseFloat((currentDistance + distanceIncrement).toFixed(4));

          // Increment working hours
          const currentHours = machine.workingHours || 0;
          const newWorkingHours = parseFloat((currentHours + dt).toFixed(4));

          // Increment area covered (Hectares): approx 1.4 hectares worked per hour
          const currentArea = machine.areaCovered || 0;
          const areaIncrement = 1.4 * dt;
          const newArea = parseFloat((currentArea + areaIncrement).toFixed(4));

          // Update Machine document
          machine.location = { lat: newLat, lng: newLng };
          machine.speed = newSpeed;
          machine.heading = newHeading;
          machine.fuel = newFuel;
          machine.distanceTravelled = newDistance;
          machine.workingHours = newWorkingHours;
          machine.areaCovered = newArea;

          await machine.save();

          // Sync GPS Device document
          if (gpsDevice) {
            gpsDevice.connectionStatus = 'Online';
            gpsDevice.detailedLiveStatus = newSpeed > 2 ? 'Moving' : 'Idle';
            gpsDevice.lastCommunicationTime = new Date();
            gpsDevice.vehicleOdometer = Math.round(newDistance);
            await gpsDevice.save();
          }

          // Log coordinate trace in GPSHistory
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
            timestamp: new Date()
          });

          // Log fuel history snapshot occasionally
          if (Math.random() > 0.95) {
            await FuelHistory.create({
              machineId: machine._id,
              level: newFuel,
              timestamp: new Date()
            });
          }

          // Broadcast live status update to socket connections
          emitMachineUpdate(machine);
        }
      }
    } catch (error) {
      console.error('Error during GPS operations simulation step:', error);
    }
  }, 6000);
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
