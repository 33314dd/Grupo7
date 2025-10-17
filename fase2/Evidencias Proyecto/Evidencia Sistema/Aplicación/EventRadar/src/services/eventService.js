import { supabase } from '@/config/supabase';
// import { createEventSchema, eventFilterSchema } from '@/domain/schemas/eventSchemas';

export const eventService = {
  async getEvents(filters = {}) {
    try {
      console.log('🔍 Obteniendo eventos con filtros:', filters);
      
      let query = supabase
        .from('events')
        .select(`
          *,
          event_categories(
            id,
            name,
            icon,
            color
          )
        `)
        .order('created_at', { ascending: false });
      
      // Aplicar filtros
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      
      if (filters.category_id) {
        query = query.eq('category_id', filters.category_id);
      }
      
      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('❌ Error en getEvents:', error);
        throw error;
      }
      
      console.log('✅ Eventos obtenidos:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  },
  
  async getEventById(id) {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          event_categories(
            id,
            name,
            icon,
            color
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching event:', error);
      throw error;
    }
  },
  
  async createEvent(eventData) {
    try {      
      const { data, error } = await supabase
        .from('events')
        .insert([eventData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  },
  
  async updateEvent(id, updates) {
    try {
      const { data, error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  },
  
  async deleteEvent(id) {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  },
  
  async joinEvent(eventId, userId) {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .insert([{ 
          event_id: eventId,
          user_id: userId
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error joining event:', error);
      throw error;
    }
  },  async leaveEvent(eventId, userId) {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error leaving event:', error);
      throw error;
    }
  },

  async getCategories() {
    try {
      const { data, error } = await supabase
        .from('event_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  async getUserFavorites(userId) {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          *,
          events(
            *,
            event_categories(
              id,
              name,
              icon,
              color
            )
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user favorites:', error);
      throw error;
    }
  },
};