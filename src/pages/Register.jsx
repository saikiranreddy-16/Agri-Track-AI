import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PATHS } from '../constants';

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('Farm Owner');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const tempErrors = {};
    if (!name) tempErrors.name = 'Full name is required.';
    if (!email) tempErrors.email = 'Email address is required.';
    else if (!/\S+@\S+\.\S+/.test(email)) tempErrors.email = 'Email is invalid.';
    
    if (!phone) tempErrors.phone = 'Phone number is required.';
    if (!company) tempErrors.company = 'Company/Farm name is required.';
    
    if (!password) tempErrors.password = 'Password is required.';
    else if (password.length < 6) tempErrors.password = 'Password must be at least 6 characters.';

    if (password !== confirmPassword) {
      tempErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setTimeout(() => {
      register(name, email, phone, role, company);
      setIsLoading(false);
      navigate(PATHS.DASHBOARD);
    }, 1000);
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Register Farm Fleet
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Create an enterprise account to begin asset routing.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Full Name */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-gray-50 dark:bg-[#121c17] border border-gray-200 dark:border-emerald-950/40 rounded-xl focus:outline-none focus:bg-white dark:text-white"
            placeholder="e.g. John Miller"
          />
          {errors.name && <p className="text-[9px] text-red-500 font-semibold mt-0.5">{errors.name}</p>}
        </div>

        {/* Email Address */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-gray-50 dark:bg-[#121c17] border border-gray-200 dark:border-emerald-950/40 rounded-xl focus:outline-none focus:bg-white dark:text-white"
            placeholder="john@example.com"
          />
          {errors.email && <p className="text-[9px] text-red-500 font-semibold mt-0.5">{errors.email}</p>}
        </div>

        {/* Phone & Company Split Row */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-gray-50 dark:bg-[#121c17] border border-gray-200 dark:border-emerald-950/40 rounded-xl focus:outline-none focus:bg-white dark:text-white"
              placeholder="+1 (555) 000-0000"
            />
            {errors.phone && <p className="text-[9px] text-red-500 font-semibold mt-0.5">{errors.phone}</p>}
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
              Farm / Company
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-gray-50 dark:bg-[#121c17] border border-gray-200 dark:border-emerald-950/40 rounded-xl focus:outline-none focus:bg-white dark:text-white"
              placeholder="e.g. Miller Farms"
            />
            {errors.company && <p className="text-[9px] text-red-500 font-semibold mt-0.5">{errors.company}</p>}
          </div>
        </div>

        {/* Role Selector */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
            Initial Operational Role
          </label>
          <div className="grid grid-cols-3 gap-2">
            {['Admin', 'Farm Owner', 'Operator'].map((r) => (
              <button
                type="button"
                key={r}
                onClick={() => setRole(r)}
                className={`py-1 text-xs font-semibold rounded-xl border transition-all ${
                  role === r
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-950/20 dark:text-emerald-300'
                    : 'border-gray-200 dark:border-emerald-950/40 bg-white dark:bg-[#0e1712] text-gray-600 dark:text-gray-300 hover:border-gray-300'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Passwords Split Row */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-gray-50 dark:bg-[#121c17] border border-gray-200 dark:border-emerald-950/40 rounded-xl focus:outline-none focus:bg-white dark:text-white"
              placeholder="••••••"
            />
            {errors.password && <p className="text-[9px] text-red-500 font-semibold mt-0.5">{errors.password}</p>}
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-gray-50 dark:bg-[#121c17] border border-gray-200 dark:border-emerald-950/40 rounded-xl focus:outline-none focus:bg-white dark:text-white"
              placeholder="••••••"
            />
            {errors.confirmPassword && (
              <p className="text-[9px] text-red-500 font-semibold mt-0.5">{errors.confirmPassword}</p>
            )}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center py-2 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none transition-all shadow-md hover:shadow-lg disabled:opacity-70 mt-4"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            'Initialize Account'
          )}
        </button>
      </form>

      <div className="mt-4 text-center text-xs text-gray-600 dark:text-gray-400">
        Already registered?{' '}
        <Link
          to={PATHS.LOGIN}
          className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          Login here
        </Link>
      </div>
    </div>
  );
};
export default Register;
