import mongoose from 'mongoose';

const fieldSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Field name is required'],
      trim: true,
    },
    area: {
      type: Number,
      required: [true, 'Area (in acres/hectares) is required'],
    },
    crop: {
      type: String,
      required: [true, 'Crop type is required'],
      trim: true,
    },
    owner: {
      type: String,
      trim: true,
      default: '',
    },
    machineAssigned: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Machine',
      default: null,
    },
    status: {
      type: String,
      enum: ['Planned', 'In Progress', 'Completed'],
      default: 'Planned',
    },
    boundaries: {
      type: [[Number]], // Array of [latitude, longitude] pairs defining the boundary polygon
      required: [true, 'Field boundary coordinates are required'],
    },
  },
  {
    timestamps: true,
  }
);

const Field = mongoose.model('Field', fieldSchema);
export default Field;
