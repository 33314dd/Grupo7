import React, { useState } from 'react';
import { Calendar, MapPin, Clock, DollarSign, Users, X, Minus, Square, ExternalLink } from 'lucide-react';
import FavoriteButton from './FavoriteButton';

const EventDetails = ({ event, onClose }) => {
  const [isMinimized, setIsMinimized] = useState(false);

  if (!event) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    if (price === 0) return 'Gratis';
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };

  return (
    <div className={`fixed z-40 transition-all duration-300 ${
      isMinimized 
        ? 'top-4 right-4 w-80' 
        : 'top-4 right-4 w-96 max-h-[90vh] overflow-y-auto'
    }`}>
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/50">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-200/50">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-3">
              <h3 className={`font-bold text-gray-800 ${
                isMinimized ? 'text-sm line-clamp-1' : 'text-lg'
              }`}>
                {event.title}
              </h3>
              {!isMinimized && (
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(event.datetime)}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <FavoriteButton eventId={event.id} />
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                title={isMinimized ? "Expandir detalles" : "Minimizar detalles"}
              >
                {isMinimized ? <Square className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                title="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content - solo visible cuando no está minimizado */}
        {!isMinimized && (
          <div className="p-4">
            
            {/* Imagen del evento */}
            {event.image_url && (
              <div className="mb-4 rounded-xl overflow-hidden">
                <img
                  src={event.image_url}
                  alt={event.title}
                  className="w-full h-48 object-cover"
                />
              </div>
            )}

            {/* Información principal */}
            <div className="space-y-3 mb-6">
              
              {/* Categoría */}
              {event.event_categories && (
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{event.event_categories.icon}</span>
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                    {event.event_categories.name}
                  </span>
                </div>
              )}

              {/* Fecha y hora */}
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-5 h-5 text-purple-600" />
                <span>{formatDate(event.datetime)}</span>
              </div>

              {/* Ubicación */}
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-5 h-5 text-red-500" />
                <span>{event.location}</span>
              </div>

              {/* Precio */}
              <div className="flex items-center gap-2 text-gray-600">
                <DollarSign className="w-5 h-5 text-green-500" />
                <span className="font-semibold">{formatPrice(event.price)}</span>
              </div>

              {/* Capacidad */}
              {event.capacity && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-5 h-5 text-blue-500" />
                  <span>{event.capacity} personas máximo</span>
                </div>
              )}
            </div>

            {/* Descripción */}
            {event.description && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-2">Descripción</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {event.description}
                </p>
              </div>
            )}

            {/* URL del evento */}
            {event.event_url && (
              <div className="mb-4">
                <a
                  href={event.event_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Ver más detalles
                </a>
              </div>
            )}

            {/* Información adicional */}
            <div className="text-xs text-gray-500 pt-4 border-t border-gray-200">
              <div>Creado: {new Date(event.created_at).toLocaleDateString('es-CL')}</div>
              {event.updated_at !== event.created_at && (
                <div>Actualizado: {new Date(event.updated_at).toLocaleDateString('es-CL')}</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetails;