import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaQuestionCircle, FaEnvelope, FaPaperPlane, FaChevronDown, FaCheckCircle } from 'react-icons/fa';

export const Help = () => {
  const [openFaqIdx, setOpenFaqIdx] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [supportName, setSupportName] = useState('');
  const [supportMsg, setSupportMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const faqs = [
    {
      q: 'How frequently does GPS telemetry refresh on the tracking map?',
      a: 'The tracking system polls active field machinery every 4 seconds. When in cellular coverage, the telemetry latency remains under 120 milliseconds.'
    },
    {
      q: 'What is the role capability difference in Phase 1?',
      a: 'The Admin role has full configuration capabilities, including CRUD operations on machinery, drivers, and jobs. The Farm Owner can view stats and export report indices, while the Operator role has view privileges with access to job progress toggles.'
    },
    {
      q: 'How do I resolve Low Fuel warnings?',
      a: 'Navigate to the Alerts page, filter by Fuel, and click "Resolve Code" after a refuel cart has serviced the tractor. This updates the telemetry values automatically.'
    },
    {
      q: 'Can I import field boundaries using SHP or KML formats?',
      a: 'Yes, although boundary polygon drawing is mocked in the Phase 1 UI, the system architecture supports KML/GeoJSON shapefile imports for Future IoT deployment.'
    }
  ];

  const handleSupportSubmit = (e) => {
    e.preventDefault();
    if (!supportName || !supportMsg) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      setSupportName('');
      setSupportMsg('');
      setTimeout(() => setIsSubmitted(false), 3000);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
          Help & Support Center
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Resolve issues quickly with our FAQs, check manual guidelines, or message our support crew directly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Accordion FAQ (Left Column) */}
        <div className="lg:col-span-2 p-5 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-white flex items-center gap-2">
            <FaQuestionCircle className="text-emerald-600" /> Frequently Asked Questions
          </h2>

          <div className="space-y-2.5 text-xs">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div 
                  key={idx} 
                  className="border border-gray-100 dark:border-emerald-950/20 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                    className="w-full p-4 text-left font-bold text-gray-800 dark:text-white flex justify-between items-center bg-gray-50/50 dark:bg-emerald-950/10 hover:bg-gray-50 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
                      <FaChevronDown className="text-gray-400" />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <p className="p-4 border-t border-gray-100 dark:border-emerald-950/10 text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* Support Request Form (Right Column) */}
        <div className="p-5 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 rounded-2xl shadow-sm space-y-4 h-fit">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-white flex items-center gap-2">
            <FaEnvelope className="text-orange-500" /> Contact Support Crew
          </h2>

          {/* Success Banner */}
          <AnimatePresence>
            {isSubmitted && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3 bg-emerald-50 dark:bg-emerald-950/25 border border-emerald-100 dark:border-emerald-900/30 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-2"
              >
                <FaCheckCircle /> Support ticket sent successfully.
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSupportSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Your Name</label>
              <input
                type="text"
                required
                value={supportName}
                onChange={(e) => setSupportName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-955/30 bg-gray-50 dark:bg-[#121c17] focus:bg-white focus:outline-none dark:text-white"
                placeholder="e.g. John Miller"
              />
            </div>
            
            <div>
              <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">Support message / Feedback</label>
              <textarea
                rows="4"
                required
                value={supportMsg}
                onChange={(e) => setSupportMsg(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-emerald-955/30 bg-gray-50 dark:bg-[#121c17] focus:bg-white focus:outline-none dark:text-white resize-none"
                placeholder="Write your message detail here..."
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-md disabled:opacity-75"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <><FaPaperPlane /> Dispatch Ticket</>
              )}
            </button>
          </form>

          <div className="border-t border-gray-100 dark:border-emerald-950/20 pt-4 text-[10px] text-gray-450 text-center font-bold uppercase">
            AgriTrack Platform Version: 1.0.0 (Phase 1 Frontend)
          </div>
        </div>

      </div>

    </div>
  );
};
export default Help;
