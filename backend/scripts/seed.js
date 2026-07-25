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
    console.log('Connecting to database for seeding...');
    await mongoose.connect(MONGODB_URI);
    console.log(`Connected to: ${mongoose.connection.host}`);

    // Clear existing data
    console.log('Purging database collections...');
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

    // 1. Seed Geographic Hierarchy (Telangana, Nalgonda, Madgulapally, Cheruvupally)
    console.log('Seeding Telangana Geographic Hierarchy...');
    const telangana = await State.create({ name: 'Telangana' });
    const nalgondaDist = await District.create({ name: 'Nalgonda', state: telangana._id });
    const madgulapallyMandal = await Mandal.create({ name: 'Madgulapally', district: nalgondaDist._id });
    const villageCheruvupally = await Village.create({ 
      name: 'Cheruvupally', 
      mandal: madgulapallyMandal._id, 
      pincode: '508247' 
    });

    // 2. Seed Users
    console.log('Seeding Users (Company Admin & 5 Farm Admins)...');
    
    // Company Admin
    const admin = await User.create({
      name: 'Sanjay Reddy',
      email: 'admin@agritrack.in',
      password: 'password123',
      phone: '+919999999999',
      company: 'AgriTrack Operations',
      role: 'Company Admin',
      isFirstLogin: false,
    });

    // 5 Farm Admins
    const customerData = [
      {
        name: 'Ramesh Reddy',
        email: 'ramesh@cheruvupally.com',
        password: 'password123',
        phone: '+919876543210',
        alternatePhone: '+919876543220',
        addressLine: 'House #12, Near Temple, Cheruvupally',
        company: 'Ramesh Agro Farms',
        role: 'Farm Admin',
        planName: 'Premium Plan',
        devicesAllowed: 10,
        devicesUsed: 1,
        paymentStatus: 'Paid',
        subscriptionStatus: 'Active',
        aadhaarNumber: '123456789012',
        gstNumber: '36AAAAA1111A1Z1',
        isFirstLogin: false
      },
      {
        name: 'Venkat Rao',
        email: 'venkat@cheruvupally.com',
        password: 'password123',
        phone: '+919876543211',
        alternatePhone: '+919876543221',
        addressLine: 'Plot #45, Main Road, Cheruvupally',
        company: 'Venkat Green Fields',
        role: 'Farm Admin',
        planName: 'Standard',
        devicesAllowed: 5,
        devicesUsed: 1,
        paymentStatus: 'Paid',
        subscriptionStatus: 'Active',
        aadhaarNumber: '234567890123',
        gstNumber: '',
        isFirstLogin: false
      },
      {
        name: 'Lakshmi Devi',
        email: 'lakshmi@cheruvupally.com',
        password: 'password123',
        phone: '+919876543212',
        alternatePhone: '+919876543222',
        addressLine: 'House #8, Cheruvupally',
        company: 'Lakshmi Farms',
        role: 'Farm Admin',
        planName: 'Standard',
        devicesAllowed: 5,
        devicesUsed: 1,
        paymentStatus: 'Paid',
        subscriptionStatus: 'Active',
        aadhaarNumber: '345678901234',
        gstNumber: '',
        isFirstLogin: false
      },
      {
        name: 'Anji Reddy',
        email: 'anji@cheruvupally.com',
        password: 'password123',
        phone: '+919876543213',
        alternatePhone: '+919876543223',
        addressLine: 'Mandal Road, Cheruvupally',
        company: 'Anji Crop Logistics',
        role: 'Farm Admin',
        planName: 'Premium Plan',
        devicesAllowed: 10,
        devicesUsed: 1,
        paymentStatus: 'Paid',
        subscriptionStatus: 'Active',
        aadhaarNumber: '456789012345',
        gstNumber: '36BBBBB2222B2Z2',
        isFirstLogin: false
      },
      {
        name: 'Satish Kumar',
        email: 'satish@cheruvupally.com',
        password: 'password123',
        phone: '+919876543214',
        alternatePhone: '+919876543224',
        addressLine: 'East Street, Cheruvupally',
        company: 'Satish Harvester Services',
        role: 'Farm Admin',
        planName: 'Standard',
        devicesAllowed: 5,
        devicesUsed: 1,
        paymentStatus: 'Paid',
        subscriptionStatus: 'Active',
        aadhaarNumber: '567890123456',
        gstNumber: '',
        isFirstLogin: false
      }
    ];

    const seededCustomers = [];
    for (const c of customerData) {
      const userObj = await User.create(c);
      seededCustomers.push(userObj);

      // Create Customer Location Mapping
      await CustomerLocationMapping.create({
        customer: userObj._id,
        state: telangana._id,
        district: nalgondaDist._id,
        mandal: madgulapallyMandal._id,
        village: villageCheruvupally._id,
        pincode: '508247',
        addressLine: c.addressLine
      });
    }
    console.log(`Seeded ${seededCustomers.length} customer records & geographic mappings.`);

    // 3. Seed Vehicle Predefined Metadata
    console.log('Seeding Vehicle predefined brands and models...');
    
    // Tractor Brands (John Deere, Swaraj, Mahindra, Sonalika, Kubota, New Holland, Massey Ferguson, Farmtrac, Powertrac, Eicher, Indo Farm, ACE, Captain, Preet, Solis)
    // Tractor Brands
    const tractors = [
      { brand: 'John Deere', models: [
        { name: '5050D', series: '5D', hp: '50 HP' },
        { name: '5310 GearPro', series: '5E', hp: '55 HP' }
      ]},
      { brand: 'Swaraj', models: [
        { name: '744 XT', series: 'XT', hp: '48 HP' },
        { name: '855 FE', series: 'FE', hp: '52 HP' },
        { name: '963 FE', series: 'FE', hp: '60 HP' }
      ]},
      { brand: 'Massey Ferguson', models: [
        { name: '241 DI', series: 'DI', hp: '42 HP' },
        { name: '7250 PowerUp', series: 'PowerUp', hp: '50 HP' }
      ]},
      { brand: 'Sonalika', models: [
        { name: 'Rx 50', series: 'Rx', hp: '52 HP' },
        { name: 'Tiger DI 50', series: 'Tiger', hp: '52 HP' }
      ]}
    ];

    // Track Harvester Brands
    const trackHarvesters = [
      { brand: 'GAM', models: [{ name: 'GAM Track Harvester', hp: '110 HP' }] },
      { brand: 'Lovol', models: [{ name: 'Lovol Track Harvester', hp: '120 HP' }] },
      { brand: 'Kubota', models: [{ name: 'Kubota DC-68G', hp: '68 HP' }] },
      { brand: 'Yanmar', models: [{ name: 'Yanmar YH850 Track', hp: '85 HP' }] },
      { brand: 'CLAAS', models: [{ name: 'Crop Tiger 30 Track', hp: '60 HP' }] },
      { brand: 'Fieldking', models: [{ name: 'Fieldking Track Harvester', hp: '115 HP' }] },
      { brand: 'Delta', models: [{ name: 'Delta Track Harvester', hp: '110 HP' }] },
      { brand: 'Oryza', models: [{ name: 'Oryza Track Harvester', hp: '120 HP' }] },
      { brand: 'Vishal', models: [{ name: 'Vishal 495 Track', hp: '95 HP' }] },
      { brand: 'Preet', models: [{ name: 'Preet 987 Track', hp: '110 HP' }] },
      { brand: 'Kartar', models: [{ name: 'Kartar 4000 Track', hp: '110 HP' }] }
    ];

    // Combine Harvester Brands
    const combineHarvesters = [
      { brand: 'Lovol', models: [{ name: 'Lovol Harvester', hp: ['75 HP', '88 HP', '100 HP'], engineConfig: 'Integrated' }] },
      { brand: 'Kubota', models: [{ name: 'Kubota Harvester', hp: ['70 HP', '85 HP', '95 HP'], engineConfig: 'Integrated' }] },
      { brand: 'GAM', models: [{ name: 'GAM Harvester', hp: ['105 HP', '110 HP', '120 HP'], engineConfig: 'External' }] },
      { brand: 'Preet', models: [{ name: 'Preet Harvester', hp: ['100 HP', '110 HP'], engineConfig: 'External' }] },
      { brand: 'Kartar', models: [{ name: 'Kartar Harvester', hp: ['100 HP', '110 HP'], engineConfig: 'External' }] },
      { brand: 'Standard', models: [{ name: 'Standard Harvester', hp: ['100 HP', '110 HP'], engineConfig: 'External' }] },
      { brand: 'Vishal', models: [{ name: 'Vishal Harvester', hp: ['100 HP', '110 HP'], engineConfig: 'External' }] }
    ];

    const createdBrands = {};

    const getOrCreateBrand = async (bName) => {
      if (createdBrands[bName]) return createdBrands[bName];
      let b = await VehicleBrand.findOne({ name: bName });
      if (!b) {
        b = await VehicleBrand.create({ name: bName });
      }
      createdBrands[bName] = b._id;
      return b._id;
    };

    // Seed Tractors
    for (const group of tractors) {
      const brandId = await getOrCreateBrand(group.brand);
      for (const m of group.models) {
        const modelObj = await VehicleModel.create({
          name: m.name,
          brand: brandId,
          vehicleType: 'Tractor',
          engineConfig: 'None',
          series: m.series || ''
        });
        const hpVals = Array.isArray(m.hp) ? m.hp : [m.hp];
        for (const hpVal of hpVals) {
          await HPMaster.create({ hpValue: hpVal, model: modelObj._id });
        }
      }
    }

    // Seed Track Harvesters
    for (const group of trackHarvesters) {
      const brandId = await getOrCreateBrand(group.brand);
      for (const m of group.models) {
        const modelObj = await VehicleModel.create({
          name: m.name,
          brand: brandId,
          vehicleType: 'Track Harvester',
          engineConfig: 'None',
          series: ''
        });
        const hpVals = Array.isArray(m.hp) ? m.hp : [m.hp];
        for (const hpVal of hpVals) {
          await HPMaster.create({ hpValue: hpVal, model: modelObj._id });
        }
      }
    }

    // Seed Combine Harvesters
    for (const group of combineHarvesters) {
      const brandId = await getOrCreateBrand(group.brand);
      for (const m of group.models) {
        const modelObj = await VehicleModel.create({
          name: m.name,
          brand: brandId,
          vehicleType: 'Combine Harvester',
          engineConfig: m.engineConfig,
          series: ''
        });
        const hpVals = Array.isArray(m.hp) ? m.hp : [m.hp];
        for (const hpVal of hpVals) {
          await HPMaster.create({ hpValue: hpVal, model: modelObj._id });
        }
      }
    }

    // Seed Farms (one per customer)
    console.log('Seeding Farms...');
    const farms = [];
    for (let i = 0; i < seededCustomers.length; i++) {
      const owner = seededCustomers[i];
      const farmObj = await Farm.create({
        name: `${owner.name}'s Farm Block`,
        owner: owner._id,
      });
      farms.push(farmObj);
    }

    // 4. Seed Drivers (linked to owners)
    console.log('Seeding Operators/Drivers...');
    const drivers = [];
    const driverNames = ['Ravi Kumar', 'K. Venkat', 'B. Yadagiri', 'M. Srinivas', 'Ch. Narsimha'];
    for (let i = 0; i < seededCustomers.length; i++) {
      const owner = seededCustomers[i];
      const drvObj = await Driver.create({
        name: driverNames[i],
        phone: `+91990000000${i}`,
        experience: `${5 + i} Years`,
        rating: parseFloat((4.5 + i * 0.1).toFixed(1)),
        status: i === 4 ? 'Off-duty' : 'Active',
        workingHoursToday: i % 2 === 0 ? 6.2 : 0,
        acresWorked: i % 2 === 0 ? 15.5 : 0,
        fuelEfficiency: 90 + i,
        attendance: '98%',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80',
        owner: owner._id,
        performanceData: [
          { month: 'Jan', hours: 100, acres: 250 },
          { month: 'Feb', hours: 120, acres: 300 },
          { month: 'Mar', hours: 135, acres: 350 },
          { month: 'Apr', hours: 150, acres: 400 },
          { month: 'May', hours: 140, acres: 380 },
          { month: 'Jun', hours: 145, acres: 390 }
        ]
      });
      drivers.push(drvObj);
    }

    // 5. Seed Machines & Linked GPS Devices
    console.log('Seeding Machines & GPS Devices centered around Cheruvupally (Nalgonda)...');

    // Five distinct coordinates spaced around Cheruvupally (lat ~16.978, lng ~79.432)
    const seedCoords = [
      { lat: 16.978, lng: 79.432 }, // Ramesh (Center)
      { lat: 16.985, lng: 79.442 }, // Venkat (North-East)
      { lat: 16.972, lng: 79.420 }, // Lakshmi (South-West)
      { lat: 16.992, lng: 79.418 }, // Anji (North-West)
      { lat: 16.965, lng: 79.448 }  // Satish (South-East)
    ];

    const machinesData = [
      {
        name: 'Swaraj 735 FE',
        type: 'Tractor',
        brand: 'Swaraj',
        model: '735 FE',
        registration: 'TS-05-EA-1001',
        status: 'Offline',
        fuel: 15,
        battery: 65,
        location: seedCoords[0],
        speed: 0,
        heading: 0,
        engineStatus: 'Off',
        workingHours: 245.5,
        distanceTravelled: 1240.2,
        areaCovered: 345.2,
        idleTime: 12.4,
        firstServiceHours: 50,
        regularServiceInterval: 250,
        lastServiceHours: 0,
        engineType: 'Factory Integrated Engine',
        currentAddress: 'Cheruvupally Village Road, Madgulapally, Nalgonda, Telangana',
        photo: 'https://images.unsplash.com/photo-1592919505780-303950717480?auto=format&fit=crop&w=800&q=80',
        documents: ['Swaraj_735_Manual.pdf'],
        deviceData: {
          deviceId: 'dev-swaraj735',
          imei: '359876543210001',
          simNumber: '+919999000111',
          simIccid: '8991001234567890001',
          simProvider: 'Airtel IoT',
          installerName: 'Telangana Telematics Ltd',
          installationLocation: 'Nalgonda Service Center',
          detailedLiveStatus: 'GPS Lost',
          connectionStatus: 'Offline',
          lastCommunicationTime: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
        }
      },
      {
        name: 'John Deere 5042D',
        type: 'Tractor',
        brand: 'John Deere',
        model: '5042D',
        registration: 'TS-05-EA-1002',
        status: 'Working',
        fuel: 85,
        battery: 95,
        location: seedCoords[1],
        speed: 12,
        heading: 45,
        engineStatus: 'On',
        workingHours: 512.2,
        distanceTravelled: 3210.8,
        areaCovered: 785.4,
        idleTime: 42.1,
        firstServiceHours: 50,
        regularServiceInterval: 250,
        lastServiceHours: 0,
        engineType: 'Factory Integrated Engine',
        currentAddress: 'NH-565 Highway, Madgulapally, Nalgonda, Telangana',
        photo: 'https://images.unsplash.com/photo-1594142426444-a4cd02470991?auto=format&fit=crop&w=800&q=80',
        documents: ['JD_5042D_OperatorGuide.pdf'],
        deviceData: {
          deviceId: 'dev-jd5042',
          imei: '359876543210002',
          simNumber: '+919999000222',
          simIccid: '8991001234567890002',
          simProvider: 'Jio Things IoT',
          installerName: 'Reddy Telematics Nalgonda',
          installationLocation: 'Client Field Yard',
          detailedLiveStatus: 'Moving',
          connectionStatus: 'Online',
          lastCommunicationTime: new Date()
        }
      },
      {
        name: 'Kubota MU4501',
        type: 'Tractor',
        brand: 'Kubota',
        model: 'MU4501',
        registration: 'TS-05-EA-1003',
        status: 'Idle',
        fuel: 55,
        battery: 88,
        location: seedCoords[2],
        speed: 0,
        heading: 180,
        engineStatus: 'Off',
        workingHours: 120.4,
        distanceTravelled: 720.5,
        areaCovered: 180.2,
        idleTime: 9.8,
        firstServiceHours: 50,
        regularServiceInterval: 250,
        lastServiceHours: 0,
        engineType: 'Factory Integrated Engine',
        currentAddress: 'Cheruvupally Gram Panchayat Area, Nalgonda, Telangana',
        photo: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
        documents: ['Kubota_MU4501_Guide.pdf'],
        deviceData: {
          deviceId: 'dev-kubota4501',
          imei: '359876543210003',
          simNumber: '+919999000333',
          simIccid: '8991001234567890003',
          simProvider: 'BSNL M2M',
          installerName: 'Srinivas Electronics',
          installationLocation: 'Madgulapally Workshop',
          detailedLiveStatus: 'Stopped',
          connectionStatus: 'Online',
          lastCommunicationTime: new Date()
        }
      },
      {
        name: 'GAM Harvester',
        type: 'Track Harvester',
        brand: 'GAM',
        model: 'GAM Harvester',
        registration: 'TS-05-EA-1004',
        status: 'Working',
        fuel: 45,
        battery: 92,
        location: seedCoords[3],
        speed: 8,
        heading: 270,
        engineStatus: 'On',
        workingHours: 342.1,
        distanceTravelled: 1890.3,
        areaCovered: 520.1,
        idleTime: 25.6,
        firstServiceHours: 50,
        regularServiceInterval: 250,
        lastServiceHours: 0,
        engineType: 'Factory Integrated Engine',
        currentAddress: 'West Paddy Farms, Cheruvupally, Nalgonda, Telangana',
        photo: 'https://images.unsplash.com/photo-1595246140625-5c3b545b0976?auto=format&fit=crop&w=800&q=80',
        documents: ['GAM_Harvesting_Systems.pdf'],
        deviceData: {
          deviceId: 'dev-gamharv',
          imei: '359876543210004',
          simNumber: '+919999000444',
          simIccid: '8991001234567890004',
          simProvider: 'Airtel IoT',
          installerName: 'GAM Engineering Installs',
          installationLocation: 'Nalgonda Yard',
          detailedLiveStatus: 'Moving',
          connectionStatus: 'Online',
          lastCommunicationTime: new Date()
        }
      },
      {
        name: 'Lovol Harvester',
        type: 'Track Harvester',
        brand: 'Lovol',
        model: 'Lovol Harvester',
        registration: 'TS-05-EA-1005',
        status: 'Offline',
        fuel: 0,
        battery: 10,
        location: seedCoords[4],
        speed: 0,
        heading: 90,
        engineStatus: 'Off',
        workingHours: 852.1,
        distanceTravelled: 5410.2,
        areaCovered: 1250.8,
        idleTime: 92.4,
        firstServiceHours: 50,
        regularServiceInterval: 250,
        lastServiceHours: 0,
        engineType: 'Factory Integrated Engine',
        currentAddress: 'Cheruvupally Grain Warehouse, Nalgonda, Telangana',
        photo: 'https://images.unsplash.com/photo-1574375927938-d5a98e8edd86?auto=format&fit=crop&w=800&q=80',
        documents: ['Lovol_Harvester_Operator_Manual.pdf'],
        deviceData: {
          deviceId: 'dev-lovolharv',
          imei: '359876543210005',
          simNumber: '+919999000555',
          simIccid: '8991001234567890005',
          simProvider: 'Vi Business M2M',
          installerName: 'Nalgonda Agricultural Machinery Center',
          installationLocation: 'Warehouse Hangar',
          detailedLiveStatus: 'No Network',
          connectionStatus: 'Offline',
          lastCommunicationTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
        }
      }
    ];

    const machineMap = {};
    for (let i = 0; i < machinesData.length; i++) {
      const data = machinesData[i];
      const owner = seededCustomers[i];
      const farm = farms[i];
      const driver = drivers[i];
      const deviceData = data.deviceData;
      delete data.deviceData;

      // Create GPS Device
      const gpsDevice = await GPSDevice.create({
        deviceId: deviceData.deviceId,
        imei: deviceData.imei,
        simNumber: deviceData.simNumber,
        simIccid: deviceData.simIccid,
        simProvider: deviceData.simProvider,
        activationStatus: 'Activated',
        currentStatus: deviceData.connectionStatus,
        connectionStatus: deviceData.connectionStatus,
        installerName: deviceData.installerName,
        installationLocation: deviceData.installationLocation,
        vehicleOdometer: data.distanceTravelled,
        deviceWarranty: new Date('2028-12-31'),
        deviceSerialNumber: `SN-${deviceData.deviceId.toUpperCase()}`,
        detailedLiveStatus: deviceData.detailedLiveStatus,
        lastCommunicationTime: deviceData.lastCommunicationTime,
        lastSeen: deviceData.lastCommunicationTime,
        owner: owner._id,
        status: 'Active'
      });

      // Save Device Status History
      await DeviceStatusHistory.create({
        deviceId: deviceData.deviceId,
        status: data.engineStatus === 'On' ? 'Engine Started' : 'Engine Stopped',
        details: 'System initial seed state'
      });

      // Fill remaining vehicle info
      data.chassisNumber = data.registration;
      data.engineNumber = data.engineNumber;
      data.purchaseDate = new Date('2025-05-10');
      data.manufacturingYear = 2024;
      data.rcOwnerName = owner.name;
      data.insuranceExpiry = new Date('2027-05-10');
      data.fitnessExpiry = new Date('2029-05-10');
      data.gpsDeviceId = gpsDevice._id;
      data.farmId = farm._id;
      data.owner = owner._id;
      data.assignedDriverId = driver._id;

      const machine = await Machine.create(data);
      machineMap[machine.registration] = machine._id;

      // Update links back
      gpsDevice.vehicleId = machine._id;
      gpsDevice.currentVehicle = machine._id;
      await gpsDevice.save();

      driver.assignedMachineId = machine._id;
      await driver.save();
    }
    console.log('Seeded 5 machines and 5 GPS devices mapped correctly to customers and locations.');

    // 6. Seed Fields (2 fields for demo)
    console.log('Seeding Fields...');
    await Field.create([
      {
        name: 'Ramesh East Cotton block',
        area: 12.5,
        crop: 'Cotton',
        owner: seededCustomers[0]._id,
        machineAssigned: machineMap['TS-05-EA-1001'],
        status: 'In Progress',
        boundaries: [
          [16.975, 79.430],
          [16.980, 79.430],
          [16.980, 79.435],
          [16.975, 79.435]
        ]
      },
      {
        name: 'Venkat Main Paddy sector',
        area: 25.8,
        crop: 'Rice',
        owner: seededCustomers[1]._id,
        machineAssigned: machineMap['TS-05-EA-1002'],
        status: 'In Progress',
        boundaries: [
          [16.982, 79.440],
          [16.988, 79.440],
          [16.988, 79.445],
          [16.982, 79.445]
        ]
      }
    ]);

    // 7. Seed Jobs
    console.log('Seeding Jobs...');
    await Job.create([
      {
        title: 'Paddy Harvesting Cheruvupally',
        machineId: machineMap['TS-05-EA-1002'], // Venkat JD
        driverId: drivers[1]._id,
        startDate: new Date('2026-07-24T08:00:00'),
        status: 'In Progress',
        priority: 'High',
        progress: 60,
        owner: seededCustomers[1]._id,
        timeline: [
          { date: new Date('2026-07-24T08:00:00'), title: 'Job Started', desc: 'Venkat Rao deployed operator K. Venkat with John Deere' }
        ]
      },
      {
        title: 'GAM Harvester Tilling Block A',
        machineId: machineMap['TS-05-EA-1004'], // Anji
        driverId: drivers[3]._id,
        startDate: new Date('2026-07-25T07:00:00'),
        status: 'In Progress',
        priority: 'Critical',
        progress: 30,
        owner: seededCustomers[3]._id,
        timeline: [
          { date: new Date('2026-07-25T07:00:00'), title: 'Job Dispatched', desc: 'GAM Harvester deployed to field segment' }
        ]
      }
    ]);

    // 8. Seed Alerts & DeviceAlerts
    console.log('Seeding Alerts & DeviceAlerts...');
    
    // Seed DeviceAlerts (used on FleetOverview)
    await DeviceAlert.create([
      {
        deviceId: 'dev-swaraj735',
        vehicleId: machineMap['TS-05-EA-1001'],
        customerId: seededCustomers[0]._id,
        stateId: telangana._id,
        districtId: nalgondaDist._id,
        exactLocation: { lat: seedCoords[0].lat, lng: seedCoords[0].lng, address: 'Cheruvupally Village Road, Madgulapally, Nalgonda, Telangana' },
        alertType: 'Low Fuel Warning',
        category: 'Engine',
        severity: 'High',
        status: 'Active',
        timestamp: new Date(Date.now() - 30 * 60 * 1000)
      },
      {
        deviceId: 'dev-lovolharv',
        vehicleId: machineMap['TS-05-EA-1005'],
        customerId: seededCustomers[4]._id,
        stateId: telangana._id,
        districtId: nalgondaDist._id,
        exactLocation: { lat: seedCoords[4].lat, lng: seedCoords[4].lng, address: 'Cheruvupally Grain Warehouse, Nalgonda, Telangana' },
        alertType: 'Device Offline',
        category: 'GPS',
        severity: 'Critical',
        status: 'Active',
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000)
      }
    ]);

    // Seed regular Alerts (customer dashboard alerts)
    await Alert.create([
      {
        type: 'Low Fuel',
        message: 'Swaraj 735 FE (TS-05-EA-1001) has critical fuel level (15%)',
        machineId: machineMap['TS-05-EA-1001'],
        driverName: drivers[0].name,
        time: new Date(Date.now() - 30 * 60 * 1000),
        priority: 'High',
        category: 'Fuel',
        status: 'Active',
        customerId: seededCustomers[0]._id,
        deviceId: 'dev-swaraj735',
        stateId: telangana._id,
        districtId: nalgondaDist._id,
        exactLocation: { lat: seedCoords[0].lat, lng: seedCoords[0].lng, address: 'Cheruvupally Village Road, Madgulapally, Nalgonda, Telangana' }
      },
      {
        type: 'GPS Offline',
        message: 'GPS connection lost for Lovol Harvester (TS-05-EA-1005)',
        machineId: machineMap['TS-05-EA-1005'],
        driverName: drivers[4].name,
        time: new Date(Date.now() - 48 * 60 * 60 * 1000),
        priority: 'Critical',
        category: 'GPS',
        status: 'Active',
        customerId: seededCustomers[4]._id,
        deviceId: 'dev-lovolharv',
        stateId: telangana._id,
        districtId: nalgondaDist._id,
        exactLocation: { lat: seedCoords[4].lat, lng: seedCoords[4].lng, address: 'Cheruvupally Grain Warehouse, Nalgonda, Telangana' }
      }
    ]);

    // 9. Seed GPS History paths
    console.log('Seeding GPS History trails...');
    const now = Date.now();
    const historyM1 = [
      { lat: 16.975, lng: 79.430, speed: 10, fuel: 20, timeOffset: 50 },
      { lat: 16.976, lng: 79.431, speed: 11, fuel: 19, timeOffset: 40 },
      { lat: 16.977, lng: 79.431, speed: 12, fuel: 18, timeOffset: 30 },
      { lat: 16.978, lng: 79.432, speed: 0, fuel: 15, timeOffset: 10 }
    ];
    const historyM2 = [
      { lat: 16.980, lng: 79.438, speed: 14, fuel: 92, timeOffset: 50 },
      { lat: 16.982, lng: 79.439, speed: 12, fuel: 90, timeOffset: 40 },
      { lat: 16.984, lng: 79.440, speed: 15, fuel: 88, timeOffset: 30 },
      { lat: 16.985, lng: 79.442, speed: 12, fuel: 85, timeOffset: 10 }
    ];

    for (const pt of historyM1) {
      await GPSHistory.create({
        machineId: machineMap['TS-05-EA-1001'],
        latitude: pt.lat,
        longitude: pt.lng,
        speed: pt.speed,
        timestamp: new Date(now - pt.timeOffset * 60 * 1000)
      });
      await FuelHistory.create({
        machineId: machineMap['TS-05-EA-1001'],
        level: pt.fuel,
        timestamp: new Date(now - pt.timeOffset * 60 * 1000)
      });
    }

    for (const pt of historyM2) {
      await GPSHistory.create({
        machineId: machineMap['TS-05-EA-1002'],
        latitude: pt.lat,
        longitude: pt.lng,
        speed: pt.speed,
        timestamp: new Date(now - pt.timeOffset * 60 * 1000)
      });
      await FuelHistory.create({
        machineId: machineMap['TS-05-EA-1002'],
        level: pt.fuel,
        timestamp: new Date(now - pt.timeOffset * 60 * 1000)
      });
    }

    // 10. Seed login history (to populate recent login panel)
    console.log('Seeding Login History audits...');
    await LoginHistory.create([
      { user: seededCustomers[1]._id, userEmail: seededCustomers[1].email, time: new Date(now - 10 * 60 * 1000), device: 'OnePlus 11 5G (Android)', browser: 'Chrome Mobile', ip: '192.168.1.100', success: true },
      { user: seededCustomers[2]._id, userEmail: seededCustomers[2].email, time: new Date(now - 45 * 60 * 1000), device: 'Realme 9 Pro (Android)', browser: 'Chrome Mobile', ip: '192.168.1.101', success: true },
      { user: seededCustomers[0]._id, userEmail: seededCustomers[0].email, time: new Date(now - 2 * 60 * 60 * 1000), device: 'Samsung Galaxy S22 (Android)', browser: 'Chrome Mobile', ip: '192.168.1.102', success: true },
      { user: admin._id, userEmail: admin.email, time: new Date(now - 4 * 60 * 60 * 1000), device: 'MacBook Pro (macOS)', browser: 'Safari', ip: '192.168.1.5', success: true }
    ]);

    // 11. Seed Activity Logs
    console.log('Seeding Activity Logs...');
    await ActivityLog.create([
      { user: admin._id, userName: 'Sanjay Reddy', action: 'User Logged In', details: 'Web login from Hyderabad IP.' },
      { user: admin._id, userName: 'System', action: 'Machine Added', details: 'Registered new Swaraj 735 FE vehicle.' },
      { user: admin._id, userName: 'System', action: 'Device Activated', details: 'Activated GPS device dev-swaraj735.' }
    ]);

    console.log('All collections seeded successfully!');
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seeding process failed:', error);
    if (mongoose.connection) {
      mongoose.connection.close();
    }
    process.exit(1);
  }
};

seedDatabase();
