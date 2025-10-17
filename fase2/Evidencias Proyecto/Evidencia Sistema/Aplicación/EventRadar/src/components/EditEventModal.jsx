import React, { useState, useEffect } from 'react';
import { X, Save, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';

const EditEventModal = ({ isOpen, onClose, event, onEventUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'anime',
    date: '',
    time: '',
    location: '',
    latitude: -33.0194,
    longitude: -71.5519,
    price: 0,
  });

  const eventCategories = {
    'anime': { emoji: '🎌', name: 'Anime', color: '#9333ea' },
    'musica': { emoji: '🎵', name: 'Música', color: '#ec4899' },
    'gastronomia': { emoji: '🍕', name: 'Gastronomía', color: '#f59e0b' },
    'deportes': { emoji: '⚽', name: 'Deportes', color: '#10b981' },
    'arte': { emoji: '🎨', name: 'Arte', color: '#8b5cf6' },
    'tecnologia': { emoji: '💻', name: 'Tecnología', color: '#06b6d4' },
    'otros': { emoji: '🎪', name: 'Otros', color: '#6b7280' }
  };

  // Cargar datos del evento cuando se abre el modal
  useEffect(() => {
    if (event && isOpen) {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        category: event.category || 'anime',
        date: event.date || '',
        time: event.time || '',
        location: event.location || '',
        latitude: event.latitude || -33.0194,
        longitude: event.longitude || -71.5519,
        price: event.price || 0,
      });
    }
  }, [event, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('📝 Actualizando evento:', event.id, formData);

      // Redondear coordenadas a 6 decimales para evitar overflow
      const latitude = Math.round(parseFloat(formData.latitude) * 1000000) / 1000000;
      const longitude = Math.round(parseFloat(formData.longitude) * 1000000) / 1000000;

      // Validar rangos de coordenadas
      if (latitude < -90 || latitude > 90) {
        alert('❌ La latitud debe estar entre -90 y 90');
        setLoading(false);
        return;
      }
      if (longitude < -180 || longitude > 180) {
        alert('❌ La longitud debe estar entre -180 y 180');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('events')
        .update({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          date: formData.date,
          time: formData.time,
          location: formData.location,
          latitude: latitude,
          longitude: longitude,
          price: parseFloat(formData.price) || 0,
        })
        .eq('id', event.id)
        .select();

      if (error) {
        console.error('❌ Error actualizando evento:', error);
        alert('Error al actualizar el evento: ' + error.message);
        return;
      }

      console.log('✅ Evento actualizado:', data);
      alert('✅ Evento actualizado correctamente');
      
      // Notificar al componente padre
      if (onEventUpdated) {
        onEventUpdated(data[0]);
      }
      
      onClose();
    } catch (error) {
      console.error('❌ Error inesperado:', error);
      alert('Error inesperado al actualizar el evento');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen || !event) return null;

  const categoryColor = eventCategories[formData.category]?.color || '#6b7280';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div 
          className="sticky top-0 p-6 border-b border-gray-100 flex items-center justify-between"
          style={{ background: `linear-gradient(135deg, ${categoryColor}15, ${categoryColor}05)` }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm"
              style={{ backgroundColor: `${categoryColor}30` }}
            >
              {eventCategories[formData.category]?.emoji}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Editar Evento</h2>
              <p className="text-sm text-gray-600">Modifica los detalles del evento</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Título */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📝 Título del Evento
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900"
              placeholder="Nombre del evento"
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🎯 Categoría
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900"
            >
              {Object.entries(eventCategories).map(([key, cat]) => (
                <option key={key} value={key}>
                  {cat.emoji} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📄 Descripción
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none text-gray-900"
              placeholder="Describe el evento..."
            />
          </div>

          {/* Fecha y Hora */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📅 Fecha
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🕐 Hora
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900"
              />
            </div>
          </div>

          {/* Ubicación */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📍 Ubicación
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900"
              placeholder="Ej: Quinta Vergara, Viña del Mar"
            />
          </div>

          {/* Coordenadas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🌍 Latitud
              </label>
              <input
                type="number"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                step="0.000001"
                min="-90"
                max="90"
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900"
                placeholder="-33.0244"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🌍 Longitud
              </label>
              <input
                type="number"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                step="0.000001"
                min="-180"
                max="180"
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900"
                placeholder="-71.5519"
              />
            </div>
          </div>

          {/* Precio */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              💰 Precio (CLP)
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900"
              placeholder="0 para gratis"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEventModal;
