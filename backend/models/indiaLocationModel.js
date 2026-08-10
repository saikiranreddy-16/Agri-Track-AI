import mongoose from 'mongoose';

const stateSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true }
}, { timestamps: true });

const districtSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  state: { type: mongoose.Schema.Types.ObjectId, ref: 'State', required: true }
}, { timestamps: true });

const mandalSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  district: { type: mongoose.Schema.Types.ObjectId, ref: 'District', required: true }
}, { timestamps: true });

const villageSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  mandal: { type: mongoose.Schema.Types.ObjectId, ref: 'Mandal', required: true },
  pincode: { type: String, required: true, trim: true }
}, { timestamps: true });

export const State = mongoose.model('State', stateSchema);
export const District = mongoose.model('District', districtSchema);
export const Mandal = mongoose.model('Mandal', mandalSchema);
export const Village = mongoose.model('Village', villageSchema);
