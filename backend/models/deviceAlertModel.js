import mongoose from 'mongoose';

const deviceAlertSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      trim: true,
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Machine',
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: { type: String, default: '' },
    },
    alertType: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['Engine', 'GPS', 'Power', 'Battery', 'Speed', 'Geofence', 'Maintenance', 'Security'],
      required: true,
    },
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Active', 'Resolved'],
      default: 'Active',
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

const DeviceAlert = mongoose.model('DeviceAlert', deviceAlertSchema);
export default DeviceAlert;
