import React, { createContext, useContext, useState } from 'react';
import { mockAlerts as initialAlerts } from '../data/mockData';

const UIStateContext = createContext();

export const UIStateProvider = ({ children }) => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [alerts, setAlerts] = useState(initialAlerts);
  const [notifications, setNotifications] = useState([
    { id: 'n-1', category: 'GPS', title: 'Tractor 8R Connected', message: 'John Deere 8R 410 is online.', time: 'Just now', read: false },
    { id: 'n-2', category: 'Fuel', title: 'Low Fuel Alert', message: 'New Holland T7.315 is below 15%.', time: '10 mins ago', read: false },
    { id: 'n-3', category: 'Maintenance', title: 'Service Complete', message: 'Blade sharpening finished for Case IH.', time: '2 hours ago', read: true },
    { id: 'n-4', category: 'Driver', title: 'Shift Started', message: 'Sarah Jenkins checked in for mach-2.', time: '3 hours ago', read: true }
  ]);

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const addNotification = (notif) => {
    setNotifications(prev => [
      { id: Date.now().toString(), read: false, time: 'Just now', ...notif },
      ...prev
    ]);
  };

  const resolveAlert = (id) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'Resolved' } : a));
  };

  const dismissAlert = (id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  return (
    <UIStateContext.Provider value={{
      isSidebarExpanded,
      setIsSidebarExpanded,
      globalSearchQuery,
      setGlobalSearchQuery,
      alerts,
      setAlerts,
      notifications,
      markAllNotificationsAsRead,
      clearNotification,
      addNotification,
      resolveAlert,
      dismissAlert
    }}>
      {children}
    </UIStateContext.Provider>
  );
};

export const useUIState = () => useContext(UIStateContext);
