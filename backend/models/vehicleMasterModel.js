import mongoose from 'mongoose';

const vehicleBrandSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  brandLogo: { type: String, default: '' }
}, { timestamps: true });

const vehicleModelSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'VehicleBrand', required: true },
  vehicleType: { type: String, required: true, trim: true }, // e.g. Tractor, Harvester, Sprayer
  engineConfig: { type: String, enum: ['None', 'Integrated', 'External'], default: 'None' },
  series: { type: String, default: '' },
  vehicleImage: { type: String, default: '' },
  thumbnail: { type: String, default: '' },
  specifications: {
    horsepower: { type: String, default: '' },
    engineCylinder: { type: String, default: '4 Cylinder' },
    fuelCapacityLitres: { type: Number, default: 60 },
    coolingSystem: { type: String, default: 'Water Cooled' }
  }
}, { timestamps: true });

const hpMasterSchema = new mongoose.Schema({
  hpValue: { type: String, required: true, trim: true },
  model: { type: mongoose.Schema.Types.ObjectId, ref: 'VehicleModel', required: true }
}, { timestamps: true });

export const VehicleBrand = mongoose.model('VehicleBrand', vehicleBrandSchema);
export const VehicleModel = mongoose.model('VehicleModel', vehicleModelSchema);
export const HPMaster = mongoose.model('HPMaster', hpMasterSchema);

