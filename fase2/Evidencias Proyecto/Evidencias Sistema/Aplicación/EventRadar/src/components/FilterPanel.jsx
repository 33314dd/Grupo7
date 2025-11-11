import React, { useState } from 'react';
import { Search, Filter, X, Minus, Square } from 'lucide-react';

const FilterPanel = ({ onFilterChange, filters = {} }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    search: filters.search || '',
    category: filters.category || '',
    location: filters.location || '',
    priceMax: filters.priceMax || ''
  });

  const categories = [
    { value: '', label: 'Todas las categorías' },
    { value: 'music', label: '🎵 Música' },
    { value: 'sports', label: '⚽ Deportes' },
    { value: 'technology', label: '💻 Tecnología' },
    { value: 'food', label: '🍽️ Gastronomía' },
    { value: 'art', label: '🎨 Arte' },
    { value: 'business', label: '💼 Negocios' },
    { value: 'education', label: '📚 Educación' },
    { value: 'other', label: '🎉 Otros' }
  ];

  const handleInputChange = (field, value) => {
    const newFilters = { ...localFilters, [field]: value };
    setLocalFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = { search: '', category: '', location: '', priceMax: '' };
    setLocalFilters(emptyFilters);
    onFilterChange?.(emptyFilters);
  };

  const hasActiveFilters = Object.values(localFilters).some(value => value);

  return (
    <div className={`fixed z-40 transition-all duration-300 ${
      isMinimized 
        ? 'top-4 left-4 w-64' 
        : 'top-4 left-4 w-80'
    }`}>
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/50">
        
        {/* Header - siempre visible */}
        <div className="p-4 border-b border-gray-200/50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Filter className="w-5 h-5 text-purple-600" />
              {isMinimized ? 'Filtros' : 'Filtrar Eventos'}
            </h3>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <span className="bg-purple-100 text-purple-600 text-xs px-2 py-1 rounded-full font-medium">
                  {Object.values(localFilters).filter(v => v).length}
                </span>
              )}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                title={isMinimized ? "Expandir filtros" : "Minimizar filtros"}
              >
                {isMinimized ? <Square className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Contenido de filtros - solo visible cuando no está minimizado */}
        {!isMinimized && (
          <div className="p-4 space-y-4">
            
            {/* Búsqueda */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔍 Buscar eventos
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={localFilters.search}
                  onChange={(e) => handleInputChange('search', e.target.value)}
                  placeholder="Título, descripción..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80"
                />
              </div>
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🏷️ Categoría
              </label>
              <select
                value={localFilters.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Ubicación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📍 Ubicación
              </label>
              <input
                type="text"
                value={localFilters.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Ciudad, región..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80"
              />
            </div>

            {/* Precio máximo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                💰 Precio máximo (CLP)
              </label>
              <input
                type="number"
                value={localFilters.priceMax}
                onChange={(e) => handleInputChange('priceMax', e.target.value)}
                placeholder="ej: 50000"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80"
              />
            </div>

            {/* Botón limpiar */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
              >
                <X className="w-4 h-4" />
                Limpiar filtros
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterPanel;