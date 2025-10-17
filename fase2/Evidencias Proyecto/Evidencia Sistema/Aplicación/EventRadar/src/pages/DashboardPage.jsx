import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, User, Bell, Menu, X, LogOut, Home } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import MapView from '../components/MapView';
import AdminEventForm from '../components/AdminEventForm';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('mapa');
  const [menuOpen, setMenuOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const tabs = [
    { id: 'mapa', label: 'Mapa', icon: MapPin },
    { id: 'eventos', label: 'Eventos', icon: Calendar },
    { id: 'perfil', label: 'Perfil', icon: User },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleEventCreated = (newEvent) => {
    console.log('✅ Nuevo evento creado:', newEvent);
    // Trigger refresh del mapa
    setRefreshTrigger(prev => prev + 1);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'mapa':
        return (
          <div className="h-full bg-gradient-to-br from-purple-100/20 to-pink-100/20 p-4 relative">
            <div className="h-full rounded-xl overflow-hidden shadow-lg">
              <MapView key={refreshTrigger} />
            </div>
            {/* ✅ Botón de admin para agregar eventos */}
            <AdminEventForm onEventCreated={handleEventCreated} />
          </div>
        );
      case 'eventos':
        return (
          <div className="p-6 bg-gradient-to-br from-purple-50/50 to-pink-50/50 min-h-full">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                🎉 Mis Eventos
              </h2>
              <div className="grid gap-4">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-gray-800 mb-2">🎵 Concierto en el Parque</h3>
                      <p className="text-purple-600 font-medium text-sm mb-1">📅 15 Oct 2025</p>
                      <p className="text-gray-600 text-sm">Gran concierto al aire libre con artistas locales</p>
                    </div>
                    <button className="text-red-500 hover:text-red-700 text-xl">❤️</button>
                  </div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-gray-800 mb-2">🍕 Festival Gastronómico</h3>
                      <p className="text-purple-600 font-medium text-sm mb-1">📅 20 Oct 2025</p>
                      <p className="text-gray-600 text-sm">Los mejores sabores de la ciudad en un solo lugar</p>
                    </div>
                    <button className="text-red-500 hover:text-red-700 text-xl">❤️</button>
                  </div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-gray-800 mb-2">🎌 Feria de los Otakus</h3>
                      <p className="text-purple-600 font-medium text-sm mb-1">📅 25 Oct 2025</p>
                      <p className="text-gray-600 text-sm">¡El evento otaku más épico de Chile!</p>
                    </div>
                    <button className="text-red-500 hover:text-red-700 text-xl">❤️</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'perfil':
        return (
          <div className="p-6 bg-gradient-to-br from-purple-50/50 to-pink-50/50 min-h-full">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                👤 Mi Perfil
              </h2>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-white/50">
                <div className="flex items-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-2xl font-bold text-white">
                      {(profile?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="ml-6">
                    <h3 className="font-bold text-xl text-gray-800">
                      {profile?.full_name || 'Usuario'}
                    </h3>
                    <p className="text-gray-600">{user?.email}</p>
                    <p className="text-sm text-purple-600 mt-1">Miembro desde {new Date().getFullYear()}</p>
                  </div>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">📊 Estadísticas</h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-purple-600">5</div>
                        <div className="text-sm text-gray-600">Eventos Favoritos</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-pink-600">2</div>
                        <div className="text-sm text-gray-600">Eventos Creados</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">12</div>
                        <div className="text-sm text-gray-600">Eventos Asistidos</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => navigate('/')}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                  >
                    <Home className="h-5 w-5" />
                    Ir al Home
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <LogOut className="h-5 w-5" />
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="h-full bg-gradient-to-br from-purple-100/20 to-pink-100/20 p-4">
            <div className="h-full rounded-xl overflow-hidden shadow-lg">
              <MapView />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-purple-600 via-pink-500 to-blue-600">
      {/* Header con glassmorphism */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">🎌 EventRadar</h1>
            <span className="hidden md:block text-white/70 text-sm">Dashboard</span>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Info usuario en desktop */}
            <div className="hidden md:flex items-center gap-3 bg-white/10 rounded-full px-4 py-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {(profile?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="text-white">
                <div className="text-sm font-medium">
                  {profile?.full_name?.split(' ')[0] || 'Usuario'}
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 hover:bg-white/10 rounded-lg md:hidden text-white"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Desktop con glassmorphism */}
        <nav className="hidden md:flex flex-col w-64 bg-white/10 backdrop-blur-md border-r border-white/20">
          <div className="p-4">
            <div className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                      activeTab === tab.id
                        ? 'bg-white/20 text-white border border-white/30 shadow-lg'
                        : 'hover:bg-white/10 text-white/80 hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Mobile Menu con glassmorphism */}
        {menuOpen && (
          <nav className="md:hidden absolute top-16 left-0 right-0 bg-white/10 backdrop-blur-md border-b border-white/20 shadow-lg z-10">
            <div className="p-4">
              <div className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                        activeTab === tab.id
                          ? 'bg-white/20 text-white border border-white/30'
                          : 'hover:bg-white/10 text-white/80'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          {renderContent()}
        </main>
      </div>

      {/* Bottom Navigation - Mobile con glassmorphism */}
      <nav className="md:hidden bg-white/10 backdrop-blur-md border-t border-white/20">
        <div className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center py-3 px-1 transition-colors ${
                  activeTab === tab.id ? 'text-white' : 'text-white/60'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs mt-1">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default DashboardPage;