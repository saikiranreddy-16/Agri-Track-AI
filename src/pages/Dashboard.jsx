import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  BarChart, Bar, LineChart, Line, Legend
} from 'recharts';
import { 
  FaTractor, FaUserTie, FaMap, FaExclamationTriangle, 
  FaGasPump, FaClock, FaRoute, FaArrowRight, FaTasks, FaPlus,
  FaChartBar, FaTools, FaRobot
} from 'react-icons/fa';
import { mockMachines, mockCustomers } from '../data/mockData';
import { useUIState } from '../context/UIStateContext';
import { PATHS } from '../constants';
import { useAuth } from '../context/AuthContext';

const areaData = [
  { day: 'Mon', acres: 210, fuel: 140 },
  { day: 'Tue', acres: 280, fuel: 180 },
  { day: 'Wed', acres: 260, fuel: 165 },
  { day: 'Thu', acres: 340, fuel: 210 },
  { day: 'Fri', acres: 390, fuel: 240 },
  { day: 'Sat', acres: 410, fuel: 260 },
  { day: 'Sun', acres: 120, fuel: 90 },
];

export const Dashboard = () => {
  const { alerts, globalSearchQuery } = useUIState();
  const navigate = useNavigate();

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Working':
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/45 dark:text-emerald-400 border border-emerald-250 dark:border-emerald-900/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </span>
        );
      case 'Idle':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-yellow-50 text-yellow-700 dark:bg-yellow-950/45 dark:text-yellow-400 border border-yellow-250 dark:border-yellow-900/30">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
            Idle
          </span>
        );
      case 'Offline':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 dark:bg-red-950/45 dark:text-red-400 border border-red-250 dark:border-red-900/30">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            Offline
          </span>
        );
      case 'Replaced':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/45 dark:text-blue-400 border border-blue-250 dark:border-blue-900/30">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Replaced
          </span>
        );
      case 'Maintenance':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-700 dark:bg-orange-950/45 dark:text-orange-400 border border-orange-250 dark:border-orange-900/30">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            Maint.
          </span>
        );
      default:
        return null;
    }
  };

  const { user } = useAuth();
  const isCompanyAdmin = user?.role === 'Company Admin';

  // Dynamic calculations based on mock data
  const totalMachines = mockMachines.length;
  const activeMachines = mockMachines.filter(m => m.status === 'Working' || m.status === 'Idle').length;
  const offlineMachines = mockMachines.filter(m => m.status === 'Offline').length;
  const workingMachines = mockMachines.filter(m => m.status === 'Working').length;
  const maintenanceMachines = mockMachines.filter(m => m.status === 'Maintenance').length;
  
  const totalAreaCovered = 582; // hectares
  const totalFuelUsed = 3180; // Litres
  const totalHoursWorked = 24.9; // hrs

  // Filtering based on global search query
  const filteredMachines = mockMachines.filter(m => 
    m.name.toLowerCase().includes(globalSearchQuery.toLowerCase()) || 
    m.type.toLowerCase().includes(globalSearchQuery.toLowerCase())
  );

  const filteredCustomers = mockCustomers.filter(c => 
    c.name.toLowerCase().includes(globalSearchQuery.toLowerCase()) || 
    c.company.toLowerCase().includes(globalSearchQuery.toLowerCase())
  );

  const stats = [
    { title: 'Total Machines', value: totalMachines, sub: `${activeMachines} Active`, icon: FaTractor, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20' },
    { title: 'Working Machines', value: workingMachines, sub: `${activeMachines - workingMachines} Idle, ${maintenanceMachines} Maint.`, icon: FaTractor, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' },
    { title: 'Offline Machines', value: offlineMachines, sub: 'Needs Inspection', icon: FaExclamationTriangle, color: 'text-red-500 bg-red-50 dark:bg-red-950/20' },
    { title: 'Farms Connected', value: '3 Farms', sub: 'Ludhiana Sector', icon: FaMap, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/20' },
    { title: 'Area Covered Today', value: `${totalAreaCovered} ha`, sub: '+12% from yesterday', icon: FaMap, color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/20' },
    { title: 'Fuel Used Today', value: `${totalFuelUsed} L`, sub: 'Avg 5.4 L/ha', icon: FaGasPump, color: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950/20' },
    { title: 'Working Hours Today', value: `${totalHoursWorked} hrs`, sub: 'Avg 8.3 hrs/vehicle', icon: FaClock, color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/20' },
    { title: 'Recent Warnings', value: alerts.filter(a => a.status === 'Active').length, sub: 'Active GPS alerts', icon: FaExclamationTriangle, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20' }
  ];

  const quickActions = isCompanyAdmin
    ? [
        { name: 'Customer Management', path: PATHS.CUSTOMER_MANAGEMENT, icon: FaUserTie, bgClass: 'bg-emerald-500 shadow-emerald-500/20 shadow-md' },
        { name: 'Device Activation', path: PATHS.DEVICE_ACTIVATION, icon: FaTractor, bgClass: 'bg-blue-500 shadow-blue-500/20 shadow-md' },
        { name: 'Device Replacement', path: PATHS.DEVICE_REPLACEMENT, icon: FaTools, bgClass: 'bg-red-500 shadow-red-500/20 shadow-md' },
        { name: 'Live Tracking', path: PATHS.TRACKING, icon: FaRoute, bgClass: 'bg-indigo-500 shadow-indigo-500/20 shadow-md' },
        { name: 'Reports', path: PATHS.REPORTS, icon: FaChartBar, bgClass: 'bg-amber-500 shadow-amber-500/20 shadow-md' },
        { name: 'AI Assistant', path: PATHS.AI_ASSISTANT, icon: FaRobot, bgClass: 'bg-teal-500 shadow-teal-500/20 shadow-md' }
      ]
    : [
        { name: 'My Vehicles', path: PATHS.MACHINES, icon: FaTractor, bgClass: 'bg-amber-500 shadow-amber-500/20 shadow-md' },
        { name: 'Live Tracking', path: PATHS.TRACKING, icon: FaRoute, bgClass: 'bg-blue-500 shadow-blue-500/20 shadow-md' },
        { name: 'Reports', path: PATHS.REPORTS, icon: FaChartBar, bgClass: 'bg-indigo-500 shadow-indigo-500/20 shadow-md' },
        { name: 'Maintenance', path: PATHS.MAINTENANCE, icon: FaTools, bgClass: 'bg-red-500 shadow-red-500/20 shadow-md' },
        { name: 'AI Assistant', path: PATHS.AI_ASSISTANT, icon: FaRobot, bgClass: 'bg-teal-500 shadow-teal-500/20 shadow-md' }
      ];

  // Activities Feed
  const recentActivities = [
    { id: 1, text: 'Mahindra tractor completed daily route checklist', time: '10 mins ago', type: 'System' },
    { id: 2, text: 'John Deere 8R fuel dropped below 15%', time: '15 mins ago', type: 'Alert' },
    { id: 3, text: 'Swaraj 963 FE oil pressure nominal', time: '1 hour ago', type: 'System' },
    { id: 4, text: 'Harvester active telemetry ping success', time: '3 hours ago', type: 'GPS' },
    { id: 5, text: 'Massey Ferguson registered Engine Temp alert', time: '4 hours ago', type: 'Alert' }
  ];

  const recentlyActiveMachines = mockMachines.slice(0, 4);
  const recentLogins = [
    { name: 'Gurpreet Singh', role: 'Farm Admin', device: 'OnePlus 11 5G (Android)', time: 'Today, 10:14 AM' },
    { name: 'Ramesh Kumar', role: 'Farm Admin', device: 'Chrome (Windows 11)', time: 'Today, 08:30 AM' },
    { name: 'Sanjay Reddy', role: 'AgriTrack Admin', device: 'Safari (MacBook Pro)', time: 'Yesterday, 04:30 PM' }
  ];
  const recentActivations = [
    { deviceId: 'dev-982312', vehicle: 'Mahindra Novo 7DI', chassis: 'CH-NO-755', customer: 'Singh Agrotech', date: '2026-07-12' },
    { deviceId: 'dev-483920', vehicle: 'TAFE Orchard 30', chassis: 'CH-TF-30D', customer: 'Patel Horticulture', date: '2026-07-10' }
  ];
  const recentReplacements = [
    { vehicle: 'Swaraj 963 FE', oldDevice: 'dev-mach-2-old', newDevice: 'dev-mach-2', reason: 'GPS Antenna Fail', date: '2026-07-11' },
    { vehicle: 'Sonalika Tiger DI', oldDevice: 'dev-mach-3-old', newDevice: 'dev-mach-3', reason: 'Battery Leak', date: '2026-07-09' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
            Farm Operations Dashboard
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Real-time fleet tracking, statistics and active field jobs overview.
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => navigate(PATHS.TRACKING)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 rounded-xl hover:bg-emerald-100/50 transition-all cursor-pointer"
          >
            <FaRoute className="text-sm" />
            Live Map Track
          </button>
          <button 
            onClick={() => navigate(PATHS.JOBS)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md cursor-pointer"
          >
            <FaPlus className="text-xs" />
            Dispatch Job
          </button>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl p-5 shadow-sm">
        <h2 className="text-xs font-bold text-gray-450 dark:text-emerald-500/80 uppercase tracking-wider mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.name}
                to={action.path}
                className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-emerald-950/10 border border-gray-100 dark:border-emerald-950/20 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:border-emerald-500/30 group transition-all text-center cursor-pointer shadow-sm hover:shadow"
              >
                <div className={`p-3 rounded-lg mb-2.5 transition-all group-hover:scale-110 ${action.bgClass} text-white`}>
                  <Icon className="text-lg" />
                </div>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {action.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-5 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl shadow-sm hover:shadow-md transition-all flex justify-between items-start"
            >
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-gray-400 dark:text-emerald-500/80 uppercase tracking-wider block">
                  {stat.title}
                </span>
                <span className="text-2xl font-black dark:text-white block">
                  {stat.value}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium block">
                  {stat.sub}
                </span>
              </div>
              <div className={`p-3.5 rounded-xl ${stat.color} shrink-0`}>
                <Icon className="text-xl" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Global search details panel */}
      {globalSearchQuery && (
        <div className="bg-white dark:bg-[#0e1712] p-5 rounded-2xl border border-emerald-100 dark:border-emerald-950/30 space-y-4">
          <h2 className="text-sm font-bold text-emerald-800 dark:text-emerald-400">Search Results matching "{globalSearchQuery}"</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Matching Vehicles ({filteredMachines.length})</h3>
              {filteredMachines.length === 0 ? <p className="text-xs text-gray-400">No vehicles found.</p> : (
                filteredMachines.map(m => (
                  <div key={m.id} className="p-2 border border-gray-100 dark:border-emerald-950/20 rounded-xl text-xs flex justify-between items-center">
                    <span className="font-semibold">{m.name}</span>
                    <Link to={`/machines/${m.id}`} className="text-emerald-600 font-bold hover:underline">View</Link>
                  </div>
                ))
              )}
            </div>
            {isCompanyAdmin ? (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Matching Customers ({filteredCustomers.length})</h3>
                {filteredCustomers.length === 0 ? <p className="text-xs text-gray-400">No customers found.</p> : (
                  filteredCustomers.map(c => (
                    <div key={c.id} className="p-2 border border-gray-100 dark:border-emerald-950/20 rounded-xl text-xs flex justify-between items-center">
                      <span className="font-semibold">{c.name}</span>
                      <Link to={`/customers/${c.id}`} className="text-emerald-600 font-bold hover:underline">View Profile</Link>
                    </div>
                  ))
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Main Charts & Feeds Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Productivity & Fuel Trends (Chart) */}
        <div className="lg:col-span-2 p-5 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-base font-bold dark:text-white">Weekly Productivity & Fuel</h2>
              <p className="text-xs text-gray-400">Hectares harvested vs total fuel burned.</p>
            </div>
            <div className="flex gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-emerald-600">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" /> Area (Hectares)
              </span>
              <span className="flex items-center gap-1.5 text-orange-500">
                <span className="w-2.5 h-2.5 bg-orange-500 rounded-full" /> Fuel (Liters)
              </span>
            </div>
          </div>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAcres" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorFuel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                  labelStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                  itemStyle={{ fontSize: '11px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="acres" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAcres)" />
                <Area type="monotone" dataKey="fuel" stroke="#f97316" strokeWidth={2.5} fillOpacity={1} fill="url(#colorFuel)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Active Warnings Panel */}
        <div className="p-5 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-bold dark:text-white">Active Alerts</h2>
            <Link to={PATHS.ALERTS} className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-64 pr-1 custom-scrollbar">
            {alerts.filter(a => a.status === 'Active').slice(0, 4).map((alert) => (
              <div
                key={alert.id}
                className="p-3.5 bg-orange-50/20 dark:bg-orange-950/10 border border-orange-100/50 dark:border-orange-900/30 rounded-xl flex gap-3 items-start"
              >
                <FaExclamationTriangle className="text-orange-500 text-base shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-gray-900 dark:text-white">
                      {alert.type}
                    </span>
                    <span className="text-[9px] text-gray-400 font-medium">{alert.time}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-normal">{alert.message}</p>
                </div>
              </div>
            ))}
            {alerts.filter(a => a.status === 'Active').length === 0 && (
              <div className="text-center py-12 text-xs text-gray-400">All machines running smoothly.</div>
            )}
          </div>
        </div>

      </div>

      {/* Grid: Recent Job Schedules & Activities Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Telemetry Status Widget */}
        <div className="lg:col-span-2 p-5 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-bold dark:text-white">Active Vehicle Telemetry</h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-350">
              All Systems Nominal
            </span>
          </div>

          <div className="space-y-4">
            {mockMachines.slice(0, 3).map((machine) => {
              const gpsStatus = machine.status === 'Offline' ? 'Offline' : 'Online';
              const pingTime = machine.status === 'Offline' ? '18 hrs ago' : 'Active';
              const simStatus = machine.status === 'Maintenance' ? 'Suspended' : 'Active';
              
              return (
                <div key={machine.id} className="p-3 bg-gray-50 dark:bg-emerald-950/10 rounded-xl border border-gray-100 dark:border-emerald-950/20">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xs font-bold dark:text-white">{machine.name}</h3>
                      <span className="text-[10px] text-gray-400">
                        Kit ID: KIT-{machine.id.toUpperCase()} &bull; SIM Status: {simStatus}
                      </span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      gpsStatus === 'Offline' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-600'
                    }`}>
                      {pingTime}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="p-5 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl shadow-sm flex flex-col justify-between">
          <h2 className="text-base font-bold mb-4 dark:text-white">Recent Activities</h2>
          
          <div className="space-y-3.5">
            {recentActivities.map((act) => (
              <div key={act.id} className="flex items-start gap-3 text-xs leading-normal">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                <div className="flex-1">
                  <p className="text-gray-700 dark:text-gray-300 font-medium">{act.text}</p>
                  <span className="text-[9px] text-gray-400 font-medium block mt-0.5">{act.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Dynamic Activity Overview Rows */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Recently Active Vehicles */}
        <div className="p-5 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-gray-405 uppercase tracking-wider">Recently Active Vehicles</h3>
          <div className="space-y-3">
            {recentlyActiveMachines.map(m => (
              <div key={m.id} className="flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold dark:text-white block">{m.name}</span>
                  <span className="text-[10px] text-gray-400">{m.registration}</span>
                </div>
                {renderStatusBadge(m.status)}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Logins */}
        <div className="p-5 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-gray-405 uppercase tracking-wider">Recent Access Logins</h3>
          <div className="space-y-3">
            {recentLogins.map((l, idx) => (
              <div key={idx} className="text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold dark:text-white">{l.name}</span>
                  <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">{l.role}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-gray-400 mt-1">
                  <span>{l.device}</span>
                  <span className="font-medium text-gray-400">{l.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Device Activations */}
        <div className="p-5 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-gray-405 uppercase tracking-wider">Recent GPS Onboardings</h3>
          <div className="space-y-3">
            {recentActivations.map((a, idx) => (
              <div key={idx} className="text-xs">
                <div className="flex justify-between items-center font-bold">
                  <span className="dark:text-white">{a.vehicle}</span>
                  <span className="text-orange-500 font-mono">{a.deviceId}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-gray-400 mt-1">
                  <span>Chassis: {a.chassis}</span>
                  <span>{a.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Device Replacements */}
        <div className="p-5 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-gray-405 uppercase tracking-wider">Recent Device Replacements</h3>
          <div className="space-y-3">
            {recentReplacements.map((r, idx) => (
              <div key={idx} className="text-xs">
                <div className="font-bold dark:text-white">{r.vehicle}</div>
                <div className="text-[10px] text-gray-400 mt-1">
                  <div>Reason: <span className="text-orange-400 font-bold">{r.reason}</span></div>
                  <div className="flex justify-between items-center text-[9px] mt-1 text-gray-405">
                    <span>{r.oldDevice} &rarr; {r.newDevice}</span>
                    <span>{r.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};
export default Dashboard;
