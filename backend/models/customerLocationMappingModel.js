import mongoose from 'mongoose';

const customerLocationMappingSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    state: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'State',
      required: true,
    },
    district: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'District',
      required: true,
    },
    mandal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mandal',
      required: true,
    },
    village: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Village',
      required: true,
    },
    pincode: {
      type: String,
      required: true,
      trim: true,
    },
    addressLine: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const CustomerLocationMapping = mongoose.model('CustomerLocationMapping', customerLocationMappingSchema);
export default CustomerLocationMapping;
