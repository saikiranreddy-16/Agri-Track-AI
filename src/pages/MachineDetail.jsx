import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import io from 'socket.io-client';
import api from '../utils/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  FaTractor, FaGasPump, FaBatteryThreeQuarters, FaTools, 
  FaClock, FaMapMarkerAlt, FaFileAlt, FaHistory, FaExclamationTriangle, 
  FaChevronLeft, FaCamera, FaDownload 
} from 'react-icons/fa';
import { PATHS } from '../constants';

// Fix Leaflet pin icon
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const customPin = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

// Helper component to center Leaflet map dynamically
const RecenterMap = ({ center, zoom = 15 }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
};

const formatMachine = (m) => ({
  id: m._id || m.id,
  name: m.name,
  type: m.type,
  brand: m.brand,
  model: m.model,
  registration: m.registration,
  status: m.status,
  fuel: m.fuel !== undefined ? m.fuel : 100,
  battery: m.battery !== undefined ? m.battery : 100,
  assignedDriverId: m.assignedDriverId,
  location: m.location || { lat: 30.902, lng: 75.853 },
  speed: m.speed || 0,
  heading: m.heading || 0,
  engineStatus: m.engineStatus || 'Off',
  workingHours: m.workingHours || 0,
  distanceTravelled: m.distanceTravelled || 0,
  currentAddress: m.currentAddress || '',
  photo: m.photo || 'https://images.unsplash.com/photo-1592919505780-303950717480?auto=format&fit=crop&w=800&q=80',
  documents: m.documents || [],
  workHistory: m.workHistory || [],
  fuelHistory: m.fuelHistory || [],
  maintenanceHistory: m.maintenanceHistory || [],
  alerts: m.alerts || [],
  gpsDeviceId: m.gpsDeviceId,
  updatedAt: m.updatedAt,
});

