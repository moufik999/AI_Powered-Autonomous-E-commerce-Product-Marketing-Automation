/**
 * OmniMarket AI - Root Application Component
 * Configures React Router with persistent DashboardLayout, authenticated routes,
 * and seamless Zipper Menu state retention.
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import RAGPostGenerator from './components/RAGPostGenerator';
import PhotocardGalleryView from './components/PhotocardGalleryView';
import SavedPostsView from './components/SavedPostsView';
import MyProfileView from './components/MyProfileView';

function AuthenticatedRoutes() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  if (!isAuthenticated && !token) {
    return <Navigate to="/login" replace />;
  }

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const currentEmail = user?.email || localStorage.getItem('userEmail') || 'moufik241-35-391@diu.edu.bd';

  return (
    <DashboardLayout
      userEmail={currentEmail}
      onSignOut={handleSignOut}
    />
  );
}

function LoginWrapper() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  if (isAuthenticated || token) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <LoginPage
      onLoginSuccess={() => navigate('/dashboard')}
      onNavigateRegister={() => navigate('/register')}
    />
  );
}

function RegisterWrapper() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  if (isAuthenticated || token) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <RegisterPage
      onRegisterSuccess={() => navigate('/dashboard')}
      onNavigateLogin={() => navigate('/login')}
    />
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginWrapper />} />
      <Route path="/register" element={<RegisterWrapper />} />

      {/* Authenticated Routes wrapped in persistent DashboardLayout */}
      <Route element={<AuthenticatedRoutes />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/generate" element={<RAGPostGenerator />} />
        <Route path="/photocards" element={<PhotocardGalleryView />} />
        <Route path="/history" element={<SavedPostsView />} />
        <Route path="/profile" element={<MyProfileView />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
