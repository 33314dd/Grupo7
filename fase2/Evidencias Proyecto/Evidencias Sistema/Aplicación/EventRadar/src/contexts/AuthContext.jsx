// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🚀 AuthProvider iniciando...');

    // ✅ Función simple para obtener usuario
    const checkUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('❌ Error obteniendo usuario:', error);
          setUser(null);
        } else {
          console.log('👤 Usuario:', user ? user.email : 'No autenticado');
          setUser(user);
        }
      } catch (error) {
        console.error('❌ Error en checkUser:', error);
        setUser(null);
      } finally {
        setLoading(false);
        console.log('✅ AuthProvider listo');
      }
    };

    checkUser();

    // ✅ Listener para cambios
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔄 Auth cambió:', event, session?.user?.email || 'No user');
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    try {
      console.log('🔐 Intentando login...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Error en login:', error.message);
        return { success: false, error: error.message };
      }

      console.log('✅ Login exitoso:', data.user.email);
      return { success: true, user: data.user };
    } catch (error) {
      console.error('❌ Error en signIn:', error);
      return { success: false, error: 'Error al iniciar sesión' };
    }
  };

  const signUp = async (email, password, fullName) => {
    try {
      console.log('📝 Intentando registro...');
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) {
        console.error('❌ Error en registro:', error.message);
        return { success: false, error: error.message };
      }

      console.log('✅ Registro exitoso:', data.user?.email);
      return { success: true, user: data.user };
    } catch (error) {
      console.error('❌ Error en signUp:', error);
      return { success: false, error: 'Error al registrar usuario' };
    }
  };

  const signOut = async () => {
    try {
      console.log('👋 Cerrando sesión...');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Error cerrando sesión:', error.message);
        return { success: false, error: error.message };
      }

      setUser(null);
      console.log('✅ Sesión cerrada');
      return { success: true };
    } catch (error) {
      console.error('❌ Error en signOut:', error);
      return { success: false, error: 'Error al cerrar sesión' };
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};