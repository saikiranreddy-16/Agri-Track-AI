import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUser, FaMobileAlt, FaSearch, FaEllipsisV, FaEye, FaPen, 
  FaHistory, FaTrashAlt, FaTimes, FaShieldAlt, FaPlus, FaCheckCircle, 
  FaBan, FaMapMarkerAlt, FaFileContract, FaCreditCard
} from 'react-icons/fa';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { EmptyState } from '../components/EmptyState';

export const CustomerManagement = () => {
  const navigate = useNavigate();
  const toast = useToast();
  
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeMenuId, setActiveMenuId] = useState(null);
  const dropdownRef = useRef(null);

  // Modals state
  const [modalType, setModalType] = useState(null); // 'create', 'edit', 'delete', 'documents'
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  // Location selectors state
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [mandals, setMandals] = useState([]);
  const [villages, setVillages] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    alternatePhone: '',
    email: '',
    addressLine: '',
    state: '',
    district: '',
    mandal: '',
    village: '',
    pincode: '',
    planName: 'Standard',
    planExpiryDate: '',
    devicesAllowed: 5,
    paymentStatus: 'Paid',
    status: 'Active'
  });

  const fetchCustomers = async (search = '') => {
    setIsLoading(true);
    try {
      const response = await api.get(`/customers?search=${search}`);
      if (response.data && response.data.success) {
        setCustomers(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load customers:', error);
      toast.error('Failed to load customer list.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    // Load States on mount
    const loadStates = async () => {
      try {
        const response = await api.get('/customers/locations/states');
        if (response.data && response.data.success) {
          setStates(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching states:', err);
      }
    };
    loadStates();
  }, []);

  // Location selector triggers
  const handleStateChange = async (stateId) => {
    setFormData(prev => ({ ...prev, state: stateId, district: '', mandal: '', village: '', pincode: '' }));
    setDistricts([]);
    setMandals([]);
    setVillages([]);
    if (!stateId) return;
    try {
      const res = await api.get(`/customers/locations/districts?stateId=${stateId}`);
      if (res.data && res.data.success) setDistricts(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDistrictChange = async (distId) => {
    setFormData(prev => ({ ...prev, district: distId, mandal: '', village: '', pincode: '' }));
    setMandals([]);
    setVillages([]);
    if (!distId) return;
    try {
      const res = await api.get(`/customers/locations/mandals?districtId=${distId}`);
      if (res.data && res.data.success) setMandals(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleMandalChange = async (mandalId) => {
    setFormData(prev => ({ ...prev, mandal: mandalId, village: '', pincode: '' }));
    setVillages([]);
    if (!mandalId) return;
    try {
      const res = await api.get(`/customers/locations/villages?mandalId=${mandalId}`);
      if (res.data && res.data.success) setVillages(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleVillageChange = (villId) => {
    const selectedVill = villages.find(v => v._id === villId);
    setFormData(prev => ({ 
      ...prev, 
      village: villId, 
      pincode: selectedVill ? selectedVill.pincode : '' 
    }));
  };

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

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      phone: '',
      alternatePhone: '',
      email: '',
      addressLine: '',
      state: '',
      district: '',
      mandal: '',
      village: '',
      pincode: '',
      planName: 'Standard',
      planExpiryDate: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
      devicesAllowed: 5,
      paymentStatus: 'Paid',
      status: 'Active'
    });
    setDistricts([]);
    setMandals([]);
    setVillages([]);
    setModalType('create');
  };

  const handleOpenEdit = async (customer) => {
    setSelectedCustomer(customer);
    
    // Setup pre-fills
    const loc = customer.location || {};
    setFormData({
      name: customer.name,
      phone: customer.phone,
      alternatePhone: customer.alternatePhone || '',
      email: customer.email || '',
      addressLine: customer.addressLine || '',
      state: loc.state || '',
      district: loc.district || '',
      mandal: loc.mandal || '',
      village: loc.village || '',
      pincode: loc.pincode || '',
      planName: customer.planName || 'Standard',
      planExpiryDate: customer.planExpiryDate ? new Date(customer.planExpiryDate).toISOString().split('T')[0] : '',
      devicesAllowed: customer.devicesAllowed || 5,
      paymentStatus: customer.paymentStatus || 'Paid',
      status: customer.subscriptionStatus || 'Active'
    });

    // Populate dependent dropdown choices sequentially
    if (loc.state) {
      try {
        const dRes = await api.get(`/customers/locations/districts?stateId=${loc.state}`);
        if (dRes.data.success) setDistricts(dRes.data.data);
        if (loc.district) {
          const mRes = await api.get(`/customers/locations/mandals?districtId=${loc.district}`);
          if (mRes.data.success) setMandals(mRes.data.data);
          if (loc.mandal) {
            const vRes = await api.get(`/customers/locations/villages?mandalId=${loc.mandal}`);
            if (vRes.data.success) setVillages(vRes.data.data);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }

    setModalType('edit');
    setActiveMenuId(null);
  };

  const handleSaveCustomer = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast.error('Name and Mobile Number are required.');
      return;
    }

    try {
      if (modalType === 'create') {
        const res = await api.post('/customers', formData);
        if (res.data && res.data.success) {
          toast.success(`Customer ${formData.name} added successfully.`);
          setModalType(null);
          fetchCustomers(searchQuery);
        }
      } else if (modalType === 'edit') {
        const res = await api.put(`/customers/${selectedCustomer._id}`, formData);
        if (res.data && res.data.success) {
          toast.success(`Customer ${formData.name} updated successfully.`);
          setModalType(null);
          fetchCustomers(searchQuery);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error occurred while saving customer.');
    }
  };

  const handleOpenDelete = (customer) => {
    setSelectedCustomer(customer);
    setModalType('delete');
    setActiveMenuId(null);
  };

  const handleConfirmDelete = async () => {
    try {
      const res = await api.delete(`/customers/${selectedCustomer._id}`);
      if (res.data && res.data.success) {
        toast.success(`Account for ${selectedCustomer.name} has been deleted.`);
        setModalType(null);
        fetchCustomers(searchQuery);
      }
    } catch (err) {
      toast.error('Failed to delete customer.');
    }
  };

  const handleOpenDocs = (customer) => {
    setSelectedCustomer(customer);
    setDocName('');
    setDocPath('');
    setModalType('documents');
    setActiveMenuId(null);
  };

  const handleAddDocument = async (e) => {
    e.preventDefault();
    if (!docName.trim() || !docPath.trim()) {
      toast.error('Document title and path are required.');
      return;
    }
    try {
      const res = await api.post(`/customers/${selectedCustomer._id}/documents`, {
        documentType: docType,
        fileName: docName,
        filePath: docPath
      });
      if (res.data && res.data.success) {
        toast.success(`Document ${docName} uploaded.`);
        // Reload details payload
        const updatedDocs = [...(selectedCustomer.documents || []), res.data.data];
        setSelectedCustomer({ ...selectedCustomer, documents: updatedDocs });
        setDocName('');
        setDocPath('');
      }
    } catch (err) {
      toast.error('Error uploading document.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
            Customer Management
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Manage commercial subscription profiles, geographic address mapping, and uploaded support documents.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md cursor-pointer"
        >
          <FaPlus /> Add New Customer
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-[#0e1712] p-4 border border-gray-155 dark:border-emerald-950/20 rounded-2xl shadow-sm">
        <div className="relative w-full sm:w-96">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
            <FaSearch className="text-xs" />
          </span>
          <input
            type="text"
            placeholder="Search by name, phone, device ID, IMEI, state, district..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 dark:bg-[#121c17] border border-gray-200 dark:border-emerald-950/30 rounded-xl focus:bg-white focus:outline-none dark:text-white transition-all"
          />
        </div>
      </div>

      {/* Table grid */}
      {isLoading ? (
        <div className="space-y-4">
          <div className="h-10 bg-gray-250 dark:bg-emerald-950/10 rounded-xl animate-pulse" />
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-emerald-950/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : customers.length === 0 ? (
        <EmptyState 
          title="No Customers Found" 
          description="Try adjusting your search criteria or register a new customer account."
          type="general"
        />
      ) : (
        <div className="bg-white dark:bg-[#0e1712] border border-gray-200 dark:border-emerald-950/20 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-emerald-950/10 text-gray-400 dark:text-gray-400 uppercase font-bold tracking-wider border-b border-gray-100 dark:border-emerald-950/10">
                <tr>
                  <th className="px-6 py-3.5">Customer / Company</th>
                  <th className="px-6 py-3.5">Contact Details</th>
                  <th className="px-6 py-3.5">Address (Geographic)</th>
                  <th className="px-6 py-3.5 text-center">Active / Allowed Devices</th>
                  <th className="px-6 py-3.5">Subscription Plan</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-emerald-950/10">
                {customers.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50/50 dark:hover:bg-emerald-950/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-extrabold text-gray-800 dark:text-white flex items-center gap-1.5">
                        <FaUser className="text-emerald-500 text-[10px]" />
                        {c.name}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{c.company || 'Private Farm'}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-medium">
                      <div>Phone: {c.phone}</div>
                      {c.alternatePhone && <div className="text-[10px] text-gray-400 mt-0.5">Alt: {c.alternatePhone}</div>}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {c.location ? (
                        <>
                          <div className="font-semibold text-gray-700 dark:text-gray-200">
                            {c.location.villageName}, {c.location.mandalName}
                          </div>
                          <div className="text-[10px]">{c.location.districtName}, {c.location.stateName} - {c.location.pincode}</div>
                        </>
                      ) : (
                        <span className="text-gray-400">No Location Configured</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-emerald-600 dark:text-emerald-400">
                      {c.activeDevicesCount} / {c.devicesAllowed} Used
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-700 dark:text-gray-200">{c.planName || 'Standard'}</div>
                      <div className="text-[9px] text-gray-400 mt-0.5">Expires: {c.planExpiryDate ? new Date(c.planExpiryDate).toLocaleDateString() : 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase inline-flex items-center gap-1 ${
                        c.subscriptionStatus === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/35 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30'
                          : 'bg-red-50 text-red-750 dark:bg-red-950/20 dark:text-red-400 border border-red-200 dark:border-red-900/30'
                      }`}>
                        {c.subscriptionStatus === 'Active' ? <FaCheckCircle className="text-[8px]" /> : <FaBan className="text-[8px]" />}
                        {c.subscriptionStatus || 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <button
                        onClick={() => setActiveMenuId(activeMenuId === c._id ? null : c._id)}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg cursor-pointer"
                      >
                        <FaEllipsisV />
                      </button>

                      {activeMenuId === c._id && (
                        <div 
                          ref={dropdownRef}
                          className="absolute right-6 mt-1 w-40 bg-white dark:bg-[#0f1913] border border-gray-200 dark:border-emerald-950/60 rounded-xl shadow-xl z-30 py-1.5 overflow-hidden text-left"
                        >
                          <Link
                            to={`/customers/${c._id}`}
                            className="flex items-center gap-2 px-3 py-2 text-[11px] font-semibold text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all"
                          >
                            <FaEye className="text-gray-400" />
                            View Profile
                          </Link>
                          <button
                            onClick={() => handleOpenEdit(c)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-semibold text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all text-left cursor-pointer"
                          >
                            <FaPen className="text-gray-400" />
                            Edit Details
                          </button>

                          <button
                            onClick={() => handleOpenDelete(c)}
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

      {/* Forms Modals */}
      <AnimatePresence>
        {modalType && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#0c120f] border border-gray-200 dark:border-emerald-900/30 p-6 rounded-2xl w-full max-w-2xl shadow-2xl space-y-4 text-xs max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center border-b border-gray-100 dark:border-emerald-950/15 pb-2">
                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
                  {modalType === 'create' ? 'Register New Customer Account' : modalType === 'edit' ? 'Update Subscription Details' : modalType === 'documents' ? 'Customer Document Hub' : 'De-Register Account'}
                </h3>
                <button
                  onClick={() => setModalType(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer"
                >
                  <FaTimes />
                </button>
              </div>

              {(modalType === 'create' || modalType === 'edit') && (
                <form onSubmit={handleSaveCustomer} className="space-y-4">
                  
                  {/* General Profile fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Customer Full Name*</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full p-2 bg-gray-50 dark:bg-[#121c17] border border-gray-200 dark:border-emerald-950/30 rounded-xl dark:text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Primary Mobile Number*</label>
                      <input
                        type="text"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full p-2 bg-gray-50 dark:bg-[#121c17] border border-gray-200 dark:border-emerald-950/30 rounded-xl dark:text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Alternate Phone</label>
                      <input
                        type="text"
                        value={formData.alternatePhone}
                        onChange={(e) => setFormData(prev => ({ ...prev, alternatePhone: e.target.value }))}
                        className="w-full p-2 bg-gray-50 dark:bg-[#121c17] border border-gray-200 dark:border-emerald-950/30 rounded-xl dark:text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Email Address</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full p-2 bg-gray-50 dark:bg-[#121c17] border border-gray-200 dark:border-emerald-950/30 rounded-xl dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* India Geographic Hierarchy */}
                  <div className="border-t border-gray-100 dark:border-emerald-950/20 pt-4">
                    <h4 className="font-extrabold text-emerald-600 uppercase tracking-wider mb-3">Geographic Address details</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">State</label>
                        <select
                          value={formData.state}
                          onChange={(e) => handleStateChange(e.target.value)}
                          className="w-full p-2 bg-gray-50 dark:bg-[#121c17] border border-gray-200 dark:border-emerald-950/30 rounded-xl dark:text-white focus:outline-none font-semibold"
                        >
                          <option value="">Select State</option>
                          {states.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">District</label>
                        <select
                          value={formData.district}
                          onChange={(e) => handleDistrictChange(e.target.value)}
                          disabled={!formData.state}
                          className="w-full p-2 bg-gray-50 dark:bg-[#121c17] border border-gray-200 dark:border-emerald-950/30 rounded-xl dark:text-white focus:outline-none font-semibold disabled:opacity-50"
                        >
                          <option value="">Select District</option>
                          {districts.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Mandal</label>
                        <select
                          value={formData.mandal}
                          onChange={(e) => handleMandalChange(e.target.value)}
                          disabled={!formData.district}
                          className="w-full p-2 bg-gray-50 dark:bg-[#121c17] border border-gray-200 dark:border-emerald-950/30 rounded-xl dark:text-white focus:outline-none font-semibold disabled:opacity-50"
                        >
                          <option value="">Select Mandal</option>
                          {mandals.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Village</label>
                        <select
                          value={formData.village}
                          onChange={(e) => handleVillageChange(e.target.value)}
                          disabled={!formData.mandal}
                          className="w-full p-2 bg-gray-50 dark:bg-[#121c17] border border-gray-200 dark:border-emerald-950/30 rounded-xl dark:text-white focus:outline-none font-semibold disabled:opacity-50"
                        >
                          <option value="">Select Village</option>
                          {villages.map(v => <option key={v._id} value={v._id}>{v.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                      <div className="md:col-span-2">
                        <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Street Address</label>
                        <input
                          type="text"
                          value={formData.addressLine}
                          onChange={(e) => setFormData(prev => ({ ...prev, addressLine: e.target.value }))}
                          className="w-full p-2 bg-gray-50 dark:bg-[#121c17] border border-gray-200 dark:border-emerald-950/30 rounded-xl dark:text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Pincode</label>
                        <input
                          type="text"
                          readOnly
                          value={formData.pincode}
                          placeholder="Auto selected"
                          className="w-full p-2 bg-gray-100 dark:bg-emerald-950/20 border border-gray-200 dark:border-emerald-900/30 rounded-xl dark:text-white focus:outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Commercial Billing & Subscription fields */}
                  <div className="border-t border-gray-100 dark:border-emerald-950/20 pt-4">
                    <h4 className="font-extrabold text-emerald-600 uppercase tracking-wider mb-3">Subscription Details</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Plan Title</label>
                        <input
                          type="text"
                          value={formData.planName}
                          onChange={(e) => setFormData(prev => ({ ...prev, planName: e.target.value }))}
                          className="w-full p-2 bg-gray-50 dark:bg-[#121c17] border border-gray-200 dark:border-emerald-950/30 rounded-xl dark:text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Max Devices Allowed</label>
                        <input
                          type="number"
                          value={formData.devicesAllowed}
                          onChange={(e) => setFormData(prev => ({ ...prev, devicesAllowed: e.target.value }))}
                          className="w-full p-2 bg-gray-50 dark:bg-[#121c17] border border-gray-200 dark:border-emerald-950/30 rounded-xl dark:text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Plan Expiry Date</label>
                        <input
                          type="date"
                          value={formData.planExpiryDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, planExpiryDate: e.target.value }))}
                          className="w-full p-2 bg-gray-50 dark:bg-[#121c17] border border-gray-200 dark:border-emerald-950/30 rounded-xl dark:text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Payment Status</label>
                        <select
                          value={formData.paymentStatus}
                          onChange={(e) => setFormData(prev => ({ ...prev, paymentStatus: e.target.value }))}
                          className="w-full p-2 bg-gray-50 dark:bg-[#121c17] border border-gray-200 dark:border-emerald-950/30 rounded-xl dark:text-white focus:outline-none font-bold"
                        >
                          <option value="Paid">Paid</option>
                          <option value="Unpaid">Unpaid</option>
                          <option value="Pending">Pending</option>
                        </select>
                      </div>
                      {modalType === 'edit' && (
                        <div>
                          <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Subscription Status</label>
                          <select
                            value={formData.status}
                            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                            className="w-full p-2 bg-gray-50 dark:bg-[#121c17] border border-gray-200 dark:border-emerald-950/30 rounded-xl dark:text-white focus:outline-none font-bold"
                          >
                            <option value="Active">Active</option>
                            <option value="Suspended">Suspended</option>
                            <option value="Expired">Expired</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end gap-2 font-bold border-t border-gray-100 dark:border-emerald-950/20">
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
                      Save Account details
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
