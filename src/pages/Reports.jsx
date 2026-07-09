import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, Legend
} from 'recharts';
import { 
  FaFilePdf, FaFileExcel, FaDownload, FaFilter, 
  FaCalendarAlt, FaGasPump, FaMap, FaClock, FaRoute 
} from 'react-icons/fa';

const reportData = {
  Today: [
    { name: 'John Deere 8R', fuel: 95, distance: 120, area: 90, hours: 6.8 },
    { name: 'Case Axial-Flow', fuel: 140, distance: 85, area: 120, hours: 5.2 },
    { name: 'Fendt 724 Vario', fuel: 45, distance: 60, area: 45, hours: 4.8 },
    { name: 'Kubota M8 Tractor', fuel: 65, distance: 75, area: 55, hours: 7.4 }
  ],
  Yesterday: [
    { name: 'John Deere 8R', fuel: 110, distance: 140, area: 105, hours: 7.5 },
    { name: 'Case Axial-Flow', fuel: 165, distance: 100, area: 145, hours: 6.0 },
    { name: 'Massey Ferguson', fuel: 85, distance: 95, area: 70, hours: 6.0 },
    { name: 'JD R4038 Spreader', fuel: 50, distance: 55, area: 40, hours: 3.5 }
  ],
  Weekly: [
    { name: 'John Deere 8R', fuel: 650, distance: 840, area: 630, hours: 45 },
    { name: 'Case Axial-Flow', fuel: 980, distance: 600, area: 850, hours: 38 },
    { name: 'New Holland T7', fuel: 320, distance: 410, area: 300, hours: 24 },
    { name: 'Fendt 724 Vario', fuel: 290, distance: 380, area: 285, hours: 22 }
  ],
  Monthly: [
    { name: 'John Deere 8R', fuel: 2700, distance: 3400, area: 2500, hours: 180 },
    { name: 'Case Axial-Flow', fuel: 4100, distance: 2500, area: 3600, hours: 155 },
    { name: 'New Holland T7', fuel: 1350, distance: 1700, area: 1250, hours: 98 },
    { name: 'Fendt 724 Vario', fuel: 1200, distance: 1600, area: 1200, hours: 90 }
  ]
};

