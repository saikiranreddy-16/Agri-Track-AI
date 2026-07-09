import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('auth_user');
    return saved ? JSON.parse(saved) : {
      name: 'Rajesh Patel',
      email: 'rajesh.patel@agritrack.in',
      phone: '+91 98765 01928',
      role: 'Farm Owner', // Default role (Admin, Farm Owner, Operator)
      company: 'Patel Agro Farms Pvt Ltd'
    };
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('auth_authenticated') === 'true' || true; // Set true by default to ease direct navigation
  });

  const login = (email, password, role = 'Farm Owner') => {
    const mockUser = {
      name: email.split('@')[0].replace('.', ' '),
      email,
      phone: '+91 99999 11111',
      role,
      company: 'Patel Agro Farms Pvt Ltd'
    };
    setUser(mockUser);
    setIsAuthenticated(true);
    localStorage.setItem('auth_user', JSON.stringify(mockUser));
    localStorage.setItem('auth_authenticated', 'true');
  };

  const register = (name, email, phone, role, company) => {
    const mockUser = { name, email, phone, role, company };
    setUser(mockUser);
    setIsAuthenticated(true);
    localStorage.setItem('auth_user', JSON.stringify(mockUser));
    localStorage.setItem('auth_authenticated', 'true');
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('auth_user');
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
