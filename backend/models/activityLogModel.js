import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    userName: {
      type: String,
      default: 'System',
      trim: true,
    },
    action: {
      type: String,
      required: [true, 'Action is required'],
      trim: true,
    },
    details: {
      type: String,
      default: '',
      trim: true,
    },
    ipAddress: {
      type: String,
      default: '',
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

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
export default ActivityLog;
