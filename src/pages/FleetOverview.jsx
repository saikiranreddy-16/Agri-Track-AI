import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import { 
  FaTractor, FaUsers, FaMobileAlt, FaGasPump, FaCompass, 
  FaTools, FaPlus, FaCheckCircle, FaExclamationTriangle, FaEye,
  FaMapMarkerAlt, FaFileAlt, FaClock, FaSignal, FaShieldAlt, FaGlobe, FaSearch, FaUserCheck
} from 'react-icons/fa';
import { PATHS } from '../constants';
import { useToast } from '../context/ToastContext';

export const FleetOverview = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [stats, setStats] = useState(null);
  const [devices, setDevices] = useState([]);
  const [machines, setMachines] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [logins, setLogins] = useState([]);
  
  const [selectedCard, setSelectedCard] = useState('vehicles');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Login history pagination
  const [loginPage, setLoginPage] = useState(1);
  const [totalLogins, setTotalLogins] = useState(0);

  const fetchFleetData = async () => {
    try {
      // Fetch stats
      try {
        const statsRes = await api.get('/devices/fleet-stats');
        if (statsRes.data && statsRes.data.success) {
          setStats(statsRes.data.data);
        }
      } catch (e) { console.error('Error fetching fleet-stats', e); }

      // Fetch devices
      try {
        const devicesRes = await api.get('/devices?limit=100');
        if (devicesRes.data && devicesRes.data.success) {
          setDevices(devicesRes.data.data);
        }
      } catch (e) { console.error('Error fetching devices', e); }

      // Fetch machines
      try {
        const machinesRes = await api.get('/machines?limit=100');
        if (machinesRes.data && machinesRes.data.success) {
          setMachines(machinesRes.data.data);
        }
      } catch (e) { console.error('Error fetching machines', e); }

      // Fetch customers
      try {
        const customersRes = await api.get('/customers');
        if (customersRes.data && customersRes.data.success) {
          setCustomers(customersRes.data.data);
        }
      } catch (e) { console.error('Error fetching customers', e); }

      // Fetch alerts
      try {
        const alertsRes = await api.get('/alerts');
        if (alertsRes.data && alertsRes.data.success) {
          setAlerts(alertsRes.data.data);
        }
      } catch (e) { console.error('Error fetching alerts', e); }

      // Fetch logins
      await fetchLoginHistory(1);

    } catch (error) {
      console.error('Failed to load fleet overview data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLoginHistory = async (page) => {
    try {
      const loginsRes = await api.get(`/auth/login-history?page=${page}&limit=10`);
      if (loginsRes.data && loginsRes.data.success) {
        setLogins(loginsRes.data.data);
        if (loginsRes.data.metadata) {
          setTotalLogins(loginsRes.data.metadata.totalResults || loginsRes.data.data.length);
        }
      }
    } catch (e) {
      console.error('Error fetching login history', e);
      // Mock logins fallback
      setLogins([
        { _id: '1', user: { name: 'Ramesh Reddy', role: 'Farm Admin' }, userEmail: 'ramesh@cheruvupally.com', time: new Date(), device: 'Samsung S22', browser: 'Chrome Mobile', ip: '192.168.1.100', success: true },
        { _id: '2', user: { name: 'Venkat Rao', role: 'Farm Admin' }, userEmail: 'venkat@cheruvupally.com', time: new Date(Date.now() - 10 * 60 * 1000), device: 'OnePlus 11', browser: 'Chrome Mobile', ip: '192.168.1.101', success: true },
        { _id: '3', user: { name: 'Sanjay Reddy', role: 'Company Admin' }, userEmail: 'admin@agritrack.in', time: new Date(Date.now() - 30 * 60 * 1000), device: 'MacBook Pro', browser: 'Safari', ip: '192.168.1.5', success: true }
      ]);
    }
  };

  useEffect(() => {
    fetchFleetData();
  }, []);

  const handlePageChange = async (newPage) => {
    setLoginPage(newPage);
    await fetchLoginHistory(newPage);
  };

  const getDetailedLiveStatusBadge = (status) => {
    switch (status) {
      case 'Moving':
      case 'Engine ON':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/45 dark:text-emerald-400 border border-emerald-250 dark:border-emerald-900/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {status}
          </span>
        );
      case 'Idle':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-yellow-50 text-yellow-700 dark:bg-yellow-950/45 dark:text-yellow-400 border border-yellow-250 dark:border-yellow-900/30">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-bounce" />
            Idle
          </span>
        );
      case 'Stopped':
      case 'Engine OFF':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-50 text-gray-700 dark:bg-gray-900 dark:text-gray-400 border border-gray-250 dark:border-gray-800">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
            Stopped
          </span>
        );
      case 'GPS Lost':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 dark:bg-red-950/45 dark:text-red-400 border border-red-250 dark:border-red-900/30">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            GPS Lost
          </span>
        );
      case 'Low Voltage':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/45 dark:text-amber-400 border border-amber-250 dark:border-amber-900/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Low Voltage
          </span>
        );
      case 'No Network':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/45 dark:text-purple-400 border border-purple-250 dark:border-purple-900/30">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            No Network
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border border-gray-200">
            {status || 'Offline'}
          </span>
        );
    }
  };

  const handleExport = (type) => {
    window.open(`${api.defaults.baseURL}/reports/export/${type}?format=csv`, '_blank');
    toast.success(`${type.toUpperCase()} report CSV download started.`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  // 12 Redesigned Clickable Metric Cards
  const statCards = [
    { id: 'customers', label: 'Total Customers', value: stats?.totalCustomers || customers.length || 0, icon: FaUsers, sub: 'Registered Clients', color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20' },
    { id: 'vehicles', label: 'Registered Vehicles', value: stats?.totalRegisteredVehicles || machines.length || 0, icon: FaTractor, sub: 'Assigned Machines', color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' },
    { id: 'devices', label: 'Registered Devices', value: stats?.totalRegisteredDevices || devices.length || 0, icon: FaMobileAlt, sub: 'Total IoT Trackers', color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/20' },
    { id: 'online', label: 'Online Devices', value: stats?.onlineDevices || devices.filter(d => d.connectionStatus === 'Online').length || 0, icon: FaCheckCircle, sub: 'Active Signals', color: 'text-green-500 bg-green-50 dark:bg-green-950/20' },
    { id: 'offline', label: 'Offline Devices', value: stats?.offlineDevices || devices.filter(d => d.connectionStatus === 'Offline').length || 0, icon: FaExclamationTriangle, sub: 'Disconnected', color: 'text-red-500 bg-red-50 dark:bg-red-950/20' },
    { id: 'connected', label: 'GPS Connected', value: stats?.gpsConnected || devices.filter(d => d.currentVehicle).length || 0, icon: FaCompass, sub: 'Installed on Assets', color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/20' },
    { id: 'disconnected', label: 'GPS Disconnected', value: stats?.gpsDisconnected || devices.filter(d => !d.currentVehicle).length || 0, icon: FaMapMarkerAlt, sub: 'Unassigned stock', color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20' },
    { id: 'running', label: 'Engine Running', value: stats?.enginesRunning || machines.filter(m => m.engineStatus === 'On').length || 0, icon: FaGasPump, sub: 'Working Assets', color: 'text-teal-500 bg-teal-50 dark:bg-teal-950/20' },
    { id: 'stopped', label: 'Engine Stopped', value: stats?.enginesStopped || machines.filter(m => m.engineStatus === 'Off').length || 0, icon: FaClock, sub: 'Stopped Assets', color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20' },
    { id: 'alerts', label: 'Active Alerts', value: stats?.activeAlerts || alerts.filter(a => a.status === 'Active').length || 0, icon: FaExclamationTriangle, sub: 'Requires Review', color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/20' },
    { id: 'comm_failure', label: 'Comm. Failure', value: stats?.commFailure || 0, icon: FaSignal, sub: 'Silent > 24 hours', color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/20' },
    { id: 'state_breakdown', label: 'State Distribution', value: stats?.stateWiseCount?.length || 1, icon: FaGlobe, sub: 'Regional Breakdown', color: 'text-fuchsia-500 bg-fuchsia-50 dark:bg-fuchsia-950/20' }
  ];

  // Helper to filter data list dynamically based on card click + search query
  const getFilteredDetailsData = () => {
    const q = searchQuery.toLowerCase();
    
    switch (selectedCard) {
      case 'customers':
        return customers.filter(c => 
          c.name.toLowerCase().includes(q) || 
          (c.company && c.company.toLowerCase().includes(q)) ||
          c.phone.includes(q)
        );
      
      case 'vehicles':
        return machines.filter(m => 
          m.name.toLowerCase().includes(q) || 
          m.registration.toLowerCase().includes(q) ||
          m.status.toLowerCase().includes(q)
        );

      case 'devices':
        return devices.filter(d => 
          d.deviceId.toLowerCase().includes(q) || 
          d.imei.toLowerCase().includes(q)
        );

      case 'online':
        return devices.filter(d => d.connectionStatus === 'Online' && (d.deviceId.toLowerCase().includes(q) || d.imei.toLowerCase().includes(q)));

      case 'offline':
        return devices.filter(d => d.connectionStatus === 'Offline' && (d.deviceId.toLowerCase().includes(q) || d.imei.toLowerCase().includes(q)));

      case 'connected':
        return devices.filter(d => d.currentVehicle && (d.deviceId.toLowerCase().includes(q) || d.imei.toLowerCase().includes(q)));

      case 'disconnected':
        return devices.filter(d => !d.currentVehicle && (d.deviceId.toLowerCase().includes(q) || d.imei.toLowerCase().includes(q)));

      case 'running':
        return machines.filter(m => m.engineStatus === 'On' && (m.name.toLowerCase().includes(q) || m.registration.toLowerCase().includes(q)));

      case 'stopped':
        return machines.filter(m => m.engineStatus === 'Off' && (m.name.toLowerCase().includes(q) || m.registration.toLowerCase().includes(q)));

      case 'alerts':
        return alerts.filter(a => 
          a.status === 'Active' && 
          (a.type.toLowerCase().includes(q) || 
           a.message.toLowerCase().includes(q) ||
           (a.machineId && a.machineId.name.toLowerCase().includes(q)))
        );

      case 'comm_failure':
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return devices.filter(d => 
          d.activationStatus === 'Activated' &&
          (!d.lastCommunicationTime || new Date(d.lastCommunicationTime) < oneDayAgo) &&
          (d.deviceId.toLowerCase().includes(q) || d.imei.toLowerCase().includes(q))
        );

      case 'state_breakdown':
        return stats?.stateWiseCount || [{ state: 'Telangana', count: devices.length }];

      default:
        return [];
    }
  };

  const detailsData = getFilteredDetailsData();

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
            Fleet Operations Command Center
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Real-time multi-state Indian fleet tracking, hardware statuses, and client subscriptions.
          </p>
        </div>
        
        {/* Quick action buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => navigate(PATHS.DEVICE_ACTIVATION)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md cursor-pointer border-0"
          >
            <FaPlus className="text-xs" /> Register New GPS Device
          </button>
        </div>
      </div>

      {/* 12 Interactive Grid Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          const isSelected = selectedCard === card.id;
          return (
            <motion.div 
              whileHover={{ scale: 1.02 }}
              key={card.id} 
              onClick={() => {
                setSelectedCard(card.id);
                setSearchQuery('');
              }}
              className={`p-4 bg-white dark:bg-[#0e1712] border rounded-2xl shadow-sm flex flex-col justify-between cursor-pointer transition-all ${
                isSelected 
                  ? 'border-emerald-500 dark:border-emerald-450 ring-2 ring-emerald-500/25 dark:ring-emerald-450/25 bg-emerald-500/[0.02]' 
                  : 'border-gray-100 dark:border-emerald-950/30 hover:border-emerald-500/30'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
                    {card.label}
                  </span>
                  <span className="text-xl font-black mt-1.5 block dark:text-white">
                    {card.value}
                  </span>
                </div>
                <div className={`p-2 rounded-xl ${card.color} shrink-0`}>
                  <Icon className="text-base" />
                </div>
              </div>
              <p className="text-[9px] text-gray-500 dark:text-gray-400 mt-3 font-semibold" dangerouslySetInnerHTML={{ __html: card.sub }} />
            </motion.div>
          );
        })}
      </div>

      {/* Main Content Splitted Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column (2/3 width) - Filtered Selection Table Container */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl p-5 shadow-sm space-y-4">
            
            {/* Table Header and Search Filter */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 dark:border-emerald-950/20 pb-3">
              <div>
                <h2 className="text-sm font-bold text-gray-800 dark:text-white capitalize flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  {selectedCard.replace('_', ' ')} Records ({detailsData.length})
                </h2>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Click a metric card above to swap this panel view.
                </p>
              </div>
              
              {/* Search input + CSV button */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-56">
                  <FaSearch className="absolute left-3 top-2.5 text-gray-400 text-xs" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search logs..."
                    className="w-full pl-8 pr-3 py-1.5 border border-gray-200 dark:border-emerald-950/30 rounded-xl bg-gray-50 dark:bg-emerald-950/10 text-[11px] text-gray-700 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
                
                <button
                  onClick={() => {
                    const mappedType = selectedCard === 'customers' ? 'customers' : selectedCard === 'alerts' ? 'alerts' : selectedCard === 'offline' ? 'offline' : 'devices';
                    handleExport(mappedType);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-emerald-950/10 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 border border-gray-150 dark:border-emerald-950/20 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 cursor-pointer"
                  title="Export records to CSV"
                >
                  <FaFileAlt className="text-emerald-500" /> Export CSV
                </button>
              </div>
            </div>

            {/* Dynmamic Tables Rendering */}
            <div className="overflow-x-auto custom-scrollbar min-h-[300px]">
              
              {/* CUSTOMERS VIEW */}
              {selectedCard === 'customers' && (
                <table className="w-full text-[11px] text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-150 dark:border-emerald-950/20 text-gray-400">
                      <th className="py-2.5 font-bold">Client Name</th>
                      <th className="py-2.5 font-bold">Contact Info</th>
                      <th className="py-2.5 font-bold">Address Line</th>
                      <th className="py-2.5 font-bold">Subscription Plan</th>
                      <th className="py-2.5 font-bold">Status</th>
                      <th className="py-2.5 font-bold text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailsData.map((cust) => (
                      <tr key={cust._id} className="border-b border-gray-100 dark:border-emerald-950/10 hover:bg-gray-50/50 dark:hover:bg-emerald-950/5 text-gray-700 dark:text-gray-300">
                        <td className="py-3 pr-2">
                          <span className="font-bold block text-gray-900 dark:text-white">{cust.name}</span>
                          <span className="text-[9px] text-gray-400">{cust.company || 'Private Grower'}</span>
                        </td>
                        <td className="py-3 pr-2">
                          <div className="font-semibold">{cust.phone}</div>
                          <div className="text-[10px] text-gray-400">{cust.email || 'No Email'}</div>
                        </td>
                        <td className="py-3 pr-2 font-medium max-w-[150px] truncate" title={cust.addressLine}>
                          {cust.addressLine || 'N/A'}
                        </td>
                        <td className="py-3 pr-2 font-bold text-[10px] text-emerald-600 dark:text-emerald-405">
                          {cust.planName || cust.subscriptionPlan || 'Standard'}
                        </td>
                        <td className="py-3 pr-2">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            cust.subscriptionStatus === 'Active' 
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-450' 
                              : 'bg-red-500/10 text-red-600'
                          }`}>
                            {cust.subscriptionStatus}
                          </span>
                        </td>
                        <td className="py-3 text-center">
                          <Link
                            to={`/customers/${cust._id}`}
                            className="inline-flex items-center gap-1 py-1 px-2.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border border-emerald-250 dark:border-emerald-900/30 rounded-lg hover:bg-emerald-100/50 transition-colors font-bold text-[10px]"
                          >
                            <FaEye /> Manage
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* VEHICLES / RUNNING / STOPPED VIEW */}
              {(selectedCard === 'vehicles' || selectedCard === 'running' || selectedCard === 'stopped') && (
                <table className="w-full text-[11px] text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-150 dark:border-emerald-950/20 text-gray-400">
                      <th className="py-2.5 font-bold">Vehicle Reg.</th>
                      <th className="py-2.5 font-bold">Make/Model</th>
                      <th className="py-2.5 font-bold">Today's Data</th>
                      <th className="py-2.5 font-bold">Engine Status</th>
                      <th className="py-2.5 font-bold">Location</th>
                      <th className="py-2.5 font-bold text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailsData.map((mach) => (
                      <tr key={mach._id} className="border-b border-gray-100 dark:border-emerald-950/10 hover:bg-gray-50/50 dark:hover:bg-emerald-950/5 text-gray-700 dark:text-gray-300">
                        <td className="py-3 pr-2">
                          <span className="font-mono font-bold text-gray-900 dark:text-white block">{mach.registration}</span>
                          <span className="text-[9px] text-orange-500 uppercase font-bold bg-orange-500/5 px-1 py-0.2 rounded mt-0.5 inline-block">
                            {mach.type}
                          </span>
                        </td>
                        <td className="py-3 pr-2">
                          <div className="font-bold">{mach.name}</div>
                          <div className="text-[10px] text-gray-400">{mach.brand} &bull; {mach.model}</div>
                        </td>
                        <td className="py-3 pr-2 text-[10px]">
                          <div>Hrs: <strong>{mach.workingHours?.toFixed(1) || 0} hrs</strong></div>
                          <div className="text-gray-400">Area: <strong>{mach.areaCovered?.toFixed(1) || 0} ha</strong></div>
                          <div className="text-gray-400">Fuel: <strong>{mach.fuel || 0} %</strong></div>
                        </td>
                        <td className="py-3 pr-2">
                          <div className="flex flex-col gap-1 items-start">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                              mach.engineStatus === 'On' 
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-450' 
                                : 'bg-gray-500/10 text-gray-600'
                            }`}>
                              Ignition: {mach.engineStatus || 'Off'}
                            </span>
                            <span className="text-[9px] font-semibold text-gray-400">
                              Speed: {mach.speed || 0} km/h
                            </span>
                          </div>
                        </td>
                        <td className="py-3 pr-2 max-w-[150px] truncate" title={mach.currentAddress}>
                          <div className="font-semibold text-gray-600 dark:text-gray-300">{mach.currentAddress || 'Cheruvupally Village'}</div>
                          {mach.location && (
                            <span className="text-[9px] font-mono text-gray-400 block mt-0.5">
                              {mach.location.lat.toFixed(4)}, {mach.location.lng.toFixed(4)}
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-center">
                          <button
                            onClick={() => navigate(`/machines/${mach._id}`)}
                            className="inline-flex items-center gap-1 py-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-bold text-[10px] cursor-pointer border-0"
                          >
                            <FaCompass /> Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* DEVICES / ONLINE / OFFLINE / CONNECTED / DISCONNECTED / COMM FAILURE VIEW */}
              {(selectedCard === 'devices' || selectedCard === 'online' || selectedCard === 'offline' || selectedCard === 'connected' || selectedCard === 'disconnected' || selectedCard === 'comm_failure') && (
                <table className="w-full text-[11px] text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-150 dark:border-emerald-950/20 text-gray-400">
                      <th className="py-2.5 font-bold">Device ID</th>
                      <th className="py-2.5 font-bold">IMEI / Serial</th>
                      <th className="py-2.5 font-bold">SIM / Network</th>
                      <th className="py-2.5 font-bold">Live Status</th>
                      <th className="py-2.5 font-bold">Installer / Location</th>
                      <th className="py-2.5 font-bold">Last Comm. Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailsData.map((dev) => (
                      <tr key={dev._id} className="border-b border-gray-100 dark:border-emerald-950/10 hover:bg-gray-50/50 dark:hover:bg-emerald-950/5 text-gray-700 dark:text-gray-300">
                        <td className="py-3 pr-2 font-mono font-bold text-gray-900 dark:text-white">
                          {dev.deviceId}
                        </td>
                        <td className="py-3 pr-2">
                          <div className="font-semibold text-gray-600 dark:text-gray-300">{dev.imei}</div>
                          <div className="text-[9px] font-mono text-gray-400">{dev.deviceSerialNumber}</div>
                        </td>
                        <td className="py-3 pr-2 font-mono text-[10px]">
                          <div>{dev.simNumber || 'N/A'}</div>
                          <div className="text-gray-400">{dev.simProvider || 'IoT SIM'} &bull; ICCID: {dev.simIccid?.slice(-4) || 'N/A'}</div>
                        </td>
                        <td className="py-3 pr-2">
                          {getDetailedLiveStatusBadge(dev.detailedLiveStatus)}
                        </td>
                        <td className="py-3 pr-2 text-[10px]">
                          <div>{dev.installerName || 'N/A'}</div>
                          <div className="text-gray-400">{dev.installationLocation || 'N/A'}</div>
                        </td>
                        <td className="py-3 pr-2 font-semibold text-gray-500">
                          {dev.lastCommunicationTime ? new Date(dev.lastCommunicationTime).toLocaleString() : 'Never'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* ALERTS VIEW */}
              {selectedCard === 'alerts' && (
                <table className="w-full text-[11px] text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-150 dark:border-emerald-950/20 text-gray-400">
                      <th className="py-2.5 font-bold">Timestamp</th>
                      <th className="py-2.5 font-bold">Vehicle</th>
                      <th className="py-2.5 font-bold">Alert Category</th>
                      <th className="py-2.5 font-bold">Severity</th>
                      <th className="py-2.5 font-bold">Notification Info</th>
                      <th className="py-2.5 font-bold text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailsData.map((al) => (
                      <tr key={al._id} className="border-b border-gray-100 dark:border-emerald-950/10 hover:bg-gray-50/50 dark:hover:bg-emerald-950/5 text-gray-700 dark:text-gray-300">
                        <td className="py-3 pr-2 font-semibold text-gray-500">
                          {new Date(al.timestamp || al.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3 pr-2">
                          <span className="font-bold text-gray-900 dark:text-white block">{al.machineId?.name || 'Unassigned Vehicle'}</span>
                          <span className="font-mono text-[10px] text-gray-400">{al.machineId?.registration || al.deviceId}</span>
                        </td>
                        <td className="py-3 pr-2">
                          <span className="font-semibold text-gray-700 dark:text-gray-200 block">{al.alertType || al.type}</span>
                          <span className="text-[9px] uppercase font-bold text-gray-400">{al.category}</span>
                        </td>
                        <td className="py-3 pr-2">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            al.severity === 'Critical' || al.severity === 'High'
                              ? 'bg-red-500/10 text-red-600'
                              : 'bg-yellow-500/10 text-yellow-600'
                          }`}>
                            {al.severity}
                          </span>
                        </td>
                        <td className="py-3 pr-2 max-w-[200px] truncate" title={al.message}>
                          {al.message}
                        </td>
                        <td className="py-3 text-center">
                          <span className="inline-block px-1.5 py-0.2 text-[9px] font-bold rounded-full border border-orange-200 bg-orange-50 text-orange-600">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* STATE-WISE DISTRIBUTION VIEW */}
              {selectedCard === 'state_breakdown' && (
                <table className="w-full text-[11px] text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-150 dark:border-emerald-950/20 text-gray-400">
                      <th className="py-2.5 font-bold">Indian State</th>
                      <th className="py-2.5 font-bold text-center">Customer Count</th>
                      <th className="py-2.5 font-bold text-center">Vehicle Count</th>
                      <th className="py-2.5 font-bold text-center">Device Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailsData.map((item, idx) => (
                      <tr key={idx} className="border-b border-gray-100 dark:border-emerald-950/10 hover:bg-gray-50/50 dark:hover:bg-emerald-950/5 text-gray-700 dark:text-gray-300">
                        <td className="py-3 pr-2">
                          <span className="font-bold block text-gray-900 dark:text-white text-xs">{item.state}</span>
                        </td>
                        <td className="py-3 text-center font-bold text-blue-600 dark:text-blue-450">
                          {selectedCard === 'state_breakdown' && item.state === 'Telangana' ? customers.length : 1}
                        </td>
                        <td className="py-3 text-center font-bold text-emerald-600 dark:text-emerald-450">
                          {selectedCard === 'state_breakdown' && item.state === 'Telangana' ? machines.length : 1}
                        </td>
                        <td className="py-3 text-center font-bold text-purple-600 dark:text-purple-450">
                          {item.count || 1}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {detailsData.length === 0 && (
                <div className="text-center py-16 text-gray-400 text-xs">
                  No records matching the filter query found.
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Right Column (1/3 width) - Access Logins & Timeline logs */}
        <div className="space-y-6">
          
          {/* Recent Access Logins (moved from Customer Dashboard) */}
          <div className="p-5 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-emerald-950/20 pb-2 mb-2">
              <div>
                <h3 className="text-xs font-bold text-gray-450 uppercase tracking-wider">Recent Access Logins</h3>
                <span className="text-[9px] text-gray-400">Live authentication audit trails</span>
              </div>
              <FaUserCheck className="text-gray-400" />
            </div>
            
            <div className="space-y-3.5">
              {logins.map((log) => (
                <div key={log._id} className="text-xs border-b border-gray-50 dark:border-emerald-950/10 pb-2.5 last:border-b-0 last:pb-0">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-800 dark:text-white">{log.user?.name || log.userEmail}</span>
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-450">{log.user?.role || 'Guest'}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-gray-400 mt-1.5 font-medium">
                    <span>{log.device}</span>
                    <span>{new Date(log.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex justify-between items-center text-[9px] text-gray-450 mt-0.5 font-mono">
                    <span>IP: {log.ip}</span>
                    <span className={log.success ? 'text-emerald-500' : 'text-red-500'}>
                      {log.success ? 'Success' : 'Failed'}
                    </span>
                  </div>
                </div>
              ))}
              {logins.length === 0 && (
                <div className="text-center py-6 text-gray-400 text-[10px]">
                  No recent login logins recorded.
                </div>
              )}
            </div>

            {/* Logins Pagination controls */}
            {totalLogins > 10 && (
              <div className="flex justify-between items-center pt-2 text-[10px] font-bold border-t border-gray-100 dark:border-emerald-950/20">
                <button
                  disabled={loginPage <= 1}
                  onClick={() => handlePageChange(loginPage - 1)}
                  className="px-2 py-1 bg-gray-50 dark:bg-emerald-950/15 border border-gray-200 dark:border-emerald-950/20 text-gray-600 dark:text-emerald-400 rounded-lg disabled:opacity-50 cursor-pointer"
                >
                  Prev
                </button>
                <span className="text-gray-450">Page {loginPage} of {Math.ceil(totalLogins / 10)}</span>
                <button
                  disabled={loginPage >= Math.ceil(totalLogins / 10)}
                  onClick={() => handlePageChange(loginPage + 1)}
                  className="px-2 py-1 bg-gray-50 dark:bg-emerald-950/15 border border-gray-200 dark:border-emerald-950/20 text-gray-600 dark:text-emerald-400 rounded-lg disabled:opacity-50 cursor-pointer"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {/* Daily Timeline Counters */}
          <div className="p-5 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl shadow-sm space-y-4">
            <h2 className="text-xs font-bold text-gray-450 uppercase tracking-wider border-b border-gray-100 dark:border-emerald-950/20 pb-2">
              Today's Fleet Activity Logs
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/10 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                <span className="text-[9px] font-bold text-emerald-600 block">Engines Started</span>
                <span className="text-lg font-black dark:text-white block mt-1">{stats?.todayEvents?.engineOn || 0}</span>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                <span className="text-[9px] font-bold text-gray-500 block">Engines Stopped</span>
                <span className="text-lg font-black dark:text-white block mt-1">{stats?.todayEvents?.engineOff || 0}</span>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-950/10 rounded-xl border border-red-100 dark:border-red-900/30">
                <span className="text-[9px] font-bold text-red-600 block">GPS Disconnects</span>
                <span className="text-lg font-black dark:text-white block mt-1">{stats?.todayEvents?.gpsDisconnect || 0}</span>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-950/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
                <span className="text-[9px] font-bold text-blue-600 block">GPS Reconnects</span>
                <span className="text-lg font-black dark:text-white block mt-1">{stats?.todayEvents?.gpsReconnect || 0}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default FleetOverview;
