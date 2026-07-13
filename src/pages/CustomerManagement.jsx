import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUser, FaMobileAlt, FaSearch, FaEllipsisV, FaEye, FaPen, 
  FaHistory, FaTrashAlt, FaTimes, FaShieldAlt, FaPlus, FaCheckCircle, FaBan 
} from 'react-icons/fa';
import { mockCustomers } from '../data/mockData';
import { PATHS } from '../constants';
import { useToast } from '../context/ToastContext';
import { EmptyState } from '../components/EmptyState';

export const CustomerManagement = () => {
  const navigate = useNavigate();
  const toast = useToast();
  
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Action dropdown track
  const [activeMenuId, setActiveMenuId] = useState(null);
  const dropdownRef = useRef(null);

  // Modals state
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [modalType, setModalType] = useState(null); // 'edit', 'delete'
  
  // Edit Form state
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editPlan, setEditPlan] = useState('');
  const [editStatus, setEditStatus] = useState('Active');

  useEffect(() => {
    // Simulate skeleton loader delay
    const timer = setTimeout(() => {
      setCustomers(mockCustomers);
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleOpenEdit = (customer) => {
    setSelectedCustomer(customer);
    setEditName(customer.name);
    setEditPhone(customer.phone);
    setEditPlan(customer.subscriptionPlan);
    setEditStatus(customer.status);
    setModalType('edit');
    setActiveMenuId(null);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editName.trim() || !editPhone.trim()) {
      toast.error('Name and Mobile Number are required.');
      return;
    }
    setCustomers(prev => prev.map(c => 
      c.id === selectedCustomer.id 
        ? { ...c, name: editName, phone: editPhone, subscriptionPlan: editPlan, status: editStatus }
        : c
    ));
    toast.success(`Customer ${editName} details updated.`);
    setModalType(null);
    setSelectedCustomer(null);
  };

  const handleOpenDelete = (customer) => {
    setSelectedCustomer(customer);
    setModalType('delete');
    setActiveMenuId(null);
  };

  const handleConfirmDelete = () => {
    setCustomers(prev => prev.filter(c => c.id !== selectedCustomer.id));
    toast.success(`Account for ${selectedCustomer.name} has been de-registered.`);
    setModalType(null);
    setSelectedCustomer(null);
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
          Customer Management
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Monitor subscribed farm accounts, manage device activations, and coordinate operations.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-[#0e1712] p-4 border border-gray-150 dark:border-emerald-950/20 rounded-2xl shadow-sm">
        <div className="relative w-full sm:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
            <FaSearch className="text-xs" />
          </span>
          <input
            type="text"
            placeholder="Search by client name or mobile..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 dark:bg-[#121c17] border border-gray-200 dark:border-emerald-950/30 rounded-xl focus:bg-white focus:outline-none dark:text-white transition-all"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        // Skeleton Loader
        <div className="space-y-4">
          <div className="h-10 bg-gray-250 dark:bg-emerald-950/10 rounded-xl animate-pulse" />
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-emerald-950/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredCustomers.length === 0 ? (
        <EmptyState 
          title="No Customers Found" 
          description="Try adjusting your search criteria or register a new customer account."
          type="general"
        />
      ) : (
        <div className="bg-white dark:bg-[#0e1712] border border-gray-150 dark:border-emerald-950/20 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-emerald-950/10 text-gray-450 dark:text-gray-400 uppercase font-bold tracking-wider border-b border-gray-100 dark:border-emerald-950/10">
                <tr>
                  <th className="px-6 py-3.5">Customer Name</th>
                  <th className="px-6 py-3.5">Mobile Number</th>
                  <th className="px-6 py-3.5 text-center">Farms</th>
                  <th className="px-6 py-3.5 text-center">Vehicles</th>
                  <th className="px-6 py-3.5 text-center">Active Devices</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-emerald-950/10">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50/50 dark:hover:bg-emerald-950/5 transition-colors">
                    {/* Name */}
                    <td className="px-6 py-4">
                      <div className="font-extrabold text-gray-800 dark:text-white flex items-center gap-1.5">
                        <FaUser className="text-emerald-500 text-[10px]" />
                        {customer.name}
                      </div>
                    </td>
                    {/* Phone */}
                    <td className="px-6 py-4 text-gray-650 dark:text-gray-300 font-medium">
                      <span className="flex items-center gap-1.5">
                        <FaMobileAlt className="text-gray-400" />
                        {customer.phone}
                      </span>
                    </td>
                    {/* Farms */}
                    <td className="px-6 py-4 text-center font-bold">{customer.farmsCount}</td>
                    {/* Vehicles */}
                    <td className="px-6 py-4 text-center font-bold">{customer.vehiclesCount}</td>
                    {/* Active Devices */}
                    <td className="px-6 py-4 text-center font-bold text-emerald-600 dark:text-emerald-450">
                      {customer.activeDevicesCount}
                    </td>
                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase inline-flex items-center gap-1 ${
                        customer.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/35 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30'
                          : 'bg-red-50 text-red-750 dark:bg-red-950/20 dark:text-red-400 border border-red-200 dark:border-red-900/30'
                      }`}>
                        {customer.status === 'Active' ? <FaCheckCircle className="text-[8px]" /> : <FaBan className="text-[8px]" />}
                        {customer.status}
                      </span>
                    </td>
                    {/* Actions Dropdown */}
                    <td className="px-6 py-4 text-right relative">
                      <button
                        onClick={() => setActiveMenuId(activeMenuId === customer.id ? null : customer.id)}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg cursor-pointer"
                      >
                        <FaEllipsisV />
                      </button>

                      {/* Dropdown Menu Overlay */}
                      {activeMenuId === customer.id && (
                        <div 
                          ref={dropdownRef}
                          className="absolute right-6 mt-1 w-36 bg-white dark:bg-[#0f1913] border border-gray-200 dark:border-emerald-950/60 rounded-xl shadow-xl z-30 py-1.5 overflow-hidden text-left"
                        >
                          <Link
                            to={`/customers/${customer.id}`}
                            className="flex items-center gap-2 px-3 py-2 text-[11px] font-semibold text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all"
                          >
                            <FaEye className="text-gray-400" />
                            View Profile
                          </Link>
                          <button
                            onClick={() => handleOpenEdit(customer)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-semibold text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all text-left cursor-pointer"
                          >
                            <FaPen className="text-gray-400" />
                            Edit Details
                          </button>
                          <button
                            onClick={() => {
                              toast.info(`Fetching logs for ${customer.name}...`);
                              setActiveMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-semibold text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all text-left cursor-pointer"
                          >
                            <FaHistory className="text-gray-400" />
                            History Logs
                          </button>
                          <button
                            onClick={() => handleOpenDelete(customer)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-semibold text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all text-left border-t border-gray-100 dark:border-emerald-950/15 cursor-pointer"
                          >
                            <FaTrashAlt className="text-red-400" />
                            Delete Account
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit and Delete Modals */}
      <AnimatePresence>
        {modalType && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#0c120f] border border-gray-250 dark:border-emerald-900/30 p-6 rounded-2xl w-full max-w-md shadow-2xl space-y-4 text-xs"
            >
              <div className="flex justify-between items-center border-b border-gray-100 dark:border-emerald-950/15 pb-2">
                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
                  {modalType === 'edit' ? 'Edit Customer Settings' : 'Confirm Deletion'}
                </h3>
                <button
                  onClick={() => setModalType(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer"
                >
                  <FaTimes />
                </button>
              </div>

              {modalType === 'edit' && (
                <form onSubmit={handleSaveEdit} className="space-y-4">
                  <div>
                    <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Customer Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full p-2 text-xs bg-gray-50 dark:bg-[#121c17] border border-gray-200 dark:border-emerald-950/30 rounded-xl dark:text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Mobile Number</label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full p-2 text-xs bg-gray-50 dark:bg-[#121c17] border border-gray-200 dark:border-emerald-950/30 rounded-xl dark:text-white focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Status</label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        className="w-full p-2 text-xs bg-gray-50 dark:bg-[#121c17] border border-gray-200 dark:border-emerald-950/30 rounded-xl dark:text-white focus:outline-none font-bold"
                      >
                        <option value="Active">Active</option>
                        <option value="Suspended">Suspended</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Subscription Plan</label>
                      <input
                        type="text"
                        value={editPlan}
                        onChange={(e) => setEditPlan(e.target.value)}
                        className="w-full p-2 text-xs bg-gray-50 dark:bg-[#121c17] border border-gray-200 dark:border-emerald-950/30 rounded-xl dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="pt-2 flex justify-end gap-2 font-bold">
                    <button
                      type="button"
                      onClick={() => setModalType(null)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-emerald-950/20 dark:text-emerald-350 rounded-xl cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              )}

              {modalType === 'delete' && (
                <div className="space-y-4">
                  <p className="text-gray-500 leading-relaxed">
                    Are you absolutely sure you want to delete the farm account for <strong>{selectedCustomer?.name}</strong>? All connected GPS trackers and vehicle mapping assignments will be de-registered. This action is permanent.
                  </p>
                  <div className="pt-2 flex justify-end gap-2 font-bold">
                    <button
                      onClick={() => setModalType(null)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-emerald-950/20 dark:text-emerald-350 rounded-xl cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmDelete}
                      className="px-4 py-2 bg-red-600 hover:bg-red-750 text-white rounded-xl cursor-pointer"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomerManagement;
