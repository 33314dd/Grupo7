import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, User, Menu, X, LogOut, Home, Heart, Search, Filter, SortAsc } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import MapView from '../components/MapView';
import AdminEventForm from '../components/AdminEventForm';
import EventRadarLogo from '../components/EventRadarLogo';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('mapa');
  const [menuOpen, setMenuOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Estado simplificado
  const [events, setEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]); // Todos los eventos sin filtrar
  const [favoriteIds, setFavoriteIds] = useState(new Set()); // Solo IDs de favoritos
  const [loading, setLoading] = useState(true);
  
  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('priority'); // priority, date, category, region
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterRegion, setFilterRegion] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    if (!user) return;
    loadAllData();
  }, [user, refreshTrigger]);

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([
      loadEvents(),
      loadFavoriteIds()
    ]);
    setLoading(false);
  };

  const loadEvents = async () => {
    try {
      console.log('📡 Cargando eventos...');
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          event_categories(id, name, color, icon)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error cargando eventos:', error);
        return;
      }

      console.log('✅ Eventos cargados:', data?.length || 0);
      
      // Ordenar eventos por fecha de finalización (los que terminan primero)
      const sortedEvents = (data || []).map(event => {
        // Si no tiene end_date, asumimos duración de 3 horas por defecto
        const startDate = new Date(event.date);
        const endDate = event.end_date ? new Date(event.end_date) : new Date(startDate.getTime() + 3 * 60 * 60 * 1000);
        
        return {
          ...event,
          calculated_end_date: endDate,
          start_date: startDate
        };
      }).sort((a, b) => {
        // Ordenar por fecha de finalización ascendente (los que terminan primero)
        return a.calculated_end_date.getTime() - b.calculated_end_date.getTime();
      });

      console.log('✅ Eventos ordenados por fecha de finalización:', sortedEvents.length);
      setAllEvents(sortedEvents); // Guardar todos los eventos
      setEvents(sortedEvents); // Eventos filtrados (inicialmente todos)
    } catch (error) {
      console.error('❌ Error en loadEvents:', error);
    }
  };

  const loadFavoriteIds = async () => {
    try {
      console.log('💖 Cargando IDs de favoritos...');
      const { data, error } = await supabase
        .from('favorites')
        .select('event_id')
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Error cargando favoritos:', error);
        return;
      }

      const ids = new Set(data?.map(fav => fav.event_id) || []);
      console.log('✅ IDs de favoritos cargados:', Array.from(ids));
      setFavoriteIds(ids);
    } catch (error) {
      console.error('❌ Error en loadFavoriteIds:', error);
    }
  };

  // Aplicar filtros y búsqueda
  useEffect(() => {
    if (!allEvents.length) return;

    let filteredEvents = [...allEvents];

    // Aplicar búsqueda por texto
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filteredEvents = filteredEvents.filter(event =>
        event.title?.toLowerCase().includes(term) ||
        event.description?.toLowerCase().includes(term) ||
        event.location?.toLowerCase().includes(term) ||
        event.event_categories?.name?.toLowerCase().includes(term)
      );
    }

    // Aplicar filtro por categoría
    if (filterCategory !== 'all') {
      filteredEvents = filteredEvents.filter(event =>
        event.event_categories?.name?.toLowerCase() === filterCategory.toLowerCase()
      );
    }

    // Aplicar filtro por región
    if (filterRegion !== 'all') {
      filteredEvents = filteredEvents.filter(event => {
        const location = event.location?.toLowerCase() || '';
        return location.includes(filterRegion.toLowerCase());
      });
    }

    // Aplicar ordenamiento
    switch (sortBy) {
      case 'date':
        filteredEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case 'category':
        filteredEvents.sort((a, b) => 
          (a.event_categories?.name || '').localeCompare(b.event_categories?.name || '')
        );
        break;
      case 'region':
        filteredEvents.sort((a, b) => (a.location || '').localeCompare(b.location || ''));
        break;
      case 'priority':
      default:
        // Ya están ordenados por prioridad
        break;
    }

    setEvents(filteredEvents);
  }, [allEvents, searchTerm, sortBy, filterCategory, filterRegion]);

  // Obtener categorías únicas
  const getUniqueCategories = () => {
    const categories = allEvents
      .map(event => event.event_categories?.name)
      .filter(Boolean)
      .filter((value, index, self) => self.indexOf(value) === index);
    return categories;
  };

  // Obtener regiones únicas
  const getUniqueRegions = () => {
    const regions = allEvents
      .map(event => {
        const location = event.location || '';
        // Extraer ciudad/región principal
        if (location.toLowerCase().includes('santiago')) return 'Santiago';
        if (location.toLowerCase().includes('valparaíso') || location.toLowerCase().includes('valparaiso')) return 'Valparaíso';
        if (location.toLowerCase().includes('concepción') || location.toLowerCase().includes('concepcion')) return 'Concepción';
        if (location.toLowerCase().includes('viña') || location.toLowerCase().includes('vina')) return 'Viña del Mar';
        return 'Otra región';
      })
      .filter((value, index, self) => self.indexOf(value) === index);
    return regions;
  };

  // Función simple para toggle de favoritos
  const toggleFavorite = async (eventId) => {
    const isFavorite = favoriteIds.has(eventId);
    console.log('🔄 Toggle favorito:', eventId, isFavorite ? 'REMOVE' : 'ADD');

    // Actualizar UI inmediatamente
    const newFavoriteIds = new Set(favoriteIds);
    if (isFavorite) {
      newFavoriteIds.delete(eventId);
    } else {
      newFavoriteIds.add(eventId);
    }
    setFavoriteIds(newFavoriteIds);

    try {
      if (isFavorite) {
        // Remover
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('event_id', eventId);
        
        if (error) {
          console.error('❌ Error removiendo favorito:', error);
          // Revertir cambio
          setFavoriteIds(favoriteIds);
        } else {
          console.log('✅ Favorito removido de BD');
        }
      } else {
        // Agregar
        const { error } = await supabase
          .from('favorites')
          .insert([{ user_id: user.id, event_id: eventId }]);
        
        if (error) {
          console.error('❌ Error agregando favorito:', error);
          // Revertir cambio
          setFavoriteIds(favoriteIds);
        } else {
          console.log('✅ Favorito agregado a BD');
        }
      }
    } catch (error) {
      console.error('❌ Error en toggleFavorite:', error);
      // Revertir cambio
      setFavoriteIds(favoriteIds);
    }
  };

  // Obtener eventos favoritos
  const getFavoriteEvents = () => {
    return events.filter(event => favoriteIds.has(event.id));
  };

  // Calcular tiempo restante y estado del evento
  const getEventTimeInfo = (event) => {
    const now = new Date();
    const startDate = event.start_date || new Date(event.date);
    const endDate = event.calculated_end_date;
    
    if (now < startDate) {
      // Evento futuro
      const timeToStart = startDate.getTime() - now.getTime();
      return {
        status: 'upcoming',
        statusText: 'Próximamente',
        timeInfo: `Comienza en ${formatTimeRemaining(timeToStart)}`,
        statusColor: 'bg-blue-100 text-blue-800',
        urgency: 'normal'
      };
    } else if (now >= startDate && now < endDate) {
      // Evento en progreso
      const timeToEnd = endDate.getTime() - now.getTime();
      const isUrgent = timeToEnd < 2 * 60 * 60 * 1000; // Menos de 2 horas
      return {
        status: 'ongoing',
        statusText: '🔴 En Vivo',
        timeInfo: `Termina en ${formatTimeRemaining(timeToEnd)}`,
        statusColor: isUrgent ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800',
        urgency: isUrgent ? 'urgent' : 'normal'
      };
    } else {
      // Evento terminado
      return {
        status: 'ended',
        statusText: 'Finalizado',
        timeInfo: 'Evento terminado',
        statusColor: 'bg-gray-100 text-gray-600',
        urgency: 'ended'
      };
    }
  };

  // Formatear tiempo restante
  const formatTimeRemaining = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m`;
    return `${seconds}s`;
  };

  // Componente de temporizador en tiempo real
  const EventTimer = ({ event }) => {
    const [timeInfo, setTimeInfo] = useState(getEventTimeInfo(event));

    useEffect(() => {
      const interval = setInterval(() => {
        setTimeInfo(getEventTimeInfo(event));
      }, 1000); // Actualizar cada segundo

      return () => clearInterval(interval);
    }, [event]);

    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span 
            className={`text-xs px-2 py-1 rounded-full font-medium ${timeInfo.statusColor}`}
          >
            {timeInfo.statusText}
          </span>
          {timeInfo.urgency === 'urgent' && (
            <span className="text-xs animate-pulse">⚠️ ¡Termina pronto!</span>
          )}
        </div>
        <div className={`text-sm font-medium ${
          timeInfo.urgency === 'urgent' ? 'text-red-600 animate-pulse' : 
          timeInfo.urgency === 'ended' ? 'text-gray-500' : 'text-purple-600'
        }`}>
          ⏰ {timeInfo.timeInfo}
        </div>
      </div>
    );
  };

  // Tabs
  const tabs = [
    { id: 'mapa', label: 'Mapa', icon: MapPin },
    { id: 'eventos', label: 'Eventos', icon: Calendar },
    { id: 'favoritos', label: 'Favoritos', icon: Heart },
    { id: 'perfil', label: 'Perfil', icon: User },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleEventCreated = (newEvent) => {
    console.log('✅ Nuevo evento creado:', newEvent);
    setRefreshTrigger(prev => prev + 1);
  };

  // Renderizar botón de favorito simple
  const renderFavoriteButton = (eventId) => {
    const isFavorite = favoriteIds.has(eventId);
    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleFavorite(eventId);
        }}
        className={`p-2 rounded-full transition-all duration-200 transform hover:scale-110 ${
          isFavorite 
            ? 'bg-red-100 text-red-600 hover:bg-red-200' 
            : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-red-400'
        } shadow-sm hover:shadow-md`}
        title={isFavorite ? 'Quitar de favoritos ❤️' : 'Agregar a favoritos 🤍'}
      >
        <Heart 
          className={`w-5 h-5 transition-all duration-200 ${
            isFavorite ? 'fill-current text-red-600' : 'text-gray-400'
          }`} 
        />
      </button>
    );
  };

  // Renderizar lista de eventos
  const renderEventCard = (event, showFavoriteButton = true) => (
    <div key={event.id} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-start gap-2 mb-2">
            {event.event_categories && (
              <span 
                className="text-xs px-2 py-1 rounded-full text-white font-medium"
                style={{ backgroundColor: event.event_categories.color }}
              >
                {event.event_categories.icon} {event.event_categories.name}
              </span>
            )}
          </div>
          <h3 className="font-bold text-lg text-gray-800 mb-2">
            {event.title}
          </h3>
          
          {/* Temporizador del evento */}
          <EventTimer event={event} />
          
          <p className="text-purple-600 font-medium text-sm mb-1 mt-2">
            📅 {new Date(event.date).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })} a las {new Date(event.date).toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
          <p className="text-gray-600 text-sm mb-1">
            📍 {event.location}
          </p>
          {event.price > 0 && (
            <p className="text-green-600 font-semibold text-sm mb-1">
              💰 ${event.price}
            </p>
          )}
          <p className="text-gray-600 text-sm">
            {event.description}
          </p>
        </div>
        {showFavoriteButton && renderFavoriteButton(event.id)}
      </div>
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-white text-lg">Cargando...</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'mapa':
        return (
          <div className="h-full bg-gradient-to-br from-purple-100/20 to-pink-100/20 p-4 relative">
            <div className="h-full rounded-xl overflow-hidden shadow-lg">
              <MapView 
                key={refreshTrigger}
                favoriteIds={favoriteIds}
                onFavoriteToggle={toggleFavorite}
              />
            </div>
            <AdminEventForm onEventCreated={handleEventCreated} />
          </div>
        );

      case 'eventos':
        return (
          <div className="h-full overflow-y-auto">
            <div className="p-6 bg-gradient-to-br from-purple-50/50 to-pink-50/50">
              <div className="max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                    🎉 Eventos ({events.length}/{allEvents.length})
                  </h2>
                  
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                  >
                    <Filter className="w-4 h-4" />
                    {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
                  </button>
                </div>

                {/* Buscador Principal */}
                <div className="relative mb-6">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <Search className="h-5 w-5 text-gray-600" />
                  </div>
                  <input
                    type="text"
                    placeholder="¿Qué evento quieres buscar en el Radar? 🎯"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white backdrop-blur-sm text-gray-900 placeholder-gray-500 shadow-sm"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>

                {/* Panel de Filtros */}
                {showFilters && (
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 mb-6 border border-white/50 shadow-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      {/* Ordenar por */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <SortAsc className="w-4 h-4 inline mr-1" />
                          Ordenar por
                        </label>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white text-gray-900"
                        >
                          <option value="priority">⏰ Prioridad (Terminan pronto)</option>
                          <option value="date">📅 Fecha de inicio</option>
                          <option value="category">🏷️ Categoría</option>
                          <option value="region">📍 Región</option>
                        </select>
                      </div>

                      {/* Filtrar por Categoría */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          🏷️ Categoría
                        </label>
                        <select
                          value={filterCategory}
                          onChange={(e) => setFilterCategory(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white text-gray-900"
                        >
                          <option value="all">Todas las categorías</option>
                          {getUniqueCategories().map(category => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </div>

                      {/* Filtrar por Región */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          📍 Región
                        </label>
                        <select
                          value={filterRegion}
                          onChange={(e) => setFilterRegion(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white text-gray-900"
                        >
                          <option value="all">Todas las regiones</option>
                          {getUniqueRegions().map(region => (
                            <option key={region} value={region}>{region}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Botón para limpiar filtros */}
                    <div className="mt-4 flex justify-center">
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setSortBy('priority');
                          setFilterCategory('all');
                          setFilterRegion('all');
                        }}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        🗑️ Limpiar todos los filtros
                      </button>
                    </div>
                  </div>
                )}

                {/* Información de filtros activos */}
                {(searchTerm || filterCategory !== 'all' || filterRegion !== 'all' || sortBy !== 'priority') && (
                  <div className="mb-4 p-3 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                    <p className="text-sm text-purple-700">
                      🔍 Filtros activos: 
                      {searchTerm && ` Búsqueda: "${searchTerm}"`}
                      {filterCategory !== 'all' && ` • Categoría: ${filterCategory}`}
                      {filterRegion !== 'all' && ` • Región: ${filterRegion}`}
                      {sortBy !== 'priority' && ` • Orden: ${sortBy}`}
                    </p>
                  </div>
                )}
                
                {events.length === 0 ? (
                  <div className="text-center py-12">
                    {allEvents.length === 0 ? (
                      <>
                        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          No hay eventos disponibles
                        </h3>
                        <p className="text-gray-600 mb-6">
                          Crea tu primer evento o explora eventos existentes
                        </p>
                        <button
                          onClick={() => setActiveTab('mapa')}
                          className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          Explorar en Mapa
                        </button>
                      </>
                    ) : (
                      <>
                        <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          No se encontraron eventos
                        </h3>
                        <p className="text-gray-600 mb-6">
                          Intenta cambiar los filtros o términos de búsqueda
                        </p>
                        <button
                          onClick={() => {
                            setSearchTerm('');
                            setSortBy('priority');
                            setFilterCategory('all');
                            setFilterRegion('all');
                          }}
                          className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          🗑️ Limpiar Filtros
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {events.map((event) => renderEventCard(event, true))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'favoritos':
        const favoriteEvents = getFavoriteEvents();
        return (
          <div className="h-full overflow-y-auto">
            <div className="p-6 bg-gradient-to-br from-purple-50/50 to-pink-50/50">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  ❤️ Mis Favoritos ({favoriteEvents.length})
                </h2>
                
                <p className="text-sm text-gray-600 mb-4">
                  📊 Favoritos activos: {favoriteIds.size} | Eventos encontrados: {favoriteEvents.length}
                </p>
                
                {favoriteEvents.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No tienes favoritos aún
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Marca eventos como favoritos para verlos aquí
                    </p>
                    <button
                      onClick={() => setActiveTab('eventos')}
                      className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Ver Todos los Eventos
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {favoriteEvents.map((event) => renderEventCard(event, true))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'perfil':
        return (
          <div className="h-full overflow-y-auto">
            <div className="p-6 bg-gradient-to-br from-purple-50/50 to-pink-50/50">
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
                      <p className="text-sm text-purple-600 mt-1">
                        Miembro desde {new Date().getFullYear()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">📊 Estadísticas</h4>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-purple-600">
                            {favoriteIds.size}
                          </div>
                          <div className="text-sm text-gray-600">Eventos Favoritos</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-pink-600">
                            {events?.filter(e => e.user_id === user?.id).length || 0}
                          </div>
                          <div className="text-sm text-gray-600">Eventos Creados</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-blue-600">
                            {events?.length || 0}
                          </div>
                          <div className="text-sm text-gray-600">Total Eventos</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => {
                        console.log('🔍 Estado actual:', {
                          favoriteIds: Array.from(favoriteIds),
                          events: events.length,
                          favoriteEvents: getFavoriteEvents().length
                        });
                        alert('Revisa la consola para ver el estado actual');
                      }}
                      className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                    >
                      🧪 Debug Estado
                    </button>
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
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <EventRadarLogo size={48} showText={true} variant="white" />
            <span className="hidden md:block text-white/70 text-sm">Dashboard Simplificado</span>
          </div>
          
          <div className="flex items-center gap-4">
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
        {/* Sidebar */}
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
                    {tab.id === 'favoritos' && (
                      <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {favoriteIds.size}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Mobile Menu */}
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
                      {tab.id === 'favoritos' && (
                        <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          {favoriteIds.size}
                        </span>
                      )}
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

      {/* Bottom Navigation - Mobile */}
      <nav className="md:hidden bg-white/10 backdrop-blur-md border-t border-white/20">
        <div className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center py-3 px-1 transition-colors relative ${
                  activeTab === tab.id ? 'text-white' : 'text-white/60'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs mt-1">{tab.label}</span>
                {tab.id === 'favoritos' && favoriteIds.size > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                    {favoriteIds.size}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default DashboardPage;