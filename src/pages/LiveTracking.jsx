import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  FaTractor, FaCompass, FaGasPump, FaBatteryThreeQuarters, FaCheckCircle, 
  FaClock, FaMapMarkerAlt, FaExpand, FaSearch, FaHistory, FaUserPlus, FaEye, FaUserTie
} from 'react-icons/fa';
import { mockMachines, mockDrivers } from '../data/mockData';
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

export const LiveTracking = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Local state for dynamic machine positions (simulating GPS movements)
  const [machines, setMachines] = useState(mockMachines);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [mapCenter, setMapCenter] = useState([41.885, -87.645]);
  const [mapZoom, setMapZoom] = useState(13);

  // Check if a machine was requested to be located from another view
  useEffect(() => {
    if (location.state?.locateMachineId) {
      const target = machines.find(m => m.id === location.state.locateMachineId);
      if (target) {
        setSelectedMachine(target);
        setMapCenter([target.location.lat, target.location.lng]);
        setMapZoom(15);
      }
    } else if (machines.length > 0) {
      setSelectedMachine(machines[0]);
      setMapCenter([machines[0].location.lat, machines[0].location.lng]);
    }
  }, [location.state, machines]);

  // Simulate active movement (jiggling GPS markers) on a 4 second interval
  useEffect(() => {
    const interval = setInterval(() => {
      setMachines(prevMachines => {
        const updated = prevMachines.map(m => {
          if (m.status !== 'Working') return m;
          // Slowly creep Northeast/Southwest
          const deltaLat = (Math.random() - 0.3) * 0.0003;
          const deltaLng = (Math.random() - 0.3) * 0.0003;
          const newLat = m.location.lat + deltaLat;
          const newLng = m.location.lng + deltaLng;
          
          return {
            ...m,
            location: { lat: newLat, lng: newLng },
            speed: Math.max(6, Math.min(22, m.speed + Math.floor(Math.random() * 3) - 1)),
            fuel: Math.max(1, m.fuel - (Math.random() > 0.8 ? 1 : 0))
          };
        });

        // Sync details panel if currently focused on a moving machine
        if (selectedMachine) {
          const fresh = updated.find(x => x.id === selectedMachine.id);
          if (fresh) setSelectedMachine(fresh);
        }

        return updated;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [selectedMachine]);

  const selectAndCenter = (machine) => {
    setSelectedMachine(machine);
    setMapCenter([machine.location.lat, machine.location.lng]);
    setMapZoom(15);
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

  const getDriverName = (driverId) => {
    const driver = mockDrivers.find(d => d.id === driverId);
    return driver ? driver.name : 'Not Assigned';
  };

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
      <div className="flex-1 h-full relative">
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
            onClick={() => { setMapCenter([41.885, -87.645]); setMapZoom(13); }}
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
