import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load models
import User from '../models/userModel.js';
import Machine from '../models/machineModel.js';
import Field from '../models/fieldModel.js';
import Alert from '../models/alertModel.js';
import GPSDevice from '../models/gpsDeviceModel.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gps_db';

async function auditDatabase() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully. Auditing customer data...');

    const customers = await User.find({ role: 'Farm Admin' });
    console.log(`\nFound ${customers.length} Farm Admin Customers:\n`);

    for (const customer of customers) {
      console.log(`=========================================`);
      console.log(`CUSTOMER: ${customer.name}`);
      console.log(`Phone:    ${customer.phone}`);
      console.log(`Email:    ${customer.email}`);
      console.log(`Company:  ${customer.company}`);
      console.log(`-----------------------------------------`);

      // Find owned machines
      const machines = await Machine.find({ owner: customer._id }).populate('gpsDeviceId');
      console.log(`Vehicles Owned: ${machines.length}`);
      for (const mach of machines) {
        console.log(`  - Vehicle:  ${mach.name} (${mach.registration})`);
        console.log(`    Brand/Model: ${mach.brand} / ${mach.model}`);
        console.log(`    GPS Tracker: ${mach.gpsDeviceId ? mach.gpsDeviceId.deviceId : 'None'}`);
        console.log(`    Status:      ${mach.status} | Speed: ${mach.speed} km/h | Engine: ${mach.engineStatus}`);
      }

      // Find owned fields
      const fields = await Field.find({ owner: customer._id });
      console.log(`Fields Owned:   ${fields.length}`);
      for (const field of fields) {
        console.log(`  - Field: ${field.name} (${field.area} Hectares) - Crop: ${field.crop}`);
      }

      // Find alerts
      const alerts = await Alert.find({ customerId: customer._id });
      console.log(`Active Alerts:  ${alerts.length}`);
      for (const alert of alerts) {
        console.log(`  - Alert [${alert.priority}]: ${alert.type} - ${alert.message}`);
      }
      console.log(`=========================================\n`);
    }

  } catch (error) {
    console.error('Audit failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

auditDatabase();
