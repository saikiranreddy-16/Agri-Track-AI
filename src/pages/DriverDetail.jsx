import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Legend
} from 'recharts';
import { 
  FaChevronLeft, FaUserTie, FaPhone, FaAward, FaCalendarCheck, 
  FaClock, FaMap, FaGasPump, FaStar, FaTractor 
} from 'react-icons/fa';
import { mockDrivers, mockMachines } from '../data/mockData';
import { PATHS } from '../constants';

export const DriverDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const driver = mockDrivers.find(d => d.id === id);

  if (!driver) {
    return (
      <div className="p-8 text-center space-y-4">
        <FaChevronLeft className="text-4xl text-orange-500 mx-auto" />
        <h2 className="text-xl font-bold">Operator Registry Not Found</h2>
        <p className="text-xs text-gray-500">The driver with ID "{id}" does not exist in the active records.</p>
        <Link to={PATHS.DRIVERS} className="inline-block text-xs font-bold text-white bg-emerald-600 px-4 py-2 rounded-xl">
          Back to Drivers
        </Link>
      </div>
    );
  }

  const assignedMachine = mockMachines.find(m => m.id === driver.assignedMachineId);

  // Performance data (Monthly hours vs acres worked)
  const chartData = driver.performanceData;

  return (
    <div className="space-y-6">
      
      {/* Header breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(PATHS.DRIVERS)}
          className="p-2.5 bg-white dark:bg-emerald-950/20 border border-gray-200 dark:border-emerald-900/30 rounded-xl text-xs hover:bg-gray-100 transition-colors"
        >
          <FaChevronLeft />
        </button>
        <div>
          <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">Operator Profile Details</span>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
            {driver.name}
          </h1>
        </div>
      </div>

      {/* Main Profile Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column Profile Card */}
        <div className="p-6 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl shadow-sm space-y-5 text-center flex flex-col items-center">
          <img src={driver.photo} alt={driver.name} className="w-28 h-28 rounded-3xl object-cover shadow-md border-4 border-white dark:border-emerald-900" />
          
          <div className="space-y-1">
            <h2 className="text-lg font-extrabold dark:text-white">{driver.name}</h2>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase leading-none ${
              driver.status === 'Active'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400'
                : 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-400'
            }`}>
              {driver.status}
            </span>
          </div>

          <div className="flex gap-2 text-xs font-semibold text-gray-700 dark:text-emerald-400">
            <FaStar className="text-yellow-500" /> {driver.rating} Rating Star &bull; {driver.experience} Exp
          </div>

          {/* Details list */}
          <div className="w-full border-t border-gray-100 dark:border-emerald-950/20 pt-4 text-xs text-left space-y-3 font-semibold text-gray-600 dark:text-gray-300">
            <div className="flex justify-between">
              <span className="text-gray-400">Phone Number</span>
              <span>{driver.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Monthly Attendance</span>
              <span>{driver.attendance}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Acres Covered</span>
              <span>{driver.acresWorked} ac</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Fuel Conservation</span>
              <span>{driver.fuelEfficiency}% Ratio</span>
            </div>
          </div>
        </div>

        {/* Right Columns: Assigned Asset & Charts */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Assigned Asset Info */}
          <div className="p-5 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Assigned Farming Vehicle</h3>
            {assignedMachine ? (
              <div className="p-4 bg-gray-50 dark:bg-emerald-950/10 border border-gray-100 dark:border-emerald-950/20 rounded-2xl flex items-center gap-4">
                <img src={assignedMachine.photo} alt={assignedMachine.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                <div className="flex-1 text-xs">
                  <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">{assignedMachine.type}</span>
                  <h4 className="font-extrabold text-sm dark:text-white mt-0.5">{assignedMachine.name}</h4>
                  <span className="text-gray-400 font-mono">{assignedMachine.registration}</span>
                </div>
                <Link to={`/machines/${assignedMachine.id}`} className="text-xs font-bold text-emerald-700 hover:underline">
                  View Machine
                </Link>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 dark:bg-emerald-950/10 border border-dashed border-gray-250 rounded-2xl text-center text-xs text-gray-400">
                Currently not assigned to any active vehicle.
              </div>
            )}
          </div>

          {/* Performance chart */}
          <div className="p-5 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider">Performance Trends</h3>
              <p className="text-[10px] text-gray-400 mb-6">Traces monthly hours worked vs total acres processed.</p>
            </div>
            
            <div className="h-60 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorAcres" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 9 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff' }} />
                  <Area type="monotone" dataKey="hours" stroke="#10b981" fillOpacity={1} fill="url(#colorHours)" name="Hours Worked" />
                  <Area type="monotone" dataKey="acres" stroke="#f97316" fillOpacity={1} fill="url(#colorAcres)" name="Acres Harvested" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
export default DriverDetail;