export const MachineDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [machine, setMachine] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch machine details on mount
  useEffect(() => {
    const fetchMachineDetails = async () => {
      try {
        const response = await api.get(`/machines/${id}`);
        if (response.data && response.data.success) {
          setMachine(formatMachine(response.data.data));
        }
      } catch (err) {
        console.error('Failed to fetch machine details:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMachineDetails();
  }, [id]);

  // Set up socket listener for live changes
  useEffect(() => {
    const socket = io('http://localhost:5000', { withCredentials: true });

    socket.on('machineUpdate', (updated) => {
      if (updated._id === id || updated.id === id) {
        setMachine(formatMachine(updated));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!machine) {
    return (
      <div className="p-8 text-center space-y-4">
        <FaExclamationTriangle className="text-4xl text-orange-500 mx-auto" />
        <h2 className="text-xl font-bold">Machine Registry Not Found</h2>
        <p className="text-xs text-gray-500">The vehicle with ID "{id}" does not exist in the active database.</p>
        <Link to={PATHS.MACHINES} className="inline-block text-xs font-bold text-white bg-emerald-600 px-4 py-2 rounded-xl">
          Back to Machines
        </Link>
      </div>
    );
  }

  const assignedDriver = machine.assignedDriverId && typeof machine.assignedDriverId === 'object'
    ? {
        name: machine.assignedDriverId.name,
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80',
        experience: '8 Years',
      }
    : null;

  const tabs = [
    { id: 'overview', label: 'Overview & GPS', icon: FaTractor },
    { id: 'work', label: 'Work & Drivers', icon: FaHistory },
    { id: 'fuel', label: 'Fuel Analytics', icon: FaGasPump },
    { id: 'maintenance', label: 'Maintenance & Alerts', icon: FaTools },
    { id: 'documents', label: 'Photos & Manuals', icon: FaFileAlt }
  ];

  return (
    <div className="space-y-6">
      
      {/* Breadcrumb Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(PATHS.MACHINES)}
          className="p-2.5 bg-white dark:bg-emerald-950/20 border border-gray-200 dark:border-emerald-900/30 rounded-xl text-xs hover:bg-gray-100 transition-colors"
        >
          <FaChevronLeft />
        </button>
        <div>
          <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">{machine.type}</span>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            {machine.name}
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase leading-none ${
              machine.status === 'Working'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400'
                : machine.status === 'Idle'
                ? 'bg-orange-100 text-orange-850 dark:bg-orange-950/50 dark:text-orange-400'
                : machine.status === 'Offline'
                ? 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-400'
                : 'bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-400'
            }`}>
              {machine.status === 'Working' ? 'Running' : machine.status}
            </span>
          </h1>
        </div>
      </div>

      {/* Tabs list bar */}
      <div className="flex gap-1 overflow-x-auto border-b border-gray-200 dark:border-emerald-950/20 pb-1.5 custom-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-xs font-bold flex items-center gap-2 rounded-xl transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 font-extrabold'
                  : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <Icon className="text-sm" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="mt-4">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Quick telemetry stats card */}
            <div className="p-5 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider">Telemetry Diagnostics</h3>
              
              <div className="divide-y divide-gray-100 dark:divide-emerald-950/25 text-xs font-semibold">
                <div className="py-2.5 flex justify-between">
                  <span className="text-gray-400">Brand / Model</span>
                  <span>{machine.brand} {machine.model}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-gray-400">Registration ID</span>
                  <span className="font-mono">{machine.registration}</span>
                </div>
                {machine.gpsDeviceId && (
                  <div className="py-2.5 flex justify-between">
                    <span className="text-gray-400">GPS Device ID</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-450">
                      {typeof machine.gpsDeviceId === 'object' ? machine.gpsDeviceId.deviceId : machine.gpsDeviceId}
                    </span>
                  </div>
                )}
                <div className="py-2.5 flex justify-between">
                  <span className="text-gray-400">Working Hours</span>
                  <span>{machine.workingHours} Hours</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-gray-400">Distance Travelled</span>
                  <span>{machine.distanceTravelled} km</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-gray-400">Fuel Tank Level</span>
                  <span className="flex items-center gap-1.5">
                    <FaGasPump className={machine.fuel < 20 ? 'text-red-500' : 'text-emerald-500'} />
                    {machine.fuel}%
                  </span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-gray-400">Battery Status</span>
                  <span className="flex items-center gap-1.5">
                    <FaBatteryThreeQuarters className="text-yellow-500" />
                    {machine.battery}%
                  </span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-gray-400">Current operator</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{assignedDriver ? assignedDriver.name : 'Unassigned'}</span>
                </div>
              </div>
            </div>

            {/* Live GPS Mini-Map */}
            <div className="lg:col-span-2 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
              <div className="p-4 border-b border-gray-100 dark:border-emerald-950/25 flex justify-between items-center shrink-0">
                <div>
                  <h3 className="text-sm font-bold dark:text-white">Active Location Trace</h3>
                  <p className="text-[10px] text-gray-400 font-semibold">{machine.currentAddress}</p>
                </div>
                <span className="text-[10px] font-mono bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900/30">
                  {machine.location.lat.toFixed(5)}, {machine.location.lng.toFixed(5)}
                </span>
              </div>

              <div className="h-72 w-full relative z-0">
                <MapContainer 
                  center={[machine.location.lat, machine.location.lng]} 
                  zoom={15} 
                  style={{ width: '100%', height: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <RecenterMap center={[machine.location.lat, machine.location.lng]} />
                  <Marker position={[machine.location.lat, machine.location.lng]} icon={customPin}>
                    <Popup>
                      <strong>{machine.name}</strong><br />
                      Status: {machine.status}
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>

          </div>
        )}

        {/* WORK & DRIVER HISTORY TAB */}
        {activeTab === 'work' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Work Completed logs */}
            <div className="p-5 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Completed Field Tasks</h3>
              <div className="space-y-3">
                {machine.workHistory.map((w) => (
                  <div key={w.id} className="p-3.5 bg-gray-50 dark:bg-emerald-950/10 border border-gray-100 dark:border-emerald-950/20 rounded-xl text-xs flex justify-between items-center">
                    <div>
                      <div className="font-bold dark:text-white">{w.job}</div>
                      <span className="text-[10px] text-gray-400">{w.date} &bull; Operator: {w.driver}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">
                      {w.hours} Hrs
                    </span>
                  </div>
                ))}
                {machine.workHistory.length === 0 && (
                  <div className="text-center py-12 text-xs text-gray-400">No completed tasks logged for this asset.</div>
                )}
              </div>
            </div>

            {/* Drivers list logs */}
            <div className="p-5 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Associated Operators Log</h3>
              <div className="space-y-4">
                {assignedDriver && (
                  <div className="p-4 bg-emerald-50/20 dark:bg-emerald-950/10 border border-emerald-100/50 dark:border-emerald-900/30 rounded-2xl flex items-center gap-3">
                    <img src={assignedDriver.photo} alt={assignedDriver.name} className="w-12 h-12 rounded-xl object-cover" />
                    <div className="flex-1 text-xs">
                      <span className="text-[9px] uppercase font-bold text-emerald-600 block mb-0.5">Currently On Duty</span>
                      <span className="font-bold text-sm block dark:text-white">{assignedDriver.name}</span>
                      <span className="text-gray-400 block">{assignedDriver.experience} Experience</span>
                    </div>
                    <Link to={`/drivers/${assignedDriver.id}`} className="text-xs font-bold text-emerald-600 hover:underline">
                      View Profile
                    </Link>
                  </div>
                )}
                
                <div className="space-y-2 text-xs">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Past Drivers</h4>
                  <div className="divide-y divide-gray-100 dark:divide-emerald-950/25">
                    {mockDrivers.filter(d => d.id !== machine.assignedDriverId).slice(0, 3).map(drv => (
                      <div key={drv.id} className="py-2.5 flex justify-between items-center">
                        <span className="font-semibold">{drv.name}</span>
                        <span className="text-gray-400 font-medium">{drv.experience}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* FUEL HISTORY TAB */}
        {activeTab === 'fuel' && (
          <div className="p-5 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider">Fuel Drop curve</h3>
                <p className="text-[10px] text-gray-400">Traces fuel tank depletion rates during operations.</p>
              </div>
            </div>
            
            <div className="h-64 w-full text-xs">
              {machine.fuelHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={machine.fuelHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 9 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff' }} />
                    <Line type="monotone" dataKey="level" stroke="#f97316" strokeWidth={2.5} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-450">No fuel records compiled for this machine.</div>
              )}
            </div>
          </div>
        )}

        {/* MAINTENANCE & ALERTS TAB */}
        {activeTab === 'maintenance' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Maintenance History */}
            <div className="p-5 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Service & Maintenance Records</h3>
              <div className="space-y-4">
                {machine.maintenanceHistory.map((mh) => (
                  <div key={mh.id} className="p-3.5 bg-gray-50 dark:bg-emerald-950/10 border border-gray-100 dark:border-emerald-950/20 rounded-xl text-xs space-y-1.5">
                    <div className="flex justify-between items-start">
                      <span className="font-bold dark:text-white">{mh.action}</span>
                      <span className="font-black text-emerald-600 dark:text-emerald-400">₹{mh.cost}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-gray-400 font-semibold">
                      <span>Date: {mh.date}</span>
                      <span>Verified: Mechanic Team</span>
                    </div>
                  </div>
                ))}
                {machine.maintenanceHistory.length === 0 && (
                  <div className="text-center py-12 text-xs text-gray-400">No maintenance tasks logged.</div>
                )}
              </div>
            </div>

            {/* Warnings History */}
            <div className="p-5 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Historical Alerts</h3>
              <div className="space-y-3">
                {machine.alerts.map((al) => (
                  <div key={al.id} className="p-3.5 bg-gray-50 dark:bg-emerald-950/10 border border-gray-100 dark:border-emerald-950/20 rounded-xl text-xs flex justify-between items-center">
                    <div>
                      <div className="font-bold dark:text-white">{al.type}</div>
                      <span className="text-[10px] text-gray-400">Triggered: {al.date}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-200 text-gray-600">
                      {al.status}
                    </span>
                  </div>
                ))}
                {machine.alerts.length === 0 && (
                  <div className="text-center py-12 text-xs text-gray-400">Zero warning codes registered.</div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* DOCUMENTS & PHOTOS TAB */}
        {activeTab === 'documents' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Photos */}
            <div className="p-5 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                <FaCamera className="text-emerald-600" /> Asset Photographic Log
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-32 bg-gray-100 rounded-xl overflow-hidden shadow-inner">
                  <img src={machine.photo} alt="Asset front" className="w-full h-full object-cover" />
                </div>
                <div className="h-32 bg-gray-150 rounded-xl border border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-400">
                  No Secondary Photo
                </div>
              </div>
            </div>

            {/* Manuals and paperwork */}
            <div className="p-5 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Operations Documentation</h3>
              <div className="space-y-3">
                {machine.documents.map((doc, idx) => (
                  <div key={idx} className="p-3.5 bg-gray-50 dark:bg-emerald-950/10 border border-gray-100 dark:border-emerald-950/20 rounded-xl text-xs flex justify-between items-center">
                    <span className="font-semibold truncate pr-3">{doc}</span>
                    <button className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm">
                      <FaDownload className="text-[9px]" /> Download
                    </button>
                  </div>
                ))}
                {machine.documents.length === 0 && (
                  <div className="p-3.5 bg-gray-50 dark:bg-emerald-950/10 border border-gray-100 dark:border-emerald-950/20 rounded-xl text-xs flex justify-between items-center">
                    <span className="font-semibold">Standard_Operator_Manual.pdf</span>
                    <button className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm">
                      <FaDownload className="text-[9px]" /> Download
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
export default MachineDetail;
