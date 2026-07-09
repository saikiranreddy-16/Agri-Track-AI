import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPlus, FaTh, FaList, FaTrash, FaPen, FaEye, FaSearch, 
  FaGasPump, FaBatteryThreeQuarters, FaCompass, FaLink, FaUserPlus
} from 'react-icons/fa';
import { mockMachines, mockDrivers } from '../data/mockData';
import { PATHS } from '../constants';
import { useAuth } from '../context/AuthContext';

export const Machines = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Local state for CRUD operations
  const [machinesList, setMachinesList] = useState(mockMachines);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [activeMachine, setActiveMachine] = useState(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('Tractor');
  const [formBrand, setFormBrand] = useState('');
  const [formModel, setFormModel] = useState('');
  const [formReg, setFormReg] = useState('');
  const [formDriver, setFormDriver] = useState('');
  const [formFuel, setFormFuel] = useState(100);

  const getDriverName = (driverId) => {
    const drv = mockDrivers.find(d => d.id === driverId);
    return drv ? drv.name : 'Unassigned';
  };

  const handleOpenAdd = () => {
    setFormName('');
    setFormType('Tractor');
    setFormBrand('');
    setFormModel('');
    setFormReg('');
    setFormDriver('');
    setFormFuel(100);
    setIsAddOpen(true);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!formName || !formBrand || !formReg) return;

    const newMachine = {
      id: `mach-${Date.now()}`,
      name: formName,
      type: formType,
      brand: formBrand,
      model: formModel,
      registration: formReg,
      status: 'Idle',
      fuel: parseInt(formFuel, 10),
      battery: 100,
      assignedDriverId: formDriver || null,
      location: { lat: 41.885, lng: -87.645 },
      speed: 0,
      engineStatus: 'Off',
      workingHours: 0,
      distanceTravelled: 0,
      nextService: '2026-09-01',
      currentAddress: 'Maintenance Yard Depot, IL',
      photo: 'https://images.unsplash.com/photo-1592919505780-303950717480?auto=format&fit=crop&w=800&q=80',
      workHistory: [],
      fuelHistory: [],
      maintenanceHistory: [],
      documents: [],
      alerts: []
    };

    setMachinesList([newMachine, ...machinesList]);
    setIsAddOpen(false);
  };

  const handleOpenEdit = (machine) => {
    setActiveMachine(machine);
    setFormName(machine.name);
    setFormType(machine.type);
    setFormBrand(machine.brand);
    setFormModel(machine.model);
    setFormReg(machine.registration);
    setFormDriver(machine.assignedDriverId || '');
    setFormFuel(machine.fuel);
    setIsEditOpen(true);
  };

  const handleEdit = (e) => {
    e.preventDefault();
    if (!formName || !formBrand || !formReg) return;

    setMachinesList(prev => prev.map(m => m.id === activeMachine.id ? {
      ...m,
      name: formName,
      type: formType,
      brand: formBrand,
      model: formModel,
      registration: formReg,
      assignedDriverId: formDriver || null,
      fuel: parseInt(formFuel, 10)
    } : m));

    setIsEditOpen(false);
    setActiveMachine(null);
  };

  const handleOpenDelete = (machine) => {
    setActiveMachine(machine);
    setIsDeleteOpen(true);
  };

  const handleDelete = () => {
    setMachinesList(prev => prev.filter(m => m.id !== activeMachine.id));
    setIsDeleteOpen(false);
    setActiveMachine(null);
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

        {/* Create Action button: Disabled for viewers */}
        {user?.role !== 'Operator' && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
          >
            <FaPlus className="text-xs" /> Register Vehicle
          </button>
        )}
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
            className="px-3 py-2 text-xs font-bold bg-gray-50 dark:bg-emerald-950/30 border border-gray-200 dark:border-emerald-950/40 rounded-xl focus:outline-none dark:text-white"
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
            className="px-3 py-2 text-xs font-bold bg-gray-50 dark:bg-emerald-950/30 border border-gray-200 dark:border-emerald-950/40 rounded-xl focus:outline-none dark:text-white"
          >
            <option value="All">All Statuses</option>
            <option value="Working">Working</option>
            <option value="Idle">Idle</option>
            <option value="Offline">Offline</option>
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
              className="bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between group"
            >
              <div className="h-44 bg-gray-100 relative overflow-hidden shrink-0">
                <img 
                  src={machine.photo} 
                  alt={machine.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1592919505780-303950717480?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <span className={`absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  machine.status === 'Working'
                    ? 'bg-emerald-500 text-white'
                    : machine.status === 'Idle'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-red-500 text-white'
                }`}>
                  {machine.status}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] font-bold text-orange-500 uppercase tracking-wider">{machine.type}</span>
                      <h3 className="text-base font-bold dark:text-white mt-0.5">{machine.name}</h3>
                      <p className="text-[11px] text-gray-400 font-semibold">{machine.registration}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                    <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                      <FaGasPump className="text-gray-400 shrink-0" />
                      <span>Fuel: {machine.fuel}%</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                      <FaBatteryThreeQuarters className="text-gray-400 shrink-0" />
                      <span>Battery: {machine.battery}%</span>
                    </div>
                    <div className="col-span-2 border-t border-gray-100 dark:border-emerald-950/20 pt-2.5 text-gray-500 dark:text-gray-400">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mr-2">Driver:</span>
                      <span className="font-semibold text-gray-700 dark:text-gray-200">
                        {getDriverName(machine.assignedDriverId)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-3.5 border-t border-gray-100 dark:border-emerald-950/20 flex gap-2">
                  <Link
                    to={`/machines/${machine.id}`}
                    className="flex-1 flex justify-center items-center gap-1 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-xl hover:bg-emerald-100/50 transition-all"
                  >
                    <FaEye /> View
                  </Link>

                  {user?.role !== 'Operator' && (
                    <>
                      <button
                        onClick={() => handleOpenEdit(machine)}
                        className="p-2 border border-gray-200 dark:border-emerald-905/30 rounded-xl text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-emerald-950/40 transition-colors"
                        title="Edit Machine"
                      >
                        <FaPen />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(machine)}
                        className="p-2 border border-red-200 dark:border-red-950/30 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                        title="De-register"
                      >
                        <FaTrash />
                      </button>
                    </>
                  )}
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
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-400'
                    }`}>
                      {machine.status}
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
                    {user?.role !== 'Operator' && (
                      <>
                        <button
                          onClick={() => handleOpenEdit(machine)}
                          className="p-1.5 text-blue-500 hover:text-blue-700"
                          title="Edit"
                        >
                          <FaPen />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(machine)}
                          className="p-1.5 text-red-500 hover:text-red-700"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </>
                    )}
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
                  <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Machine Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-250 dark:border-emerald-955/30 bg-gray-50 dark:bg-emerald-950/20 dark:text-white focus:outline-none focus:bg-white"
                    placeholder="e.g. John Deere 8R"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Type</label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-250 dark:border-emerald-955/30 bg-gray-50 dark:bg-emerald-950/20 dark:text-white focus:outline-none"
                    >
                      <option value="Tractor">Tractor</option>
                      <option value="Harvester">Harvester</option>
                      <option value="Sprayer">Sprayer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Brand</label>
                    <input
                      type="text"
                      required
                      value={formBrand}
                      onChange={(e) => setFormBrand(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-250 dark:border-emerald-955/30 bg-gray-50 dark:bg-emerald-950/20 dark:text-white focus:outline-none focus:bg-white"
                      placeholder="e.g. Fendt"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Model</label>
                    <input
                      type="text"
                      value={formModel}
                      onChange={(e) => setFormModel(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-250 dark:border-emerald-955/30 bg-gray-50 dark:bg-emerald-950/20 dark:text-white focus:outline-none focus:bg-white"
                      placeholder="e.g. 724 Vario"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Registration</label>
                    <input
                      type="text"
                      required
                      value={formReg}
                      onChange={(e) => setFormReg(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-250 dark:border-emerald-955/30 bg-gray-50 dark:bg-emerald-950/20 dark:text-white focus:outline-none focus:bg-white"
                      placeholder="e.g. AG-FD724"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Assign Operator</label>
                  <select
                    value={formDriver}
                    onChange={(e) => setFormDriver(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-250 dark:border-emerald-955/30 bg-gray-50 dark:bg-emerald-950/20 dark:text-white focus:outline-none"
                  >
                    <option value="">Unassigned</option>
                    {mockDrivers.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="px-4 py-2 rounded-xl border border-gray-200 dark:border-emerald-950/30 text-gray-500 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md"
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
                  <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Machine Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-250 dark:border-emerald-955/30 bg-gray-50 dark:bg-emerald-950/20 dark:text-white focus:outline-none focus:bg-white"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Type</label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-250 dark:border-emerald-955/30 bg-gray-50 dark:bg-emerald-950/20 dark:text-white focus:outline-none"
                    >
                      <option value="Tractor">Tractor</option>
                      <option value="Harvester">Harvester</option>
                      <option value="Sprayer">Sprayer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Brand</label>
                    <input
                      type="text"
                      required
                      value={formBrand}
                      onChange={(e) => setFormBrand(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-250 dark:border-emerald-955/30 bg-gray-50 dark:bg-emerald-950/20 dark:text-white focus:outline-none focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Model</label>
                    <input
                      type="text"
                      value={formModel}
                      onChange={(e) => setFormModel(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-250 dark:border-emerald-955/30 bg-gray-50 dark:bg-emerald-950/20 dark:text-white focus:outline-none focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Registration</label>
                    <input
                      type="text"
                      required
                      value={formReg}
                      onChange={(e) => setFormReg(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-250 dark:border-emerald-955/30 bg-gray-50 dark:bg-emerald-950/20 dark:text-white focus:outline-none focus:bg-white"
                    />
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
                      className="w-full p-2.5 rounded-xl border border-gray-250 dark:border-emerald-955/30 bg-gray-50 dark:bg-emerald-950/20 dark:text-white focus:outline-none focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Assign Operator</label>
                    <select
                      value={formDriver}
                      onChange={(e) => setFormDriver(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-250 dark:border-emerald-955/30 bg-gray-50 dark:bg-emerald-950/20 dark:text-white focus:outline-none"
                    >
                      <option value="">Unassigned</option>
                      {mockDrivers.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => { setIsEditOpen(false); setActiveMachine(null); }}
                    className="px-4 py-2 rounded-xl border border-gray-200 dark:border-emerald-950/30 text-gray-500 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md"
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
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-emerald-950/30 text-gray-500 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-md"
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
