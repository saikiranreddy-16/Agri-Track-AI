import mongoose from 'mongoose';

const promptTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    version: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['Active', 'Draft', 'Deprecated'],
      default: 'Active'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Enforce unique name + version combination
promptTemplateSchema.index({ name: 1, version: 1 }, { unique: true });

const PromptTemplate = mongoose.model('PromptTemplate', promptTemplateSchema);
export default PromptTemplate;
