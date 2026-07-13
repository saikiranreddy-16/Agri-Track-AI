import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaBell, FaCheck, FaTrash, FaFilter, FaWifi, FaGasPump, 
  FaTools, FaRobot, FaCog, FaLaptop, FaChevronRight, FaTimes 
} from 'react-icons/fa';
import { mockNotifications } from '../data/mockData';
import { useToast } from '../context/ToastContext';
import { EmptyState } from '../components/EmptyState';

export const Notifications = () => {
  const toast = useToast();
  const [notifications, setNotifications] = useState(mockNotifications);
  const [activeFilter, setActiveFilter] = useState('All');

  // Categories list
  const categories = ['All', 'GPS', 'Fuel', 'Maintenance', 'AI', 'System', 'Device'];

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'GPS':
        return <FaWifi className="text-blue-500 shrink-0" />;
      case 'Fuel':
        return <FaGasPump className="text-orange-500 shrink-0" />;
      case 'Maintenance':
        return <FaTools className="text-yellow-500 shrink-0" />;
      case 'AI':
        return <FaRobot className="text-teal-500 shrink-0" />;
      case 'System':
        return <FaCog className="text-purple-500 shrink-0" />;
      default:
        return <FaLaptop className="text-emerald-500 shrink-0" />;
    }
  };

  const getSeverityClass = (severity) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'High':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'Medium':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      default:
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
  };

  const handleMarkAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    toast.success('Notification marked as read.');
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read.');
  };

  const handleDelete = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success('Notification removed.');
  };

  const handleClearAll = () => {
    const confirm = window.confirm('Are you sure you want to clear all notifications?');
    if (!confirm) return;
    setNotifications([]);
    toast.success('Notification database cleared.');
  };

  // Filtered lists
  const filteredNotifs = activeFilter === 'All'
    ? notifications
    : notifications.filter(n => n.category === activeFilter);

  // Group by timeline
  const todayNotifs = filteredNotifs.filter(n => n.dateGroup === 'Today');
  const yesterdayNotifs = filteredNotifs.filter(n => n.dateGroup === 'Yesterday');
  const thisWeekNotifs = filteredNotifs.filter(n => n.dateGroup === 'This Week');

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <FaBell className="text-emerald-600" />
            Notification Center
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Real-time diagnostics logs, fuel monitoring updates, maintenance alerts, and AI-assistant summaries.
          </p>
        </div>
        <div className="flex gap-2 text-xs font-bold">
          <button
            onClick={handleMarkAllRead}
            disabled={notifications.every(n => n.read)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-250 dark:border-emerald-900/30 rounded-xl hover:bg-emerald-100/50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <FaCheck /> Mark All Read
          </button>
          <button
            onClick={handleClearAll}
            disabled={notifications.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-red-50 text-red-750 dark:bg-red-950/20 dark:text-red-400 border border-red-200 dark:border-red-900/30 rounded-xl hover:bg-red-100/50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <FaTrash /> Clear All
          </button>
        </div>
      </div>

      {/* Filter Tabs bar */}
      <div className="flex gap-1.5 overflow-x-auto border-b border-gray-150 dark:border-emerald-950/20 pb-2.5 custom-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              activeFilter === cat
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-gray-550 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-emerald-950/15'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Timeline notifications feed */}
      {filteredNotifs.length === 0 ? (
        <EmptyState
          title={`No ${activeFilter !== 'All' ? activeFilter : ''} Alerts`}
          description="Your AgriTrack operations are running smoothly with no diagnostics registered."
          type="alerts"
        />
      ) : (
        <div className="space-y-6">
          
          {/* TODAY */}
          {todayNotifs.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Today</h3>
              <div className="space-y-2">
                <AnimatePresence>
                  {todayNotifs.map(n => (
                    <NotificationItem 
                      key={n.id} 
                      n={n} 
                      onRead={handleMarkAsRead} 
                      onDelete={handleDelete}
                      getIcon={getCategoryIcon}
                      getSeverity={getSeverityClass}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* YESTERDAY */}
          {yesterdayNotifs.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Yesterday</h3>
              <div className="space-y-2">
                <AnimatePresence>
                  {yesterdayNotifs.map(n => (
                    <NotificationItem 
                      key={n.id} 
                      n={n} 
                      onRead={handleMarkAsRead} 
                      onDelete={handleDelete}
                      getIcon={getCategoryIcon}
                      getSeverity={getSeverityClass}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* THIS WEEK */}
          {thisWeekNotifs.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">This Week</h3>
              <div className="space-y-2">
                <AnimatePresence>
                  {thisWeekNotifs.map(n => (
                    <NotificationItem 
                      key={n.id} 
                      n={n} 
                      onRead={handleMarkAsRead} 
                      onDelete={handleDelete}
                      getIcon={getCategoryIcon}
                      getSeverity={getSeverityClass}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};

// Item Component for clean code and exit animations
const NotificationItem = ({ n, onRead, onDelete, getIcon, getSeverity }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={`p-4 bg-white dark:bg-[#0e1712] border rounded-2xl shadow-sm hover:shadow transition-all flex justify-between items-start gap-4 ${
        n.read 
          ? 'border-gray-150 dark:border-emerald-950/10 opacity-70' 
          : 'border-emerald-100 dark:border-emerald-900/35 border-l-4 border-l-emerald-500'
      }`}
    >
      <div className="p-3 bg-gray-50 dark:bg-emerald-950/10 rounded-xl shrink-0">
        {getIcon(n.category)}
      </div>

      <div className="flex-1 text-xs space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-extrabold text-gray-800 dark:text-white">{n.title}</span>
          <span className={`px-2 py-0.2 rounded text-[8px] font-black uppercase border ${getSeverity(n.severity)}`}>
            {n.severity}
          </span>
        </div>
        <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-semibold">{n.message}</p>
        <span className="text-[9px] text-gray-400 font-bold block">{n.time}</span>
      </div>

      <div className="flex gap-2 shrink-0">
        {!n.read && (
          <button
            onClick={() => onRead(n.id)}
            className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-xl cursor-pointer"
            title="Mark as Read"
          >
            <FaCheck />
          </button>
        )}
        <button
          onClick={() => onDelete(n.id)}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl cursor-pointer"
          title="Remove"
        >
          <FaTimes />
        </button>
      </div>
    </motion.div>
  );
};

export default Notifications;
