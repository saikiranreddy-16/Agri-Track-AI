import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PATHS } from '../constants';
import { FaPhone, FaLock, FaEnvelope, FaExclamationTriangle, FaCheckCircle, FaLaptop } from 'react-icons/fa';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('farmer'); // 'farmer' or 'company'
  const [identifier, setIdentifier] = useState(''); // email or mobile number
  const [password, setPassword] = useState(''); // password or PIN
  
  // Untrusted device states
  const [showGpsVerification, setShowGpsVerification] = useState(false);
  const [gpsDeviceId, setGpsDeviceId] = useState('');

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const validate = () => {
    const tempErrors = {};
    if (!identifier) {
      tempErrors.identifier = activeTab === 'company' ? 'Email address is required.' : 'Mobile number is required.';
    } else if (activeTab === 'company' && !/\S+@\S+\.\S+/.test(identifier)) {
      tempErrors.identifier = 'Email format is invalid.';
    }

    if (!password) {
      tempErrors.password = 'Password/PIN is required.';
    } else if (password.length < 4) {
      tempErrors.password = 'Password/PIN must be at least 4 characters.';
    }

    if (showGpsVerification && !gpsDeviceId) {
      tempErrors.gpsDeviceId = 'GPS Device ID is required to register this trusted device.';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setGeneralError('');

    try {
      const res = await login(identifier, password, activeTab === 'company', gpsDeviceId);
      setIsLoading(false);

      if (res.success) {
        navigate(PATHS.DASHBOARD);
      } else {
        if (res.code === 'untrusted_device') {
          setShowGpsVerification(true);
          setGeneralError('untrusted');
        } else if (res.code === 'max_trusted_devices') {
          setGeneralError('max_devices');
        } else {
          setGeneralError(res.message || 'Login failed. Please check your credentials.');
        }
      }
    } catch (err) {
      setIsLoading(false);
      setGeneralError('Network error occurred. Please try again.');
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
          AgriTrack AI Sign In
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Access your fleet tracking systems and farm telemetry dashboard.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 dark:border-emerald-950/20 mb-6">
        <button
          type="button"
          onClick={() => {
            setActiveTab('farmer');
            setIdentifier('');
            setPassword('');
            setGeneralError('');
            setShowGpsVerification(false);
            setErrors({});
          }}
          className={`flex-1 pb-3 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${
            activeTab === 'farmer'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
              : 'border-transparent text-gray-450'
          }`}
        >
          <FaPhone className="text-xs" />
          Farmer Admin Login
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('company');
            setIdentifier('');
            setPassword('');
            setGeneralError('');
            setShowGpsVerification(false);
            setErrors({});
          }}
          className={`flex-1 pb-3 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${
            activeTab === 'company'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
              : 'border-transparent text-gray-450'
          }`}
        >
          <FaLaptop className="text-xs" />
          Company Admin Login
        </button>
      </div>

      {/* Verification alerts */}
      {generalError === 'untrusted' && (
        <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl text-[11px] text-amber-800 dark:text-amber-400 flex items-start gap-2">
          <FaExclamationTriangle className="mt-0.5 shrink-0" />
          <div>
            <span className="font-bold block">Trusted Device Registration Required</span>
            This browser/phone is not registered as a trusted device. Verify ownership by entering one of your active GPS Device IDs.
          </div>
        </div>
      )}

      {generalError === 'max_devices' && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-250 dark:border-red-900/30 rounded-xl text-[11px] text-red-800 dark:text-red-400 flex items-start gap-2">
          <FaExclamationTriangle className="mt-0.5 shrink-0" />
          <div>
            <span className="font-bold block">Trusted Devices Limit Reached</span>
            You have logged in from 3 different devices. Please contact internal Company Operations to reset your trusted devices list.
          </div>
        </div>
      )}

      {generalError && generalError !== 'untrusted' && generalError !== 'max_devices' && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-250 dark:border-red-900/30 rounded-xl text-[11px] text-red-800 dark:text-red-400 flex items-start gap-2">
          <FaExclamationTriangle className="mt-0.5 shrink-0" />
          <div>{generalError}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Identifier Field */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-750 dark:text-gray-300 mb-1.5">
            {activeTab === 'company' ? 'Email Address' : 'Mobile Number'}
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
              {activeTab === 'company' ? <FaEnvelope /> : <FaPhone />}
            </span>
            <input
              type={activeTab === 'company' ? 'email' : 'text'}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className={`w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-[#121c17] border rounded-xl focus:outline-none focus:bg-white dark:text-white transition-all ${
                errors.identifier
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-gray-200 dark:border-emerald-950/40 focus:border-emerald-500'
              }`}
              placeholder={activeTab === 'company' ? 'e.g. admin@agritrack.in' : 'e.g. +919876543210'}
            />
          </div>
          {errors.identifier && (
            <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.identifier}</p>
          )}
        </div>

        {/* Password / PIN Field */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-755 dark:text-gray-300 mb-1.5">
            {activeTab === 'company' ? 'Password' : '6-Digit Security PIN'}
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
              <FaLock />
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-[#121c17] border rounded-xl focus:outline-none focus:bg-white dark:text-white transition-all ${
                errors.password
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-gray-200 dark:border-emerald-950/40 focus:border-emerald-500'
              }`}
              placeholder="••••••••"
            />
          </div>
          {errors.password && (
            <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.password}</p>
          )}
        </div>

        {/* GPS Verification Field (Conditional) */}
        {showGpsVerification && (
          <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/5 border border-emerald-100 dark:border-emerald-900/30 rounded-xl space-y-2">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
              Verify GPS Device ID
            </label>
            <input
              type="text"
              value={gpsDeviceId}
              onChange={(e) => setGpsDeviceId(e.target.value)}
              className={`w-full px-3 py-2 text-sm bg-white dark:bg-[#121c17] border rounded-xl focus:outline-none dark:text-white transition-all ${
                errors.gpsDeviceId
                  ? 'border-red-500'
                  : 'border-emerald-350 dark:border-emerald-900/40 focus:border-emerald-600'
              }`}
              placeholder="e.g. dev-mach-1"
            />
            {errors.gpsDeviceId && (
              <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.gpsDeviceId}</p>
            )}
          </div>
        )}

        {/* Login Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            'Verify & Sign In'
          )}
        </button>
      </form>
    </div>
  );
};

export default Login;
