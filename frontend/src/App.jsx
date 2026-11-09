/**
 * OmniMarket AI - Root Application Component
 * Manages screen navigation and authentication session with AuthProvider.
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BlankDashboard from './pages/BlankDashboard';

function AppContent() {
  const { user, isAuthenticated, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState(() => (isAuthenticated ? 'dashboard' : 'login'));

  const handleAuthSuccess = (email) => {
    setCurrentPage('dashboard');
  };

  const handleSignOut = () => {
    logout();
    setCurrentPage('login');
  };

  if (currentPage === 'dashboard' || (isAuthenticated && currentPage !== 'register' && currentPage !== 'login')) {
    return (
      <BlankDashboard
        userEmail={user?.email || 'moufik241-35-391@diu.edu.bd'}
        onSignOut={handleSignOut}
      />
    );
  }

  if (currentPage === 'register') {
    return (
      <RegisterPage
        onRegisterSuccess={handleAuthSuccess}
        onNavigateLogin={() => setCurrentPage('login')}
      />
    );
  }

  return (
    <LoginPage
      onLoginSuccess={handleAuthSuccess}
      onNavigateRegister={() => setCurrentPage('register')}
    />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
