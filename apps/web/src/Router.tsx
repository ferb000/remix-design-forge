import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import App from './App';
import { StudioDataProvider } from './context/StudioDataContext';
import { AuthProvider, useAuth } from './admin/context/AuthContext';

const Dashboard = lazy(() => import('./admin/components/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const Login = lazy(() => import('./admin/components/AdminLogin').then(module => ({ default: module.AdminLogin })));
const loading = <div className="min-h-screen bg-[#0a0a0c] text-white flex items-center justify-center">Checking session...</div>;

function AdminRoute({ login = false }: { login?: boolean }) {
  const { isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  if (isLoading) return loading;
  if (login) return isAuthenticated ? <Navigate to="/admin" replace /> : <Login onSwitchToPublic={() => navigate('/')} />;
  return isAuthenticated ? <Dashboard onSwitchToPublic={() => navigate('/')} /> : <Navigate to="/admin/login" replace />;
}

export default function Router() {
  return <BrowserRouter><AuthProvider><Suspense fallback={loading}><Routes>
    <Route path="/" element={<StudioDataProvider><App /></StudioDataProvider>} />
    <Route path="/admin/login" element={<AdminRoute login />} />
    <Route path="/admin/*" element={<AdminRoute />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></Suspense></AuthProvider></BrowserRouter>;
}
