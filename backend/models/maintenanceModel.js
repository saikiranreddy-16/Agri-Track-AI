import mongoose from 'mongoose';

const maintenanceSchema = new mongoose.Schema(
  {
    machineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Machine',
      required: [true, 'Machine ID is required'],
      index: true,
    },
    task: {
      type: String,
      required: [true, 'Servicing/Maintenance task name is required'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Maintenance date is required'],
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    type: {
      type: String,
      required: [true, 'Maintenance type is required (e.g. Hydraulics, Engine, Electrical, Transmission)'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Upcoming', 'Completed'],
      default: 'Upcoming',
    },
    mechanic: {
      type: String,
      trim: true,
      default: '',
    },
    cost: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Maintenance = mongoose.model('Maintenance', maintenanceSchema);
export default Maintenance;
