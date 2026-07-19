import React from 'react';
import { FaWifi, FaUndo } from 'react-icons/fa';

export const OfflinePage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-[#080d0a]">
      <div className="max-w-md w-full p-8 bg-white dark:bg-[#0e1712] border border-gray-250/20 dark:border-emerald-950/20 rounded-3xl shadow-sm text-center space-y-5">
        <div className="mx-auto w-16 h-16 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 rounded-full flex items-center justify-center animate-pulse">
          <FaWifi className="text-2xl" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-base font-black dark:text-white">Connection Lost</h1>
          <p className="text-xs text-gray-400 font-semibold leading-relaxed">
            You are currently offline. Check your local network configuration and retry connecting.
          </p>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-sm"
        >
          <FaUndo /> Retry Connection
        </button>
      </div>
    </div>
  );
};

export default OfflinePage;
