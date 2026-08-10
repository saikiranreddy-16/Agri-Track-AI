import mongoose from 'mongoose';

const farmSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Farm name is required'],
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner reference is required'],
    },
    // Soft Delete
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-find hook to exclude soft-deleted records
const excludeDeleted = function (next) {
  const query = this.getQuery();
  if (query && query.isDeleted !== undefined) {
    return next();
  }
  this.where({ isDeleted: { $ne: true } });
  next();
};

farmSchema.pre('find', excludeDeleted);
farmSchema.pre('findOne', excludeDeleted);
farmSchema.pre('findOneAndUpdate', excludeDeleted);
farmSchema.pre('countDocuments', excludeDeleted);

const Farm = mongoose.model('Farm', farmSchema);
export default Farm;
