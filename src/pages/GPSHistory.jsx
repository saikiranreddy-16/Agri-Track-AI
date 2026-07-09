import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  FaPlay, FaPause, FaStepBackward, FaTractor, FaClock, 
  FaGasPump, FaCompass, FaMapMarkerAlt, FaSignOutAlt 
} from 'react-icons/fa';
import { mockHistoryPaths, mockHistoryStops, mockMachines } from '../data/mockData';

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

// Create custom icons for historical states
const createPinIcon = (color, text) => {
  return L.divIcon({
    html: `
      <div class="flex items-center justify-center w-6 h-6 rounded-full border border-white shadow-md text-white font-bold text-[9px]" style="background-color: ${color};">
        ${text}
      </div>
    `,
    className: 'custom-history-pin',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

export const GPSHistory = () => {
  const location = useLocation();

  // Find requested machine or fall back to machine-1
  const [selectedMachineId, setSelectedMachineId] = useState(() => {
    return location.state?.historyMachineId || 'mach-1';
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1000); // ms per step

  const pathCoordinates = mockHistoryPaths[selectedMachineId] || [];
  const stopMarkers = mockHistoryStops[selectedMachineId] || [];
  const activeMachine = mockMachines.find(m => m.id === selectedMachineId);

  // Sync index boundary on machine switch
  useEffect(() => {
    setCurrentStep(0);
    setIsPlaying(false);
  }, [selectedMachineId]);

  // Autoplay interval
  useEffect(() => {
    let timer = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= pathCoordinates.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, playbackSpeed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, pathCoordinates, playbackSpeed]);

  const activePoint = pathCoordinates[currentStep] || null;
  const polylinePositions = pathCoordinates.map(pt => [pt.lat, pt.lng]);

  const handleSliderChange = (e) => {
    setCurrentStep(parseInt(e.target.value, 10));
  };

  const speedChartData = pathCoordinates.map((pt, idx) => ({
    time: pt.timestamp,
    speed: pt.speed,
    isActive: idx === currentStep
  }));

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
            GPS Route History Playback
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Replay historical paths, review stops, and analyze velocity trends.
          </p>
        </div>

        {/* Machine selector */}
        <select
          value={selectedMachineId}
          onChange={(e) => setSelectedMachineId(e.target.value)}
          className="px-3 py-2 text-xs font-bold bg-white dark:bg-[#0e1712] border border-gray-200 dark:border-emerald-950/40 rounded-xl focus:outline-none dark:text-white"
        >
          {mockMachines.map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Playback Controls & Stats Panel */}
        <div className="p-5 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl shadow-sm space-y-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-white">
            Playback Controller
          </h2>

          {/* Timeline slider and Play controls */}
          <div className="space-y-3.5 p-4 bg-gray-50 dark:bg-emerald-950/10 rounded-2xl border border-gray-100 dark:border-emerald-950/20">
            <div className="flex justify-between items-center text-xs font-bold text-gray-500 dark:text-gray-400">
              <span>Start: {pathCoordinates[0]?.timestamp || 'N/A'}</span>
              <span>End: {pathCoordinates[pathCoordinates.length - 1]?.timestamp || 'N/A'}</span>
            </div>

            <input
              type="range"
              min="0"
              max={Math.max(0, pathCoordinates.length - 1)}
              value={currentStep}
              onChange={handleSliderChange}
              className="w-full accent-emerald-500 bg-gray-200 h-1.5 rounded-lg appearance-none cursor-pointer"
            />

            <div className="flex justify-between items-center pt-2">
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentStep(0)}
                  className="p-2.5 bg-white dark:bg-emerald-950/30 border border-gray-200 dark:border-emerald-900/30 rounded-xl text-xs hover:bg-gray-100 transition-colors"
                  title="Reset to Start"
                >
                  <FaStepBackward />
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm flex items-center gap-2 transition-all"
                >
                  {isPlaying ? <><FaPause /> Pause</> : <><FaPlay /> Play</>}
                </button>
              </div>

              {/* Playback speed multiplier */}
              <div className="flex gap-1">
                {[1000, 500, 200].map((spd, idx) => (
                  <button
                    key={spd}
                    onClick={() => setPlaybackSpeed(spd)}
                    className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all ${
                      playbackSpeed === spd
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white dark:bg-emerald-950/30 border border-gray-200 dark:border-emerald-900/30 text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {idx + 1}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Telemetry data at current step */}
          {activePoint && (
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-gray-50 dark:bg-emerald-950/10 rounded-xl border border-gray-100 dark:border-emerald-950/20">
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Timestamp</div>
                <div className="font-bold flex items-center gap-1.5">
                  <FaClock className="text-emerald-500" /> {activePoint.timestamp}
                </div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-emerald-950/10 rounded-xl border border-gray-100 dark:border-emerald-950/20">
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Speed</div>
                <div className="font-bold flex items-center gap-1.5">
                  <FaCompass className="text-emerald-500" /> {activePoint.speed} km/h
                </div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-emerald-950/10 rounded-xl border border-gray-100 dark:border-emerald-950/20">
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Fuel Tank</div>
                <div className="font-bold flex items-center gap-1.5">
                  <FaGasPump className="text-orange-500" /> {activePoint.fuel}%
                </div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-emerald-950/10 rounded-xl border border-gray-100 dark:border-emerald-950/20">
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Telemetry Location</div>
                <div className="font-mono text-[9px] text-emerald-600 dark:text-emerald-400 truncate">
                  {activePoint.lat.toFixed(5)}, {activePoint.lng.toFixed(5)}
                </div>
              </div>
            </div>
          )}

          {/* Stops List */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Registered Stops</h3>
            <div className="space-y-2 max-h-36 overflow-y-auto pr-1 custom-scrollbar">
              {stopMarkers.map((stop, idx) => (
                <div key={idx} className="p-2.5 bg-gray-50 dark:bg-emerald-950/10 border border-gray-100 dark:border-emerald-950/20 rounded-xl text-xs flex justify-between items-center">
                  <div>
                    <div className="font-bold dark:text-white flex items-center gap-1">
                      <FaMapMarkerAlt className="text-red-500" /> {stop.name}
                    </div>
                    <span className="text-[10px] text-gray-400">{stop.timestamp}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-200 dark:bg-emerald-900/30 text-gray-600 dark:text-emerald-400">
                    {stop.duration}
                  </span>
                </div>
              ))}
              {stopMarkers.length === 0 && (
                <div className="text-center py-6 text-xs text-gray-400">No stops registered during this shift.</div>
              )}
            </div>
          </div>
        </div>

        {/* Map Panel & Speed chart */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Map View */}
          <div className="h-96 rounded-2xl overflow-hidden border border-gray-100 dark:border-emerald-950/30 shadow-sm relative">
            {polylinePositions.length > 0 ? (
              <MapContainer 
                center={polylinePositions[0]} 
                zoom={14} 
                style={{ width: '100%', height: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {activePoint && <RecenterMap center={[activePoint.lat, activePoint.lng]} />}

                {/* Path line */}
                <Polyline positions={polylinePositions} color="#10b981" weight={4} dashArray="5, 10" />

                {/* Moving GPS Marker */}
                {activePoint && (
                  <Marker 
                    position={[activePoint.lat, activePoint.lng]} 
                    icon={createPinIcon('#10b981', '▶')}
                  >
                    <Popup>
                      <div className="text-xs">
                        <strong>Current Telemetry</strong><br />
                        Speed: {activePoint.speed} km/h<br />
                        Fuel: {activePoint.fuel}%
                      </div>
                    </Popup>
                  </Marker>
                )}

                {/* Stops Marker Pins */}
                {stopMarkers.map((stop, index) => (
                  <Marker
                    key={index}
                    position={[stop.lat, stop.lng]}
                    icon={createPinIcon('#ef4444', String.fromCharCode(65 + index))}
                  >
                    <Popup>
                      <div className="text-xs">
                        <strong>{stop.name}</strong><br />
                        Duration: {stop.duration}<br />
                        Time: {stop.timestamp}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-400 bg-gray-100">No coordinates path found.</div>
            )}
          </div>

          {/* Recharts Speed Graph */}
          <div className="p-5 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl shadow-sm">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Speed History Curve</h3>
            <div className="h-28 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={speedChartData} margin={{ top: 0, right: 10, left: -30, bottom: 0 }}>
                  <XAxis dataKey="time" tick={{ fontSize: 9 }} axisLine={false} />
                  <YAxis tick={{ fontSize: 9 }} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff', fontSize: '9px' }}
                    itemStyle={{ color: '#fff', fontSize: '9px' }}
                  />
                  <Line type="monotone" dataKey="speed" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
export default GPSHistory;
