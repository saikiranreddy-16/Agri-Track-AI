import mongoose from 'mongoose';

const dieselExpenseSchema = new mongoose.Schema(
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
    dieselQuantity: {
      type: Number,
      required: true, // in Litres
      min: 0,
    },
    costPerLitre: {
      type: Number,
      required: true, // in currency
      min: 0,
    },
    totalCost: {
      type: Number,
      required: true, // dieselQuantity * costPerLitre
      min: 0,
    },
    petrolPumpName: {
      type: String,
      trim: true,
      default: '',
    },
    billPhoto: {
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

dieselExpenseSchema.index({ vehicleId: 1, date: -1 });
dieselExpenseSchema.index({ customerId: 1, date: -1 });

const DieselExpense = mongoose.model('DieselExpense', dieselExpenseSchema);
export default DieselExpense;
