import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import Favorites from './pages/Favorites';
import './index.css';

// ✅ HomePage público
const HomePage = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-blue-600">
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-white">🎌 EventRadar</h1>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-white">¡Hola, {user.email}!</span>
                  <a href="/dashboard" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors">
                    Dashboard
                  </a>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <a href="/login" className="text-white hover:text-white/80 transition-colors">
                    Iniciar Sesión
                  </a>
                  <a href="/register" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors">
                    Registrarse
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-5xl font-extrabold text-white mb-6">
            Descubre Eventos Increíbles
          </h2>
          <p className="text-xl text-white/90 mb-12 max-w-3xl mx-auto">
            Encuentra los mejores eventos cerca de ti en Chile.
          </p>
          
          {user ? (
            <a 
              href="/dashboard"
              className="inline-flex items-center px-8 py-4 bg-white text-purple-600 font-bold text-lg rounded-xl hover:bg-white/90 transform hover:scale-105 transition-all duration-200"
            >
              🗺️ Ver Mapa de Eventos
            </a>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/register"
                className="inline-flex items-center px-8 py-4 bg-white text-purple-600 font-bold text-lg rounded-xl hover:bg-white/90 transform hover:scale-105 transition-all duration-200"
              >
                🎉 Comenzar Gratis
              </a>
              <a 
                href="/login"
                className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-white text-white font-bold text-lg rounded-xl hover:bg-white/10 transition-all duration-200"
              >
                🔐 Iniciar Sesión
              </a>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// ✅ ProtectedRoute SUPER SIMPLE
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  console.log('🛡️ ProtectedRoute:', { user: !!user, loading });
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold">🎌 EventRadar</h2>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    console.log('❌ No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  console.log('✅ User authenticated, showing content');
  return children;
};

// ✅ App principal
const AppWithRouter = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

function App() {
  return <AppWithRouter />;
}

export default App;