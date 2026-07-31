import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMapMarkerAlt, FaRobot, FaTractor, FaBell, FaTools, FaGlobe, FaChevronDown, FaUsers, FaSatellite, FaBolt } from 'react-icons/fa';
import loginBg from '../assets/login_bg.png';

// Custom SVG Logo: Leaf shape with GPS Pin & Gear inside
const LogoIcon = () => (
  <svg viewBox="0 0 100 100" className="w-10 h-10 shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M50 15C65 30 85 45 85 65C85 80 72 90 50 90C28 90 15 80 15 65C15 45 35 30 50 15Z" 
      fill="url(#leafGradient)" 
      className="drop-shadow-[0_4px_8px_rgba(16,185,129,0.35)]"
    />
    <circle cx="50" cy="58" r="16" stroke="#ffffff" strokeWidth="2.5" strokeDasharray="6 3" strokeLinecap="round" opacity="0.85" />
    <circle cx="50" cy="58" r="10" stroke="#ffffff" strokeWidth="2" opacity="0.6" />
    <path 
      d="M50 38C44 38 39 43 39 49C39 57 50 67 50 67C50 67 61 57 61 49C61 43 56 38 50 38ZM50 52C47.8 52 46 50.2 46 48C46 45.8 47.8 44 50 44C52.2 44 54 45.8 54 48C54 50.2 52.2 52 50 52Z" 
      fill="#F59E0B" 
      className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
    />
    <defs>
      <linearGradient id="leafGradient" x1="15" y1="15" x2="85" y2="90" gradientUnits="userSpaceOnUse">
        <stop stopColor="#10B981" />
        <stop offset="1" stopColor="#047857" />
      </linearGradient>
    </defs>
  </svg>
);

const quotes = [
  "Technology that keeps your machines working while you focus on farming.",
  "Track every machine. Protect every investment.",
  "Smarter farming begins with smarter fleet management."
];

