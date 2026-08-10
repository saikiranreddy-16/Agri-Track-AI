import mongoose from 'mongoose';

const operatingExpenseSchema = new mongoose.Schema(
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
    category: {
      type: String,
      enum: [
        'Driver Salary',
        'Labour',
        'Loading',
        'Transport',
        'Parking',
        'Miscellaneous',
      ],
      default: 'Miscellaneous',
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    receiptPhoto: {
      type: String,
      default: '',
    },
    remarks: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

operatingExpenseSchema.index({ vehicleId: 1, date: -1 });

const OperatingExpense = mongoose.model('OperatingExpense', operatingExpenseSchema);
export default OperatingExpense;
