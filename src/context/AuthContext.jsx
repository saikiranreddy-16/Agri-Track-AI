import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('auth_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('auth_authenticated') === 'true';
  });

  // Client device ID fingerprint for trusted device login
  const [clientDeviceId] = useState(() => {
    let id = localStorage.getItem('client_device_id');
    if (!id) {
      id = 'dev_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('client_device_id', id);
    }
    return id;
  });

  const login = async (identifier, password, isCompany = false, gpsDeviceId = '') => {
    try {
      const payload = isCompany
        ? { email: identifier, password }
        : {
            phone: identifier,
            password,
            clientDeviceId,
            phoneName: 'Web Browser Phone',
            platform: navigator.platform || 'Web',
            gpsDeviceId,
          };

      const response = await api.post('/auth/login', payload);
      
      if (response.data && response.data.success) {
        const { user: backendUser, token } = response.data.data;
        
        const loggedUser = {
          id: backendUser._id,
          name: backendUser.name,
          email: backendUser.email || '',
          phone: backendUser.phone,
          role: backendUser.role,
          company: backendUser.company,
          isFirstLogin: backendUser.isFirstLogin,
        };

        setUser(loggedUser);
        setIsAuthenticated(true);
        localStorage.setItem('auth_user', JSON.stringify(loggedUser));
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_authenticated', 'true');
        return { success: true, user: loggedUser };
      }

      if (response.data && response.data.code) {
        return { success: false, code: response.data.code, message: response.data.message };
      }
    } catch (error) {
      console.warn('API login failed, checking mock credentials fallback...');
      if (isCompany) {
        if (identifier.toLowerCase() === 'admin@agritrack.in' && password === 'admin123') {
          const loggedUser = {
            id: 'usr-admin',
            name: 'Sanjay Reddy',
            email: 'admin@agritrack.in',
            phone: '+91 99999 88888',
            role: 'Company Admin',
            company: 'AgriTrack Corp',
            isFirstLogin: false
          };
          setUser(loggedUser);
          setIsAuthenticated(true);
          localStorage.setItem('auth_user', JSON.stringify(loggedUser));
          localStorage.setItem('auth_token', 'mock-token-admin');
          localStorage.setItem('auth_authenticated', 'true');
          return { success: true, user: loggedUser };
        }
        return { success: false, message: 'Invalid Admin credentials. Use admin@agritrack.in / admin123' };
      } else {
        if (password === '123456' || password === '654321') {
          const loggedUser = {
            id: 'usr-farmer',
            name: 'Gurpreet Singh',
            email: 'gurpreet@singhfarm.com',
            phone: identifier,
            role: 'Farm Admin',
            company: 'Singh Family Estates',
            isFirstLogin: false
          };
          setUser(loggedUser);
          setIsAuthenticated(true);
          localStorage.setItem('auth_user', JSON.stringify(loggedUser));
          localStorage.setItem('auth_token', 'mock-token-farmer');
          localStorage.setItem('auth_authenticated', 'true');
          return { success: true, user: loggedUser };
        }
        return { success: false, message: 'Invalid Farm Admin PIN. Use PIN 123456' };
      }
    }

    return { success: false, message: 'Authentication failed' };
  };

  const register = async () => {
    return { success: false, message: 'Self-registration is disabled.' };
  };

  const changePIN = async (currentPIN, newPIN) => {
    try {
      const response = await api.put('/auth/change-pin', { currentPIN, newPIN });
      if (response.data && response.data.success) {
        setUser(prev => {
          const updated = { ...prev, isFirstLogin: false };
          localStorage.setItem('auth_user', JSON.stringify(updated));
          return updated;
        });
        return { success: true };
      }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  };

  const deleteTrustedDevice = async (deviceId) => {
    try {
      const response = await api.delete(`/auth/trusted-devices/${deviceId}`);
      if (response.data && response.data.success) {
        return { success: true };
      }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.warn('Backend logout failed:', error.message);
    }
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_authenticated');
  };

  const updateProfile = (updatedDetails) => {
    setUser(prev => {
      const updated = { ...prev, ...updatedDetails };
      localStorage.setItem('auth_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      clientDeviceId,
      login,
      register,
      logout,
      updateProfile,
      changePIN,
      deleteTrustedDevice
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
