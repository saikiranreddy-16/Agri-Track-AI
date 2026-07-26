import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  FaPlay, FaPause, FaStepBackward, FaTractor, FaClock, 
  FaGasPump, FaCompass, FaMapMarkerAlt, FaThermometerHalf, 
  FaCalendarAlt, FaRedo, FaSquare 
} from 'react-icons/fa';
import api from '../utils/api';
import 'leaflet/dist/leaflet.css';

// Leaflet icon fix
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const MAP_LAYERS = {
  hybrid: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Esri, Maxar, Earthstar Geographics'
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Esri Satellite'
  },
  terrain: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'OpenTopoMap'
  },
  street: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: 'OpenStreetMap'
  }
};

const RecenterMap = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, 14);
  }, [center, map]);
  return null;
};

const createCustomPin = (color, text) => {
  return L.divIcon({
    html: `
      <div class="flex items-center justify-center w-7 h-7 rounded-full border-2 border-white shadow-lg text-white font-black text-[10px]" style="background-color: ${color};">
        ${text}
      </div>
    `,
    className: 'custom-trip-pin',
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
};

export const TripReplay = () => {
  const location = useLocation();

  const [machines, setMachines] = useState([]);
  const [selectedMachineId, setSelectedMachineId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeLayer, setActiveLayer] = useState('hybrid');

  const [tripData, setTripData] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1); // 1x, 2x, 4x, 8x

  useEffect(() => {
    fetchMachines();
  }, []);

  useEffect(() => {
    if (selectedMachineId) {
      fetchTripReplay();
    }
  }, [selectedMachineId, selectedDate]);

  // Autoplay loop
  useEffect(() => {
    let interval = null;
    if (isPlaying && tripData?.coordinates?.length > 0) {
      const stepDuration = Math.max(100, 1000 / speedMultiplier);
      interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= tripData.coordinates.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, stepDuration);
    }
    return () => clearInterval(interval);
  }, [isPlaying, speedMultiplier, tripData]);

  const fetchMachines = async () => {
    try {
      const res = await api.get('/machines');
      if (res.data && res.data.success && res.data.data.length > 0) {
        setMachines(res.data.data);
        const initialId = location.state?.selectedMachineId || res.data.data[0]._id;
        setSelectedMachineId(initialId);
      }
    } catch (err) {
      console.error('Error fetching machines for trip replay:', err);
    }
  };

  const fetchTripReplay = async () => {
    try {
      const res = await api.get(`/trip-replay/${selectedMachineId}?date=${selectedDate}`);
      if (res.data && res.data.success) {
        setTripData(res.data.data);
        setCurrentStep(0);
        setIsPlaying(false);
      }
    } catch (err) {
      console.error('Error loading trip replay data:', err);
    }
  };

  const coords = tripData?.coordinates || [];
  const activePt = coords[currentStep] || null;
  const polylinePositions = coords.map(c => [c.lat, c.lng]);

  const speedChartData = coords.map((c, i) => ({
    time: c.timestamp,
    speed: c.speed,
    temp: c.engineTemp,
    fuel: c.fuel,
    isActive: i === currentStep
  }));

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <FaClock className="text-emerald-500" /> Animated Trip Replay & Telemetry History
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Calendar trip selector, animated route playback, synchronized speed, temperature & fuel curves.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-2">
          <select
            value={selectedMachineId}
            onChange={(e) => setSelectedMachineId(e.target.value)}
            className="px-3 py-2 text-xs font-bold bg-white dark:bg-[#0e1712] border border-gray-200 dark:border-emerald-950/40 rounded-xl focus:outline-none dark:text-white"
          >
            {machines.map((m) => (
              <option key={m._id} value={m._id}>{m.name}</option>
            ))}
          </select>

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#0e1712] border border-gray-200 dark:border-emerald-950/40 rounded-xl text-xs font-bold dark:text-white">
            <FaCalendarAlt className="text-emerald-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent outline-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Controller Panel */}
        <div className="p-5 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl shadow-sm space-y-5">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-400">
            Playback Controller
          </h2>

          {/* Timeline & Player */}
          <div className="p-4 bg-gray-50 dark:bg-emerald-950/10 rounded-2xl border border-gray-100 dark:border-emerald-950/20 space-y-3.5">
            <div className="flex justify-between items-center text-xs font-bold text-gray-500 dark:text-gray-400">
              <span>Start: {coords[0]?.timestamp || '08:00 AM'}</span>
              <span>End: {coords[coords.length - 1]?.timestamp || '02:00 PM'}</span>
            </div>

            <input
              type="range"
              min="0"
              max={Math.max(0, coords.length - 1)}
              value={currentStep}
              onChange={(e) => setCurrentStep(Number(e.target.value))}
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
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm flex items-center gap-2 transition-all cursor-pointer"
                >
                  {isPlaying ? <><FaPause /> Pause</> : <><FaPlay /> Play</>}
                </button>
                <button
                  onClick={() => { setIsPlaying(false); setCurrentStep(0); }}
                  className="p-2.5 bg-white dark:bg-emerald-950/30 border border-gray-200 dark:border-emerald-900/30 rounded-xl text-xs hover:bg-gray-100 transition-colors"
                  title="Stop"
                >
                  <FaSquare />
                </button>
              </div>

              {/* Speed Multiplier */}
              <div className="flex gap-1">
                {[1, 2, 4, 8].map((mult) => (
                  <button
                    key={mult}
                    onClick={() => setSpeedMultiplier(mult)}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                      speedMultiplier === mult
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white dark:bg-emerald-950/30 border border-gray-200 dark:border-emerald-900/30 text-gray-500'
                    }`}
                  >
                    {mult}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Active Telemetry Point */}
          {activePt && (
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-gray-50 dark:bg-emerald-950/10 rounded-xl border border-gray-100 dark:border-emerald-950/20">
                <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">Time</div>
                <div className="font-bold flex items-center gap-1.5 dark:text-white">
                  <FaClock className="text-emerald-500" /> {activePt.timestamp}
                </div>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-emerald-950/10 rounded-xl border border-gray-100 dark:border-emerald-950/20">
                <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">Speed</div>
                <div className="font-bold flex items-center gap-1.5 dark:text-white">
                  <FaCompass className="text-emerald-500" /> {activePt.speed} km/h
                </div>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-emerald-950/10 rounded-xl border border-gray-100 dark:border-emerald-950/20">
                <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">Engine Temp</div>
                <div className="font-bold flex items-center gap-1.5 dark:text-white">
                  <FaThermometerHalf className="text-red-500" /> {activePt.engineTemp} °C
                </div>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-emerald-950/10 rounded-xl border border-gray-100 dark:border-emerald-950/20">
                <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">Fuel Remaining</div>
                <div className="font-bold flex items-center gap-1.5 dark:text-white">
                  <FaGasPump className="text-orange-500" /> {activePt.fuel}%
                </div>
              </div>
            </div>
          )}

          {/* Trip Summary Statistics */}
          <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-950/20 rounded-2xl text-xs space-y-2">
            <h3 className="font-extrabold text-emerald-600 dark:text-emerald-400 uppercase text-[10px]">Shift Summary Metrics</h3>
            <div className="grid grid-cols-2 gap-2 text-gray-600 dark:text-gray-300">
              <div>Distance: <strong className="text-gray-900 dark:text-white">{tripData?.distanceKm || 18.4} km</strong></div>
              <div>Working Hrs: <strong className="text-gray-900 dark:text-white">{tripData?.workingHours || 4.8} hrs</strong></div>
              <div>Idle Time: <strong className="text-gray-900 dark:text-white">{tripData?.idleTimeMinutes || 25} mins</strong></div>
              <div>Area Covered: <strong className="text-gray-900 dark:text-white">{tripData?.areaCoveredAcres || 6.2} acres</strong></div>
            </div>
          </div>
        </div>

        {/* Map View & Telemetry Curves */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Map */}
          <div className="h-96 rounded-2xl overflow-hidden border border-gray-100 dark:border-emerald-950/30 shadow-sm relative">
            <div className="absolute top-4 right-4 z-40 bg-white dark:bg-[#0e1712] p-1.5 rounded-xl shadow-lg border border-gray-100 dark:border-emerald-950/30 flex gap-1">
              {['hybrid', 'satellite', 'terrain', 'street'].map((lyr) => (
                <button
                  key={lyr}
                  onClick={() => setActiveLayer(lyr)}
                  className={`px-2 py-0.5 text-[9px] font-bold rounded capitalize cursor-pointer ${
                    activeLayer === lyr ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {lyr}
                </button>
              ))}
            </div>

            {polylinePositions.length > 0 && (
              <MapContainer
                center={polylinePositions[0]}
                zoom={14}
                style={{ width: '100%', height: '100%' }}
              >
                <TileLayer url={MAP_LAYERS[activeLayer].url} attribution={MAP_LAYERS[activeLayer].attribution} />
                {activePt && <RecenterMap center={[activePt.lat, activePt.lng]} />}

                <Polyline positions={polylinePositions} color="#10b981" weight={4} dashArray="5, 10" />

                {/* Animated Vehicle Marker */}
                {activePt && (
                  <Marker position={[activePt.lat, activePt.lng]} icon={createCustomPin('#10b981', '▶')}>
                    <Popup>
                      <div className="text-xs space-y-1">
                        <strong>Speed:</strong> {activePt.speed} km/h<br />
                        <strong>Temp:</strong> {activePt.engineTemp} °C<br />
                        <strong>Time:</strong> {activePt.timestamp}
                      </div>
                    </Popup>
                  </Marker>
                )}

                {/* Stop Markers */}
                {tripData?.stops?.map((stop, idx) => (
                  <Marker key={idx} position={[stop.lat, stop.lng]} icon={createCustomPin('#ef4444', String.fromCharCode(65 + idx))}>
                    <Popup>
                      <div className="text-xs">
                        <strong>Stop: {stop.name}</strong><br />
                        Duration: {stop.duration}<br />
                        Time: {stop.timestamp}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            )}
          </div>

          {/* Synchronized Recharts Speed & Temp Graphs */}
          <div className="p-5 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Synchronized Speed & Temperature Curves</h3>
            <div className="h-32 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={speedChartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="time" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 9 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', fontSize: '10px', color: '#fff' }} />
                  <Line type="monotone" dataKey="speed" stroke="#10b981" strokeWidth={2} dot={false} name="Speed (km/h)" />
                  <Line type="monotone" dataKey="temp" stroke="#ef4444" strokeWidth={2} dot={false} name="Temp (°C)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
export default TripReplay;
