import mongoose from 'mongoose';

const aiConversationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Machine',
      default: null,
    },
    prompt: {
      type: String,
      required: true,
    },
    response: {
      type: String,
      default: '',
    },
    tokens: {
      type: Number,
      default: 0,
    },
    provider: {
      type: String,
      required: true,
    },
    feedback: {
      type: String,
      enum: ['Thumb Up', 'Thumb Down', null],
      default: null,
    },
    latency: {
      type: Number,
      default: 0,
    },
    error: {
      type: String,
      default: null,
    },
    temperature: {
      type: Number,
      default: 0.7,
    },
    maxTokens: {
      type: Number,
      default: 1000,
    },
    model: {
      type: String,
      default: '',
    },
    language: {
      type: String,
      default: 'en',
    },
    time: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const AIConversation = mongoose.model('AIConversation', aiConversationSchema);
export default AIConversation;
