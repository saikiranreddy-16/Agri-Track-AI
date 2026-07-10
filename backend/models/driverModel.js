import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Driver name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Driver phone number is required'],
      trim: true,
    },
    experience: {
      type: String,
      trim: true,
      default: '',
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 5,
    },
    status: {
      type: String,
      enum: ['Active', 'Off-duty', 'Suspended'],
      default: 'Active',
    },
    assignedMachineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Machine',
      default: null,
    },
    workingHoursToday: {
      type: Number,
      default: 0,
    },
    acresWorked: {
      type: Number,
      default: 0,
    },
    fuelEfficiency: {
      type: Number,
      default: 100, // percentage
    },
    attendance: {
      type: String,
      default: '100%',
    },
    photo: {
      type: String,
      default: '',
    },
    performanceData: [
      {
        month: { type: String, required: true },
        hours: { type: Number, default: 0 },
        acres: { type: Number, default: 0 },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Driver = mongoose.model('Driver', driverSchema);
export default Driver;
