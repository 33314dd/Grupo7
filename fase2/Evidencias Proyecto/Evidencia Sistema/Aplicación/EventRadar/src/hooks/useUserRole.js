import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export const useUserRole = () => {
  const { user } = useAuth();
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRole('user');
      setLoading(false);
      return;
    }

    const fetchUserRole = async () => {
      try {
        // Por ahora, todos los usuarios son admins para testing
        // Luego cambiaremos esto por la consulta real a Supabase
        console.log('👤 Checking user role for:', user.email);
        
        // ✅ TEMPORAL: Hacer admin al primer usuario
        setRole('admin'); // Cambiar a 'user' si no quieres ser admin
        
        /* 
        // ✅ VERSIÓN FINAL (descomenta cuando tengas la tabla):
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching role:', error);
          setRole('user');
        } else {
          setRole(data?.role || 'user');
        }
        */
      } catch (error) {
        console.error('Error in fetchUserRole:', error);
        setRole('user');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  const isAdmin = role === 'admin';
  const isModerator = role === 'moderator';
  const isUser = role === 'user';

  console.log('🔐 User role:', { role, isAdmin, loading });

  return {
    role,
    loading,
    isAdmin,
    isModerator,
    isUser
  };
};