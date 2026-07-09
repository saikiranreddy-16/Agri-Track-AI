import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPlus, FaPen, FaTrash, FaEye, FaSearch, FaUserTie, 
  FaPhone, FaClock, FaTractor, FaAward, FaCalendarCheck 
} from 'react-icons/fa';
import { mockDrivers, mockMachines } from '../data/mockData';
import { PATHS } from '../constants';
import { useAuth } from '../context/AuthContext';

export const Drivers = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [driversList, setDriversList] = useState(mockDrivers);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAvailability, setFilterAvailability] = useState('All');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [activeDriver, setActiveDriver] = useState(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formExp, setFormExp] = useState('');
  const [formMachine, setFormMachine] = useState('');
  const [formStatus, setFormStatus] = useState('Active');

  const getMachineName = (machineId) => {
    const mach = mockMachines.find(m => m.id === machineId);
    return mach ? mach.name : 'Unassigned';
  };

  const handleOpenAdd = () => {
    setFormName('');
    setFormPhone('');
    setFormExp('');
    setFormMachine('');
    setFormStatus('Active');
    setIsAddOpen(true);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formName || !formPhone) return;

    const newDriver = {
      id: `drv-${Date.now()}`,
      name: formName,
      phone: formPhone,
      experience: formExp || '1 Year',
      rating: 5.0,
      status: formStatus,
      assignedMachineId: formMachine || null,
      workingHoursToday: 0,
      acresWorked: 0,
      fuelEfficiency: 90,
      attendance: '100%',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80',
      performanceData: [
        { month: 'Jun', hours: 0, acres: 0 }
      ]
    };

    setDriversList([newDriver, ...driversList]);
    setIsAddOpen(false);
  };

  const handleOpenEdit = (drv) => {
    setActiveDriver(drv);
    setFormName(drv.name);
    setFormPhone(drv.phone);
    setFormExp(drv.experience);
    setFormMachine(drv.assignedMachineId || '');
    setFormStatus(drv.status);
    setIsEditOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!formName || !formPhone) return;

    setDriversList(prev => prev.map(d => d.id === activeDriver.id ? {
      ...d,
      name: formName,
      phone: formPhone,
      experience: formExp,
      assignedMachineId: formMachine || null,
      status: formStatus
    } : d));

    setIsEditOpen(false);
    setActiveDriver(null);
  };

  const handleOpenDelete = (drv) => {
    setActiveDriver(drv);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    setDriversList(prev => prev.filter(d => d.id !== activeDriver.id));
    setIsDeleteOpen(false);
    setActiveDriver(null);
  };

  const filteredDrivers = driversList.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.experience.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterAvailability === 'All' || d.status === filterAvailability;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
            Operator Directories
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Dispatch and coordinate farm machinery drivers, view safety compliance ratings and shift logs.
          </p>
        </div>

        {user?.role !== 'Operator' && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
          >
            <FaPlus className="text-xs" /> Register Driver
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="p-4 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <FaSearch className="text-xs" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search drivers by name, experience..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-emerald-950/30 border border-gray-200 dark:border-emerald-950/40 focus:outline-none focus:border-emerald-500 focus:bg-white dark:text-white"
          />
        </div>

        <select
          value={filterAvailability}
          onChange={(e) => setFilterAvailability(e.target.value)}
          className="px-3 py-2 text-xs font-bold bg-gray-50 dark:bg-emerald-950/30 border border-gray-200 dark:border-emerald-950/40 rounded-xl focus:outline-none dark:text-white"
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Off-duty">Off-duty</option>
        </select>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDrivers.map((driver) => (
          <motion.div
            layout
            key={driver.id}
            className="bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl shadow-sm overflow-hidden flex flex-col"
          >
            <div className="p-5 flex items-center gap-4 border-b border-gray-100 dark:border-emerald-950/20">
              <img 
                src={driver.photo} 
                alt={driver.name} 
                className="w-14 h-14 rounded-2xl object-cover shadow-sm"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold truncate dark:text-white">{driver.name}</h3>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded leading-none uppercase shrink-0 ${
                    driver.status === 'Active'
                      ? 'bg-emerald-100 text-emerald-850 dark:bg-emerald-950/40 dark:text-emerald-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400'
                  }`}>
                    {driver.status}
                  </span>
                </div>
                <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1.5">
                  <FaPhone className="text-[9px]" /> {driver.phone}
                </div>
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between text-xs space-y-4">
              <div className="grid grid-cols-2 gap-3 text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <FaAward className="text-emerald-500" />
                  <span>Exp: {driver.experience}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaClock className="text-emerald-500" />
                  <span>Hours Today: {driver.workingHoursToday}h</span>
                </div>
                <div className="col-span-2 border-t border-gray-100 dark:border-emerald-950/20 pt-2.5 flex items-center gap-2">
                  <FaTractor className="text-orange-500" />
                  <span className="font-semibold text-gray-700 dark:text-gray-200">
                    Mach: {getMachineName(driver.assignedMachineId)}
                  </span>
                </div>
              </div>

              <div className="pt-3.5 border-t border-gray-100 dark:border-emerald-950/20 flex gap-2">
                <Link
                  to={`/drivers/${driver.id}`}
                  className="flex-1 flex justify-center items-center gap-1 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-xl hover:bg-emerald-100/50 transition-all"
                >
                  <FaEye /> View Profile
                </Link>
                {user?.role !== 'Operator' && (
                  <>
                    <button
                      onClick={() => handleOpenEdit(driver)}
                      className="p-2 border border-gray-200 dark:border-emerald-905/30 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-emerald-950/40 transition-colors"
                      title="Edit Profile"
                    >
                      <FaPen />
                    </button>
                    <button
                      onClick={() => handleOpenDelete(driver)}
                      className="p-2 border border-red-200 dark:border-red-950/30 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                      title="De-register Operator"
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

      {/* ADD DRIVER MODAL */}
      <AnimatePresence>
        {isAddOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0f1913] border border-gray-100 dark:border-emerald-950/50 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4"
            >
              <h2 className="text-base font-black dark:text-white">Register Farm Operator</h2>
              <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-250 dark:border-emerald-955/30 bg-gray-50 dark:bg-emerald-950/20 dark:text-white focus:outline-none focus:bg-white"
                    placeholder="e.g. Thomas Mueller"
                  />
                </div>
                
                <div>
                  <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-250 dark:border-emerald-955/30 bg-gray-50 dark:bg-emerald-950/20 dark:text-white focus:outline-none focus:bg-white"
                    placeholder="e.g. +1 (555) 123-4567"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Experience</label>
                    <input
                      type="text"
                      value={formExp}
                      onChange={(e) => setFormExp(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-250 dark:border-emerald-955/30 bg-gray-50 dark:bg-emerald-950/20 dark:text-white focus:outline-none focus:bg-white"
                      placeholder="e.g. 5 Years"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Status</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-250 dark:border-emerald-955/30 bg-gray-50 dark:bg-emerald-950/20 dark:text-white focus:outline-none"
                    >
                      <option value="Active">Active</option>
                      <option value="Off-duty">Off-duty</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Assign Machine</label>
                  <select
                    value={formMachine}
                    onChange={(e) => setFormMachine(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-250 dark:border-emerald-955/30 bg-gray-50 dark:bg-emerald-950/20 dark:text-white focus:outline-none"
                  >
                    <option value="">Unassigned</option>
                    {mockMachines.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="px-4 py-2 rounded-xl border border-gray-200 dark:border-emerald-950/30 text-gray-500 font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md"
                  >
                    Register Driver
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT DRIVER MODAL */}
      <AnimatePresence>
        {isEditOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0f1913] border border-gray-100 dark:border-emerald-950/50 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4"
            >
              <h2 className="text-base font-black dark:text-white">Modify Driver Details</h2>
              <form onSubmit={handleEditSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-250 dark:border-emerald-955/30 bg-gray-50 dark:bg-emerald-950/20 dark:text-white focus:outline-none focus:bg-white"
                  />
                </div>
                
                <div>
                  <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-250 dark:border-emerald-955/30 bg-gray-50 dark:bg-emerald-950/20 dark:text-white focus:outline-none focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Experience</label>
                    <input
                      type="text"
                      value={formExp}
                      onChange={(e) => setFormExp(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-250 dark:border-emerald-955/30 bg-gray-50 dark:bg-emerald-950/20 dark:text-white focus:outline-none focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Status</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-250 dark:border-emerald-955/30 bg-gray-50 dark:bg-emerald-950/20 dark:text-white focus:outline-none"
                    >
                      <option value="Active">Active</option>
                      <option value="Off-duty">Off-duty</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Assign Machine</label>
                  <select
                    value={formMachine}
                    onChange={(e) => setFormMachine(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-250 dark:border-emerald-955/30 bg-gray-50 dark:bg-emerald-950/20 dark:text-white focus:outline-none"
                  >
                    <option value="">Unassigned</option>
                    {mockMachines.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => { setIsEditOpen(false); setActiveDriver(null); }}
                    className="px-4 py-2 rounded-xl border border-gray-200 dark:border-emerald-950/30 text-gray-500 font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE DRIVER MODAL */}
      <AnimatePresence>
        {isDeleteOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0f1913] border border-gray-100 dark:border-emerald-950/50 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4"
            >
              <h2 className="text-base font-black dark:text-white">De-register Operator?</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-normal">
                Are you sure you want to remove <strong>{activeDriver?.name}</strong> from the database? They will be unlinked from any active machinery.
              </p>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={() => { setIsDeleteOpen(false); setActiveDriver(null); }}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-emerald-950/30 text-gray-500 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
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
export default Drivers;
