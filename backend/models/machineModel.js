import mongoose from 'mongoose';

const machineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Machine name is required'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Machine type is required (e.g. Tractor, Harvester, Sprayer)'],
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
      default: '',
    },
    model: {
      type: String,
      trim: true,
      default: '',
    },
    registration: {
      type: String,
      required: [true, 'Registration/License number is required'],
      unique: true,
      trim: true,
    },
    chassisNumber: {
      type: String,
      required: [true, 'Chassis number is required'],
      unique: true,
      trim: true,
      immutable: true, // Enforcement of Vehicle Chassis Immutability
    },
    gpsDeviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GPSDevice',
      default: null,
    },
    farmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm',
      required: [true, 'Farm reference is required'],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner reference is required'],
    },
    status: {
      type: String,
      enum: ['Working', 'Idle', 'Maintenance', 'Offline'],
      default: 'Idle',
    },
    fuel: {
      type: Number,
      default: 100, // percentage 0-100
      min: 0,
      max: 100,
    },
    battery: {
      type: Number,
      default: 100, // percentage 0-100
      min: 0,
      max: 100,
    },
    healthScore: {
      type: Number,
      default: 100, // calculated overall health score
      min: 0,
      max: 100,
    },
    assignedDriverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      default: null,
    },
    location: {
      lat: { type: Number, default: 0.0 },
      lng: { type: Number, default: 0.0 },
    },
    speed: {
      type: Number,
      default: 0,
    },
    heading: {
      type: Number,
      default: 0,
    },
    engineStatus: {
      type: String,
      enum: ['On', 'Off'],
      default: 'Off',
    },
    workingHours: {
      type: Number,
      default: 0,
    },
    distanceTravelled: {
      type: Number,
      default: 0,
    },
    nextService: {
      type: Date,
      default: null,
    },
    currentAddress: {
      type: String,
      default: '',
      trim: true,
    },
    photo: {
      type: String,
      default: '',
    },
    documents: [
      {
        type: String,
      },
    ],
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
machineSchema.index({ status: 1 });

// Pre-find hook to exclude soft-deleted records
const excludeDeleted = function (next) {
  const query = this.getQuery();
  if (query && query.isDeleted !== undefined) {
    return next();
  }
  this.where({ isDeleted: { $ne: true } });
  next();
};

machineSchema.pre('find', excludeDeleted);
machineSchema.pre('findOne', excludeDeleted);
machineSchema.pre('findOneAndUpdate', excludeDeleted);
machineSchema.pre('countDocuments', excludeDeleted);

const Machine = mongoose.model('Machine', machineSchema);
export default Machine;
