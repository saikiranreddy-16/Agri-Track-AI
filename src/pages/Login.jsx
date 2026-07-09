import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PATHS } from '../constants';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('rajesh.patel@agritrack.in');
  const [password, setPassword] = useState('password123');
  const [selectedRole, setSelectedRole] = useState('Farm Owner');
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const tempErrors = {};
    if (!email) tempErrors.email = 'Email address is required.';
    else if (!/\S+@\S+\.\S+/.test(email)) tempErrors.email = 'Email format is invalid.';
    
    if (!password) tempErrors.password = 'Password is required.';
    else if (password.length < 6) tempErrors.password = 'Password must be at least 6 characters.';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      login(email, password, selectedRole);
      setIsLoading(false);
      navigate(PATHS.DASHBOARD);
    }, 1000);
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Welcome back
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Monitor your agricultural assets with precision.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full px-3 py-2 text-sm bg-gray-50 dark:bg-[#121c17] border rounded-xl focus:outline-none focus:bg-white dark:text-white transition-all ${
              errors.email 
                ? 'border-red-500 focus:border-red-500' 
                : 'border-gray-200 dark:border-emerald-950/40 focus:border-emerald-500'
            }`}
            placeholder="e.g. john.miller@farm.com"
          />
          {errors.email && (
            <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.email}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Password
            </label>
            <Link
              to={PATHS.FORGOT_PASSWORD}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full px-3 py-2 text-sm bg-gray-50 dark:bg-[#121c17] border rounded-xl focus:outline-none focus:bg-white dark:text-white transition-all ${
              errors.password 
                ? 'border-red-500 focus:border-red-500' 
                : 'border-gray-200 dark:border-emerald-950/40 focus:border-emerald-500'
            }`}
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.password}</p>
          )}
        </div>

        {/* Role Selector (Admin, Owner, Operator) */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
            Select Operational Role
          </label>
          <div className="grid grid-cols-3 gap-2">
            {['Admin', 'Farm Owner', 'Operator'].map((role) => (
              <button
                type="button"
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                  selectedRole === role
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-950/20 dark:text-emerald-300'
                    : 'border-gray-200 dark:border-emerald-950/40 bg-white dark:bg-[#0e1712] text-gray-600 dark:text-gray-300 hover:border-gray-300'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Remember Me */}
        <div className="flex items-center">
          <input
            id="remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300"
          />
          <label htmlFor="remember-me" className="ml-2 text-xs font-semibold text-gray-600 dark:text-gray-400 select-none">
            Remember me on this machine
          </label>
        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            'Access Dashboard'
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-gray-600 dark:text-gray-400">
        New to AgriTrack AI?{' '}
        <Link
          to={PATHS.REGISTER}
          className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          Register farm instance
        </Link>
      </div>
    </div>
  );
};
export default Login;
