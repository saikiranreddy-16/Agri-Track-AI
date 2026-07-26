import mongoose from 'mongoose';

const adminAuditLogSchema = new mongoose.Schema(
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
    actionType: {
      type: String,
      required: true, // e.g. 'Created Customer', 'Edited Customer', 'Activated Device', 'Replaced Device', 'AI Settings Changed', 'Report Generated'
      enum: [
        'Created Customer',
        'Edited Customer',
        'Deleted Customer',
        'Activated Device',
        'Replaced Device',
        'Deactivated Device',
        'Report Generated',
        'Exported PDF',
        'Exported Excel',
        'AI Settings Changed',
        'Vehicle Registered',
        'Password Reset',
        'Customer Disabled',
        'Support Ticket Updated',
      ],
    },
    targetResource: {
      type: String,
      default: '',
    },
    details: {
      type: String,
      default: '',
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1',
    },
  },
  { timestamps: true }
);

adminAuditLogSchema.index({ employeeId: 1, createdAt: -1 });

const AdminAuditLog = mongoose.model('AdminAuditLog', adminAuditLogSchema);
export default AdminAuditLog;
