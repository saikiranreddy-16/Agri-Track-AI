import mongoose from 'mongoose';

const serviceExpenseSchema = new mongoose.Schema(
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
    serviceCost: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      enum: [
        'Oil Change',
        'Engine Oil',
        'Hydraulic Oil',
        'Coolant',
        'Greasing',
        'Filters',
        'Battery',
        'Tyres',
        'Clutch',
        'Gear Box',
        'Others',
      ],
      default: 'Others',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    workshopName: {
      type: String,
      trim: true,
      default: '',
    },
    engineHours: {
      type: Number,
      default: 0,
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

serviceExpenseSchema.index({ vehicleId: 1, date: -1 });
serviceExpenseSchema.index({ customerId: 1, date: -1 });

const ServiceExpense = mongoose.model('ServiceExpense', serviceExpenseSchema);
export default ServiceExpense;
