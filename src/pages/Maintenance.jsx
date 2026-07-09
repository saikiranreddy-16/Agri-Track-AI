import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTools, FaPlus, FaCheckCircle, FaExclamationTriangle, 
  FaCalendarAlt, FaGasPump, FaUserCheck, FaChevronRight 
} from 'react-icons/fa';
import { mockMaintenanceSchedule, mockMachines } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

export const Maintenance = () => {
  const { user } = useAuth();
  
  const [upcoming, setUpcoming] = useState(mockMaintenanceSchedule.upcoming);
  const [history, setHistory] = useState(mockMaintenanceSchedule.history);
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  
  // Modal forms
  const [formCost, setFormCost] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formMech, setFormMech] = useState('Workshop Team');

  const handleOpenComplete = (task) => {
    setActiveTask(task);
    setFormCost('');
    setFormNotes('');
    setFormMech(user?.name || 'Farm Crew');
    setIsModalOpen(true);
  };

  const handleCompleteSubmit = (e) => {
    e.preventDefault();
    if (!activeTask) return;

    // Move to history list
    const completedRecord = {
      id: `m-hi-${Date.now()}`,
      machine: activeTask.machine,
      machineId: activeTask.machineId,
      task: activeTask.task,
      date: new Date().toISOString().split('T')[0],
      mechanic: formMech,
      cost: parseInt(formCost, 10) || 0,
      notes: formNotes || 'Service completed successfully.'
    };

    setHistory([completedRecord, ...history]);
    setUpcoming(prev => prev.filter(t => t.id !== activeTask.id));
    setIsModalOpen(false);
    setActiveTask(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
          Maintenance & Service Log
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Monitor upcoming scheduled maintenance tasks, review machinery repair costs, and complete task checklists.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Upcoming scheduled tasks list */}
        <div className="p-5 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h2 className="text-base font-bold dark:text-white flex items-center gap-2">
              <FaCalendarAlt className="text-emerald-600" /> Upcoming Service Queue
            </h2>
            <p className="text-[10px] text-gray-400">Scheduled checks, oil inspects, and filter cycles due.</p>
          </div>

          <div className="space-y-3.5 flex-1 overflow-y-auto max-h-[420px] pr-1 custom-scrollbar">
            {upcoming.map((task) => (
              <div 
                key={task.id} 
                className="p-4 bg-gray-50 dark:bg-emerald-950/10 border border-gray-150 dark:border-emerald-950/20 rounded-xl flex justify-between items-start text-xs font-semibold"
              >
                <div className="space-y-1.5 flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm truncate dark:text-white">{task.machine}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded leading-none uppercase ${
                      task.priority === 'High' 
                        ? 'bg-red-100 text-red-800 dark:bg-red-950/50' 
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/50'
                    }`}>
                      {task.priority} Priority
                    </span>
                  </div>
                  <p className="text-emerald-700 dark:text-emerald-400 font-bold">{task.task}</p>
                  <div className="text-[10px] text-gray-400">Target Date: {task.date}</div>
                </div>

                {user?.role !== 'Operator' && (
                  <button
                    onClick={() => handleOpenComplete(task)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm font-bold shrink-0 self-center"
                  >
                    <FaCheckCircle className="text-[10px]" /> Complete
                  </button>
                )}
              </div>
            ))}
            {upcoming.length === 0 && (
              <div className="text-center py-20 text-gray-400 text-xs">All machinery services up to date!</div>
            )}
          </div>
        </div>

        {/* Maintenance History */}
        <div className="p-5 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h2 className="text-base font-bold dark:text-white flex items-center gap-2">
              <FaTools className="text-orange-500" /> Completed Service History
            </h2>
            <p className="text-[10px] text-gray-400 font-semibold">Past repairs, part replacements, and logs.</p>
          </div>

          <div className="space-y-3.5 flex-1 overflow-y-auto max-h-[420px] pr-1 custom-scrollbar">
            {history.map((record) => (
              <div 
                key={record.id} 
                className="p-4 bg-gray-50/50 dark:bg-[#080d0a] border border-gray-150 dark:border-emerald-950/20 rounded-xl text-xs space-y-2.5 font-semibold"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-extrabold text-sm dark:text-white">{record.machine}</h3>
                    <p className="text-gray-400 mt-0.5">{record.task}</p>
                  </div>
                  <span className="text-emerald-600 dark:text-emerald-400 font-black text-sm">₹{record.cost}</span>
                </div>

                <p className="text-gray-500 dark:text-gray-400 leading-normal bg-white dark:bg-[#0e1712] p-2.5 rounded-lg border border-gray-100 dark:border-emerald-950/20 text-[11px] font-medium">
                  {record.notes}
                </p>

                <div className="flex justify-between items-center text-[10px] text-gray-400 font-semibold">
                  <span className="flex items-center gap-1.5"><FaUserCheck /> Handled: {record.mechanic}</span>
                  <span>Date: {record.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* CLOSE SERVICE MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0f1913] border border-gray-100 dark:border-emerald-950/50 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4"
            >
              <h2 className="text-base font-black dark:text-white">Complete Scheduled Maintenance</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-normal">
                Log resolution details for <strong>{activeTask?.machine}</strong>: <em>"{activeTask?.task}"</em>.
              </p>

              <form onSubmit={handleCompleteSubmit} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Service Cost (₹)</label>
                    <input
                      type="number"
                      required
                      value={formCost}
                      onChange={(e) => setFormCost(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-250 dark:border-emerald-955/30 bg-gray-50 dark:bg-emerald-950/20 dark:text-white focus:outline-none focus:bg-white"
                      placeholder="e.g. 3500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Service Rep</label>
                    <input
                      type="text"
                      required
                      value={formMech}
                      onChange={(e) => setFormMech(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-250 dark:border-emerald-955/30 bg-gray-50 dark:bg-emerald-950/20 dark:text-white focus:outline-none focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Operator / Repair Notes</label>
                  <textarea
                    rows="3"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-250 dark:border-emerald-955/30 bg-gray-50 dark:bg-emerald-950/20 dark:text-white focus:outline-none focus:bg-white resize-none"
                    placeholder="e.g. Replaced filter seals, checked hydraulic flow valves, completed nominal safety testing."
                  />
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => { setIsModalOpen(false); setActiveTask(null); }}
                    className="px-4 py-2 rounded-xl border border-gray-200 dark:border-emerald-950/30 text-gray-500 font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md"
                  >
                    Confirm Complete
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
export default Maintenance;
