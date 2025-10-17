import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import 'leaflet/dist/leaflet.css';

// ✅ Crear íconos personalizados por categoría
const createCustomIcon = (color, emoji) => {
  return L.divIcon({
    html: `
      <div style="
        background: linear-gradient(45deg, ${color}, ${color}aa);
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
      ">
        ${emoji}
      </div>
    `,
    className: 'custom-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });
};

// ✅ Categorías de eventos con colores
const eventCategories = {
  'otaku': { color: '#9333ea', emoji: '🎌', name: 'Otaku/Anime' },
  'musica': { color: '#ec4899', emoji: '🎵', name: 'Música' },
  'gastronomia': { color: '#f59e0b', emoji: '🍕', name: 'Gastronomía' },
  'deportes': { color: '#10b981', emoji: '⚽', name: 'Deportes' },
  'arte': { color: '#8b5cf6', emoji: '🎨', name: 'Arte' },
  'tecnologia': { color: '#06b6d4', emoji: '💻', name: 'Tecnología' },
  'otros': { color: '#6b7280', emoji: '🎪', name: 'Otros' }
};

const MapView = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userPosition, setUserPosition] = useState(null);
  const [mapCenter, setMapCenter] = useState([-33.0194, -71.5519]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  console.log('🗺️ MapView render:', { user: !!user, eventsCount: events.length });

  useEffect(() => {
    if (!user) return;

    const loadEvents = async () => {
      try {
        console.log('📡 Cargando eventos...');
        setLoading(true);

        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('❌ Error cargando eventos:', error);
          setEvents([]);
        } else {
          console.log('✅ Eventos cargados:', data?.length || 0);
          setEvents(data || []);
        }
      } catch (error) {
        console.error('❌ Error en loadEvents:', error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    // Obtener ubicación del usuario
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserPosition([latitude, longitude]);
          setMapCenter([latitude, longitude]);
        },
        (error) => console.warn('⚠️ Error obteniendo ubicación:', error)
      );
    }

    loadEvents();
  }, [user]);

  // ✅ Filtrar eventos por categoría
  const filteredEvents = events.filter(event => 
    selectedCategory === 'all' || event.category === selectedCategory
  );

  if (!user) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-purple-200/50 to-pink-200/50 rounded-xl border border-white/30">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">🔐</div>
          <h3 className="text-xl font-bold text-white mb-2">
            Usuario no autenticado
          </h3>
          <p className="text-white/70">Por favor, inicia sesión</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-xl border border-white/30">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white font-medium">Cargando eventos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      {/* ✅ Filtros de categoría */}
      <div className="absolute top-4 left-4 z-10 bg-black/70 backdrop-blur-sm rounded-xl p-4 max-w-xs">
        <h3 className="text-white font-bold text-sm mb-3">🎯 Filtrar Eventos</h3>
        <div className="space-y-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              selectedCategory === 'all' 
                ? 'bg-white text-black font-medium' 
                : 'text-white hover:bg-white/20'
            }`}
          >
            🌟 Todos ({events.length})
          </button>
          {Object.entries(eventCategories).map(([key, cat]) => {
            const count = events.filter(e => e.category === key).length;
            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                  selectedCategory === key 
                    ? 'bg-white text-black font-medium' 
                    : 'text-white hover:bg-white/20'
                }`}
              >
                <span>{cat.emoji} {cat.name}</span>
                <span className="text-xs opacity-75">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ✅ Info del usuario y estadísticas */}
      <div className="absolute top-4 right-4 z-10 bg-black/70 backdrop-blur-sm rounded-xl p-4">
        <div className="text-white text-sm">
          <div className="font-bold mb-2">¡Hola! 👋</div>
          <div className="space-y-1 text-xs">
            <div>📍 {filteredEvents.length} eventos mostrados</div>
            <div>🎌 {events.filter(e => e.category === 'otaku').length} eventos otaku</div>
            <div>🎵 {events.filter(e => e.category === 'musica').length} conciertos</div>
            <div>🍕 {events.filter(e => e.category === 'gastronomia').length} gastronómicos</div>
          </div>
        </div>
      </div>

      {/* ✅ Mapa con eventos coloridos */}
      <MapContainer
        center={mapCenter}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        className="z-0 rounded-xl"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* ✅ Marcador del usuario */}
        {userPosition && (
          <Marker 
            position={userPosition}
            icon={L.divIcon({
              html: `
                <div style="
                  background: radial-gradient(circle, #ef4444, #dc2626);
                  width: 20px;
                  height: 20px;
                  border-radius: 50%;
                  border: 3px solid white;
                  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.3);
                  animation: pulse 2s infinite;
                ">
                </div>
                <style>
                  @keyframes pulse {
                    0% { box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.3); }
                    50% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0.1); }
                    100% { box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.3); }
                  }
                </style>
              `,
              className: 'user-marker',
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            })}
          >
            <Popup>
              <div className="text-center p-2">
                <div className="text-lg mb-1">📍</div>
                <div className="font-bold text-sm">Tu ubicación</div>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* ✅ Marcadores de eventos con colores */}
        {filteredEvents.map((evento) => {
          const category = eventCategories[evento.category] || eventCategories.otros;
          const icon = createCustomIcon(category.color, category.emoji);
          
          return (
            <Marker 
              key={evento.id} 
              position={[evento.latitude || -33.0194, evento.longitude || -71.5519]}
              icon={icon}
            >
              <Popup className="custom-popup">
                <div className="p-3 min-w-[250px]">
                  <div className="flex items-start gap-3 mb-3">
                    <div 
                      className="text-2xl p-2 rounded-full"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      {category.emoji}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-800 mb-1">
                        {evento.title}
                      </h3>
                      <span 
                        className="inline-block px-2 py-1 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: category.color }}
                      >
                        {category.name}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <span>📅</span>
                      <span>{new Date(evento.date).toLocaleDateString('es-CL', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</span>
                    </div>
                    
                    {evento.time && (
                      <div className="flex items-center gap-2">
                        <span>🕐</span>
                        <span>{evento.time}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <span>📍</span>
                      <span>{evento.location || 'Ubicación por confirmar'}</span>
                    </div>
                    
                    {evento.price && (
                      <div className="flex items-center gap-2">
                        <span>💰</span>
                        <span className="font-semibold text-green-600">
                          {evento.price === 0 ? 'Gratis' : `$${evento.price.toLocaleString()}`}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-gray-700 mt-3 text-sm leading-relaxed">
                    {evento.description}
                  </p>
                  
                  {evento.website && (
                    <a 
                      href={evento.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-block mt-3 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
                    >
                      🔗 Más información
                    </a>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      {/* ✅ Leyenda mejorada */}
      <div className="absolute bottom-4 left-4 z-10 bg-black/70 backdrop-blur-sm rounded-xl p-3">
        <h4 className="text-white font-bold text-xs mb-2">📍 LEYENDA</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-white">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span>Tu ubicación</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-white">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span>Eventos disponibles</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;