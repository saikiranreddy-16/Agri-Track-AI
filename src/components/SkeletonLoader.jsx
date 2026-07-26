import React from 'react';

export const SkeletonLoader = ({ type = 'card', count = 3 }) => {
  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-64 bg-gray-200 dark:bg-emerald-950/20 rounded-2xl p-5 flex flex-col justify-between space-y-4">
            <div className="h-32 bg-gray-300 dark:bg-emerald-900/30 rounded-xl" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 dark:bg-emerald-900/30 rounded w-3/4" />
              <div className="h-3 bg-gray-200 dark:bg-emerald-950/40 rounded w-1/2" />
            </div>
            <div className="h-8 bg-gray-300 dark:bg-emerald-900/30 rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="space-y-3 animate-pulse p-4 bg-white dark:bg-[#0e1712] rounded-2xl border border-gray-100 dark:border-emerald-950/30">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 dark:bg-emerald-950/20 rounded-xl flex items-center px-4 justify-between">
            <div className="h-4 bg-gray-300 dark:bg-emerald-900/30 rounded w-1/4" />
            <div className="h-4 bg-gray-200 dark:bg-emerald-950/40 rounded w-1/6" />
            <div className="h-4 bg-gray-300 dark:bg-emerald-900/30 rounded w-1/5" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="h-48 bg-gray-200 dark:bg-emerald-950/20 rounded-2xl animate-pulse p-6 space-y-4">
      <div className="h-6 bg-gray-300 dark:bg-emerald-900/30 rounded w-1/3" />
      <div className="h-4 bg-gray-200 dark:bg-emerald-950/40 rounded w-2/3" />
    </div>
  );
};
export default SkeletonLoader;
