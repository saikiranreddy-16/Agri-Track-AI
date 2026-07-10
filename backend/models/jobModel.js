import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    machineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Machine',
      default: null,
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      default: null,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    timeline: [
      {
        date: { type: Date, default: Date.now },
        title: { type: String, required: true },
        desc: { type: String, default: '' },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Job = mongoose.model('Job', jobSchema);
export default Job;
