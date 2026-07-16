import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  FaUser, FaMap, FaTractor, FaShieldAlt, FaHistory, FaChevronLeft, 
  FaCheckCircle, FaBan, FaCalendarAlt, FaEnvelope, FaMobileAlt, FaBuilding,
  FaRoad, FaGasPump, FaClock, FaChartArea
} from 'react-icons/fa';
import { mockCustomers } from '../data/mockData';
import { PATHS } from '../constants';

export const CustomerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Find customer by id, fallback to first mock customer
    const found = mockCustomers.find(c => c.id === id) || mockCustomers[0];
    const timer = setTimeout(() => {
      setCustomer(found);
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [id]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-40 bg-gray-200 dark:bg-emerald-950/15 rounded animate-pulse" />
        <div className="h-44 bg-gray-250 dark:bg-emerald-950/10 rounded-3xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 bg-gray-200 dark:bg-emerald-950/5 rounded-3xl animate-pulse md:col-span-2" />
          <div className="h-64 bg-gray-200 dark:bg-emerald-950/5 rounded-3xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-bold">Customer Account Not Found</h2>
        <button onClick={() => navigate(PATHS.CUSTOMER_MANAGEMENT)} className="px-4 py-2 bg-emerald-600 text-white rounded-xl">
          Back to List
        </button>
      </div>
    );
  }

  // Color coded status badges
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Working':
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/45 dark:text-emerald-450 border border-emerald-250 dark:border-emerald-900/35">
            <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </span>
        );
      case 'Idle':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-50 text-yellow-700 dark:bg-yellow-950/45 dark:text-yellow-450 border border-yellow-250 dark:border-yellow-900/30">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
            Idle
          </span>
        );
      case 'Offline':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 dark:bg-red-950/45 dark:text-red-400 border border-red-250 dark:border-red-900/30">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            Offline
          </span>
        );
      case 'Replaced':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/45 dark:text-blue-400 border border-blue-250 dark:border-blue-900/30">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Replaced
          </span>
        );
      case 'Maintenance':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-700 dark:bg-orange-950/45 dark:text-orange-400 border border-orange-250 dark:border-orange-900/30">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            Maint.
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-50 text-gray-700 dark:bg-emerald-950/30 dark:text-gray-400 border border-gray-250">
            {status}
          </span>
        );
    }
  };

  const statCards = [
    { title: 'Total Farms', value: customer.farmsCount, icon: FaMap, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20' },
    { title: 'Vehicles Connected', value: customer.vehiclesCount, icon: FaTractor, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' },
    { title: 'Total Distance', value: '4,820 km', icon: FaRoad, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/20' },
    { title: 'Fuel Consumed', value: '1,240 L', icon: FaGasPump, color: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950/20' },
    { title: 'Working Hours', value: '186.4 hrs', icon: FaClock, color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/20' },
    { title: 'Area Covered', value: '824.5 ha', icon: FaChartArea, color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/20' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header & Back Action */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(PATHS.CUSTOMER_MANAGEMENT)}
          className="p-2.5 bg-white dark:bg-emerald-950/20 border border-gray-200 dark:border-emerald-900/30 rounded-xl text-xs hover:bg-gray-100 transition-colors"
        >
          <FaChevronLeft />
        </button>
        <div>
          <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">Customer Profile</span>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            {customer.name}
            {renderStatusBadge(customer.status)}
          </h1>
        </div>
      </div>

      {/* Customer Info Card */}
      <div className="p-6 bg-white dark:bg-[#0e1712] border border-gray-150 dark:border-emerald-950/20 rounded-3xl shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 text-xs">
          <div>
            <span className="font-bold text-gray-400 uppercase tracking-wider block mb-1">Company / Group</span>
            <div className="flex items-center gap-1.5 font-bold text-gray-700 dark:text-gray-250">
              <FaBuilding className="text-emerald-500 shrink-0" />
              {customer.company}
            </div>
          </div>
          <div>
            <span className="font-bold text-gray-400 uppercase tracking-wider block mb-1">Mobile Number</span>
            <div className="flex items-center gap-1.5 font-bold text-gray-700 dark:text-gray-250">
              <FaMobileAlt className="text-emerald-500 shrink-0" />
              {customer.phone}
            </div>
          </div>
          <div>
            <span className="font-bold text-gray-400 uppercase tracking-wider block mb-1">Email Address</span>
            <div className="flex items-center gap-1.5 font-bold text-gray-700 dark:text-gray-250">
              <FaEnvelope className="text-emerald-500 shrink-0" />
              {customer.email}
            </div>
          </div>
          <div>
            <span className="font-bold text-gray-400 uppercase tracking-wider block mb-1">Plan & Billing</span>
            <span className="px-2 py-0.5 rounded font-black uppercase text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              {customer.subscriptionPlan}
            </span>
          </div>
        </div>
        <div className="text-[10px] text-gray-450 shrink-0">
          <span className="flex items-center gap-1">
            <FaCalendarAlt />
            Last Active: {new Date(customer.lastLogin).toLocaleDateString()} {new Date(customer.lastLogin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Customer Statistics panel */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="p-4 bg-white dark:bg-[#0e1712] border border-gray-150 dark:border-emerald-950/20 rounded-2xl shadow-sm flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${card.color} shrink-0`}>
                <Icon className="text-base" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block leading-none">{card.title}</span>
                <span className="text-sm font-black dark:text-white block leading-none">{card.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Farms & Vehicles and Devices & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Connected Farms & Vehicles */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Farm Information */}
          <div className="p-5 bg-white dark:bg-[#0e1712] border border-gray-150 dark:border-emerald-950/20 rounded-3xl shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gray-450 uppercase tracking-wider flex items-center gap-2">
              <FaMap className="text-emerald-500" />
              Farm Information
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {customer.farms.map((farm, idx) => (
                <div key={idx} className="p-4 bg-gray-50 dark:bg-emerald-950/10 border border-gray-100 dark:border-emerald-950/15 rounded-2xl flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-black dark:text-white">{farm.name}</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">Crop: {farm.crop} &bull; Region: {farm.region}</p>
                  </div>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-3 block">{farm.size}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Connected Vehicles */}
          <div className="p-5 bg-white dark:bg-[#0e1712] border border-gray-150 dark:border-emerald-950/20 rounded-3xl shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gray-450 uppercase tracking-wider flex items-center gap-2">
              <FaTractor className="text-emerald-500" />
              Registered Vehicles & GPS Kits
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {customer.vehicles.map((vehicle) => {
                let gpsStatus = 'Online';
                let lastPing = '2 mins ago';
                let simStatus = 'Active';
                
                if (vehicle.status === 'Offline') {
                  gpsStatus = 'Offline';
                  lastPing = '18 hours ago';
                  simStatus = 'Active';
                } else if (vehicle.status === 'Maintenance') {
                  gpsStatus = 'Replacement Pending';
                  lastPing = '2 days ago';
                  simStatus = 'Suspended';
                }
                
                const gpsKitId = 'KIT-' + vehicle.id.toUpperCase();
                
                return (
                  <div key={vehicle.id} className="p-4 bg-gray-50 dark:bg-emerald-950/10 border border-gray-100 dark:border-emerald-950/15 rounded-2xl flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-[8px] uppercase font-black text-orange-500 bg-orange-500/10 px-1.5 py-0.5 rounded">
                          {vehicle.type}
                        </span>
                        <span className="text-[10px] font-mono text-gray-450">{vehicle.id}</span>
                      </div>
                      <h4 className="text-xs font-black dark:text-white leading-tight mt-1.5">{vehicle.name}</h4>
                    </div>
                    
                    {/* GPS Kit Telemetry Panel */}
                    <div className="p-2.5 bg-white dark:bg-emerald-950/20 rounded-xl border border-gray-100 dark:border-emerald-950/30 text-[10px] space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-gray-400 font-bold uppercase tracking-wider text-[8px]">GPS Kit ID</span>
                        <span className="font-mono text-gray-700 dark:text-gray-300 font-black">{gpsKitId}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 font-bold uppercase tracking-wider text-[8px]">SIM Status</span>
                        <span className={`px-1 rounded-sm text-[8px] font-black uppercase ${
                          simStatus === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-750'
                        }`}>{simStatus}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 font-bold uppercase tracking-wider text-[8px]">Last GPS Ping</span>
                        <span className="font-semibold text-gray-600 dark:text-gray-450">{lastPing}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2.5 border-t border-gray-150 dark:border-emerald-950/10">
                      <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Kit Status</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                        gpsStatus === 'Online' ? 'bg-emerald-50 text-emerald-700 border border-emerald-250 dark:bg-emerald-950/40 dark:text-emerald-400' :
                        gpsStatus === 'Offline' ? 'bg-red-50 text-red-700 border border-red-250 dark:bg-red-950/40 dark:text-red-400' :
                        'bg-orange-50 text-orange-700 border border-orange-250 dark:bg-orange-950/40 dark:text-orange-400'
                      }`}>
                        {gpsStatus}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Side: GPS Devices & Activities */}
        <div className="space-y-6">
          
          {/* GPS Telemetry Devices */}
          <div className="p-5 bg-white dark:bg-[#0e1712] border border-gray-150 dark:border-emerald-950/20 rounded-3xl shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gray-450 uppercase tracking-wider flex items-center gap-2">
              <FaShieldAlt className="text-emerald-500" />
              GPS Devices Registry
            </h3>

            <div className="space-y-3">
              {customer.devices.map((device) => (
                <div key={device.id} className="p-3 bg-gray-50/50 dark:bg-emerald-950/10 border border-gray-150 dark:border-emerald-950/15 rounded-2xl flex justify-between items-center text-xs">
                  <div>
                    <div className="font-extrabold dark:text-white">{device.name}</div>
                    <div className="text-[10px] text-gray-450 mt-0.5">ID: {device.id} &bull; Firmware: {device.firmware}</div>
                  </div>
                  {renderStatusBadge(device.status)}
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity Timeline */}
          <div className="p-5 bg-white dark:bg-[#0e1712] border border-gray-150 dark:border-emerald-950/20 rounded-3xl shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gray-450 uppercase tracking-wider flex items-center gap-2">
              <FaHistory className="text-emerald-500" />
              Recent Activity logs
            </h3>

            <div className="space-y-4 pr-1">
              {customer.recentActivities.map((act, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs leading-normal">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-700 dark:text-gray-300">{act.action}</p>
                    <div className="flex justify-between items-center text-[9px] text-gray-450 mt-0.5">
                      <span>By: {act.user}</span>
                      <span>{act.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default CustomerProfile;
