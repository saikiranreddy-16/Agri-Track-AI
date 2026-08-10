import mongoose from 'mongoose';

const deviceReplacementHistorySchema = new mongoose.Schema(
  {
    oldDeviceId: {
      type: String,
      required: [true, 'Old device ID is required'],
      trim: true,
    },
    newDeviceId: {
      type: String,
      required: [true, 'New device ID is required'],
      trim: true,
    },
    replacementDate: {
      type: Date,
      default: Date.now,
    },
    replacementReason: {
      type: String,
      required: [true, 'Replacement reason is required'],
      trim: true,
    },
    companyAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Company Admin who performed replacement is required'],
    },
    previousFirmware: {
      type: String,
      default: '1.0.0',
    },
    previousSim: {
      type: String,
      default: '',
    },
    previousVehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Machine',
      required: [true, 'Previous vehicle reference is required'],
    },
  },
  {
    timestamps: true,
  }
);

const DeviceReplacementHistory = mongoose.model('DeviceReplacementHistory', deviceReplacementHistorySchema);
export default DeviceReplacementHistory;
