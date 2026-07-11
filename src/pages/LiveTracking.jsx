import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import io from 'socket.io-client';
import api from '../utils/api';
import { 
  FaTractor, FaCompass, FaGasPump, FaBatteryThreeQuarters, FaCheckCircle, 
  FaClock, FaMapMarkerAlt, FaExpand, FaSearch, FaHistory, FaUserPlus, FaEye, FaUserTie,
  FaExclamationTriangle
} from 'react-icons/fa';
import { PATHS } from '../constants';

// Fix for default Leaflet icon resolution issues
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Helper component to center Leaflet map dynamically
const RecenterMap = ({ center, zoom = 14 }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
};

// Create custom colored pins matching status
const createCustomPin = (status, type) => {
  const color = status === 'Working' 
    ? '#10b981' 
    : status === 'Idle' 
    ? '#f97316' 
    : status === 'Offline' 
    ? '#ef4444' 
    : '#8b5cf6'; // Maintenance: purple
  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shadow-md text-white font-bold transition-all" style="background-color: ${color};">
        <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="14" width="14" xmlns="http://www.w3.org/2000/svg">
          <path d="M472 232h-4.3c-7.9-57-55.8-101.4-113.7-104v-8c0-22-18-40-40-40H208c-22 0-40 18-40 40v8c-57.9 2.6-105.8 47-113.7 104H40c-22 0-40 18-40 40v24c0 22 18 40 40 40h4.3c7.9 57 55.8 101.4 113.7 104v8c0 22 18 40 40 40h112c22 0 40-18 40-40v-8c57.9-2.6 105.8-47 113.7-104h4.3c22 0 40-18 40-40v-24c0-22-18-40-40-40zM200 120h112v24H200v-24zm0 272H200V256h112v136H200zm184-48c0 48.5-39.5 88-88 88H200c-48.5 0-88-39.5-88-88v-80c0-48.5 39.5-88 88-88h112c48.5 0 88 39.5 88 88v80z"></path>
        </svg>
        <span class="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full border border-white" style="background-color: ${color};"></span>
      </div>
    `,
    className: 'custom-div-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

const formatMachine = (m) => ({
  id: m._id || m.id,
  name: m.name,
  type: m.type,
  brand: m.brand,
  model: m.model,
  registration: m.registration,
  status: m.status,
  fuel: m.fuel,
  battery: m.battery,
  assignedDriverId: m.assignedDriverId,
  location: m.location || { lat: 30.902, lng: 75.853 },
  speed: m.speed || 0,
  heading: m.heading || 0,
  engineStatus: m.engineStatus || 'Off',
  workingHours: m.workingHours || 0,
  distanceTravelled: m.distanceTravelled || 0,
  currentAddress: m.currentAddress || '',
  photo: m.photo || 'https://images.unsplash.com/photo-1592919505780-303950717480?auto=format&fit=crop&w=800&q=80',
  updatedAt: m.updatedAt,
});

export const LiveTracking = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Local state for fleet machines
  const [machines, setMachines] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [mapCenter, setMapCenter] = useState([30.902, 75.853]);
  const [mapZoom, setMapZoom] = useState(13);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Keep a ref to selectedMachine for updating it inside the Socket listener
  const selectedMachineRef = useRef(null);
  useEffect(() => {
    selectedMachineRef.current = selectedMachine;
  }, [selectedMachine]);

  // Fetch initial fleet data from the API
  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const response = await api.get('/machines');
        if (response.data && response.data.success) {
          const formatted = response.data.data.map(formatMachine);
          setMachines(formatted);

          // Handle URL navigation locating
          if (location.state?.locateMachineId) {
            const target = formatted.find(m => m.id === location.state.locateMachineId);
            if (target) {
              setSelectedMachine(target);
              setMapCenter([target.location.lat, target.location.lng]);
              setMapZoom(15);
            }
          } else if (formatted.length > 0) {
            setSelectedMachine(formatted[0]);
            setMapCenter([formatted[0].location.lat, formatted[0].location.lng]);
          }
        }
      } catch (error) {
        console.error('Failed to load initial machines:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMachines();
  }, [location.state]);

  // Set up Socket.IO subscription
  useEffect(() => {
    const socket = io('http://localhost:5000', {
      withCredentials: true,
      reconnectionAttempts: 10,
    });

    socket.on('connect', () => {
      setIsSocketConnected(true);
    });

    socket.on('disconnect', () => {
      setIsSocketConnected(false);
    });

    socket.on('connect_error', () => {
      setIsSocketConnected(false);
    });

    socket.on('machineUpdate', (updated) => {
      const formatted = formatMachine(updated);
      
      setMachines(prev => prev.map(m => m.id === formatted.id ? formatted : m));

      // Synchronize currently open details panel
      if (selectedMachineRef.current && selectedMachineRef.current.id === formatted.id) {
        setSelectedMachine(formatted);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const selectAndCenter = (machine) => {
    setSelectedMachine(machine);
    setMapCenter([machine.location.lat, machine.location.lng]);
    setMapZoom(15);
  };

  const getDriverName = (assignedDriver) => {
    if (!assignedDriver) return 'Not Assigned';
    if (typeof assignedDriver === 'object') return assignedDriver.name;
    return 'Not Assigned';
  };

  const filteredMachines = machines.filter(m => {
    const driverName = getDriverName(m.assignedDriverId).toLowerCase();
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          m.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          driverName.includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'All' || m.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col lg:flex-row gap-4 relative overflow-hidden -m-4 md:-m-6">
      
      {/* Sidebar Control Panel */}
      <div className="w-full lg:w-80 shrink-0 bg-white dark:bg-[#0e1712] border-r border-gray-200 dark:border-emerald-950/30 flex flex-col h-full z-10">
        
        {/* Search & Filter Header */}
        <div className="p-4 border-b border-gray-100 dark:border-emerald-950/20 space-y-3">
          <h2 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider">
            GPS Fleet Control
          </h2>
          
          {/* Search bar */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <FaSearch className="text-xs" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by machine name..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-gray-50 dark:bg-emerald-950/30 border border-gray-200 dark:border-emerald-950/40 focus:outline-none focus:border-emerald-500 focus:bg-white dark:text-white"
            />
          </div>

          {/* Status Pills */}
          <div className="flex gap-1 overflow-x-auto pb-1 custom-scrollbar">
            {['All', 'Working', 'Idle', 'Offline', 'Maintenance'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all shrink-0 cursor-pointer ${
                  filterStatus === st
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-emerald-900/10 text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-emerald-900/20'
                }`}
              >
                {st === 'Working' ? 'Running' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Machine Lists */}
        <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-gray-50 dark:divide-emerald-950/10 p-2 space-y-1">
          {filteredMachines.map((m) => (
            <div
              key={m.id}
              onClick={() => selectAndCenter(m)}
              className={`p-3 rounded-xl cursor-pointer text-xs transition-all border ${
                selectedMachine?.id === m.id
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/30 shadow-sm'
                  : 'bg-white dark:bg-[#0e1712] border-transparent hover:bg-gray-50 dark:hover:bg-emerald-950/10'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="font-bold text-gray-800 dark:text-white truncate pr-2">{m.name}</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded leading-none uppercase ${
                  m.status === 'Working'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400'
                    : m.status === 'Idle'
                    ? 'bg-orange-100 text-orange-800 dark:bg-orange-950/50 dark:text-orange-400'
                    : m.status === 'Offline'
                    ? 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-400'
                    : 'bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-400'
                }`}>
                  {m.status === 'Working' ? 'Running' : m.status}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-gray-400 mt-2">
                <span>Speed: {m.speed} km/h</span>
                <span>Fuel: {m.fuel}%</span>
              </div>
            </div>
          ))}
          {filteredMachines.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-xs">No active assets matching filters.</div>
          )}
        </div>
      </div>

      {/* Main Map View Area */}
      <div className="flex-1 h-full relative font-sans">
        {!isSocketConnected && (
          <div className="absolute top-4 left-4 z-40 bg-red-600/90 backdrop-blur text-white px-4 py-2 rounded-xl shadow-lg border border-red-500 flex items-center gap-2 text-xs font-bold animate-pulse">
            <FaExclamationTriangle className="shrink-0" />
            Connection Lost to Live GPS Stream - Reconnecting...
          </div>
        )}
        <MapContainer 
          center={mapCenter} 
          zoom={mapZoom} 
          style={{ width: '100%', height: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <RecenterMap center={mapCenter} zoom={mapZoom} />

          {/* Render markers */}
          {filteredMachines.map((m) => (
            <Marker 
              key={m.id} 
              position={[m.location.lat, m.location.lng]} 
              icon={createCustomPin(m.status, m.type)}
              eventHandlers={{
                click: () => {
                  setSelectedMachine(m);
                  setMapCenter([m.location.lat, m.location.lng]);
                }
              }}
            >
              <Popup>
                <div className="text-xs space-y-1">
                  <div className="font-bold text-gray-900">{m.name}</div>
                  <div>Status: <strong>{m.status}</strong></div>
                  <div>Speed: {m.speed} km/h</div>
                  <div>Fuel Level: {m.fuel}%</div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Map Floating Controls overlay */}
        <div className="absolute top-4 right-4 z-40 bg-white dark:bg-[#0e1712] p-2.5 rounded-xl shadow-lg border border-gray-100 dark:border-emerald-950/30 flex flex-col gap-2">
          <button 
            onClick={() => { setMapCenter([30.902, 75.853]); setMapZoom(13); }}
            className="p-2 bg-gray-50 dark:bg-emerald-950/30 hover:bg-gray-100 rounded-lg text-xs font-bold text-gray-700 dark:text-emerald-300"
            title="Reset Map Bounds"
          >
            <FaExpand />
          </button>
        </div>

        {/* Floating Details Drawer Panel (Selected Machine) */}
        {selectedMachine && (
          <div className="absolute bottom-4 left-4 right-4 lg:left-auto lg:right-4 z-30 lg:w-96 bg-white dark:bg-[#0f1913] border border-gray-100 dark:border-emerald-950/40 rounded-2xl shadow-2xl p-5 overflow-hidden">
            <div className="flex justify-between items-start border-b border-gray-100 dark:border-emerald-950/20 pb-3 mb-3">
              <div>
                <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">{selectedMachine.type}</span>
                <h3 className="text-base font-extrabold dark:text-white">{selectedMachine.name}</h3>
                <span className="text-[10px] text-gray-400">{selectedMachine.registration}</span>
              </div>
              <button 
                onClick={() => setSelectedMachine(null)}
                className="text-gray-400 hover:text-gray-600 text-xs"
              >
                Close
              </button>
            </div>

            {selectedMachine.status === 'Offline' && (
              <div className="mb-3 px-3 py-2 bg-red-50/50 dark:bg-red-955/20 border border-red-200/50 dark:border-red-900/30 text-red-700 dark:text-red-400 rounded-xl text-[10px] font-bold flex items-center gap-2">
                <FaExclamationTriangle className="shrink-0 text-red-500" />
                <span>GPS Offline / No Signal - Showing Last Known Location</span>
              </div>
            )}

            {/* Quick stats grid */}
            <div className="grid grid-cols-2 gap-3 text-xs mb-4">
              <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-emerald-950/20 rounded-xl">
                <FaUserTie className="text-emerald-500 shrink-0" />
                <div>
                  <div className="text-[10px] text-gray-400 font-bold">Driver</div>
                  <div className="font-bold truncate">{getDriverName(selectedMachine.assignedDriverId)}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-emerald-950/20 rounded-xl">
                <FaCompass className="text-blue-500 shrink-0" />
                <div>
                  <div className="text-[10px] text-gray-400 font-bold">Speed</div>
                  <div className="font-bold">{selectedMachine.speed} km/h</div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-emerald-950/20 rounded-xl">
                <FaGasPump className="text-orange-500 shrink-0" />
                <div>
                  <div className="text-[10px] text-gray-400 font-bold">Fuel Tank</div>
                  <div className="font-bold">{selectedMachine.fuel}%</div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-emerald-950/20 rounded-xl">
                <FaClock className="text-sky-500 shrink-0" />
                <div>
                  <div className="text-[10px] text-gray-400 font-bold">Working Hours</div>
                  <div className="font-bold">{selectedMachine.workingHours || 0} hrs</div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-emerald-950/20 rounded-xl">
                <FaBatteryThreeQuarters className="text-yellow-500 shrink-0" />
                <div>
                  <div className="text-[10px] text-gray-400 font-bold">Engine Status</div>
                  <div className={`font-bold uppercase ${selectedMachine.engineStatus === 'On' ? 'text-emerald-500' : 'text-red-500'}`}>
                    {selectedMachine.engineStatus === 'On' ? 'ON' : 'OFF'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-emerald-950/20 rounded-xl">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedMachine.status === 'Working' ? '#10b981' : selectedMachine.status === 'Idle' ? '#f97316' : selectedMachine.status === 'Offline' ? '#ef4444' : '#8b5cf6' }} />
                <div>
                  <div className="text-[10px] text-gray-400 font-bold">Status</div>
                  <div className="font-bold uppercase">{selectedMachine.status === 'Working' ? 'Running' : selectedMachine.status}</div>
                </div>
              </div>
              <div className="col-span-2 p-2 bg-gray-50 dark:bg-emerald-950/20 rounded-xl space-y-1">
                <div className="text-[10px] text-gray-400 flex items-center gap-1">
                  <FaMapMarkerAlt className="text-red-400" /> Current Coordinates
                </div>
                <div className="font-mono text-[10px] text-gray-600 dark:text-emerald-300">
                  {selectedMachine.location.lat.toFixed(6)}, {selectedMachine.location.lng.toFixed(6)}
                </div>
                <div className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 truncate">
                  {selectedMachine.currentAddress}
                </div>
              </div>
            </div>

            {/* Quick Navigation Drawer Buttons */}
            <div className="flex gap-2">
              <Link
                to={`/machines/${selectedMachine.id}`}
                className="flex-1 flex justify-center items-center gap-1.5 py-2.5 text-xs font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 rounded-xl hover:bg-emerald-100/50 transition-colors"
              >
                <FaEye /> Full Profile
              </Link>
              <button
                onClick={() => navigate(PATHS.GPS_HISTORY, { state: { historyMachineId: selectedMachine.id } })}
                className="flex-1 flex justify-center items-center gap-1.5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md"
              >
                <FaHistory /> Route Playback
              </button>
            </div>

          </div>
        )}
      </div>

    </div>
  );
};
export default LiveTracking;
