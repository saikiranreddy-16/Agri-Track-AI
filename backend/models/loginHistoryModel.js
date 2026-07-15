import mongoose from 'mongoose';

const loginHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // Allow null for failed logins where user is not found
    },
    userPhone: {
      type: String,
      default: '',
    },
    userEmail: {
      type: String,
      default: '',
    },
    time: {
      type: Date,
      default: Date.now,
    },
    device: {
      type: String,
      default: 'Unknown Device',
    },
    browser: {
      type: String,
      default: 'Unknown Browser',
    },
    ip: {
      type: String,
      default: '',
    },
    success: {
      type: Boolean,
      required: [true, 'Success status is required'],
    },
    logoutTime: {
      type: Date,
      default: null,
    },
    sessionDuration: {
      type: Number,
      default: null, // duration in seconds
    },
  },
  {
    timestamps: true,
  }
);

// Prevent deletion of login records
loginHistorySchema.pre(['deleteOne', 'deleteMany', 'findOneAndDelete', 'findByIdAndDelete', 'remove'], function (next) {
  next(new Error('Login history is permanent and records cannot be deleted.'));
});

const LoginHistory = mongoose.model('LoginHistory', loginHistorySchema);
export default LoginHistory;
