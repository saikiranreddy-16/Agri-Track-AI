import mongoose from 'mongoose';

const incomeSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Machine',
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    source: {
      type: String,
      enum: [
        'Custom Hire',
        'Harvesting Work',
        'Plowing',
        'Haulage',
        'Subsidy',
        'Other',
      ],
      default: 'Custom Hire',
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    remarks: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

incomeSchema.index({ vehicleId: 1, date: -1 });

const VehicleIncome = mongoose.model('VehicleIncome', incomeSchema);
export default VehicleIncome;
