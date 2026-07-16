import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPlus, FaCheckCircle, FaExclamationTriangle, FaClock, 
  FaTractor, FaUserTie, FaTasks, FaCalendarAlt, FaSlidersH 
} from 'react-icons/fa';
import { mockJobs, mockMachines, mockDrivers } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

export const Jobs = () => {
  const { user } = useAuth();
  
  // Local state for CRUD operations
  const [jobs, setJobs] = useState(mockJobs);
  const [selectedJob, setSelectedJob] = useState(mockJobs[0]);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formMachine, setFormMachine] = useState('');
  const [formDriver, setFormDriver] = useState('');
  const [formStart, setFormStart] = useState('');
  const [formEnd, setFormEnd] = useState('');
  const [formPriority, setFormPriority] = useState('Medium');

  const getMachineName = (id) => mockMachines.find(m => m.id === id)?.name || 'Unassigned';
  const getDriverName = (id) => mockDrivers.find(d => d.id === id)?.name || 'Unassigned';

  const handleOpenAdd = () => {
    setFormTitle('');
    setFormMachine('');
    setFormDriver('');
    setFormStart('');
    setFormEnd('');
    setFormPriority('Medium');
    setIsAddOpen(true);
  };

  const handleCreateJob = (e) => {
    e.preventDefault();
    if (!formTitle) return;

    const newJob = {
      id: `job-${Date.now()}`,
      title: formTitle,
      machineId: formMachine || null,
      driverId: formDriver || null,
      startDate: formStart || new Date().toISOString().split('T')[0],
      endDate: formEnd || new Date().toISOString().split('T')[0],
      status: 'Pending',
      priority: formPriority,
      progress: 0,
      timeline: [
        { date: new Date().toLocaleString(), title: 'Job Initiated', desc: 'Job queued for driver dispatch.' }
      ]
    };

    setJobs([newJob, ...jobs]);
    setSelectedJob(newJob);
    setIsAddOpen(false);
  };

  const updateProgress = (jobId, newProgress) => {
    const numericProgress = Math.max(0, Math.min(100, parseInt(newProgress, 10)));
    const updatedStatus = numericProgress === 100 ? 'Completed' : numericProgress > 0 ? 'In Progress' : 'Pending';
    
    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        const hasMilestone = j.timeline.some(t => t.title === 'Progress Change');
        const newMilestone = {
          date: new Date().toLocaleString(),
          title: 'Progress Change',
          desc: `Progress advanced to ${numericProgress}%`
        };

        const cleanedTimeline = j.timeline.filter(t => t.title !== 'Progress Change');

        return {
          ...j,
          progress: numericProgress,
          status: updatedStatus,
          timeline: [...cleanedTimeline, newMilestone]
        };
      }
      return j;
    }));

    setSelectedJob(prev => {
      if (prev.id === jobId) {
        return {
          ...prev,
          progress: numericProgress,
          status: updatedStatus,
          timeline: [
            ...prev.timeline.filter(t => t.title !== 'Progress Change'),
            { date: new Date().toLocaleString(), title: 'Progress Change', desc: `Progress advanced to ${numericProgress}%` }
          ]
        };
      }
      return prev;
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
            Job Scheduling Command
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Dispatch fieldwork, coordinate planting/harvest timelines and track task completion ratios.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
        >
          <FaPlus className="text-xs" /> Dispatch New Job
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Jobs List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-white mb-4">
              Operational Queue
            </h2>

            <div className="space-y-3">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedJob?.id === job.id
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-500/30 shadow-sm'
                      : 'bg-white dark:bg-[#0e1712] border-gray-100 dark:border-emerald-950/10 hover:bg-gray-50 dark:hover:bg-emerald-950/10'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-bold dark:text-white">{job.title}</h3>
                      <p className="text-[10px] text-gray-400 mt-1">
                        Dates: {job.startDate} to {job.endDate}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded leading-none uppercase ${
                        job.priority === 'High'
                          ? 'bg-red-100 text-red-800 dark:bg-red-950/50'
                          : job.priority === 'Medium'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/50'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50'
                      }`}>
                        {job.priority} Priority
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded leading-none uppercase ${
                        job.status === 'Completed'
                          ? 'bg-emerald-500 text-white'
                          : job.status === 'In Progress'
                          ? 'bg-emerald-100 text-emerald-850 dark:bg-emerald-950/40 dark:text-emerald-400 font-bold'
                          : 'bg-gray-250 text-gray-700 dark:bg-emerald-900/10'
                      }`}>
                        {job.status}
                      </span>
                    </div>
                  </div>

                  {/* Progress tracker bar */}
                  <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                    <span className="truncate pr-2">Asset: {getMachineName(job.machineId)} &bull; Driver: {getDriverName(job.driverId)}</span>
                    <span className="font-bold text-gray-700 dark:text-gray-200">{job.progress}%</span>
                  </div>
                  <div className="mt-2.5 w-full bg-gray-250 dark:bg-emerald-950/60 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${job.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Job details with timeline and mock tracking controls */}
        <div className="space-y-6">
          {selectedJob && (
            <div className="p-5 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl shadow-sm space-y-5">
              <div className="border-b border-gray-100 dark:border-emerald-950/20 pb-3">
                <span className="text-[9px] uppercase font-bold text-orange-500 tracking-wider">Job Tracking details</span>
                <h2 className="text-base font-extrabold dark:text-white mt-1">{selectedJob.title}</h2>
                <span className="text-[10px] text-gray-400">ID: {selectedJob.id}</span>
              </div>

              {/* Progress adjusting controls (Only for Operator or Admin/Owner) */}
              <div className="p-3 bg-gray-50 dark:bg-emerald-950/10 border border-gray-100 dark:border-emerald-950/20 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1.5"><FaSlidersH /> Adjust Progress</span>
                  <span>{selectedJob.progress}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={selectedJob.progress}
                  onChange={(e) => updateProgress(selectedJob.id, e.target.value)}
                  className="w-full accent-emerald-500 bg-gray-200 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Milestones timeline */}
              <div className="space-y-3.5">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Timeline Milestones</h3>
                <div className="border-l-2 border-emerald-100 dark:border-emerald-900/30 ml-2.5 pl-4 space-y-4">
                  {selectedJob.timeline.map((mile, idx) => (
                    <div key={idx} className="relative text-xs leading-normal">
                      {/* Node Bullet */}
                      <span className="absolute -left-6.5 top-1.5 w-3 h-3 bg-emerald-500 border border-white dark:border-[#0e1712] rounded-full shadow" />
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold dark:text-white">{mile.title}</span>
                        <span className="text-[9px] text-gray-400 font-semibold">{mile.date.split(' ')[0]}</span>
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 text-[11px]">{mile.desc}</p>
                    </div>
                  ))}
                  {selectedJob.timeline.length === 0 && (
                    <p className="text-xs text-gray-400">No milestones logged yet.</p>
                  )}
                </div>
              </div>

            </div>
          )}
        </div>

      </div>

      {/* DISPATCH MODAL */}
      <AnimatePresence>
        {isAddOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0f1913] border border-gray-100 dark:border-emerald-950/50 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4"
            >
              <h2 className="text-base font-black dark:text-white">Queue Field Task</h2>
              <form onSubmit={handleCreateJob} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Job Title</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-250 dark:border-emerald-955/30 bg-gray-50 dark:bg-emerald-950/20 dark:text-white focus:outline-none focus:bg-white"
                    placeholder="e.g. Sowing Wheat North sector"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Select Machinery</label>
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

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Start Date</label>
                    <input
                      type="date"
                      value={formStart}
                      onChange={(e) => setFormStart(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-250 dark:border-emerald-955/30 bg-gray-50 dark:bg-emerald-950/20 dark:text-white focus:outline-none focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">End Date</label>
                    <input
                      type="date"
                      value={formEnd}
                      onChange={(e) => setFormEnd(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-250 dark:border-emerald-955/30 bg-gray-50 dark:bg-emerald-950/20 dark:text-white focus:outline-none focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Task Priority</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-250 dark:border-emerald-955/30 bg-gray-50 dark:bg-emerald-950/20 dark:text-white focus:outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
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
                    Dispatch Job
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
export default Jobs;
