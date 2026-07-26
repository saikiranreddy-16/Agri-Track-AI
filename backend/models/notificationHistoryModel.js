import mongoose from 'mongoose';

const notificationHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Machine',
      default: null,
    },
    deviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GPSDevice',
      default: null,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    eventType: {
      type: String,
      enum: [
        'Engine Started',
        'Engine Stopped',
        'GPS Offline',
        'Battery Low',
        'Overspeed',
        'Service Due',
        'Diesel Added',
        'Service Added',
        'Trip Completed',
        'Vehicle Idle',
        'Low Fuel',
        'General',
      ],
      default: 'General',
    },
    severity: {
      type: String,
      enum: ['Info', 'Warning', 'Critical'],
      default: 'Info',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

notificationHistorySchema.index({ userId: 1, createdAt: -1 });

const NotificationHistory = mongoose.model('NotificationHistory', notificationHistorySchema);
export default NotificationHistory;
