import mongoose from 'mongoose';

const aiUsageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    provider: {
      type: String,
      required: true
    },
    model: {
      type: String,
      required: true
    },
    requestCount: {
      type: Number,
      default: 0
    },
    tokenCount: {
      type: Number,
      default: 0
    },
    requestDate: {
      type: Date,
      default: Date.now
    },
    responseTime: {
      type: Number,
      default: 0 // average response time in ms
    },
    successCount: {
      type: Number,
      default: 0
    },
    failedCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Indexed to speed up stats retrieval by day and user
aiUsageSchema.index({ user: 1, requestDate: 1, provider: 1, model: 1 }, { unique: true });

const AIUsage = mongoose.model('AIUsage', aiUsageSchema);
export default AIUsage;
