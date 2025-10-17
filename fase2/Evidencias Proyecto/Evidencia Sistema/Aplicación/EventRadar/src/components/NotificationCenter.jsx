// src/components/NotificationCenter.jsx
import React, { useState, useEffect } from 'react';
import { Bell, X, Check, CheckCheck, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';
import { notificationService } from '../services/notificationService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from './ui/use-toast';

const NotificationCenter = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  // Obtener notificaciones
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => notificationService.getUserNotifications(user.id),
    enabled: !!user,
    refetchInterval: 30000, // Refetch cada 30 segundos
  });

  // Contar notificaciones no leídas
  const unreadCount = notifications.filter(n => !n.read_at).length;

  // Marcar como leída
  const markAsReadMutation = useMutation({
    mutationFn: notificationService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications', user?.id]);
    }
  });

  // Marcar todas como leídas
  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(user.id),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications', user?.id]);
      toast({
        title: 'Notificaciones marcadas como leídas',
        description: 'Todas las notificaciones han sido marcadas como leídas'
      });
    }
  });

  // Suscripción en tiempo real
  useEffect(() => {
    if (!user) return;

    const subscription = notificationService.subscribeToNotifications(
      user.id,
      (payload) => {
        console.log('Nueva notificación:', payload.new);
        queryClient.invalidateQueries(['notifications', user.id]);
        
        // Mostrar toast para notificación nueva
        toast({
          title: payload.new.title,
          description: payload.new.body,
          duration: 5000,
        });
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [user, queryClient]);

  const handleMarkAsRead = (notificationId) => {
    markAsReadMutation.mutate(notificationId);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('es-CL');
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'event': return '🎉';
      case 'reminder': return '⏰';
      case 'favorite': return '❤️';
      case 'system': return '🔔';
      default: return '📢';
    }
  };

  if (!user) return null;

  return (
    <div className="relative">
      {/* Botón de notificaciones */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-white hover:bg-white/20"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </Button>

      {/* Panel de notificaciones */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">Notificaciones</h3>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAllAsReadMutation.mutate()}
                        disabled={markAllAsReadMutation.isLoading}
                        className="text-xs text-purple-600 hover:text-purple-700"
                      >
                        <CheckCheck className="w-4 h-4 mr-1" />
                        Marcar todas
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {unreadCount > 0 && (
                  <p className="text-sm text-gray-600 mt-1">
                    {unreadCount} notificación{unreadCount === 1 ? '' : 'es'} sin leer
                  </p>
                )}
              </div>

              {/* Lista de notificaciones */}
              <div className="max-h-80 overflow-y-auto">
                {isLoading ? (
                  <div className="p-6 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                    Cargando notificaciones...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="font-medium">No hay notificaciones</p>
                    <p className="text-sm">Te notificaremos sobre eventos nuevos</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${
                        !notification.read_at ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => {
                        if (!notification.read_at) {
                          handleMarkAsRead(notification.id);
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 text-2xl">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <h4 className="font-medium text-gray-900 text-sm line-clamp-1">
                              {notification.title}
                            </h4>
                            <div className="flex items-center gap-1 ml-2">
                              <span className="text-xs text-gray-500 flex-shrink-0">
                                {formatTime(notification.created_at)}
                              </span>
                              {!notification.read_at && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notification.body}
                          </p>

                          {/* Datos adicionales de la notificación */}
                          {notification.data && (() => {
                            try {
                              const data = JSON.parse(notification.data);
                              return (
                                <div className="mt-2">
                                  {data.event_id && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-xs"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        // Navegar al evento
                                        window.location.href = `/events/${data.event_id}`;
                                      }}
                                    >
                                      Ver evento
                                    </Button>
                                  )}
                                </div>
                              );
                            } catch {
                              return null;
                            }
                          })()}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-3 border-t border-gray-100 bg-gray-50">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-sm text-gray-600 hover:text-gray-800"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Configurar notificaciones
                  </Button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter;