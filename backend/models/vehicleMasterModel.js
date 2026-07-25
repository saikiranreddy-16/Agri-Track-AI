import mongoose from 'mongoose';

const vehicleBrandSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true }
}, { timestamps: true });

const vehicleModelSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'VehicleBrand', required: true },
  vehicleType: { type: String, required: true, trim: true }, // e.g. Tractor, Harvester, Car, etc.
  engineConfig: { type: String, enum: ['None', 'Integrated', 'External'], default: 'None' },
  series: { type: String, default: '' }
}, { timestamps: true });

const hpMasterSchema = new mongoose.Schema({
  hpValue: { type: String, required: true, trim: true },
  model: { type: mongoose.Schema.Types.ObjectId, ref: 'VehicleModel', required: true }
}, { timestamps: true });

export const VehicleBrand = mongoose.model('VehicleBrand', vehicleBrandSchema);
export const VehicleModel = mongoose.model('VehicleModel', vehicleModelSchema);
export const HPMaster = mongoose.model('HPMaster', hpMasterSchema);
