import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaExclamationTriangle, FaFilter, FaCheckCircle, 
  FaSearch, FaGasPump, FaCompass, FaTools, FaMapMarkerAlt, FaTimes 
} from 'react-icons/fa';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';

export const Alerts = () => {
  const toast = useToast();

  const [alerts, setAlerts] = useState([]);
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const response = await api.get('/alerts');
      if (response.data && response.data.success) {
        setAlerts(response.data.data);
      }
    } catch (error) {
      console.error('Failed to retrieve alerts:', error);
      toast.error('Failed to load active system alerts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleResolve = async (id) => {
    try {
      const res = await api.put(`/alerts/${id}/resolve`);
      if (res.data && res.data.success) {
        toast.success('Alert resolved successfully.');
        fetchAlerts();
      }
    } catch (err) {
      toast.error('Failed to resolve alert.');
    }
  };

  // Filter alerts locally based on select filters & search queries
  const filteredAlerts = alerts.filter(a => {
    const matchesSearch = 
      (a.message?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (a.type?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (a.deviceId?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (a.customerId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
      
    const matchesCategory = filterCategory === 'All' || a.category === filterCategory;
    const matchesPriority = filterPriority === 'All' || a.priority === filterPriority;
    
    return matchesSearch && matchesCategory && matchesPriority;
  });

  const categories = [
    'All', 'Engine', 'GPS', 'Power', 'Battery', 
    'Speed', 'Geofence', 'Maintenance', 'Security', 'Fuel', 'System'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
          Alerts Command Control
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Review real-time machine fault codes, geofence breaches, and resolve engine issues.
        </p>
      </div>

      {/* Stats counter summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-[#0e1712] border border-red-100 dark:border-red-950/20 rounded-2xl flex justify-between items-center">
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Critical Faults</span>
            <span className="text-xl font-black dark:text-white block mt-0.5">
              {alerts.filter(a => a.priority === 'Critical' && a.status === 'Active').length}
            </span>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
        </div>
        <div className="p-4 bg-white dark:bg-[#0e1712] border border-orange-100 dark:border-orange-950/20 rounded-2xl flex justify-between items-center">
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Active warnings</span>
            <span className="text-xl font-black dark:text-white block mt-0.5">
              {alerts.filter(a => a.status === 'Active').length}
            </span>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
        </div>
        <div className="p-4 bg-white dark:bg-[#0e1712] border border-emerald-100 dark:border-emerald-950/20 rounded-2xl flex justify-between items-center">
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Resolved codes</span>
            <span className="text-xl font-black dark:text-white block mt-0.5">
              {alerts.filter(a => a.status === 'Resolved').length}
            </span>
          </div>
          <FaCheckCircle className="text-emerald-500 text-lg" />
        </div>
        <div className="p-4 bg-white dark:bg-[#0e1712] border border-gray-150 dark:border-emerald-950/10 rounded-2xl flex justify-between items-center">
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Total logged</span>
            <span className="text-xl font-black dark:text-white block mt-0.5">{alerts.length}</span>
          </div>
          <FaExclamationTriangle className="text-gray-400 text-lg" />
        </div>
      </div>

      {/* Filter panel controls */}
      <div className="p-4 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl flex flex-col md:flex-row gap-4">
        <div className="flex flex-1 flex-col sm:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <FaSearch className="text-xs" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by device ID, client account, messages..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-emerald-950/30 border border-gray-200 dark:border-emerald-950/40 focus:outline-none focus:border-emerald-500 focus:bg-white dark:text-white font-semibold"
            />
          </div>

          {/* Filter category */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 text-xs font-bold bg-gray-50 dark:bg-emerald-950/30 border border-gray-200 dark:border-emerald-950/40 rounded-xl focus:outline-none dark:text-white"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : `${cat} Warnings`}</option>
            ))}
          </select>

          {/* Filter priority */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 text-xs font-bold bg-gray-50 dark:bg-emerald-950/30 border border-gray-200 dark:border-emerald-950/40 rounded-xl focus:outline-none dark:text-white"
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Alerts Grid list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence>
          {filteredAlerts.map((alert) => {
            const isCritical = alert.priority === 'Critical';
            const isResolved = alert.status === 'Resolved';
            
            return (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={alert._id}
                className={`p-5 bg-white dark:bg-[#0e1712] border rounded-2xl shadow-sm flex flex-col justify-between transition-all ${
                  isResolved 
                    ? 'border-emerald-100 dark:border-emerald-950/20 opacity-70' 
                    : isCritical
                    ? 'border-red-200 dark:border-red-950/30 hover:border-red-300 shadow-red-500/5 shadow-sm'
                    : 'border-orange-100 dark:border-orange-950/20 hover:border-orange-200'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        isResolved 
                          ? 'bg-emerald-500' 
                          : isCritical 
                          ? 'bg-red-500 animate-pulse' 
                          : 'bg-orange-500'
                      }`} />
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{alert.category} Alert</span>
                    </div>

                    <div className="flex gap-1.5 text-[9px] font-bold leading-none uppercase">
                      <span className={`px-2 py-0.5 rounded ${
                        isCritical 
                          ? 'bg-red-100 text-red-800 dark:bg-red-950/50' 
                          : 'bg-orange-100 text-orange-850 dark:bg-orange-950/50'
                      }`}>
                        {alert.priority}
                      </span>
                      <span className="text-gray-400 font-semibold">{new Date(alert.createdAt || alert.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  <h3 className="text-sm font-extrabold dark:text-white mt-2.5 flex items-center gap-1.5">
                    {alert.type}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-normal">
                    {alert.message}
                  </p>
                  
                  {/* Expanded Admin alert parameters */}
                  <div className="mt-4 pt-3.5 border-t border-gray-150 dark:border-emerald-950/10 text-[11px] font-semibold text-gray-450 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <span>Device ID: <strong className="text-gray-700 dark:text-gray-200">{alert.deviceId}</strong></span>
                      <span>Vehicle: <strong className="text-gray-700 dark:text-gray-200">{alert.machineId?.name || 'Unassigned'}</strong></span>
                      <span>Customer: <strong className="text-gray-700 dark:text-gray-200">{alert.customerId?.name || 'Unknown'}</strong></span>
                      <span>Location: <strong className="text-gray-700 dark:text-gray-200">{alert.districtId?.name || 'N/A'}, {alert.stateId?.name || 'N/A'}</strong></span>
                    </div>
                    {alert.exactLocation && (
                      <div className="flex items-start gap-1 text-[10px] text-gray-400 border-t border-gray-100 dark:border-emerald-950/10 pt-2">
                        <FaMapMarkerAlt className="text-red-400 mt-0.5 shrink-0" />
                        <span>Coordinates: {alert.exactLocation.lat.toFixed(5)}, {alert.exactLocation.lng.toFixed(5)} &bull; {alert.exactLocation.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-3.5 border-t border-gray-100 dark:border-emerald-950/10 flex gap-2 justify-end">
                  {!isResolved ? (
                    <button
                      onClick={() => handleResolve(alert._id)}
                      className="flex items-center gap-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer transition-colors"
                    >
                      <FaCheckCircle className="text-[10px]" /> Resolve Alert
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <FaCheckCircle /> Resolved & Logged
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {filteredAlerts.length === 0 && (
          <div className="col-span-2 text-center py-20 text-xs text-gray-400 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl">
            No warnings registered matching these filter configurations.
          </div>
        )}
      </div>

    </div>
  );
};
export default Alerts;
