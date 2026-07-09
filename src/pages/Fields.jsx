import React, { useState } from 'react';
import { MapContainer, TileLayer, Polygon, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  FaMap, FaMapMarkedAlt, FaCompass, FaPlus, FaCheckCircle, 
  FaRulerCombined, FaDrawPolygon, FaTractor 
} from 'react-icons/fa';
import { mockFields, mockMachines } from '../data/mockData';

// Fix Leaflet paths
import 'leaflet/dist/leaflet.css';

const RecenterMap = ({ center, zoom = 14 }) => {
  const map = useMap();
  React.useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
};

export const Fields = () => {
  const [fields, setFields] = useState(mockFields);
  const [selectedField, setSelectedField] = useState(mockFields[0]);
  const [mapCenter, setMapCenter] = useState([41.885, -87.645]);
  const [mapZoom, setMapZoom] = useState(13);
  
  // Modals / Overlays
  const [isDrawing, setIsDrawing] = useState(false);
  const [isMeasuring, setIsMeasuring] = useState(false);

  const getMachineName = (machineId) => {
    const mach = mockMachines.find(m => m.id === machineId);
    return mach ? mach.name : 'Unassigned';
  };

  const handleSelectField = (field) => {
    setSelectedField(field);
    // Find midpoint of boundaries to center map
    const lats = field.boundaries.map(b => b[0]);
    const lngs = field.boundaries.map(b => b[1]);
    const avgLat = lats.reduce((a, b) => a + b, 0) / lats.length;
    const avgLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;
    
    setMapCenter([avgLat, avgLng]);
    setMapZoom(14);
  };

  const toggleDrawingMode = () => {
    setIsDrawing(!isDrawing);
    setIsMeasuring(false);
  };

  const toggleMeasuringMode = () => {
    setIsMeasuring(!isMeasuring);
    setIsDrawing(false);
  };

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col lg:flex-row gap-4 relative overflow-hidden -m-4 md:-m-6">
      
      {/* Sidebar - Fields list */}
      <div className="w-full lg:w-80 shrink-0 bg-white dark:bg-[#0e1712] border-r border-gray-200 dark:border-emerald-950/30 flex flex-col h-full z-10">
        <div className="p-4 border-b border-gray-100 dark:border-emerald-950/20 space-y-2">
          <h2 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider">
            Field Boundaries
          </h2>
          <p className="text-[11px] text-gray-400">Select sectors to project coordinates.</p>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1.5">
          {fields.map((f) => (
            <div
              key={f.id}
              onClick={() => handleSelectField(f)}
              className={`p-3.5 rounded-xl cursor-pointer text-xs transition-all border ${
                selectedField?.id === f.id
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/30 shadow-sm'
                  : 'bg-white dark:bg-[#0e1712] border-transparent hover:bg-gray-50 dark:hover:bg-emerald-950/10'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="font-bold text-gray-850 dark:text-white truncate">{f.name}</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded leading-none uppercase bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-400">
                  {f.crop}
                </span>
              </div>
              <div className="flex items-center justify-between text-gray-400 mt-2.5">
                <span>Area: <strong>{f.area} ac</strong></span>
                <span className="truncate max-w-[120px]">Mach: {getMachineName(f.machineAssigned)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Map drawing canvas */}
      <div className="flex-1 h-full relative">
        <MapContainer 
          center={mapCenter} 
          zoom={mapZoom} 
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <RecenterMap center={mapCenter} zoom={mapZoom} />

          {/* Polygon Boundaries drawing */}
          {fields.map((f) => {
            const isSelected = selectedField?.id === f.id;
            return (
              <Polygon
                key={f.id}
                positions={f.boundaries}
                pathOptions={{
                  fillColor: isSelected ? '#10b981' : '#16a34a',
                  fillOpacity: isSelected ? 0.4 : 0.15,
                  color: isSelected ? '#047857' : '#16a34a',
                  weight: isSelected ? 3 : 1.5
                }}
                eventHandlers={{
                  click: () => {
                    setSelectedField(f);
                  }
                }}
              >
                <Popup>
                  <div className="text-xs">
                    <strong>{f.name}</strong><br />
                    Crop: {f.crop}<br />
                    Size: {f.area} Acres
                  </div>
                </Popup>
              </Polygon>
            );
          })}
        </MapContainer>

        {/* Floating actions menu */}
        <div className="absolute top-4 right-4 z-40 flex flex-col gap-2">
          <button
            onClick={toggleDrawingMode}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-xl shadow-lg border transition-all ${
              isDrawing 
                ? 'bg-emerald-600 border-emerald-650 text-white' 
                : 'bg-white border-gray-150 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FaDrawPolygon /> {isDrawing ? 'Drawing active...' : 'Draw boundaries'}
          </button>
          <button
            onClick={toggleMeasuringMode}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-xl shadow-lg border transition-all ${
              isMeasuring 
                ? 'bg-emerald-600 border-emerald-650 text-white' 
                : 'bg-white border-gray-150 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FaRulerCombined /> {isMeasuring ? 'Measuring active...' : 'Measure Field Area'}
          </button>
        </div>

        {/* Floating details Drawer */}
        {selectedField && (
          <div className="absolute bottom-4 left-4 right-4 lg:left-auto lg:right-4 z-30 lg:w-90 bg-white dark:bg-[#0f1913] border border-gray-100 dark:border-emerald-950/40 rounded-2xl shadow-2xl p-5">
            <h3 className="text-sm font-extrabold dark:text-white border-b border-gray-100 dark:border-emerald-950/20 pb-2 mb-3">
              {selectedField.name} Diagnostics
            </h3>
            
            <div className="text-xs space-y-3 font-semibold text-gray-500 dark:text-gray-400">
              <div className="flex justify-between">
                <span>Crop Selection</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{selectedField.crop}</span>
              </div>
              <div className="flex justify-between">
                <span>Field Area</span>
                <span className="text-gray-900 dark:text-white font-extrabold">{selectedField.area} Acres</span>
              </div>
              <div className="flex justify-between">
                <span>Landlord Owner</span>
                <span className="text-gray-800 dark:text-gray-200">{selectedField.owner}</span>
              </div>
              <div className="flex justify-between items-center border-t border-gray-150 dark:border-emerald-950/20 pt-2">
                <span>Assigned Harvester</span>
                <span className="text-gray-900 dark:text-white font-bold flex items-center gap-1">
                  <FaTractor className="text-[10px] text-emerald-500" />
                  {getMachineName(selectedField.machineAssigned)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* UI overlay message instructions */}
        {(isDrawing || isMeasuring) && (
          <div className="absolute top-4 left-4 z-40 bg-emerald-900 text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-semibold max-w-xs animate-pulse">
            {isDrawing 
              ? 'Click points on the map grid to lock boundary coordinates. Double-click to close polygon shape.' 
              : 'Click two distinct boundary fences on the grid map to calculate direct distance in meters.'}
            <button 
              onClick={() => { setIsDrawing(false); setIsMeasuring(false); }}
              className="block mt-2 text-[10px] uppercase font-bold text-orange-400 hover:underline"
            >
              Exit Calibration
            </button>
          </div>
        )}

      </div>

    </div>
  );
};
export default Fields;
