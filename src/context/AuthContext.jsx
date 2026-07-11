import React, { createContext, useContext, useState } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('auth_user');
    return saved ? JSON.parse(saved) : {
      name: 'Rajesh Patel',
      email: 'rajesh@example.com',
      phone: '+91 98765 01928',
      role: 'Farm Owner',
      company: 'Patel Agro Farms'
    };
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('auth_authenticated') === 'true' || true;
  });

  const login = async (email, password, role = 'Farm Owner') => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data && response.data.success) {
        const { user: backendUser, token } = response.data.data;
        
        // Use backend user details
        const loggedUser = {
          id: backendUser._id,
          name: backendUser.name,
          email: backendUser.email,
          phone: backendUser.phone,
          role: backendUser.role,
          company: backendUser.company
        };

        setUser(loggedUser);
        setIsAuthenticated(true);
        localStorage.setItem('auth_user', JSON.stringify(loggedUser));
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_authenticated', 'true');
        return loggedUser;
      }
    } catch (error) {
      console.warn('Backend login failed, falling back to mock authentication:', error.message);
    }

    // Mock fallback
    const mockUser = {
      name: email.split('@')[0].replace('.', ' '),
      email,
      phone: '+91 99999 11111',
      role,
      company: 'Patel Agro Farms'
    };
    setUser(mockUser);
    setIsAuthenticated(true);
    localStorage.setItem('auth_user', JSON.stringify(mockUser));
    localStorage.setItem('auth_authenticated', 'true');
    return mockUser;
  };

  const register = async (name, email, phone, role, company, password = 'password123') => {
    try {
      const response = await api.post('/auth/register', { name, email, phone, role, company, password });
      if (response.data && response.data.success) {
        const { user: backendUser, token } = response.data.data;
        const loggedUser = {
          id: backendUser._id,
          name: backendUser.name,
          email: backendUser.email,
          phone: backendUser.phone,
          role: backendUser.role,
          company: backendUser.company
        };
        setUser(loggedUser);
        setIsAuthenticated(true);
        localStorage.setItem('auth_user', JSON.stringify(loggedUser));
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_authenticated', 'true');
        return loggedUser;
      }
    } catch (error) {
      console.warn('Backend registration failed, falling back to mock registration:', error.message);
    }

    // Mock fallback
    const mockUser = { name, email, phone, role, company };
    setUser(mockUser);
    setIsAuthenticated(true);
    localStorage.setItem('auth_user', JSON.stringify(mockUser));
    localStorage.setItem('auth_authenticated', 'true');
    return mockUser;
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

  const changeRole = (newRole) => {
    setUser(prev => {
      const updated = { ...prev, role: newRole };
      localStorage.setItem('auth_user', JSON.stringify(updated));
      return updated;
    });
  };

  const updateProfile = (updatedDetails) => {
    setUser(prev => {
      const updated = { ...prev, ...updatedDetails };
      localStorage.setItem('auth_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout, changeRole, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
