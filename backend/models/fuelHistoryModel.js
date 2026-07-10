import mongoose from 'mongoose';

const fuelHistorySchema = new mongoose.Schema(
  {
    machineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Machine',
      required: [true, 'Machine ID is required'],
      index: true,
    },
    level: {
      type: Number,
      required: [true, 'Fuel level percentage is required'],
      min: 0,
      max: 100,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const FuelHistory = mongoose.model('FuelHistory', fuelHistorySchema);
export default FuelHistory;
