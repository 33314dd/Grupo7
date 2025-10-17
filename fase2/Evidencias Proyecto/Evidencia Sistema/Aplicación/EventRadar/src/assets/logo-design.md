# 🎌 EventRadar - Logo Design Specifications

## Logo Concept
**EventRadar** - Radar de eventos

### Design Elements:
- **Radar/Wave Pattern**: Círculos concéntricos representando las ondas del radar
- **Japanese Theme**: Elemento que evoque la cultura japonesa (como el emoji 🎌)
- **Modern Tech**: Estilo limpio y tecnológico
- **Purple/Pink Gradient**: Consistente con la paleta de la app

### Color Palette:
- Primary: #8b5cf6 (Purple)
- Secondary: #ec4899 (Pink) 
- Accent: #3b82f6 (Blue)
- White: #ffffff
- Dark: #1f2937

### Logo Variations Needed:
1. **Full Logo**: EventRadar + icon (horizontal)
2. **Icon Only**: Solo el ícono (cuadrado)
3. **Favicon**: 16x16, 32x32, 48x48 px
4. **Mobile App Icon**: 512x512 px
5. **Splash Screen**: 1080x1920 px

## SVG Logo Code

### Primary Logo (Full)
```svg
<svg width="240" height="60" viewBox="0 0 240 60" xmlns="http://www.w3.org/2000/svg">
  <!-- Background circle with gradient -->
  <defs>
    <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:#8b5cf6;stop-opacity:0.8" />
      <stop offset="50%" style="stop-color:#ec4899;stop-opacity:0.6" />
      <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:0.4" />
    </radialGradient>
    <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#8b5cf6" />
      <stop offset="100%" style="stop-color:#ec4899" />
    </linearGradient>
  </defs>
  
  <!-- Radar circles -->
  <circle cx="30" cy="30" r="25" fill="url(#radarGradient)" opacity="0.3"/>
  <circle cx="30" cy="30" r="20" fill="none" stroke="#8b5cf6" stroke-width="2" opacity="0.6"/>
  <circle cx="30" cy="30" r="15" fill="none" stroke="#ec4899" stroke-width="1.5" opacity="0.7"/>
  <circle cx="30" cy="30" r="10" fill="none" stroke="#3b82f6" stroke-width="1" opacity="0.8"/>
  
  <!-- Radar sweep line -->
  <line x1="30" y1="30" x2="50" y2="15" stroke="#ffffff" stroke-width="2" opacity="0.9">
    <animateTransform attributeName="transform" type="rotate" values="0 30 30;360 30 30" dur="3s" repeatCount="indefinite"/>
  </line>
  
  <!-- Center dot -->
  <circle cx="30" cy="30" r="3" fill="#ffffff"/>
  
  <!-- Japanese flag element -->
  <circle cx="45" cy="15" r="4" fill="#ec4899" opacity="0.8"/>
  
  <!-- Text -->
  <text x="70" y="25" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="url(#textGradient)">Event</text>
  <text x="70" y="45" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="url(#textGradient)">Radar</text>
</svg>
```

### Icon Only (Square)
```svg
<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:#8b5cf6;stop-opacity:0.8" />
      <stop offset="50%" style="stop-color:#ec4899;stop-opacity:0.6" />
      <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:0.4" />
    </radialGradient>
  </defs>
  
  <!-- Background -->
  <rect width="60" height="60" rx="12" fill="#1f2937"/>
  
  <!-- Radar circles -->
  <circle cx="30" cy="30" r="25" fill="url(#radarGradient)" opacity="0.3"/>
  <circle cx="30" cy="30" r="20" fill="none" stroke="#8b5cf6" stroke-width="2" opacity="0.6"/>
  <circle cx="30" cy="30" r="15" fill="none" stroke="#ec4899" stroke-width="1.5" opacity="0.7"/>
  <circle cx="30" cy="30" r="10" fill="none" stroke="#3b82f6" stroke-width="1" opacity="0.8"/>
  
  <!-- Radar sweep line -->
  <line x1="30" y1="30" x2="50" y2="15" stroke="#ffffff" stroke-width="2" opacity="0.9">
    <animateTransform attributeName="transform" type="rotate" values="0 30 30;360 30 30" dur="3s" repeatCount="indefinite"/>
  </line>
  
  <!-- Center dot -->
  <circle cx="30" cy="30" r="3" fill="#ffffff"/>
  
  <!-- Japanese flag element -->
  <circle cx="45" cy="15" r="4" fill="#ec4899" opacity="0.8"/>
</svg>
```