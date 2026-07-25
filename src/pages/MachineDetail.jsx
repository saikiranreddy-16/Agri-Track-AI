import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import io from 'socket.io-client';
import api from '../utils/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  FaTractor, FaGasPump, FaBatteryThreeQuarters, FaTools, 
  FaClock, FaMapMarkerAlt, FaFileAlt, FaHistory, FaExclamationTriangle, 
  FaChevronLeft, FaCamera, FaDownload, FaShieldAlt, FaPlay, FaPause, FaStepBackward, 
  FaLink, FaPowerOff, FaSignal, FaRoute, FaGlobe, FaArrowRight, FaRoad
} from 'react-icons/fa';
import { PATHS } from '../constants';
import { mockMachines, mockCustomers, mockDrivers } from '../data/mockData';
import { useToast } from '../context/ToastContext';

// Fix Leaflet pin icon
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const customPin = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
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

// Available Map Tile Layers
const MAP_LAYERS = {
  streets: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  },
  terrain: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, SRTM | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
  }
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
  location: m.location || { lat: 16.978, lng: 79.432 },
  speed: m.speed || 0,
  heading: m.heading || 0,
  engineStatus: m.engineStatus || 'Off',
  workingHours: m.workingHours || 0,
  distanceTravelled: m.distanceTravelled || 0,
  areaCovered: m.areaCovered || 0,
  idleTime: m.idleTime || 0,
  currentAddress: m.currentAddress || '',
  photo: m.photo || 'https://images.unsplash.com/photo-1592919505780-303950717480?auto=format&fit=crop&w=800&q=80',
  documents: m.documents || [],
  gpsDeviceId: m.gpsDeviceId,
  updatedAt: m.updatedAt,
  chassisNumber: m.chassisNumber || m.registration || 'N/A',
  engineNumber: m.engineNumber || 'N/A',
  purchaseDate: m.purchaseDate || '2025-05-10',
  manufacturingYear: m.manufacturingYear || 2024,
  rcOwnerName: m.rcOwnerName || 'Unknown Customer',
  insuranceExpiry: m.insuranceExpiry || '2027-05-10',
  fitnessExpiry: m.fitnessExpiry || '2029-05-10',
});

