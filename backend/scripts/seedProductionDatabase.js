import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from '../models/userModel.js';
import Farm from '../models/farmModel.js';
import Machine from '../models/machineModel.js';
import GPSDevice from '../models/gpsDeviceModel.js';
import { VehicleBrand, VehicleModel } from '../models/vehicleMasterModel.js';
import DieselExpense from '../models/dieselExpenseModel.js';
import ServiceExpense from '../models/serviceExpenseModel.js';
import OperatingExpense from '../models/operatingExpenseModel.js';
import VehicleIncome from '../models/incomeModel.js';
import NotificationHistory from '../models/notificationHistoryModel.js';
import TripReplay from '../models/tripReplayModel.js';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/agritrack-ai';

async function seedProductionDB() {
  try {
    console.log('🌱 Connecting to MongoDB database...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected.');

    console.log('🧹 Purging old collections and dropping indexes...');
    await Machine.collection.dropIndexes().catch(() => {});
    await User.deleteMany({});
    await Farm.deleteMany({});
    await Machine.deleteMany({});
    await GPSDevice.deleteMany({});
    await VehicleBrand.deleteMany({});
    await VehicleModel.deleteMany({});
    await DieselExpense.deleteMany({});
    await ServiceExpense.deleteMany({});
    await OperatingExpense.deleteMany({});
    await VehicleIncome.deleteMany({});
    await NotificationHistory.deleteMany({});
    await TripReplay.deleteMany({});
    console.log('✅ Collections purged.');

    // 1. Seed Vehicle Master Brands and Models
    console.log('🚜 Seeding Vehicle Master Database (Tractors, Track & Combine Harvesters)...');
    
    const tractorBrandsData = [
      { name: 'John Deere', logo: '/assets/logos/john-deere.png' },
      { name: 'Mahindra', logo: '/assets/logos/mahindra.png' },
      { name: 'Swaraj', logo: '/assets/logos/swaraj.png' },
      { name: 'Kubota', logo: '/assets/logos/kubota.png' },
      { name: 'New Holland', logo: '/assets/logos/new-holland.png' },
      { name: 'Sonalika', logo: '/assets/logos/sonalika.png' },
      { name: 'Massey Ferguson', logo: '/assets/logos/massey-ferguson.png' },
      { name: 'Powertrac', logo: '/assets/logos/powertrac.png' },
      { name: 'Farmtrac', logo: '/assets/logos/farmtrac.png' },
      { name: 'ACE', logo: '/assets/logos/ace.png' },
      { name: 'Eicher', logo: '/assets/logos/eicher.png' },
      { name: 'Indo Farm', logo: '/assets/logos/indo-farm.png' },
      { name: 'LOVOL', logo: '/assets/logos/lovol.png' },
      { name: 'GAM', logo: '/assets/logos/gam.png' },
      { name: 'Yanmar', logo: '/assets/logos/yanmar.png' },
      { name: 'Fieldking', logo: '/assets/logos/fieldking.png' },
      { name: 'Vishal', logo: '/assets/logos/vishal.png' },
      { name: 'Delta', logo: '/assets/logos/delta.png' },
      { name: 'Oryza', logo: '/assets/logos/oryza.png' },
      { name: 'Preet', logo: '/assets/logos/preet.png' },
      { name: 'Kartar', logo: '/assets/logos/kartar.png' },
      { name: 'Dashmesh', logo: '/assets/logos/dashmesh.png' },
      { name: 'Balkar', logo: '/assets/logos/balkar.png' },
      { name: 'Standard', logo: '/assets/logos/standard.png' },
      { name: 'Ghar', logo: '/assets/logos/ghar.png' },
      { name: 'CLAAS', logo: '/assets/logos/claas.png' }
    ];

    const seededBrands = {};
    for (const b of tractorBrandsData) {
      const brandDoc = await VehicleBrand.create({ name: b.name, brandLogo: b.logo });
      seededBrands[b.name] = brandDoc._id;
    }

    const modelsToSeed = [
      // John Deere Tractors
      { name: '5042D', brand: seededBrands['John Deere'], vehicleType: 'Tractor', hp: '42 HP', img: '/assets/vehicles/jd-5042d.png' },
      { name: '5050D', brand: seededBrands['John Deere'], vehicleType: 'Tractor', hp: '50 HP' },
      { name: '5055E', brand: seededBrands['John Deere'], vehicleType: 'Tractor', hp: '55 HP' },
      { name: '5075E', brand: seededBrands['John Deere'], vehicleType: 'Tractor', hp: '75 HP' },
      { name: '5105', brand: seededBrands['John Deere'], vehicleType: 'Tractor', hp: '40 HP' },
      { name: '5210', brand: seededBrands['John Deere'], vehicleType: 'Tractor', hp: '50 HP' },
      { name: '5310', brand: seededBrands['John Deere'], vehicleType: 'Tractor', hp: '55 HP' },
      { name: '5405', brand: seededBrands['John Deere'], vehicleType: 'Tractor', hp: '63 HP' },

      // Mahindra Tractors
      { name: '275 DI XP Plus', brand: seededBrands['Mahindra'], vehicleType: 'Tractor', hp: '37 HP' },
      { name: '415 DI', brand: seededBrands['Mahindra'], vehicleType: 'Tractor', hp: '40 HP' },
      { name: '475 DI', brand: seededBrands['Mahindra'], vehicleType: 'Tractor', hp: '42 HP' },
      { name: 'Yuvo Tech Plus 575', brand: seededBrands['Mahindra'], vehicleType: 'Tractor', hp: '47 HP', img: '/assets/vehicles/mahindra-yuvo.png' },
      { name: 'Arjun 605 DI', brand: seededBrands['Mahindra'], vehicleType: 'Tractor', hp: '60 HP' },
      { name: 'Arjun Novo 605', brand: seededBrands['Mahindra'], vehicleType: 'Tractor', hp: '60 HP' },

      // Swaraj Tractors
      { name: '735 FE', brand: seededBrands['Swaraj'], vehicleType: 'Tractor', hp: '39 HP' },
      { name: '744 FE', brand: seededBrands['Swaraj'], vehicleType: 'Tractor', hp: '48 HP' },
      { name: '855 FE', brand: seededBrands['Swaraj'], vehicleType: 'Tractor', hp: '52 HP' },
      { name: '960 FE', brand: seededBrands['Swaraj'], vehicleType: 'Tractor', hp: '60 HP' },
      { name: '963 FE', brand: seededBrands['Swaraj'], vehicleType: 'Tractor', hp: '63 HP' },
      { name: '969 FE', brand: seededBrands['Swaraj'], vehicleType: 'Tractor', hp: '70 HP' },

      // Kubota Tractors
      { name: 'NeoStar B2441', brand: seededBrands['Kubota'], vehicleType: 'Tractor', hp: '24 HP' },
      { name: 'MU4501', brand: seededBrands['Kubota'], vehicleType: 'Tractor', hp: '45 HP' },
      { name: 'MU5502 4WD', brand: seededBrands['Kubota'], vehicleType: 'Tractor', hp: '55 HP', img: '/assets/vehicles/kubota-mu5502.png' },
      { name: 'MU5702', brand: seededBrands['Kubota'], vehicleType: 'Tractor', hp: '57 HP' },

      // LOVOL Track Harvester
      { name: 'RG108 Plus CR', brand: seededBrands['LOVOL'], vehicleType: 'Track Harvester', hp: '100 HP', img: '/assets/vehicles/lovol-rg108.png' },
      { name: 'RG1104', brand: seededBrands['LOVOL'], vehicleType: 'Track Harvester', hp: '110 HP' },

      // Preet Combine Harvester
      { name: '987 Combine Harvester', brand: seededBrands['Preet'], vehicleType: 'Combine Harvester', hp: '75 HP', engineConfig: 'Integrated', img: '/assets/vehicles/preet-987.png' },

      // Kartar & Dashmesh Combines
      { name: '3500', brand: seededBrands['Kartar'], vehicleType: 'Combine Harvester', hp: '101 HP', engineConfig: 'External' },
      { name: '3100', brand: seededBrands['Dashmesh'], vehicleType: 'Combine Harvester', hp: '101 HP', engineConfig: 'External' },
    ];

    for (const m of modelsToSeed) {
      await VehicleModel.create({
        name: m.name,
        brand: m.brand,
        vehicleType: m.vehicleType,
        engineConfig: m.engineConfig || 'Integrated',
        vehicleImage: m.img || '/assets/vehicles/default-tractor.png',
        specifications: { horsepower: m.hp || '50 HP', engineCylinder: '4 Cylinder', fuelCapacityLitres: 65 }
      });
    }
    console.log('✅ Vehicle Master Database populated.');

    // 2. Create Users (Company Admin + 5 Production Farm Admins)
    console.log('👤 Creating Company Admin & 5 Farm Admin accounts...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('123456', salt);

    const companyAdmin = await User.create({
      name: 'AgriTrack Operations Admin',
      email: 'admin@agritrack.ai',
      phone: '9999999999',
      mobile: '9999999999',
      password: passwordHash,
      role: 'Company Admin',
      state: 'Telangana',
      district: 'Hyderabad'
    });

    const customersData = [
      {
        name: 'Ch. Sai Reddy',
        mobile: '9876543210',
        email: 'saireddy@agritrack.ai',
        state: 'Telangana',
        district: 'Nalgonda',
        mandal: 'Madgulapally',
        village: 'Cheruvupally',
        pincode: '508374',
        vehicleName: 'John Deere 5042D',
        brand: 'John Deere',
        model: '5042D',
        vehicleType: 'Tractor',
        hp: '42 HP',
        color: 'Green',
        year: 2026,
        deviceId: 'AGRTG00001',
        chassis: 'JD-5042D-2026-000001',
        imei: '864201059382101',
        iccid: '8991002948201948201',
        sim: '9848012341',
        lat: 16.892,
        lng: 79.482,
        address: 'Cheruvupally Village, Madgulapally Mandal, Nalgonda District, Telangana - 508374'
      },
      {
        name: 'M. Srinivas Reddy',
        mobile: '9123456784',
        email: 'srinivasreddy@agritrack.ai',
        state: 'Telangana',
        district: 'Jayashankar Bhupalpally',
        mandal: 'Kataram',
        village: 'Azamnagar',
        pincode: '506169',
        vehicleName: 'Kubota MU5502 4WD',
        brand: 'Kubota',
        model: 'MU5502 4WD',
        vehicleType: 'Tractor',
        hp: '55 HP',
        color: 'Orange',
        year: 2025,
        deviceId: 'AGRTG00002',
        chassis: 'KB-MU5502-2025-000002',
        imei: '864201059382102',
        iccid: '8991002948201948202',
        sim: '9848012342',
        lat: 18.520,
        lng: 79.880,
        address: 'Azamnagar Village, Kataram Mandal, Jayashankar Bhupalpally District, Telangana - 506169'
      },
      {
        name: 'K. Ramesh',
        mobile: '9345678123',
        email: 'kramesh@agritrack.ai',
        state: 'Telangana',
        district: 'Khammam',
        mandal: 'Sujathanagar',
        village: 'Sarvaram',
        pincode: '507120',
        vehicleName: 'LOVOL RG108 Plus CR',
        brand: 'LOVOL',
        model: 'RG108 Plus CR',
        vehicleType: 'Track Harvester',
        hp: '100 HP',
        color: 'Red',
        year: 2025,
        deviceId: 'AGRTG00003',
        chassis: 'LV-RG108-2025-000003',
        imei: '864201059382103',
        iccid: '8991002948201948203',
        sim: '9848012343',
        lat: 17.247,
        lng: 80.151,
        address: 'Sarvaram Village, Sujathanagar Mandal, Khammam District, Telangana - 507120'
      },
      {
        name: 'G. Venkateswarlu',
        mobile: '9012345678',
        email: 'venkateswarlu@agritrack.ai',
        state: 'Andhra Pradesh',
        district: 'Palnadu',
        mandal: 'Gurazala',
        village: 'Madugula',
        pincode: '522415',
        vehicleName: 'Mahindra Yuvo Tech Plus 575',
        brand: 'Mahindra',
        model: 'Yuvo Tech Plus 575',
        vehicleType: 'Tractor',
        hp: '47 HP',
        color: 'Red',
        year: 2026,
        deviceId: 'AGRAP00004',
        chassis: 'MH-YT575-2026-000004',
        imei: '864201059382104',
        iccid: '8991002948201948204',
        sim: '9848012344',
        lat: 16.581,
        lng: 79.821,
        address: 'Madugula Village, Gurazala Mandal, Palnadu District, Andhra Pradesh - 522415'
      },
      {
        name: 'P. Narasimha Rao',
        mobile: '9567891234',
        email: 'narasimharao@agritrack.ai',
        state: 'Andhra Pradesh',
        district: 'West Godavari',
        mandal: 'Tanuku',
        village: 'Taderu',
        pincode: '534202',
        vehicleName: 'Preet 987 Combine Harvester',
        brand: 'Preet',
        model: '987 Combine Harvester',
        vehicleType: 'Combine Harvester',
        hp: '75 HP',
        color: 'Red + White (Green Grain Box)',
        year: 2025,
        deviceId: 'AGRAP00005',
        chassis: 'PR-987CH-2025-000005',
        imei: '864201059382105',
        iccid: '8991002948201948205',
        sim: '9848012345',
        lat: 16.752,
        lng: 81.701,
        address: 'Taderu Village, Tanuku Mandal, West Godavari District, Andhra Pradesh - 534202'
      }
    ];

    for (const c of customersData) {
      // Create Farm Admin User Account
      const userDoc = await User.create({
        name: c.name,
        email: c.email,
        phone: c.mobile,
        mobile: c.mobile,
        password: passwordHash,
        role: 'Farm Admin',
        state: c.state,
        district: c.district,
        mandal: c.mandal,
        village: c.village,
        pincode: c.pincode
      });

      const farmDoc = await Farm.create({
        name: `${c.village} Farm Sector`,
        owner: userDoc._id
      });

      // Create Assigned Vehicle (Registration empty = "Not Registered Yet")
      const machineDoc = await Machine.create({
        name: c.vehicleName,
        brand: c.brand,
        model: c.model,
        type: c.vehicleType,
        vehicleType: c.vehicleType,
        owner: userDoc._id,
        farmId: farmDoc._id,
        chassisNumber: c.chassis,
        registration: '', // Not Registered Yet
        manufacturingYear: c.year,
        color: c.color,
        rcOwnerName: c.name,
        assignedFarmer: userDoc._id,
        currentAddress: c.address,
        location: { lat: c.lat, lng: c.lng },
        status: 'Working',
        batteryVoltage: 12.6,
        signalStrength: 92,
        remainingDieselLitres: 48,
        engineTemp: 82,
        healthScore: 96,
        workingHoursToday: 6.5,
        photo: c.img || '/assets/vehicles/default-tractor.png'
      });

      // Create Active GPS Device
      const gpsDeviceDoc = await GPSDevice.create({
        deviceId: c.deviceId,
        imei: c.imei,
        simIccid: c.iccid,
        simNumber: c.sim,
        owner: userDoc._id,
        vehicleId: machineDoc._id,
        currentVehicle: machineDoc._id,
        activationStatus: 'Activated',
        currentStatus: 'Online',
        connectionStatus: 'Online',
        installationLocation: 'Main Dash Harness',
        installerName: 'AgriTrack Certified Field Engineer'
      });

      // Link Device ID on Machine
      machineDoc.gpsDeviceId = gpsDeviceDoc._id;
      await machineDoc.save();

      // 3. Seed 30 Days History for each vehicle
      console.log(` └─ Seeding 30 days complete history for ${c.name} (${c.vehicleName})...`);

      for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
        const recordDate = new Date();
        recordDate.setDate(recordDate.getDate() - dayOffset);

        // Diesel Expense Log (Every 3 days)
        if (dayOffset % 3 === 0) {
          await DieselExpense.create({
            vehicleId: machineDoc._id,
            customerId: userDoc._id,
            date: recordDate,
            dieselQuantity: 40 + (dayOffset % 5),
            costPerLitre: 96.50,
            totalCost: (40 + (dayOffset % 5)) * 96.50,
            petrolPumpName: `${c.mandal} Indian Oil Station`,
            remarks: 'Regular daily field operations diesel filling',
            billPhoto: '/assets/receipts/fuel-receipt-placeholder.png'
          });
        }

        // Service Expense Log (Every 10 days)
        if (dayOffset % 10 === 0) {
          await ServiceExpense.create({
            vehicleId: machineDoc._id,
            customerId: userDoc._id,
            date: recordDate,
            category: dayOffset === 0 ? 'Oil Change' : dayOffset === 10 ? 'Greasing' : 'Filters',
            workshopName: `${c.district} Authorized Service Center`,
            engineHours: 450 + (30 - dayOffset) * 6,
            serviceCost: 2400 + (dayOffset * 50),
            billPhoto: '/assets/receipts/service-receipt-placeholder.png',
            remarks: 'Scheduled 250-hour routine tractor service'
          });
        }

        // Operating Expense Log
        await OperatingExpense.create({
          vehicleId: machineDoc._id,
          customerId: userDoc._id,
          date: recordDate,
          category: 'Driver Salary',
          amount: 600,
          remarks: 'Daily driver wage payout'
        });

        // Income Log (Custom Hire earnings)
        if (dayOffset % 2 === 0) {
          await VehicleIncome.create({
            vehicleId: machineDoc._id,
            customerId: userDoc._id,
            date: recordDate,
            source: 'Custom Hire',
            amount: 5400,
            remarks: 'Custom plowing contract payment received'
          });
        }

        // Notification History
        await NotificationHistory.create({
          userId: userDoc._id,
          vehicleId: machineDoc._id,
          title: dayOffset === 0 ? 'Engine Started' : 'GPS Connected',
          message: `Vehicle ${c.vehicleName} telemetry active at ${c.village}`,
          eventType: 'Engine Started',
          severity: 'Info',
          isRead: dayOffset > 1,
          createdAt: recordDate
        });
      }

      // Seed Trip Replay Trajectory
      await TripReplay.create({
        vehicleId: machineDoc._id,
        date: new Date(),
        startTime: new Date(Date.now() - 4 * 3600 * 1000),
        endTime: new Date(),
        totalDistanceKm: 42.5,
        totalWorkingHours: 6.5,
        maxSpeedKmH: 24,
        avgSpeedKmH: 14,
        routePoints: [
          { lat: c.lat, lng: c.lng, speed: 0, engineTemp: 75, fuelLevelPercent: 90, timestamp: new Date(Date.now() - 4 * 3600 * 1000) },
          { lat: c.lat + 0.005, lng: c.lng + 0.005, speed: 18, engineTemp: 82, fuelLevelPercent: 88, timestamp: new Date(Date.now() - 3 * 3600 * 1000) },
          { lat: c.lat + 0.010, lng: c.lng + 0.012, speed: 22, engineTemp: 85, fuelLevelPercent: 84, timestamp: new Date(Date.now() - 2 * 3600 * 1000) },
          { lat: c.lat + 0.012, lng: c.lng + 0.015, speed: 0, engineTemp: 78, fuelLevelPercent: 82, timestamp: new Date() }
        ],
        stops: [
          { lat: c.lat + 0.005, lng: c.lng + 0.005, durationMinutes: 15, address: `${c.village} Tea Stop` }
        ]
      });

    }

    console.log('\n======================================================');
    console.log('🎉 Production Demo Database Successfully Seeded!');
    console.log('======================================================');
    console.log('🔑 Company Admin Credentials: admin@agritrack.ai / 123456');
    console.log('🔑 Customer 1 Credentials (Ch. Sai Reddy): saireddy@agritrack.ai / 123456');
    console.log('🔑 Customer 2 Credentials (M. Srinivas Reddy): srinivasreddy@agritrack.ai / 123456');
    console.log('🔑 Customer 3 Credentials (K. Ramesh): kramesh@agritrack.ai / 123456');
    console.log('🔑 Customer 4 Credentials (G. Venkateswarlu): venkateswarlu@agritrack.ai / 123456');
    console.log('🔑 Customer 5 Credentials (P. Narasimha Rao): narasimharao@agritrack.ai / 123456');
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding production database:', error);
    process.exit(1);
  }
}

seedProductionDB();
