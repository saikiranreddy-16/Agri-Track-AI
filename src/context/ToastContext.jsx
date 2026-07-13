import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaExclamationTriangle, FaTimes } from 'react-icons/fa';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 7);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const toast = {
    success: (msg, dur) => showToast(msg, 'success', dur),
    error: (msg, dur) => showToast(msg, 'error', dur),
    warning: (msg, dur) => showToast(msg, 'warning', dur),
    info: (msg, dur) => showToast(msg, 'info', dur),
  };

  // Expose toast globally for quick non-react contexts
  window.toast = toast;

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getToastStyle = (type) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-white dark:bg-[#0c120f] border-emerald-500 text-emerald-800 dark:text-emerald-400 border-l-4',
          icon: <FaCheckCircle className="text-emerald-500 text-base shrink-0 mt-0.5" />
        };
      case 'error':
        return {
          bg: 'bg-white dark:bg-[#0c120f] border-red-500 text-red-800 dark:text-red-400 border-l-4',
          icon: <FaExclamationCircle className="text-red-500 text-base shrink-0 mt-0.5" />
        };
      case 'warning':
        return {
          bg: 'bg-white dark:bg-[#0c120f] border-orange-500 text-orange-800 dark:text-orange-400 border-l-4',
          icon: <FaExclamationTriangle className="text-orange-500 text-base shrink-0 mt-0.5" />
        };
      default:
        return {
          bg: 'bg-white dark:bg-[#0c120f] border-blue-500 text-blue-800 dark:text-blue-400 border-l-4',
          icon: <FaInfoCircle className="text-blue-500 text-base shrink-0 mt-0.5" />
        };
    }
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] space-y-2 w-80 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => {
            const { bg, icon } = getToastStyle(t.type);
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 50, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.95 }}
                className={`p-3.5 rounded-xl shadow-lg flex items-start gap-3 pointer-events-auto border border-gray-100 dark:border-emerald-950/15 ${bg}`}
              >
                {icon}
                <div className="flex-1 text-xs font-bold leading-normal">{t.message}</div>
                <button
                  onClick={() => removeToast(t.id)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-white shrink-0 cursor-pointer"
                >
                  <FaTimes className="text-[10px]" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    // If used outside provider, fallback to window.toast
    return window.toast || {
      success: (m) => console.log('success:', m),
      error: (m) => console.error('error:', m),
      warning: (m) => console.warn('warning:', m),
      info: (m) => console.log('info:', m),
    };
  }
  return context;
};
