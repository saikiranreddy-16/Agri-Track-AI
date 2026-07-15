import mongoose from 'mongoose';

const gpsDeviceSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: [true, 'Device ID is required'],
      unique: true,
      trim: true,
    },
    qrCode: {
      type: String,
      default: '',
    },
    firmwareVersion: {
      type: String,
      default: '1.0.0',
    },
    hardwareVersion: {
      type: String,
      default: '1.0.0',
    },
    imei: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    simNumber: {
      type: String,
      default: '',
      trim: true,
    },
    activationStatus: {
      type: String,
      enum: ['Activated', 'Deactivated', 'Pending'],
      default: 'Activated',
    },
    currentStatus: {
      type: String,
      enum: ['Online', 'Offline', 'Active', 'Inactive'],
      default: 'Offline',
    },
    manufacturingDate: {
      type: Date,
      default: null,
    },
    installationDate: {
      type: Date,
      default: null,
    },
    warrantyExpiry: {
      type: Date,
      default: null,
    },
    lastHeartbeat: {
      type: Date,
      default: null,
    },
    lastCommunicationTime: {
      type: Date,
      default: null,
    },
    deviceHealth: {
      type: String,
      enum: ['Good', 'Fair', 'Poor', 'Unknown'],
      default: 'Good',
    },
    currentVehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Machine',
      default: null,
    },
    previousVehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Machine',
      default: null,
    },
    replacementCount: {
      type: Number,
      default: 0,
    },
    // Backward compatibility support for old status logic
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Machine',
      default: null,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner/Customer reference is required'],
    },
    deactivationReason: {
      type: String,
      default: '',
    },
    deactivatedAt: {
      type: Date,
      default: null,
    },
    // Soft Delete
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
// Unique index for deviceId is defined inline on its field declaration.

// Pre-find hook to exclude soft-deleted records
const excludeDeleted = function (next) {
  const query = this.getQuery();
  if (query && query.isDeleted !== undefined) {
    return next();
  }
  this.where({ isDeleted: { $ne: true } });
  next();
};

gpsDeviceSchema.pre('find', excludeDeleted);
gpsDeviceSchema.pre('findOne', excludeDeleted);
gpsDeviceSchema.pre('findOneAndUpdate', excludeDeleted);
gpsDeviceSchema.pre('countDocuments', excludeDeleted);

const GPSDevice = mongoose.model('GPSDevice', gpsDeviceSchema);
export default GPSDevice;
