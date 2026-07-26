import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaTractor, FaGasPump, FaClock, FaRoute, FaArrowRight, 
  FaTools, FaRobot, FaSun, FaCloudSun, FaCloudRain, FaCheckCircle,
  FaExclamationTriangle, FaBell, FaCoins, FaCalendarAlt, FaFileContract
} from 'react-icons/fa';
import { mockMachines } from '../data/mockData';
import { useUIState } from '../context/UIStateContext';
import { PATHS } from '../constants';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { alerts, notifications } = useUIState();

  const [weather] = useState({ temp: '28°C', condition: 'Sunny & Clear', humidity: '55%', location: 'Nalgonda, Telangana' });
  const [proactiveRecommendations] = useState([
    {
      id: 1,
      title: 'Fuel Usage Increase',
      message: 'Fuel consumption on Swaraj 735 FE increased by 12% today. Check tyre pressure & air filter.',
      type: 'Warning',
      icon: FaGasPump,
      color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900/40',
    },
    {
      id: 2,
      title: 'Service Due Soon',
      message: 'John Deere 5042D is due for engine oil service in 8 working hours.',
      type: 'Info',
      icon: FaTools,
      color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900/40',
    },
    {
      id: 3,
      title: 'Weather Forecast Alert',
      message: 'Light rain expected in Nalgonda farm sector around 03:30 PM today.',
      type: 'Info',
      icon: FaCloudRain,
      color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-900/40',
    },
  ]);

  const isCompanyAdmin = user?.role === 'Company Admin';

  useEffect(() => {
    if (isCompanyAdmin) {
      navigate('/fleet');
    }
  }, [isCompanyAdmin, navigate]);

  const totalVehicles = mockMachines.length;
  const runningVehicles = mockMachines.filter((m) => m.status === 'Working').length;
  const idleVehicles = mockMachines.filter((m) => m.status === 'Idle').length;
  const offlineVehicles = mockMachines.filter((m) => m.status === 'Offline').length;

  const quickActions = [
    { name: 'My Vehicles', path: PATHS.MACHINES, icon: FaTractor, bgClass: 'bg-emerald-600' },
    { name: 'Live Tracking', path: PATHS.TRACKING, icon: FaRoute, bgClass: 'bg-blue-600' },
    { name: 'AI Assistant', path: PATHS.AI_ASSISTANT, icon: FaRobot, bgClass: 'bg-teal-600' },
    { name: 'Diesel Expenses', path: PATHS.DIESEL_EXPENSES, icon: FaGasPump, bgClass: 'bg-orange-500' },
    { name: 'Service Expenses', path: PATHS.SERVICE_EXPENSES, icon: FaTools, bgClass: 'bg-purple-600' },
    { name: 'Reports', path: PATHS.REPORTS, icon: FaFileContract, bgClass: 'bg-indigo-600' },
  ];

  return (
    <div className="space-y-6">
      
      {/* 👋 Welcome & Weather Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 text-white rounded-3xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
            <FaCalendarAlt /> {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">
            Welcome back, {user?.name || 'Farmer'} 👋
          </h1>
          <p className="text-xs text-emerald-100/80 mt-1 max-w-lg">
            Here is your daily Smart Fleet overview, proactive AI diagnostics, and live vehicle status.
          </p>
        </div>

        {/* Live Weather Widget */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center gap-4 shrink-0">
          <FaSun className="text-3xl text-yellow-300 animate-spin-slow" />
          <div className="text-xs">
            <div className="text-lg font-black">{weather.temp}</div>
            <div className="font-semibold text-emerald-100">{weather.condition}</div>
            <div className="text-[10px] opacity-75">{weather.location}</div>
          </div>
        </div>
      </div>

      {/* 🤖 Proactive AI Operational Recommendations */}
      <div className="space-y-3">
        <h2 className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-emerald-500 flex items-center gap-1.5">
          <FaRobot className="text-emerald-500" /> Today's AI Smart Recommendations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {proactiveRecommendations.map((rec) => {
            const Icon = rec.icon;
            return (
              <div key={rec.id} className={`p-4 rounded-2xl border flex items-start gap-3 shadow-xs ${rec.color}`}>
                <Icon className="text-lg shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <span className="font-extrabold block">{rec.title}</span>
                  <p className="leading-relaxed opacity-90">{rec.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Action Grid */}
      <div className="bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl p-5 shadow-sm space-y-4">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-400">Quick Actions (Max 3 Clicks)</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickActions.map((act) => {
            const Icon = act.icon;
            return (
              <Link
                key={act.name}
                to={act.path}
                className="p-4 bg-gray-50 dark:bg-emerald-950/10 border border-gray-100 dark:border-emerald-950/20 rounded-2xl hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 transition-all flex flex-col items-center justify-center text-center gap-2 group cursor-pointer"
              >
                <div className={`p-3 rounded-xl text-white ${act.bgClass} shadow-md group-hover:scale-110 transition-transform`}>
                  <Icon className="text-lg" />
                </div>
                <span className="text-xs font-bold dark:text-white group-hover:text-emerald-600 transition-colors">{act.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Fleet Overview Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        
        <div className="p-4 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl space-y-1">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Fleet</div>
          <div className="text-xl font-black dark:text-white">{totalVehicles}</div>
        </div>

        <div className="p-4 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl space-y-1">
          <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Running</div>
          <div className="text-xl font-black text-emerald-600">{runningVehicles}</div>
        </div>

        <div className="p-4 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl space-y-1">
          <div className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">Idle</div>
          <div className="text-xl font-black text-orange-500">{idleVehicles}</div>
        </div>

        <div className="p-4 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl space-y-1">
          <div className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Offline</div>
          <div className="text-xl font-black text-red-500">{offlineVehicles}</div>
        </div>

        <div className="p-4 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl space-y-1">
          <div className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Service Due</div>
          <div className="text-xl font-black text-purple-600">1</div>
        </div>

        <div className="p-4 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl space-y-1">
          <div className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">Diesel Today</div>
          <div className="text-xl font-black text-orange-600">₹4,820</div>
        </div>

        <div className="p-4 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl space-y-1">
          <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Notifications</div>
          <div className="text-xl font-black text-blue-600">{notifications.length || 3}</div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
