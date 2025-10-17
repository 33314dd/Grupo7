import React from 'react';

const EventRadarLogo = ({ 
  size = 40, 
  showText = true, 
  className = "",
  variant = "default" // default, white, dark
}) => {
  const getColors = () => {
    switch (variant) {
      case 'white':
        return {
          bgColor: 'transparent',
          textColor: 'text-white',
          gradientE: 'from-cyan-300 to-blue-300',
          gradientR: 'from-pink-300 to-purple-300'
        };
      case 'dark':
        return {
          bgColor: 'bg-gray-900',
          textColor: 'text-gray-100',
          gradientE: 'from-cyan-400 to-blue-500',
          gradientR: 'from-pink-400 to-purple-500'
        };
      default:
        return {
          bgColor: 'bg-slate-800',
          textColor: 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-400',
          gradientE: 'from-cyan-400 to-blue-500',
          gradientR: 'from-pink-400 to-purple-500'
        };
    }
  };

  const colors = getColors();
  const logoSize = size;
  const fontSize = size * 0.3;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Icon */}
      <div 
        className={`${colors.bgColor} rounded-2xl flex items-center justify-center shadow-lg`}
        style={{ 
          width: logoSize, 
          height: logoSize,
          background: variant === 'white' || variant === 'dark' 
            ? colors.bgColor 
            : 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
        }}
      >
        <div className="relative flex items-center justify-center">
          {/* Letter E */}
          <div 
            className={`font-black bg-gradient-to-br ${colors.gradientE} bg-clip-text text-transparent`}
            style={{ fontSize: fontSize, lineHeight: 1 }}
          >
            E
          </div>
          
          {/* Letter R */}
          <div 
            className={`font-black bg-gradient-to-br ${colors.gradientR} bg-clip-text text-transparent -ml-1`}
            style={{ fontSize: fontSize, lineHeight: 1 }}
          >
            R
          </div>
          
          {/* Radar Dot */}
          <div 
            className="absolute bg-gradient-to-r from-pink-400 to-purple-500 rounded-full shadow-lg"
            style={{
              width: size * 0.08,
              height: size * 0.08,
              right: -size * 0.05,
              bottom: size * 0.05,
              boxShadow: '0 0 10px rgba(236, 72, 153, 0.5)'
            }}
          />
        </div>
      </div>

      {/* Text */}
      {showText && (
        <div className={`font-bold ${colors.textColor}`} style={{ fontSize: fontSize }}>
          EventRadar
        </div>
      )}
    </div>
  );
};

export default EventRadarLogo;