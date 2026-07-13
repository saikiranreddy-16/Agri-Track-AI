import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useUIState } from '../context/UIStateContext';
import { useTheme } from '../context/ThemeContext';
import { PATHS } from '../constants';
import { 
  FaBars, FaChevronLeft, FaSun, FaMoon, FaGlobe, FaBell, FaRobot, FaSearch, 
  FaSignOutAlt, FaTractor, FaUserTie, FaMap, FaTasks, FaFileContract, 
  FaExclamationTriangle, FaTools, FaCog, FaQuestionCircle, FaUser, 
  FaArrowRight, FaRoute, FaEnvelope, FaThLarge, FaShieldAlt, FaFilter
} from 'react-icons/fa';
import { mockMachines, mockCustomers } from '../data/mockData';
import { useToast } from '../context/ToastContext';

export const DashboardLayout = () => {
  const { user, logout, changeRole } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { 
    isSidebarExpanded, setIsSidebarExpanded, 
    globalSearchQuery, setGlobalSearchQuery,
    notifications, markAllNotificationsAsRead, clearNotification 
  } = useUIState();

  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [filterRegion, setFilterRegion] = useState('All');
  const searchContainerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const suggestionMachines = globalSearchQuery
    ? mockMachines.filter(m => m.name.toLowerCase().includes(globalSearchQuery.toLowerCase())).slice(0, 3)
    : [];
  const suggestionCustomers = globalSearchQuery
    ? mockCustomers.filter(c => c.name.toLowerCase().includes(globalSearchQuery.toLowerCase())).slice(0, 3)
    : [];
  
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [activeLang, setActiveLang] = useState('English');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const langRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setIsProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setIsNotifOpen(false);
      if (langRef.current && !langRef.current.contains(e.target)) setIsLangOpen(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const isCompanyAdmin = user?.role === 'Company Admin' || user?.role === 'Admin';

  const menuItems = isCompanyAdmin
    ? [
        { name: 'Dashboard', path: PATHS.DASHBOARD, icon: FaThLarge },
        { name: 'Customer Management', path: PATHS.CUSTOMER_MANAGEMENT, icon: FaUserTie },
        { name: 'Device Activation', path: PATHS.DEVICE_ACTIVATION, icon: FaTractor },
        { name: 'Device Replacement', path: PATHS.DEVICE_REPLACEMENT, icon: FaTools },
        { name: 'GPS Live Tracking', path: PATHS.TRACKING, icon: FaRoute },
        { name: 'Fleet Overview', path: PATHS.FLEET_OVERVIEW, icon: FaTractor },
        { name: 'Reports', path: PATHS.REPORTS, icon: FaFileContract },
        { name: 'AI Assistant', path: PATHS.AI_ASSISTANT, icon: FaRobot, highlight: true },
        { name: 'Settings', path: PATHS.SETTINGS, icon: FaCog },
        { name: 'Help', path: PATHS.HELP, icon: FaQuestionCircle }
      ]
    : [
        { name: 'Dashboard', path: PATHS.DASHBOARD, icon: FaThLarge },
        { name: 'My Vehicles', path: PATHS.MACHINES, icon: FaTractor },
        { name: 'Live Tracking', path: PATHS.TRACKING, icon: FaRoute },
        { name: 'GPS History', path: PATHS.GPS_HISTORY, icon: FaRoute },
        { name: 'Reports', path: PATHS.REPORTS, icon: FaFileContract },
        { name: 'Alerts', path: PATHS.ALERTS, icon: FaExclamationTriangle, badge: 'Active' },
        { name: 'Maintenance', path: PATHS.MAINTENANCE, icon: FaTools },
        { name: 'AI Assistant', path: PATHS.AI_ASSISTANT, icon: FaRobot, highlight: true },
        { name: 'Settings', path: PATHS.SETTINGS, icon: FaCog },
        { name: 'Help', path: PATHS.HELP, icon: FaQuestionCircle }
      ];

  // Helper to generate breadcrumbs
  const getBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter(x => x);
    const crumbs = [{ name: 'Dashboard', path: '/' }];
    
    let currentPath = '';
    pathnames.forEach((val, idx) => {
      currentPath += `/${val}`;
      let name = val.charAt(0).toUpperCase() + val.slice(1).replace(/-/g, ' ');
      
      // Handle dynamic IDs or paths
      if (val.startsWith('mach-') || val.startsWith('dev-') || (val.length > 10 && !isNaN(val.charAt(0)) === false)) {
        name = 'Details';
      } else if (val.startsWith('cust-')) {
        name = 'Profile';
      } else if (val === 'fleet') {
        name = 'Fleet Overview';
      } else if (val === 'customers') {
        name = 'Customer Management';
      } else if (val === 'activate') {
        name = 'Device Activation';
      } else if (val === 'replace') {
        name = 'Device Replacement';
      } else if (val === 'tracking') {
        name = 'Live Tracking';
      } else if (val === 'gps-history') {
        name = 'GPS History';
      } else if (val === 'ai-assistant') {
        name = 'AI Assistant';
      } else if (val === 'notifications') {
        name = 'Notifications';
      }
      
      crumbs.push({ name, path: currentPath });
    });
    
    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  const handleLogout = () => {
    logout();
    navigate(PATHS.LOGIN);
  };

  const categories = ['All', 'Fuel', 'GPS', 'Maintenance', 'Driver', 'System'];
  const filteredNotifications = notifications.filter(n => {
    if (activeCategory === 'All') return true;
    return n.category === activeCategory;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const SidebarContent = () => (
    <div className="flex flex-col h-full py-4 text-emerald-100 select-none">
      {/* Brand Title */}
      <div className="flex items-center gap-3 px-5 mb-6">
        <FaTractor className="text-3xl text-emerald-400 shrink-0" />
        {(!isSidebarExpanded ? false : true) && (
          <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1">
            AgriTrack <span className="text-orange-400 font-extrabold text-sm px-1.5 py-0.5 rounded bg-orange-400/10 border border-orange-400/20">AI</span>
          </span>
        )}
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 relative text-sm group ${
                isActive 
                  ? 'bg-emerald-700/80 text-white font-medium shadow-md shadow-emerald-950/20' 
                  : 'hover:bg-emerald-800/40 text-emerald-100 hover:text-white'
              } ${item.highlight ? 'border border-emerald-500/30 bg-emerald-800/25' : ''}`}
            >
              <Icon className={`text-lg shrink-0 ${isActive ? 'text-white' : 'text-emerald-300 group-hover:text-emerald-100'}`} />
              
              {isSidebarExpanded && (
                <span className="truncate flex-1">{item.name}</span>
              )}
              
              {isSidebarExpanded && item.badge && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase bg-orange-500 text-white">
                  {item.badge}
                </span>
              )}

              {/* Tooltip on collapse */}
              {!isSidebarExpanded && (
                <div className="absolute left-14 scale-0 group-hover:scale-100 bg-emerald-950 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-xl font-medium whitespace-nowrap z-50 transition-all origin-left">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>



      {/* Bottom Logout */}
      <div className="px-3 pt-2 mt-auto border-t border-emerald-800/30">
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-red-950/30 hover:text-red-300 text-emerald-200 transition-colors group relative cursor-pointer"
        >
          <FaSignOutAlt className="text-lg shrink-0 text-emerald-400 group-hover:text-red-400" />
          {isSidebarExpanded && <span>Logout</span>}
          {!isSidebarExpanded && (
            <div className="absolute left-14 scale-0 group-hover:scale-100 bg-red-950 text-red-100 text-xs px-2.5 py-1.5 rounded-lg shadow-xl font-medium whitespace-nowrap z-50 transition-all origin-left">
              Logout
            </div>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-[#0b120e] text-gray-800 dark:text-gray-100 transition-colors duration-200">
      
      {/* Desktop Permanent Sidebar */}
      <motion.aside
        animate={{ width: isSidebarExpanded ? 240 : 72 }}
        className="hidden md:flex flex-col h-full bg-emerald-900 border-r border-emerald-850 shrink-0 overflow-hidden relative shadow-lg z-20"
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile Sidebar Overlay (Drawer) */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-64 bg-emerald-900 z-50 shadow-2xl flex flex-col md:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Navbar */}
        <header className="h-16 shrink-0 bg-white dark:bg-[#0e1712] border-b border-gray-200 dark:border-emerald-950/30 flex items-center justify-between px-4 md:px-6 shadow-sm z-10 transition-colors">
          
          {/* Hamburger Menu & Collapser */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-2 -ml-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-emerald-950/40 md:hidden"
            >
              <FaBars className="text-lg" />
            </button>
            <button
              onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
              className="hidden md:block p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-emerald-950/40"
            >
              <motion.div animate={{ rotate: isSidebarExpanded ? 0 : 180 }}>
                <FaChevronLeft className="text-sm" />
              </motion.div>
            </button>

            {/* Breadcrumbs */}
            <nav className="flex items-center gap-1.5 text-[10px] md:text-xs font-medium text-gray-505 dark:text-gray-400">
              {breadcrumbs.map((crumb, idx) => (
                <div key={crumb.path} className="flex items-center gap-1.5">
                  {idx > 0 && <span className="text-gray-300 dark:text-emerald-950">/</span>}
                  <Link
                    to={crumb.path}
                    className={`hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors ${
                      idx === breadcrumbs.length - 1 ? 'text-gray-900 dark:text-white font-semibold' : ''
                    }`}
                  >
                    {crumb.name}
                  </Link>
                </div>
              ))}
            </nav>
          </div>

          {/* Global Search & Action Badges */}
          <div className="flex items-center gap-3">
            
            {/* Global Search Bar */}
            <div className="relative max-w-[200px] sm:max-w-xs hidden sm:block" ref={searchContainerRef}>
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 dark:text-gray-505 pointer-events-none">
                <FaSearch className="text-sm" />
              </span>
              <input
                type="text"
                value={globalSearchQuery}
                onChange={(e) => {
                  setGlobalSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search fleet, jobs, fields..."
                className="w-full pl-9 pr-8 py-1.5 text-sm rounded-xl bg-gray-100 dark:bg-emerald-950/30 border border-transparent focus:bg-white focus:border-emerald-500 focus:outline-none dark:focus:bg-emerald-950/60 dark:text-white transition-all shadow-inner"
              />
              <button
                onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                className={`absolute inset-y-0 right-0 pr-3 flex items-center text-xs transition-colors cursor-pointer ${
                  showFiltersPanel ? 'text-emerald-600 dark:text-emerald-450' : 'text-gray-400 hover:text-gray-600'
                }`}
                title="Toggle Filters"
              >
                <FaFilter className="text-[10px]" />
              </button>

              {/* Suggestions Dropdown Card */}
              {showSuggestions && globalSearchQuery && (
                <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-[#0f1913] border border-gray-200 dark:border-emerald-955/40 rounded-xl shadow-2xl z-50 py-1.5 overflow-hidden text-left text-[11px] max-h-60 overflow-y-auto">
                  <div className="px-3 py-1 font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest text-[8px] border-b border-gray-100 dark:border-emerald-955/10 mb-1">
                    Suggestions
                  </div>
                  
                  {/* Matches from vehicles */}
                  {suggestionMachines.map(m => (
                    <Link
                      key={m.id}
                      to={`/machines/${m.id}`}
                      onClick={() => {
                        setGlobalSearchQuery(m.name);
                        setShowSuggestions(false);
                      }}
                      className="flex items-center justify-between px-3 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all font-bold dark:text-gray-205"
                    >
                      <span>{m.name}</span>
                      <span className="text-[8px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1 py-0.2 rounded font-black uppercase">{m.status}</span>
                    </Link>
                  ))}

                  {/* Matches from customers */}
                  {suggestionCustomers.map(c => (
                    <Link
                      key={c.id}
                      to={`/customers/${c.id}`}
                      onClick={() => {
                        setGlobalSearchQuery(c.name);
                        setShowSuggestions(false);
                      }}
                      className="flex items-center justify-between px-3 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all font-bold dark:text-gray-205 border-t border-gray-100 dark:border-emerald-955/10"
                    >
                      <span>{c.name}</span>
                      <span className="text-[8px] bg-orange-500/10 text-orange-600 px-1 py-0.2 rounded font-black uppercase">Customer</span>
                    </Link>
                  ))}

                  {suggestionMachines.length === 0 && suggestionCustomers.length === 0 && (
                    <div className="px-3 py-4 text-center text-gray-405 italic">
                      No matching records found.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Messages Icon */}
            <div className="relative">
              <button 
                onClick={() => navigate(PATHS.NOTIFICATIONS)}
                className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-emerald-950/40 rounded-xl relative transition-all cursor-pointer"
                title="Notifications"
              >
                <FaEnvelope className="text-lg" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-orange-500 border-2 border-white dark:border-[#0e1712] rounded-full" />
              </button>
            </div>

            {/* Notifications panel dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => {
                  setIsNotifOpen(!isNotifOpen);
                  setIsProfileOpen(false);
                  setIsLangOpen(false);
                }}
                className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-emerald-950/40 rounded-xl relative transition-all"
                title="Notification Inbox"
              >
                <FaBell className="text-lg" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 px-1.5 py-0.5 text-[9px] font-bold bg-orange-500 text-white rounded-full leading-none transform translate-x-1 -translate-y-1 shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {isNotifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#0f1913] border border-gray-100 dark:border-emerald-950/60 rounded-2xl shadow-xl z-50 overflow-hidden"
                  >
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border-b border-gray-100 dark:border-emerald-950/40 flex justify-between items-center">
                      <span className="font-bold text-emerald-900 dark:text-emerald-400 text-sm">Notifications Center</span>
                      <button
                        onClick={markAllNotificationsAsRead}
                        className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                      >
                        Mark all read
                      </button>
                    </div>

                    {/* Filter categories */}
                    <div className="flex gap-1 overflow-x-auto p-2 border-b border-gray-100 dark:border-emerald-950/20 custom-scrollbar scrollbar-none">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setActiveCategory(cat)}
                          className={`text-[10px] px-2.5 py-1 rounded-full font-semibold transition-all ${
                            activeCategory === cat
                              ? 'bg-emerald-600 text-white'
                              : 'bg-gray-100 dark:bg-emerald-900/20 text-gray-500 dark:text-emerald-300 hover:bg-gray-200'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* Notification Rows */}
                    <div className="max-h-[300px] overflow-y-auto divide-y divide-gray-50 dark:divide-emerald-950/20 custom-scrollbar">
                      {filteredNotifications.length === 0 ? (
                        <div className="p-8 text-center text-xs text-gray-400">No warnings in this category.</div>
                      ) : (
                        filteredNotifications.map((n) => (
                          <div key={n.id} className={`p-4 flex gap-3 text-xs hover:bg-gray-50 dark:hover:bg-emerald-900/10 transition-colors ${!n.read ? 'bg-orange-50/25 dark:bg-orange-500/5' : ''}`}>
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-1">
                                <span className={`font-semibold ${!n.read ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>{n.title}</span>
                                <span className="text-[10px] text-gray-400 font-medium">{n.time}</span>
                              </div>
                              <p className="text-gray-600 dark:text-gray-300 leading-normal">{n.message}</p>
                              <div className="flex justify-between items-center mt-2">
                                <span className="text-[9px] uppercase font-bold text-orange-500 px-1.5 py-0.5 rounded bg-orange-500/10">{n.category}</span>
                                <button
                                  onClick={() => clearNotification(n.id)}
                                  className="text-[10px] text-red-500 hover:underline font-semibold"
                                >
                                  Dismiss
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Language Selector Dropdown */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => {
                  setIsLangOpen(!isLangOpen);
                  setIsProfileOpen(false);
                  setIsNotifOpen(false);
                }}
                className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-emerald-950/40 rounded-xl relative transition-all"
                title="Select Language"
              >
                <FaGlobe className="text-lg" />
              </button>

              <AnimatePresence>
                {isLangOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-40 bg-white dark:bg-[#0f1913] border border-gray-100 dark:border-emerald-950/60 rounded-2xl shadow-xl z-50 py-2 overflow-hidden"
                  >
                    {['English', 'हिन्दी (Hindi)', 'ਪੰਜਾਬੀ (Punjabi)', 'తెలుగు (Telugu)', 'मराठी (Marathi)'].map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          setActiveLang(lang);
                          setIsLangOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-xs font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all flex items-center justify-between ${
                          activeLang === lang ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-200'
                        }`}
                      >
                        {lang}
                        {activeLang === lang && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-emerald-950/40 rounded-xl transition-all"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <FaMoon className="text-lg" /> : <FaSun className="text-lg" />}
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-gray-200 dark:bg-emerald-950/40" />

            {/* Profile Menu Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  setIsNotifOpen(false);
                  setIsLangOpen(false);
                }}
                className="flex items-center gap-2 p-1.5 hover:bg-gray-100 dark:hover:bg-emerald-950/40 rounded-xl transition-all border border-transparent hover:border-gray-200 dark:hover:border-emerald-900/20"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500 font-bold text-white flex items-center justify-center text-sm shadow-sm">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="text-left hidden lg:block pr-1 select-none">
                  <div className="text-xs font-bold leading-none dark:text-white">{user?.name}</div>
                  <div className="text-[10px] text-orange-500 font-semibold mt-0.5 uppercase leading-none">{user?.role}</div>
                </div>
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#0f1913] border border-gray-100 dark:border-emerald-950/60 rounded-2xl shadow-xl z-50 py-2 overflow-hidden"
                  >
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-emerald-950/20">
                      <p className="text-xs text-gray-400">Signed in as</p>
                      <p className="text-sm font-bold text-emerald-900 dark:text-emerald-400 truncate">{user?.email}</p>
                    </div>

                    <Link
                      to={PATHS.SETTINGS}
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all font-semibold"
                    >
                      <FaUser className="text-gray-400 dark:text-emerald-600" />
                      Profile
                    </Link>

                    <Link
                      to={PATHS.SETTINGS}
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all font-semibold"
                    >
                      <FaCog className="text-gray-400 dark:text-emerald-600" />
                      Settings
                    </Link>

                    {!isCompanyAdmin && (
                      <Link
                        to={`${PATHS.SETTINGS}?tab=security`}
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all font-semibold"
                      >
                        <FaShieldAlt className="text-gray-400 dark:text-emerald-600" />
                        Trusted Devices
                      </Link>
                    )}

                    <Link
                      to={PATHS.HELP}
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all font-semibold"
                    >
                      <FaQuestionCircle className="text-gray-400 dark:text-emerald-600" />
                      Help
                    </Link>

                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        setShowLogoutConfirm(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all font-semibold border-t border-gray-100 dark:border-emerald-950/20 cursor-pointer"
                    >
                      <FaSignOutAlt className="text-red-400" />
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

        </header>

        {/* Collapsible Filter Panel */}
        <AnimatePresence>
          {showFiltersPanel && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-white dark:bg-[#0c120f] border-b border-gray-150 dark:border-emerald-950/20 px-6 py-4 shadow-md z-20 overflow-hidden text-xs leading-normal shrink-0"
            >
              <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Vehicle Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => {
                      setFilterStatus(e.target.value);
                      toast.success(`Filter Status set to: ${e.target.value}`);
                    }}
                    className="w-full p-2 bg-gray-50 dark:bg-emerald-955/5 border border-gray-200 dark:border-emerald-950/30 rounded-xl dark:text-white focus:outline-none font-bold"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Active">🟢 Active</option>
                    <option value="Idle">🟡 Idle</option>
                    <option value="Offline">🔴 Offline</option>
                    <option value="Maintenance">🟠 Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Vehicle Type</label>
                  <select
                    value={filterType}
                    onChange={(e) => {
                      setFilterType(e.target.value);
                      toast.success(`Filter Type set to: ${e.target.value}`);
                    }}
                    className="w-full p-2 bg-gray-50 dark:bg-emerald-955/5 border border-gray-200 dark:border-emerald-950/30 rounded-xl dark:text-white focus:outline-none font-bold"
                  >
                    <option value="All">All Types</option>
                    <option value="Tractor">Tractor</option>
                    <option value="Harvester">Harvester</option>
                    <option value="Sprayer">Sprayer</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Farm Block / Region</label>
                  <select
                    value={filterRegion}
                    onChange={(e) => {
                      setFilterRegion(e.target.value);
                      toast.success(`Filter Region set to: ${e.target.value}`);
                    }}
                    className="w-full p-2 bg-gray-50 dark:bg-emerald-955/5 border border-gray-200 dark:border-emerald-950/30 rounded-xl dark:text-white focus:outline-none font-bold"
                  >
                    <option value="All">All Regions</option>
                    <option value="Punjab">Punjab Sector</option>
                    <option value="Gujarat">Gujarat Block</option>
                    <option value="Haryana">Haryana Fields</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Breadcrumb for Mobile and Search alert info */}
        {globalSearchQuery && (
          <div className="bg-emerald-50 dark:bg-emerald-900/10 px-4 py-2 text-xs flex justify-between items-center border-b border-emerald-100 dark:border-emerald-950/30 animate-fade-in shrink-0">
            <span className="text-emerald-800 dark:text-emerald-400">
              Filtering results across viewports for: <strong>"{globalSearchQuery}"</strong>
            </span>
            <button 
              onClick={() => setGlobalSearchQuery('')}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-bold"
            >
              Clear filter
            </button>
          </div>
        )}

        {/* Viewport content section */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 bg-gray-50 dark:bg-[#0b120e] transition-colors relative pb-20 md:pb-6">
          <Outlet />
        </main>

        {/* Sticky Footer */}
        <footer className="h-10 shrink-0 bg-white dark:bg-[#0e1712] border-t border-gray-200 dark:border-emerald-950/20 flex items-center justify-between px-4 md:px-6 text-[10px] text-gray-550 dark:text-gray-400 transition-colors">
          <div>
            &copy; {new Date().getFullYear()} AgriTrack AI • Version 1.0 • Support | Privacy Policy | Terms
          </div>
          <div className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-450">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            All GPS Telemetry Nominal
          </div>
        </footer>

      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-[#0e1712] border-t border-gray-250 dark:border-emerald-950/30 flex items-center justify-around px-2 shadow-2xl z-30 transition-colors">
        {[
          { name: 'Dashboard', path: PATHS.DASHBOARD, icon: FaThLarge },
          { name: 'Tracking', path: PATHS.TRACKING, icon: FaRoute },
          { name: 'Vehicles', path: isCompanyAdmin ? PATHS.FLEET_OVERVIEW : PATHS.MACHINES, icon: FaTractor },
          { name: 'AI Assistant', path: PATHS.AI_ASSISTANT, icon: FaRobot },
          { name: 'Settings', path: PATHS.SETTINGS, icon: FaCog }
        ].map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all ${
                isActive 
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105' 
                  : 'text-gray-400 hover:text-gray-650'
              }`}
            >
              <Icon className="text-base" />
              <span className="text-[9px] tracking-tight">{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Custom Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#0c120f] border border-gray-200 dark:border-emerald-900/30 p-6 rounded-2xl w-full max-w-sm shadow-2xl space-y-4 text-xs"
            >
              <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider text-red-500 flex items-center gap-2">
                <FaSignOutAlt />
                Log Out Account
              </h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                Are you sure you want to log out from AgriTrack AI? You will need to enter your credentials to access the telemetry dashboard again.
              </p>
              <div className="flex gap-2 justify-end text-xs font-bold pt-2">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-emerald-950/20 dark:text-emerald-300 dark:hover:bg-emerald-900/10 text-gray-650 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    handleLogout();
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl cursor-pointer"
                >
                  Log Out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
export default DashboardLayout;
