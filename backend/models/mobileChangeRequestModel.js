import mongoose from 'mongoose';

const mobileChangeRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    currentMobile: {
      type: String,
      required: [true, 'Current mobile number is required'],
    },
    requestedMobile: {
      type: String,
      required: [true, 'New requested mobile number is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // Admin user who approved/rejected the request
    },
    rejectionReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const MobileChangeRequest = mongoose.model('MobileChangeRequest', mobileChangeRequestSchema);
export default MobileChangeRequest;
