import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { Capitulos } from './pages/Capitulos';
import { Irmaos } from './pages/Irmaos';
import { FinanceiroPage } from './pages/Financeiro';
import { Loja } from './pages/Loja';
import { Login } from './pages/Login';
import { Usuarios } from './pages/Usuarios';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function AppRoutes() {
  const { supabaseUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-surface">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const isAuthenticated = !!supabaseUser;

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      <Route 
        path="/" 
        element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" replace />}
      >
        <Route index element={<Dashboard />} />
        <Route path="capitulos" element={<Capitulos />} />
        <Route path="irmaos" element={<Irmaos />} />
        <Route path="financeiro" element={<FinanceiroPage />} />
        <Route path="loja" element={<Loja />} />
        <Route path="usuarios" element={<Usuarios />} />
        <Route path="admin" element={<div className="p-4">Módulo Administrativo em breve...</div>} />
        <Route path="configuracoes" element={<div className="p-4">Configurações em breve...</div>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
