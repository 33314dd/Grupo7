import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowLeft, Eye, EyeOff, Sparkles, MapPin, Coffee } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { signIn, user } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Redirigir si ya está logueado
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Formato de email inválido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔐 Intentando login con:', formData.email);

      const result = await signIn(formData.email, formData.password);

      if (result.success) {
        console.log('✅ Login exitoso:', result.user.email);
        navigate('/dashboard');
      } else {
        console.error('❌ Error en login:', result.error);
        setErrors({ general: result.error || 'Credenciales incorrectas' });
      }
    } catch (error) {
      console.error('❌ Error inesperado:', error);
      setErrors({ general: 'Error inesperado. Por favor, intenta nuevamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-blue-600 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-20 w-60 h-60 bg-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-1/3 w-32 h-32 bg-pink-400/20 rounded-full blur-2xl"></div>
        <div className="absolute top-20 left-1/3 w-20 h-20 bg-blue-400/20 rounded-full blur-xl"></div>
      </div>

      {/* Flecha de regreso mejorada */}
      <motion.button 
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-20 p-3 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-all duration-300 group"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <ArrowLeft className="h-5 w-5 text-white group-hover:text-white/80" />
      </motion.button>

      <div className="relative z-10 w-full max-w-md">
        {/* Header con animación */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center space-x-3 mb-4">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <MapPin className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">🎌 EventRadar</h1>
              <p className="text-white/80 text-sm">Tu radar de eventos otaku</p>
            </div>
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-white/90 text-sm"
          >
            <Coffee className="h-4 w-4" />
            ¡Bienvenido de vuelta, otaku!
          </motion.div>
        </motion.div>

        {/* Formulario mejorado */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Iniciar Sesión</h2>
            <p className="text-white/70">Accede a tu mundo otaku</p>
          </div>

          {/* Error general */}
          {errors.general && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4"
            >
              <p className="text-red-200 text-sm text-center">❌ {errors.general}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="flex items-center text-white/90 font-medium mb-2">
                <Mail className="h-4 w-4 mr-2" />
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300"
                  placeholder="otaku@eventradar.cl"
                  required
                />
                {formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  </motion.div>
                )}
              </div>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-300 text-sm mt-1"
                >
                  {errors.email}
                </motion.p>
              )}
            </motion.div>

            {/* Contraseña */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="flex items-center text-white/90 font-medium mb-2">
                <Lock className="h-4 w-4 mr-2" />
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300 pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/80 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-300 text-sm mt-1"
                >
                  {errors.password}
                </motion.p>
              )}
            </motion.div>

            {/* Botón de login */}
            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-400/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Iniciando sesión...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  🚀 Entrar a EventRadar
                </>
              )}
            </motion.button>
          </form>

          {/* Enlaces de navegación */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 text-center space-y-3"
          >
            <p className="text-white/80 text-sm">
              ¿No tienes cuenta?{' '}
              <button 
                onClick={() => navigate('/register')}
                className="text-white font-semibold hover:text-purple-200 transition-colors underline decoration-2 underline-offset-2"
              >
                Regístrate aquí
              </button>
            </p>
            
            <Link 
              to="/" 
              className="inline-block text-white/60 text-sm hover:text-white/80 transition-colors"
            >
              ← Volver al inicio
            </Link>
          </motion.div>

          {/* Usuarios de prueba */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-6 p-4 bg-purple-500/20 rounded-lg border border-purple-400/30"
          >
            <div className="text-center">
              <p className="text-white/90 text-sm font-medium mb-2">
                🧪 Para probar la aplicación
              </p>
              <div className="text-white/70 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span>📧 Email:</span>
                  <span className="font-mono bg-white/10 px-2 py-1 rounded">admin@eventradar.cl</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>🔒 Contraseña:</span>
                  <span className="font-mono bg-white/10 px-2 py-1 rounded">123456</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Info adicional */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-4 p-4 bg-blue-500/20 rounded-lg border border-blue-400/30"
          >
            <div className="text-center">
              <p className="text-white/90 text-sm font-medium mb-2">
                🎯 Una vez dentro podrás:
              </p>
              <div className="text-white/70 text-xs space-y-1">
                <div>🗺️ Ver eventos en el mapa interactivo</div>
                <div>🎌 Filtrar por categorías otaku</div>
                <div>➕ Crear eventos (si eres admin)</div>
                <div>📱 Recibir notificaciones de nuevos eventos</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;