import mongoose from 'mongoose';

const aiMetricsSchema = new mongoose.Schema(
  {
    totalRequests: {
      type: Number,
      default: 0
    },
    successfulRequests: {
      type: Number,
      default: 0
    },
    failedRequests: {
      type: Number,
      default: 0
    },
    totalResponseTime: {
      type: Number,
      default: 0 // Accumulated time in ms
    },
    fastestResponse: {
      type: Number,
      default: 999999
    },
    slowestResponse: {
      type: Number,
      default: 0
    },
    cacheHits: {
      type: Number,
      default: 0
    },
    cacheMisses: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

const AIMetrics = mongoose.model('AIMetrics', aiMetricsSchema);
export default AIMetrics;
