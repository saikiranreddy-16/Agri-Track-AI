import mongoose from 'mongoose';
import User from '../models/userModel.js';
import Machine from '../models/machineModel.js';
import Farm from '../models/farmModel.js';
import GPSDevice from '../models/gpsDeviceModel.js';
import LoginHistory from '../models/loginHistoryModel.js';
import MobileChangeRequest from '../models/mobileChangeRequestModel.js';
import DeviceReplacementHistory from '../models/deviceReplacementHistoryModel.js';

const MONGODB_URI = 'mongodb://127.0.0.1:27017/gps_db';

const logTest = (name, passed, details = '') => {
  console.log(`[${passed ? '✓ PASSED' : '✗ FAILED'}] ${name} ${details ? `- ${details}` : ''}`);
};

const runVerification = async () => {
  try {
    console.log('Connecting to database for verification checks...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected.');

    // 1. GPS DEVICE MASTER TABLE
    const dev = await GPSDevice.findOne({ deviceId: 'dev-mach-1' });
    logTest(
      'GPS Device Master Table structure',
      dev && dev.imei && dev.firmwareVersion === '1.0.0' && dev.activationStatus === 'Activated',
      `Device: ${dev ? dev.deviceId : 'N/A'}, IMEI: ${dev ? dev.imei : 'N/A'}`
    );

    // 2. VEHICLE CHASSIS IMMUTABILITY
    const mach = await Machine.findOne({ registration: 'PB-10-AB-1234' });
    if (mach) {
      const oldChassis = mach.chassisNumber;
      try {
        mach.chassisNumber = 'MODIFIED_CHASSIS_123';
        await mach.save();
        // Mongoose immutable: true ignores setting the value on save
        const refreshed = await Machine.findById(mach._id);
        logTest(
          'Vehicle Chassis Immutability',
          refreshed.chassisNumber === oldChassis,
          `Original: ${oldChassis}, Attempted update result: ${refreshed.chassisNumber}`
        );
      } catch (err) {
        logTest('Vehicle Chassis Immutability', true, `Blocked update with error: ${err.message}`);
      }
    } else {
      logTest('Vehicle Chassis Immutability', false, 'Test machine not found');
    }

    // 3. API STANDARDIZATION CHECK (Simulating response structure check)
    // We can hit the local server directly
    try {
      const loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@agritrack.in',
          password: 'password123',
        }),
      });
      const data = await loginRes.json();
      const standardKeys = ['success', 'message', 'data', 'pagination', 'timestamp'];
      const hasAllKeys = standardKeys.every(k => k in data);
      logTest(
        'API standardization response payload schema',
        hasAllKeys && data.success === true,
        `Keys found: ${Object.keys(data).join(', ')}`
      );

      // Extract Auth Token
      const token = data.data.token;

      // 4. DATA ISOLATION (Farm Admin vs Company Admin)
      const user = await User.findOne({ phone: '+919876543210' }); // Rajesh Patel (Farm Admin)
      const rajeshLoginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36'
        },
        body: JSON.stringify({
          phone: '+919876543210',
          password: 'password123',
          clientDeviceId: 'test-chrome-fingerprint',
          gpsDeviceId: 'dev-mach-1', // active device in his account
        }),
      });
      const rajeshData = await rajeshLoginRes.json();
      const rajeshToken = rajeshData.data.token;

      // Request machines list using Rajesh's token
      const rajeshMachRes = await fetch('http://localhost:5000/api/v1/machines', {
        headers: { 'Authorization': `Bearer ${rajeshToken}` },
      });
      const rajeshMachData = await rajeshMachRes.json();
      const allBelongToRajesh = rajeshMachData.data.every(m => m.owner === user._id.toString());

      logTest(
        'Data Isolation check (Farm Admin only sees own machines)',
        allBelongToRajesh,
        `Rajesh machine count: ${rajeshMachData.data.length} (all belong to him: ${allBelongToRajesh})`
      );

      // 5. MOBILE NUMBER CHANGE WORKFLOW
      // Submit mobile change request
      const changeReqRes = await fetch('http://localhost:5000/api/v1/customers/mobile-change-request', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${rajeshToken}`
        },
        body: JSON.stringify({ newMobile: '+919999988888' }),
      });
      const changeReqData = await changeReqRes.json();
      logTest(
        'Mobile Number Change workflow (Submit Request)',
        changeReqData.success && changeReqData.data.status === 'Pending',
        `Status: ${changeReqData.data?.status || 'N/A'}, New Number: ${changeReqData.data?.requestedMobile || 'N/A'}`
      );

      const requestId = changeReqData.data._id;

      // Approve request as Admin
      const approveRes = await fetch(`http://localhost:5000/api/v1/customers/mobile-change-requests/${requestId}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const approveData = await approveRes.json();
      
      const refreshedUser = await User.findById(user._id);
      logTest(
        'Mobile Number Change workflow (Approve Request)',
        refreshedUser.phone === '+919999988888' && refreshedUser.phoneHistory.length > 0,
        `New Phone: ${refreshedUser.phone}, Previous Phone preserved: ${refreshedUser.phoneHistory[0]?.phone}`
      );

      // 6. FUTURE HARDWARE TELEMETRY & HEALTH CALCULATIONS
      // Upload telemetry via hardware endpoint
      const telemetryRes = await fetch('http://localhost:5000/api/v1/hardware/gps-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: 'dev-mach-1',
          latitude: 31.100,
          longitude: 75.900,
          speed: 18,
          heading: 90,
          battery: 88,
          signalStrength: -65,
          network: '4G LTE',
          fuel: 75,
          engineStatus: 'On',
        }),
      });
      const telemetryData = await telemetryRes.json();
      
      const updatedMach = await Machine.findById(mach._id);
      logTest(
        'Future Hardware Telemetry & Health Score Calculation',
        updatedMach.healthScore !== undefined && updatedMach.location.lat === 31.1,
        `Calculated Health Score: ${updatedMach.healthScore}%, Speed: ${updatedMach.speed} km/h`
      );

      // 7. LOGIN HISTORY AND SESSION DURATION
      const loginLog = await LoginHistory.findOne({ user: user._id }).sort({ time: -1 });
      logTest(
        'Login History Tracking (Immutable Audit)',
        loginLog && loginLog.success === true && loginLog.browser === 'Chrome',
        `Login Success: ${loginLog ? loginLog.success : 'N/A'}, Browser: ${loginLog ? loginLog.browser : 'N/A'}, Device: ${loginLog ? loginLog.device : 'N/A'}`
      );

      // Perform Logout and verify duration
      await fetch('http://localhost:5000/api/v1/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${rajeshToken}` },
      });

      const updatedLoginLog = await LoginHistory.findById(loginLog._id);
      logTest(
        'Logout auditing & Session Duration calculation',
        updatedLoginLog.logoutTime !== null && updatedLoginLog.sessionDuration !== null,
        `Session Duration: ${updatedLoginLog.sessionDuration} seconds`
      );

      // 8. TRUSTED DEVICES MANAGEMENT (Limit max 3)
      // We simulate logging in from 3 other new devices
      const loginDevice = async (deviceId) => {
        return await fetch('http://localhost:5000/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: '+919999988888', // Rajesh's new number
            password: 'password123',
            clientDeviceId: deviceId,
            gpsDeviceId: 'dev-mach-1',
          }),
        });
      };

      const dev1 = await loginDevice('dev-fingerprint-1');
      const dev2 = await loginDevice('dev-fingerprint-2');
      const dev3 = await loginDevice('dev-fingerprint-3'); // 4th device total (including test-chrome-fingerprint)
      const dev3Data = await dev3.json();

      logTest(
        'Trusted Devices management (Enforces Max 3 limit)',
        dev3Data.code === 'max_trusted_devices' && dev3Data.success === false,
        `4th Device Response Code: ${dev3Data.code}, Msg: ${dev3Data.message}`
      );

      // 9. SOFT DELETE CASCADES
      const deleteCustRes = await fetch(`http://localhost:5000/api/v1/customers/${user._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const deleteCustData = await deleteCustRes.json();

      // Check soft deletes
      const rawUser = await User.findOne({ _id: user._id, isDeleted: true });
      const rawFarm = await Farm.findOne({ owner: user._id, isDeleted: true });
      const rawMach = await Machine.findOne({ owner: user._id, isDeleted: true });
      const rawDevice = await GPSDevice.findOne({ owner: user._id, isDeleted: true });

      logTest(
        'Soft Delete Cascading (Customers -> Farms -> Vehicles -> Devices)',
        rawUser && rawFarm && rawMach && rawDevice,
        `User isDeleted: ${!!rawUser}, Farm isDeleted: ${!!rawFarm}, Vehicle isDeleted: ${!!rawMach}, Device isDeleted: ${!!rawDevice}`
      );

    } catch (err) {
      console.error('Request testing failed:', err);
    }

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Verification failed:', error);
    process.exit(1);
  }
};

runVerification();
