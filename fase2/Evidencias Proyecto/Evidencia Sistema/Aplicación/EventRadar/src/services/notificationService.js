// src/services/notificationService.js
import { supabase } from '../lib/supabase';

export const notificationService = {
  // Enviar notificación push
  async sendPushNotification(userId, title, body, data = {}) {
    try {
      const { data: result, error } = await supabase
        .from('notifications')
        .insert([{
          user_id: userId,
          title,
          body,
          data: JSON.stringify(data),
          type: 'push',
          status: 'sent'
        }])
        .select()
        .single();

      if (error) throw error;
      return result;
    } catch (error) {
      console.error('Error sending push notification:', error);
      throw error;
    }
  },

  // Notificar sobre nuevo evento
  async notifyNewEvent(event) {
    try {
      // Obtener usuarios que estén interesados en la categoría del evento
      const { data: interestedUsers, error } = await supabase
        .from('user_preferences')
        .select('user_id')
        .contains('interested_categories', [event.category]);

      if (error) throw error;

      const notifications = interestedUsers.map(user => ({
        user_id: user.user_id,
        title: '🎉 ¡Nuevo evento disponible!',
        body: `${event.title} - ${event.location}`,
        data: JSON.stringify({ 
          event_id: event.id,
          type: 'new_event',
          category: event.category 
        }),
        type: 'event',
        status: 'pending'
      }));

      if (notifications.length > 0) {
        const { data, error: insertError } = await supabase
          .from('notifications')
          .insert(notifications)
          .select();

        if (insertError) throw insertError;
        return data;
      }

      return [];
    } catch (error) {
      console.error('Error notifying new event:', error);
      throw error;
    }
  },

  // Notificar recordatorio de evento
  async notifyEventReminder(eventId) {
    try {
      const { data: attendees, error } = await supabase
        .from('event_attendees')
        .select(`
          user_id,
          events:event_id (
            id,
            title,
            date,
            time,
            location
          )
        `)
        .eq('event_id', eventId);

      if (error) throw error;

      const event = attendees[0]?.events;
      if (!event) return [];

      const notifications = attendees.map(attendee => ({
        user_id: attendee.user_id,
        title: '⏰ Recordatorio de evento',
        body: `${event.title} es mañana a las ${event.time}`,
        data: JSON.stringify({ 
          event_id: event.id,
          type: 'reminder',
          date: event.date,
          time: event.time 
        }),
        type: 'reminder',
        status: 'pending'
      }));

      if (notifications.length > 0) {
        const { data, error: insertError } = await supabase
          .from('notifications')
          .insert(notifications)
          .select();

        if (insertError) throw insertError;
        return data;
      }

      return [];
    } catch (error) {
      console.error('Error sending event reminders:', error);
      throw error;
    }
  },

  // Obtener notificaciones del usuario
  async getUserNotifications(userId, limit = 20) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      throw error;
    }
  },

  // Marcar notificación como leída
  async markAsRead(notificationId) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString(), status: 'read' })
        .eq('id', notificationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  // Marcar todas las notificaciones como leídas
  async markAllAsRead(userId) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ 
          read_at: new Date().toISOString(), 
          status: 'read' 
        })
        .eq('user_id', userId)
        .is('read_at', null)
        .select();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  // Suscripción en tiempo real a notificaciones
  subscribeToNotifications(userId, callback) {
    const subscription = supabase
      .channel(`notifications:user_id=eq.${userId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();

    return subscription;
  },

  // Configurar preferencias de notificación del usuario
  async updateNotificationPreferences(userId, preferences) {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          ...preferences,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  }
};