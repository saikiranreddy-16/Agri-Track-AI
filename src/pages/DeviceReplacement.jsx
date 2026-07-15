import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaQrcode, FaTractor, FaTools, FaCheckCircle, FaExclamationTriangle, 
  FaCamera, FaTimes, FaUndo, FaExchangeAlt, FaHistory 
} from 'react-icons/fa';
import { mockMachines } from '../data/mockData';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';

export const DeviceReplacement = () => {
  const toast = useToast();

  const [machines, setMachines] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [oldDeviceId, setOldDeviceId] = useState('');
  const [newDeviceId, setNewDeviceId] = useState('');
  const [replacementReason, setReplacementReason] = useState('Hardware Failure');
  const [customReason, setCustomReason] = useState('');

  // Simulator states
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isReplacing, setIsReplacing] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scanMessage, setScanMessage] = useState('');
  
  // Custom Confirmation Modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Initialize selected vehicle and old device ID on mount from live API
  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const response = await api.get('/machines');
        if (response.data && response.data.success) {
          const machinesList = response.data.data;
          setMachines(machinesList);
          if (machinesList.length > 0) {
            const defaultMach = machinesList[0];
            setSelectedVehicleId(defaultMach._id);
            const devId = defaultMach.gpsDeviceId 
              ? (defaultMach.gpsDeviceId.deviceId || defaultMach.gpsDeviceId) 
              : `dev-mach-${defaultMach._id.replace('mach-', '')}`;
            setOldDeviceId(devId);
          }
        }
      } catch (err) {
        console.error('Failed to load live fleet vehicles, falling back to mock:', err);
        // Fallback for visual safety in dev environment
        setMachines(mockMachines.map(m => ({ ...m, _id: m.id })));
        if (mockMachines.length > 0) {
          const defaultMach = mockMachines[0];
          setSelectedVehicleId(defaultMach.id);
          setOldDeviceId(defaultMach.gpsDeviceId || `dev-mach-${defaultMach.id.replace('mach-', '')}`);
        }
      }
    };

    fetchMachines();
  }, []);

  const handleVehicleChange = (vehicleId) => {
    setSelectedVehicleId(vehicleId);
    const mach = machines.find(m => (m._id || m.id) === vehicleId);
    if (mach) {
      const devId = mach.gpsDeviceId 
        ? (mach.gpsDeviceId.deviceId || mach.gpsDeviceId) 
        : `dev-mach-${(mach._id || mach.id).replace('mach-', '')}`;
      setOldDeviceId(devId);
    } else {
      setOldDeviceId('');
    }
    setIsVerified(false);
  };

  const handleSimulateScan = () => {
    setIsScannerOpen(true);
    setScanMessage('Initializing camera stream...');
    setTimeout(() => {
      setScanMessage('Verifying QR Code data matrix...');
      setTimeout(() => {
        const mockScannedId = 'dev-' + Math.floor(100000 + Math.random() * 900000);
        setNewDeviceId(mockScannedId);
        setIsScannerOpen(false);
        setIsVerified(false);
        toast.success(`QR Code scanned: Scanned ID ${mockScannedId}`);
      }, 1000);
    }, 1200);
  };

  const handleVerifyNewDevice = () => {
    if (!newDeviceId.trim()) {
      toast.error('Please enter a new Device ID to verify.');
      return;
    }
    if (newDeviceId.trim() === oldDeviceId) {
      toast.error('New Device ID must be different from the Old Device ID.');
      return;
    }
    setIsVerifying(true);
    // Mimic checking device registration status
    setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);
      toast.success(`New GPS Device ${newDeviceId} is verified as inactive and ready for linkage.`);
    }, 1000);
  };

  const handleReplaceSubmit = (e) => {
    e.preventDefault();
    if (!isVerified) {
      toast.warning('Please verify the new Device ID before proceeding.');
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmReplacement = async () => {
    setShowConfirmModal(false);
    setIsReplacing(true);

    try {
      const response = await api.post('/devices/replace', {
        vehicleId: selectedVehicleId,
        newDeviceId: newDeviceId,
        reason: replacementReason === 'Other' ? customReason : replacementReason
      });

      if (response.data && response.data.success) {
        const vehicle = machines.find(m => (m._id || m.id) === selectedVehicleId);
        toast.success(`GPS Device successfully replaced on vehicle ${vehicle?.name || 'fleet vehicle'}!`);
        
        // Refresh machine list from live backend
        const refreshResponse = await api.get('/machines');
        if (refreshResponse.data && refreshResponse.data.success) {
          setMachines(refreshResponse.data.data);
        }
      } else {
        toast.error(response.data.message || 'GPS Device replacement failed.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to replace GPS device.');
    } finally {
      setIsReplacing(false);
      setNewDeviceId('');
      setCustomReason('');
      setIsVerified(false);
    }
  };

  const currentSelectedMachine = machines.find(m => (m._id || m.id) === selectedVehicleId);

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
          GPS Hardware Device Replacement
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Swap old or faulty tracking units on existing vehicles while preserving data tracking logs.
        </p>
      </div>

      {/* Warning Banner */}
      <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-250 dark:border-amber-900/40 rounded-2xl flex items-start gap-3 text-xs text-amber-800 dark:text-amber-400 animate-fade-in">
        <FaExclamationTriangle className="text-base shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block text-amber-900 dark:text-amber-300 mb-0.5">Critical Telemetry Warning</span>
          Replacing a GPS device will not delete vehicle history. All historical paths, fuel charts, and area statistics remain mapped under this vehicle profile.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Replacement Form */}
        <div className="lg:col-span-2 p-6 bg-white dark:bg-[#0e1712] border border-gray-155 dark:border-emerald-950/20 rounded-3xl shadow-sm text-xs space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-white border-b border-gray-100 dark:border-emerald-950/15 pb-2 flex items-center gap-1.5">
            <FaExchangeAlt />
            Swap Hardware Units
          </h2>

          <form onSubmit={handleReplaceSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Existing Vehicle Select */}
              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Connected Fleet Vehicle</label>
                <select
                  value={selectedVehicleId}
                  onChange={(e) => handleVehicleChange(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-950/30 bg-gray-50 dark:bg-emerald-955/5 focus:bg-white focus:outline-none dark:text-white font-bold"
                >
                  {machines.map((m) => (
                    <option key={m._id || m.id} value={m._id || m.id}>
                      {m.name} ({m.registration})
                    </option>
                  ))}
                </select>
              </div>

              {/* Old Device ID */}
              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Active Device ID (To Revoke)</label>
                <input
                  type="text"
                  readOnly
                  value={oldDeviceId}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-950/30 bg-gray-100 dark:bg-emerald-955/10 text-gray-500 font-mono focus:outline-none"
                />
              </div>

              {/* New Device ID Input */}
              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">New GPS Device ID</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="e.g. dev-mach-4"
                    value={newDeviceId}
                    onChange={(e) => {
                      setNewDeviceId(e.target.value);
                      setIsVerified(false);
                    }}
                    className={`flex-1 p-2.5 rounded-xl border bg-gray-50 dark:bg-emerald-955/5 focus:bg-white dark:text-white focus:outline-none transition-all ${
                      isVerified 
                        ? 'border-emerald-500 bg-emerald-500/5 focus:border-emerald-500' 
                        : 'border-gray-200 dark:border-emerald-950/30 focus:border-emerald-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleSimulateScan}
                    className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-xl hover:bg-emerald-100/50 cursor-pointer"
                    title="Scan New Device QR"
                  >
                    <FaQrcode className="text-sm" />
                  </button>
                </div>
              </div>

              {/* Verify Button */}
              <div className="flex items-end">
                <button
                  type="button"
                  disabled={isVerifying || isVerified || !newDeviceId}
                  onClick={handleVerifyNewDevice}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-100 dark:disabled:bg-emerald-950/10 dark:disabled:text-emerald-800 text-white rounded-xl font-bold shadow-md cursor-pointer disabled:cursor-not-allowed transition-all"
                >
                  {isVerifying ? (
                    <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  ) : isVerified ? (
                    <span className="flex items-center justify-center gap-1.5 text-emerald-600 dark:text-emerald-450">
                      <FaCheckCircle /> Verified
                    </span>
                  ) : (
                    'Verify New Device'
                  )}
                </button>
              </div>
            </div>

            {/* Replacement Reason */}
            <div>
              <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Replacement Reason</label>
              <select
                value={replacementReason}
                onChange={(e) => setReplacementReason(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-950/30 bg-gray-50 dark:bg-emerald-955/5 focus:bg-white focus:outline-none dark:text-white font-bold"
              >
                <option value="Hardware Failure">Hardware Failure (Antenna/Power)</option>
                <option value="Physical Damage">Physical Damage (Water/Accident)</option>
                <option value="Upgrade">Device Upgrade (v2 &rarr; v4)</option>
                <option value="Other">Other / Custom</option>
              </select>
            </div>

            {replacementReason === 'Other' && (
              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Custom Reason Description</label>
                <textarea
                  required
                  rows="3"
                  placeholder="Describe replacement context..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-950/30 bg-gray-50 dark:bg-[#121c17] focus:bg-white focus:outline-none dark:text-white"
                />
              </div>
            )}

            <div className="pt-4 flex justify-end font-bold">
              <button
                type="submit"
                disabled={isReplacing || !isVerified}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isReplacing ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                ) : (
                  'Replace Device'
                )}
              </button>
            </div>

          </form>
        </div>

        {/* Right Side: Vehicle Summary Info */}
        <div className="space-y-6">
          <div className="p-5 bg-white dark:bg-[#0e1712] border border-gray-155 dark:border-emerald-950/20 rounded-3xl shadow-sm text-xs space-y-4">
            <h3 className="text-xs font-bold text-gray-450 uppercase tracking-wider flex items-center gap-1.5">
              <FaTractor className="text-emerald-500" />
              Target Vehicle Details
            </h3>
            {currentSelectedMachine ? (
              <div className="space-y-3">
                <div className="relative aspect-video rounded-xl bg-gray-550 overflow-hidden border border-gray-200 dark:border-emerald-900/20">
                  <img
                    src={currentSelectedMachine.photo}
                    alt={currentSelectedMachine.name}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-bold uppercase tracking-wider">Reg. Plate</span>
                    <span className="font-extrabold dark:text-white">{currentSelectedMachine.registration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-bold uppercase tracking-wider">Type / Brand</span>
                    <span className="font-extrabold dark:text-white">{currentSelectedMachine.type} &bull; {currentSelectedMachine.brand}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-bold uppercase tracking-wider">Telemetry Status</span>
                    <span className="px-2 py-0.5 rounded font-black uppercase text-[8px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      {currentSelectedMachine.status}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-450 italic">No vehicle selected.</p>
            )}
          </div>
        </div>

      </div>

      {/* QR scanner simulator overlay */}
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
                <span className="text-xs font-black dark:text-white uppercase tracking-wider">Scan Replacement QR Code</span>
                <button onClick={() => setIsScannerOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer">
                  <FaTimes />
                </button>
              </div>

              <div className="relative aspect-square max-w-[240px] mx-auto bg-gray-950 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-emerald-500">
                <FaCamera className="text-4xl text-emerald-500/40 animate-pulse" />
                <div className="absolute left-0 right-0 h-0.5 bg-emerald-500 shadow-emerald-500 shadow-md animate-bounce top-0" style={{ animationDuration: '3s' }} />
              </div>

              <p className="text-xs font-bold text-gray-500 dark:text-emerald-400">{scanMessage}</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom replacement verification confirmation modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#0c120f] border border-gray-250 dark:border-emerald-900/30 p-6 rounded-2xl w-full max-w-sm shadow-2xl space-y-4 text-xs"
            >
              <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider text-red-500 flex items-center gap-1.5">
                <FaHistory />
                Confirm GPS Replacement?
              </h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                You are swapping the tracking unit on vehicle <strong>{currentSelectedMachine?.name}</strong>.
                <br /><br />
                - Revoking: <strong className="font-mono text-red-500">{oldDeviceId}</strong>
                <br />
                - Linking: <strong className="font-mono text-emerald-500">{newDeviceId}</strong>
                <br /><br />
                All historical logs and paths will remain saved. The old device ID will be returned to the inventory.
              </p>
              <div className="flex gap-2 justify-end text-xs font-bold pt-2">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-emerald-950/20 dark:text-emerald-350 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReplacement}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl cursor-pointer"
                >
                  Confirm Swap
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default DeviceReplacement;
