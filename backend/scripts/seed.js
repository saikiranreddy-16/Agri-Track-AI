import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load models
import User from '../models/userModel.js';
import Driver from '../models/driverModel.js';
import Machine from '../models/machineModel.js';
import Field from '../models/fieldModel.js';
import Job from '../models/jobModel.js';
import GPSHistory from '../models/gpsHistoryModel.js';
import FuelHistory from '../models/fuelHistoryModel.js';
import Maintenance from '../models/maintenanceModel.js';
import Alert from '../models/alertModel.js';
import ActivityLog from '../models/activityLogModel.js';
import Farm from '../models/farmModel.js';
import GPSDevice from '../models/gpsDeviceModel.js';
import { State, District, Mandal, Village } from '../models/indiaLocationModel.js';
import { VehicleBrand, VehicleModel, HPMaster } from '../models/vehicleMasterModel.js';
import CustomerLocationMapping from '../models/customerLocationMappingModel.js';
import DeviceStatusHistory from '../models/deviceStatusHistoryModel.js';
import CustomerDocument from '../models/customerDocumentModel.js';
import DeviceAlert from '../models/deviceAlertModel.js';
import LoginHistory from '../models/loginHistoryModel.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gps_db';

const seedDatabase = async () => {
  try {
    console.log('Connecting to database for seeding production admin hierarchy...');
    await mongoose.connect(MONGODB_URI);
    console.log(`Connected to: ${mongoose.connection.host}`);

    // Clear existing data completely
    console.log('Purging legacy data and demo accounts...');
    await User.deleteMany({});
    await Driver.deleteMany({});
    await Machine.deleteMany({});
    await Field.deleteMany({});
    await Job.deleteMany({});
    await GPSHistory.deleteMany({});
    await FuelHistory.deleteMany({});
    await Maintenance.deleteMany({});
    await Alert.deleteMany({});
    await ActivityLog.deleteMany({}, { bypassImmutable: true });
    await Farm.deleteMany({});
    await GPSDevice.deleteMany({});
    await State.deleteMany({});
    await District.deleteMany({});
    await Mandal.deleteMany({});
    await Village.deleteMany({});
    await VehicleBrand.deleteMany({});
    await VehicleModel.deleteMany({});
    await HPMaster.deleteMany({});
    await CustomerLocationMapping.deleteMany({});
    await DeviceStatusHistory.deleteMany({});
    await CustomerDocument.deleteMany({});
    await DeviceAlert.deleteMany({});
    await LoginHistory.collection.deleteMany({});
    console.log('Database cleared.');

    // 1. Seed Geographic Hierarchy (Telangana & Andhra Pradesh)
    console.log('Seeding Regional Geographic Hierarchy...');
    
    // Telangana Hierarchy
    const telangana = await State.create({ name: 'Telangana' });
    const nalgondaDist = await District.create({ name: 'Nalgonda', state: telangana._id });
    const madgulapallyMandal = await Mandal.create({ name: 'Madgulapally', district: nalgondaDist._id });
    const villageCheruvupally = await Village.create({ name: 'Cheruvupally', mandal: madgulapallyMandal._id, pincode: '508374' });

    const bhupalpallyDist = await District.create({ name: 'Jayashankar Bhupalpally', state: telangana._id });
    const kataramMandal = await Mandal.create({ name: 'Kataram', district: bhupalpallyDist._id });
    const villageAzamnagar = await Village.create({ name: 'Azamnagar', mandal: kataramMandal._id, pincode: '506169' });

    const khammamDist = await District.create({ name: 'Khammam', state: telangana._id });
    const sujathanagarMandal = await Mandal.create({ name: 'Sujathanagar', district: khammamDist._id });
    const villageSarvaram = await Village.create({ name: 'Sarvaram', mandal: sujathanagarMandal._id, pincode: '507120' });

    // Andhra Pradesh Hierarchy
    const andhraPradesh = await State.create({ name: 'Andhra Pradesh' });
    const palnaduDist = await District.create({ name: 'Palnadu', state: andhraPradesh._id });
    const gurazalaMandal = await Mandal.create({ name: 'Gurazala', district: palnaduDist._id });
    const villageMadugula = await Village.create({ name: 'Madugula', mandal: gurazalaMandal._id, pincode: '522415' });

    const westGodavariDist = await District.create({ name: 'West Godavari', state: andhraPradesh._id });
    const tanukuMandal = await Mandal.create({ name: 'Tanuku', district: westGodavariDist._id });
    const villageTaderu = await Village.create({ name: 'Taderu', mandal: tanukuMandal._id, pincode: '534202' });

    const locationList = [
      { state: telangana, district: nalgondaDist, mandal: madgulapallyMandal, village: villageCheruvupally, address: 'Cheruvupally Village, Madgulapally, Nalgonda, Telangana', lat: 16.8924, lng: 79.5241 },
      { state: telangana, district: bhupalpallyDist, mandal: kataramMandal, village: villageAzamnagar, address: 'Azamnagar Village, Kataram, Jayashankar Bhupalpally, Telangana', lat: 18.5284, lng: 79.9142 },
      { state: telangana, district: khammamDist, mandal: sujathanagarMandal, village: villageSarvaram, address: 'Sarvaram Village, Sujathanagar, Khammam, Telangana', lat: 17.2473, lng: 80.1514 },
      { state: andhraPradesh, district: palnaduDist, mandal: gurazalaMandal, village: villageMadugula, address: 'Madugula Village, Gurazala, Palnadu, Andhra Pradesh', lat: 16.5812, lng: 79.8315 },
      { state: andhraPradesh, district: westGodavariDist, mandal: tanukuMandal, village: villageTaderu, address: 'Taderu Village, Tanuku, West Godavari, Andhra Pradesh', lat: 16.8614, lng: 81.6984 }
    ];

    // 2. Seed Admin Hierarchy (4 Levels)
    console.log('Seeding 4-Level Admin Hierarchy...');

    // Level 1: Grand Master Admin (All India)
    const grandMaster = await User.create({
      name: 'Ravi Kumar',
      email: 'ravi.kumar@gmail.com',
      password: 'Agri@2026',
      phone: '+919900112233',
      company: 'AgriTrack Corporate HQ',
      role: 'Grand Master Admin',
      department: 'Executive Management',
      designation: 'Chief Operations Officer',
      permissions: { fleet: true, customers: true, devices: true, reports: true, analytics: true, aiAdmin: true, userManagement: true, settings: true },
      isFirstLogin: false
    });

    // Level 2: Regional Master Admin - South India
    const southMasterAdmin = await User.create({
      name: 'Mahesh Reddy',
      email: 'mahesh.reddy@gmail.com',
      password: 'Farm#4589',
      phone: '+919911223344',
      company: 'AgriTrack South India Zone',
      role: 'Master Admin',
      department: 'Regional Operations',
      designation: 'Regional Operations Director',
      assignedStates: ['Telangana', 'Andhra Pradesh', 'Karnataka', 'Tamil Nadu', 'Kerala'],
      permissions: { fleet: true, customers: true, devices: true, reports: true, analytics: true, aiAdmin: true, userManagement: true, settings: false },
      isFirstLogin: false
    });

    // Level 2: Regional Master Admin - North India (Placeholder Inactive)
    await User.create({
      name: 'Srinivas Rao',
      email: 'srinivas.rao@gmail.com',
      password: 'Track@5432',
      phone: '+919922334455',
      company: 'AgriTrack North Zone',
      role: 'Master Admin',
      department: 'Regional Operations',
      designation: 'Regional Manager',
      accountStatus: 'Inactive',
      permissions: { fleet: true, customers: true, devices: true, reports: true, analytics: true, aiAdmin: true, userManagement: false, settings: false },
      isFirstLogin: false
    });

    // Level 3: State Admin - Telangana State
    const tgStateAdmin = await User.create({
      name: 'Praveen Kumar',
      email: 'praveen.kumar@gmail.com',
      password: 'Secure@9182',
      phone: '+919933445566',
      company: 'AgriTrack Telangana Operations',
      role: 'State Admin',
      department: 'State Management',
      designation: 'State Operations Manager',
      assignedStates: ['Telangana'],
      assignedState: 'Telangana',
      permissions: { fleet: true, customers: true, devices: true, reports: true, analytics: true, aiAdmin: false, userManagement: false, settings: false },
      isFirstLogin: false
    });

    // Level 3: State Admin - Andhra Pradesh State
    const apStateAdmin = await User.create({
      name: 'Lakshmi Prasad',
      email: 'lakshmi.prasad@gmail.com',
      password: 'Agri@2026',
      phone: '+919944556677',
      company: 'AgriTrack Andhra Pradesh Operations',
      role: 'State Admin',
      department: 'State Management',
      designation: 'State Operations Manager',
      assignedStates: ['Andhra Pradesh'],
      assignedState: 'Andhra Pradesh',
      permissions: { fleet: true, customers: true, devices: true, reports: true, analytics: true, aiAdmin: false, userManagement: false, settings: false },
      isFirstLogin: false
    });

    // Level 4: Farm Admins (Customers)
    const customerData = [
      {
        name: 'Ch. Sai Reddy',
        email: 'saireddy.reddy@gmail.com',
        password: 'Farm#4589',
        phone: '+919876543210',
        alternatePhone: '+919876543220',
        company: 'Sai Reddy Farms',
        role: 'Farm Admin',
        isFirstLogin: false,
        locIdx: 0
      },
      {
        name: 'M. Srinivas Reddy',
        email: 'srinivas.reddy@gmail.com',
        password: 'Track@5432',
        phone: '+919123456784',
        alternatePhone: '+919123456794',
        company: 'Srinivas Agro Services',
        role: 'Farm Admin',
        isFirstLogin: false,
        locIdx: 1
      },
      {
        name: 'K. Ramesh',
        email: 'ramesh.kumar@gmail.com',
        password: 'Secure@9182',
        phone: '+919345678123',
        alternatePhone: '+919345678133',
        company: 'Ramesh Harvester Works',
        role: 'Farm Admin',
        isFirstLogin: false,
        locIdx: 2
      },
      {
        name: 'G. Venkateswarlu',
        email: 'venkateswarlu.g@gmail.com',
        password: 'Agri@2026',
        phone: '+919012345678',
        alternatePhone: '+919012345688',
        company: 'Venkateswarlu Crop Logistics',
        role: 'Farm Admin',
        isFirstLogin: false,
        locIdx: 3
      },
      {
        name: 'P. Narasimha Rao',
        email: 'narasimha.rao@gmail.com',
        password: 'Farm#4589',
        phone: '+919567891234',
        alternatePhone: '+919567891244',
        company: 'Narasimha Combine Services',
        role: 'Farm Admin',
        isFirstLogin: false,
        locIdx: 4
      }
    ];

    const seededCustomers = [];
    for (const c of customerData) {
      const locInfo = locationList[c.locIdx];
      const userObj = await User.create({
        name: c.name,
        email: c.email,
        password: c.password,
        phone: c.phone,
        alternatePhone: c.alternatePhone,
        company: c.company,
        role: c.role,
        isFirstLogin: c.isFirstLogin
      });
      seededCustomers.push(userObj);

      await CustomerLocationMapping.create({
        customer: userObj._id,
        state: locInfo.state._id,
        district: locInfo.district._id,
        mandal: locInfo.mandal._id,
        village: locInfo.village._id,
        pincode: locInfo.village.pincode,
        addressLine: locInfo.address
      });
    }
    console.log(`Seeded 5 Admin users and ${seededCustomers.length} Farm Admins (Customers).`);

    // 3. Seed Comprehensive Commercial Vehicle Brands & Models Master Data
    console.log('Seeding Commercial Vehicle Master Catalog...');
    const brandMap = {};
    const brandNames = [
      'John Deere', 'Mahindra', 'Swaraj', 'Kubota', 'New Holland', 'Sonalika',
      'Massey Ferguson', 'Eicher', 'Farmtrac', 'ACE', 'Indo Farm', 'Powertrac',
      'LOVOL', 'GAM', 'Yanmar', 'Fieldking', 'Vishal', 'Delta', 'Oryza',
      'Preet', 'Kartar', 'Dashmesh', 'Balkar', 'Standard', 'Ghar', 'CLAAS', 'Green Gold'
    ];

    for (const bName of brandNames) {
      brandMap[bName] = await VehicleBrand.create({ name: bName, brandLogo: `/uploads/brands/${bName.toLowerCase().replace(/ /g, '_')}.png` });
    }

    // 1. Tractors
    const tractorModels = [
      { brand: 'John Deere', name: '5042D', hp: 42 },
      { brand: 'John Deere', name: '5050D', hp: 50 },
      { brand: 'John Deere', name: '5055E', hp: 55 },
      { brand: 'John Deere', name: '5075E', hp: 75, compatibleHarvestAttachments: ['Green Gold Harvest Box'] },
      { brand: 'John Deere', name: '5105', hp: 40 },
      { brand: 'John Deere', name: '5210', hp: 50 },
      { brand: 'John Deere', name: '5310', hp: 55, compatibleHarvestAttachments: ['Green Gold Harvest Box'] },
      { brand: 'John Deere', name: '5405', hp: 63, compatibleHarvestAttachments: ['Green Gold Harvest Box'] },
      
      { brand: 'Mahindra', name: '275 DI XP Plus', hp: 37 },
      { brand: 'Mahindra', name: '415 DI', hp: 40 },
      { brand: 'Mahindra', name: '475 DI', hp: 42 },
      { brand: 'Mahindra', name: 'Yuvo Tech Plus 575', hp: 47, compatibleHarvestAttachments: ['Green Gold Harvest Box'] },
      { brand: 'Mahindra', name: 'Arjun 605 DI', hp: 60 },
      { brand: 'Mahindra', name: 'Arjun Novo 605', hp: 60, compatibleHarvestAttachments: ['Green Gold Harvest Box'] },

      { brand: 'Swaraj', name: '735 FE', hp: 40 },
      { brand: 'Swaraj', name: '744 FE', hp: 48 },
      { brand: 'Swaraj', name: '855 FE', hp: 52 },
      { brand: 'Swaraj', name: '960 FE', hp: 55 },
      { brand: 'Swaraj', name: '963 FE', hp: 60, compatibleHarvestAttachments: ['Green Gold Harvest Box'] },
      { brand: 'Swaraj', name: '969 FE', hp: 65, compatibleHarvestAttachments: ['Green Gold Harvest Box'] },

      { brand: 'Kubota', name: 'NeoStar B2441', hp: 24 },
      { brand: 'Kubota', name: 'MU4501', hp: 45 },
      { brand: 'Kubota', name: 'MU5502 4WD', hp: 55, compatibleHarvestAttachments: ['Green Gold Harvest Box'] },
      { brand: 'Kubota', name: 'MU5702', hp: 57 },

      { brand: 'New Holland', name: '3230 NX', hp: 42 },
      { brand: 'New Holland', name: '3600 TX', hp: 50 },
      { brand: 'New Holland', name: '3630 TX', hp: 55, compatibleHarvestAttachments: ['Green Gold Harvest Box'] },
      { brand: 'New Holland', name: '5620 TX', hp: 65 },

      { brand: 'Sonalika', name: 'DI 35', hp: 39 },
      { brand: 'Sonalika', name: 'DI 42', hp: 45 },
      { brand: 'Sonalika', name: 'DI 50', hp: 52 },
      { brand: 'Sonalika', name: 'DI 60', hp: 60, compatibleHarvestAttachments: ['Green Gold Harvest Box'] },
      { brand: 'Sonalika', name: 'Tiger 65', hp: 65 },

      { brand: 'Massey Ferguson', name: '241 DI', hp: 42 },
      { brand: 'Massey Ferguson', name: '245 DI', hp: 50 },
      { brand: 'Massey Ferguson', name: '7250 DI', hp: 50 },

      { brand: 'Eicher', name: '380', hp: 40 },
      { brand: 'Eicher', name: '480', hp: 45 },
      { brand: 'Eicher', name: '551', hp: 49 },

      { brand: 'Farmtrac', name: '45 Classic', hp: 45 },
      { brand: 'Farmtrac', name: '60 PowerMaxx', hp: 55 },

      { brand: 'ACE', name: 'DI 450 NG', hp: 45 },
      { brand: 'ACE', name: 'DI 6565', hp: 65 },

      { brand: 'Indo Farm', name: '3055', hp: 55 },
      { brand: 'Indo Farm', name: '3065', hp: 65 },

      { brand: 'Powertrac', name: 'Euro 50', hp: 50 },
      { brand: 'Powertrac', name: 'Euro 55', hp: 55 },
      { brand: 'Powertrac', name: 'Euro 60', hp: 60 }
    ];

    for (const tm of tractorModels) {
      await VehicleModel.create({
        brand: brandMap[tm.brand]._id,
        name: tm.name,
        vehicleType: 'Tractor',
        hp: tm.hp,
        engineConfig: 'Integrated',
        driveType: tm.name.includes('4WD') ? '4WD' : '2WD',
        compatibleHarvestAttachments: tm.compatibleHarvestAttachments || []
      });
    }

    // 2. Track Harvesters
    const trackHarvesterModels = [
      { brand: 'LOVOL', name: 'RG108 Plus CR', hp: 100 },
      { brand: 'LOVOL', name: 'RG1104', hp: 110 },
      { brand: 'GAM', name: 'GH100', hp: 100 },
      { brand: 'GAM', name: 'GH120', hp: 120 },
      { brand: 'Kubota', name: 'DC-70 Plus', hp: 70 },
      { brand: 'Kubota', name: 'DC-93', hp: 93 },
      { brand: 'Yanmar', name: 'YH700', hp: 70 },
      { brand: 'Yanmar', name: 'YH850', hp: 85 },
      { brand: 'Fieldking', name: 'FK Track Harvester Series', hp: 105 },
      { brand: 'Vishal', name: 'VH Series', hp: 100 },
      { brand: 'Delta', name: 'Delta Track Series', hp: 98 },
      { brand: 'Oryza', name: 'OR Track Series', hp: 102 }
    ];

    for (const thm of trackHarvesterModels) {
      await VehicleModel.create({
        brand: brandMap[thm.brand]._id,
        name: thm.name,
        vehicleType: 'Track Harvester',
        hp: thm.hp,
        engineConfig: 'Integrated',
        driveType: 'Track'
      });
    }

    // 3. Combine Harvesters
    const combineHarvesterModels = [
      { brand: 'Preet', name: '987 Combine Harvester', hp: 75, engineConfig: 'Integrated' },
      { brand: 'Kartar', name: '4000', hp: 101, engineConfig: 'Integrated' },
      { brand: 'Kartar', name: '3500', hp: 76, engineConfig: 'Integrated' },
      { brand: 'Dashmesh', name: '3100', hp: 101, engineConfig: 'External' },
      { brand: 'Dashmesh', name: '912', hp: 76, engineConfig: 'External' },
      { brand: 'Balkar', name: 'B525', hp: 101, engineConfig: 'External' },
      { brand: 'Balkar', name: 'B600', hp: 110, engineConfig: 'External' },
      { brand: 'Standard', name: 'ST Series', hp: 101, engineConfig: 'External' },
      { brand: 'Ghar', name: 'GH Series', hp: 95, engineConfig: 'External' },
      { brand: 'CLAAS', name: 'Dominator Series', hp: 120, engineConfig: 'Integrated' },
      { brand: 'New Holland', name: 'TC5.30', hp: 130, engineConfig: 'Integrated' },
      { brand: 'Yanmar', name: 'YH Series Combine', hp: 110, engineConfig: 'Integrated' }
    ];

    for (const chm of combineHarvesterModels) {
      await VehicleModel.create({
        brand: brandMap[chm.brand]._id,
        name: chm.name,
        vehicleType: 'Combine Harvester',
        hp: chm.hp,
        engineConfig: chm.engineConfig,
        driveType: 'Wheel'
      });
    }

    // 4. Harvester Attachment (Green Gold Box)
    await VehicleModel.create({
      brand: brandMap['Green Gold']._id,
      name: 'Green Gold Harvest Box',
      vehicleType: 'Harvester Attachment',
      hp: 0,
      engineConfig: 'Tractor-Driven',
      driveType: 'Wheel',
      sparePartsCategory: 'Harvest Box Blades & Elevator Belts'
    });

    // 4. Seed Drivers
    console.log('Seeding Drivers/Operators...');
    const drivers = [];
    const driverNames = ['Ravi Kumar', 'Suresh Babu', 'Venkatesh', 'Mahesh', 'Kiran'];
    for (let i = 0; i < seededCustomers.length; i++) {
      const drv = await Driver.create({
        name: driverNames[i],
        phone: `+91981100220${i+1}`,
        licenseNumber: `DL-TG-2026-00000${i+1}`,
        status: 'Active',
        owner: seededCustomers[i]._id
      });
      drivers.push(drv);
    }

    // 5. Seed Vehicles & GPS Devices
    console.log('Seeding Vehicles & GPS Devices...');
    const vehicleSpecs = [
      {
        name: 'John Deere 5042D',
        type: 'Tractor',
        brand: 'John Deere',
        model: '5042D',
        chassisNumber: 'JD-5042D-2026-000001',
        registration: 'Not Registered Yet',
        driveType: '2WD',
        color: 'Green',
        purchaseYear: 2026,
        fuelTankCapacity: 60,
        batterySpec: '12V 88Ah Heavy Duty',
        deviceId: 'AGRTG00001',
        iccid: '89911012000045698731',
        imei: '357894561245871',
        simNumber: '+919820456721',
        currentStatus: 'Running',
        speed: 18,
        fuelLevel: 72,
        rpm: 1950,
        temp: 84,
        batteryVolt: 13.8,
        workingHours: 245
      },
      {
        name: 'Kubota MU5502 4WD',
        type: 'Tractor',
        brand: 'Kubota',
        model: 'MU5502 4WD',
        chassisNumber: 'KB-MU5502-2025-000002',
        registration: 'Not Registered Yet',
        driveType: '4WD',
        color: 'Orange',
        purchaseYear: 2025,
        fuelTankCapacity: 65,
        batterySpec: '12V 90Ah Heavy Duty',
        deviceId: 'AGRTG00002',
        iccid: '89911012000045698732',
        imei: '357894561245872',
        simNumber: '+919820456722',
        currentStatus: 'Idle',
        speed: 0,
        fuelLevel: 81,
        rpm: 800,
        temp: 78,
        batteryVolt: 13.2,
        workingHours: 320
      },
      {
        name: 'LOVOL RG108 Plus CR',
        type: 'Track Harvester',
        brand: 'LOVOL',
        model: 'RG108 Plus CR',
        chassisNumber: 'LV-RG108-2025-000003',
        registration: 'Not Registered Yet',
        driveType: 'Track',
        color: 'Red',
        purchaseYear: 2025,
        fuelTankCapacity: 140,
        batterySpec: '12V 100Ah Heavy Duty',
        deviceId: 'AGRTG00003',
        iccid: '89911012000045698733',
        imei: '357894561245873',
        simNumber: '+919820456723',
        currentStatus: 'Running',
        speed: 12,
        fuelLevel: 68,
        rpm: 2100,
        temp: 88,
        batteryVolt: 13.9,
        workingHours: 410
      },
      {
        name: 'Mahindra Yuvo Tech Plus 575',
        type: 'Tractor',
        brand: 'Mahindra',
        model: 'Yuvo Tech Plus 575',
        chassisNumber: 'MH-YT575-2026-000004',
        registration: 'Not Registered Yet',
        driveType: '2WD',
        color: 'Red',
        purchaseYear: 2026,
        fuelTankCapacity: 60,
        batterySpec: '12V 88Ah Heavy Duty',
        deviceId: 'AGRAP00004',
        iccid: '89911012000045698734',
        imei: '357894561245874',
        simNumber: '+919820456724',
        currentStatus: 'Stopped',
        speed: 0,
        fuelLevel: 63,
        rpm: 0,
        temp: 45,
        batteryVolt: 12.6,
        workingHours: 180
      },
      {
        name: 'Preet 987 Combine Harvester',
        type: 'Combine Harvester',
        brand: 'Preet',
        model: '987 Combine Harvester',
        chassisNumber: 'PR-987CH-2025-000005',
        registration: 'Not Registered Yet',
        driveType: 'Wheel',
        color: 'Red + White',
        purchaseYear: 2025,
        fuelTankCapacity: 150,
        batterySpec: '12V 120Ah Heavy Duty',
        deviceId: 'AGRAP00005',
        iccid: '89911012000045698735',
        imei: '357894561245875',
        simNumber: '+919820456725',
        currentStatus: 'Running',
        speed: 15,
        fuelLevel: 75,
        rpm: 2050,
        temp: 86,
        batteryVolt: 13.7,
        workingHours: 510
      }
    ];

    const seededMachines = [];
    const seededDevices = [];

    for (let i = 0; i < seededCustomers.length; i++) {
      const owner = seededCustomers[i];
      const spec = vehicleSpecs[i];
      const loc = locationList[i];

      // Create GPS Device
      const gpsDevice = await GPSDevice.create({
        deviceId: spec.deviceId,
        imei: spec.imei,
        simNumber: spec.simNumber,
        iccid: spec.iccid,
        activationStatus: 'Activated',
        currentStatus: spec.currentStatus === 'Running' || spec.currentStatus === 'Idle' ? 'Online' : 'Offline',
        installerName: 'AgriTrack Field Ops',
        installationLocation: loc.address,
        vehicleOdometer: spec.workingHours * 15,
        owner: owner._id,
        assignedCustomer: owner._id,
        deviceSerialNumber: `SN-${spec.deviceId}`,
        batteryLevel: spec.currentStatus === 'Stopped' ? 85 : 98
      });
      seededDevices.push(gpsDevice);

      // Create Farm
      const farm = await Farm.create({
        name: `${owner.name}'s Agricultural Field`,
        owner: owner._id,
        location: {
          type: 'Point',
          coordinates: [loc.lng, loc.lat]
        },
        address: loc.address,
        areaAcres: 25 + i * 10
      });

      // Create Machine
      const machine = await Machine.create({
        name: spec.name,
        type: spec.type,
        brand: spec.brand,
        model: spec.model,
        registration: spec.registration,
        chassisNumber: spec.chassisNumber,
        driveType: spec.driveType,
        color: spec.color,
        purchaseYear: spec.purchaseYear,
        fuelTankCapacity: spec.fuelTankCapacity,
        batterySpec: spec.batterySpec,
        farmId: farm._id,
        owner: owner._id,
        assignedDriver: drivers[i]._id,
        gpsDevice: gpsDevice._id,
        status: spec.currentStatus === 'Running' ? 'Working' : spec.currentStatus === 'Idle' ? 'Idle' : 'Offline',
        currentLocation: {
          type: 'Point',
          coordinates: [loc.lng, loc.lat]
        },
        exactLocation: {
          lat: loc.lat,
          lng: loc.lng,
          address: loc.address
        },
        telemetry: {
          speed: spec.speed,
          rpm: spec.rpm,
          fuelLevel: spec.fuelLevel,
          engineTemperature: spec.temp,
          batteryVoltage: spec.batteryVolt,
          workingHours: spec.workingHours,
          gpsAccuracy: 2.5,
          signalStrength: 92,
          satelliteCount: 14,
          lastUpdated: new Date()
        }
      });
      seededMachines.push(machine);

      // Link Machine to GPS Device
      gpsDevice.assignedMachine = machine._id;
      await gpsDevice.save();

      // Link Machine to Driver
      drivers[i].assignedMachine = machine._id;
      await drivers[i].save();

      // 6. Seed Telemetry & GPS History (30 Days)
      const now = Date.now();
      const historyPoints = [];

      for (let day = 30; day >= 0; day--) {
        const timestamp = new Date(now - day * 24 * 60 * 60 * 1000);
        const latOffset = (Math.sin(day) * 0.005);
        const lngOffset = (Math.cos(day) * 0.005);
        
        historyPoints.push({
          machineId: machine._id,
          latitude: loc.lat + latOffset,
          longitude: loc.lng + lngOffset,
          speed: spec.currentStatus === 'Stopped' ? 0 : 10 + (day % 10),
          heading: 90,
          engineStatus: spec.currentStatus === 'Stopped' ? 'Off' : 'On',
          fuel: Math.max(20, spec.fuelLevel - (day % 15)),
          workingHours: spec.workingHours - (day * 2),
          distanceTravelled: (30 - day) * 12,
          timestamp: timestamp
        });
      }
      await GPSHistory.insertMany(historyPoints);

      // 7. Seed Fuel History (30 Days)
      const fuelEntries = [
        { machineId: machine._id, level: Math.max(10, spec.fuelLevel - 30), timestamp: new Date(now - 25 * 24 * 3600 * 1000) },
        { machineId: machine._id, level: Math.max(15, spec.fuelLevel - 15), timestamp: new Date(now - 12 * 24 * 3600 * 1000) },
        { machineId: machine._id, level: spec.fuelLevel, timestamp: new Date(now - 2 * 24 * 3600 * 1000) }
      ];
      await FuelHistory.insertMany(fuelEntries);

      // 8. Seed Maintenance / Service History
      const maintenanceRecords = [
        {
          machineId: machine._id,
          task: 'Engine Oil Change & Filter Replacement',
          date: new Date(now - 20 * 24 * 3600 * 1000),
          priority: 'High',
          type: 'Engine',
          status: 'Completed',
          mechanic: 'Authorized Service Center',
          cost: 4500
        },
        {
          machineId: machine._id,
          task: 'Hydraulic Oil & Greasing Check',
          date: new Date(now - 60 * 24 * 3600 * 1000),
          priority: 'Medium',
          type: 'Hydraulics',
          status: 'Completed',
          mechanic: 'AgriTrack Field Mechanic',
          cost: 2800
        }
      ];
      await Maintenance.insertMany(maintenanceRecords);

      // 9. Seed Realistic Notifications / Device Alerts
      const alerts = [
        {
          deviceId: spec.deviceId,
          vehicleId: machine._id,
          customerId: owner._id,
          stateId: loc.state._id,
          districtId: loc.district._id,
          alertType: 'Engine Started',
          category: 'Engine',
          severity: 'Low',
          status: 'Resolved',
          exactLocation: { lat: loc.lat, lng: loc.lng, address: loc.address },
          createdAt: new Date(now - 2 * 3600 * 1000)
        },
        {
          deviceId: spec.deviceId,
          vehicleId: machine._id,
          customerId: owner._id,
          stateId: loc.state._id,
          districtId: loc.district._id,
          alertType: 'GPS Connected',
          category: 'GPS',
          severity: 'Low',
          status: 'Resolved',
          exactLocation: { lat: loc.lat, lng: loc.lng, address: loc.address },
          createdAt: new Date(now - 5 * 3600 * 1000)
        },
        {
          deviceId: spec.deviceId,
          vehicleId: machine._id,
          customerId: owner._id,
          stateId: loc.state._id,
          districtId: loc.district._id,
          alertType: 'Fuel Added',
          category: 'Maintenance',
          severity: 'Low',
          status: 'Resolved',
          exactLocation: { lat: loc.lat, lng: loc.lng, address: loc.address },
          createdAt: new Date(now - 24 * 3600 * 1000)
        }
      ];
      await DeviceAlert.insertMany(alerts);
      await Alert.insertMany(alerts.map(a => ({
        machineId: a.vehicleId,
        type: a.alertType,
        message: `${a.alertType} notification for vehicle`,
        priority: 'Low',
        driverName: drivers[i].name,
        time: a.createdAt
      })));
    }

    // 10. Seed Realistic Login History for Admin Hierarchy
    console.log('Seeding Login History for Admin Roles...');
    const adminUsers = [grandMaster, southMasterAdmin, tgStateAdmin, apStateAdmin];
    const userAgents = ['Chrome 126.0 (Windows 11)', 'Firefox 127.0 (macOS)', 'Safari 17.5 (iPadOS)'];
    const ipAddresses = ['103.156.42.10', '183.82.98.45', '117.211.14.92', '157.48.20.11'];

    for (let uIdx = 0; uIdx < adminUsers.length; uIdx++) {
      const usr = adminUsers[uIdx];
      await LoginHistory.create({
        user: usr._id,
        userEmail: usr.email,
        userPhone: usr.phone,
        time: new Date(Date.now() - (uIdx + 1) * 3600 * 1000),
        logoutTime: new Date(Date.now() - uIdx * 3600 * 1000),
        ip: ipAddresses[uIdx],
        browser: userAgents[uIdx % userAgents.length],
        device: 'Desktop',
        success: true
      });
    }

    console.log('Seeding completed successfully!');
    console.log('----------------------------------------------------');
    console.log('AgriTrack AI Version 1.2 Database Initialized.');
    console.log('----------------------------------------------------');
    process.exit(0);
  } catch (error) {
    console.error('Error during database seeding:', error);
    process.exit(1);
  }
};

seedDatabase();