export const Reports = () => {
  const [timeframe, setTimeframe] = useState('Today');
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  const activeRecords = reportData[timeframe] || reportData.Today;

  // Totals calculations
  const totalFuel = activeRecords.reduce((sum, r) => sum + r.fuel, 0);
  const totalDistance = activeRecords.reduce((sum, r) => sum + r.distance, 0);
  const totalArea = activeRecords.reduce((sum, r) => sum + r.area, 0);
  const totalHours = activeRecords.reduce((sum, r) => sum + r.hours, 0).toFixed(1);

  const handleExportPDF = () => {
    setIsExportingPDF(true);
    setTimeout(() => setIsExportingPDF(false), 1500);
  };

  const handleExportExcel = () => {
    setIsExportingExcel(true);
    setTimeout(() => setIsExportingExcel(false), 1500);
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
            Operations Report Center
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Aggregate fleet metrics, fuel efficiency charts, and download CSV/PDF spreadsheet reports.
          </p>
        </div>

        {/* Export triggers */}
        <div className="flex gap-2 text-xs font-bold">
          <button
            onClick={handleExportPDF}
            disabled={isExportingPDF}
            className="flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 border border-emerald-250 dark:border-emerald-900/40 rounded-xl hover:bg-emerald-100/50 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isExportingPDF ? (
              <div className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <FaFilePdf className="text-sm text-red-500" />
            )}
            Export PDF Report
          </button>
          <button
            onClick={handleExportExcel}
            disabled={isExportingExcel}
            className="flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 border border-emerald-250 dark:border-emerald-900/40 rounded-xl hover:bg-emerald-100/50 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isExportingExcel ? (
              <div className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <FaFileExcel className="text-sm text-green-600" />
            )}
            Export Excel sheet
          </button>
        </div>
      </div>

      {/* Timeframe selector header tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-emerald-950/20 pb-1">
        {['Today', 'Yesterday', 'Weekly', 'Monthly'].map((t) => (
          <button
            key={t}
            onClick={() => setTimeframe(t)}
            className={`px-4 py-2 text-xs font-bold transition-all relative ${
              timeframe === t 
                ? 'text-emerald-600 dark:text-emerald-400' 
                : 'text-gray-500 hover:text-gray-800 dark:text-gray-400'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Aggregate metrics cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl flex items-center gap-3">
          <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-950/20 text-orange-500"><FaGasPump className="text-lg" /></div>
          <div>
            <span className="text-[10px] text-gray-450 uppercase font-bold tracking-wider">Total Fuel</span>
            <span className="text-lg font-black dark:text-white block mt-0.5">{totalFuel} L</span>
          </div>
        </div>
        <div className="p-4 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500"><FaMap className="text-lg" /></div>
          <div>
            <span className="text-[10px] text-gray-450 uppercase font-bold tracking-wider">Area Covered</span>
            <span className="text-lg font-black dark:text-white block mt-0.5">{totalArea} ha</span>
          </div>
        </div>
        <div className="p-4 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-500"><FaRoute className="text-lg" /></div>
          <div>
            <span className="text-[10px] text-gray-450 uppercase font-bold tracking-wider">Distance Traced</span>
            <span className="text-lg font-black dark:text-white block mt-0.5">{totalDistance} km</span>
          </div>
        </div>
        <div className="p-4 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/20 text-purple-500"><FaClock className="text-lg" /></div>
          <div>
            <span className="text-[10px] text-gray-450 uppercase font-bold tracking-wider">Active Time</span>
            <span className="text-lg font-black dark:text-white block mt-0.5">{totalHours} hrs</span>
          </div>
        </div>
      </div>

      {/* Main Reports Graph and details table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recharts chart */}
        <div className="lg:col-span-2 p-5 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h2 className="text-sm font-bold dark:text-white uppercase tracking-wider">Fuel and Acreage details</h2>
            <p className="text-[10px] text-gray-400">Compares fuel burned (Liters) with area harvested (Hectares) per vehicle.</p>
          </div>

          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activeRecords} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 9 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff' }} />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                <Bar dataKey="fuel" fill="#f97316" name="Fuel Burned (L)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="area" fill="#10b981" name="Harvested (ha)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Metrics Table List */}
        <div className="p-5 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h2 className="text-sm font-bold dark:text-white uppercase tracking-wider font-extrabold">Log Metrics</h2>
            <p className="text-[10px] text-gray-400">Breakdown statistics for active fleet machinery.</p>
          </div>

          <div className="space-y-3.5 overflow-y-auto max-h-64 pr-1 custom-scrollbar text-xs font-semibold">
            {activeRecords.map((rec) => (
              <div key={rec.name} className="p-3 bg-gray-50 dark:bg-emerald-950/10 border border-gray-100 dark:border-emerald-950/20 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-gray-800 dark:text-white">
                  <span className="font-extrabold">{rec.name}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-500">{rec.hours}h active</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[10px] text-gray-500 dark:text-gray-400">
                  <div>
                    <span className="block text-[8px] text-gray-400 uppercase">Fuel</span>
                    <strong className="text-gray-800 dark:text-white">{rec.fuel} L</strong>
                  </div>
                  <div>
                    <span className="block text-[8px] text-gray-400 uppercase">Area</span>
                    <strong className="text-gray-800 dark:text-white">{rec.area} ha</strong>
                  </div>
                  <div>
                    <span className="block text-[8px] text-gray-400 uppercase">Distance</span>
                    <strong className="text-gray-800 dark:text-white">{rec.distance} km</strong>
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
export default Reports;
