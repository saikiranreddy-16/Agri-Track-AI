import mongoose from 'mongoose';

const tripReplaySchema = new mongoose.Schema(
  {
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Machine',
      required: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
      default: Date.now,
    },
    startLocation: {
      name: { type: String, default: 'Start Point' },
      lat: Number,
      lng: Number,
    },
    endLocation: {
      name: { type: String, default: 'End Point' },
      lat: Number,
      lng: Number,
    },
    distanceKm: {
      type: Number,
      default: 0,
    },
    workingHours: {
      type: Number,
      default: 0,
    },
    idleTimeMinutes: {
      type: Number,
      default: 0,
    },
    maxSpeedKm: {
      type: Number,
      default: 0,
    },
    avgSpeedKm: {
      type: Number,
      default: 0,
    },
    fuelUsedLitres: {
      type: Number,
      default: 0,
    },
    areaCoveredAcres: {
      type: Number,
      default: 0,
    },
    coordinates: [
      {
        lat: Number,
        lng: Number,
        speed: Number,
        engineTemp: Number,
        fuel: Number,
        timestamp: String,
      },
    ],
    stops: [
      {
        name: String,
        lat: Number,
        lng: Number,
        duration: String,
        timestamp: String,
      },
    ],
    engineEvents: [
      {
        type: { type: String, enum: ['Engine ON', 'Engine OFF'] },
        timestamp: String,
        lat: Number,
        lng: Number,
      },
    ],
  },
  { timestamps: true }
);

tripReplaySchema.index({ vehicleId: 1, date: -1 });

const TripReplay = mongoose.model('TripReplay', tripReplaySchema);
export default TripReplay;
