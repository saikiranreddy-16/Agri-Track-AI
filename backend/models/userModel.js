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
        phoneName: { type: String, default: '' },
        platform: { type: String, default: '' },
        lastLogin: { type: Date, default: Date.now },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    isFirstLogin: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Auto-manages createdAt and updatedAt
  }
);

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

const User = mongoose.model('User', userSchema);
export default User;
