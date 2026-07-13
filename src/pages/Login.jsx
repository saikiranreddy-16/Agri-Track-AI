import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PATHS } from '../constants';
import { FaPhone, FaLock, FaEnvelope, FaExclamationTriangle, FaShieldAlt } from 'react-icons/fa';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [gpsDeviceId, setGpsDeviceId] = useState('');
  const [isTrusted, setIsTrusted] = useState(() => {
    return localStorage.getItem('device_is_trusted') === 'true';
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  // Auto-detect login mode
  const isEmail = identifier.includes('@');
  const isPhone = identifier.trim().length > 0 && !isEmail;

  const validate = () => {
    const tempErrors = {};
    if (!identifier.trim()) {
      tempErrors.identifier = 'Email or Mobile number is required.';
    } else if (isEmail && !/\S+@\S+\.\S+/.test(identifier)) {
      tempErrors.identifier = 'Email format is invalid.';
    } else if (isPhone && !/^\+?[0-9\s\-()]{7,15}$/.test(identifier.trim())) {
      tempErrors.identifier = 'Invalid phone number format.';
    }

    if (!password) {
      tempErrors.password = 'Password/PIN is required.';
    } else if (password.length < 4) {
      tempErrors.password = 'Must be at least 4 characters.';
    }

    // Require Device ID on untrusted device for Farm Admin
    if (isPhone && !isTrusted && !gpsDeviceId.trim()) {
      tempErrors.gpsDeviceId = 'Device ID is required for first-time verification.';
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
      const res = await login(identifier, password, isEmail, gpsDeviceId);
      setIsLoading(false);

      if (res.success) {
        if (isPhone) {
          localStorage.setItem('device_is_trusted', 'true');
          setIsTrusted(true);
        }
        navigate(PATHS.DASHBOARD);
      } else {
        setGeneralError(res.message || 'Login failed. Please check your credentials.');
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

      {generalError && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-250 dark:border-red-900/30 rounded-xl text-[11px] text-red-800 dark:text-red-400 flex items-start gap-2 animate-fade-in">
          <FaExclamationTriangle className="mt-0.5 shrink-0" />
          <div>{generalError}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Identifier Field */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-750 dark:text-gray-300 mb-1.5">
            Email or Mobile Number
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
              {isEmail ? <FaEnvelope /> : <FaPhone />}
            </span>
            <input
              type="text"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                setErrors(prev => ({ ...prev, identifier: '' }));
              }}
              className={`w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 dark:bg-[#121c17] border rounded-xl focus:outline-none focus:bg-white dark:text-white transition-all ${
                errors.identifier
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-gray-200 dark:border-emerald-950/40 focus:border-emerald-500'
              }`}
              placeholder="e.g. admin@agritrack.in or +919876543210"
            />
          </div>
          {errors.identifier && (
            <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.identifier}</p>
          )}
        </div>

        {/* Password / PIN Field */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-755 dark:text-gray-300 mb-1.5">
            {isEmail ? 'Password' : isPhone ? 'Security PIN' : 'Password or PIN'}
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
              <FaLock />
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors(prev => ({ ...prev, password: '' }));
              }}
              className={`w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 dark:bg-[#121c17] border rounded-xl focus:outline-none focus:bg-white dark:text-white transition-all ${
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

        {/* Device ID Verification Field (Conditional) */}
        {isPhone && !isTrusted && (
          <div className="p-4 bg-emerald-50/50 dark:bg-emerald-955/5 border border-emerald-100 dark:border-emerald-900/35 rounded-xl space-y-2 animate-slide-up">
            <div className="flex items-center gap-1.5">
              <FaShieldAlt className="text-emerald-600 dark:text-emerald-400 text-xs shrink-0" />
              <label className="block text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                Verify GPS Device ID
              </label>
            </div>
            
            <input
              type="text"
              value={gpsDeviceId}
              onChange={(e) => {
                setGpsDeviceId(e.target.value);
                setErrors(prev => ({ ...prev, gpsDeviceId: '' }));
              }}
              className={`w-full px-3 py-2 text-sm bg-white dark:bg-[#121c17] border rounded-xl focus:outline-none dark:text-white transition-all ${
                errors.gpsDeviceId
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-emerald-300 dark:border-emerald-900/40 focus:border-emerald-600'
              }`}
              placeholder="e.g. dev-mach-1"
            />
            {errors.gpsDeviceId && (
              <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.gpsDeviceId}</p>
            )}
            <p className="text-[10px] text-emerald-700 dark:text-emerald-400 italic">
              First login on a new device requires your Device ID.
            </p>
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

      <div className="mt-6 text-center text-xs">
        <Link
          to={PATHS.FORGOT_PASSWORD}
          className="font-bold text-emerald-650 dark:text-emerald-400 hover:underline"
        >
          Forgot password?
        </Link>
      </div>
    </div>
  );
};

export default Login;
