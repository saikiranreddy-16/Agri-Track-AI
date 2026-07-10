import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaTractor, FaCircle, FaGasPump, FaCompass, FaRegCalendarAlt, FaTools, 
  FaPlus, FaCheckCircle, FaExclamationTriangle, FaEye
} from 'react-icons/fa';
import { mockMachines, mockDrivers } from '../data/mockData';
import { PATHS } from '../constants';

export const FleetOverview = () => {
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState('All');

  const totalCount = mockMachines.length;
  const workingCount = mockMachines.filter(m => m.status === 'Working').length;
  const idleCount = mockMachines.filter(m => m.status === 'Idle').length;
  const offlineCount = mockMachines.filter(m => m.status === 'Offline').length;
  const maintenanceCount = mockMachines.filter(m => m.status === 'Maintenance').length;

  const filteredMachines = filterType === 'All' 
    ? mockMachines 
    : mockMachines.filter(m => m.status === filterType);

  const stats = [
    { label: 'Total Fleet', value: totalCount, icon: FaTractor, color: 'text-gray-650 dark:text-gray-300' },
    { label: 'Running', value: workingCount, icon: FaCheckCircle, color: 'text-emerald-500' },
    { label: 'Idle', value: idleCount, icon: FaCircle, color: 'text-orange-500' },
    { label: 'Offline', value: offlineCount, icon: FaExclamationTriangle, color: 'text-red-500' },
    { label: 'Maintenance', value: maintenanceCount, icon: FaTools, color: 'text-purple-550' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
            Fleet Overview
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Status grid and command summary for all registered farming vehicles.
          </p>
        </div>
        
        {/* Quick action buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => navigate(PATHS.TRACKING)}
            className="px-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-xl hover:bg-emerald-100/50 transition-all cursor-pointer"
          >
            Live GPS Tracking Map
          </button>
          <button
            onClick={() => navigate(PATHS.MACHINES)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md cursor-pointer"
          >
            <FaPlus className="text-xs" /> Register New Machine
          </button>
        </div>
      </div>

      {/* Fleet Stats Overview Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.label} 
              onClick={() => {
                if (stat.label === 'Running') setFilterType('Working');
                else if (stat.label === 'Idle') setFilterType('Idle');
                else if (stat.label === 'Offline') setFilterType('Offline');
                else if (stat.label === 'Maintenance') setFilterType('Maintenance');
                else setFilterType('All');
              }}
              className="p-5 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-between cursor-pointer"
            >
              <div>
                <span className="text-[10px] font-bold text-gray-400 dark:text-emerald-500/80 uppercase block tracking-wider">
                  {stat.label}
                </span>
                <span className="text-2xl font-black mt-1 block dark:text-white">
                  {stat.value}
                </span>
              </div>
              <Icon className={`text-2xl ${stat.color}`} />
            </div>
          );
        })}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-emerald-950/20 pb-1 overflow-x-auto custom-scrollbar">
        {['All', 'Working', 'Idle', 'Offline', 'Maintenance'].map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-4 py-2 text-xs font-bold transition-all relative shrink-0 cursor-pointer ${
              filterType === t 
                ? 'text-emerald-600 dark:text-emerald-400 font-extrabold' 
                : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            {t === 'Working' ? 'Running' : t} Assets
            {filterType === t && (
              <motion.div 
                layoutId="activeTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 dark:bg-emerald-400"
              />
            )}
          </button>
        ))}
      </div>

      {/* Machines Listing */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMachines.map((machine) => {
          const driver = mockDrivers.find(d => d.id === machine.assignedDriverId);
          return (
            <motion.div
              layout
              key={machine.id}
              className="bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden"
            >
              {/* Photo Header */}
              <div className="h-40 bg-gray-100 relative overflow-hidden">
                <img 
                  src={machine.photo} 
                  alt={machine.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1592919505780-303950717480?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                
                {/* Status Badge */}
                <span className={`absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase shadow-sm ${
                  machine.status === 'Working'
                    ? 'bg-emerald-500 text-white'
                    : machine.status === 'Idle'
                    ? 'bg-orange-500 text-white'
                    : machine.status === 'Offline'
                    ? 'bg-red-500 text-white'
                    : 'bg-purple-600 text-white'
                }`}>
                  {machine.status === 'Working' ? 'Running' : machine.status}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">
                    {machine.type} &bull; {machine.brand}
                  </span>
                  <h3 className="text-base font-bold dark:text-white mt-1">
                    {machine.name}
                  </h3>
                  <p className="text-[11px] text-gray-400 font-semibold mt-0.5">
                    Reg: {machine.registration}
                  </p>

                  <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                      <FaGasPump className="text-gray-400" />
                      <span>Fuel: {machine.fuel}%</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                      <FaCompass className="text-gray-400" />
                      <span>Speed: {machine.speed} km/h</span>
                    </div>
                    <div className="col-span-2 flex items-center gap-2 text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-emerald-950/20 pt-2.5">
                      <span className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Driver:</span>
                      <span className="font-semibold text-gray-700 dark:text-gray-200">
                        {driver ? driver.name : 'Unassigned'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-gray-100 dark:border-emerald-950/20 flex gap-2">
                  <Link
                    to={`/machines/${machine.id}`}
                    className="flex-1 flex justify-center items-center gap-1.5 py-2 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 hover:bg-emerald-100/50 transition-colors"
                  >
                    <FaEye /> View Details
                  </Link>
                  <button
                    onClick={() => navigate(PATHS.TRACKING, { state: { locateMachineId: machine.id } })}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center"
                    title="Track on Map"
                  >
                    <FaCompass />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

    </div>
  );
};
export default FleetOverview;
