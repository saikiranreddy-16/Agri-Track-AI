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
      enum: ['Fuel', 'GPS', 'Maintenance', 'System'],
      default: 'System',
    },
    status: {
      type: String,
      enum: ['Active', 'Resolved'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

const Alert = mongoose.model('Alert', alertSchema);
export default Alert;
