import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaServer, FaUndo } from 'react-icons/fa';
import { PATHS } from '../constants';

export const ServerError = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-6 animate-fade-in text-xs">
      <div className="p-5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full">
        <FaServer className="text-5xl animate-pulse" />
      </div>
      
      <div className="space-y-2 max-w-sm">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-wider">
          500 - System Gateway Delay
        </h1>
        <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-semibold">
          The AgriTrack central network gateway encountered an unexpected database query latency. Please check your network and refresh.
        </p>
      </div>

      <button
        onClick={() => window.location.reload()}
        className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md cursor-pointer transition-all"
      >
        <FaUndo className="text-[10px]" /> Reload Connection
      </button>
    </div>
  );
};

export default ServerError;
