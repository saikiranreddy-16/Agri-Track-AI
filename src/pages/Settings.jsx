import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaSlidersH, FaGlobe, FaSignOutAlt, FaCheckCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { PATHS } from '../constants';

export const Settings = () => {
  const { user, updateProfile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('profile');
  const [isSuccess, setIsSuccess] = useState(false);

  // Profile forms
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileCompany, setProfileCompany] = useState(user?.company || '');

  // Passwords forms
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Preference forms
  const [units, setUnits] = useState('Metric');
  const [lang, setLang] = useState('English');

  const handleProfileSave = (e) => {
    e.preventDefault();
    updateProfile({
      name: profileName,
      email: profileEmail,
      phone: profilePhone,
      company: profileCompany
    });
    triggerSuccess();
  };

  const handlePasswordSave = (e) => {
    e.preventDefault();
    if (newPassword && newPassword === confirmPassword) {
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      triggerSuccess();
    }
  };

  const triggerSuccess = () => {
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 2000);
  };

  const tabs = [
    { id: 'profile', label: 'Edit Profile', icon: FaUser },
    { id: 'security', label: 'Security & Password', icon: FaLock },
    { id: 'preferences', label: 'Preferences & Units', icon: FaSlidersH }
  ];

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
          System Preferences & Settings
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Adjust GPS tracking metrics, configure security parameters and modify profile cards.
        </p>
      </div>

      {/* Success alert message banner */}
      <AnimatePresence>
        {isSuccess && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-2 animate-bounce">
            <FaCheckCircle /> Configuration changes updated successfully.
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Side: Tabs */}
        <div className="p-2.5 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl shadow-sm space-y-1 h-fit">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2.5 ${
                  activeTab === tab.id
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 font-extrabold'
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
        <div className="lg:col-span-3 p-6 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl shadow-sm">
          
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
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-955/30 bg-gray-50 dark:bg-emerald-955/10 focus:bg-white focus:outline-none dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-955/30 bg-gray-50 dark:bg-emerald-955/10 focus:bg-white focus:outline-none dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Phone Number</label>
                  <input
                    type="text"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-955/30 bg-gray-50 dark:bg-emerald-955/10 focus:bg-white focus:outline-none dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Farm Company name</label>
                  <input
                    type="text"
                    value={profileCompany}
                    onChange={(e) => setProfileCompany(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-955/30 bg-gray-50 dark:bg-emerald-955/10 focus:bg-white focus:outline-none dark:text-white"
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

          {/* SECURITY FORM */}
          {activeTab === 'security' && (
            <form onSubmit={handlePasswordSave} className="space-y-4 text-xs">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-white border-b border-gray-100 dark:border-emerald-950/20 pb-2 mb-4">
                Update Security Credentials
              </h3>

              <div className="space-y-4 max-w-sm">
                <div>
                  <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Current Password</label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-955/30 bg-gray-50 dark:bg-[#121c17] focus:bg-white focus:outline-none dark:text-white"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-955/30 bg-gray-50 dark:bg-[#121c17] focus:bg-white focus:outline-none dark:text-white"
                    placeholder="Min 6 characters"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-955/30 bg-gray-50 dark:bg-[#121c17] focus:bg-white focus:outline-none dark:text-white"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md"
                >
                  Change Password
                </button>
              </div>
            </form>
          )}

          {/* PREFERENCES FORM */}
          {activeTab === 'preferences' && (
            <div className="space-y-6 text-xs">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-white border-b border-gray-100 dark:border-emerald-950/20 pb-2 mb-4">
                Localization & Display Options
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Metric/Imperial units toggle */}
                <div className="p-4 bg-gray-50 dark:bg-emerald-950/10 border border-gray-150 dark:border-emerald-950/20 rounded-2xl space-y-3">
                  <div>
                    <h4 className="font-bold dark:text-white text-xs">System Unit Standard</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">Toggle metric (km, acres) and imperial metrics.</p>
                  </div>
                  <div className="flex gap-2">
                    {['Metric', 'Imperial'].map(u => (
                      <button
                        key={u}
                        onClick={() => { setUnits(u); triggerSuccess(); }}
                        className={`flex-1 py-1.5 font-bold rounded-lg border text-xs transition-all ${
                          units === u
                            ? 'bg-emerald-600 border-emerald-650 text-white shadow-sm'
                            : 'bg-white dark:bg-[#0e1712] border-gray-250 text-gray-650 dark:text-emerald-300 hover:bg-gray-50'
                        }`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dark Mode toggle panel */}
                <div className="p-4 bg-gray-50 dark:bg-emerald-950/10 border border-gray-150 dark:border-emerald-950/20 rounded-2xl space-y-3">
                  <div>
                    <h4 className="font-bold dark:text-white text-xs">Interface Theme</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">Toggle between standard light and dark mode profiles.</p>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-all shadow-sm flex items-center justify-center gap-1.5"
                  >
                    Active: {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
export default Settings;
