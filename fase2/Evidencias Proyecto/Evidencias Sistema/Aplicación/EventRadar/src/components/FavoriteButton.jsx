import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const FavoriteButton = ({ eventId, initialFavorite = false, onFavoriteChange }) => {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [loading, setLoading] = useState(false);

  // Verificar si es favorito al cargar
  useEffect(() => {
    if (user && eventId) {
      checkIfFavorite();
    }
  }, [eventId, user]);

  const checkIfFavorite = async () => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('event_id', eventId)
        .single();

      if (!error && data) {
        setIsFavorite(true);
      } else {
        setIsFavorite(false);
      }
    } catch (error) {
      console.error('Error checking favorite:', error);
      setIsFavorite(false);
    }
  };

  const toggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (loading || !eventId || !user) return;
    
    // Cambiar el estado inmediatamente para fluidez
    const newFavoriteState = !isFavorite;
    setIsFavorite(newFavoriteState);
    setLoading(true);
    
    console.log('🔄 Toggling favorite:', eventId, '→', newFavoriteState ? 'ADD' : 'REMOVE');
    
    try {
      if (!newFavoriteState) {
        // Quitar de favoritos
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('event_id', eventId);
        
        if (error) {
          console.error('❌ Error removing favorite:', error);
          setIsFavorite(!newFavoriteState); // Revertir estado
        } else {
          console.log('✅ Removido de favoritos');
        }
      } else {
        // Agregar a favoritos
        const { error } = await supabase
          .from('favorites')
          .insert([{ 
            user_id: user.id, 
            event_id: eventId 
          }]);
        
        if (error) {
          console.error('❌ Error adding favorite:', error);
          setIsFavorite(!newFavoriteState); // Revertir estado
        } else {
          console.log('✅ Agregado a favoritos');
        }
      }
      
      // Notificar al padre SOLO si la operación fue exitosa
      if (onFavoriteChange) {
        console.log('📢 Notificando cambio:', eventId, newFavoriteState);
        onFavoriteChange(eventId, newFavoriteState);
      }
      
    } catch (error) {
      console.error('❌ Error toggling favorite:', error);
      setIsFavorite(!newFavoriteState); // Revertir estado en caso de error
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className={`p-2 rounded-full transition-all duration-300 transform hover:scale-110 ${
        isFavorite 
          ? 'bg-red-100 text-red-600 hover:bg-red-200' 
          : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-red-400'
      } ${loading ? 'opacity-50 cursor-not-allowed animate-pulse' : 'shadow-sm hover:shadow-md'}`}
      title={isFavorite ? 'Quitar de favoritos ❤️' : 'Agregar a favoritos 🤍'}
    >
      <Heart 
        className={`w-5 h-5 transition-all duration-300 ${
          isFavorite ? 'fill-current text-red-600' : 'text-gray-400'
        }`} 
      />
    </button>
  );
};

export default FavoriteButton;