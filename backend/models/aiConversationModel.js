import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['Like', 'Dislike', null],
      default: null
    },
    reason: {
      type: String,
      enum: ['Incorrect', 'Incomplete', 'Too Long', 'Hallucination', 'Other', null],
      default: null
    },
    comment: {
      type: String,
      default: ''
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    originalQuestion: {
      type: String,
      required: true,
    },
    optimizedPrompt: {
      type: String,
      default: '',
    },
    aiResponse: {
      type: String,
      default: '',
    },
    feedback: {
      type: feedbackSchema,
      default: () => ({})
    },
    timestamp: {
      type: Date,
      default: Date.now,
    }
  }
);

const aiConversationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userRole: {
      type: String,
      required: true,
    },
    farmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm',
      default: null,
    },
    vehicleIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Machine',
      }
    ],
    title: {
      type: String,
      required: true,
      default: 'New Conversation',
    },
    messages: [messageSchema],
    provider: {
      type: String,
      required: true,
      default: 'mock',
    },
    model: {
      type: String,
      required: true,
      default: 'mock',
    },
    responseTime: {
      type: Number,
      default: 0,
    },
    tokens: {
      type: Number,
      default: 0,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true,
  }
);

const AIConversation = mongoose.model('AIConversation', aiConversationSchema);
export default AIConversation;
