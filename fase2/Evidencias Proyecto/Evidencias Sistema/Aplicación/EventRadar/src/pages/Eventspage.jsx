import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Search, Filter, Calendar, MapPin, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEvents, useCategories } from '@/api/hooks/useEvents';
import { useEventStore } from '@/store/eventStore';
import { toast } from '@/components/ui/use-toast';

const EventsPage = () => {
  const { filters, setFilters } = useEventStore();
  const { data: events = [], isLoading, error } = useEvents(filters);
  const { data: categoriesData = [] } = useCategories();
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  const categories = [
    { value: '', label: 'Todas las categorías' },
    ...categoriesData.map(cat => ({
      value: cat.id,
      label: cat.name
    }))
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters({ search: searchTerm });
  };

  const handleCategoryFilter = (category) => {
    setFilters({ category });
  };

  const handleJoinEvent = (eventId) => {
    toast({
      title: '🚧 Esta funcionalidad no está implementada aún—¡pero no te preocupes! Puedes solicitarla en tu próximo prompt! 🚀',
    });
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Error al cargar eventos</h2>
          <p className="text-white/70">Por favor, intenta de nuevo más tarde.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Eventos - eventradar</title>
        <meta name="description" content="Explora todos los eventos disponibles en eventradar. Encuentra experiencias únicas cerca de ti." />
      </Helmet>

      <div className="min-h-screen py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 gradient-text">
              Descubre Eventos
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Encuentra experiencias increíbles y conecta con tu comunidad
            </p>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-effect rounded-2xl p-6 mb-8"
          >
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Buscar eventos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <Button type="submit" className="btn-primary px-8">
                Buscar
              </Button>
            </form>

            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => handleCategoryFilter(category.value)}
                  className={`px-4 py-2 rounded-full text-sm transition-all ${
                    filters.category === category.value
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 text-white/80 hover:bg-white/20'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Events Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="event-card rounded-2xl p-6 animate-pulse">
                  <div className="h-48 bg-white/10 rounded-lg mb-4"></div>
                  <div className="h-6 bg-white/10 rounded mb-2"></div>
                  <div className="h-4 bg-white/10 rounded mb-4"></div>
                  <div className="h-10 bg-white/10 rounded"></div>
                </div>
              ))}
            </div>
          ) : events.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Calendar className="h-24 w-24 text-white/30 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-white mb-4">
                No se encontraron eventos
              </h3>
              <p className="text-white/70 mb-8">
                Intenta ajustar tus filtros o crear un nuevo evento
              </p>
              <Button asChild className="btn-primary">
                <a href="/create-event">Crear Evento</a>
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {events.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="event-card rounded-2xl overflow-hidden"
                >
                  <img 
                    className="w-full h-48 object-cover"
                    alt={`Evento ${event.title}`}
                   src="https://images.unsplash.com/photo-1691257790470-b5e4e80ca59f" />
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-blue-400 uppercase tracking-wide">
                        {event.event_categories?.name || 'Evento'}
                      </span>
                      <span className="text-white/60 text-sm">
                        {new Date(event.date).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-white mb-2 line-clamp-1">
                      {event.title}
                    </h3>
                    
                    <p className="text-white/70 text-sm mb-4 line-clamp-2">
                      {event.description}
                    </p>
                    
                    <div className="flex items-center text-white/60 text-sm mb-4 space-y-1">
                      <div className="flex items-center mr-4">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{event.capacity} personas</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-blue-400">
                        {event.price === 0 ? 'Gratis' : `$${event.price}`}
                      </span>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleJoinEvent(event.id)}
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          Unirse
                        </Button>
                        <Button size="sm" asChild className="btn-primary">
                          <a href={`/events/${event.id}`}>Ver Más</a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default EventsPage;