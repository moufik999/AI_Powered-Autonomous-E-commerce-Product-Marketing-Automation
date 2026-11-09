/**
 * OmniMarket AI - Authentication Context
 * Global state management for authentication tokens, user email, role, and logout.
 */

import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { STORAGE_KEYS } from '../utils/constants';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedEmail = localStorage.getItem(STORAGE_KEYS.USER_EMAIL);
    const savedRole = localStorage.getItem(STORAGE_KEYS.USER_ROLE) || 'Merchant';
    return savedEmail ? { email: savedEmail, role: savedRole } : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEYS.TOKEN) || null);
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await authService.login(email, password);
      const userObj = data.user || { email, role: 'Merchant' };

      localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
      localStorage.setItem(STORAGE_KEYS.USER_EMAIL, userObj.email);
      localStorage.setItem(STORAGE_KEYS.USER_ROLE, userObj.role || 'Merchant');

      setToken(data.token);
      setUser(userObj);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password) => {
    setLoading(true);
    try {
      const data = await authService.register(email, password);
      const userObj = data.user || { email, role: 'Merchant' };

      localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
      localStorage.setItem(STORAGE_KEYS.USER_EMAIL, userObj.email);
      localStorage.setItem(STORAGE_KEYS.USER_ROLE, userObj.role || 'Merchant');

      setToken(data.token);
      setUser(userObj);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_EMAIL);
    localStorage.removeItem(STORAGE_KEYS.USER_ROLE);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token),
        loading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

