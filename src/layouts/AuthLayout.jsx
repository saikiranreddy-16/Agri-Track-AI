import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCompass } from 'react-icons/fa';

export const AuthLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#080d0a] text-gray-900 dark:text-gray-100 transition-colors duration-200">
      {/* Left panel: Auth Forms */}
      <div className="flex flex-col justify-between flex-1 px-6 py-12 md:px-12 lg:flex-initial lg:w-[480px] xl:w-[540px] bg-white dark:bg-[#0e1712] shadow-2xl z-10">
        <div className="flex items-center gap-2 mb-8">
          <FaCompass className="text-3xl text-emerald-600 dark:text-emerald-400" />
          <span className="text-2xl font-bold tracking-tight text-emerald-800 dark:text-emerald-300">
            AgriTrack <span className="text-orange-500">AI</span>
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full"
        >
          <Outlet />
        </motion.div>

        <div className="mt-8 text-center text-xs text-gray-500 dark:text-gray-400">
          &copy; {new Date().getFullYear()} AgriTrack AI Fleet Systems. All rights reserved.
        </div>
      </div>

      {/* Right panel: Scenic Agricultural Illustration */}
      <div className="relative flex-1 hidden lg:flex items-center justify-center bg-gradient-to-tr from-emerald-950 via-emerald-800 to-green-600 overflow-hidden">
        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f3d24_1px,transparent_1px),linear-gradient(to_bottom,#0f3d24_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30" />
        
        {/* Glassmorphic floating card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="relative max-w-lg p-10 m-8 bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl text-white"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 rounded-full border border-emerald-500/30 text-xs font-semibold tracking-wider uppercase text-emerald-300 mb-6">
            Farm Operations Platform
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight mb-4 leading-tight">
            Precision Autonomy in the Field.
          </h2>
          <p className="text-lg text-emerald-100/90 leading-relaxed mb-6">
            Monitor real-time telemetry, trace historical paths, manage operators, and orchestrate farm-wide operations with surgical precision.
          </p>
          <div className="flex gap-4">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-orange-400">99.9%</span>
              <span className="text-xs text-emerald-200">GPS Uptime</span>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-orange-400">12,400+</span>
              <span className="text-xs text-emerald-200">Acres Tracked</span>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-orange-400">0.05s</span>
              <span className="text-xs text-emerald-200">Telemetry Delay</span>
            </div>
          </div>
        </motion.div>
        
        {/* Ambient light blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-400/10 rounded-full blur-3xl" />
      </div>
    </div>
  );
};
export default AuthLayout;
