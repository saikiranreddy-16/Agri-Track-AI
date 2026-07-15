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
    console.log('Database cleared.');

    // 1. Seed Users (Realigned Roles)
    console.log('Seeding Users...');
    const users = await User.create([
      {
        name: 'Rajesh Patel',
        email: 'rajesh@example.com',
        password: 'password123', // Will be hashed by user pre-save hook
        phone: '+919876543210',
        company: 'Patel Agro Farms',
        role: 'Farm Admin',
        subscriptionStatus: 'Active',
        subscriptionPlan: 'Premium',
        isFirstLogin: false,
      },
      {
        name: 'Gurpreet Singh',
        email: 'gurpreet@example.com',
        password: 'password123',
        phone: '+919876543211',
        company: 'Singh operations Ludhiana',
        role: 'Farm Admin',
        subscriptionStatus: 'Active',
        subscriptionPlan: 'Standard',
        isFirstLogin: false,
      },
      {
        name: 'Admin User',
        email: 'admin@agritrack.in',
        password: 'password123',
        phone: '+919999999999',
        company: 'AgriTrack Operations',
        role: 'Company Admin',
        isFirstLogin: false,
      },
    ]);
    console.log(`Seeded ${users.length} users.`);

    const rajesh = users[0];
    const gurpreet = users[1];

    // Seed Farms (supporting multiple farms)
    console.log('Seeding Farms...');
    const farms = await Farm.create([
      {
        name: 'Patel Agro Farms Ludhiana Block',
        owner: rajesh._id,
      },
      {
        name: 'Patel Agro Farms Jalandhar Block', // Multiple farms for Rajesh!
        owner: rajesh._id,
      },
      {
        name: 'Singh Operations Ludhiana Main',
        owner: gurpreet._id,
      },
    ]);
    console.log(`Seeded ${farms.length} farms.`);
    const rajeshFarm = farms[0];

    // 2. Seed Drivers
    console.log('Seeding Drivers...');
    const driversData = [
      {
        mockId: 'drv-1',
        name: 'Gurpreet Singh',
        phone: '+91 98765 43210',
        experience: '8 Years',
        rating: 4.8,
        status: 'Active',
        workingHoursToday: 6.8,
        acresWorked: 18.2,
        fuelEfficiency: 92,
        attendance: '98%',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80',
        performanceData: [
          { month: 'Jan', hours: 120, acres: 390 },
          { month: 'Feb', hours: 135, acres: 440 },
          { month: 'Mar', hours: 148, acres: 500 },
          { month: 'Apr', hours: 160, acres: 560 },
          { month: 'May', hours: 175, acres: 620 },
          { month: 'Jun', hours: 168, acres: 600 },
        ],
      },
      {
        mockId: 'drv-2',
        name: 'Ramesh Kumar',
        phone: '+91 98123 45678',
        experience: '5 Years',
        rating: 4.9,
        status: 'Active',
        workingHoursToday: 5.2,
        acresWorked: 22.0,
        fuelEfficiency: 96,
        attendance: '100%',
        photo: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&w=400&h=400&q=80',
        performanceData: [
          { month: 'Jan', hours: 90, acres: 300 },
          { month: 'Feb', hours: 110, acres: 380 },
          { month: 'Mar', hours: 130, acres: 450 },
          { month: 'Apr', hours: 120, acres: 410 },
          { month: 'May', hours: 145, acres: 520 },
          { month: 'Jun', hours: 135, acres: 480 },
        ],
      },
      {
        mockId: 'drv-3',
        name: 'Suresh Patel',
        phone: '+91 98901 23456',
        experience: '12 Years',
        rating: 4.7,
        status: 'Active',
        workingHoursToday: 7.4,
        acresWorked: 28.5,
        fuelEfficiency: 89,
        attendance: '95%',
        photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&h=400&q=80',
        performanceData: [
          { month: 'Jan', hours: 150, acres: 480 },
          { month: 'Feb', hours: 140, acres: 460 },
          { month: 'Mar', hours: 160, acres: 520 },
          { month: 'Apr', hours: 155, acres: 500 },
          { month: 'May', hours: 170, acres: 560 },
          { month: 'Jun', hours: 165, acres: 540 },
        ],
      },
      {
        mockId: 'drv-4',
        name: 'Amit Sharma',
        phone: '+91 98765 01234',
        experience: '3 Years',
        rating: 4.5,
        status: 'Active',
        workingHoursToday: 0.0,
        acresWorked: 0.0,
        fuelEfficiency: 94,
        attendance: '92%',
        photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&h=400&q=80',
        performanceData: [
          { month: 'Jan', hours: 80, acres: 240 },
          { month: 'Feb', hours: 95, acres: 290 },
          { month: 'Mar', hours: 100, acres: 310 },
          { month: 'Apr', hours: 90, acres: 280 },
          { month: 'May', hours: 110, acres: 350 },
          { month: 'Jun', hours: 105, acres: 330 },
        ],
      },
      {
        mockId: 'drv-5',
        name: 'Harpreet Kaur',
        phone: '+91 98111 22233',
        experience: '6 Years',
        rating: 4.6,
        status: 'Off-duty',
        workingHoursToday: 0.0,
        acresWorked: 0.0,
        fuelEfficiency: 91,
        attendance: '96%',
        photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&h=400&q=80',
        performanceData: [
          { month: 'Jan', hours: 100, acres: 320 },
          { month: 'Feb', hours: 115, acres: 370 },
          { month: 'Mar', hours: 120, acres: 400 },
          { month: 'Apr', hours: 110, acres: 360 },
          { month: 'May', hours: 130, acres: 430 },
          { month: 'Jun', hours: 125, acres: 415 },
        ],
      },
    ];

    const driverMap = {};
    for (const data of driversData) {
      const mockId = data.mockId;
      delete data.mockId;
      data.owner = rajesh._id;
      const driver = await Driver.create(data);
      driverMap[mockId] = driver._id;
    }
    console.log(`Seeded ${Object.keys(driverMap).length} drivers.`);

    // 3. Seed Machines (Vehicles) & independent GPS Devices
    console.log('Seeding Machines and GPS Devices...');
    const machinesData = [
      {
        mockId: 'mach-1',
        name: 'Mahindra Novo 755 DI',
        type: 'Tractor',
        brand: 'Mahindra',
        model: 'Novo 755 DI',
        registration: 'PB-10-AB-1234',
        status: 'Working',
        fuel: 82,
        battery: 95,
        mockDriverId: 'drv-1',
        location: { lat: 30.902, lng: 75.853 },
        speed: 12,
        engineStatus: 'On',
        workingHours: 245.5,
        distanceTravelled: 1240.2,
        nextService: new Date('2026-07-25'),
        currentAddress: 'Sector 4 Grain Belt, Ludhiana, Punjab',
        photo: 'https://images.unsplash.com/photo-1592919505780-303950717480?auto=format&fit=crop&w=800&q=80',
        documents: ['Mahindra_Novo_Manual.pdf', 'Insurance_PB10AB1234.pdf'],
      },
      {
        mockId: 'mach-2',
        name: 'Swaraj 963 FE',
        type: 'Harvester',
        brand: 'Swaraj',
        model: '963 FE',
        registration: 'PB-08-CD-5678',
        status: 'Working',
        fuel: 45,
        battery: 88,
        mockDriverId: 'drv-2',
        location: { lat: 30.898, lng: 75.862 },
        speed: 8,
        engineStatus: 'On',
        workingHours: 512.2,
        distanceTravelled: 3210.8,
        nextService: new Date('2026-07-28'),
        currentAddress: 'Sector 12, South Corn Basin, Ludhiana, Punjab',
        photo: 'https://images.unsplash.com/photo-1595246140625-5c3b545b0976?auto=format&fit=crop&w=800&q=80',
        documents: ['Swaraj_963FE_Harvest_Guide.pdf'],
      },
      {
        mockId: 'mach-3',
        name: 'Sonalika Tiger DI 75',
        type: 'Tractor',
        brand: 'Sonalika',
        model: 'Tiger DI 75',
        registration: 'HR-26-AB-9912',
        status: 'Offline',
        fuel: 12,
        battery: 85,
        mockDriverId: null,
        location: { lat: 30.891, lng: 75.845 },
        speed: 0,
        engineStatus: 'Off',
        workingHours: 189.0,
        distanceTravelled: 980.5,
        nextService: new Date('2026-07-15'),
        currentAddress: 'Maintenance Yard Depot, Ludhiana, Punjab',
        photo: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
        documents: ['Tiger_75_Tech_Manual.pdf'],
      },
      {
        mockId: 'mach-4',
        name: 'John Deere 5310 GearPro',
        type: 'Tractor',
        brand: 'John Deere',
        model: '5310 GearPro',
        registration: 'PB-10-XY-2345',
        status: 'Working',
        fuel: 94,
        battery: 98,
        mockDriverId: 'drv-4',
        location: { lat: 30.905, lng: 75.870 },
        speed: 15,
        engineStatus: 'On',
        workingHours: 94.2,
        distanceTravelled: 450.1,
        nextService: new Date('2026-09-02'),
        currentAddress: 'East Meadow, Ludhiana, Punjab',
        photo: 'https://images.unsplash.com/photo-1594142426444-a4cd02470991?auto=format&fit=crop&w=800&q=80',
        documents: ['JD_5310_Manual.pdf'],
      },
      {
        mockId: 'mach-5',
        name: 'TAFE 30 DI Orchard',
        type: 'Tractor',
        brand: 'TAFE',
        model: '30 DI Orchard',
        registration: 'MH-15-ZA-7721',
        status: 'Idle',
        fuel: 68,
        battery: 94,
        mockDriverId: 'drv-5',
        location: { lat: 30.895, lng: 75.850 },
        speed: 0,
        engineStatus: 'Off',
        workingHours: 342.1,
        distanceTravelled: 1890.3,
        nextService: new Date('2026-08-01'),
        currentAddress: 'Section 8 Headlands, Ludhiana, Punjab',
        photo: 'https://images.unsplash.com/photo-1530982009887-a6558440dd1a?auto=format&fit=crop&w=800&q=80',
        documents: ['TAFE_30DI_Operator_Guide.pdf'],
      },
      {
        mockId: 'mach-6',
        name: 'Preet 6049 Super',
        type: 'Tractor',
        brand: 'Preet',
        model: '6049 Super',
        registration: 'PB-11-JK-3420',
        status: 'Working',
        fuel: 55,
        battery: 91,
        mockDriverId: 'drv-3',
        location: { lat: 30.888, lng: 75.855 },
        speed: 10,
        engineStatus: 'On',
        workingHours: 120.4,
        distanceTravelled: 720.5,
        nextService: new Date('2026-08-20'),
        currentAddress: 'West Side Alfalfa Field, Ludhiana, Punjab',
        photo: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80',
        documents: ['Preet_6049_UserManual.pdf'],
      },
      {
        mockId: 'mach-7',
        name: 'Kartar 4000 Harvester',
        type: 'Harvester',
        brand: 'Kartar',
        model: '4000 Combo',
        registration: 'PB-10-LM-1002',
        status: 'Maintenance',
        fuel: 0,
        battery: 60,
        mockDriverId: null,
        location: { lat: 30.890, lng: 75.840 },
        speed: 0,
        engineStatus: 'Off',
        workingHours: 852.1,
        distanceTravelled: 5410.2,
        nextService: new Date('2026-06-25'),
        currentAddress: 'Maintenance Yard Depot, Ludhiana, Punjab',
        photo: 'https://images.unsplash.com/photo-1574375927938-d5a98e8edd86?auto=format&fit=crop&w=800&q=80',
        documents: ['Kartar_4000_Operations.pdf'],
      },
    ];

    const machineMap = {};
    for (const data of machinesData) {
      const mockId = data.mockId;
      const mockDriverId = data.mockDriverId;
      delete data.mockId;
      delete data.mockDriverId;

      const devId = `dev-${mockId}`;
      const gpsDevice = await GPSDevice.create({
        deviceId: devId,
        imei: `imei-${devId}`,
        simNumber: `sim-${devId}`,
        owner: rajesh._id,
        status: 'Active',
      });

      data.chassisNumber = data.registration; // Chassis Number matches registration for compat
      data.gpsDeviceId = gpsDevice._id;
      data.farmId = rajeshFarm._id;
      data.owner = rajesh._id;

      const machine = await Machine.create(data);
      machineMap[mockId] = machine._id;

      // Update GPS Device vehicle link
      gpsDevice.vehicleId = machine._id;
      await gpsDevice.save();

      // Relational update: Driver
      if (mockDriverId && driverMap[mockDriverId]) {
        machine.assignedDriverId = driverMap[mockDriverId];
        await machine.save();
        await Driver.findByIdAndUpdate(driverMap[mockDriverId], { assignedMachineId: machine._id });
      }
    }
    console.log(`Seeded ${Object.keys(machineMap).length} machines and GPS Devices.`);

    // 4. Seed Fields
    console.log('Seeding Fields...');
    const fieldsData = [
      {
        name: 'North Wheat Block',
        area: 30,
        crop: 'Wheat',
        owner: rajesh._id,
        mockMachineId: 'mach-1',
        status: 'In Progress',
        boundaries: [
          [30.900, 75.850],
          [30.906, 75.850],
          [30.906, 75.856],
          [30.900, 75.856],
        ],
      },
      {
        name: 'South Rice Sector',
        area: 55,
        crop: 'Rice',
        owner: rajesh._id,
        mockMachineId: 'mach-2',
        status: 'In Progress',
        boundaries: [
          [30.895, 75.858],
          [30.901, 75.858],
          [30.901, 75.866],
          [30.895, 75.866],
        ],
      },
      {
        name: 'East Cotton Fields',
        area: 45,
        crop: 'Cotton',
        owner: rajesh._id,
        mockMachineId: 'mach-4',
        status: 'Completed',
        boundaries: [
          [30.902, 75.867],
          [30.908, 75.867],
          [30.908, 75.875],
          [30.902, 75.875],
        ],
      },
      {
        name: 'West Sugarcane Meadows',
        area: 25,
        crop: 'Sugarcane',
        owner: rajesh._id,
        mockMachineId: 'mach-6',
        status: 'Completed',
        boundaries: [
          [30.885, 75.850],
          [30.892, 75.850],
          [30.892, 75.860],
          [30.885, 75.860],
        ],
      },
    ];

    for (const f of fieldsData) {
      const { mockMachineId, ...data } = f;
      data.machineAssigned = mockMachineId ? machineMap[mockMachineId] : null;
      await Field.create(data);
    }
    console.log(`Seeded ${fieldsData.length} fields.`);

    // 5. Seed Jobs
    console.log('Seeding Jobs...');
    const jobsData = [
      {
        title: 'Rice Sowing Block A',
        mockMachineId: 'mach-1',
        mockDriverId: 'drv-1',
        startDate: new Date('2026-07-06T08:00:00'),
        endDate: new Date('2026-07-08T18:00:00'),
        status: 'In Progress',
        priority: 'High',
        progress: 75,
        timeline: [
          { date: new Date('2026-07-06T08:00:00'), title: 'Job Deployed', desc: 'Gurpreet Singh deployed with Mahindra Novo 755' },
          { date: new Date('2026-07-06T12:00:00'), title: 'Tilled 10 Hectares', desc: 'Soil moisture nominal, working at 12 km/h' },
          { date: new Date('2026-07-07T10:00:00'), title: 'Tilled 22 Hectares', desc: 'Progressing towards East Headlands' },
        ],
      },
      {
        title: 'Wheat Harvesting Section 12',
        mockMachineId: 'mach-2',
        mockDriverId: 'drv-2',
        startDate: new Date('2026-07-06T09:00:00'),
        endDate: new Date('2026-07-10T17:00:00'),
        status: 'In Progress',
        priority: 'High',
        progress: 42,
        timeline: [
          { date: new Date('2026-07-06T09:00:00'), title: 'Harvest Deployed', desc: 'Swaraj Harvester deployed with operator Ramesh Kumar' },
        ],
      },
      {
        title: 'Sugarcane Planting Meadow',
        mockMachineId: 'mach-3',
        mockDriverId: null,
        startDate: new Date('2026-07-12T08:00:00'),
        endDate: null,
        status: 'Pending',
        priority: 'Medium',
        progress: 0,
        timeline: [],
      },
      {
        title: 'Pesticide Spraying Cotton',
        mockMachineId: 'mach-4',
        mockDriverId: 'drv-4',
        startDate: new Date('2026-07-05T08:00:00'),
        endDate: new Date('2026-07-05T16:30:00'),
        status: 'Completed',
        priority: 'Low',
        progress: 100,
        timeline: [
          { date: new Date('2026-07-05T08:00:00'), title: 'Spraying Started', desc: 'John Deere 5310 deployed with Amit Sharma' },
          { date: new Date('2026-07-05T16:30:00'), title: 'Spraying Finished', desc: '45 Hectares fully completed' },
        ],
      },
    ];

    for (const j of jobsData) {
      const { mockMachineId, mockDriverId, ...data } = j;
      data.machineId = mockMachineId ? machineMap[mockMachineId] : null;
      data.driverId = mockDriverId ? driverMap[mockDriverId] : null;
      data.owner = rajesh._id;
      await Job.create(data);
    }
    console.log(`Seeded ${jobsData.length} jobs.`);

    // 6. Seed Alerts
    console.log('Seeding Alerts...');
    const alertsData = [
      {
        type: 'Low Fuel',
        message: 'Sonalika Tiger DI (mach-3) has critical fuel level (12%)',
        mockMachineId: 'mach-3',
        driverName: 'Not Assigned',
        time: new Date(Date.now() - 10 * 60 * 1000), // 10 mins ago
        priority: 'High',
        category: 'Fuel',
        status: 'Active',
      },
      {
        type: 'GPS Offline',
        message: 'GPS connection lost for Kartar Harvester (mach-7)',
        mockMachineId: 'mach-7',
        driverName: 'Not Assigned',
        time: new Date(Date.now() - 32 * 60 * 1000), // 32 mins ago
        priority: 'Critical',
        category: 'GPS',
        status: 'Active',
      },
      {
        type: 'Maintenance Due',
        message: 'Swaraj Harvester service period overdue',
        mockMachineId: 'mach-2',
        driverName: 'Ramesh Kumar',
        time: new Date(Date.now() - 2 * 60 * 65 * 1000), // ~2 hours ago
        priority: 'Medium',
        category: 'Maintenance',
        status: 'Active',
      },
      {
        type: 'Engine Off',
        message: 'Unscheduled engine shutdown for TAFE Orchard (mach-5)',
        mockMachineId: 'mach-5',
        driverName: 'Harpreet Kaur',
        time: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        priority: 'Low',
        category: 'System',
        status: 'Active',
      },
      {
        type: 'Battery Low',
        message: 'Kartar Harvester voltage under 11.2V',
        mockMachineId: 'mach-7',
        driverName: 'Not Assigned',
        time: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        priority: 'High',
        category: 'System',
        status: 'Active',
      },
    ];

    for (const a of alertsData) {
      const { mockMachineId, ...data } = a;
      data.machineId = mockMachineId ? machineMap[mockMachineId] : null;
      await Alert.create(data);
    }
    console.log(`Seeded ${alertsData.length} alerts.`);

    // 7. Seed GPSHistory
    console.log('Seeding GPS History...');
    const gpsHistoryData = {
      'mach-1': [
        { lat: 30.900, lng: 75.850, speed: 10, offsetMinutes: 75 },
        { lat: 30.901, lng: 75.851, speed: 12, offsetMinutes: 60 },
        { lat: 30.902, lng: 75.852, speed: 11, offsetMinutes: 45 },
        { lat: 30.903, lng: 75.853, speed: 13, offsetMinutes: 30 },
        { lat: 30.904, lng: 75.854, speed: 12, offsetMinutes: 15 },
        { lat: 30.902, lng: 75.853, speed: 12, offsetMinutes: 0 },
      ],
      'mach-2': [
        { lat: 30.895, lng: 75.858, speed: 6, offsetMinutes: 120 },
        { lat: 30.896, lng: 75.859, speed: 7, offsetMinutes: 90 },
        { lat: 30.897, lng: 75.860, speed: 8, offsetMinutes: 60 },
        { lat: 30.898, lng: 75.861, speed: 7, offsetMinutes: 30 },
        { lat: 30.898, lng: 75.862, speed: 8, offsetMinutes: 0 },
      ],
    };

    let gpsCount = 0;
    for (const [mockId, pts] of Object.entries(gpsHistoryData)) {
      const machineId = machineMap[mockId];
      if (machineId) {
        for (const pt of pts) {
          await GPSHistory.create({
            machineId,
            latitude: pt.lat,
            longitude: pt.lng,
            speed: pt.speed,
            timestamp: new Date(Date.now() - pt.offsetMinutes * 60 * 1000),
          });
          gpsCount++;
        }
      }
    }
    console.log(`Seeded ${gpsCount} GPS history coordinates.`);

    // 8. Seed FuelHistory
    console.log('Seeding Fuel History...');
    const fuelHistoryData = {
      'mach-1': [
        { level: 95, offsetDays: 5 },
        { level: 80, offsetDays: 4 },
        { level: 62, offsetDays: 3 },
        { level: 90, offsetDays: 2 },
        { level: 75, offsetDays: 1 },
        { level: 82, offsetDays: 0 },
      ],
      'mach-2': [
        { level: 85, offsetDays: 2 },
        { level: 65, offsetDays: 1 },
        { level: 45, offsetDays: 0 },
      ],
      'mach-3': [
        { level: 50, offsetDays: 2 },
        { level: 30, offsetDays: 1 },
        { level: 12, offsetDays: 0 },
      ],
      'mach-4': [
        { level: 100, offsetDays: 2 },
        { level: 94, offsetDays: 0 },
      ],
      'mach-5': [
        { level: 80, offsetDays: 1 },
        { level: 68, offsetDays: 0 },
      ],
      'mach-6': [
        { level: 85, offsetDays: 1 },
        { level: 55, offsetDays: 0 },
      ],
    };

    let fuelCount = 0;
    for (const [mockId, logs] of Object.entries(fuelHistoryData)) {
      const machineId = machineMap[mockId];
      if (machineId) {
        for (const log of logs) {
          await FuelHistory.create({
            machineId,
            level: log.level,
            timestamp: new Date(Date.now() - log.offsetDays * 24 * 60 * 60 * 1000),
          });
          fuelCount++;
        }
      }
    }
    console.log(`Seeded ${fuelCount} fuel log snapshots.`);

    // 9. Seed Maintenance tasks
    console.log('Seeding Maintenance...');
    const maintenanceData = [
      {
        mockMachineId: 'mach-1',
        task: 'Hydraulic Fluid Top-Up',
        date: new Date('2026-07-15'),
        priority: 'High',
        type: 'Hydraulics',
        status: 'Upcoming',
      },
      {
        mockMachineId: 'mach-4',
        task: 'Air Filter Cleaning & Replace',
        date: new Date('2026-07-22'),
        priority: 'Medium',
        type: 'Engine',
        status: 'Upcoming',
      },
      {
        mockMachineId: 'mach-3',
        task: 'Full Electrical Systems check',
        date: new Date('2026-07-29'),
        priority: 'High',
        type: 'Electrical',
        status: 'Upcoming',
      },
      {
        mockMachineId: 'mach-6',
        task: 'Transmission Oil Inspection',
        date: new Date('2026-08-05'),
        priority: 'Low',
        type: 'Transmission',
        status: 'Upcoming',
      },
      {
        mockMachineId: 'mach-1',
        task: 'Engine Oil & Filter Change',
        date: new Date('2026-06-12'),
        priority: 'Medium',
        type: 'Engine',
        status: 'Completed',
        mechanic: 'Gurpreet Singh (Operator Check)',
        cost: 4500,
        notes: 'Replaced with OEM Mahindra Engine Oil.',
      },
      {
        mockMachineId: 'mach-2',
        task: 'Blade Sharpening & Cylinder Balance',
        date: new Date('2026-06-20'),
        priority: 'High',
        type: 'Engine',
        status: 'Completed',
        mechanic: 'Swaraj Service Rep',
        cost: 6800,
        notes: 'Main threshing cylinder recalibrated.',
      },
    ];

    for (const m of maintenanceData) {
      const { mockMachineId, ...data } = m;
      data.machineId = machineMap[mockMachineId];
      if (data.machineId) {
        await Maintenance.create(data);
      }
    }
    console.log(`Seeded ${maintenanceData.length} maintenance records.`);

    // 10. Seed Activity Logs
    console.log('Seeding Activity Logs...');
    const activityData = [
      { user: rajesh._id, userName: 'Rajesh Patel', action: 'User Logged In', details: 'Web login from Ludhiana IP.' },
      { user: rajesh._id, userName: 'System', action: 'Machine Added', details: 'Registered new Mahindra Novo 755 DI vehicle.' },
      { user: rajesh._id, userName: 'System', action: 'Driver Assigned', details: 'Assigned Gurpreet Singh to Mahindra Novo 755 DI.' },
    ];
    await ActivityLog.create(activityData);
    console.log('Activity logs seeded.');

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
