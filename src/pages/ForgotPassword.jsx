import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PATHS } from '../constants';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      setErrors({ email: 'Email address is required.' });
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrors({ email: 'Email address is invalid.' });
      return;
    }
    setErrors({});
    setIsLoading(true);

    // Simulate OTP/reset link email
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1200);
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Reset password
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Provide your email address to receive an OTP reset link.
        </p>
      </div>

      {!isSubmitted ? (
        <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="john@example.com"
            />
            {errors.email && (
              <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.email}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none transition-all shadow-md hover:shadow-lg disabled:opacity-70"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Send OTP Reset Link'
            )}
          </button>
        </form>
      ) : (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl text-emerald-800 dark:text-emerald-300">
          <p className="text-sm font-bold mb-1">Check your inbox</p>
          <p className="text-xs leading-relaxed">
            We have sent a verification code to <strong>{email}</strong>. Use the link in the email to finish updating your password credentials.
          </p>
        </div>
      )}

      <div className="mt-6 text-center text-xs">
        <Link
          to={PATHS.LOGIN}
          className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          Return to login
        </Link>
      </div>
    </div>
  );
};
export default ForgotPassword;
