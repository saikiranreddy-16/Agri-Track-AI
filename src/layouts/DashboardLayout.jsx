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
  FaArrowRight, FaRoute, FaEnvelope, FaThLarge
} from 'react-icons/fa';

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
  
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [activeLang, setActiveLang] = useState('English');
  const [activeCategory, setActiveCategory] = useState('All');

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

  const menuItems = [
    { name: 'Dashboard', path: PATHS.DASHBOARD, icon: FaThLarge },
    { name: 'Live Tracking', path: PATHS.TRACKING, icon: FaTractor },
    { name: 'GPS History', path: PATHS.GPS_HISTORY, icon: FaRoute },
    { name: 'Fleet Overview', path: PATHS.FLEET_OVERVIEW, icon: FaTractor, badge: 'Overview' },
    { name: 'Machines', path: PATHS.MACHINES, icon: FaTractor },
    { name: 'Drivers', path: PATHS.DRIVERS, icon: FaUserTie },
    { name: 'Fields', path: PATHS.FIELDS, icon: FaMap },
    { name: 'Jobs', path: PATHS.JOBS, icon: FaTasks },
    { name: 'Reports', path: PATHS.REPORTS, icon: FaFileContract },
    { name: 'Alerts', path: PATHS.ALERTS, icon: FaExclamationTriangle, badge: 'Active' },
    { name: 'Maintenance', path: PATHS.MAINTENANCE, icon: FaTools },
    { name: 'AI Assistant', path: PATHS.AI_ASSISTANT, icon: FaRobot, highlight: true },
    { name: 'Settings', path: PATHS.SETTINGS, icon: FaCog },
    { name: 'Help & Support', path: PATHS.HELP, icon: FaQuestionCircle }
  ];

  // Helper to generate breadcrumbs
  const getBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter(x => x);
    if (pathnames.length === 0) return [{ name: 'Dashboard', path: '/' }];
    
    return [
      { name: 'Dashboard', path: '/' },
      ...pathnames.map((val, idx) => {
        const path = `/${pathnames.slice(0, idx + 1).join('/')}`;
        const name = val.charAt(0).toUpperCase() + val.slice(1).replace('-', ' ');
        return { name, path };
      })
    ];
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

      {/* Quick Role Switcher (For Preview/Testing Phase 1) */}
      {isSidebarExpanded && (
        <div className="mx-4 my-2 p-3 bg-emerald-950/40 border border-emerald-800/30 rounded-xl">
          <div className="text-[10px] uppercase font-bold text-emerald-400 mb-2 tracking-wider">Preview Role</div>
          <div className="grid grid-cols-3 gap-1">
            {['Admin', 'Farm Owner', 'Operator'].map((role) => (
              <button
                key={role}
                onClick={() => changeRole(role)}
                className={`text-[9px] font-semibold py-1 rounded truncate transition-all ${
                  user?.role === role
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'bg-emerald-900/40 text-emerald-200 hover:bg-emerald-800/50'
                }`}
                title={role}
              >
                {role.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Logout */}
      <div className="px-3 pt-2 mt-auto border-t border-emerald-800/30">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-red-950/30 hover:text-red-300 text-emerald-200 transition-colors group relative"
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
            <nav className="hidden lg:flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
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
            <div className="relative max-w-[200px] sm:max-w-xs hidden sm:block">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 dark:text-gray-500">
                <FaSearch className="text-sm" />
              </span>
              <input
                type="text"
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                placeholder="Search fleet, jobs, fields..."
                className="w-full pl-9 pr-4 py-1.5 text-sm rounded-xl bg-gray-100 dark:bg-emerald-950/30 border border-transparent focus:bg-white focus:border-emerald-500 focus:outline-none dark:focus:bg-emerald-950/60 dark:text-white transition-all shadow-inner"
              />
              {globalSearchQuery && (
                <button
                  onClick={() => setGlobalSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-gray-400 hover:text-gray-600"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Messages Icon */}
            <div className="relative">
              <button 
                onClick={() => navigate(PATHS.HELP)}
                className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-emerald-950/40 rounded-xl relative transition-all"
                title="Support Messages"
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
                      My Profile
                    </Link>

                    <Link
                      to={PATHS.SETTINGS}
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all font-semibold"
                    >
                      <FaCog className="text-gray-400 dark:text-emerald-600" />
                      Settings Shortcut
                    </Link>

                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all font-semibold border-t border-gray-100 dark:border-emerald-950/20"
                    >
                      <FaSignOutAlt className="text-red-400" />
                      Log Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

        </header>

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
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 bg-gray-50 dark:bg-[#0b120e] transition-colors relative">
          <Outlet />
        </main>

        {/* Sticky Footer */}
        <footer className="h-10 shrink-0 bg-white dark:bg-[#0e1712] border-t border-gray-200 dark:border-emerald-950/20 flex items-center justify-between px-4 md:px-6 text-[10px] text-gray-500 dark:text-gray-400 transition-colors">
          <div>
            &copy; {new Date().getFullYear()} AgriTrack AI. Fleet Operations & Tracking.
          </div>
          <div className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            All GPS Telemetry Nominal
          </div>
        </footer>

      </div>
    </div>
  );
};
export default DashboardLayout;
