import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaTractor, FaGasPump, FaBatteryThreeQuarters, FaCompass, 
  FaClock, FaMapMarkerAlt, FaTools, FaCheckCircle, 
  FaExclamationTriangle, FaShieldAlt, FaPowerOff, FaSignal,
  FaThermometerHalf, FaCoins, FaHistory, FaArrowLeft, FaEye, FaRobot
} from 'react-icons/fa';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';

export const MachineDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [machine, setMachine] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMachineDetail = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/machines/${id}`);
        if (response.data && response.data.success) {
          setMachine(response.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch vehicle dashboard detail:', err);
        toast.error('Failed to load vehicle dashboard.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMachineDetail();
  }, [id]);

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-gray-400 font-bold">
        Loading Vehicle Dashboard...
      </div>
    );
  }

  if (!machine) {
    return (
      <div className="p-6 text-center space-y-4">
        <p className="text-xs text-red-500 font-bold">Vehicle record not found.</p>
        <button
          onClick={() => navigate('/machines')}
          className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
        >
          Back to Vehicles
        </button>
      </div>
    );
  }

  const healthScore = machine.healthScore || 95;
  let healthCategory = 'Healthy';
  let healthColor = 'text-emerald-500 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900/30';
  if (healthScore < 50) {
    healthCategory = 'Critical';
    healthColor = 'text-red-500 bg-red-50 border-red-200 dark:bg-red-950/40 dark:border-red-900/30';
  } else if (healthScore < 75) {
    healthCategory = 'Service Soon';
    healthColor = 'text-orange-500 bg-orange-50 border-orange-200 dark:bg-orange-950/40 dark:border-orange-900/30';
  } else if (healthScore < 90) {
    healthCategory = 'Needs Attention';
    healthColor = 'text-amber-500 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-900/30';
  }

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/machines')}
            className="p-2.5 bg-white dark:bg-[#0e1712] border border-gray-200 dark:border-emerald-950/40 rounded-xl text-gray-500 hover:text-emerald-600 transition-colors"
          >
            <FaArrowLeft className="text-xs" />
          </button>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
              {machine.name}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Registration: <span className="font-mono font-bold text-gray-700 dark:text-gray-200">{machine.registration}</span> | Brand: <span className="font-bold text-emerald-600">{machine.brand || 'AgriTrack'}</span>
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Link
            to="/trip-replay"
            state={{ selectedMachineId: machine._id }}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all"
          >
            <FaHistory /> Trip Replay
          </Link>
          <Link
            to="/expenses/diesel"
            className="px-3.5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all"
          >
            <FaGasPump /> Add Diesel
          </Link>
        </div>
      </div>

      {/* Main Grid Header Card */}
      <div className="bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl p-6 shadow-sm flex flex-col lg:flex-row gap-6 items-center justify-between">
        
        {/* Left: Vehicle Image & Specs */}
        <div className="flex items-center gap-5">
          <div className="w-28 h-28 rounded-2xl bg-gray-100 dark:bg-emerald-950/20 overflow-hidden border border-gray-200 dark:border-emerald-950/40 shrink-0 relative">
            <img 
              src={machine.photo || 'https://images.unsplash.com/photo-1592919505780-303950717480?auto=format&fit=crop&w=800&q=80'} 
              alt={machine.name} 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400">
              {machine.type || 'Tractor'}
            </span>
            <h2 className="text-xl font-black text-gray-900 dark:text-white mt-1">{machine.name}</h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-xs text-gray-500 dark:text-gray-400">
              <div>Brand: <strong className="text-gray-800 dark:text-gray-200">{machine.brand || 'Swaraj'}</strong></div>
              <div>Model: <strong className="text-gray-800 dark:text-gray-200">{machine.model || '735 FE'}</strong></div>
              <div>Engine: <strong className="text-gray-800 dark:text-gray-200">{machine.engineType || 'Integrated'}</strong></div>
              <div>Device ID: <strong className="text-gray-800 dark:text-gray-200 font-mono">{machine.gpsDeviceId ? 'GPS-AGRI-882' : 'GPS-ONLINE'}</strong></div>
            </div>
          </div>
        </div>

        {/* Right: Vehicle Health Score Dial */}
        <div className={`p-4 rounded-2xl border flex items-center gap-4 ${healthColor}`}>
          <div className="text-center">
            <div className="text-3xl font-black">{healthScore}%</div>
            <div className="text-[9px] uppercase tracking-wider font-extrabold mt-0.5">Health Score</div>
          </div>
          <div className="border-l border-current/20 pl-4">
            <div className="text-xs font-bold uppercase">{healthCategory}</div>
            <div className="text-[10px] opacity-80 mt-0.5">Auto-calculated metric</div>
          </div>
        </div>

      </div>

      {/* Color-coded Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-[10px] font-extrabold uppercase text-emerald-600 dark:text-emerald-400">Running State</div>
            <div className="text-sm font-black text-emerald-700 dark:text-emerald-300 mt-1">
              {machine.status === 'Working' ? 'Running' : machine.status}
            </div>
          </div>
          <FaCheckCircle className="text-2xl text-emerald-500" />
        </div>

        <div className="p-4 bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900/40 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-[10px] font-extrabold uppercase text-sky-600 dark:text-sky-400">GPS Link</div>
            <div className="text-sm font-black text-sky-700 dark:text-sky-300 mt-1">Connected</div>
          </div>
          <FaSignal className="text-2xl text-sky-500" />
        </div>

        <div className="p-4 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/40 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-[10px] font-extrabold uppercase text-orange-600 dark:text-orange-400">Engine State</div>
            <div className="text-sm font-black text-orange-700 dark:text-orange-300 mt-1">
              Engine {machine.engineStatus === 'On' ? 'ON' : 'OFF'}
            </div>
          </div>
          <FaPowerOff className="text-2xl text-orange-500" />
        </div>

        <div className="p-4 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/40 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-[10px] font-extrabold uppercase text-purple-600 dark:text-purple-400">Service Status</div>
            <div className="text-sm font-black text-purple-700 dark:text-purple-300 mt-1">
              {machine.serviceStatus || 'Good'}
            </div>
          </div>
          <FaTools className="text-2xl text-purple-500" />
        </div>

      </div>

      {/* Telemetry Metric Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        
        <div className="p-4 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl space-y-1">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <FaCompass className="text-emerald-500" /> Current Speed
          </div>
          <div className="text-lg font-black dark:text-white">{machine.speed || 0} <span className="text-xs font-semibold">km/h</span></div>
        </div>

        <div className="p-4 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl space-y-1">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <FaGasPump className="text-orange-500" /> Remaining Fuel
          </div>
          <div className="text-lg font-black dark:text-white">{machine.remainingDieselLitres || 45} <span className="text-xs font-semibold">L ({machine.fuel || 75}%)</span></div>
        </div>

        <div className="p-4 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl space-y-1">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <FaBatteryThreeQuarters className="text-emerald-500" /> Battery Voltage
          </div>
          <div className="text-lg font-black dark:text-white">{machine.batteryVoltage || 12.6} <span className="text-xs font-semibold">V</span></div>
        </div>

        <div className="p-4 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl space-y-1">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <FaThermometerHalf className="text-red-500" /> Engine Temp
          </div>
          <div className="text-lg font-black dark:text-white">{machine.engineTemp || 85} <span className="text-xs font-semibold">°C</span></div>
        </div>

        <div className="p-4 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl space-y-1">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <FaClock className="text-indigo-500" /> Working Hours
          </div>
          <div className="text-lg font-black dark:text-white">{machine.workingHours || 4.5} <span className="text-xs font-semibold">hrs today</span></div>
        </div>

        <div className="p-4 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl space-y-1">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <FaCoins className="text-emerald-500" /> Today's Expense
          </div>
          <div className="text-lg font-black text-emerald-600">₹{machine.todayExpense || '1,250'}</div>
        </div>

      </div>

      {/* Location and Address Card */}
      <div className="p-5 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-50 dark:bg-red-950/30 text-red-500 rounded-xl">
            <FaMapMarkerAlt className="text-lg" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Current Location</div>
            <div className="text-xs font-bold text-gray-800 dark:text-gray-200 mt-0.5">
              {machine.currentAddress || 'Cheruvupally Village, Madgulapally, Nalgonda, Telangana'}
            </div>
            <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
              Lat: {machine.location?.lat || 17.385}, Lng: {machine.location?.lng || 78.486}
            </div>
          </div>
        </div>

        <Link
          to="/tracking"
          className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-1.5"
        >
          <FaEye /> Live Tracking
        </Link>
      </div>

    </div>
  );
};
export default MachineDashboard;
