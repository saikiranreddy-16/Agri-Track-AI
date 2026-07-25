import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: [true, 'Alert type/title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Alert description message is required'],
      trim: true,
    },
    machineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Machine',
      default: null,
      index: true,
    },
    driverName: {
      type: String,
      default: 'Not Assigned',
      trim: true,
    },
    time: {
      type: Date,
      default: Date.now,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    category: {
      type: String,
      enum: ['Fuel', 'GPS', 'Maintenance', 'System', 'Engine', 'Power', 'Battery', 'Speed', 'Geofence', 'Security'],
      default: 'System',
    },
    deviceId: {
      type: String,
      default: '',
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    stateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'State',
      default: null,
    },
    districtId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'District',
      default: null,
    },
    exactLocation: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
      address: { type: String, default: '' },
    },
    status: {
      type: String,
      enum: ['Active', 'Resolved'],
      default: 'Active',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const Alert = mongoose.model('Alert', alertSchema);
export default Alert;
