import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Heart, Navigation, MapPin, Car, Edit2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import EditEventModal from './EditEventModal';
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
  'anime': { color: '#9333ea', emoji: '🎌', name: 'Anime' },
  'musica': { color: '#ec4899', emoji: '🎵', name: 'Música' },
  'gastronomia': { color: '#f59e0b', emoji: '🍕', name: 'Gastronomía' },
  'deportes': { color: '#10b981', emoji: '⚽', name: 'Deportes' },
  'arte': { color: '#8b5cf6', emoji: '🎨', name: 'Arte' },
  'tecnologia': { color: '#06b6d4', emoji: '💻', name: 'Tecnología' },
  'otros': { color: '#6b7280', emoji: '🎪', name: 'Otros' }
};

// Componente para las opciones de navegación
const NavigationModal = ({ isOpen, onClose, eventLocation, eventTitle, eventLatLng }) => {
  if (!isOpen) return null;

  const handleNavigation = (app) => {
    const { lat, lng } = eventLatLng;
    let url = '';

    switch (app) {
      case 'waze':
        url = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
        break;
      case 'google':
        url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
        break;
      case 'uber':
        url = `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[latitude]=${lat}&dropoff[longitude]=${lng}`;
        break;
      default:
        return;
    }

    window.open(url, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10000] flex items-end justify-center">
      <div className="bg-white rounded-t-3xl w-full max-w-md mx-4 mb-0 animate-slide-up">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">¿Cómo llegar?</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              ✕
            </button>
          </div>
          <p className="text-gray-600 text-sm mt-1">{eventTitle}</p>
          <p className="text-gray-500 text-xs mt-1">📍 {eventLocation}</p>
        </div>

        {/* Opciones de navegación */}
        <div className="p-6 space-y-4">
          <button
            onClick={() => handleNavigation('waze')}
            className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-2xl">🚗</span>
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-900">Waze</div>
                <div className="text-sm text-gray-600">Navegación con tráfico en tiempo real</div>
              </div>
            </div>
            <div className="text-gray-400">→</div>
          </button>

          <button
            onClick={() => handleNavigation('google')}
            className="w-full flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-2xl">🗺️</span>
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-900">Google Maps</div>
                <div className="text-sm text-gray-600">Rutas y transporte público</div>
              </div>
            </div>
            <div className="text-gray-400">→</div>
          </button>

          <button
            onClick={() => handleNavigation('uber')}
            className="w-full flex items-center justify-between p-4 bg-black/5 hover:bg-black/10 rounded-xl transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
                <span className="text-white text-2xl">🚖</span>
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-900">Uber</div>
                <div className="text-sm text-gray-600">Solicitar viaje directamente</div>
              </div>
            </div>
            <div className="text-gray-400">→</div>
          </button>
        </div>

        {/* Botón cancelar */}
        <div className="p-6 pt-0">
          <button
            onClick={onClose}
            className="w-full p-3 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

const MapView = ({ favoriteIds = new Set(), onFavoriteToggle = () => {} }) => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userPosition, setUserPosition] = useState(null);
  const [mapCenter, setMapCenter] = useState([-33.0194, -71.5519]);
  const [navigationModal, setNavigationModal] = useState({
    isOpen: false,
    eventData: null
  });
  const [editModal, setEditModal] = useState({
    isOpen: false,
    event: null
  });

  // Debug: Verificar props
  console.log('🗺️ MapView props:', {
    favoriteIds: Array.from(favoriteIds),
    hasFavoriteToggle: typeof onFavoriteToggle === 'function'
  });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isFilterMinimized, setIsFilterMinimized] = useState(false);
  const [isInfoMinimized, setIsInfoMinimized] = useState(false);

  console.log('🗺️ MapView render:', { user: !!user, eventsCount: events.length });

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

  const handleEventUpdated = (updatedEvent) => {
    console.log('🔄 Evento actualizado, recargando lista...', updatedEvent);
    loadEvents(); // Recargar eventos
  };

  useEffect(() => {
    if (!user) return;

    loadEvents();

    // Obtener ubicación del usuario con mejor manejo de errores
    let watchId;
    
    if (navigator.geolocation) {
      console.log('🌍 Solicitando ubicación del usuario...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log('✅ Ubicación obtenida:', { latitude, longitude });
          setUserPosition([latitude, longitude]);
          setMapCenter([latitude, longitude]);
        },
        (error) => {
          console.warn('⚠️ Error obteniendo ubicación:', error);
          console.log('📍 Usando ubicación por defecto (Chile)');
          // Usar ubicación por defecto si no se puede obtener la real
          setMapCenter([-33.0194, -71.5519]);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
      
      // También obtener ubicación en tiempo real
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log('🔄 Ubicación actualizada:', { latitude, longitude });
          setUserPosition([latitude, longitude]);
        },
        (error) => console.warn('⚠️ Error actualizando ubicación:', error),
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 30000
        }
      );
    }

    loadEvents();
    
    // Cleanup function
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [user]);

  // En MapView.jsx, agregar después del useEffect existente:
  useEffect(() => {
    if (!user) return;

    // Suscripción a cambios en tiempo real
    const subscription = supabase
      .channel('events-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'events' },
        (payload) => {
          console.log('🔄 Cambio en eventos:', payload);
          // Recargar eventos cuando hay cambios
          loadEvents();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
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
      {/* ✅ Filtros de categoría - móvil optimizado */}
      <div className={`absolute top-16 left-4 z-10 bg-black/70 backdrop-blur-sm rounded-xl p-3 transition-all duration-300 ${
        isFilterMinimized ? 'max-w-fit' : 'max-w-xs'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-bold text-sm">
            🎯 {isFilterMinimized ? 'Filtros' : 'Filtrar Eventos'}
          </h3>
          <button
            onClick={() => setIsFilterMinimized(!isFilterMinimized)}
            className="text-white/70 hover:text-white text-xs px-2 py-1 hover:bg-white/20 rounded transition-colors"
            title={isFilterMinimized ? "Expandir filtros" : "Minimizar filtros"}
          >
            {isFilterMinimized ? '□' : '─'}
          </button>
        </div>
        {!isFilterMinimized && (
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
        )}
        {isFilterMinimized && (
          <div className="text-white/70 text-xs text-center">
            {selectedCategory === 'all' ? 'Todos' : eventCategories[selectedCategory]?.name}
          </div>
        )}
      </div>

      {/* ✅ Contador de eventos (móvil-friendly) */}
      <div className="absolute top-4 right-4 z-10 bg-black/70 backdrop-blur-sm rounded-full px-3 py-2">
        <div className="text-white text-xs font-medium">
          📍 {filteredEvents.length} eventos
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
              <Popup className="custom-popup" closeButton={true}>
                <div className="bg-white rounded-xl shadow-lg overflow-hidden w-[280px]">
                  {/* Header con título y botón de favorito */}
                  <div className="flex items-start justify-between p-3 pb-1">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        {category.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base text-gray-900 leading-tight">
                          {evento.title}
                        </h3>
                      </div>
                    </div>
                    
                    {/* Botones de acción: editar, navegación y favorito */}
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      {/* Botón de editar */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setEditModal({
                            isOpen: true,
                            event: evento
                          });
                        }}
                        className="w-8 h-8 rounded-full bg-amber-50 hover:bg-amber-100 flex items-center justify-center transition-all duration-200 transform hover:scale-110"
                        title="Editar evento"
                      >
                        <Edit2 className="w-4 h-4 text-amber-600" />
                      </button>

                      {/* Botón de navegación */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setNavigationModal({
                            isOpen: true,
                            eventData: {
                              title: evento.title,
                              location: evento.location,
                              latLng: {
                                lat: evento.latitude || -33.0194,
                                lng: evento.longitude || -71.5519
                              }
                            }
                          });
                        }}
                        className="w-8 h-8 rounded-full bg-blue-50 hover:bg-blue-100 flex items-center justify-center transition-all duration-200 transform hover:scale-110"
                        title="¿Cómo llegar?"
                      >
                        <Navigation className="w-4 h-4 text-blue-600" />
                      </button>

                      {/* Botón de favorito estilo corazón rojo */}
                      {(() => {
                        const isFavorite = favoriteIds.has(evento.id);
                        return (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('💖 Map: Toggle favorite', evento.id, isFavorite ? 'REMOVE' : 'ADD');
                              onFavoriteToggle(evento.id);
                            }}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110 ${
                              isFavorite 
                                ? 'bg-red-50 shadow-sm' 
                                : 'bg-gray-50 hover:bg-red-50'
                            }`}
                            title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                          >
                            <Heart 
                              className={`w-4 h-4 transition-all duration-200 ${
                                isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-400'
                              }`} 
                            />
                          </button>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Badge de categoría */}
                  <div className="px-3 pb-2">
                    <span 
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: category.color }}
                    >
                      {category.name}
                    </span>
                  </div>
                  
                  {/* Información del evento */}
                  <div className="px-3 pb-3 space-y-2">
                    {/* Fecha */}
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="text-sm">📅</div>
                      <span className="text-sm">
                        {new Date(evento.date).toLocaleDateString('es-CL', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    
                    {/* Hora */}
                    {evento.time && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <div className="text-sm">🕐</div>
                        <span className="text-sm">{evento.time}</span>
                      </div>
                    )}
                    
                    {/* Ubicación */}
                    <div className="flex items-start gap-2 text-gray-600">
                      <div className="text-sm mt-0.5">📍</div>
                      <div className="flex-1">
                        <span className="text-sm">
                          {evento.location || 'Ubicación por confirmar'}
                        </span>
                        {evento.price !== undefined && (
                          <div className="mt-0.5 text-xs text-gray-500">0</div>
                        )}
                      </div>
                    </div>
                    
                    {/* Descripción */}
                    {evento.description && (
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <p className="text-gray-500 text-xs leading-relaxed">
                          {evento.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Modal de navegación */}
      <NavigationModal
        isOpen={navigationModal.isOpen}
        onClose={() => setNavigationModal({ isOpen: false, eventData: null })}
        eventLocation={navigationModal.eventData?.location}
        eventTitle={navigationModal.eventData?.title}
        eventLatLng={navigationModal.eventData?.latLng}
      />

      {/* Modal de edición de evento */}
      <EditEventModal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, event: null })}
        event={editModal.event}
        onEventUpdated={handleEventUpdated}
      />
    </div>
  );
};

export default MapView;