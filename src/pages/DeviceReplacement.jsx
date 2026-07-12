import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaQrcode, FaTractor, FaTools, FaCheckCircle, FaExclamationTriangle, 
  FaCamera, FaTimes, FaExchangeAlt, FaHistory 
} from 'react-icons/fa';
import api from '../utils/api';

export const DeviceReplacement = () => {
  const [machines, setMachines] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [newDeviceId, setNewDeviceId] = useState('');
  const [replacementReason, setReplacementReason] = useState('Hardware Failure');
  const [customReason, setCustomReason] = useState('');

  // Scanner Simulator
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scanMessage, setScanMessage] = useState('');

  // Response / Status UI
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMachines, setIsFetchingMachines] = useState(true);
  const [replacementResult, setReplacementResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchMachines = async () => {
    setIsFetchingMachines(true);
    try {
      const response = await api.get('/machines');
      if (response.data && response.data.success) {
        setMachines(response.data.data);
        if (response.data.data.length > 0) {
          setSelectedVehicleId(response.data.data[0]._id);
        }
      }
    } catch (error) {
      console.error('Failed to load vehicles list:', error);
      setErrorMessage('Could not load vehicles list. Verify admin privileges.');
    } finally {
      setIsFetchingMachines(false);
    }
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  const handleSimulateScan = () => {
    setIsScannerOpen(true);
    setScanMessage('Initializing camera stream...');
    setTimeout(() => {
      setScanMessage('Verifying QR Code data matrix...');
      setTimeout(() => {
        const mockScannedId = 'dev-' + Math.floor(100000 + Math.random() * 900000);
        setNewDeviceId(mockScannedId);
        setIsScannerOpen(false);
      }, 1000);
    }, 1500);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setReplacementResult(null);

    const finalReason = replacementReason === 'Other' ? customReason : replacementReason;

    try {
      const response = await api.post('/devices/replace', {
        vehicleId: selectedVehicleId,
        newDeviceId,
        reason: finalReason,
      });

      if (response.data && response.data.success) {
        setReplacementResult(response.data.data);
        setNewDeviceId('');
        setCustomReason('');
        fetchMachines(); // Reload lists
      }
    } catch (error) {
      console.error('GPS device replacement failed:', error);
      setErrorMessage(error.response?.data?.message || 'Device replacement failed. Verify New Device ID is not already active.');
    } finally {
      setIsLoading(false);
    }
  };

  const currentSelectedMachine = machines.find(m => m._id === selectedVehicleId);

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
          GPS Hardware Replacement
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Swap broken, offline, or upgraded GPS tracker modules on active vehicles. Telemetry database histories are automatically preserved.
        </p>
      </div>

      {/* Success Notification Banner */}
      {replacementResult && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/40 rounded-2xl space-y-2 text-xs"
        >
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-black uppercase tracking-wider">
            <FaCheckCircle className="text-sm shrink-0" />
            Hardware Replaced & Verified
          </div>
          <p className="text-gray-650 dark:text-gray-300">
            Vehicle <strong className="font-extrabold">{replacementResult.vehicle.name}</strong> was successfully linked to new GPS tracker: <strong className="font-extrabold">{newDeviceId || 'Updated hardware'}</strong>.
          </p>
          <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
            <FaHistory /> All historical GPS track logs, alert histories, and maintenance timelines are preserved.
          </div>
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
          {isFetchingMachines ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-6 text-xs">
              
              {/* Select vehicle */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-emerald-650 dark:text-emerald-500 border-b border-gray-100 dark:border-emerald-950/20 pb-1.5">
                  1. Select Target Vehicle
                </h3>
                <div>
                  <label className="block font-bold text-gray-400 uppercase mb-1.5">Select Vehicle to service</label>
                  <select
                    value={selectedVehicleId}
                    onChange={(e) => setSelectedVehicleId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-emerald-950/30 rounded-xl focus:bg-white focus:outline-none dark:text-white bg-gray-50 dark:bg-[#121c17]"
                  >
                    {machines.map(m => (
                      <option key={m._id} value={m._id}>
                        {m.name} ({m.type}) - Chassis: {m.chassisNumber || m.registration}
                      </option>
                    ))}
                  </select>
                </div>

                {currentSelectedMachine && (
                  <div className="p-3 bg-gray-50 dark:bg-[#121c17] rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 block uppercase">Current Linked Device</span>
                      <strong className="text-gray-700 dark:text-gray-300">
                        {currentSelectedMachine.gpsDeviceId ? 'GPS Device Connected' : 'No hardware linked'}
                      </strong>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-450 uppercase text-[9px] font-black">
                      Vehicle Active
                    </span>
                  </div>
                )}
              </div>

              {/* Scan new device */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-emerald-650 dark:text-emerald-500 border-b border-gray-100 dark:border-emerald-950/20 pb-1.5">
                  2. Scan New GPS Unit
                </h3>
                <div>
                  <label className="block font-bold text-gray-400 uppercase mb-1.5">New GPS Device ID</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Scan or enter new Device ID"
                      value={newDeviceId}
                      onChange={(e) => setNewDeviceId(e.target.value)}
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
              </div>

              {/* Reasons */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-emerald-650 dark:text-emerald-500 border-b border-gray-100 dark:border-emerald-950/20 pb-1.5">
                  3. Replacement Audit Log
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-gray-400 uppercase mb-1.5">Replacement Reason</label>
                    <select
                      value={replacementReason}
                      onChange={(e) => setReplacementReason(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-emerald-950/30 rounded-xl focus:bg-white focus:outline-none dark:text-white bg-gray-50 dark:bg-[#121c17]"
                    >
                      <option value="Hardware Failure">Hardware Failure</option>
                      <option value="Water Damage">Water Damage</option>
                      <option value="Upgrade">System Upgrade</option>
                      <option value="Warranty Replacement">Warranty Replacement</option>
                      <option value="Customer Request">Customer Request</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  {replacementReason === 'Other' && (
                    <div>
                      <label className="block font-bold text-gray-400 uppercase mb-1.5">Custom Reason Description</label>
                      <input
                        type="text"
                        required
                        placeholder="Enter detailed replacement audit reason"
                        value={customReason}
                        onChange={(e) => setCustomReason(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-emerald-950/30 rounded-xl focus:bg-white focus:outline-none dark:text-white bg-gray-50 dark:bg-[#121c17]"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Submit */}
              <div className="pt-2 border-t border-gray-100 dark:border-emerald-950/20 flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading || !selectedVehicleId || !newDeviceId}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Execute GPS Hardware Switch'
                  )}
                </button>
              </div>

            </form>
          )}
        </div>

        {/* Side Info */}
        <div className="p-6 bg-[#0c120f]/5 border border-emerald-950/10 dark:border-emerald-900/20 rounded-2xl space-y-4 h-fit text-xs">
          <h4 className="font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
            <FaExchangeAlt /> Hardware Lifecycle Audit
          </h4>
          <p className="text-gray-500 leading-relaxed">
            Executing a hardware switch deactivates the current active GPS Device connected to the vehicle. The old module is marked <strong>Inactive</strong> with the logged audit reason.
          </p>
          <div className="p-3 bg-white dark:bg-[#121c17]/50 rounded-xl space-y-1.5 border border-emerald-950/5">
            <span className="font-extrabold block text-gray-700 dark:text-gray-300">Preserved Records:</span>
            <ul className="list-disc pl-4 text-gray-400 space-y-1">
              <li>Engine working hours</li>
              <li>Calculated distance counters</li>
              <li>Live coordinate traces</li>
              <li>Job assignments & alert history</li>
            </ul>
          </div>
        </div>

      </div>

      {/* Simulated Scanner Overlay */}
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
              
              <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">New QR Code Scanner</h3>
              
              <div className="w-full aspect-video bg-black rounded-xl border border-gray-200 dark:border-emerald-900/35 relative flex items-center justify-center overflow-hidden">
                <div className="absolute inset-4 border-2 border-dashed border-emerald-500/50 rounded-lg animate-pulse" />
                <div className="w-1 h-full bg-emerald-500 absolute top-0 left-1/2 -translate-x-1/2 opacity-30 shadow-md animate-ping" />
                <span className="text-[10px] text-gray-500 font-bold z-10">{scanMessage}</span>
              </div>
              
              <p className="text-[10px] text-gray-450">
                Simulating camera-based QR code reader for new replacement hardware units.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default DeviceReplacement;
