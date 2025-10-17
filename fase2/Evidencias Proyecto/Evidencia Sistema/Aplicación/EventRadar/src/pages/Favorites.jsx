// src/pages/Favorites.jsx
import React from 'react';
import { Heart, MapPin, Calendar, ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../components/ui/button';
import FavoriteButton from '../components/FavoriteButton';

const Favorites = () => {
  const { user } = useAuth();

  const { data: favorites = [], isLoading, error } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          id,
          created_at,
          events:event_id (
            id,
            title,
            description,
            date,
            time,
            location,
            category_id,
            price,
            image_url,
            latitude,
            longitude,
            event_categories(name)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map(fav => fav.events).filter(Boolean);
    },
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-blue-600 flex items-center justify-center">
        <Helmet>
          <title>Favoritos - EventRadar</title>
        </Helmet>
        <div className="text-center text-white p-8">
          <Heart className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-bold mb-4">Inicia sesión para ver tus favoritos</h2>
          <Button asChild className="bg-white text-purple-600 hover:bg-white/90">
            <Link to="/login">Iniciar Sesión</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-blue-600 flex items-center justify-center">
        <Helmet>
          <title>Cargando Favoritos - EventRadar</title>
        </Helmet>
        <div className="text-center text-white">
          <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin" />
          <p className="text-lg">Cargando tus eventos favoritos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-blue-600">
      <Helmet>
        <title>Mis Favoritos - EventRadar</title>
      </Helmet>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            asChild
            variant="ghost"
            className="text-white hover:bg-white/20 mb-6"
          >
            <Link to="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Dashboard
            </Link>
          </Button>
          
          <h1 className="text-4xl font-bold text-white mb-2">
            <Heart className="inline-block w-10 h-10 text-red-300 mr-3" />
            Mis Eventos Favoritos
          </h1>
          <p className="text-white/80 text-lg">
            {favorites.length === 0 
              ? 'Aún no tienes eventos favoritos' 
              : `Tienes ${favorites.length} evento${favorites.length === 1 ? '' : 's'} favorito${favorites.length === 1 ? '' : 's'}`
            }
          </p>
        </motion.div>

        {favorites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center py-16"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12 max-w-md mx-auto">
              <Heart className="w-20 h-20 text-white/50 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-4">
                Aún no tienes favoritos
              </h2>
              <p className="text-white/80 mb-8 leading-relaxed">
                Explora el mapa y descubre eventos increíbles. 
                Usa el botón ❤️ para guardar los que más te gusten.
              </p>
              <Button asChild className="bg-white text-purple-600 hover:bg-white/90">
                <Link to="/dashboard">
                  <MapPin className="w-4 h-4 mr-2" />
                  Explorar Eventos
                </Link>
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {favorites.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden hover:bg-white/20 transition-all duration-300 border border-white/20"
              >
                {event.image_url && (
                  <div className="h-48 bg-cover bg-center" 
                       style={{ backgroundImage: `url(${event.image_url})` }}>
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                      {event.title}
                    </h3>
                    <FavoriteButton eventId={event.id} initialFavorite={true} />
                  </div>
                  
                  <p className="text-white/80 mb-4 line-clamp-3 leading-relaxed">
                    {event.description}
                  </p>
                  
                  <div className="space-y-3 text-sm text-white/70 mb-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span>
                        {new Date(event.date).toLocaleDateString('es-CL', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    
                    {event.time && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span>{event.time}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Button asChild variant="secondary" size="sm">
                      <Link to={`/events/${event.id}`}>
                        Ver Detalles
                      </Link>
                    </Button>
                    
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-300">
                        {event.price === 0 ? 'Gratis' : `$${event.price?.toLocaleString()}`}
                      </div>
                      {event.event_categories?.name && (
                        <div className="text-xs text-white/60 capitalize">
                          {event.event_categories.name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Favorites;