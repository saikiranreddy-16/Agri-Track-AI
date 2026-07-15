import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true, // Allows null/missing emails for Farm Admins
    },
    password: {
      type: String,
      required: [true, 'PIN/Password is required'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
      default: '',
    },
    role: {
      type: String,
      enum: ['Company Admin', 'Farm Admin'],
      default: 'Farm Admin',
    },
    subscriptionStatus: {
      type: String,
      enum: ['Active', 'Inactive', 'Suspended'],
      default: 'Active',
    },
    subscriptionPlan: {
      type: String,
      default: 'Standard',
    },
    trustedDevices: [
      {
        deviceId: { type: String, required: true },
        deviceName: { type: String, default: '' },
        browser: { type: String, default: '' },
        os: { type: String, default: '' },
        loginTime: { type: Date, default: Date.now },
        lastActive: { type: Date, default: Date.now },
        ipAddress: { type: String, default: '' },
        trustedStatus: {
          type: String,
          enum: ['Trusted', 'Revoked'],
          default: 'Trusted',
        },
      },
    ],
    phoneHistory: [
      {
        phone: { type: String, required: true },
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      },
    ],
    isFirstLogin: {
      type: Boolean,
      default: true,
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
    timestamps: true, // Auto-manages createdAt and updatedAt
  }
);

// Indexes - phone unique index defined inline in field declaration.

// Hash password before saving to db
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password hashes
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Pre-find hook to exclude soft-deleted records
const excludeDeleted = function (next) {
  const query = this.getQuery();
  if (query && query.isDeleted !== undefined) {
    return next();
  }
  this.where({ isDeleted: { $ne: true } });
  next();
};

userSchema.pre('find', excludeDeleted);
userSchema.pre('findOne', excludeDeleted);
userSchema.pre('findOneAndUpdate', excludeDeleted);
userSchema.pre('countDocuments', excludeDeleted);

const User = mongoose.model('User', userSchema);
export default User;
