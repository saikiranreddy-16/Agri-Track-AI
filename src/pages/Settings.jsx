import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUser, FaLock, FaSlidersH, FaGlobe, FaSignOutAlt, 
  FaCheckCircle, FaExclamationTriangle, FaLaptop, FaTrashAlt, FaShieldAlt 
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { PATHS } from '../constants';
import api from '../utils/api';

export const Settings = () => {
  const { user, updateProfile, changePIN, deleteTrustedDevice } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('profile');
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Profile forms
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileCompany, setProfileCompany] = useState(user?.company || '');

  // Passwords / PIN forms
  const [oldSecret, setOldSecret] = useState('');
  const [newSecret, setNewSecret] = useState('');
  const [confirmSecret, setConfirmSecret] = useState('');

  // Trusted Devices list
  const [trustedDevices, setTrustedDevices] = useState([]);
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);

  // Preference forms
  const [units, setUnits] = useState('Metric');

  const isCompanyAdmin = user?.role === 'Company Admin' || user?.role === 'Admin';

  const fetchProfileAndDevices = async () => {
    if (isCompanyAdmin) return;
    setIsLoadingDevices(true);
    try {
      const response = await api.get('/auth/me');
      if (response.data && response.data.success) {
        const uData = response.data.data;
        setTrustedDevices(uData.trustedDevices || []);
      }
    } catch (error) {
      console.error('Failed to fetch trusted devices list:', error);
    } finally {
      setIsLoadingDevices(false);
    }
  };

  useEffect(() => {
    fetchProfileAndDevices();
  }, [activeTab]);

  const handleProfileSave = (e) => {
    e.preventDefault();
    updateProfile({
      name: profileName,
      email: profileEmail,
      phone: profilePhone,
      company: profileCompany
    });
    triggerSuccess('Profile information updated successfully.');
  };

  const handleSecuritySave = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (newSecret !== confirmSecret) {
      setErrorMessage('New secrets do not match.');
      return;
    }

    if (!isCompanyAdmin) {
      // Pin validation (6 digits)
      if (!/^\d{6}$/.test(newSecret)) {
        setErrorMessage('Security PIN must be exactly 6 numeric digits.');
        return;
      }

      const res = await changePIN(oldSecret, newSecret);
      if (res.success) {
        setOldSecret('');
        setNewSecret('');
        setConfirmSecret('');
        triggerSuccess('Security PIN changed successfully.');
      } else {
        setErrorMessage(res.message || 'Failed to update PIN.');
      }
    } else {
      // Company Admin Password save
      try {
        const response = await api.put('/auth/change-password', {
          currentPassword: oldSecret,
          newPassword: newSecret
        });
        if (response.data && response.data.success) {
          setOldSecret('');
          setNewSecret('');
          setConfirmSecret('');
          triggerSuccess('Password changed successfully.');
        }
      } catch (error) {
        setErrorMessage(error.response?.data?.message || 'Failed to update password.');
      }
    }
  };

  const handleRemoveDevice = async (clientDevId) => {
    const confirm = window.confirm('Revoke trust for this device? You will be signed out on that browser.');
    if (!confirm) return;

    const res = await deleteTrustedDevice(clientDevId);
    if (res.success) {
      triggerSuccess('Trusted device revoked successfully.');
      fetchProfileAndDevices();
    } else {
      setErrorMessage(res.message || 'Failed to revoke trusted device.');
    }
  };

  const triggerSuccess = (msg) => {
    setSuccessMessage(msg);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setSuccessMessage('');
    }, 3000);
  };

  const tabs = [
    { id: 'profile', label: 'Edit Profile', icon: FaUser },
    { id: 'security', label: 'Security & Verification', icon: FaLock },
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
          Adjust GPS tracking metrics, configure security parameters, and manage trusted login devices.
        </p>
      </div>

      {/* Success alert message banner */}
      <AnimatePresence>
        {isSuccess && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-150 dark:border-emerald-900/30 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-450 flex items-center gap-2">
            <FaCheckCircle className="shrink-0" /> {successMessage}
          </div>
        )}
      </AnimatePresence>

      {/* Error alert message banner */}
      {errorMessage && (
        <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-250 dark:border-red-900/30 rounded-xl text-xs font-bold text-red-800 dark:text-red-400 flex items-center gap-2">
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
                className={`w-full text-left px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2.5 ${
                  activeTab === tab.id
                    ? 'bg-emerald-55 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-450 font-extrabold'
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
                {isCompanyAdmin && (
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
                )}
                <div>
                  <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Phone Number</label>
                  <input
                    type="text"
                    required={!isCompanyAdmin}
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

          {/* SECURITY FORM */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              
              <form onSubmit={handleSecuritySave} className="space-y-4 text-xs">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-white border-b border-gray-100 dark:border-emerald-950/20 pb-2 mb-4">
                  {isCompanyAdmin ? 'Update Password' : 'Update 6-Digit Security PIN'}
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
                      placeholder={isCompanyAdmin ? 'Min 6 characters' : 'Exactly 6 digits'}
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                      {isCompanyAdmin ? 'Confirm New Password' : 'Confirm New PIN'}
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

              {/* Trusted Devices Section for Farm Admins */}
              {!isCompanyAdmin && (
                <div className="pt-6 border-t border-gray-100 dark:border-emerald-950/20 text-xs">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-white mb-2 flex items-center gap-1.5">
                    <FaShieldAlt className="text-emerald-500" />
                    Trusted Login Devices
                  </h3>
                  <p className="text-[10px] text-gray-450 mb-4">
                    Your account allows up to 3 trusted device slots for automatic PIN login authentication. You can revoke older browsers below.
                  </p>

                  {isLoadingDevices ? (
                    <div className="w-5 h-5 border border-emerald-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <div className="space-y-2.5">
                      {trustedDevices.length === 0 ? (
                        <div className="p-3 text-center text-gray-400 bg-gray-50 dark:bg-[#121c17] rounded-xl italic">
                          No trusted login devices registered yet.
                        </div>
                      ) : (
                        trustedDevices.map((dev, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 border border-gray-150 dark:border-emerald-950/15 bg-gray-50/50 dark:bg-[#121c17]/50 rounded-xl">
                            <div className="flex items-center gap-2.5">
                              <FaLaptop className="text-lg text-emerald-600" />
                              <div>
                                <strong className="font-extrabold text-gray-700 dark:text-gray-200">
                                  {dev.phoneName || 'Web Browser'}
                                </strong>
                                <div className="text-[10px] text-gray-450">
                                  Platform: {dev.platform || 'Unknown'} • Added: {new Date(dev.addedAt).toLocaleDateString()}
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
                  )}
                </div>
              )}

            </div>
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
                        onClick={() => { setUnits(u); triggerSuccess('Measurement units updated.'); }}
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
                <div className="p-4 bg-gray-50 dark:bg-emerald-950/10 border border-gray-155 dark:border-emerald-950/20 rounded-2xl space-y-3">
                  <div>
                    <h4 className="font-bold dark:text-white text-xs">Interface Theme</h4>
                    <p className="text-[10px] text-gray-405 mt-0.5">Toggle between standard light and dark mode profiles.</p>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
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
