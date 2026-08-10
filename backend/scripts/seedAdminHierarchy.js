import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/userModel.js';
import LoginHistory from '../models/loginHistoryModel.js';
import ActivityLog from '../models/activityLogModel.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gps_db';

async function seedEnterpriseAdminHierarchy() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGODB_URI);
    console.log(`Connected to MongoDB: ${mongoose.connection.host}`);

    console.log('🔒 Preserving ALL customer data, vehicles, devices, telemetry, and histories...');
    console.log('🧹 Purging ONLY existing Admin accounts, Admin login history, and Admin activity logs...');

    // Delete only Admin role users
    await User.deleteMany({
      role: { $in: ['Company Admin', 'Grand Master Admin', 'Master Admin', 'State Admin'] }
    });

    console.log('✅ Legacy admin accounts purged.');

    // 1. Level 1 – Grand Master Admin
    const grandMaster = await User.create({
      employeeId: 'AGT-GM-001',
      name: 'Ravi Kumar',
      email: 'ravi.kumar@agritrackai.com',
      password: 'Agri@GM2026#',
      phone: '+91 9876543001',
      company: 'AgriTrack AI Pvt. Ltd.',
      office: 'Head Office - Hyderabad',
      designation: 'Grand Master Administrator',
      department: 'Management',
      role: 'Grand Master Admin',
      assignedStates: ['Telangana', 'Andhra Pradesh', 'Karnataka', 'Tamil Nadu', 'Kerala', 'Punjab', 'Haryana', 'Gujarat', 'Maharashtra'],
      permissions: {
        fleet: true,
        customers: true,
        devices: true,
        reports: true,
        analytics: true,
        aiAdmin: true,
        userManagement: true,
        settings: true
      },
      accountStatus: 'Active',
      currentSessionStatus: 'Online',
      joiningDate: new Date('2023-01-15'),
      lastLogin: new Date(),
      isFirstLogin: false
    });

    // 2. Level 2 – South India Master Admin 1 (Full operational capabilities for South Zone)
    const southAdmin1 = await User.create({
      employeeId: 'AGT-SM-001',
      name: 'Mahesh Reddy',
      email: 'mahesh.reddy@agritrackai.com',
      password: 'South@2026#',
      phone: '+91 9876543002',
      company: 'AgriTrack AI Pvt. Ltd.',
      office: 'Hyderabad Regional Office',
      designation: 'Regional Operations Manager',
      department: 'Operations',
      role: 'Master Admin',
      assignedStates: ['Telangana', 'Andhra Pradesh', 'Karnataka', 'Tamil Nadu', 'Kerala'],
      permissions: {
        fleet: true,
        customers: true,
        devices: true,
        reports: true,
        analytics: true,
        aiAdmin: true, // Enabled for Regional Masters
        userManagement: true, // Can create/manage State Admins in South Zone
        settings: true
      },
      accountStatus: 'Active',
      currentSessionStatus: 'Online',
      joiningDate: new Date('2023-06-01'),
      lastLogin: new Date(Date.now() - 3600000),
      isFirstLogin: false
    });

    // 3. Level 2 – South India Master Admin 2
    const southAdmin2 = await User.create({
      employeeId: 'AGT-SM-002',
      name: 'Suresh Naidu',
      email: 'suresh.naidu@agritrackai.com',
      password: 'Tech@2026#',
      phone: '+91 9876543003',
      company: 'AgriTrack AI Pvt. Ltd.',
      office: 'Bengaluru Regional Office',
      designation: 'Regional Technical Manager',
      department: 'Technical',
      role: 'Master Admin',
      assignedStates: ['Kerala', 'Karnataka', 'Tamil Nadu', 'Puducherry', 'Lakshadweep'],
      permissions: {
        fleet: true,
        customers: true,
        devices: true,
        reports: true,
        analytics: true,
        aiAdmin: true,
        userManagement: true,
        settings: true
      },
      accountStatus: 'Active',
      currentSessionStatus: 'Offline',
      joiningDate: new Date('2023-08-10'),
      lastLogin: new Date(Date.now() - 7200000),
      isFirstLogin: false
    });

    // 4. Level 3 – Telangana State Admin (Full operational state capabilities)
    const tgStateAdmin = await User.create({
      employeeId: 'AGT-TG-001',
      name: 'Praveen Reddy',
      email: 'praveen.reddy@agritrackai.com',
      password: 'Telangana@26#',
      phone: '+91 9876543004',
      company: 'AgriTrack AI Pvt. Ltd.',
      office: 'State Office - Hyderabad',
      designation: 'State Fleet Manager',
      department: 'State Operations',
      role: 'State Admin',
      assignedStates: ['Telangana'],
      assignedState: 'Telangana',
      permissions: {
        fleet: true,
        customers: true, // Manage Telangana customers
        devices: true,   // Activate & Replace devices
        reports: true,   // Generate state reports
        analytics: true,
        aiAdmin: false,  // AI Admin restricted to Master+
        userManagement: false,
        settings: true   // Basic state settings
      },
      accountStatus: 'Active',
      currentSessionStatus: 'Online',
      joiningDate: new Date('2024-01-20'),
      lastLogin: new Date(Date.now() - 1800000),
      isFirstLogin: false
    });

    // 5. Level 3 – Andhra Pradesh State Admin (Full operational state capabilities)
    const apStateAdmin = await User.create({
      employeeId: 'AGT-AP-001',
      name: 'Lakshmi Prasad',
      email: 'lakshmi.prasad@agritrackai.com',
      password: 'Andhra@2026#',
      phone: '+91 9876543005',
      company: 'AgriTrack AI Pvt. Ltd.',
      office: 'State Office - Vijayawada',
      designation: 'State Fleet Manager',
      department: 'State Operations',
      role: 'State Admin',
      assignedStates: ['Andhra Pradesh'],
      assignedState: 'Andhra Pradesh',
      permissions: {
        fleet: true,
        customers: true, // Manage AP customers
        devices: true,   // Activate & Replace devices
        reports: true,   // Generate state reports
        analytics: true,
        aiAdmin: false,
        userManagement: false,
        settings: true
      },
      accountStatus: 'Active',
      currentSessionStatus: 'Online',
      joiningDate: new Date('2024-02-15'),
      lastLogin: new Date(Date.now() - 2400000),
      isFirstLogin: false
    });

    console.log('✅ Seeded 5 Enterprise Admin Accounts with Role-Based Capabilities.');

    // 6. Seed ~50 Login History Records for Admins
    console.log('Seeding 50 Login History Records for Admin accounts...');
    const adminUsers = [grandMaster, southAdmin1, southAdmin2, tgStateAdmin, apStateAdmin];
    const browsers = ['Chrome 126.0 (Windows 11)', 'Firefox 127.0 (macOS)', 'Edge 125.0 (Windows 11)', 'Safari 17.5 (iPadOS)'];
    const devices = ['Desktop - Windows PC', 'Laptop - MacBook Pro', 'Tablet - iPad Air', 'Desktop - Linux Workstation'];
    const ipAddresses = ['103.156.42.10', '183.82.98.45', '117.211.14.92', '157.48.20.11', '14.99.124.50'];

    const loginRecords = [];
    const nowMs = Date.now();

    for (let i = 0; i < 50; i++) {
      const usr = adminUsers[i % adminUsers.length];
      const timeOffsetMs = (i + 1) * 6 * 3600 * 1000;
      loginRecords.push({
        user: usr._id,
        userEmail: usr.email,
        userPhone: usr.phone,
        time: new Date(nowMs - timeOffsetMs),
        logoutTime: new Date(nowMs - timeOffsetMs + 45 * 60 * 1000),
        ip: ipAddresses[i % ipAddresses.length],
        browser: browsers[i % browsers.length],
        device: devices[i % devices.length],
        success: i % 12 !== 0
      });
    }
    await LoginHistory.insertMany(loginRecords);
    console.log(`✅ Seeded ${loginRecords.length} Login History entries.`);

    // 7. Seed Admin Activity Logs
    console.log('Seeding Recent Admin Activities...');
    const activityLogs = [
      { user: grandMaster._id, action: 'CREATE_USER', details: 'Created State Admin account for Telangana (AGT-TG-001)', category: 'User Management', ipAddress: '103.156.42.10' },
      { user: grandMaster._id, action: 'UPDATE_AI_CONFIG', details: 'Updated AI telemetry sampling rate to 5 seconds', category: 'AI Administration', ipAddress: '103.156.42.10' },
      { user: southAdmin1._id, action: 'ACTIVATE_DEVICE', details: 'Activated GPS Device AGRTG00001 for Ch. Sai Reddy', category: 'Device Activation', ipAddress: '183.82.98.45' },
      { user: southAdmin1._id, action: 'REPLACE_DEVICE', details: 'Configured replacement GPS module AGRTG00002 for Kubota tractor', category: 'Device Replacement', ipAddress: '183.82.98.45' },
      { user: tgStateAdmin._id, action: 'CUSTOMER_UPDATE', details: 'Updated vehicle assignment for John Deere 5042D (JD-5042D-2026-000001)', category: 'Customer Management', ipAddress: '117.211.14.92' },
      { user: apStateAdmin._id, action: 'SERVICE_REMINDER', details: 'Acknowledged service due alert for Preet 987 Combine Harvester (PR-987CH-2025-000005)', category: 'Fleet Management', ipAddress: '14.99.124.50' }
    ];

    await ActivityLog.insertMany(activityLogs);
    console.log(`✅ Seeded ${activityLogs.length} Admin Activity Logs.`);

    console.log('----------------------------------------------------');
    console.log('🎉 AgriTrack AI Pvt. Ltd. Permission Matrix & Admin Hierarchy Initialized.');
    console.log('----------------------------------------------------');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding Enterprise Admin hierarchy:', error);
    process.exit(1);
  }
}

seedEnterpriseAdminHierarchy();