export const AuthLayout = () => {
  const [langOpen, setLangOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState('English');
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Quote rotation interval (15 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-emerald-950 font-sans text-white">
      {/* Background Image Container with Ken Burns zoom effect */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img 
          src={loginBg} 
          alt="Smart Agriculture" 
          className="w-full h-full object-cover origin-center scale-100 animate-kenburns"
        />
        {/* Dark translucent nature overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/85 via-black/80 to-[#030a06]/95 z-10" />
      </div>

      {/* Header Container */}
      <header className="relative z-20 flex justify-between items-center px-6 py-4 max-w-7xl mx-auto w-full select-none">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <LogoIcon />
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-1.5">
              AgriTrack <span className="text-amber-500 font-extrabold">AI</span>
            </span>
            <span className="text-[9px] uppercase tracking-widest text-emerald-400 font-bold opacity-80">
              Smart Fleet Operations
            </span>
          </div>
        </div>

        {/* Custom Language Dropdown Selector */}
        <div className="relative">
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm"
          >
            <FaGlobe className="text-emerald-400" />
            <span>{selectedLang}</span>
            <FaChevronDown className={`text-[10px] transition-transform duration-200 ${langOpen ? 'rotate-180' : ''}`} />
          </button>

          {langOpen && (
            <>
              {/* Overlay transparent click-away handler */}
              <div className="fixed inset-0 z-30" onClick={() => setLangOpen(false)} />
              
              <div className="absolute right-0 mt-2 w-48 bg-emerald-955/95 backdrop-blur-md border border-emerald-900/50 rounded-2xl shadow-xl py-2 z-40 animate-slide-up text-left">
                <button
                  onClick={() => {
                    setSelectedLang('English');
                    setLangOpen(false);
                  }}
                  className="w-full px-4 py-2 text-xs font-semibold hover:bg-emerald-800/40 text-emerald-105 flex items-center justify-between cursor-pointer"
                >
                  <span>English</span>
                  <span className="text-[10px] text-emerald-400">● Active</span>
                </button>
                
                <div className="h-px bg-emerald-900/40 my-1 mx-2" />
                
                <button
                  disabled
                  className="w-full px-4 py-2 text-xs font-semibold text-emerald-400/40 flex items-center justify-between cursor-not-allowed select-none"
                >
                  <span>తెలుగు</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-bold uppercase tracking-wider scale-90">Soon</span>
                </button>
                
                <button
                  disabled
                  className="w-full px-4 py-2 text-xs font-semibold text-emerald-400/40 flex items-center justify-between cursor-not-allowed select-none"
                >
                  <span>हिन्दी</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-bold uppercase tracking-wider scale-90">Soon</span>
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Main Grid Content Column Wrapper */}
      <main className="relative z-20 flex-1 grid grid-cols-1 lg:grid-cols-12 max-w-7xl mx-auto w-full px-6 sm:px-8 py-4 items-center gap-12">
        
        {/* Left Information Panel */}
        <section className="hidden lg:flex flex-col col-span-7 space-y-8 pr-4">
          
          {/* Header Description */}
          <div className="space-y-4">
            <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Smart Agricultural <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-400">
                Fleet Management System
              </span>
            </h1>
            <p className="text-sm xl:text-base text-emerald-100/85 max-w-xl leading-relaxed">
              Orchestrate farm-wide operations with precision autonomy. Real-time vehicle telemetry, live tracking, driver performance metrics, and advanced AI diagnostics built for modern agriculture.
            </p>
          </div>

          {/* Quick Statistics Overview Grid */}
          <div className="grid grid-cols-2 gap-4 max-w-lg">
            <div className="flex items-center gap-3 p-3.5 bg-white/5 border border-white/10 rounded-2xl">
              <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400">
                <FaUsers className="text-lg" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs text-emerald-200">Across India</span>
                <span className="text-sm font-bold text-white">Farmer-Trusted</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3.5 bg-white/5 border border-white/10 rounded-2xl">
              <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400">
                <FaTractor className="text-lg" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs text-emerald-200">GPS Fleet Enabled</span>
                <span className="text-sm font-bold text-white">Tractors & Harvesters</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 bg-white/5 border border-white/10 rounded-2xl">
              <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400">
                <FaSatellite className="text-lg" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs text-emerald-200">Active IoT Trackers</span>
                <span className="text-sm font-bold text-white">Live Telemetry</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 bg-white/5 border border-white/10 rounded-2xl">
              <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400">
                <FaBolt className="text-lg" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs text-emerald-200">AI Powered Platform</span>
                <span className="text-sm font-bold text-white">Real-Time Diagnostics</span>
              </div>
            </div>
          </div>

          {/* Bulleted Core Features Details */}
          <div className="space-y-4 max-w-xl text-left">
            <div className="flex gap-3">
              <FaMapMarkerAlt className="text-amber-500 text-lg shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-white">Live GPS Tracking</h4>
                <p className="text-xs text-emerald-100/75 mt-0.5">Real-time coordinates updates, heading tracking, and interactive trail playback.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <FaRobot className="text-amber-500 text-lg shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-white">AI Farming Assistant</h4>
                <p className="text-xs text-emerald-100/75 mt-0.5">Instant anomalies detection, fuel drainage warnings, geofencing, and automated reports.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <FaTractor className="text-amber-500 text-lg shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-white">Smart Fleet Monitoring</h4>
                <p className="text-xs text-emerald-100/75 mt-0.5">Comprehensive oversight dashboards for tractors, combine harvesters, and assigned operators.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <FaBell className="text-amber-500 text-lg shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-white">Smart Alerts & Geofencing</h4>
                <p className="text-xs text-emerald-100/75 mt-0.5">Automated visual alerts on critical parameters, geo-limit crossings, and machine parameters.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <FaTools className="text-amber-500 text-lg shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-white">Operational Service Reminders</h4>
                <p className="text-xs text-emerald-100/75 mt-0.5">Preventative maintenance metrics alerts based on actual logged machine operational engine hours.</p>
              </div>
            </div>
          </div>

          {/* Farmer Friendly Rotational Quote Widget */}
          <div className="border-l-2 border-amber-500 pl-4 py-1.5 max-w-md h-12 flex items-center text-left">
            <AnimatePresence mode="wait">
              <motion.p
                key={quoteIndex}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="text-xs xl:text-sm font-semibold italic text-emerald-100"
              >
                "{quotes[quoteIndex]}"
              </motion.p>
            </AnimatePresence>
          </div>
        </section>

        {/* Right Form Card Panel (Outlet container) */}
        <section className="col-span-12 lg:col-span-5 flex justify-center lg:justify-end">
          <Outlet />
        </section>

      </main>

      {/* Footer Container */}
      <footer className="relative z-20 w-full text-center py-6 px-4 border-t border-white/5 select-none bg-black/10">
        <p className="text-[11px] font-semibold text-emerald-200/60 tracking-wider flex justify-center items-center gap-2 flex-wrap">
          <span>AgriTrack AI</span>
          <span className="opacity-40">|</span>
          <span>Version 1.1</span>
          <span className="opacity-40">|</span>
          <span className="text-emerald-100/70">Designed for Indian Agriculture</span>
          <span className="opacity-40">|</span>
          <span>&copy; {new Date().getFullYear()} AgriTrack AI. All rights reserved.</span>
        </p>
      </footer>
    </div>
  );
};

export default AuthLayout;

