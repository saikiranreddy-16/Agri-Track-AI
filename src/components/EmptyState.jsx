import React from 'react';
import { FaPlus } from 'react-icons/fa';

export const EmptyState = ({ title, description, type = 'general', actionText, onActionClick }) => {
  const getIllustration = () => {
    switch (type) {
      case 'vehicles':
        return (
          <svg className="w-32 h-32 text-emerald-600/30 dark:text-emerald-400/20 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124l-.324-5.184a3.375 3.375 0 0 0-3.366-3.166h-1.077m-8.25 9.75V12.75m0 0V9.375c0-.621.504-1.125 1.125-1.125H12m0 0V4.5m0 0h1.5a1.5 1.5 0 0 1 1.5 1.5v3h-3.375" />
          </svg>
        );
      case 'alerts':
        return (
          <svg className="w-32 h-32 text-orange-500/30 dark:text-orange-400/20 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        );
      case 'reports':
        return (
          <svg className="w-32 h-32 text-emerald-600/30 dark:text-emerald-400/20 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9z" />
          </svg>
        );
      case 'gps-history':
        return (
          <svg className="w-32 h-32 text-blue-500/30 dark:text-blue-400/20 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8m-3-12.75v14.25M3 12h18" />
          </svg>
        );
      default:
        return (
          <svg className="w-32 h-32 text-gray-400/35 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0zm-9 5.25h.008v.008H12v-.008z" />
          </svg>
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 md:p-12 text-center bg-white dark:bg-[#0e1712] border border-gray-150 dark:border-emerald-950/20 rounded-3xl shadow-sm space-y-4 max-w-lg mx-auto my-6 animate-fade-in">
      <div className="p-4 bg-gray-50 dark:bg-emerald-950/10 rounded-full shrink-0">
        {getIllustration()}
      </div>
      <div className="space-y-1.5">
        <h3 className="text-sm font-black text-gray-800 dark:text-white uppercase tracking-wider">{title}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm">{description}</p>
      </div>
      {actionText && onActionClick && (
        <button
          onClick={onActionClick}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg cursor-pointer"
        >
          <FaPlus className="text-[10px]" />
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
