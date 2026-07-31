import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import io from 'socket.io-client';
import api from '../utils/api';
import { 
  FaPlus, FaTh, FaList, FaTrash, FaPen, FaEye, FaSearch, 
  FaGasPump, FaBatteryThreeQuarters, FaCompass, FaLink, FaUserPlus,
  FaClock, FaUserTie, FaToggleOn, FaPowerOff, FaTools, FaSignal, FaMapMarkerAlt
} from 'react-icons/fa';
import { PATHS } from '../constants';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

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
  firstServiceHours: m.firstServiceHours || 50,
  regularServiceInterval: m.regularServiceInterval || 250,
  lastServiceHours: m.lastServiceHours || 0,
  currentEngineHours: m.currentEngineHours || 0,
  lastServiceDate: m.lastServiceDate,
  nextServiceDate: m.nextServiceDate,
  serviceStatus: m.serviceStatus || 'Good',
  engineType: m.engineType || 'Factory Integrated Engine'
});

export const Machines = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  // Local state for CRUD operations
  const [machinesList, setMachinesList] = useState([]);
  const [driversList, setDriversList] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Metadata dropdown state options
  const [brandsMetadata, setBrandsMetadata] = useState([]);
  const [typesMetadata, setTypesMetadata] = useState([]);
  const [formModels, setFormModels] = useState([]);
  const [formHpOptions, setFormHpOptions] = useState([]);

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [activeMachine, setActiveMachine] = useState(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('Tractor');
  const [formBrandId, setFormBrandId] = useState('');
  const [formModelId, setFormModelId] = useState('');
  const [formHp, setFormHp] = useState('');
  const [formReg, setFormReg] = useState('');
  const [formDriver, setFormDriver] = useState('');
  const [formFuel, setFormFuel] = useState(100);
  const [formStatus, setFormStatus] = useState('Idle');
  
  // Custom Service & Engine Configs
  const [formEngineType, setFormEngineType] = useState('Factory Integrated Engine');
  const [formFirstServiceHours, setFormFirstServiceHours] = useState(50);
  const [formRegularServiceInterval, setFormRegularServiceInterval] = useState(250);
  const [formLastServiceHours, setFormLastServiceHours] = useState(0);

  // Load initial database records
  useEffect(() => {
    const loadData = async () => {
      try {
        const [machRes, drvRes, metaRes] = await Promise.all([
          api.get('/machines'),
          api.get('/drivers'),
          api.get('/machines/vehicle-metadata')
        ]);
        if (machRes.data && machRes.data.success) {
          setMachinesList(machRes.data.data.map(formatMachine));
        }
        if (drvRes.data && drvRes.data.success) {
          setDriversList(drvRes.data.data);
        }
        if (metaRes.data && metaRes.data.success) {
          setTypesMetadata(['Tractor', 'Track Harvester', 'Combine Harvester']);
          setBrandsMetadata(metaRes.data.data.brands);
        }
      } catch (error) {
        console.error('Failed to load fleet and driver records:', error);
      }
    };
    loadData();
  }, []);

  // Sync machinery positions dynamically
  useEffect(() => {
    const socket = io('http://localhost:5000', { withCredentials: true });
    
    socket.on('machineUpdate', (updated) => {
      const formatted = formatMachine(updated);
      setMachinesList(prev => prev.map(m => m.id === formatted.id ? formatted : m));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Handle cascaded vehicle metadata dropdown changes
  const handleVehicleTypeChange = (typeVal) => {
    setFormType(typeVal);
    setFormBrandId('');
    setFormModelId('');
    setFormHp('');
    setFormModels([]);
    setFormHpOptions([]);
    setFormEngineType('Factory Integrated Engine');
  };

  const handleBrandChange = (brandId) => {
    setFormBrandId(brandId);
    setFormModelId('');
    setFormHp('');
    setFormModels([]);
    setFormHpOptions([]);
    if (!brandId) return;
    const foundBrand = brandsMetadata.find(b => b._id === brandId);
    if (foundBrand) {
      setFormModels(foundBrand.models.filter(m => m.vehicleType === formType));
    }
  };

  const handleModelChange = (modelId) => {
    setFormModelId(modelId);
    setFormHp('');
    setFormHpOptions([]);
    if (!modelId) return;
    const foundModel = formModels.find(m => m._id === modelId);
    if (foundModel) {
      setFormHpOptions(foundModel.hpOptions || []);
      if (formType === 'Combine Harvester') {
        if (foundModel.engineConfig === 'External') {
          setFormEngineType('John Deere Engine');
        } else {
          setFormEngineType('Factory Integrated Engine');
        }
      } else {
        setFormEngineType('Factory Integrated Engine');
      }
    }
  };

  const getDriverName = (assignedDriver) => {
    if (!assignedDriver) return 'Unassigned';
    if (typeof assignedDriver === 'object') return assignedDriver.name;
    const drv = driversList.find(d => d._id === assignedDriver || d.id === assignedDriver);
    return drv ? drv.name : 'Unassigned';
  };

  const handleOpenAdd = () => {
    setFormName('');
    setFormType('Tractor');
    setFormBrandId('');
    setFormModelId('');
    setFormHp('');
    setFormModels([]);
    setFormHpOptions([]);
    setFormReg('');
    setFormDriver('');
    setFormFuel(100);
    setFormEngineType('Factory Integrated Engine');
    setFormFirstServiceHours(50);
    setFormRegularServiceInterval(250);
    setFormLastServiceHours(0);
    setIsAddOpen(true);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!formName || !formBrandId || !formReg) {
      toast.error('Name, Brand, and Registration are required.');
      return;
    }

    const selectedBrand = brandsMetadata.find(b => b._id === formBrandId);
    const selectedModel = formModels.find(m => m._id === formModelId);

    try {
      const response = await api.post('/machines', {
        name: formName,
        type: formType,
        brand: selectedBrand ? selectedBrand.name : '',
        model: selectedModel ? selectedModel.name : '',
        horsepower: formHp,
        registration: formReg,
        assignedDriverId: formDriver || null,
        fuel: parseInt(formFuel, 10),
        status: 'Idle',
        location: { lat: 30.902, lng: 75.853 },
        firstServiceHours: Number(formFirstServiceHours),
        regularServiceInterval: Number(formRegularServiceInterval),
        lastServiceHours: Number(formLastServiceHours),
        engineType: formEngineType
      });
      if (response.data && response.data.success) {
        setMachinesList(prev => [formatMachine(response.data.data), ...prev]);
        setIsAddOpen(false);
        toast.success(`Vehicle ${formName} registered successfully.`);
      }
    } catch (error) {
      console.error('Failed to register machinery:', error);
      toast.error('Error registering vehicle.');
    }
  };

  const handleOpenEdit = (machine) => {
    setActiveMachine(machine);
    setFormName(machine.name);
    setFormType(machine.type);
    
    // Attempt brand/model resolution
    const matchedBrand = brandsMetadata.find(b => b.name === machine.brand);
    if (matchedBrand) {
      setFormBrandId(matchedBrand._id);
      setFormModels(matchedBrand.models.filter(m => m.vehicleType === machine.type));
      const matchedModel = matchedBrand.models.find(m => m.name === machine.model);
      if (matchedModel) {
        setFormModelId(matchedModel._id);
        setFormHpOptions(matchedModel.hpOptions || []);
      }
    } else {
      setFormBrandId('');
      setFormModelId('');
      setFormModels([]);
      setFormHpOptions([]);
    }
    
    setFormHp(machine.horsepower || '');
    setFormReg(machine.registration);
    setFormDriver(machine.assignedDriverId && typeof machine.assignedDriverId === 'object' 
      ? machine.assignedDriverId._id 
      : machine.assignedDriverId || ''
    );
    setFormFuel(machine.fuel);
    setFormStatus(machine.status);

    // Custom Service & Engine Configs
    setFormEngineType(machine.engineType || 'Factory Integrated Engine');
    setFormFirstServiceHours(machine.firstServiceHours || 50);
    setFormRegularServiceInterval(machine.regularServiceInterval || 250);
    setFormLastServiceHours(machine.lastServiceHours || 0);

    setIsEditOpen(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!formName || !formBrandId || !formReg) {
      toast.error('Name, Brand, and Registration are required.');
      return;
    }

    const selectedBrand = brandsMetadata.find(b => b._id === formBrandId);
    const selectedModel = formModels.find(m => m._id === formModelId);

    try {
      const response = await api.put(`/machines/${activeMachine.id}`, {
        name: formName,
        type: formType,
        brand: selectedBrand ? selectedBrand.name : '',
        model: selectedModel ? selectedModel.name : '',
        horsepower: formHp,
        registration: formReg,
        assignedDriverId: formDriver || null,
        fuel: parseInt(formFuel, 10),
        status: formStatus,
        firstServiceHours: Number(formFirstServiceHours),
        regularServiceInterval: Number(formRegularServiceInterval),
        lastServiceHours: Number(formLastServiceHours),
        engineType: formEngineType
      });
      if (response.data && response.data.success) {
        setMachinesList(prev => prev.map(m => m.id === activeMachine.id ? formatMachine(response.data.data) : m));
        setIsEditOpen(false);
        setActiveMachine(null);
        toast.success(`Vehicle details updated.`);
      }
    } catch (error) {
      console.error('Failed to update machinery:', error);
      toast.error('Error saving vehicle changes.');
    }
  };

  const handleOpenDelete = (machine) => {
    setActiveMachine(machine);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    try {
      const response = await api.delete(`/machines/${activeMachine.id}`);
      if (response.data && response.data.success) {
        setMachinesList(prev => prev.filter(m => m.id !== activeMachine.id));
        setIsDeleteOpen(false);
        setActiveMachine(null);
        toast.success('Vehicle de-registered.');
      }
    } catch (error) {
      console.error('Failed to delete machinery:', error);
      toast.error('Error de-registering vehicle.');
    }
  };

  // Filter application
  const filteredMachines = machinesList.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.registration.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'All' || m.type === filterType;
    const matchesStatus = filterStatus === 'All' || m.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
            Machine Fleet Management
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Register and configure vehicles, track fuel metrics and assign active drivers.
          </p>
        </div>

        {/* Create Action button */}
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all"
        >
          <FaPlus className="text-xs" /> Register Vehicle
        </button>
      </div>

      {/* Filter and Search Panel */}
      <div className="p-4 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl flex flex-col md:flex-row justify-between gap-4">
        <div className="flex flex-1 flex-col sm:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <FaSearch className="text-xs" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, brand, registration..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-emerald-950/30 border border-gray-200 dark:border-emerald-950/40 focus:outline-none focus:border-emerald-500 focus:bg-white dark:text-white"
            />
          </div>

          {/* Filter Type */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 text-xs font-bold bg-gray-50 dark:bg-emerald-950/30 border border-gray-200 dark:border-emerald-950/40 rounded-xl focus:outline-none dark:text-white font-semibold"
          >
            <option value="All">All Types</option>
            <option value="Tractor">Tractors</option>
            <option value="Harvester">Harvesters</option>
            <option value="Sprayer">Sprayers</option>
          </select>

          {/* Filter Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-xs font-bold bg-gray-50 dark:bg-emerald-950/30 border border-gray-200 dark:border-emerald-950/40 rounded-xl focus:outline-none dark:text-white font-semibold"
          >
            <option value="All">All Statuses</option>
            <option value="Working">Running</option>
            <option value="Idle">Idle</option>
            <option value="Offline">Offline</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-1 bg-gray-50 dark:bg-emerald-950/20 p-1 rounded-xl self-start md:self-auto border border-gray-100 dark:border-emerald-950/30">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg text-xs transition-all ${
              viewMode === 'grid' ? 'bg-white dark:bg-emerald-900 shadow-sm text-emerald-600 dark:text-white font-bold' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <FaTh />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg text-xs transition-all ${
              viewMode === 'list' ? 'bg-white dark:bg-emerald-900 shadow-sm text-emerald-600 dark:text-white font-bold' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <FaList />
          </button>
        </div>
      </div>

      {/* Main Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMachines.map((machine) => (
            <motion.div
              layout
              key={machine.id}
              className="bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all"
            >
              {/* Card Image and Status Overlays */}
              <div className="h-44 bg-gray-100 dark:bg-emerald-950/10 relative overflow-hidden shrink-0">
                <img 
                  src={machine.photo} 
                  alt={machine.name} 
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1592919505780-303950717480?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                
                {/* Top left overlay - GPS Connection Status */}
                <span className={`absolute top-3 left-3 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase shadow-md flex items-center gap-1 ${
                  machine.status === 'Offline'
                    ? 'bg-red-500 text-white'
                    : 'bg-emerald-600 text-white'
                }`}>
                  <FaLink className="text-[8px]" />
                  GPS {machine.status === 'Offline' ? 'Offline' : 'Online'}
                </span>

                {/* Top right overlay - Engine State */}
                <span className={`absolute top-3 right-3 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase shadow-md flex items-center gap-1 ${
                  machine.engineStatus === 'On'
                    ? 'bg-emerald-600 text-white animate-pulse'
                    : 'bg-red-500 text-white'
                }`}>
                  <FaPowerOff className="text-[8px]" />
                  Engine {machine.engineStatus === 'On' ? 'ON' : 'OFF'}
                </span>

                {/* Bottom overlay for Speed */}
                {machine.status !== 'Offline' && machine.speed > 0 && (
                  <span className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                    {machine.speed} km/h
                  </span>
                )}
              </div>

              {/* Card Details */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] font-bold text-orange-500 uppercase tracking-wider">{machine.type}</span>
                      <h3 className="text-base font-bold dark:text-white mt-0.5">{machine.name}</h3>
                      <p className="text-[10px] text-gray-400 font-mono font-bold mt-0.5">{machine.registration}</p>
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400">
                      Health: {machine.healthScore || 95}%
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4 text-[11px] text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-emerald-950/20 pb-3.5">
                    <div className="flex items-center gap-1.5">
                      <FaUserTie className="text-emerald-500 shrink-0" />
                      <span className="truncate">Driver: <strong className="text-gray-700 dark:text-gray-200">{getDriverName(machine.assignedDriverId)}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FaGasPump className="text-orange-500 shrink-0" />
                      <span>Fuel: <strong className="text-gray-700 dark:text-gray-200">{machine.fuel}%</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FaClock className="text-sky-500 shrink-0" />
                      <span>Hours: <strong className="text-gray-700 dark:text-gray-200">{machine.workingHours?.toFixed(1) || 0} hrs</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FaSignal className="text-indigo-500 shrink-0" />
                      <span>Updated: <strong className="text-gray-700 dark:text-gray-200">{machine.status === 'Offline' ? '3 hrs ago' : 'Just Now'}</strong></span>
                    </div>
                  </div>

                  {/* Location Address Segment */}
                  <div className="mt-3 text-[10px] text-gray-400 dark:text-emerald-500/80 font-bold flex items-start gap-1.5">
                    <FaMapMarkerAlt className="text-red-500 shrink-0 mt-0.5" />
                    <span className="line-clamp-2 text-gray-600 dark:text-gray-300" title={machine.currentAddress}>
                      {machine.currentAddress || 'Cheruvupally Village, Madgulapally, Nalgonda, Telangana'}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-3.5 border-t border-gray-100 dark:border-emerald-950/20 flex gap-2">
                  <Link
                    to={`/machines/${machine.id}/dashboard`}
                    className="flex-1 flex justify-center items-center gap-1 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm"
                  >
                    <FaEye /> View Dashboard
                  </Link>

                  <button
                    onClick={() => handleOpenEdit(machine)}
                    className="p-2 border border-gray-200 dark:border-emerald-905/30 rounded-xl text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
                    title="Edit Machine"
                  >
                    <FaPen />
                  </button>
                  <button
                    onClick={() => handleOpenDelete(machine)}
                    className="p-2 border border-red-200 dark:border-red-950/30 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
                    title="De-register"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl shadow-sm overflow-hidden overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-emerald-950/20 bg-gray-50 dark:bg-emerald-950/10 text-gray-400 font-bold uppercase tracking-wider">
                <th className="p-4">Machine</th>
                <th className="p-4">Type</th>
                <th className="p-4">Registration</th>
                <th className="p-4">Status</th>
                <th className="p-4">Fuel</th>
                <th className="p-4">Hours</th>
                <th className="p-4">Assigned Operator</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-emerald-950/25">
              {filteredMachines.map((machine) => (
                <tr key={machine.id} className="hover:bg-gray-50/50 dark:hover:bg-emerald-950/10 transition-colors font-medium">
                  <td className="p-4 font-bold text-gray-900 dark:text-white">{machine.name}</td>
                  <td className="p-4 text-orange-500 font-semibold">{machine.type}</td>
                  <td className="p-4 font-mono">{machine.registration}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
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
                  </td>
                  <td className="p-4">{machine.fuel}%</td>
                  <td className="p-4">{machine.workingHours} hrs</td>
                  <td className="p-4 font-semibold">{getDriverName(machine.assignedDriverId)}</td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    <Link
                      to={`/machines/${machine.id}`}
                      className="p-1.5 text-emerald-600 hover:text-emerald-800"
                      title="View Details"
                    >
                      <FaEye />
                    </Link>
                    <button
                      onClick={() => handleOpenEdit(machine)}
                      className="p-1.5 text-blue-500 hover:text-blue-700 cursor-pointer"
                      title="Edit"
                    >
                      <FaPen />
                    </button>
                    <button
                      onClick={() => handleOpenDelete(machine)}
                      className="p-1.5 text-red-500 hover:text-red-700 cursor-pointer"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ADD MODAL */}
      <AnimatePresence>
        {isAddOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0f1913] border border-gray-100 dark:border-emerald-950/50 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4"
            >
              <h2 className="text-base font-black dark:text-white">Register Fleet Machine</h2>
              <form onSubmit={handleAdd} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Machine Custom Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-900/30 bg-gray-50 dark:bg-emerald-950/20 dark:text-white focus:outline-none focus:bg-white"
                    placeholder="e.g. Swaraj Max #2"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Vehicle Type</label>
                    <select
                      value={formType}
                      onChange={(e) => handleVehicleTypeChange(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-900/30 bg-gray-50 dark:bg-emerald-950/20 dark:text-white focus:outline-none font-bold"
                    >
                      {typesMetadata.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Brand / Manufacturer</label>
                    <select
                      value={formBrandId}
                      required
                      onChange={(e) => handleBrandChange(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-900/30 bg-gray-50 dark:bg-emerald-950/20 dark:text-white focus:outline-none font-bold"
                    >
                      <option value="">Select Brand</option>
                      {brandsMetadata.filter(b => b.models.some(m => m.vehicleType === formType)).map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Model Specification</label>
                    <select
                      value={formModelId}
                      required
                      disabled={!formBrandId}
                      onChange={(e) => handleModelChange(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-900/30 bg-gray-50 dark:bg-emerald-950/20 dark:text-white focus:outline-none font-bold disabled:opacity-50"
                    >
                      <option value="">Select Model</option>
                      {formModels.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Engine HP Rating</label>
                    <select
                      value={formHp}
                      required
                      disabled={!formModelId}
                      onChange={(e) => setFormHp(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-900/30 bg-gray-50 dark:bg-emerald-950/20 dark:text-white focus:outline-none font-bold disabled:opacity-50"
                    >
                      <option value="">Select HP</option>
                      {formHpOptions.map(hp => <option key={hp} value={hp}>{hp}</option>)}
                    </select>
                  </div>
                </div>

                {/* Dynamic Series & Engine Configuration */}
                {(formType === 'Tractor' || formType === 'Combine Harvester') && formModelId && (
                  <div className="grid grid-cols-1 gap-3 bg-gray-50/50 dark:bg-emerald-950/5 p-3 rounded-2xl border border-gray-200 dark:border-emerald-900/20 text-xs">
                    {formType === 'Tractor' && (
                      <div>
                        <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5 font-bold">Series</label>
                        <input
                          type="text"
                          readOnly
                          value={formModels.find(m => m._id === formModelId)?.series || 'Standard Series'}
                          className="w-full p-2 rounded-xl border border-gray-200 dark:border-emerald-950/30 bg-gray-100 dark:bg-[#121c17] dark:text-gray-300 font-bold focus:outline-none"
                        />
                      </div>
                    )}
                    {formType === 'Combine Harvester' && (
                      <div>
                        <label className="block font-bold text-gray-455 uppercase tracking-wider mb-1.5 font-bold">Engine Configuration / Type</label>
                        {formModels.find(m => m._id === formModelId)?.engineConfig === 'External' ? (
                          <select
                            value={formEngineType}
                            onChange={(e) => setFormEngineType(e.target.value)}
                            className="w-full p-2 rounded-xl border border-gray-200 dark:border-emerald-900/30 bg-white dark:bg-[#0c120f] dark:text-white font-bold focus:outline-none"
                          >
                            <option value="John Deere Engine">John Deere Engine</option>
                            <option value="Ashok Leyland Engine">Ashok Leyland Engine</option>
                            <option value="Cummins Engine">Cummins Engine</option>
                          </select>
                        ) : (
                          <input
                            type="text"
                            readOnly
                            value="Factory Integrated Engine"
                            className="w-full p-2 rounded-xl border border-gray-200 dark:border-emerald-900/30 bg-gray-100 dark:bg-[#121c17] dark:text-gray-300 font-bold focus:outline-none"
                          />
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Service Reminder Configuration Thresholds */}
                <div className="bg-gray-50/50 dark:bg-emerald-950/5 p-3 rounded-2xl border border-gray-200 dark:border-emerald-900/20 text-xs space-y-2">
                  <h4 className="font-extrabold text-emerald-600">Service Reminders Thresholds (Hours)</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">First Service*</label>
                      <input
                        type="number"
                        required
                        value={formFirstServiceHours}
                        onChange={(e) => setFormFirstServiceHours(Number(e.target.value))}
                        className="w-full p-2 rounded-xl border border-gray-200 dark:border-emerald-900/30 bg-white dark:bg-[#0c120f] dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Regular Int.*</label>
                      <input
                        type="number"
                        required
                        value={formRegularServiceInterval}
                        onChange={(e) => setFormRegularServiceInterval(Number(e.target.value))}
                        className="w-full p-2 rounded-xl border border-gray-200 dark:border-emerald-900/30 bg-white dark:bg-[#0c120f] dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Last Hours</label>
                      <input
                        type="number"
                        value={formLastServiceHours}
                        onChange={(e) => setFormLastServiceHours(Number(e.target.value))}
                        className="w-full p-2 rounded-xl border border-gray-200 dark:border-emerald-900/30 bg-white dark:bg-[#0c120f] dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Registration Plate (Optional)</label>
                    <input
                      type="text"
                      value={formReg}
                      onChange={(e) => setFormReg(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-900/30 bg-gray-50 dark:bg-emerald-950/20 dark:text-white focus:outline-none focus:bg-white font-mono uppercase"
                      placeholder="e.g. PB-10-CD-2034"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Assign Operator</label>
                  <select
                    value={formDriver}
                    onChange={(e) => setFormDriver(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-900/30 bg-gray-50 dark:bg-emerald-950/20 dark:text-white focus:outline-none"
                  >
                    <option value="">Unassigned</option>
                    {driversList.map(d => (
                      <option key={d._id || d.id} value={d._id || d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="px-4 py-2 rounded-xl border border-gray-200 dark:border-emerald-950/30 text-gray-500 font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md cursor-pointer"
                  >
                    Add Vehicle
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT MODAL */}
      <AnimatePresence>
        {isEditOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0f1913] border border-gray-100 dark:border-emerald-950/50 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4"
            >
              <h2 className="text-base font-black dark:text-white">Modify Machinery Configuration</h2>
              <form onSubmit={handleEdit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Machine Display Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-900/30 bg-gray-50 dark:bg-emerald-950/20 dark:text-white focus:outline-none focus:bg-white"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Type</label>
                    <select
                      value={formType}
                      onChange={(e) => handleVehicleTypeChange(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-255 dark:border-emerald-900/30 bg-gray-50 dark:bg-emerald-950/5 focus:outline-none dark:text-white font-bold"
                    >
                      {typesMetadata.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Brand</label>
                    <select
                      value={formBrandId}
                      required
                      onChange={(e) => handleBrandChange(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-255 dark:border-emerald-900/30 bg-gray-50 dark:bg-emerald-950/5 focus:outline-none dark:text-white font-bold"
                    >
                      <option value="">Select Brand</option>
                      {brandsMetadata.filter(b => b.models.some(m => m.vehicleType === formType)).map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Model Specification</label>
                    <select
                      value={formModelId}
                      required
                      disabled={!formBrandId}
                      onChange={(e) => handleModelChange(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-255 dark:border-emerald-900/30 bg-gray-50 dark:bg-emerald-950/5 focus:outline-none dark:text-white font-bold disabled:opacity-50"
                    >
                      <option value="">Select Model</option>
                      {formModels.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">HP Rating</label>
                    <select
                      value={formHp}
                      required
                      disabled={!formModelId}
                      onChange={(e) => setFormHp(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-255 dark:border-emerald-900/30 bg-gray-50 dark:bg-emerald-950/5 focus:outline-none dark:text-white font-bold disabled:opacity-50"
                    >
                      <option value="">Select HP</option>
                      {formHpOptions.map(hp => <option key={hp} value={hp}>{hp}</option>)}
                    </select>
                  </div>
                </div>

                {/* Dynamic Series & Engine Configuration */}
                {(formType === 'Tractor' || formType === 'Combine Harvester') && formModelId && (
                  <div className="grid grid-cols-1 gap-3 bg-gray-50/50 dark:bg-emerald-950/5 p-3 rounded-2xl border border-gray-200 dark:border-emerald-900/20 text-xs font-bold">
                    {formType === 'Tractor' && (
                      <div>
                        <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5 font-bold">Series</label>
                        <input
                          type="text"
                          readOnly
                          value={formModels.find(m => m._id === formModelId)?.series || 'Standard Series'}
                          className="w-full p-2 rounded-xl border border-gray-200 dark:border-emerald-900/30 bg-gray-100 dark:bg-[#121c17] dark:text-gray-300 font-bold focus:outline-none"
                        />
                      </div>
                    )}
                    {formType === 'Combine Harvester' && (
                      <div>
                        <label className="block font-bold text-gray-455 uppercase tracking-wider mb-1.5 font-bold">Engine Configuration / Type</label>
                        {formModels.find(m => m._id === formModelId)?.engineConfig === 'External' ? (
                          <select
                            value={formEngineType}
                            onChange={(e) => setFormEngineType(e.target.value)}
                            className="w-full p-2 rounded-xl border border-gray-200 dark:border-emerald-900/30 bg-white dark:bg-[#0c120f] dark:text-white font-bold focus:outline-none"
                          >
                            <option value="John Deere Engine">John Deere Engine</option>
                            <option value="Ashok Leyland Engine">Ashok Leyland Engine</option>
                            <option value="Cummins Engine">Cummins Engine</option>
                          </select>
                        ) : (
                          <input
                            type="text"
                            readOnly
                            value="Factory Integrated Engine"
                            className="w-full p-2 rounded-xl border border-gray-200 dark:border-emerald-900/30 bg-gray-100 dark:bg-[#121c17] dark:text-gray-300 font-bold focus:outline-none"
                          />
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Service Reminder Configuration Thresholds */}
                <div className="bg-gray-50/50 dark:bg-emerald-950/5 p-3 rounded-2xl border border-gray-200 dark:border-emerald-900/20 text-xs font-bold space-y-2">
                  <h4 className="font-extrabold text-emerald-600">Service Reminders Thresholds (Hours)</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">First Service*</label>
                      <input
                        type="number"
                        required
                        value={formFirstServiceHours}
                        onChange={(e) => setFormFirstServiceHours(Number(e.target.value))}
                        className="w-full p-2 rounded-xl border border-gray-255 dark:border-emerald-900/30 bg-white dark:bg-[#0c120f] dark:text-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Regular Int.*</label>
                      <input
                        type="number"
                        required
                        value={formRegularServiceInterval}
                        onChange={(e) => setFormRegularServiceInterval(Number(e.target.value))}
                        className="w-full p-2 rounded-xl border border-gray-255 dark:border-emerald-900/30 bg-white dark:bg-[#0c120f] dark:text-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Last Hours</label>
                      <input
                        type="number"
                        value={formLastServiceHours}
                        onChange={(e) => setFormLastServiceHours(Number(e.target.value))}
                        className="w-full p-2 rounded-xl border border-gray-255 dark:border-emerald-900/30 bg-white dark:bg-[#0c120f] dark:text-white font-bold"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Fuel Level (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formFuel}
                      onChange={(e) => setFormFuel(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-900/30 bg-gray-50 dark:bg-emerald-950/20 dark:text-white focus:outline-none focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Status</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-900/30 bg-gray-50 dark:bg-emerald-950/20 dark:text-white focus:outline-none"
                    >
                      <option value="Working">Running</option>
                      <option value="Idle">Idle</option>
                      <option value="Offline">Offline</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Registration (Optional)</label>
                    <input
                      type="text"
                      required
                      value={formReg}
                      onChange={(e) => setFormReg(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-900/30 bg-gray-50 dark:bg-emerald-950/20 dark:text-white focus:outline-none focus:bg-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Assign Operator</label>
                  <select
                    value={formDriver}
                    onChange={(e) => setFormDriver(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-900/30 bg-gray-50 dark:bg-emerald-950/20 dark:text-white focus:outline-none"
                  >
                    <option value="">Unassigned</option>
                    {driversList.map(d => (
                      <option key={d._id || d.id} value={d._id || d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => { setIsEditOpen(false); setActiveMachine(null); }}
                    className="px-4 py-2 rounded-xl border border-gray-200 dark:border-emerald-950/30 text-gray-500 font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE MODAL */}
      <AnimatePresence>
        {isDeleteOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0f1913] border border-gray-100 dark:border-emerald-950/50 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4"
            >
              <h2 className="text-base font-black dark:text-white">Delete machine record?</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-normal">
                Are you sure you want to remove <strong>{activeMachine?.name}</strong> ({activeMachine?.registration}) from the GPS dashboard registry? This action is permanent.
              </p>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={() => { setIsDeleteOpen(false); setActiveMachine(null); }}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-emerald-950/30 text-gray-500 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-md cursor-pointer"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Machines;
