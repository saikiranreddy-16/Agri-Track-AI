import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUser, FaMobileAlt, FaSyncAlt, FaLockOpen, FaShieldAlt, 
  FaCalendarAlt, FaTractor, FaHome, FaCheckCircle, FaBan, FaSearch, FaChevronRight 
} from 'react-icons/fa';
import api from '../utils/api';

export const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Modals / Status triggers
  const [activeCustomer, setActiveCustomer] = useState(null);
  const [modalType, setModalType] = useState(null); // 'reset-pin', 'reset-trusted'
  const [generatedPin, setGeneratedPin] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchCustomers = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const response = await api.get('/customers');
      if (response.data && response.data.success) {
        setCustomers(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      setErrorMessage('Could not load customers. Ensure you are signed in as a Company Admin.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleResetPin = async (id) => {
    try {
      const response = await api.post(`/customers/${id}/reset-password`);
      if (response.data && response.data.success) {
        setGeneratedPin(response.data.data.newPin);
        setModalType('pin-success');
        fetchCustomers();
      }
    } catch (error) {
      alert('Error resetting PIN: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleResetTrusted = async (id) => {
    try {
      const response = await api.post(`/customers/${id}/reset-trusted`);
      if (response.data && response.data.success) {
        setActionSuccess('Trusted devices list cleared successfully.');
        setModalType('action-success');
        fetchCustomers();
      }
    } catch (error) {
      alert('Error clearing trusted devices: ' + (error.response?.data?.message || error.message));
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
          Customer Fleet Accounts
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Monitor subscribed clients, configure login authentications, clear trusted devices table, and reset security credentials.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-[#0e1712] p-4 border border-gray-150 dark:border-emerald-950/20 rounded-2xl shadow-sm">
        <div className="relative w-full sm:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
            <FaSearch className="text-xs" />
          </span>
          <input
            type="text"
            placeholder="Search by client name or mobile..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 dark:bg-[#121c17] border border-gray-200 dark:border-emerald-950/30 rounded-xl focus:bg-white focus:outline-none dark:text-white transition-all"
          />
        </div>
        <button 
          onClick={fetchCustomers}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl hover:bg-emerald-100/50 cursor-pointer"
        >
          <FaSyncAlt className="text-[10px]" />
          Reload List
        </button>
      </div>

      {/* Error State */}
      {errorMessage && (
        <div className="p-4 bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/30 rounded-2xl text-xs text-red-700 dark:text-red-400">
          {errorMessage}
        </div>
      )}

      {/* Main Table */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0e1712] border border-gray-150 dark:border-emerald-950/20 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-emerald-950/10 text-gray-450 dark:text-gray-400 uppercase font-bold tracking-wider border-b border-gray-100 dark:border-emerald-950/10">
                <tr>
                  <th className="px-6 py-3">Customer details</th>
                  <th className="px-6 py-3">Subscription</th>
                  <th className="px-6 py-3 text-center">Farms</th>
                  <th className="px-6 py-3 text-center">Vehicles</th>
                  <th className="px-6 py-3 text-center">Active GPS</th>
                  <th className="px-6 py-3">Trusted Devices</th>
                  <th className="px-6 py-3">Last Login</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-emerald-950/10">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-10 text-center text-gray-450">
                      No active customer accounts found.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr key={customer._id} className="hover:bg-gray-50/50 dark:hover:bg-emerald-950/5 transition-colors">
                      {/* Name & Phone */}
                      <td className="px-6 py-4">
                        <div className="font-extrabold text-gray-800 dark:text-white flex items-center gap-1.5">
                          <FaUser className="text-emerald-500 text-[10px]" />
                          {customer.name}
                        </div>
                        <div className="text-[10px] text-gray-450 mt-0.5 flex items-center gap-1">
                          <FaMobileAlt />
                          {customer.phone}
                        </div>
                      </td>
                      {/* Sub Status */}
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase inline-flex items-center gap-1 ${
                          customer.subscriptionStatus === 'Active'
                            ? 'bg-emerald-55 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/35 dark:text-emerald-450'
                            : 'bg-red-50 text-red-750 dark:bg-red-950/20 dark:text-red-400'
                        }`}>
                          {customer.subscriptionStatus === 'Active' ? <FaCheckCircle className="text-[8px]" /> : <FaBan className="text-[8px]" />}
                          {customer.subscriptionStatus} ({customer.subscriptionPlan})
                        </span>
                      </td>
                      {/* Counts */}
                      <td className="px-6 py-4 text-center font-bold">{customer.farmsCount}</td>
                      <td className="px-6 py-4 text-center font-bold">{customer.vehiclesCount}</td>
                      <td className="px-6 py-4 text-center font-bold text-emerald-600 dark:text-emerald-450">{customer.activeDevicesCount}</td>
                      {/* Trusted Devices */}
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {customer.trustedDevices.length === 0 ? (
                            <span className="text-[10px] text-gray-450 italic">None registered</span>
                          ) : (
                            customer.trustedDevices.map((dev, idx) => (
                              <span key={idx} className="px-1.5 py-0.5 bg-gray-100 dark:bg-emerald-950/30 text-[9px] font-bold text-gray-600 dark:text-gray-300 rounded border border-gray-200 dark:border-emerald-900/30 flex items-center gap-1">
                                <FaShieldAlt className="text-[8px] text-emerald-500" />
                                {dev.phoneName || 'Phone'}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      {/* Last Login */}
                      <td className="px-6 py-4 text-gray-450 text-[10px]">
                        <span className="flex items-center gap-1">
                          <FaCalendarAlt />
                          {new Date(customer.lastLogin).toLocaleDateString()} {new Date(customer.lastLogin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      {/* Actions */}
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setActiveCustomer(customer);
                            setModalType('reset-pin-confirm');
                          }}
                          className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 rounded-lg hover:bg-emerald-100/50 text-[10px] font-extrabold cursor-pointer border border-emerald-200 dark:border-emerald-900/30"
                        >
                          Reset PIN
                        </button>
                        <button
                          disabled={customer.trustedDevices.length === 0}
                          onClick={() => {
                            setActiveCustomer(customer);
                            setModalType('reset-trusted-confirm');
                          }}
                          className="px-2.5 py-1 bg-red-50 dark:bg-red-950/20 text-red-750 dark:text-red-400 rounded-lg hover:bg-red-100/50 text-[10px] font-extrabold cursor-pointer border border-red-200 dark:border-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Clear Devices
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Modals */}
      <AnimatePresence>
        {modalType && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#0c120f] border border-gray-200 dark:border-emerald-900/30 p-6 rounded-2xl w-full max-w-sm shadow-xl"
            >
              {modalType === 'reset-pin-confirm' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">Reset Security PIN?</h3>
                  <p className="text-xs text-gray-500">
                    Are you sure you want to reset the login PIN for <strong className="text-gray-800 dark:text-white">{activeCustomer?.name}</strong>? A new secure 6-digit PIN will be generated.
                  </p>
                  <div className="flex gap-2 justify-end text-xs font-bold pt-2">
                    <button onClick={() => setModalType(null)} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-650 rounded-xl cursor-pointer">
                      Cancel
                    </button>
                    <button onClick={() => handleResetPin(activeCustomer._id)} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl cursor-pointer">
                      Reset PIN Code
                    </button>
                  </div>
                </div>
              )}

              {modalType === 'reset-trusted-confirm' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider text-red-500">Clear Trusted Devices?</h3>
                  <p className="text-xs text-gray-500">
                    Are you sure you want to clear all trusted login devices for <strong className="text-gray-800 dark:text-white">{activeCustomer?.name}</strong>? They will be prompted for GPS hardware validation on their next login.
                  </p>
                  <div className="flex gap-2 justify-end text-xs font-bold pt-2">
                    <button onClick={() => setModalType(null)} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-650 rounded-xl cursor-pointer">
                      Cancel
                    </button>
                    <button onClick={() => handleResetTrusted(activeCustomer._id)} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl cursor-pointer">
                      Clear Devices
                    </button>
                  </div>
                </div>
              )}

              {modalType === 'pin-success' && (
                <div className="space-y-4 text-center">
                  <FaLockOpen className="text-3xl text-emerald-500 mx-auto" />
                  <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">New PIN Generated</h3>
                  <p className="text-xs text-gray-500">
                    PIN code successfully reset for <strong className="text-gray-800 dark:text-white">{activeCustomer?.name}</strong>.
                  </p>
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl font-mono text-xl font-bold tracking-widest text-emerald-700 dark:text-emerald-400 select-all">
                    {generatedPin}
                  </div>
                  <p className="text-[10px] text-gray-450 italic">
                    Share this security PIN with the client. They will be prompted to change it upon signing in.
                  </p>
                  <div className="pt-2">
                    <button onClick={() => setModalType(null)} className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer">
                      Dismiss
                    </button>
                  </div>
                </div>
              )}

              {modalType === 'action-success' && (
                <div className="space-y-4 text-center">
                  <FaCheckCircle className="text-3xl text-emerald-500 mx-auto" />
                  <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">Action Successful</h3>
                  <p className="text-xs text-gray-500">{actionSuccess}</p>
                  <div className="pt-2">
                    <button onClick={() => setModalType(null)} className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer">
                      Dismiss
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomerManagement;
