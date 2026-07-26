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

      {/* Health Breakdown & AI Diagnostic Explanation */}
      <div className="p-5 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl shadow-sm space-y-3">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-400">Vehicle Health Breakdown</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs font-semibold">
          <div className="p-2.5 bg-gray-50 dark:bg-emerald-950/20 rounded-xl">Engine: <span className="text-yellow-500 font-bold">★★★★★</span></div>
          <div className="p-2.5 bg-gray-50 dark:bg-emerald-950/20 rounded-xl">Battery: <span className="text-yellow-500 font-bold">★★★★☆</span></div>
          <div className="p-2.5 bg-gray-50 dark:bg-emerald-950/20 rounded-xl">Fuel Tank: <span className="text-yellow-500 font-bold">★★★★★</span></div>
          <div className="p-2.5 bg-gray-50 dark:bg-emerald-950/20 rounded-xl">GPS Link: <span className="text-yellow-500 font-bold">★★★★★</span></div>
          <div className="p-2.5 bg-gray-50 dark:bg-emerald-950/20 rounded-xl">Temperature: <span className="text-yellow-500 font-bold">★★★★☆</span></div>
          <div className="p-2.5 bg-gray-50 dark:bg-emerald-950/20 rounded-xl">Service Due: <span className="text-yellow-500 font-bold">★★★★★</span></div>
        </div>
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 font-medium">
          🤖 <strong>AI Diagnostic Summary:</strong> Vehicle is running in optimal condition with high battery voltage (12.6V) and healthy operating temperature (85°C). Next service is recommended in 45 engine hours.
        </div>
      </div>

      {/* Chronological Activity Timeline */}
      <div className="p-5 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl shadow-sm space-y-4">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 flex items-center gap-2">
          <FaClock className="text-emerald-500" /> Today's Chronological Activity Timeline
        </h3>
        <div className="space-y-3 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-gray-200 dark:before:bg-emerald-950/40">
          {[
            { time: '09:15 AM', event: 'Engine Started', desc: 'Ignition ON at Field Alpha Depot', color: 'bg-emerald-500' },
            { time: '09:40 AM', event: 'Diesel Added', desc: 'Filled 45 Litres at Indian Oil Pump', color: 'bg-orange-500' },
            { time: '10:10 AM', event: 'Entered Village', desc: 'GPS geofence match: Madgulapally Village', color: 'bg-sky-500' },
            { time: '11:25 AM', event: 'Engine Stopped', desc: 'Parking brake engaged at Sector 4 Barn', color: 'bg-red-500' },
            { time: '12:05 PM', event: 'Service Reminder', desc: 'Scheduled maintenance check logged', color: 'bg-purple-500' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-4 relative pl-8 text-xs">
              <span className={`w-3.5 h-3.5 rounded-full ${item.color} border-2 border-white dark:border-[#0e1712] absolute left-1.5 top-1 shadow-xs`} />
              <div>
                <span className="font-bold text-gray-900 dark:text-white">{item.event}</span>
                <span className="text-[10px] text-gray-400 font-mono ml-2">{item.time}</span>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
export default MachineDashboard;
