import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaQrcode, FaTractor, FaUser, FaMobileAlt, FaWarehouse, FaShieldAlt, 
  FaCheckCircle, FaExclamationTriangle, FaCamera, FaTimes 
} from 'react-icons/fa';
import api from '../utils/api';

export const DeviceActivation = () => {
  // Form states
  const [customerName, setCustomerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [farmName, setFarmName] = useState('');
  const [vehicleType, setVehicleType] = useState('Tractor');
  const [displayName, setDisplayName] = useState('');
  const [chassisNumber, setChassisNumber] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [subscriptionStatus, setSubscriptionStatus] = useState('Active');

  // Scanner simulator states
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scanMessage, setScanMessage] = useState('');

  // Response/Success States
  const [isLoading, setIsLoading] = useState(false);
  const [activationResult, setActivationResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSimulateScan = () => {
    setIsScannerOpen(true);
    setScanMessage('Initializing camera stream...');
    
    // Simulate detecting a code after 1.5 seconds
    setTimeout(() => {
      setScanMessage('Verifying QR Code data matrix...');
      setTimeout(() => {
        const mockScannedId = 'dev-' + Math.floor(100000 + Math.random() * 900000);
        setDeviceId(mockScannedId);
        setIsScannerOpen(false);
      }, 1000);
    }, 1500);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setActivationResult(null);

    const payload = {
      customerName,
      mobileNumber,
      farmName,
      vehicleType,
      displayName,
      chassisNumber,
      deviceId,
      subscriptionStatus,
    };

    try {
      const response = await api.post('/devices/activate', payload);
      if (response.data && response.data.success) {
        setActivationResult(response.data.data);
        // Clear form fields
        setCustomerName('');
        setMobileNumber('');
        setFarmName('');
        setDisplayName('');
        setChassisNumber('');
        setDeviceId('');
      }
    } catch (error) {
      console.error('Device activation error:', error);
      setErrorMessage(error.response?.data?.message || 'Device activation failed. Validate Device ID and Chassis Number are unique.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
          GPS Hardware Device Onboarding
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Provision new GPS tracker units, link chassis numbers, create customer operations structures, and set subscriptions.
        </p>
      </div>

      {/* Success Notification */}
      {activationResult && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/40 rounded-2xl space-y-3"
        >
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 text-xs font-black uppercase tracking-wider">
            <FaCheckCircle className="text-sm shrink-0" />
            Device Activated & Provisioned Successfully
          </div>
          <p className="text-xs text-gray-650 dark:text-gray-300">
            GPS tracker ID <strong className="font-extrabold">{activationResult.gpsDevice.deviceId}</strong> is permanently linked to vehicle <strong className="font-extrabold">{activationResult.machine.name}</strong> (Chassis: {activationResult.machine.chassisNumber}).
          </p>
          
          {activationResult.user.isNewUser && (
            <div className="p-4 bg-white dark:bg-[#0c120f] border border-emerald-100 dark:border-emerald-950/40 rounded-xl space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Temporary Client Password (PIN)</span>
              <div className="font-mono text-lg font-bold text-gray-800 dark:text-white tracking-widest">
                {activationResult.user.generatedPin}
              </div>
              <p className="text-[10px] text-gray-450 italic">
                A new customer account was created for this mobile number. Provide the customer with this temporary 6-digit PIN. They will be forced to change it on their first login.
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Error alert */}
      {errorMessage && (
        <div className="p-4 bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/30 rounded-2xl text-xs text-red-800 dark:text-red-400 flex items-start gap-2">
          <FaExclamationTriangle className="mt-0.5 shrink-0" />
          <div>{errorMessage}</div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main form */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0e1712] border border-gray-150 dark:border-emerald-950/20 p-6 rounded-2xl shadow-sm">
          <form onSubmit={handleFormSubmit} className="space-y-6 text-xs">
            
            {/* Customer Details Block */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-emerald-650 dark:text-emerald-500 border-b border-gray-100 dark:border-emerald-950/20 pb-1.5">
                1. Customer Account Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-400 uppercase mb-1.5">Customer / Company Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                      <FaUser />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Agro Farms"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-emerald-950/30 rounded-xl focus:bg-white focus:outline-none dark:text-white bg-gray-50 dark:bg-[#121c17]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-gray-400 uppercase mb-1.5">Customer Mobile Number</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                      <FaMobileAlt />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="e.g. +919876543210"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-emerald-950/30 rounded-xl focus:bg-white focus:outline-none dark:text-white bg-gray-50 dark:bg-[#121c17]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Farm & Vehicle Details Block */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-emerald-650 dark:text-emerald-500 border-b border-gray-100 dark:border-emerald-950/20 pb-1.5">
                2. Fleet Operation & Vehicle Mapping
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-400 uppercase mb-1.5">Farm Block / Site Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                      <FaWarehouse />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ludhiana Sector 4 Block"
                      value={farmName}
                      onChange={(e) => setFarmName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-emerald-950/30 rounded-xl focus:bg-white focus:outline-none dark:text-white bg-gray-50 dark:bg-[#121c17]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-gray-400 uppercase mb-1.5">Vehicle Type</label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-emerald-950/30 rounded-xl focus:bg-white focus:outline-none dark:text-white bg-gray-50 dark:bg-[#121c17]"
                  >
                    <option value="Tractor">Tractor</option>
                    <option value="Harvester">Harvester</option>
                    <option value="Sprayer">Sprayer</option>
                    <option value="Seeder">Seeder</option>
                    <option value="Rotavator">Rotavator</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-400 uppercase mb-1.5">Vehicle Display Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                      <FaTractor />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Main Swaraj Tractor"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-emerald-950/30 rounded-xl focus:bg-white focus:outline-none dark:text-white bg-gray-50 dark:bg-[#121c17]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-gray-400 uppercase mb-1.5">Vehicle Chassis Number</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                      <FaShieldAlt />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CHASSIS-9820-A10"
                      value={chassisNumber}
                      onChange={(e) => setChassisNumber(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-emerald-950/30 rounded-xl focus:bg-white focus:outline-none dark:text-white bg-gray-50 dark:bg-[#121c17]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* GPS Tracker Block */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-emerald-650 dark:text-emerald-500 border-b border-gray-100 dark:border-emerald-950/20 pb-1.5">
                3. GPS Hardware Activation
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-400 uppercase mb-1.5">GPS Device ID</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Enter or scan Device ID"
                      value={deviceId}
                      onChange={(e) => setDeviceId(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-200 dark:border-emerald-950/30 rounded-xl focus:bg-white focus:outline-none dark:text-white bg-gray-50 dark:bg-[#121c17]"
                    />
                    <button
                      type="button"
                      onClick={handleSimulateScan}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center gap-1.5 font-bold transition-all shadow-sm cursor-pointer"
                    >
                      <FaQrcode />
                      Scan QR
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-gray-400 uppercase mb-1.5">Subscription Status</label>
                  <select
                    value={subscriptionStatus}
                    onChange={(e) => setSubscriptionStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-emerald-950/30 rounded-xl focus:bg-white focus:outline-none dark:text-white bg-gray-50 dark:bg-[#121c17]"
                  >
                    <option value="Active">Active Subscription</option>
                    <option value="Inactive">Inactive Onboarding</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2 border-t border-gray-100 dark:border-emerald-950/20 flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-75 cursor-pointer flex items-center gap-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Activate GPS Telemetry System'
                )}
              </button>
            </div>

          </form>
        </div>

        {/* Informative Side Card */}
        <div className="p-6 bg-[#0c120f]/5 border border-emerald-950/10 dark:border-emerald-900/20 rounded-2xl space-y-4 h-fit">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
            <FaShieldAlt /> Device Verification Specs
          </h4>
          <p className="text-xs text-gray-500 leading-relaxed">
            Every commercial GPS device shipped from inventory has a unique hardware identity encoded in a <strong>QR Code Label</strong>. Scanning or entering this ID links the physical hardware permanently to the specific machine chassis identity.
          </p>
          <div className="text-[10px] space-y-2 pt-2 border-t border-emerald-950/10">
            <div className="font-extrabold text-gray-700 dark:text-gray-300">✓ Unique Mapping Verification</div>
            <p className="text-gray-400">The platform automatically validates that the Device ID and Chassis Number do not overlap with active registrations in MongoDB.</p>
          </div>
        </div>

      </div>

      {/* Simulated Scanner Modal Overlay */}
      <AnimatePresence>
        {isScannerOpen && (
          <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0c120f] p-6 rounded-2xl w-full max-w-sm border border-gray-250 dark:border-emerald-900/30 text-center relative overflow-hidden space-y-4"
            >
              <button 
                onClick={() => setIsScannerOpen(false)}
                className="absolute top-4 right-4 text-gray-450 hover:text-gray-600 dark:text-gray-400 cursor-pointer"
              >
                <FaTimes />
              </button>
              
              <FaCamera className="text-4xl text-emerald-500 mx-auto animate-pulse" />
              
              <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">QR Scanner Integration</h3>
              
              {/* Simulated camera view */}
              <div className="w-full aspect-video bg-black rounded-xl border border-gray-200 dark:border-emerald-900/35 relative flex items-center justify-center overflow-hidden">
                <div className="absolute inset-4 border-2 border-dashed border-emerald-500/50 rounded-lg animate-pulse" />
                <div className="w-1 h-full bg-emerald-500 absolute top-0 left-1/2 -translate-x-1/2 opacity-30 shadow-md animate-ping" />
                <span className="text-[10px] text-gray-500 font-bold z-10">{scanMessage}</span>
              </div>
              
              <p className="text-[10px] text-gray-450">
                Simulating camera-based QR code parser. The scanned hardware address will be written back to the form input fields.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default DeviceActivation;
