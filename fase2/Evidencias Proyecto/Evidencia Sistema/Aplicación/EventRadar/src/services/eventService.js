import { supabase } from '@/config/supabase';
import { createEventSchema, eventFilterSchema } from '@/domain/schemas/eventSchemas';

export const eventService = {
  async getEvents(filters = {}) {
    try {
      const validatedFilters = eventFilterSchema.parse(filters);
      
      let query = supabase
        .from('events')
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });
      
      if (validatedFilters.category) {
        query = query.eq('category', validatedFilters.category);
      }
      
      if (validatedFilters.location) {
        query = query.ilike('location', `%${validatedFilters.location}%`);
      }
      
      if (validatedFilters.date_from) {
        query = query.gte('date', validatedFilters.date_from);
      }
      
      if (validatedFilters.date_to) {
        query = query.lte('date', validatedFilters.date_to);
      }
      
      if (validatedFilters.price_max) {
        query = query.lte('price', validatedFilters.price_max);
      }
      
      if (validatedFilters.search) {
        query = query.or(`title.ilike.%${validatedFilters.search}%,description.ilike.%${validatedFilters.search}%`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
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
          profiles:user_id (
            full_name,
            avatar_url
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
      const validatedData = createEventSchema.parse(eventData);
      
      const { data, error } = await supabase
        .from('events')
        .insert([validatedData])
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
  
  async joinEvent(eventId) {
    try {
      const { data, error } = await supabase
        .from('event_attendees')
        .insert([{ event_id: eventId }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error joining event:', error);
      throw error;
    }
  },
  
  async leaveEvent(eventId) {
    try {
      const { error } = await supabase
        .from('event_attendees')
        .delete()
        .eq('event_id', eventId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error leaving event:', error);
      throw error;
    }
  },
};