export const MachineDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [machine, setMachine] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeLayer, setActiveLayer] = useState('streets');

  // GPS history playback state
  const [historyCoordinates, setHistoryCoordinates] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1000); // ms per step

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

  // Load history data when GPS History tab is loaded
  useEffect(() => {
    if (activeTab === 'history') {
      const fetchHistory = async () => {
        try {
          const response = await api.get(`/gps/${id}/playback`);
          if (response.data && response.data.success) {
            setHistoryCoordinates(response.data.data.coordinates || []);
          }
        } catch (e) {
          console.error('Failed to fetch route history playback:', e);
          // Fallback mock history coordinates around Cheruvupally
          setHistoryCoordinates([
            { lat: 16.975, lng: 79.430, speed: 10, heading: 90, timestamp: '10:00 AM' },
            { lat: 16.976, lng: 79.431, speed: 12, heading: 90, timestamp: '10:05 AM' },
            { lat: 16.977, lng: 79.432, speed: 15, heading: 45, timestamp: '10:10 AM' },
            { lat: 16.978, lng: 79.433, speed: 8, heading: 180, timestamp: '10:15 AM' },
            { lat: 16.978, lng: 79.432, speed: 0, heading: 180, timestamp: '10:20 AM' }
          ]);
        }
      };
      fetchHistory();
      setCurrentStep(0);
      setIsPlaying(false);
    }
  }, [activeTab, id]);

  // Autoplay loop for route history playback
  useEffect(() => {
    let timer = null;
    if (isPlaying && historyCoordinates.length > 0) {
      timer = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= historyCoordinates.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, playbackSpeed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, historyCoordinates, playbackSpeed]);

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
    ? machine.assignedDriverId.name
    : 'Unassigned Operator';

  // 6 Detailed Navigation Tabs
  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaTractor },
    { id: 'vehicle_info', label: 'Vehicle Info', icon: FaFileAlt },
    { id: 'device_info', label: 'Device Info', icon: FaShieldAlt },
    { id: 'live_tracking', label: 'Live Tracking', icon: FaRoute },
    { id: 'history', label: 'GPS History', icon: FaHistory },
    { id: 'reports', label: 'Reports', icon: FaClock }
  ];

  // Helper to build beautiful custom Leaflet popups
  const renderMapPopup = (loc, name, spd, eng, statusText, addr) => {
    return (
      <Popup className="custom-leaflet-popup">
        <div className="text-xs p-1 space-y-1.5 w-44 font-sans text-gray-800 dark:text-gray-200">
          <div className="border-b border-gray-100 dark:border-emerald-950/20 pb-1 flex justify-between items-center">
            <strong className="text-emerald-700 dark:text-emerald-450 text-[11px] truncate">{name}</strong>
          </div>
          <div className="grid grid-cols-2 gap-1 text-[9px] font-semibold">
            <div>Owner:</div>
            <div className="text-gray-500 dark:text-gray-400 text-right truncate">{machine.rcOwnerName}</div>
            
            <div>Speed:</div>
            <div className="text-gray-500 dark:text-gray-400 text-right">{spd} km/h</div>
            
            <div>Engine:</div>
            <div className="text-gray-500 dark:text-gray-400 text-right font-bold">{eng === 'On' ? 'ON' : 'OFF'}</div>
            
            <div>GPS Status:</div>
            <div className="text-gray-500 dark:text-gray-400 text-right">{statusText}</div>
          </div>
          <div className="text-[8px] text-gray-400 border-t border-gray-100 dark:border-emerald-950/20 pt-1">
            <strong>Addr: </strong>{addr || 'Cheruvupally Village, Telangana'}
          </div>
        </div>
      </Popup>
    );
  };

  const handleSliderChange = (e) => {
    setCurrentStep(parseInt(e.target.value, 10));
  };

  const currentPlaybackPoint = historyCoordinates[currentStep] || null;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(PATHS.MACHINES)}
          className="p-2.5 bg-white dark:bg-emerald-950/20 border border-gray-200 dark:border-emerald-900/30 rounded-xl text-xs hover:bg-gray-100 dark:text-emerald-400 transition-colors"
        >
          <FaChevronLeft />
        </button>
        <div>
          <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">{machine.type}</span>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            {machine.name}
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase leading-none ${
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

      {/* Tabs navigation */}
      <div className="flex gap-1 overflow-x-auto border-b border-gray-200 dark:border-emerald-950/20 pb-1.5 custom-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-xs font-bold flex items-center gap-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 font-extrabold shadow-sm'
                  : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <Icon className="text-sm" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Unified Tile Layer selector helper overlay */}
      {(activeTab === 'overview' || activeTab === 'live_tracking' || activeTab === 'history') && (
        <div className="flex items-center justify-end gap-2 text-[10px] font-bold py-1 bg-gray-50 dark:bg-emerald-950/10 px-3 rounded-lg border border-gray-150 dark:border-emerald-950/20 self-end">
          <span className="text-gray-400 flex items-center gap-1"><FaRoad /> Map Style:</span>
          {['streets', 'satellite', 'terrain'].map(layer => (
            <button
              key={layer}
              onClick={() => setActiveLayer(layer)}
              className={`px-2 py-0.5 rounded capitalize transition-all cursor-pointer ${
                activeLayer === layer 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-white dark:bg-[#0e1712] border border-gray-200 dark:border-emerald-950/30 text-gray-600 dark:text-emerald-300'
              }`}
            >
              {layer}
            </button>
          ))}
        </div>
      )}

      {/* Tabs panels */}
      <div className="mt-4">
        
        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Real-time diagnostics metadata */}
            <div className="p-5 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider">Asset Live Diagnostics</h3>
              
              <div className="divide-y divide-gray-100 dark:divide-emerald-950/25 text-xs font-semibold">
                <div className="py-2.5 flex justify-between">
                  <span className="text-gray-400">GPS Connection</span>
                  <span className={`flex items-center gap-1.5 font-bold ${machine.status === 'Offline' ? 'text-red-500' : 'text-emerald-600'}`}>
                    <FaLink />
                    GPS {machine.status === 'Offline' ? 'Offline' : 'Online'}
                  </span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-gray-400">Ignition State</span>
                  <span className={`flex items-center gap-1.5 font-bold ${machine.engineStatus === 'On' ? 'text-emerald-600' : 'text-red-500'}`}>
                    <FaPowerOff />
                    Engine {machine.engineStatus === 'On' ? 'ON' : 'OFF'}
                  </span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-gray-400">Current Velocity</span>
                  <span>{machine.speed || 0} km/h</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-gray-400">Today's Working Hours</span>
                  <span>{machine.workingHours?.toFixed(1) || 0} Hrs</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-gray-400">Today's Idle Time</span>
                  <span>{machine.idleTime?.toFixed(2) || 0} Hrs</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-gray-400">Distance Travelled</span>
                  <span>{machine.distanceTravelled?.toFixed(1) || 0} km</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-gray-400">Area Covered</span>
                  <span>{machine.areaCovered?.toFixed(1) || 0} Hectares</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-gray-400">Fuel Level</span>
                  <span className="flex items-center gap-1.5">
                    <FaGasPump className={machine.fuel < 20 ? 'text-red-500' : 'text-emerald-500'} />
                    {machine.fuel}%
                  </span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-gray-400">Assigned Driver</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{assignedDriver}</span>
                </div>
              </div>
            </div>

            {/* GPS Trace map */}
            <div className="lg:col-span-2 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
              <div className="p-4 border-b border-gray-100 dark:border-emerald-950/25 flex justify-between items-center shrink-0">
                <div>
                  <h3 className="text-sm font-bold dark:text-white">Active Location Trace</h3>
                  <p className="text-[10px] text-gray-400 font-semibold">{machine.currentAddress || 'Cheruvupally Village, Telangana'}</p>
                </div>
                <span className="text-[10px] font-mono bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded border border-emerald-250 dark:border-emerald-900/30">
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
                    attribution={MAP_LAYERS[activeLayer].attribution}
                    url={MAP_LAYERS[activeLayer].url}
                  />
                  <RecenterMap center={[machine.location.lat, machine.location.lng]} />
                  <Marker position={[machine.location.lat, machine.location.lng]} icon={customPin}>
                    {renderMapPopup(
                      machine.location,
                      machine.name,
                      machine.speed,
                      machine.engineStatus,
                      machine.status === 'Offline' ? 'Offline' : 'Online',
                      machine.currentAddress
                    )}
                  </Marker>
                </MapContainer>
              </div>
            </div>
          </div>
        )}

        {/* 2. VEHICLE INFO TAB */}
        {activeTab === 'vehicle_info' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Specifications card */}
            <div className="p-5 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider">Specifications</h3>
              
              <div className="divide-y divide-gray-100 dark:divide-emerald-[#0e1712] text-xs font-semibold">
                <div className="py-2.5 flex justify-between">
                  <span className="text-gray-400">Manufacturer Brand</span>
                  <span>{machine.brand}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-gray-400">Model Name</span>
                  <span>{machine.model}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-gray-400">Chassis Number</span>
                  <span className="font-mono">{machine.chassisNumber}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-gray-400">Engine Number</span>
                  <span className="font-mono">{machine.engineNumber}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-gray-400">Registration Tag</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-450">{machine.registration}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-gray-400">RC Registered Owner</span>
                  <span>{machine.rcOwnerName}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-gray-400">Purchase Date</span>
                  <span>{new Date(machine.purchaseDate).toLocaleDateString()}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-gray-400">Manufacturing Year</span>
                  <span>{machine.manufacturingYear}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-gray-400">Insurance Expiry</span>
                  <span>{new Date(machine.insuranceExpiry).toLocaleDateString()}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-gray-400">Fitness Expiry</span>
                  <span>{new Date(machine.fitnessExpiry).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Photos and Manuals */}
            <div className="lg:col-span-2 space-y-6">
              {/* Photo Log */}
              <div className="p-5 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                  <FaCamera className="text-emerald-600" /> Photographic Log
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-44 bg-gray-100 dark:bg-emerald-950/15 rounded-xl overflow-hidden shadow-inner">
                    <img src={machine.photo} alt="Asset front" className="w-full h-full object-cover" />
                  </div>
                  <div className="h-44 bg-gray-150 dark:bg-emerald-950/10 rounded-xl border border-dashed border-gray-300 dark:border-emerald-900/30 flex items-center justify-center text-xs text-gray-400 font-bold">
                    Secondary angle log empty
                  </div>
                </div>
              </div>

              {/* Documentation */}
              <div className="p-5 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Operations Documentation</h3>
                <div className="space-y-3">
                  {machine.documents.map((doc, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 dark:bg-emerald-950/10 border border-gray-100 dark:border-emerald-950/20 rounded-xl text-xs flex justify-between items-center font-bold">
                      <span className="font-semibold truncate pr-3">{doc}</span>
                      <button className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm border-0 cursor-pointer">
                        <FaDownload className="text-[9px]" /> Download
                      </button>
                    </div>
                  ))}
                  {machine.documents.length === 0 && (
                    <div className="p-3 bg-gray-50 dark:bg-emerald-950/10 border border-gray-100 dark:border-emerald-950/20 rounded-xl text-xs flex justify-between items-center font-bold">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Standard_Operator_Manual.pdf</span>
                      <button className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm border-0 cursor-pointer">
                        <FaDownload className="text-[9px]" /> Download
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. DEVICE INFO TAB */}
        {activeTab === 'device_info' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Device specs diagnostics */}
            <div className="p-5 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider">IoT Hardware Details</h3>
              
              <div className="divide-y divide-gray-100 dark:divide-emerald-[#0e1712] text-xs font-semibold">
                <div className="py-3 flex justify-between">
                  <span className="text-gray-400">GPS Device ID</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-450">
                    {typeof machine.gpsDeviceId === 'object' ? machine.gpsDeviceId.deviceId : (machine.gpsDeviceId || 'dev-mach-1')}
                  </span>
                </div>
                <div className="py-3 flex justify-between">
                  <span className="text-gray-400">IMEI Code</span>
                  <span className="font-mono text-gray-700 dark:text-gray-300">359876543210001</span>
                </div>
                <div className="py-3 flex justify-between">
                  <span className="text-gray-400">SIM ICCID Code</span>
                  <span className="font-mono text-gray-700 dark:text-gray-300">8991123456789012345F</span>
                </div>
                <div className="py-3 flex justify-between">
                  <span className="text-gray-400">SIM Cellular Provider</span>
                  <span>Airtel M2M IoT</span>
                </div>
                <div className="py-3 flex justify-between">
                  <span className="text-gray-400">Firmware Build</span>
                  <span className="font-mono text-gray-700 dark:text-gray-300">v4.12.8-stable</span>
                </div>
                <div className="py-3 flex justify-between">
                  <span className="text-gray-400">Signal Strength</span>
                  <span className="text-emerald-500 font-bold">Excellent (-85 dBm)</span>
                </div>
                <div className="py-3 flex justify-between items-center">
                  <span className="text-gray-400">Activation Status</span>
                  <span className="px-2.5 py-0.5 rounded font-black text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">Activated</span>
                </div>
                <div className="py-3 flex justify-between">
                  <span className="text-gray-400">Hardware Serial</span>
                  <span className="font-mono">SN-KIT-987321</span>
                </div>
              </div>
            </div>

            {/* QR Scan key code card */}
            <div className="p-5 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center space-y-4">
              <h3 className="text-sm font-bold text-gray-805 dark:text-white uppercase tracking-wider self-start">Vector QR Scan Key</h3>
              
              <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl">
                <svg className="w-36 h-36 text-emerald-800 dark:text-emerald-400" viewBox="0 0 100 100" fill="currentColor">
                  <path d="M5,5 h30 v10 h-20 v20 h-10 z" />
                  <path d="M65,5 h30 v30 h-10 v-20 h-20 z" />
                  <path d="M5,65 h10 v20 h-20 v-30 h-10 z" />
                  <path d="M65,95 h30 v-10 h-20 v-20 h-10 z" />
                  <rect x="15" y="15" width="20" height="20" rx="2" />
                  <rect x="19" y="19" width="12" height="12" rx="1" fill="none" stroke="currentColor" strokeWidth="2" />
                  <rect x="65" y="15" width="20" height="20" rx="2" />
                  <rect x="69" y="19" width="12" height="12" rx="1" fill="none" stroke="currentColor" strokeWidth="2" />
                  <rect x="15" y="65" width="20" height="20" rx="2" />
                  <rect x="19" y="69" width="12" height="12" rx="1" fill="none" stroke="currentColor" strokeWidth="2" />
                  <rect x="45" y="20" width="8" height="8" rx="1" />
                  <rect x="45" y="32" width="12" height="6" rx="1" />
                  <rect x="40" y="45" width="6" height="10" rx="1" />
                  <rect x="55" y="45" width="10" height="8" rx="1" />
                  <rect x="65" y="45" width="8" height="8" rx="1" />
                  <rect x="45" y="65" width="12" height="8" rx="1" />
                  <rect x="65" y="65" width="6" height="12" rx="1" />
                  <rect x="45" y="80" width="8" height="8" rx="1" />
                  <rect x="58" y="80" width="12" height="6" rx="1" />
                </svg>
              </div>
              <p className="text-[10px] text-gray-400 font-bold leading-relaxed max-w-[200px]">
                Scan this hardware tag to audit serial numbers or execute manual field swap logs.
              </p>
            </div>

            {/* Lifecycle History */}
            <div className="p-5 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider">Lifecycle History</h3>
              
              <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-500/35">
                <div className="flex gap-3 items-start relative pl-8">
                  <div className="absolute left-[7px] w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-[#0e1712] top-1" />
                  <div>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-450 block uppercase">Activated</span>
                    <p className="text-xs font-bold dark:text-white mt-0.5">GPS tracker registered to warehouse</p>
                    <span className="text-[9px] text-gray-400">Date: 2026-03-12 11:24 AM</span>
                  </div>
                </div>
                <div className="flex gap-3 items-start relative pl-8">
                  <div className="absolute left-[7px] w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-[#0e1712] top-1" />
                  <div>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-450 block uppercase">Chassis Linked</span>
                    <p className="text-xs font-bold dark:text-white mt-0.5">Assigned to registration {machine.registration}</p>
                    <span className="text-[9px] text-gray-400">Date: 2026-03-12 01:45 PM</span>
                  </div>
                </div>
                <div className="flex gap-3 items-start relative pl-8">
                  <div className="absolute left-[7px] w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-[#0e1712] top-1" />
                  <div>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-450 block uppercase">Fleet Assigned</span>
                    <p className="text-xs font-bold dark:text-white mt-0.5">Activated in Cheruvupally Division</p>
                    <span className="text-[9px] text-gray-400">Date: 2026-03-15 09:00 AM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. LIVE TRACKING TAB */}
        {activeTab === 'live_tracking' && (
          <div className="bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
            <div className="p-4 border-b border-gray-100 dark:border-emerald-950/25 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold dark:text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live GPS Tracking Stream
                </h3>
                <p className="text-[10px] text-gray-400 mt-0.5">Visualizing live coordinates, heading angle and engine statuses.</p>
              </div>
              <div className="text-[10px] font-mono bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded border border-emerald-250 dark:border-emerald-900/30">
                {machine.location.lat.toFixed(5)}, {machine.location.lng.toFixed(5)}
              </div>
            </div>

            <div className="h-[450px] w-full relative z-0">
              <MapContainer 
                center={[machine.location.lat, machine.location.lng]} 
                zoom={16} 
                style={{ width: '100%', height: '100%' }}
              >
                <TileLayer
                  attribution={MAP_LAYERS[activeLayer].attribution}
                  url={MAP_LAYERS[activeLayer].url}
                />
                <RecenterMap center={[machine.location.lat, machine.location.lng]} />
                <Marker position={[machine.location.lat, machine.location.lng]} icon={customPin}>
                  {renderMapPopup(
                    machine.location,
                    machine.name,
                    machine.speed,
                    machine.engineStatus,
                    machine.status === 'Offline' ? 'Offline' : 'Online',
                    machine.currentAddress
                  )}
                </Marker>
              </MapContainer>
            </div>
          </div>
        )}

        {/* 5. GPS HISTORY / PLAYBACK TAB */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            
            {/* Playback map */}
            <div className="bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
              
              <div className="p-4 border-b border-gray-100 dark:border-emerald-950/25 flex flex-col sm:flex-row justify-between sm:items-center gap-3 shrink-0">
                <div>
                  <h3 className="text-sm font-bold dark:text-white">Route Playback Simulator</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">Replaying historic coordinates trail trace.</p>
                </div>
                
                {/* Playback Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentStep(0)}
                    className="p-1.5 bg-gray-50 hover:bg-gray-100 dark:bg-emerald-950/20 border border-gray-200 dark:border-emerald-900/30 rounded-lg text-xs"
                    title="Reset to Start"
                  >
                    <FaStepBackward />
                  </button>
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs flex items-center justify-center"
                    title={isPlaying ? 'Pause Replay' : 'Start Playback'}
                  >
                    {isPlaying ? <FaPause /> : <FaPlay />}
                  </button>
                  <select
                    value={playbackSpeed}
                    onChange={(e) => setPlaybackSpeed(parseInt(e.target.value))}
                    className="px-2 py-1 text-[10px] font-bold bg-white dark:bg-emerald-950/20 border border-gray-200 dark:border-emerald-900/30 rounded-lg focus:outline-none dark:text-white"
                  >
                    <option value={1500}>0.5x Speed</option>
                    <option value={1000}>1.0x Speed</option>
                    <option value={500}>2.0x Speed</option>
                    <option value={200}>5.0x Speed</option>
                  </select>
                </div>
              </div>

              <div className="h-[350px] w-full relative z-0">
                <MapContainer 
                  center={currentPlaybackPoint ? [currentPlaybackPoint.lat, currentPlaybackPoint.lng] : [machine.location.lat, machine.location.lng]} 
                  zoom={15} 
                  style={{ width: '100%', height: '100%' }}
                >
                  <TileLayer
                    attribution={MAP_LAYERS[activeLayer].attribution}
                    url={MAP_LAYERS[activeLayer].url}
                  />
                  {currentPlaybackPoint && <RecenterMap center={[currentPlaybackPoint.lat, currentPlaybackPoint.lng]} />}
                  
                  {/* Historical trail polyline */}
                  {historyCoordinates.length > 0 && (
                    <Polyline 
                      positions={historyCoordinates.map(pt => [pt.lat, pt.lng])} 
                      color="#059669" 
                      weight={4}
                      opacity={0.8}
                    />
                  )}

                  {/* Playback animate marker */}
                  {currentPlaybackPoint && (
                    <Marker position={[currentPlaybackPoint.lat, currentPlaybackPoint.lng]} icon={customPin}>
                      {renderMapPopup(
                        currentPlaybackPoint,
                        `${machine.name} (Replay)`,
                        currentPlaybackPoint.speed,
                        currentPlaybackPoint.speed > 2 ? 'On' : 'Off',
                        'Online History',
                        `Point ${currentStep + 1} of ${historyCoordinates.length}`
                      )}
                    </Marker>
                  )}
                </MapContainer>
              </div>

              {/* Slider timeline */}
              {historyCoordinates.length > 0 && (
                <div className="p-4 bg-gray-50/50 dark:bg-emerald-950/10 border-t border-gray-100 dark:border-emerald-950/20 space-y-2">
                  <div className="flex justify-between text-[10px] text-gray-500 font-bold">
                    <span>Replay Progress: {currentStep + 1} / {historyCoordinates.length}</span>
                    <span>Active Speed: {currentPlaybackPoint?.speed || 0} km/h</span>
                    <span>Time: {currentPlaybackPoint?.timestamp ? new Date(currentPlaybackPoint.timestamp).toLocaleTimeString() : 'N/A'}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={historyCoordinates.length - 1}
                    value={currentStep}
                    onChange={handleSliderChange}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                </div>
              )}
            </div>

            {/* Playback speed curve graph */}
            <div className="p-5 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider mb-2">Velocity Profile Analytics</h3>
              <p className="text-[10px] text-gray-400 mb-4">Speed graphs recorded during route playback tracking.</p>
              
              <div className="h-56 w-full text-xs">
                {historyCoordinates.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={historyCoordinates.map((pt, idx) => ({
                      time: pt.timestamp ? new Date(pt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : `Pt ${idx}`,
                      speed: pt.speed,
                      active: idx === currentStep
                    }))} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="time" tick={{ fontSize: 9 }} />
                      <YAxis tick={{ fontSize: 9 }} label={{ value: 'km/h', angle: -90, position: 'insideLeft', fontSize: 9 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff' }} />
                      <Line type="monotone" dataKey="speed" stroke="#10b981" strokeWidth={2.5} dot={(props) => {
                        const { cx, cy, payload } = props;
                        if (payload.active) {
                          return <circle cx={cx} cy={cy} r={6} fill="#f59e0b" stroke="#fff" strokeWidth={2} />;
                        }
                        return <circle cx={cx} cy={cy} r={2} fill="#10b981" />;
                      }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-450">No coordinates recorded for speed profile.</div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* 6. REPORTS TAB */}
        {activeTab === 'reports' && (
          <div className="bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl p-5 shadow-sm space-y-5">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider">Operations Reports Log</h3>
              <p className="text-[10px] text-gray-400">Daily, Weekly, and Monthly diagnostics generated for {machine.name}.</p>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="border-b border-gray-150 dark:border-emerald-950/20 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5">Timeframe</th>
                    <th className="py-2.5 text-center">Distance Travelled</th>
                    <th className="py-2.5 text-center">Fuel Used</th>
                    <th className="py-2.5 text-center">Working Hours</th>
                    <th className="py-2.5 text-center">Idle Time</th>
                    <th className="py-2.5 text-center">Area Covered</th>
                    <th className="py-2.5 text-center">Average Speed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150 dark:divide-emerald-950/10">
                  {/* Daily Report row */}
                  <tr className="hover:bg-gray-50/50 dark:hover:bg-emerald-950/5 text-gray-700 dark:text-gray-300 font-medium">
                    <td className="py-3 font-bold text-gray-900 dark:text-white">Daily (Today)</td>
                    <td className="py-3 text-center">{machine.distanceTravelled?.toFixed(1) || 0} km</td>
                    <td className="py-3 text-center">{Math.round((machine.workingHours || 0) * 12)} Litres</td>
                    <td className="py-3 text-center">{machine.workingHours?.toFixed(1) || 0} hrs</td>
                    <td className="py-3 text-center">{machine.idleTime?.toFixed(2) || 0} hrs</td>
                    <td className="py-3 text-center">{machine.areaCovered?.toFixed(1) || 0} ha</td>
                    <td className="py-3 text-center">
                      {machine.workingHours > 0 ? ((machine.distanceTravelled / machine.workingHours).toFixed(1)) : '0.0'} km/h
                    </td>
                  </tr>

                  {/* Weekly Report row */}
                  <tr className="hover:bg-gray-50/50 dark:hover:bg-emerald-950/5 text-gray-700 dark:text-gray-300 font-medium">
                    <td className="py-3 font-bold text-gray-900 dark:text-white">Weekly (Last 7 Days)</td>
                    <td className="py-3 text-center">{(machine.distanceTravelled * 4.2).toFixed(1)} km</td>
                    <td className="py-3 text-center">{Math.round((machine.workingHours || 0) * 12 * 4.2)} Litres</td>
                    <td className="py-3 text-center">{(machine.workingHours * 4.2).toFixed(1)} hrs</td>
                    <td className="py-3 text-center">{(machine.idleTime * 3.8).toFixed(2)} hrs</td>
                    <td className="py-3 text-center">{(machine.areaCovered * 4.2).toFixed(1)} ha</td>
                    <td className="py-3 text-center">11.4 km/h</td>
                  </tr>

                  {/* Monthly Report row */}
                  <tr className="hover:bg-gray-50/50 dark:hover:bg-emerald-950/5 text-gray-700 dark:text-gray-300 font-medium">
                    <td className="py-3 font-bold text-gray-900 dark:text-white">Monthly (Last 30 Days)</td>
                    <td className="py-3 text-center">{(machine.distanceTravelled * 16.5).toFixed(1)} km</td>
                    <td className="py-3 text-center">{Math.round((machine.workingHours || 0) * 12 * 16.5)} Litres</td>
                    <td className="py-3 text-center">{(machine.workingHours * 16.5).toFixed(1)} hrs</td>
                    <td className="py-3 text-center">{(machine.idleTime * 14.2).toFixed(2)} hrs</td>
                    <td className="py-3 text-center">{(machine.areaCovered * 16.5).toFixed(1)} ha</td>
                    <td className="py-3 text-center">10.8 km/h</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-emerald-950/20 flex justify-end">
              <button
                onClick={() => {
                  window.open(`${api.defaults.baseURL}/reports/export/devices?format=csv`, '_blank');
                  toast.success('Triggered operations report sheet CSV export.');
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md border-0 cursor-pointer"
              >
                <FaDownload className="text-xs" /> Export Complete Device Reports
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

export default MachineDetail;
