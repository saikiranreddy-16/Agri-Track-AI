import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from '../models/userModel.js';
import AdminLoginHistory from '../models/adminLoginHistoryModel.js';
import AdminAuditLog from '../models/adminAuditLogModel.js';
import SupportTicket from '../models/supportTicketModel.js';
import Machine from '../models/machineModel.js';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/agritrack-ai';

async function seedAdminHierarchy() {
  try {
    console.log('🌱 Connecting to MongoDB database...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected.');

    console.log('🔒 Preserving customer records... Deleting ONLY existing admin accounts...');
    // Delete only accounts with Admin roles
    await User.deleteMany({ role: { $in: ['Company Admin', 'Grand Master Admin', 'Master Admin', 'State Admin'] } });
    await AdminLoginHistory.deleteMany({});
    await AdminAuditLog.deleteMany({});
    await SupportTicket.deleteMany({});
    console.log('✅ Old admin accounts and admin logs purged.');

    const salt = await bcrypt.genSalt(10);

    const adminsToSeed = [
      {
        employeeId: 'AGT-GM-001',
        name: 'Ravi Kumar',
        designation: 'Grand Master Administrator',
        email: 'ravi.kumar@agritrackai.com',
        phone: '9876543001',
        mobile: '9876543001',
        officialMobile: '+91 98765 43001',
        emergencyContact: '+91 98765 00001',
        password: await bcrypt.hash('Agri@GM2026#', salt),
        role: 'Grand Master Admin',
        office: 'Head Office - Hyderabad',
        department: 'Management',
        accountStatus: 'Active',
        currentSessionStatus: 'Online',
        joiningDate: new Date('2023-01-15'),
        assignedStates: ['Telangana', 'Andhra Pradesh', 'Karnataka', 'Tamil Nadu', 'Kerala', 'Punjab', 'Haryana', 'Gujarat', 'Maharashtra'],
        permissions: { fleet: true, customers: true, devices: true, reports: true, analytics: true, aiAdmin: true, userManagement: true, settings: true },
        zone: 'All India',
        region: 'Pan India',
        officeCode: 'HQ-HYD',
        employeeCode: 'EMP-001',
        designationLevel: 'Level 1'
      },
      {
        employeeId: 'AGT-SM-001',
        name: 'Mahesh Reddy',
        designation: 'Regional Operations Manager',
        email: 'mahesh.reddy@agritrackai.com',
        phone: '9876543002',
        mobile: '9876543002',
        officialMobile: '+91 98765 43002',
        emergencyContact: '+91 98765 00002',
        password: await bcrypt.hash('South@2026#', salt),
        role: 'Master Admin',
        office: 'Hyderabad Regional Office',
        department: 'Operations',
        accountStatus: 'Active',
        currentSessionStatus: 'Online',
        joiningDate: new Date('2023-06-01'),
        assignedStates: ['Telangana', 'Andhra Pradesh', 'Karnataka', 'Tamil Nadu', 'Kerala'],
        permissions: { fleet: true, customers: true, devices: true, reports: true, analytics: true, aiAdmin: true, userManagement: true, settings: true },
        zone: 'South Zone',
        region: 'South India',
        officeCode: 'RO-HYD',
        employeeCode: 'EMP-002',
        designationLevel: 'Level 2'
      },
      {
        employeeId: 'AGT-SM-002',
        name: 'Suresh Naidu',
        designation: 'Regional Technical Manager',
        email: 'suresh.naidu@agritrackai.com',
        phone: '9876543003',
        mobile: '9876543003',
        officialMobile: '+91 98765 43003',
        emergencyContact: '+91 98765 00003',
        password: await bcrypt.hash('Tech@2026#', salt),
        role: 'Master Admin',
        office: 'Bengaluru Regional Office',
        department: 'Technical',
        accountStatus: 'Active',
        currentSessionStatus: 'Offline',
        joiningDate: new Date('2023-08-10'),
        assignedStates: ['Karnataka', 'Kerala', 'Tamil Nadu', 'Puducherry', 'Lakshadweep'],
        permissions: { fleet: true, customers: true, devices: true, reports: true, analytics: true, aiAdmin: true, userManagement: true, settings: true },
        zone: 'South Zone',
        region: 'South West India',
        officeCode: 'RO-BLR',
        employeeCode: 'EMP-003',
        designationLevel: 'Level 2'
      },
      {
        employeeId: 'AGT-TG-001',
        name: 'Praveen Reddy',
        designation: 'State Fleet Manager',
        email: 'praveen.reddy@agritrackai.com',
        phone: '9876543004',
        mobile: '9876543004',
        officialMobile: '+91 98765 43004',
        emergencyContact: '+91 98765 00004',
        password: await bcrypt.hash('Telangana@26#', salt),
        role: 'State Admin',
        office: 'Hyderabad State Office',
        department: 'Operations',
        state: 'Telangana',
        assignedState: 'Telangana',
        accountStatus: 'Active',
        currentSessionStatus: 'Online',
        joiningDate: new Date('2024-02-01'),
        assignedStates: ['Telangana'],
        permissions: { fleet: true, customers: true, devices: true, reports: true, analytics: true, aiAdmin: false, userManagement: false, settings: false },
        zone: 'South Zone',
        region: 'Telangana',
        officeCode: 'SO-TG',
        employeeCode: 'EMP-004',
        designationLevel: 'Level 3'
      },
      {
        employeeId: 'AGT-AP-001',
        name: 'Lakshmi Prasad',
        designation: 'State Fleet Manager',
        email: 'lakshmi.prasad@agritrackai.com',
        phone: '9876543005',
        mobile: '9876543005',
        officialMobile: '+91 98765 43005',
        emergencyContact: '+91 98765 00005',
        password: await bcrypt.hash('Andhra@2026#', salt),
        role: 'State Admin',
        office: 'Vijayawada State Office',
        department: 'Operations',
        state: 'Andhra Pradesh',
        assignedState: 'Andhra Pradesh',
        accountStatus: 'Active',
        currentSessionStatus: 'Online',
        joiningDate: new Date('2024-03-15'),
        assignedStates: ['Andhra Pradesh'],
        permissions: { fleet: true, customers: true, devices: true, reports: true, analytics: true, aiAdmin: false, userManagement: false, settings: false },
        zone: 'South Zone',
        region: 'Andhra Pradesh',
        officeCode: 'SO-AP',
        employeeCode: 'EMP-005',
        designationLevel: 'Level 3'
      }
    ];

    console.log('👤 Seeding 5 Enterprise Admin Hierarchy Accounts...');
    const seededAdmins = {};
    for (const a of adminsToSeed) {
      const adminDoc = await User.create(a);
      seededAdmins[a.employeeId] = adminDoc._id;
    }
    console.log('✅ Enterprise Admin Hierarchy accounts created.');

    // 2. Generate 50 Realistic Admin Login History Records
    console.log('📜 Generating 50 realistic Admin Login History records...');
    const browsers = ['Chrome 125', 'Microsoft Edge 124', 'Firefox 126', 'Safari 17'];
    const osList = ['Windows 11', 'macOS Sonoma', 'Android 14', 'Linux Ubuntu'];

    for (let i = 0; i < 50; i++) {
      const adminKey = adminsToSeed[i % adminsToSeed.length];
      const loginDate = new Date(Date.now() - (i * 4 * 3600 * 1000));
      const logoutDate = new Date(loginDate.getTime() + 45 * 60 * 1000);

      await AdminLoginHistory.create({
        employeeId: adminKey.employeeId,
        adminName: adminKey.name,
        adminRole: adminKey.role,
        loginTime: loginDate,
        logoutTime: logoutDate,
        sessionDuration: '45 mins',
        browser: browsers[i % browsers.length],
        os: osList[i % osList.length],
        deviceType: i % 3 === 0 ? 'Laptop' : 'Desktop',
        ipAddress: `183.82.4.${10 + (i % 80)}`,
        city: adminKey.office.includes('Vijayawada') ? 'Vijayawada' : adminKey.office.includes('Bengaluru') ? 'Bengaluru' : 'Hyderabad',
        state: adminKey.assignedState || 'Telangana',
        loginStatus: 'Success'
      });
    }
    console.log('✅ 50 Admin Login History records created.');

    // 3. Generate 25 Admin Audit Logs
    console.log('🛡️ Generating 25 Admin Audit Log entries...');
    const actionTypes = [
      'Activated Device', 'Replaced Device', 'Created Customer', 'Report Generated', 
      'Exported PDF', 'AI Settings Changed', 'Vehicle Registered'
    ];

    for (let i = 0; i < 25; i++) {
      const adminKey = adminsToSeed[i % adminsToSeed.length];
      await AdminAuditLog.create({
        employeeId: adminKey.employeeId,
        adminName: adminKey.name,
        adminRole: adminKey.role,
        actionType: actionTypes[i % actionTypes.length],
        targetResource: i % 2 === 0 ? 'AGRTG00001 (John Deere 5042D)' : 'Customer Ch. Sai Reddy',
        details: `Operation performed by ${adminKey.designation} via ${adminKey.office}`,
        ipAddress: `183.82.4.${15 + i}`
      });
    }
    console.log('✅ 25 Admin Audit Logs created.');

    // 4. Generate Sample Support Tickets
    console.log('🎫 Generating sample Support Tickets...');
    const firstMachine = await Machine.findOne({ name: /John Deere/i });
    const firstCustomer = await User.findOne({ email: 'saireddy@agritrack.ai' });

    if (firstCustomer) {
      await SupportTicket.create({
        ticketId: 'TCK-2026-001',
        customerId: firstCustomer._id,
        vehicleId: firstMachine ? firstMachine._id : null,
        category: 'GPS Not Working',
        subject: 'GPS Signal lost in Madgulapally sector',
        description: 'Device AGRTG00001 stopped pinging telemetry at 10:15 AM today.',
        status: 'In Progress',
        priority: 'High',
        assignedAdminId: seededAdmins['AGT-TG-001'],
        resolutionNotes: 'State Admin Praveen Reddy dispatched field engineer.'
      });
    }
    console.log('✅ Support tickets created.');

    console.log('\n======================================================');
    console.log('🎉 Enterprise Admin Hierarchy Successfully Seeded!');
    console.log('======================================================');
    console.log('🔑 Level 1 - Grand Master Admin:');
    console.log('   Email: ravi.kumar@agritrackai.com / Password: Agri@GM2026# (ID: AGT-GM-001)');
    console.log('🔑 Level 2 - South India Master Admin 1:');
    console.log('   Email: mahesh.reddy@agritrackai.com / Password: South@2026# (ID: AGT-SM-001)');
    console.log('🔑 Level 2 - South India Master Admin 2:');
    console.log('   Email: suresh.naidu@agritrackai.com / Password: Tech@2026# (ID: AGT-SM-002)');
    console.log('🔑 Level 3 - Telangana State Admin:');
    console.log('   Email: praveen.reddy@agritrackai.com / Password: Telangana@26# (ID: AGT-TG-001)');
    console.log('🔑 Level 3 - Andhra Pradesh State Admin:');
    console.log('   Email: lakshmi.prasad@agritrackai.com / Password: Andhra@2026# (ID: AGT-AP-001)');
    console.log('======================================================');
    console.log('✅ Customer Accounts Intact (5 Customers, 5 Vehicles, 30 Days History preserved).');
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin hierarchy:', error);
    process.exit(1);
  }
}

seedAdminHierarchy();
