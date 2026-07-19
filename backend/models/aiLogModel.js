import mongoose from 'mongoose';

const aiLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'Conversation Created',
        'Conversation Deleted',
        'Conversation Archived',
        'Message Sent',
        'AI Response Generated',
        'Feedback Submitted'
      ]
    },
    provider: {
      type: String,
      required: true,
      default: 'mock',
    },
    responseTime: {
      type: Number,
      default: 0, // response/execution time in milliseconds
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const AILog = mongoose.model('AILog', aiLogSchema);
export default AILog;
