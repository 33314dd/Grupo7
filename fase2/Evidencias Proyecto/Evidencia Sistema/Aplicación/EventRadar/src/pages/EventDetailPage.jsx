import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Calendar, MapPin, Users, Clock, ArrowLeft, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEvent, useJoinEvent, useLeaveEvent } from '@/api/hooks/useEvents';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

const EventDetailPage = () => {
  const { id } = useParams();
  const { data: event, isLoading, error } = useEvent(id);
  const { user } = useAuth();
  const joinEventMutation = useJoinEvent();
  const leaveEventMutation = useLeaveEvent();

  const handleJoinEvent = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'Debes iniciar sesión para unirte a eventos',
        variant: 'destructive'
      });
      return;
    }

    try {
      await joinEventMutation.mutateAsync({ eventId: id, userId: user.id });
      toast({
        title: '¡Te has unido al evento!',
        description: 'Recibirás notificaciones sobre este evento',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo unir al evento. Inténtalo de nuevo.',
        variant: 'destructive'
      });
    }
  };

  const handleLeaveEvent = async () => {
    if (!user) return;
    
    try {
      await leaveEventMutation.mutateAsync({ eventId: id, userId: user.id });
      toast({
        title: 'Has salido del evento',
        description: 'Ya no recibirás notificaciones sobre este evento',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo salir del evento. Inténtalo de nuevo.',
        variant: 'destructive'
      });
    }
  };

  const handleShareEvent = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Enlace copiado',
        description: 'El enlace del evento se ha copiado al portapapeles',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Evento no encontrado</h2>
          <p className="text-white/70 mb-8">El evento que buscas no existe o ha sido eliminado.</p>
          <Button asChild className="btn-primary">
            <Link to="/events">Volver a Eventos</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{event.title} - eventradar</title>
        <meta name="description" content={event.description} />
      </Helmet>

      <div className="min-h-screen py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Button variant="ghost" asChild className="text-white/80 hover:text-white">
              <Link to="/events">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Eventos
              </Link>
            </Button>
          </motion.div>

          {/* Event Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-effect rounded-3xl overflow-hidden mb-8"
          >
            <img 
              className="w-full h-64 md:h-96 object-cover"
              alt={`Evento ${event.title}`}
             src="https://images.unsplash.com/photo-1664303900631-5a5eaad999ee" />
            
            <div className="p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                  <span className="text-sm font-semibold text-blue-400 uppercase tracking-wide">
                    {event.category}
                  </span>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mt-2 mb-4">
                    {event.title}
                  </h1>
                </div>
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={handleShareEvent}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartir
                  </Button>
                  <Button onClick={handleJoinEvent} className="btn-primary">
                    Unirse al Evento
                  </Button>
                </div>
              </div>

              {/* Event Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-white/60 text-sm">Fecha</p>
                    <p className="text-white font-semibold">
                      {new Date(event.date).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-white/60 text-sm">Hora</p>
                    <p className="text-white font-semibold">{event.time}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-white/60 text-sm">Ubicación</p>
                    <p className="text-white font-semibold">{event.location}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-white/60 text-sm">Capacidad</p>
                    <p className="text-white font-semibold">{event.capacity} personas</p>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="mb-8">
                <span className="text-3xl font-bold text-blue-400">
                  {event.price === 0 ? 'Gratis' : `$${event.price}`}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Event Description */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-effect rounded-2xl p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-4">Descripción del Evento</h2>
            <p className="text-white/80 leading-relaxed whitespace-pre-wrap">
              {event.description}
            </p>
          </motion.div>

          {/* Organizer Info */}
          {event.profiles && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-effect rounded-2xl p-8"
            >
              <h2 className="text-2xl font-bold text-white mb-4">Organizador</h2>
              <div className="flex items-center space-x-4">
                <img 
                  className="w-16 h-16 rounded-full object-cover"
                  alt={`Avatar de ${event.profiles.full_name}`}
                 src="https://images.unsplash.com/photo-1652841190565-b96e0acbae17" />
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {event.profiles.full_name}
                  </h3>
                  <p className="text-white/60">Organizador del evento</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default EventDetailPage;