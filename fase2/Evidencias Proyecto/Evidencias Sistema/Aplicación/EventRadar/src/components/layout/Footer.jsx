import React from 'react';
import { Calendar, Github, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="glass-effect border-t border-white/10 mt-20 mobile-safe-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Calendar className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold gradient-text">eventradar</span>
            </div>
            <p className="text-white/60 mb-4">
              La plataforma definitiva para descubrir y crear eventos increíbles.
              Conecta con tu comunidad y vive experiencias memorables.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-white/60 hover:text-white transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-white/60 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-white/60 hover:text-white transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <span className="text-white font-semibold mb-4 block">Eventos</span>
            <ul className="space-y-2">
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Explorar</a></li>
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Crear</a></li>
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Categorías</a></li>
            </ul>
          </div>

          <div>
            <span className="text-white font-semibold mb-4 block">Soporte</span>
            <ul className="space-y-2">
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Centro de Ayuda</a></li>
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Contacto</a></li>
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Términos</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center">
          <p className="text-white/60">
            © 2024 eventradar. Proyecto académico - Ingeniería en Informática.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;