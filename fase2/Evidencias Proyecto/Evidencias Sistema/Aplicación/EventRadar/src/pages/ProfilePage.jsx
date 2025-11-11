import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { User, Mail, Calendar, Settings, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/components/ui/use-toast';

const ProfilePage = () => {
  const { user, updateProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.user_metadata?.full_name || '',
    bio: user?.user_metadata?.bio || '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile(formData);
      setIsEditing(false);
      toast({
        title: 'Perfil actualizado',
        description: 'Tus cambios han sido guardados exitosamente.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el perfil.',
        variant: 'destructive',
      });
    }
  };

  const handleManageEvents = () => {
    toast({
      title: '🚧 Esta funcionalidad no está implementada aún—¡pero no te preocupes! Puedes solicitarla en tu próximo prompt! 🚀',
    });
  };

  const handleViewAttendedEvents = () => {
    toast({
      title: '🚧 Esta funcionalidad no está implementada aún—¡pero no te preocupes! Puedes solicitarla en tu próximo prompt! 🚀',
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Acceso Requerido</h2>
          <p className="text-white/70 mb-8">Debes iniciar sesión para ver tu perfil.</p>
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
        <title>Mi Perfil - eventradar</title>
        <meta name="description" content="Gestiona tu perfil y configuración en eventradar." />
      </Helmet>

      <div className="min-h-screen py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
              Mi Perfil
            </h1>
            <p className="text-xl text-white/80">
              Gestiona tu información y configuración
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 glass-effect rounded-2xl p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Información Personal</h2>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(!isEditing)}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {isEditing ? 'Cancelar' : 'Editar'}
                </Button>
              </div>

              <div className="flex items-center space-x-6 mb-8">
                <img 
                  className="w-24 h-24 rounded-full object-cover"
                  alt={`Avatar de ${formData.full_name}`}
                 src="https://images.unsplash.com/photo-1652841190565-b96e0acbae17" />
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    {formData.full_name || 'Usuario'}
                  </h3>
                  <p className="text-white/60">{user.email}</p>
                  <p className="text-white/60 text-sm">
                    Miembro desde {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="Tu nombre completo"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Biografía
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="Cuéntanos sobre ti..."
                    />
                  </div>

                  <div className="flex space-x-4">
                    <Button onClick={handleSaveProfile} className="btn-primary">
                      Guardar Cambios
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-blue-400" />
                    <div>
                      <p className="text-white/60 text-sm">Nombre</p>
                      <p className="text-white">{formData.full_name || 'No especificado'}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-blue-400" />
                    <div>
                      <p className="text-white/60 text-sm">Email</p>
                      <p className="text-white">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-blue-400" />
                    <div>
                      <p className="text-white/60 text-sm">Miembro desde</p>
                      <p className="text-white">
                        {new Date(user.created_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  {formData.bio && (
                    <div>
                      <p className="text-white/60 text-sm mb-2">Biografía</p>
                      <p className="text-white">{formData.bio}</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-6"
            >
              <div className="glass-effect rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Acciones Rápidas</h3>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    onClick={handleManageEvents}
                    className="w-full justify-start border-white/20 text-white hover:bg-white/10"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Gestionar Eventos
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleViewAttendedEvents}
                    className="w-full justify-start border-white/20 text-white hover:bg-white/10"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Eventos Asistidos
                  </Button>
                  <Button
                    asChild
                    className="w-full btn-primary"
                  >
                    <a href="/create-event">Crear Nuevo Evento</a>
                  </Button>
                </div>
              </div>

              <div className="glass-effect rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Estadísticas</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-white/60">Eventos creados</span>
                    <span className="text-white font-semibold">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Eventos asistidos</span>
                    <span className="text-white font-semibold">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Conexiones</span>
                    <span className="text-white font-semibold">0</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;