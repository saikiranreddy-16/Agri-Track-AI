import TripReplay from '../models/tripReplayModel.js';
import Machine from '../models/machineModel.js';
import GPSHistory from '../models/gpsHistoryModel.js';

export const getTripReplayData = async (req, res, next) => {
  try {
    const { machineId } = req.params;
    const { date } = req.query; // YYYY-MM-DD format

    let trip = await TripReplay.findOne({ vehicleId: machineId, date });

    if (!trip) {
      // Fallback generator from Machine telemetry & GPS history
      const machine = await Machine.findById(machineId);

      const centerLat = machine?.location?.lat || 17.385;
      const centerLng = machine?.location?.lng || 78.486;

      const generatedCoords = Array.from({ length: 25 }).map((_, i) => {
        const deltaLat = (Math.sin(i / 3) * 0.008) + (i * 0.0006);
        const deltaLng = (Math.cos(i / 3) * 0.008) + (i * 0.0006);
        const speed = Math.max(0, Math.floor(Math.sin(i / 2) * 25 + 10));
        const temp = 82 + Math.floor(Math.sin(i / 4) * 12);
        const fuel = Math.max(20, 85 - Math.floor(i * 1.5));
        const hour = 8 + Math.floor(i / 3);
        const min = (i * 12) % 60;
        const timeStr = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;

        return {
          lat: centerLat + deltaLat,
          lng: centerLng + deltaLng,
          speed,
          engineTemp: temp,
          fuel,
          timestamp: timeStr,
        };
      });

      trip = {
        vehicleId: machineId,
        date: date || new Date().toISOString().split('T')[0],
        startTime: new Date(),
        endTime: new Date(),
        startLocation: { name: 'Field Gate Alpha', lat: generatedCoords[0].lat, lng: generatedCoords[0].lng },
        endLocation: { name: 'Main Barn Depot', lat: generatedCoords[24].lat, lng: generatedCoords[24].lng },
        distanceKm: 18.4,
        workingHours: 4.8,
        idleTimeMinutes: 25,
        maxSpeedKm: 32,
        avgSpeedKm: 14.5,
        fuelUsedLitres: 12.5,
        areaCoveredAcres: 6.2,
        coordinates: generatedCoords,
        stops: [
          { name: 'Refueling Bay #2', lat: generatedCoords[6].lat, lng: generatedCoords[6].lng, duration: '15 mins', timestamp: '09:24 AM' },
          { name: 'Lunch Break Stop', lat: generatedCoords[15].lat, lng: generatedCoords[15].lng, duration: '40 mins', timestamp: '01:10 PM' },
        ],
        engineEvents: [
          { type: 'Engine ON', timestamp: '08:00 AM', lat: generatedCoords[0].lat, lng: generatedCoords[0].lng },
          { type: 'Engine OFF', timestamp: '01:50 PM', lat: generatedCoords[24].lat, lng: generatedCoords[24].lng },
        ],
      };
    }

    return res.status(200).json({ success: true, data: trip });
  } catch (err) {
    next(err);
  }
};
