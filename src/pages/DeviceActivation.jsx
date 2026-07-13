import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaQrcode, FaTractor, FaUser, FaMobileAlt, FaShieldAlt, 
  FaCheckCircle, FaExclamationTriangle, FaCamera, FaTimes, FaUndo 
} from 'react-icons/fa';
import { useToast } from '../context/ToastContext';

export const DeviceActivation = () => {
  const toast = useToast();

  // Form states
  const [deviceId, setDeviceId] = useState('');
  const [chassisNumber, setChassisNumber] = useState('');
  const [vehicleName, setVehicleName] = useState('');
  const [vehicleType, setVehicleType] = useState('Tractor');
  const [customerName, setCustomerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [farmName, setFarmName] = useState('');

  // Simulator states
  const [isVerifying, setIsVerifying] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scanMessage, setScanMessage] = useState('');

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
        toast.success(`QR Code scanned: Scanned ID ${mockScannedId}`);
      }, 1000);
    }, 1200);
  };

  const handleVerifyDevice = () => {
    if (!deviceId.trim()) {
      toast.error('Please enter a GPS Device ID to verify.');
      return;
    }
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);
      toast.success(`GPS Device ${deviceId} verified successfully in registry database.`);
    }, 1000);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!isVerified) {
      toast.warning('Please verify the Device ID before activation.');
      return;
    }
    if (!chassisNumber.trim() || !vehicleName.trim() || !customerName.trim() || !mobileNumber.trim()) {
      toast.error('All form fields are required for GPS onboarding.');
      return;
    }

    setIsActivating(true);
    setTimeout(() => {
      setIsActivating(false);
      toast.success(`Device ${deviceId} has been successfully activated and linked to chassis ${chassisNumber}!`);
      // Reset form
      handleReset();
    }, 1500);
  };

  const handleReset = () => {
    setDeviceId('');
    setChassisNumber('');
    setVehicleName('');
    setVehicleType('Tractor');
    setCustomerName('');
    setMobileNumber('');
    setFarmName('');
    setIsVerified(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
          Device Onboarding & Activation
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Activate GPS tracker units, link chassis numbers, configure customer operations, and verify hardware keys.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Onboarding Form */}
        <div className="lg:col-span-2 p-6 bg-white dark:bg-[#0e1712] border border-gray-150 dark:border-emerald-950/20 rounded-3xl shadow-sm space-y-6 text-xs">
          
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-white border-b border-gray-100 dark:border-emerald-950/15 pb-2">
            GPS Device Details
          </h2>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            
            {/* Device ID Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Device ID</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="e.g. dev-mach-1"
                    value={deviceId}
                    onChange={(e) => {
                      setDeviceId(e.target.value);
                      setIsVerified(false);
                    }}
                    className={`flex-1 p-2.5 rounded-xl border bg-gray-50 dark:bg-emerald-955/5 focus:bg-white focus:outline-none dark:text-white transition-all ${
                      isVerified 
                        ? 'border-emerald-500 bg-emerald-500/5 focus:border-emerald-500' 
                        : 'border-gray-200 dark:border-emerald-950/30 focus:border-emerald-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleSimulateScan}
                    className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-xl hover:bg-emerald-100/50 cursor-pointer"
                    title="Scan QR Code"
                  >
                    <FaQrcode className="text-sm" />
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  disabled={isVerifying || isVerified || !deviceId}
                  onClick={handleVerifyDevice}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-100 dark:disabled:bg-emerald-950/10 dark:disabled:text-emerald-800 text-white rounded-xl font-bold shadow-md cursor-pointer disabled:cursor-not-allowed transition-all"
                >
                  {isVerifying ? (
                    <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  ) : isVerified ? (
                    <span className="flex items-center justify-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                      <FaCheckCircle /> Verified
                    </span>
                  ) : (
                    'Verify Device ID'
                  )}
                </button>
              </div>
            </div>

            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-white border-b border-gray-100 dark:border-emerald-950/15 pb-2 pt-4">
              Vehicle & Customer Linkage
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Chassis Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CHASSIS-9831-XY"
                  value={chassisNumber}
                  onChange={(e) => setChassisNumber(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-950/30 bg-gray-50 dark:bg-emerald-955/5 focus:bg-white focus:outline-none dark:text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Vehicle Display Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Swaraj 963 FE #04"
                  value={vehicleName}
                  onChange={(e) => setVehicleName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-950/30 bg-gray-50 dark:bg-emerald-955/5 focus:bg-white focus:outline-none dark:text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Vehicle Type</label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-950/30 bg-gray-50 dark:bg-emerald-955/5 focus:bg-white focus:outline-none dark:text-white font-bold"
                >
                  <option value="Tractor">Tractor</option>
                  <option value="Harvester">Harvester</option>
                  <option value="Sprayer">Sprayer</option>
                  <option value="Seeder">Seeder</option>
                  <option value="Truck">Logistics Truck</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Customer / Subscribed Client</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Singh Agrotech Group"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-950/30 bg-gray-50 dark:bg-emerald-955/5 focus:bg-white focus:outline-none dark:text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Client Mobile Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +91 98765 43210"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-950/30 bg-gray-50 dark:bg-emerald-955/5 focus:bg-white focus:outline-none dark:text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Farm Block / Sector</label>
                <input
                  type="text"
                  placeholder="e.g. Central Punjab Wheat Block A"
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-950/30 bg-gray-50 dark:bg-emerald-955/5 focus:bg-white focus:outline-none dark:text-white"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 font-bold">
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-emerald-950/20 dark:text-emerald-350 rounded-xl cursor-pointer"
              >
                <FaUndo className="text-[10px]" /> Reset Form
              </button>
              <button
                type="submit"
                disabled={isActivating || !isVerified}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isActivating ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                ) : (
                  'Activate GPS Device'
                )}
              </button>
            </div>

          </form>

        </div>

        {/* Right Side: Operations Guidance */}
        <div className="space-y-6">
          <div className="p-5 bg-white dark:bg-[#0e1712] border border-gray-150 dark:border-emerald-950/20 rounded-3xl shadow-sm text-xs space-y-4">
            <h3 className="text-xs font-bold text-gray-450 uppercase tracking-wider flex items-center gap-1.5">
              <FaShieldAlt className="text-emerald-500" />
              Onboarding Guidelines
            </h3>
            <div className="space-y-3 text-gray-650 dark:text-gray-300 leading-relaxed">
              <p>
                1. <strong>Hardware Inspection:</strong> Check that the telemetry tracker's power light is solid green before checking registry.
              </p>
              <p>
                2. <strong>Verification step:</strong> Check registry records using the Device ID to confirm it is not linked to active accounts.
              </p>
              <p>
                3. <strong>Client Onboarding:</strong> On successful activation, the Farm Admin gets a dynamic invitation login PIN code via their registered mobile.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* QR scanner Simulator Modal Overlay */}
      <AnimatePresence>
        {isScannerOpen && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#0c120f] p-6 rounded-3xl max-w-sm w-full space-y-4 border border-gray-250 dark:border-emerald-900/30 text-center"
            >
              <div className="flex justify-between items-center border-b border-gray-100 dark:border-emerald-950/15 pb-2">
                <span className="text-xs font-black dark:text-white uppercase tracking-wider">QR Code Hardware Scan</span>
                <button onClick={() => setIsScannerOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer">
                  <FaTimes />
                </button>
              </div>

              <div className="relative aspect-square max-w-[240px] mx-auto bg-gray-950 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-emerald-500">
                <FaCamera className="text-4xl text-emerald-500/40 animate-pulse" />
                {/* Scanning green line */}
                <div className="absolute left-0 right-0 h-0.5 bg-emerald-500 shadow-emerald-500 shadow-md animate-bounce top-0" style={{ animationDuration: '3s' }} />
              </div>

              <p className="text-xs font-bold text-gray-500 dark:text-emerald-400">{scanMessage}</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default DeviceActivation;
