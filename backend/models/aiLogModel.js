import mongoose from 'mongoose';

const aiLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    promptType: {
      type: String,
      required: true,
      enum: ['chat', 'report', 'analysis', 'summary'],
    },
    executionTime: {
      type: Number,
      required: true, // in milliseconds
    },
    provider: {
      type: String,
      required: true,
      default: 'mock',
    },
    status: {
      type: String,
      required: true,
      enum: ['success', 'error'],
    },
  },
  {
    timestamps: true,
  }
);

const AILog = mongoose.model('AILog', aiLogSchema);
export default AILog;
