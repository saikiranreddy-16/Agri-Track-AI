import mongoose from 'mongoose';

const deviceStatusHistorySchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    status: {
      type: String,
      required: true,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    details: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const DeviceStatusHistory = mongoose.model('DeviceStatusHistory', deviceStatusHistorySchema);
export default DeviceStatusHistory;
