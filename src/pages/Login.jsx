import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PATHS } from '../constants';
import { FaPhone, FaLock, FaEnvelope, FaExclamationTriangle, FaShieldAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem('login_remember_me') === 'true';
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  // Prefill identifier if Remember Me was checked previously
  useEffect(() => {
    if (rememberMe) {
      const savedIdentifier = localStorage.getItem('login_saved_identifier');
      if (savedIdentifier) {
        setIdentifier(savedIdentifier);
      }
    }
  }, []);

  // Auto-detect login mode dynamically
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
      tempErrors.password = 'Password or security PIN is required.';
    } else if (password.length < 4) {
      tempErrors.password = 'Must be at least 4 characters.';
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
      // Login uses single form submission, backend auto-resolves the user role
      const res = await login(identifier, password, isEmail, '');
      setIsLoading(false);

      if (res.success) {
        if (rememberMe) {
          localStorage.setItem('login_remember_me', 'true');
          localStorage.setItem('login_saved_identifier', identifier);
        } else {
          localStorage.removeItem('login_remember_me');
          localStorage.removeItem('login_saved_identifier');
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

  // Framer Motion staggered entrance variants
  const containerVariants = {
    hidden: { opacity: 0, x: 30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
        when: 'beforeChildren',
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-md backdrop-blur-md bg-emerald-950/30 dark:bg-black/35 border border-white/10 dark:border-emerald-950/20 rounded-3xl p-8 shadow-2xl text-white select-none animate-float"
    >
      {/* Title Header */}
      <motion.div variants={itemVariants} className="mb-6 text-center lg:text-left">
        <h1 className="text-3xl font-black tracking-tight text-white">
          Welcome Back
        </h1>
        <p className="text-xs text-emerald-200/80 mt-1.5 font-medium">
          Sign in to access AgriTrack AI systems
        </p>
      </motion.div>

      {/* Error Alert Display */}
      {generalError && (
        <motion.div
          variants={itemVariants}
          className="mb-4 p-3 bg-red-950/30 border border-red-500/20 rounded-xl text-[11px] text-red-300 flex items-start gap-2 animate-fade-in"
        >
          <FaExclamationTriangle className="mt-0.5 shrink-0 text-red-400" />
          <div>{generalError}</div>
        </motion.div>
      )}

      {/* Form Submission */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Identifier Field (Email / Phone) */}
        <motion.div variants={itemVariants}>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-emerald-250 mb-1.5">
            Email or Mobile Number
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-emerald-300 pointer-events-none">
              {isEmail ? <FaEnvelope /> : <FaPhone />}
            </span>
            <input
              type="text"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                setErrors(prev => ({ ...prev, identifier: '' }));
              }}
              className={`w-full pl-9 pr-3 py-2.5 text-sm bg-emerald-950/20 dark:bg-[#070e0a]/40 border rounded-xl focus:outline-none dark:text-white transition-all ${
                errors.identifier
                  ? 'border-red-500/50 focus:border-red-500'
                  : 'border-white/10 dark:border-emerald-950/35 focus:border-emerald-500'
              }`}
              placeholder="admin@agritrack.in or +919876543210"
            />
          </div>
          {errors.identifier && (
            <p className="text-[10px] text-red-400 mt-1 font-semibold">{errors.identifier}</p>
          )}
        </motion.div>

        {/* Password / Security PIN Field */}
        <motion.div variants={itemVariants}>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-emerald-250 mb-1.5">
            {isEmail ? 'Password' : isPhone ? 'Security PIN' : 'Password or PIN'}
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-emerald-300 pointer-events-none">
              <FaLock />
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors(prev => ({ ...prev, password: '' }));
              }}
              className={`w-full pl-9 pr-3 py-2.5 text-sm bg-emerald-950/20 dark:bg-[#070e0a]/40 border rounded-xl focus:outline-none dark:text-white transition-all ${
                errors.password
                  ? 'border-red-500/50 focus:border-red-500'
                  : 'border-white/10 dark:border-emerald-950/35 focus:border-emerald-500'
              }`}
              placeholder="••••••••"
            />
          </div>
          {errors.password && (
            <p className="text-[10px] text-red-400 mt-1 font-semibold">{errors.password}</p>
          )}
        </motion.div>

        {/* Options Row (Remember Me & Forgot Password) */}
        <motion.div variants={itemVariants} className="flex justify-between items-center text-xs py-1">
          <label className="flex items-center gap-1.5 cursor-pointer text-emerald-100 font-medium">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-white/20 bg-emerald-950/20 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-emerald-950 accent-emerald-500"
            />
            <span>Remember Me</span>
          </label>

          <Link
            to={PATHS.FORGOT_PASSWORD}
            className="font-bold text-emerald-400 hover:text-emerald-350 hover:underline"
          >
            Forgot Password?
          </Link>
        </motion.div>

        {/* Unified Sign In Action Button */}
        <motion.div variants={itemVariants}>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-700 to-emerald-500 hover:from-emerald-600 hover:to-emerald-400 focus:outline-none transition-all shadow-md hover:shadow-lg disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Verify & Sign In'
            )}
          </button>
        </motion.div>
      </form>

      {/* Decorative Divider */}
      <motion.div variants={itemVariants} className="my-6 flex items-center justify-between text-xs text-white/20">
        <span className="w-full h-px bg-white/10" />
        <span className="px-3 shrink-0 uppercase tracking-widest text-[9px] font-bold text-emerald-200/50">
          Security Checked
        </span>
        <span className="w-full h-px bg-white/10" />
      </motion.div>

      {/* App Version & Metadata */}
      <motion.div variants={itemVariants} className="text-center space-y-1">
        <p className="text-[10px] font-bold text-emerald-300 tracking-wider">
          VERSION 1.1.0
        </p>
        <p className="text-[9px] font-semibold text-emerald-250/70 tracking-wide">
          Smart Agricultural Fleet Management
        </p>
        <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest flex justify-center items-center gap-1 mt-1">
          Made in India 🇮🇳
        </p>
      </motion.div>
    </motion.div>
  );
};

export default Login;

