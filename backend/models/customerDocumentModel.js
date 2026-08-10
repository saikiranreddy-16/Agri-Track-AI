import mongoose from 'mongoose';

const customerDocumentSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    documentType: {
      type: String,
      enum: ['Aadhaar', 'PAN', 'GST', 'RC', 'Insurance', 'Purchase Invoice', 'Installation Photo'],
      required: true,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    filePath: {
      type: String,
      required: true,
      trim: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const CustomerDocument = mongoose.model('CustomerDocument', customerDocumentSchema);
export default CustomerDocument;
