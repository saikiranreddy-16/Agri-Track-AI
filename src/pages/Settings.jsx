import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUser, FaLock, FaSlidersH, FaGlobe, FaSignOutAlt, 
  FaCheckCircle, FaExclamationTriangle, FaLaptop, FaTrashAlt, 
  FaShieldAlt, FaTractor, FaInfoCircle, FaSun, FaMoon, FaDesktop 
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { PATHS, ROLES } from '../constants';
import { useToast } from '../context/ToastContext';
import { mockMachines } from '../data/mockData';

export const Settings = () => {
  const { user, changePIN } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('profile');
  const [errorMessage, setErrorMessage] = useState('');

  // Profile forms
  const [profileName, setProfileName] = useState(user?.name || 'Gurpreet Singh');
  const [profileEmail, setProfileEmail] = useState(user?.email || 'gurpreet@singhfarms.in');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '+91 98765 43210');
  const [profileCompany, setProfileCompany] = useState(user?.company || 'Singh Agrotech & Farms');

  // Passwords / PIN forms
  const [oldSecret, setOldSecret] = useState('');
  const [newSecret, setNewSecret] = useState('');
  const [confirmSecret, setConfirmSecret] = useState('');

  // Trusted Devices list
  const [trustedDevices, setTrustedDevices] = useState([
    { clientDeviceId: 'td-1', phoneName: 'OnePlus 11 5G (Android)', platform: 'Android 13 / Chrome Mobile', addedAt: '2026-04-12T08:30:00Z' },
    { clientDeviceId: 'td-2', phoneName: 'Safari Browser (MacBook Pro)', platform: 'macOS Sonoma / Safari', addedAt: '2026-05-01T14:20:00Z' }
  ]);

  // Preferences forms
  const [units, setUnits] = useState('Metric');
  const [themePref, setThemePref] = useState(localStorage.getItem('theme_preference') || 'system');

  const isCompanyAdmin = user?.role === ROLES.COMPANY_ADMIN;

  // Apply theme preference helper
  const applyThemePreference = (pref) => {
    setThemePref(pref);
    localStorage.setItem('theme_preference', pref);
    
    const root = window.document.documentElement;
    if (pref === 'dark') {
      root.classList.add('dark');
    } else if (pref === 'light') {
      root.classList.remove('dark');
    } else {
      // System
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
    toast.success(`Theme preference set to ${pref === 'system' ? 'System Theme' : pref === 'dark' ? 'Dark Mode' : 'Light Mode'}.`);
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    toast.success('Profile settings updated successfully.');
  };

  const handleSecuritySave = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (newSecret !== confirmSecret) {
      setErrorMessage('New secrets do not match.');
      return;
    }

    if (!isCompanyAdmin) {
      if (!/^\d{6}$/.test(newSecret)) {
        setErrorMessage('Security PIN must be exactly 6 numeric digits.');
        return;
      }
      toast.success('Security PIN code updated in local database.');
    } else {
      if (newSecret.length < 6) {
        setErrorMessage('Password must be at least 6 characters.');
        return;
      }
      toast.success('Admin password updated successfully.');
    }
    setOldSecret('');
    setNewSecret('');
    setConfirmSecret('');
  };

  const handleRemoveDevice = (clientDevId) => {
    const confirm = window.confirm('Revoke trust for this login device? You will be signed out on that browser.');
    if (!confirm) return;

    setTrustedDevices(prev => prev.filter(d => d.clientDeviceId !== clientDevId));
    toast.success('Trusted device login key revoked.');
  };

  const tabs = [
    { id: 'profile', label: 'Profile Information', icon: FaUser },
    { id: 'security', label: 'Security & PIN', icon: FaLock },
    ...(!isCompanyAdmin ? [{ id: 'vehicles', label: 'Vehicle Information', icon: FaTractor }] : []),
    { id: 'preferences', label: 'Preferences & Units', icon: FaSlidersH },
    { id: 'about', label: 'About System', icon: FaInfoCircle }
  ];

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
          System Preferences & Settings
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Adjust GPS tracking units, configure security settings, toggle mode themes, and audit device registers.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-250 dark:border-red-900/30 rounded-xl text-xs font-bold text-red-800 dark:text-red-400 flex items-center gap-2">
          <FaExclamationTriangle className="shrink-0" /> {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Side: Tabs */}
        <div className="p-2.5 bg-white dark:bg-[#0e1712] border border-gray-150 dark:border-emerald-950/20 rounded-2xl shadow-sm space-y-1 h-fit">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setErrorMessage('');
                }}
                className={`w-full text-left px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2.5 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-450 font-extrabold'
                    : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-emerald-950/10 dark:text-gray-400'
                }`}
              >
                <Icon className="text-sm shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right Side: Tab Forms Panel */}
        <div className="lg:col-span-3 p-6 bg-white dark:bg-[#0e1712] border border-gray-155 dark:border-emerald-950/20 rounded-2xl shadow-sm">
          
          {/* PROFILE FORM */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSave} className="space-y-4 text-xs">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-white border-b border-gray-100 dark:border-emerald-950/20 pb-2 mb-4">
                Profile Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-950/30 bg-gray-50 dark:bg-emerald-950/10 focus:bg-white focus:outline-none dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-950/30 bg-gray-50 dark:bg-emerald-950/10 focus:bg-white focus:outline-none dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-950/30 bg-gray-50 dark:bg-emerald-950/10 focus:bg-white focus:outline-none dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Farm Company Name</label>
                  <input
                    type="text"
                    value={profileCompany}
                    onChange={(e) => setProfileCompany(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-950/30 bg-gray-50 dark:bg-emerald-950/10 focus:bg-white focus:outline-none dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md cursor-pointer"
                >
                  Save Profile Settings
                </button>
              </div>
            </form>
          )}

          {/* SECURITY & PIN FORM */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              
              <form onSubmit={handleSecuritySave} className="space-y-4 text-xs">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-white border-b border-gray-100 dark:border-emerald-950/20 pb-2 mb-4">
                  {isCompanyAdmin ? 'Update Admin Password' : 'Update Security PIN'}
                </h3>

                <div className="space-y-4 max-w-sm">
                  <div>
                    <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                      {isCompanyAdmin ? 'Current Password' : 'Current 6-Digit PIN'}
                    </label>
                    <input
                      type="password"
                      required
                      value={oldSecret}
                      onChange={(e) => setOldSecret(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-955/30 bg-gray-50 dark:bg-[#121c17] focus:bg-white focus:outline-none dark:text-white font-mono"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                      {isCompanyAdmin ? 'New Password' : 'New 6-Digit PIN'}
                    </label>
                    <input
                      type="password"
                      required
                      value={newSecret}
                      onChange={(e) => setNewSecret(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-955/30 bg-gray-50 dark:bg-[#121c17] focus:bg-white focus:outline-none dark:text-white font-mono"
                      placeholder={isCompanyAdmin ? 'Min 6 characters' : 'Exactly 6 numeric digits'}
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                      Confirm New Secret Key
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmSecret}
                      onChange={(e) => setConfirmSecret(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-955/30 bg-gray-50 dark:bg-[#121c17] focus:bg-white focus:outline-none dark:text-white font-mono"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md cursor-pointer"
                  >
                    {isCompanyAdmin ? 'Change Password' : 'Change PIN Code'}
                  </button>
                </div>
              </form>

              {/* Trusted Devices Widget */}
              {!isCompanyAdmin && (
                <div className="pt-6 border-t border-gray-100 dark:border-emerald-950/20 text-xs">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-white mb-2 flex items-center gap-1.5">
                    <FaShieldAlt className="text-emerald-500" />
                    Trusted Login Devices
                  </h3>
                  <p className="text-[10px] text-gray-450 mb-4 leading-relaxed">
                    Your account has trusted keys saved on these browser clients. Revoking a device prompts for a device identity scan on next login.
                  </p>

                  <div className="space-y-2">
                    {trustedDevices.length === 0 ? (
                      <div className="p-3 text-center text-gray-400 bg-gray-50 dark:bg-[#121c17] rounded-xl italic">
                        No trusted login devices registered yet.
                      </div>
                    ) : (
                      trustedDevices.map((dev) => (
                        <div key={dev.clientDeviceId} className="flex items-center justify-between p-3 border border-gray-150 dark:border-emerald-950/15 bg-gray-50/50 dark:bg-[#121c17]/50 rounded-xl">
                          <div className="flex items-center gap-2.5">
                            <FaLaptop className="text-base text-emerald-600 dark:text-emerald-400" />
                            <div>
                              <strong className="font-extrabold text-gray-700 dark:text-gray-200">
                                {dev.phoneName}
                              </strong>
                              <div className="text-[10px] text-gray-400 mt-0.5">
                                Platform: {dev.platform} • Key Registered: {new Date(dev.addedAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveDevice(dev.clientDeviceId)}
                            className="p-2 text-red-750 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg cursor-pointer"
                            title="Revoke Trust"
                          >
                            <FaTrashAlt />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* VEHICLE INFORMATION TAB (Farmers Only) */}
          {activeTab === 'vehicles' && !isCompanyAdmin && (
            <div className="space-y-4 text-xs">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-white border-b border-gray-100 dark:border-emerald-950/20 pb-2 mb-4">
                Assigned Vehicles Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {mockMachines.slice(0, 3).map((mach) => (
                  <div key={mach.id} className="p-4 bg-gray-50 dark:bg-emerald-950/10 border border-gray-150 dark:border-emerald-950/15 rounded-2xl space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-black dark:text-white">{mach.name}</h4>
                        <span className="text-[10px] text-gray-400 font-mono">Reg: {mach.registration}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded font-black uppercase text-[8px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        {mach.status}
                      </span>
                    </div>

                    <div className="text-[10px] text-gray-450 border-t border-gray-150 dark:border-emerald-955/15 pt-2 space-y-1">
                      <div>GPS Unit Serial: <strong className="font-mono text-emerald-600 dark:text-emerald-450">{mach.gpsDeviceId || 'dev-mach-1'}</strong></div>
                      <div>Firmware status: <strong className="text-gray-650 dark:text-gray-300">v4.12.8-stable</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PREFERENCES TAB */}
          {activeTab === 'preferences' && (
            <div className="space-y-6 text-xs">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-white border-b border-gray-100 dark:border-emerald-950/20 pb-2 mb-4">
                Localization & Display Options
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Metric/Imperial units toggle */}
                <div className="p-4 bg-gray-55 bg-gray-50 dark:bg-emerald-950/10 border border-gray-150 dark:border-emerald-950/20 rounded-2xl space-y-3">
                  <div>
                    <h4 className="font-bold dark:text-white text-xs">System Unit Standard</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">Toggle metric (km, hectares) and imperial metrics.</p>
                  </div>
                  <div className="flex gap-2">
                    {['Metric', 'Imperial'].map(u => (
                      <button
                        key={u}
                        onClick={() => { setUnits(u); toast.success(`Measurement units updated to ${u}.`); }}
                        className={`flex-1 py-1.5 font-bold rounded-lg border text-xs transition-all cursor-pointer ${
                          units === u
                            ? 'bg-emerald-600 border-emerald-650 text-white shadow-sm'
                            : 'bg-white dark:bg-[#0e1712] border-gray-250 text-gray-655 dark:text-emerald-300 hover:bg-gray-50'
                        }`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Interface Theme Selection */}
                <div className="p-4 bg-gray-50 dark:bg-emerald-950/10 border border-gray-150 dark:border-emerald-950/20 rounded-2xl space-y-3">
                  <div>
                    <h4 className="font-bold dark:text-white text-xs">Interface Theme Preference</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">Choose between light mode, dark mode, or system themes.</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => applyThemePreference('light')}
                      className={`py-1.5 px-2 font-bold rounded-lg border text-[10px] transition-all flex flex-col items-center gap-1 cursor-pointer ${
                        themePref === 'light'
                          ? 'bg-emerald-600 border-emerald-650 text-white shadow-md'
                          : 'bg-white dark:bg-[#0e1712] border-gray-250 text-gray-600 dark:text-emerald-300 hover:bg-gray-50'
                      }`}
                    >
                      <FaSun className="text-sm" />
                      Light
                    </button>
                    <button
                      onClick={() => applyThemePreference('dark')}
                      className={`py-1.5 px-2 font-bold rounded-lg border text-[10px] transition-all flex flex-col items-center gap-1 cursor-pointer ${
                        themePref === 'dark'
                          ? 'bg-emerald-600 border-emerald-650 text-white shadow-md'
                          : 'bg-white dark:bg-[#0e1712] border-gray-250 text-gray-600 dark:text-emerald-300 hover:bg-gray-50'
                      }`}
                    >
                      <FaMoon className="text-sm" />
                      Dark
                    </button>
                    <button
                      onClick={() => applyThemePreference('system')}
                      className={`py-1.5 px-2 font-bold rounded-lg border text-[10px] transition-all flex flex-col items-center gap-1 cursor-pointer ${
                        themePref === 'system'
                          ? 'bg-emerald-600 border-emerald-650 text-white shadow-md'
                          : 'bg-white dark:bg-[#0e1712] border-gray-250 text-gray-600 dark:text-emerald-300 hover:bg-gray-50'
                      }`}
                    >
                      <FaDesktop className="text-sm" />
                      System
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ABOUT SYSTEM TAB */}
          {activeTab === 'about' && (
            <div className="space-y-5 text-xs">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-white border-b border-gray-100 dark:border-emerald-950/20 pb-2 mb-4">
                About AgriTrack-AI Platform
              </h3>

              <div className="p-4 bg-gray-50 dark:bg-emerald-950/10 border border-gray-150 dark:border-emerald-950/20 rounded-2xl space-y-3">
                <div className="flex justify-between font-bold py-1.5 border-b border-gray-150 dark:border-emerald-955/15">
                  <span className="text-gray-400">Application Version</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">v2.4.0-stable (ERP Edition)</span>
                </div>
                <div className="flex justify-between font-bold py-1.5 border-b border-gray-150 dark:border-emerald-955/15">
                  <span className="text-gray-400">Firmware Build Key</span>
                  <span className="font-mono text-gray-700 dark:text-gray-300">BUILD-20260713-PRECISE</span>
                </div>
                <div className="flex justify-between font-bold py-1.5 border-b border-gray-150 dark:border-emerald-955/15">
                  <span className="text-gray-400">Company License</span>
                  <span className="text-gray-700 dark:text-gray-300">AgriTrack Technologies Pvt. Ltd.</span>
                </div>
                <div className="flex justify-between font-bold py-1.5">
                  <span className="text-gray-400">System Core Services</span>
                  <span className="text-emerald-500 font-extrabold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    All Systems Operational
                  </span>
                </div>
              </div>

              <div className="text-[10px] text-gray-450 leading-relaxed text-center">
                &copy; {new Date().getFullYear()} AgriTrack Technologies Pvt. Ltd. All rights reserved. 
                <br />
                Licensed for commercial precision agricultural fleet management tracking.
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default Settings;
