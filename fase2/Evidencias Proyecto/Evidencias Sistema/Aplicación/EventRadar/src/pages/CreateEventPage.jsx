import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Calendar, MapPin, Users, DollarSign, Clock, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCreateEvent } from '@/api/hooks/useEvents';
import { createEventSchema } from '@/domain/schemas/eventSchemas';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/components/ui/use-toast';

const CreateEventPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const createEventMutation = useCreateEvent();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: 'other',
    capacity: '',
    price: '',
    image_url: '',
  });

  const [errors, setErrors] = useState({});

  const categories = [
    { value: 'music', label: 'Música' },
    { value: 'sports', label: 'Deportes' },
    { value: 'technology', label: 'Tecnología' },
    { value: 'food', label: 'Gastronomía' },
    { value: 'art', label: 'Arte' },
    { value: 'business', label: 'Negocios' },
    { value: 'education', label: 'Educación' },
    { value: 'other', label: 'Otros' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Error',
        description: 'Debes iniciar sesión para crear un evento.',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    try {
      // Validate form data
      const validatedData = createEventSchema.parse({
        ...formData,
        capacity: parseInt(formData.capacity),
        price: parseFloat(formData.price) || 0,
        user_id: user.id,
      });

      await createEventMutation.mutateAsync(validatedData);
      navigate('/events');
    } catch (error) {
      if (error.errors) {
        // Zod validation errors
        const newErrors = {};
        error.errors.forEach((err) => {
          newErrors[err.path[0]] = err.message;
        });
        setErrors(newErrors);
      } else {
        toast({
          title: 'Error',
          description: 'No se pudo crear el evento. Inténtalo de nuevo.',
          variant: 'destructive',
        });
      }
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Acceso Requerido</h2>
          <p className="text-white/70 mb-8">Debes iniciar sesión para crear un evento.</p>
          <Button asChild className="btn-primary">
            <a href="/login">Iniciar Sesión</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Crear Evento - eventradar</title>
        <meta name="description" content="Crea un nuevo evento en eventradar y compártelo con tu comunidad." />
      </Helmet>

      <div className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
              Crear Evento
            </h1>
            <p className="text-xl text-white/80">
              Comparte tu evento con la comunidad
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-effect rounded-2xl p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-white font-semibold mb-2">
                  Título del Evento *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Ej: Concierto de Jazz en el Parque"
                  required
                />
                {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-white font-semibold mb-2">
                  Descripción *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Describe tu evento..."
                  required
                />
                {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-semibold mb-2">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Fecha *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                  {errors.date && <p className="text-red-400 text-sm mt-1">{errors.date}</p>}
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">
                    <Clock className="inline h-4 w-4 mr-1" />
                    Hora *
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                  {errors.time && <p className="text-red-400 text-sm mt-1">{errors.time}</p>}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-white font-semibold mb-2">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Ubicación *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Ej: Parque Central, Ciudad"
                  required
                />
                {errors.location && <p className="text-red-400 text-sm mt-1">{errors.location}</p>}
              </div>

              {/* Category */}
              <div>
                <label className="block text-white font-semibold mb-2">
                  Categoría *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value} className="bg-gray-800">
                      {category.label}
                    </option>
                  ))}
                </select>
                {errors.category && <p className="text-red-400 text-sm mt-1">{errors.category}</p>}
              </div>

              {/* Capacity and Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-semibold mb-2">
                    <Users className="inline h-4 w-4 mr-1" />
                    Capacidad *
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="100"
                    required
                  />
                  {errors.capacity && <p className="text-red-400 text-sm mt-1">{errors.capacity}</p>}
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">
                    <DollarSign className="inline h-4 w-4 mr-1" />
                    Precio (0 = Gratis)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="0.00"
                  />
                  {errors.price && <p className="text-red-400 text-sm mt-1">{errors.price}</p>}
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-white font-semibold mb-2">
                  <Image className="inline h-4 w-4 mr-1" />
                  URL de Imagen (Opcional)
                </label>
                <input
                  type="url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
                {errors.image_url && <p className="text-red-400 text-sm mt-1">{errors.image_url}</p>}
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={createEventMutation.isLoading}
                  className="w-full btn-primary py-4 text-lg"
                >
                  {createEventMutation.isLoading ? 'Creando...' : 'Crear Evento'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default CreateEventPage;