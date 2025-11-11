import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Calendar, Users, MapPin, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEvents } from '@/api/hooks/useEvents';
import MapView from '../components/MapView';

const HomePage = () => {
  const { data: events = [], isLoading } = useEvents();
  const featuredEvents = events.slice(0, 3);

  // Datos mock para el mapa mientras no hay eventos reales
  const mockMapEvents = events.length > 0 ? events : [
    {
      id: 1,
      title: 'Concierto de Rock en Madrid',
      date: '2025-01-15',
      location: 'Teatro Real, Madrid',
      latitude: 40.4168,
      longitude: -3.7038
    },
    {
      id: 2,
      title: 'Festival de Tecnología',
      date: '2025-01-20',
      location: 'IFEMA, Madrid',
      latitude: 40.4622,
      longitude: -3.6106
    },
    {
      id: 3,
      title: 'Mercado Gastronómico',
      date: '2025-01-25',
      location: 'Mercado de San Miguel',
      latitude: 40.4155,
      longitude: -3.7093
    }
  ];

  return (
    <>
      <Helmet>
        <title>EventRadar - Descubre Eventos Increíbles</title>
        <meta name="description" content="Descubre los mejores eventos en tu ciudad. Únete a experiencias únicas y conecta con tu comunidad en EventRadar." />
      </Helmet>

      <div className="relative overflow-hidden">
        {/* Hero Section - MANTENER IGUAL */}
        <section className="relative min-h-screen flex items-center justify-center px-4">
          {/* ... todo tu código hero existente ... */}
        </section>

        {/* Features Section - MANTENER IGUAL */}
        <section className="py-20 px-4">
          {/* ... todo tu código features existente ... */}
        </section>

        {/* NUEVA SECCIÓN: Mapa de Eventos */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
                🗺️ Eventos cerca de ti
              </h2>
              <p className="text-xl text-white/80 max-w-2xl mx-auto">
                Descubre eventos increíbles en tu ubicación y explora nuevas experiencias
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="event-card rounded-2xl p-8"
            >
              <MapView events={mockMapEvents} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-center mt-8"
            >
              <p className="text-white/70 mb-4">
                💡 Haz clic en los marcadores para ver detalles de cada evento
              </p>
              <Button size="lg" asChild className="btn-primary">
                <Link to="/events">Ver Todos en Lista</Link>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Featured Events - MANTENER IGUAL */}
        {featuredEvents.length > 0 && (
          <section className="py-20 px-4">
            {/* ... todo tu código featured events existente ... */}
          </section>
        )}

        {/* CTA Section - MANTENER IGUAL */}
        <section className="py-20 px-4">
          {/* ... todo tu código CTA existente ... */}
        </section>
      </div>
    </>
  );
};

export default HomePage;