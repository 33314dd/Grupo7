import { create } from 'zustand';
import { supabase } from '@/config/supabase';

export const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,
  error: null, // Agregar manejo de errores
  
  initialize: async () => {
    try {
      set({ error: null }); // Limpiar errores previos
      const { data: { session } } = await supabase.auth.getSession();
      set({ user: session?.user || null, loading: false });
      
      supabase.auth.onAuthStateChange((event, session) => {
        set({ user: session?.user || null, loading: false });
      });
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ loading: false, error: error.message });
    }
  },
  
  signIn: async (email, password) => {
    try {
      set({ error: null, loading: true });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      set({ loading: false });
      return data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  signUp: async (email, password, metadata) => {
    try {
      set({ error: null, loading: true });
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });
      
      if (error) throw error;
      set({ loading: false });
      return data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  signInWithGoogle: async () => {
    try {
      set({ error: null, loading: true });
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      
      if (error) throw error;
      set({ loading: false });
      return data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  signOut: async () => {
    try {
      set({ error: null, loading: true });
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  updateProfile: async (updates) => {
    try {
      set({ error: null, loading: true });
      const { data, error } = await supabase.auth.updateUser({
        data: updates,
      });
      
      if (error) throw error;
      set({ loading: false });
      return data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  // Limpiar errores
  clearError: () => set({ error: null }),
}));

// Initialize auth on store creation
useAuthStore.getState().initialize();