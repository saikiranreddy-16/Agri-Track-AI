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

// Pre-save hook to prevent modifications of existing activity logs
activityLogSchema.pre('save', function (next) {
  if (!this.isNew) {
    return next(new Error('Activity logs are immutable audit records and cannot be modified.'));
  }
  next();
});

// Query middleware to block update actions
activityLogSchema.pre(['updateOne', 'findByIdAndUpdate', 'findOneAndUpdate', 'updateMany'], function (next) {
  next(new Error('Activity logs are immutable audit records and cannot be updated.'));
});

// Query middleware to block delete actions
activityLogSchema.pre(['deleteOne', 'deleteMany', 'findOneAndDelete', 'findByIdAndDelete', 'remove'], function (next) {
  const options = this.getOptions();
  if (options && options.bypassImmutable) {
    return next();
  }
  next(new Error('Activity logs are immutable audit records and cannot be deleted.'));
});

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
export default ActivityLog;
