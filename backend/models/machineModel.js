import mongoose from 'mongoose';
import { calculateServiceReminder } from '../services/serviceReminderService.js';

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
    engineNumber: {
      type: String,
      trim: true,
      default: '',
    },
    purchaseDate: {
      type: Date,
      default: null,
    },
    manufacturingYear: {
      type: Number,
      default: null,
    },
    rcOwnerName: {
      type: String,
      trim: true,
      default: '',
    },
    insuranceExpiry: {
      type: Date,
      default: null,
    },
    fitnessExpiry: {
      type: Date,
      default: null,
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
    areaCovered: {
      type: Number,
      default: 0,
    },
    idleTime: {
      type: Number,
      default: 0,
    },
    firstServiceHours: {
      type: Number,
      default: 50,
    },
    regularServiceInterval: {
      type: Number,
      default: 250,
    },
    lastServiceHours: {
      type: Number,
      default: 0,
    },
    currentEngineHours: {
      type: Number,
      default: 0,
    },
    engineType: {
      type: String,
      default: 'Factory Integrated Engine',
    },
    lastServiceDate: {
      type: Date,
      default: null,
    },
    nextServiceDate: {
      type: Date,
      default: null,
    },
    serviceStatus: {
      type: String,
      enum: ['Good', 'Due Soon', 'Due Today', 'Overdue', 'Service Completed'],
      default: 'Good',
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

machineSchema.pre('save', function (next) {
  // Recalculate service reminder metrics
  const reminder = calculateServiceReminder(this);
  this.currentEngineHours = reminder.currentEngineHours;
  this.serviceStatus = reminder.serviceStatus;
  
  if (!this.lastServiceDate) {
    this.lastServiceDate = new Date(reminder.lastServiceDate);
  }
  // Recalculate nextServiceDate if it's missing or if related fields changed
  if (!this.nextServiceDate || this.isModified('lastServiceHours') || this.isModified('workingHours')) {
    this.nextServiceDate = new Date(reminder.nextServiceDate);
  }
  next();
});

const Machine = mongoose.model('Machine', machineSchema);
export default Machine;
