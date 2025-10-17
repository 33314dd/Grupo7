// src/services/geocodingService.js

const GEOCODING_API_KEY = import.meta.env.VITE_GEOCODING_API_KEY || 'demo-key';

export const geocodingService = {
  // Convertir dirección a coordenadas (Forward Geocoding)
  async addressToCoordinates(address) {
    try {
      // Primero intentar con Nominatim (OpenStreetMap) - gratuito
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=cl&limit=1`;
      
      const response = await fetch(nominatimUrl, {
        headers: {
          'User-Agent': 'EventRadar/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        return {
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
          address: result.display_name,
          confidence: result.importance || 0.5
        };
      }

      // Si Nominatim no encuentra resultados, usar coordenadas por defecto de Santiago
      return {
        latitude: -33.4489,
        longitude: -70.6693,
        address: 'Santiago, Chile',
        confidence: 0.3,
        fallback: true
      };

    } catch (error) {
      console.error('Error in addressToCoordinates:', error);
      
      // Fallback a coordenadas de Santiago
      return {
        latitude: -33.4489,
        longitude: -70.6693,
        address: 'Santiago, Chile (ubicación aproximada)',
        confidence: 0.1,
        fallback: true,
        error: error.message
      };
    }
  },

  // Convertir coordenadas a dirección (Reverse Geocoding)
  async coordinatesToAddress(latitude, longitude) {
    try {
      const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&countrycodes=cl`;
      
      const response = await fetch(nominatimUrl, {
        headers: {
          'User-Agent': 'EventRadar/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`Reverse geocoding error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data && data.display_name) {
        return {
          address: data.display_name,
          components: {
            street: data.address?.road,
            number: data.address?.house_number,
            neighborhood: data.address?.neighbourhood || data.address?.suburb,
            city: data.address?.city || data.address?.town,
            region: data.address?.state,
            country: data.address?.country,
            postal_code: data.address?.postcode
          },
          confidence: 0.8
        };
      }

      return {
        address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        components: {},
        confidence: 0.1,
        fallback: true
      };

    } catch (error) {
      console.error('Error in coordinatesToAddress:', error);
      
      return {
        address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        components: {},
        confidence: 0.1,
        fallback: true,
        error: error.message
      };
    }
  },

  // Buscar lugares por nombre en Chile
  async searchPlaces(query, options = {}) {
    try {
      const { 
        limit = 5, 
        countryCode = 'cl',
        bounded = true,
        viewbox = '-75,-17,-66,-56' // Chile boundaries
      } = options;

      let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=${countryCode}&limit=${limit}&addressdetails=1`;
      
      if (bounded && viewbox) {
        url += `&viewbox=${viewbox}&bounded=1`;
      }

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'EventRadar/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`Places search error: ${response.status}`);
      }

      const data = await response.json();
      
      return data.map(place => ({
        id: place.osm_id,
        name: place.display_name,
        latitude: parseFloat(place.lat),
        longitude: parseFloat(place.lon),
        type: place.type,
        importance: place.importance || 0.5,
        address: {
          street: place.address?.road,
          number: place.address?.house_number,
          neighborhood: place.address?.neighbourhood || place.address?.suburb,
          city: place.address?.city || place.address?.town,
          region: place.address?.state,
          country: place.address?.country
        }
      }));

    } catch (error) {
      console.error('Error in searchPlaces:', error);
      return [];
    }
  },

  // Calcular distancia entre dos puntos (Haversine formula)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distancia en km
  },

  toRadians(degrees) {
    return degrees * (Math.PI/180);
  },

  // Obtener eventos cercanos a una ubicación
  async getNearbyEvents(latitude, longitude, radiusKm = 10) {
    try {
      // Esta función trabajaría con Supabase para filtrar eventos por proximidad
      // Por ahora retorna un placeholder
      console.log(`Buscando eventos cerca de ${latitude}, ${longitude} en un radio de ${radiusKm}km`);
      
      // TODO: Implementar consulta PostGIS en Supabase
      // SELECT *, ST_Distance(ST_MakePoint(longitude, latitude), ST_MakePoint($1, $2)) as distance
      // FROM events 
      // WHERE ST_DWithin(ST_MakePoint(longitude, latitude), ST_MakePoint($1, $2), $3)
      // ORDER BY distance;
      
      return [];
    } catch (error) {
      console.error('Error finding nearby events:', error);
      return [];
    }
  },

  // Validar si las coordenadas están dentro de Chile
  isInChile(latitude, longitude) {
    // Bounding box aproximado de Chile
    const chileBounds = {
      north: -17.5,
      south: -56,
      east: -66,
      west: -75
    };

    return (
      latitude >= chileBounds.south &&
      latitude <= chileBounds.north &&
      longitude >= chileBounds.west &&
      longitude <= chileBounds.east
    );
  },

  // Obtener ubicación del usuario con geocoding automático
  async getUserLocation() {
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocalización no soportada');
      }

      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutos de cache
        });
      });

      const { latitude, longitude } = position.coords;
      
      // Obtener dirección de las coordenadas
      const addressData = await this.coordinatesToAddress(latitude, longitude);
      
      return {
        latitude,
        longitude,
        address: addressData.address,
        accuracy: position.coords.accuracy,
        timestamp: Date.now()
      };

    } catch (error) {
      console.error('Error getting user location:', error);
      
      // Fallback a Santiago
      return {
        latitude: -33.4489,
        longitude: -70.6693,
        address: 'Santiago, Chile (ubicación por defecto)',
        accuracy: null,
        fallback: true,
        error: error.message
      };
    }
  }
};