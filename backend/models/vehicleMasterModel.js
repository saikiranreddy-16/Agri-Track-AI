import mongoose from 'mongoose';

const vehicleBrandSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  brandLogo: { type: String, default: '' },
  countryOfOrigin: { type: String, default: 'India' }
}, { timestamps: true });

const vehicleModelSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'VehicleBrand', required: true },
  vehicleType: { 
    type: String, 
    required: true, 
    enum: ['Tractor', 'Track Harvester', 'Combine Harvester', 'Harvester Attachment'], 
    trim: true 
  },
  hp: { type: Number, default: 50 },
  engineConfig: { type: String, enum: ['Integrated', 'External', 'Tractor-Driven', 'None'], default: 'Integrated' },
  series: { type: String, default: '' },
  vehicleImage: { type: String, default: '' },
  thumbnail: { type: String, default: '' },
  defaultColor: { type: String, default: 'Red' },
  fuelTankCapacity: { type: Number, default: 60 },
  engineOilCapacity: { type: Number, default: 8.5 },
  hydraulicOilCapacity: { type: Number, default: 35 },
  coolantCapacity: { type: Number, default: 9.5 },
  batterySpec: { type: String, default: '12V 88Ah Heavy Duty' },
  tyreSize: { type: String, default: '13.6-28 / 6.00-16' },
  recommendedServiceHours: { type: Number, default: 250 },
  averageFuelConsumption: { type: Number, default: 5.5 }, // L/hr
  ptoType: { type: String, default: '540 RPM Dual Speed' },
  driveType: { type: String, enum: ['2WD', '4WD', 'Track', 'Wheel'], default: '2WD' },
  compatibleImplements: [{ type: String }],
  compatibleHarvestAttachments: [{ type: String }],
  sparePartsCategory: { type: String, default: 'Standard OEM' },
  warrantyPeriod: { type: String, default: '2 Years / 2000 Hours' }
}, { timestamps: true });

const hpMasterSchema = new mongoose.Schema({
  hpValue: { type: String, required: true, trim: true },
  model: { type: mongoose.Schema.Types.ObjectId, ref: 'VehicleModel', required: true }
}, { timestamps: true });

export const VehicleBrand = mongoose.model('VehicleBrand', vehicleBrandSchema);
export const VehicleModel = mongoose.model('VehicleModel', vehicleModelSchema);
export const HPMaster = mongoose.model('HPMaster', hpMasterSchema);
