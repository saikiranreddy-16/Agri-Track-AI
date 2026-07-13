import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaShieldAlt, FaChevronLeft } from 'react-icons/fa';
import { PATHS } from '../constants';

export const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-6 animate-fade-in text-xs">
      <div className="p-5 bg-orange-500/10 border border-orange-500/20 text-orange-500 rounded-full">
        <FaShieldAlt className="text-5xl" />
      </div>
      
      <div className="space-y-2 max-w-sm">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-wider">
          403 - Access Restrained
        </h1>
        <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-semibold">
          Your account credentials do not have the required administrative authorization keys to access this view.
        </p>
      </div>

      <button
        onClick={() => navigate(PATHS.DASHBOARD)}
        className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md cursor-pointer transition-all"
      >
        <FaChevronLeft className="text-[10px]" /> Return to Dashboard
      </button>
    </div>
  );
};

export default Unauthorized;
