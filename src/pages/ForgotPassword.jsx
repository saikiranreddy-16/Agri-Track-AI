import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PATHS } from '../constants';
import { FaPhone, FaEnvelope, FaLock, FaKey, FaChevronLeft } from 'react-icons/fa';

export const ForgotPassword = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [step, setStep] = useState('input'); // 'input', 'otp', 'reset-password', 'success'
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const isEmail = identifier.includes('@');
  const isPhone = identifier.trim().length > 0 && !isEmail;

  const handleIdentifierSubmit = (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setErrors({ identifier: 'Email or Mobile number is required.' });
      return;
    }
    if (isEmail && !/\S+@\S+\.\S+/.test(identifier)) {
      setErrors({ identifier: 'Email format is invalid.' });
      return;
    }
    if (isPhone && !/^\+?[0-9\s\-()]{7,15}$/.test(identifier.trim())) {
      setErrors({ identifier: 'Phone number format is invalid.' });
      return;
    }

    setErrors({});
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      if (isEmail) {
        setStep('success'); // Company Admin reset success
      } else {
        setStep('otp'); // Farm Admin OTP verification step
      }
    }, 1000);
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      setErrors({ otp: 'Please enter a valid OTP code.' });
      return;
    }
    setErrors({});
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('reset-password');
    }, 800);
  };

  const handlePasswordReset = (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setErrors({ newPassword: 'Password must be at least 6 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match.' });
      return;
    }
    setErrors({});
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('success');
    }, 1000);
  };

  return (
    <div className="w-full">
      {/* Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
          {step !== 'input' && (
            <button
              onClick={() => {
                if (step === 'otp') setStep('input');
                else if (step === 'reset-password') setStep('otp');
                else setStep('input');
              }}
              className="p-1 hover:bg-gray-100 dark:hover:bg-emerald-950/40 rounded text-gray-400 text-sm cursor-pointer"
            >
              <FaChevronLeft />
            </button>
          )}
          Reset Account Credentials
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {step === 'input' && 'Provide your registered details to recover access.'}
          {step === 'otp' && `Enter the 6-digit OTP verification code sent to ${identifier}.`}
          {step === 'reset-password' && 'Enter your new secure security password.'}
          {step === 'success' && 'Credential recovery request completed.'}
        </p>
      </div>

      {step === 'input' && (
        <form onSubmit={handleIdentifierSubmit} className="space-y-4">
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
                  setErrors({});
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              isEmail ? 'Send Reset Link' : 'Send OTP Verification Code'
            )}
          </button>
        </form>
      )}

      {step === 'otp' && (
        <form onSubmit={handleOtpSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-750 dark:text-gray-300 mb-1.5">
              OTP Verification Code (Mock: 123456)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                <FaKey />
              </span>
              <input
                type="text"
                maxLength="6"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value);
                  setErrors({});
                }}
                className={`w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 dark:bg-[#121c17] border rounded-xl focus:outline-none focus:bg-white dark:text-white transition-all text-center tracking-widest font-mono ${
                  errors.otp
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-200 dark:border-emerald-950/40 focus:border-emerald-500'
                }`}
                placeholder="000000"
              />
            </div>
            {errors.otp && (
              <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.otp}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Verify OTP Code'
            )}
          </button>
        </form>
      )}

      {step === 'reset-password' && (
        <form onSubmit={handlePasswordReset} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-750 dark:text-gray-300 mb-1.5">
              New Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                <FaLock />
              </span>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setErrors({});
                }}
                className={`w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 dark:bg-[#121c17] border rounded-xl focus:outline-none focus:bg-white dark:text-white transition-all ${
                  errors.newPassword
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-200 dark:border-emerald-950/40 focus:border-emerald-500'
                }`}
                placeholder="••••••••"
              />
            </div>
            {errors.newPassword && (
              <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.newPassword}</p>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-755 dark:text-gray-300 mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                <FaLock />
              </span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setErrors({});
                }}
                className={`w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 dark:bg-[#121c17] border rounded-xl focus:outline-none focus:bg-white dark:text-white transition-all ${
                  errors.confirmPassword
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-200 dark:border-emerald-950/40 focus:border-emerald-500'
                }`}
                placeholder="••••••••"
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Reset Password'
            )}
          </button>
        </form>
      )}

      {step === 'success' && (
        <div className="space-y-4 animate-fade-in">
          <div className="p-4 bg-emerald-55 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl text-emerald-800 dark:text-emerald-400">
            <p className="text-sm font-bold mb-1">
              {isEmail ? 'Reset Link Transmitted' : 'Password Reset Succeeded'}
            </p>
            <p className="text-xs leading-relaxed">
              {isEmail 
                ? `We have dispatched a password recovery hyperlink to ${identifier}. Please follow the details to establish a new password.`
                : 'Your credential PIN/password has been successfully updated on the system database. You can now use your new security credentials.'
              }
            </p>
          </div>
          <button
            onClick={() => navigate(PATHS.LOGIN)}
            className="w-full py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none transition-all shadow-md hover:shadow-lg cursor-pointer"
          >
            Return to Login
          </button>
        </div>
      )}

      {step === 'input' && (
        <div className="mt-6 text-center text-xs">
          <Link
            to={PATHS.LOGIN}
            className="font-bold text-emerald-650 dark:text-emerald-400 hover:underline"
          >
            Return to login
          </Link>
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;
