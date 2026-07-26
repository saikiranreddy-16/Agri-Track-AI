import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCoins, FaPlus, FaMoneyBillWave, FaChartLine, 
  FaUserTie, FaTruck, FaWarehouse, FaCogs, FaCheckCircle 
} from 'react-icons/fa';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';

export const FinancialModule = () => {
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('expenses'); // 'expenses', 'income', 'profit-loss'
  const [machines, setMachines] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [isAddOperatingOpen, setIsAddOperatingOpen] = useState(false);
  const [isAddIncomeOpen, setIsAddIncomeOpen] = useState(false);

  // Operating Form
  const [formVehicleId, setFormVehicleId] = useState('');
  const [formOpCategory, setFormOpCategory] = useState('Driver Salary');
  const [formOpAmount, setFormOpAmount] = useState('');
  const [formOpRemarks, setFormOpRemarks] = useState('');

  // Income Form
  const [formIncSource, setFormIncSource] = useState('Custom Hire');
  const [formIncAmount, setFormIncAmount] = useState('');
  const [formIncRemarks, setFormIncRemarks] = useState('');

  useEffect(() => {
    fetchInitialData();
    fetchSummary();
  }, []);

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

  const fetchSummary = async () => {
    try {
      const res = await api.get('/income/profit-loss');
      if (res.data && res.data.success) {
        setSummaryData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching financial summary:', err);
    }
  };

  const handleAddOperating = async (e) => {
    e.preventDefault();
    if (!formVehicleId || !formOpAmount) return;

    try {
      const res = await api.post('/expenses/operating', {
        vehicleId: formVehicleId,
        category: formOpCategory,
        amount: formOpAmount,
        remarks: formOpRemarks,
      });
      if (res.data && res.data.success) {
        toast.success('Operating expense added!');
        setIsAddOperatingOpen(false);
        setFormOpAmount('');
        fetchSummary();
      }
    } catch (err) {
      toast.error('Failed to log operating expense.');
    }
  };

  const handleAddIncome = async (e) => {
    e.preventDefault();
    if (!formVehicleId || !formIncAmount) return;

    try {
      const res = await api.post('/income', {
        vehicleId: formVehicleId,
        source: formIncSource,
        amount: formIncAmount,
        remarks: formIncRemarks,
      });
      if (res.data && res.data.success) {
        toast.success('Vehicle income recorded!');
        setIsAddIncomeOpen(false);
        setFormIncAmount('');
        fetchSummary();
      }
    } catch (err) {
      toast.error('Failed to record vehicle revenue.');
    }
  };

  const chartData = summaryData ? [
    { name: 'Diesel', Expense: summaryData.totalDieselExpense || 0 },
    { name: 'Service', Expense: summaryData.totalServiceExpense || 0 },
    { name: 'Operating', Expense: summaryData.totalOperatingExpense || 0 },
  ] : [];

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <FaCoins className="text-emerald-500" /> Vehicle Financials & Operating Expenses
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Flexible expense tracking (Diesel, Service, Labour, Transport). Income entry is optional.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsAddOperatingOpen(true)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <FaPlus /> Log Operating Cost
          </button>
          <button
            onClick={() => setIsAddIncomeOpen(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <FaPlus /> Log Income (Optional)
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-emerald-950/40 pb-2">
        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'expenses' ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-emerald-950/20'
          }`}
        >
          Expenses Breakdown
        </button>
        <button
          onClick={() => setActiveTab('profit-loss')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'profit-loss' ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-emerald-950/20'
          }`}
        >
          Profit & Loss Analysis
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="p-4 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl space-y-1">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Expenses</div>
          <div className="text-xl font-black text-red-500">₹{(summaryData?.totalExpense || 0).toLocaleString('en-IN')}</div>
        </div>

        <div className="p-4 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl space-y-1">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Diesel Cost</div>
          <div className="text-xl font-black text-orange-500">₹{(summaryData?.totalDieselExpense || 0).toLocaleString('en-IN')}</div>
        </div>

        <div className="p-4 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl space-y-1">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Service Cost</div>
          <div className="text-xl font-black text-purple-500">₹{(summaryData?.totalServiceExpense || 0).toLocaleString('en-IN')}</div>
        </div>

        <div className="p-4 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl space-y-1">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Operating Expenses</div>
          <div className="text-xl font-black text-emerald-600">₹{(summaryData?.totalOperatingExpense || 0).toLocaleString('en-IN')}</div>
        </div>

      </div>

      {/* Profit & Loss Notice if Income not entered */}
      {activeTab === 'profit-loss' && !summaryData?.hasIncomeLogged && (
        <div className="p-6 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl text-center space-y-2">
          <FaCoins className="text-3xl text-amber-500 mx-auto" />
          <h3 className="text-sm font-black text-amber-800 dark:text-amber-300">Income Entry is Optional</h3>
          <p className="text-xs text-amber-700 dark:text-amber-400 max-w-md mx-auto">
            You haven't logged any vehicle custom hire revenue yet. Income entry is completely optional. Profit/Loss graphs will activate dynamically once income is added.
          </p>
        </div>
      )}

      {/* Chart View */}
      <div className="p-5 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Expense Distribution Chart</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
              <Bar dataKey="Expense" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Add Operating Expense Modal */}
      <AnimatePresence>
        {isAddOperatingOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0f1913] border border-gray-100 dark:border-emerald-950/50 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4"
            >
              <h2 className="text-base font-black dark:text-white">Log Operating Expense</h2>
              <form onSubmit={handleAddOperating} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Vehicle</label>
                  <select
                    value={formVehicleId}
                    onChange={(e) => setFormVehicleId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-250 dark:border-emerald-955/30 bg-gray-50 dark:bg-emerald-950/20 dark:text-white font-bold"
                  >
                    {machines.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Category</label>
                  <select
                    value={formOpCategory}
                    onChange={(e) => setFormOpCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-250 dark:border-emerald-955/30 bg-gray-50 dark:bg-emerald-950/20 dark:text-white font-bold"
                  >
                    {['Driver Salary', 'Labour', 'Loading', 'Transport', 'Parking', 'Miscellaneous'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={formOpAmount}
                    onChange={(e) => setFormOpAmount(e.target.value)}
                    placeholder="e.g. 500"
                    className="w-full p-2.5 rounded-xl border border-gray-250 dark:border-emerald-955/30 bg-gray-50 dark:bg-emerald-950/20 dark:text-white font-bold"
                  />
                </div>
                <div className="flex gap-2 justify-end pt-3">
                  <button type="button" onClick={() => setIsAddOperatingOpen(false)} className="px-4 py-2 border rounded-xl">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold">Save Expense</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Income Modal */}
      <AnimatePresence>
        {isAddIncomeOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0f1913] border border-gray-100 dark:border-emerald-950/50 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4"
            >
              <h2 className="text-base font-black dark:text-white">Log Vehicle Revenue (Optional)</h2>
              <form onSubmit={handleAddIncome} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Vehicle</label>
                  <select
                    value={formVehicleId}
                    onChange={(e) => setFormVehicleId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-250 dark:border-emerald-955/30 bg-gray-50 dark:bg-emerald-950/20 dark:text-white font-bold"
                  >
                    {machines.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Source / Work Type</label>
                  <select
                    value={formIncSource}
                    onChange={(e) => setFormIncSource(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-250 dark:border-emerald-955/30 bg-gray-50 dark:bg-emerald-950/20 dark:text-white font-bold"
                  >
                    {['Custom Hire', 'Harvesting Work', 'Plowing', 'Haulage', 'Subsidy', 'Other'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Amount Earned (₹)</label>
                  <input
                    type="number"
                    required
                    value={formIncAmount}
                    onChange={(e) => setFormIncAmount(e.target.value)}
                    placeholder="e.g. 3500"
                    className="w-full p-2.5 rounded-xl border border-gray-250 dark:border-emerald-955/30 bg-gray-50 dark:bg-emerald-950/20 dark:text-white font-bold"
                  />
                </div>
                <div className="flex gap-2 justify-end pt-3">
                  <button type="button" onClick={() => setIsAddIncomeOpen(false)} className="px-4 py-2 border rounded-xl">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold">Record Revenue</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
export default FinancialModule;
