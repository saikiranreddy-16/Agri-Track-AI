import mongoose from 'mongoose';

const adminLoginHistorySchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      trim: true,
    },
    adminName: {
      type: String,
      required: true,
      trim: true,
    },
    adminRole: {
      type: String,
      required: true,
    },
    loginTime: {
      type: Date,
      default: Date.now,
    },
    logoutTime: {
      type: Date,
      default: null,
    },
    sessionDuration: {
      type: String, // e.g. "45 mins", "2 hrs"
      default: 'Active',
    },
    browser: {
      type: String,
      default: 'Chrome 124',
    },
    os: {
      type: String,
      default: 'Windows 11',
    },
    deviceType: {
      type: String,
      default: 'Desktop',
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1',
    },
    city: {
      type: String,
      default: 'Hyderabad',
    },
    state: {
      type: String,
      default: 'Telangana',
    },
    loginStatus: {
      type: String,
      enum: ['Success', 'Failed'],
      default: 'Success',
    },
    failureReason: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

adminLoginHistorySchema.index({ employeeId: 1, loginTime: -1 });

const AdminLoginHistory = mongoose.model('AdminLoginHistory', adminLoginHistorySchema);
export default AdminLoginHistory;
