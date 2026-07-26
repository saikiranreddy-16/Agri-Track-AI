import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTools, FaPlus, FaCalendarAlt, FaWrench, 
  FaCheckCircle, FaExclamationTriangle, FaFilter, FaClock 
} from 'react-icons/fa';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';

const SERVICE_CATEGORIES = [
  'All',
  'Oil Change',
  'Engine Oil',
  'Hydraulic Oil',
  'Coolant',
  'Greasing',
  'Filters',
  'Battery',
  'Tyres',
  'Clutch',
  'Gear Box',
  'Others',
];

export const ServiceExpense = () => {
  const toast = useToast();

  const [machines, setMachines] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedVehicle, setSelectedVehicle] = useState('All');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form state
  const [formVehicleId, setFormVehicleId] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formCost, setFormCost] = useState('');
  const [formCategory, setFormCategory] = useState('Oil Change');
  const [formDescription, setFormDescription] = useState('');
  const [formWorkshop, setFormWorkshop] = useState('');
  const [formHours, setFormHours] = useState('');
  const [formBillPhoto, setFormBillPhoto] = useState('');

  const [summary, setSummary] = useState({ totalServiceCost: 0, count: 0 });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchServiceExpenses();
  }, [activeCategory, selectedVehicle]);

  const fetchInitialData = async () => {
    try {
      const res = await api.get('/machines');
      if (res.data && res.data.success) {
        setMachines(res.data.data);
        if (res.data.data.length > 0) {
          setFormVehicleId(res.data.data[0]._id);
        }
      }
    } catch (err) {
      console.error('Error fetching machines:', err);
    }
  };

  const fetchServiceExpenses = async () => {
    try {
      const catParam = activeCategory !== 'All' ? `?category=${encodeURIComponent(activeCategory)}` : '';
      const vehicleParam = selectedVehicle !== 'All' ? `${catParam ? '&' : '?'}vehicleId=${selectedVehicle}` : '';
      const res = await api.get(`/expenses/service${catParam}${vehicleParam}`);
      if (res.data && res.data.success) {
        setExpenses(res.data.data);
        setSummary(res.data.summary);
      }
    } catch (err) {
      console.error('Error fetching service expenses:', err);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formVehicleId || !formCost) {
      toast.error('Vehicle and Service Cost are required.');
      return;
    }

    try {
      const res = await api.post('/expenses/service', {
        vehicleId: formVehicleId,
        date: formDate,
        serviceCost: formCost,
        category: formCategory,
        description: formDescription,
        workshopName: formWorkshop,
        engineHours: formHours,
        billPhoto: formBillPhoto,
      });

      if (res.data && res.data.success) {
        toast.success('Service log recorded successfully!');
        setIsAddOpen(false);
        setFormCost('');
        setFormDescription('');
        setFormWorkshop('');
        setFormHours('');
        setFormBillPhoto('');
        fetchServiceExpenses();
      }
    } catch (err) {
      console.error('Failed to save service record:', err);
      toast.error('Failed to log service expense.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <FaTools className="text-purple-600" /> Maintenance & Service History
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Store workshop maintenance bills, service cost logs, next service due reminders.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
        >
          <FaPlus className="text-xs" /> Log Vehicle Service
        </button>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="p-4 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl space-y-1">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Service Expenses</div>
          <div className="text-xl font-black text-purple-600">₹{summary.totalServiceCost.toLocaleString('en-IN')}</div>
        </div>

        <div className="p-4 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl space-y-1">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Services Logged</div>
          <div className="text-xl font-black dark:text-white">{summary.count} <span className="text-xs font-semibold">records</span></div>
        </div>

        <div className="p-4 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl space-y-1">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Last Service Conducted</div>
          <div className="text-sm font-black text-emerald-600">Oil & Filter Change</div>
        </div>

        <div className="p-4 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl space-y-1">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Next Service Due</div>
          <div className="text-sm font-black text-orange-500">In 45 Engine Hours</div>
        </div>

      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {SERVICE_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === cat
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-white dark:bg-[#0e1712] border border-gray-200 dark:border-emerald-950/40 text-gray-600 dark:text-gray-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* History Table */}
      <div className="bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-gray-100 dark:border-emerald-950/20 bg-gray-50 dark:bg-emerald-950/10 text-gray-400 font-bold uppercase tracking-wider">
              <th className="p-4">Date</th>
              <th className="p-4">Vehicle</th>
              <th className="p-4">Category</th>
              <th className="p-4">Workshop</th>
              <th className="p-4">Engine Hours</th>
              <th className="p-4">Cost</th>
              <th className="p-4">Bill Receipt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-emerald-950/25">
            {expenses.map((exp) => (
              <tr key={exp._id} className="hover:bg-gray-50/50 dark:hover:bg-emerald-950/10 transition-colors font-medium">
                <td className="p-4 font-mono">{new Date(exp.date).toLocaleDateString()}</td>
                <td className="p-4 font-bold text-gray-900 dark:text-white">{exp.vehicleId?.name || 'Vehicle'}</td>
                <td className="p-4"><span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300 font-bold">{exp.category}</span></td>
                <td className="p-4">{exp.workshopName || 'Authorized Service Center'}</td>
                <td className="p-4 font-mono">{exp.engineHours} hrs</td>
                <td className="p-4 font-black text-purple-600">₹{exp.serviceCost}</td>
                <td className="p-4">
                  {exp.billPhoto ? (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">Uploaded</span>
                  ) : (
                    <span className="text-[10px] text-gray-400">No Receipt</span>
                  )}
                </td>
              </tr>
            ))}
            {expenses.length === 0 && (
              <tr>
                <td colSpan="7" className="p-8 text-center text-xs text-gray-400">No service logs registered under this category.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {isAddOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0f1913] border border-gray-100 dark:border-emerald-950/50 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4"
            >
              <h2 className="text-base font-black dark:text-white flex items-center gap-2">
                <FaTools className="text-purple-600" /> Log Maintenance Service
              </h2>

              <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Vehicle</label>
                  <select
                    value={formVehicleId}
                    onChange={(e) => setFormVehicleId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-250 dark:border-emerald-955/30 bg-gray-50 dark:bg-emerald-950/20 dark:text-white font-bold"
                  >
                    {machines.map((m) => (
                      <option key={m._id} value={m._id}>{m.name} ({m.registration})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Service Category</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-250 dark:border-emerald-955/30 bg-gray-50 dark:bg-emerald-950/20 dark:text-white font-bold"
                    >
                      {SERVICE_CATEGORIES.filter(c => c !== 'All').map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Service Cost (₹)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formCost}
                      onChange={(e) => setFormCost(e.target.value)}
                      placeholder="e.g. 4500"
                      className="w-full p-2.5 rounded-xl border border-gray-250 dark:border-emerald-955/30 bg-gray-50 dark:bg-emerald-950/20 dark:text-white font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Workshop Name</label>
                    <input
                      type="text"
                      value={formWorkshop}
                      onChange={(e) => setFormWorkshop(e.target.value)}
                      placeholder="e.g. Mahindra Service Hub"
                      className="w-full p-2.5 rounded-xl border border-gray-250 dark:border-emerald-955/30 bg-gray-50 dark:bg-emerald-950/20 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Current Engine Hours</label>
                    <input
                      type="number"
                      value={formHours}
                      onChange={(e) => setFormHours(e.target.value)}
                      placeholder="e.g. 240"
                      className="w-full p-2.5 rounded-xl border border-gray-250 dark:border-emerald-955/30 bg-gray-50 dark:bg-emerald-950/20 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Service Description / Notes</label>
                  <input
                    type="text"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="e.g. Replaced engine oil filter & greased front axles"
                    className="w-full p-2.5 rounded-xl border border-gray-250 dark:border-emerald-955/30 bg-gray-50 dark:bg-emerald-950/20 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Upload Service Bill (Simulated Path)</label>
                  <input
                    type="text"
                    value={formBillPhoto}
                    onChange={(e) => setFormBillPhoto(e.target.value)}
                    placeholder="/uploads/bills/service_bill_102.jpg"
                    className="w-full p-2.5 rounded-xl border border-gray-250 dark:border-emerald-955/30 bg-gray-50 dark:bg-emerald-950/20 dark:text-white font-mono text-[10px]"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-3">
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="px-4 py-2 border border-gray-200 dark:border-emerald-950/30 rounded-xl text-gray-500 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md"
                  >
                    Save Service Log
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
export default ServiceExpense;
