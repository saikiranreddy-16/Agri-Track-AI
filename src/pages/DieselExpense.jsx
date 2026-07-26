import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaGasPump, FaPlus, FaCalendarAlt, FaReceipt, FaCoins, 
  FaFilter, FaSearch, FaUpload, FaCheckCircle, FaTrash 
} from 'react-icons/fa';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';

export const DieselExpense = () => {
  const toast = useToast();

  const [machines, setMachines] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [period, setPeriod] = useState('monthly');
  const [selectedVehicle, setSelectedVehicle] = useState('All');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form states
  const [formVehicleId, setFormVehicleId] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formQuantity, setFormQuantity] = useState('');
  const [formCostPerLitre, setFormCostPerLitre] = useState('');
  const [formPump, setFormPump] = useState('');
  const [formRemarks, setFormRemarks] = useState('');
  const [formBillPhoto, setFormBillPhoto] = useState('');

  // Summary Metrics
  const [summary, setSummary] = useState({ totalCost: 0, totalLitres: 0, avgCostPerLitre: 0 });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [period, selectedVehicle]);

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

  const fetchExpenses = async () => {
    try {
      const vehicleParam = selectedVehicle !== 'All' ? `&vehicleId=${selectedVehicle}` : '';
      const res = await api.get(`/expenses/diesel?period=${period}${vehicleParam}`);
      if (res.data && res.data.success) {
        setExpenses(res.data.data);
        setSummary(res.data.summary);
      }
    } catch (err) {
      console.error('Error fetching diesel expenses:', err);
    }
  };

  const totalCostCalculated = (Number(formQuantity) || 0) * (Number(formCostPerLitre) || 0);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formVehicleId || !formQuantity || !formCostPerLitre) {
      toast.error('Vehicle, Quantity, and Cost/Litre are required.');
      return;
    }

    try {
      const res = await api.post('/expenses/diesel', {
        vehicleId: formVehicleId,
        date: formDate,
        dieselQuantity: formQuantity,
        costPerLitre: formCostPerLitre,
        petrolPumpName: formPump,
        billPhoto: formBillPhoto,
        remarks: formRemarks,
      });

      if (res.data && res.data.success) {
        toast.success('Diesel filling record added successfully!');
        setIsAddOpen(false);
        setFormQuantity('');
        setFormCostPerLitre('');
        setFormPump('');
        setFormRemarks('');
        setFormBillPhoto('');
        fetchExpenses();
      }
    } catch (err) {
      console.error('Failed to save diesel expense:', err);
      toast.error('Failed to add diesel expense.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <FaGasPump className="text-orange-500" /> Diesel Expense Management
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Track fuel filling logs, petrol pump receipts, average fuel costs per acre & hour.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
        >
          <FaPlus className="text-xs" /> Log Diesel Filling
        </button>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="p-4 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl space-y-1">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Fuel Expenses</div>
          <div className="text-xl font-black text-orange-600">₹{summary.totalCost.toLocaleString('en-IN')}</div>
        </div>

        <div className="p-4 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl space-y-1">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Quantity Filled</div>
          <div className="text-xl font-black dark:text-white">{summary.totalLitres.toFixed(1)} <span className="text-xs font-semibold">Litres</span></div>
        </div>

        <div className="p-4 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl space-y-1">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Avg Cost / Litre</div>
          <div className="text-xl font-black text-emerald-600">₹{summary.avgCostPerLitre.toFixed(2)}</div>
        </div>

        <div className="p-4 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl space-y-1">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Estimated Fuel Cost / Acre</div>
          <div className="text-xl font-black text-indigo-600">₹450 <span className="text-xs font-semibold">/ acre</span></div>
        </div>

      </div>

      {/* Filter and Period Selector */}
      <div className="p-4 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
        
        <div className="flex gap-2">
          {['today', 'weekly', 'monthly'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl capitalize transition-all cursor-pointer ${
                period === p 
                  ? 'bg-orange-500 text-white shadow-sm' 
                  : 'bg-gray-100 dark:bg-emerald-950/30 text-gray-600 dark:text-gray-300'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <select
          value={selectedVehicle}
          onChange={(e) => setSelectedVehicle(e.target.value)}
          className="px-3 py-2 text-xs font-bold bg-gray-50 dark:bg-emerald-950/30 border border-gray-200 dark:border-emerald-950/40 rounded-xl focus:outline-none dark:text-white"
        >
          <option value="All">All Vehicles</option>
          {machines.map((m) => (
            <option key={m._id} value={m._id}>{m.name}</option>
          ))}
        </select>

      </div>

      {/* History Table */}
      <div className="bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-gray-100 dark:border-emerald-950/20 bg-gray-50 dark:bg-emerald-950/10 text-gray-400 font-bold uppercase tracking-wider">
              <th className="p-4">Date</th>
              <th className="p-4">Vehicle</th>
              <th className="p-4">Quantity</th>
              <th className="p-4">Rate / Litre</th>
              <th className="p-4">Total Cost</th>
              <th className="p-4">Petrol Pump</th>
              <th className="p-4">Receipt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-emerald-950/25">
            {expenses.map((exp) => (
              <tr key={exp._id} className="hover:bg-gray-50/50 dark:hover:bg-emerald-950/10 transition-colors font-medium">
                <td className="p-4 font-mono">{new Date(exp.date).toLocaleDateString()}</td>
                <td className="p-4 font-bold text-gray-900 dark:text-white">{exp.vehicleId?.name || 'Vehicle'}</td>
                <td className="p-4 font-bold text-orange-600">{exp.dieselQuantity} L</td>
                <td className="p-4 font-mono">₹{exp.costPerLitre}</td>
                <td className="p-4 font-black text-emerald-600">₹{exp.totalCost}</td>
                <td className="p-4">{exp.petrolPumpName || 'Local Fuel Station'}</td>
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
                <td colSpan="7" className="p-8 text-center text-xs text-gray-400">No diesel filling logs recorded for this period.</td>
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
                <FaGasPump className="text-orange-500" /> Log Diesel Filling
              </h2>

              <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Select Vehicle</label>
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
                    <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Date</label>
                    <input
                      type="date"
                      required
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-250 dark:border-emerald-955/30 bg-gray-50 dark:bg-emerald-950/20 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Quantity (Litres)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="0.5"
                      value={formQuantity}
                      onChange={(e) => setFormQuantity(e.target.value)}
                      placeholder="e.g. 50"
                      className="w-full p-2.5 rounded-xl border border-gray-250 dark:border-emerald-955/30 bg-gray-50 dark:bg-emerald-950/20 dark:text-white font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Cost Per Litre (₹)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="0.1"
                      value={formCostPerLitre}
                      onChange={(e) => setFormCostPerLitre(e.target.value)}
                      placeholder="e.g. 96.50"
                      className="w-full p-2.5 rounded-xl border border-gray-250 dark:border-emerald-955/30 bg-gray-50 dark:bg-emerald-950/20 dark:text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Calculated Total</label>
                    <div className="p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 font-black text-sm">
                      ₹{totalCostCalculated.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Petrol Pump Name</label>
                  <input
                    type="text"
                    value={formPump}
                    onChange={(e) => setFormPump(e.target.value)}
                    placeholder="e.g. Indian Oil, Madgulapally"
                    className="w-full p-2.5 rounded-xl border border-gray-250 dark:border-emerald-955/30 bg-gray-50 dark:bg-emerald-950/20 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Upload Fuel Bill (Simulated Path)</label>
                  <input
                    type="text"
                    value={formBillPhoto}
                    onChange={(e) => setFormBillPhoto(e.target.value)}
                    placeholder="/uploads/bills/fuel_receipt_1.jpg"
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
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-md"
                  >
                    Save Record
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
export default DieselExpense;
