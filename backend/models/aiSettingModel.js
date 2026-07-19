import mongoose from 'mongoose';

const aiSettingSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      required: true,
      default: 'mock'
    },
    model: {
      type: String,
      required: true,
      default: 'default'
    },
    temperature: {
      type: Number,
      required: true,
      default: 0.4
    },
    topP: {
      type: Number,
      required: true,
      default: 0.9
    },
    maxTokens: {
      type: Number,
      required: true,
      default: 2048
    },
    timeout: {
      type: Number,
      required: true,
      default: 5000 // In milliseconds
    },
    retryAttempts: {
      type: Number,
      required: true,
      default: 2
    },
    cacheDuration: {
      type: Number,
      required: true,
      default: 10 // In minutes
    }
  },
  {
    timestamps: true
  }
);

const AISetting = mongoose.model('AISetting', aiSettingSchema);
export default AISetting;
