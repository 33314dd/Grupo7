# EventRadar — Mapeo del proyecto

Este README fue generado automáticamente para darte un mapa rápido del proyecto y cómo arrancarlo. Contenido:

- Arquitectura general
- Archivos y responsabilidades clave
- Dependencias importantes
- Cómo ejecutar (PowerShell)
- Variables de entorno necesarias
- Riesgos / inconsistencias detectadas
- Sugerencias y próximos pasos inmediatos

---

## 1) Resumen rápido

**🎯 BACKEND ÚNICO: SUPABASE** — El proyecto usa exclusivamente Supabase como backend. La versión MongoDB fue archivada en `server/legacy/`.

- **Frontend**: React + Vite (carpeta `src/`). Usa Supabase como BaaS, React Query para cache/estado servidor, y Zustand para estado local.
- **Backend**: `server/index.js` (ES Module) — API Express que usa `@supabase/supabase-js` para operaciones CRUD sobre tablas (`events`, `event_attendees`, `favorites`, `profiles`). Se ejecuta con `npm run server`.
- **Mobile**: carpeta `EventRadarMobile/` con proyecto React Native básico.

## Estado del Proyecto vs Sprints

**Fecha actual**: 9 de octubre, 2025 (Sprint 2 en curso)

### ✅ **Sprint 0** (15-19 Sept) — COMPLETADO
- [x] **ID1**: Definición de Arquitectura ✅ (React + Supabase + Leaflet)
- [x] **ID2**: Mockups y Flujo ✅ (UI básica implementada)
- [x] **ID3**: HITO Preparación ✅

### ✅ **Sprint 1** (22 Sept - 3 Oct) — COMPLETADO
- [x] **ID4**: API de Autenticación (HU6) ✅ (`AuthContext`, `supabase.auth`)
- [x] **ID5**: UI Mapa Básico (HU1) ✅ (`MapView.jsx` con Leaflet)  
- [x] **ID6**: UI de Autenticación (HU6) ✅ (`LoginPage`, `RegisterPage`)

### ✅ **Sprint 2** (6-17 Oct) — COMPLETADO
- [x] **ID7**: API Eventos CRUD (HU3) ✅ (`eventService.js`, `useEvents` hooks)
- [x] **ID8**: API Favoritos (HU2) ✅ (`FavoriteButton.jsx`, tabla `favorites`)
- [x] **ID9**: UI Gestión Eventos/Favoritos ✅ (`EventDetailPage` con join/leave, `Favorites.jsx` migrado a Supabase)

### � **Sprint 3** (20-31 Oct) — EN DESARROLLO AVANZADO
- [x] **ID10**: Configuración Notificaciones (HU7) ✅ (`notificationService.js`, `NotificationCenter.jsx`)
- [x] **ID11**: Geocodificación (HU10) ✅ (`geocodingService.js`)
- [ ] **ID12**: UI Notificaciones — **EN PROCESO** (NotificationCenter creado, falta integración)

### 📅 **Sprint 4** (3-14 Nov) — PRÓXIMO
- [ ] **ID13**: Filtros Avanzados API (HU4)
- [ ] **ID14**: Geolocalización Usuario (HU1)
- [ ] **ID15**: UI Filtros en Mapa

**📍 SITUACIÓN**: El proyecto está **muy adelantado**. Sprint 2 completado, Sprint 3 al 80%. Implementados servicios core de notificaciones y geocodificación. Listo para continuar con filtros avanzados y geolocalización en Sprint 4.

## Próximas acciones (Sprint 4 y 5)

### 🎯 **Camino hacia Sprint 5** 

**Sprints completados**:
- ✅ **Sprint 0**: Arquitectura y mockups
- ✅ **Sprint 1**: Auth + Mapa básico + UI Auth  
- ✅ **Sprint 2**: CRUD Eventos + Favoritos + UI completa
- ✅ **Sprint 3**: Notificaciones + Geocodificación (80% completo)

**Implementaciones recientes**:
- ✅ Join/Leave eventos en `EventDetailPage.jsx`
- ✅ `Favorites.jsx` migrado completamente a Supabase 
- ✅ `notificationService.js` — servicio completo con real-time
- ✅ `geocodingService.js` — direcciones ↔ coordenadas (Chile)
- ✅ `NotificationCenter.jsx` integrado en Dashboard

### 🚧 **Próximas tareas Sprint 4 (3-14 Nov)**

**ID13: Filtros Avanzados API (HU4)**
- [ ] Extender `eventService.js` con filtros por categoría, precio, fecha, distancia
- [ ] Agregar filtros PostGIS en Supabase (eventos cercanos por radio)
- [ ] Implementar cache inteligente con React Query

**ID14: Geolocalización Usuario (HU1)**  
- [ ] Integrar `geocodingService.getUserLocation()` en `MapView`
- [ ] Botón "Mi ubicación" en mapa
- [ ] Persistence de ubicación usuario en localStorage

**ID15: UI Filtros en Mapa**
- [ ] Panel de filtros en `MapView.jsx` (categorías, distancia, precio)
- [ ] Filtros dinámicos sin recargar mapa completo
- [ ] Contador de resultados en tiempo real

### 📋 **Checklist Sprint 4**
- [ ] API filtros avanzados implementada
- [ ] Geolocalización funcionando en mapa
- [ ] Panel filtros UI operativo  
- [ ] Performance optimizada para filtrado

## 2) Archivos y responsabilidades clave

- package.json (root)
  - Scripts: `dev` (Vite), `build`, `preview`, `server` (node server/index.js)
  - Dependencias: React, Supabase, Leaflet, React Query, Zustand, Tailwind, Capacitor, etc.

- Frontend (src/)
  - `src/main.jsx` — punto de entrada, monta `<App />`.
  - `src/App.jsx` — ruteo principal (Home, Login, Register, Dashboard, Favorites). Incluye `ProtectedRoute` y `AuthProvider`.
  - `src/contexts/AuthContext.jsx` — proveedor de autenticación usando `supabase.auth`.
  - `src/lib/supabase.js` y `src/config/supabase.js` — dos módulos para crear el cliente Supabase (duplicado; revisar).
  - `src/services/eventService.js` — lógica para CRUD de eventos usando Supabase.
  - `src/api/hooks/useEvents.js` — React Query hooks (useEvents, useEvent, useCreateEvent, ...).
  - `src/store/` — Zustand stores: `authStore.js`, `eventStore.js`.
  - `src/components/MapView.jsx` — componente de mapa (React-Leaflet) que muestra eventos y se suscribe a cambios en tiempo real.
  - `src/components/FavoriteButton.jsx` — botón para marcar/desmarcar favoritos (usa Supabase `favorites` table).
  - `src/pages/` — páginas: `HomePage` (implícita en `App.jsx`), `DashboardPage.jsx`, `EventDetailPage.jsx`, `Favorites.jsx`, `CreateEventPage.jsx`, `ProfilePage.jsx`, auth (Login/Register).
  - `src/index.css`, Tailwind config, etc.

- Backend (server/)
  - `server/index.js` — server Express (ESM) que usa `@supabase/supabase-js` para leer/escribir tablas (`events`, `event_attendees`, `profiles`, etc.).
  - `server/server.js` — variante con Express + Mongoose (CommonJS). Incluye rutas `Favorites` que asume MongoDB models.
  - `server/models/` — contiene `Favorite.js` (Mongoose schema) (coherente con la versión CommonJS).
  - `server/routes/` — `Favorites.js` (CommonJS route handler para MongoDB version).

  Nota: la versión legacy basada en MongoDB fue archivada en `server/legacy/`. El backend activo por defecto es `server/index.js` que usa Supabase.

- Otros
  - `EventRadarMobile/` — proyecto RN ligero (solo `package.json` mínimo).

## 3) Dependencias importantes

- Frontend: react 19, react-dom, react-router-dom, @supabase/supabase-js, @supabase/auth-helpers-react, @tanstack/react-query, zustand, leaflet, react-leaflet, tailwindcss
- Backend (ESM): express, cors, @supabase/supabase-js, zod
- Backend (CommonJS alternate): express, mongoose, cors

## 4) Variables de entorno (requeridas)

Front-end (Vite env names, prefijo VITE_):
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

Backend (server/index.js):
- SUPABASE_URL (opcional; server usa process.env.SUPABASE_URL fallback)
- SUPABASE_SERVICE_ROLE_KEY (opcional; usado para server-side Supabase client)
- PORT (opcional)

Recomendación: crear `.env` o `.env.local` en la raíz con las variables Vite (VITE_*) y otra `.env.server` o variables de entorno del sistema para la clave de servicio.

Ejemplo mínimo (.env):

VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...your-anon-key...

Servidor (en variables de entorno del sistema o archivo separado):

SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=service_role_XXXXXXXXXXXXXXXX

> Nota: `src/lib/supabase.js` lanza un Error si faltan las variables VITE_. Si no tienes esas variables, el frontend fallará al arrancar.

## 5) Cómo ejecutar (PowerShell)

Instalar dependencias (desde la raíz del proyecto):

```powershell
npm install
```

Arrancar frontend (Vite dev server):

```powershell
npm run dev
# Abrir http://localhost:3000 (o la IP si usas --host ::)
```

Arrancar backend (API que usa Supabase):

```powershell
npm run server
# Ejecuta server/index.js (usa @supabase/supabase-js). Por defecto corre en el puerto 5000
```

Notas:
- Asegúrate de tener las variables de entorno VITE_* antes de `npm run dev` para evitar que `src/lib/supabase.js` lance un error.
- Si prefieres usar la versión CommonJS + MongoDB (`server/server.js`) necesitarás:
  - Instalar MongoDB y configurar `MONGO_URI` en `.env`
  - Ejecutar `node server/server.js` (o añadir un script npm)

## 6) Inconsistencias / riesgos detectados

1. Duplicación y comportamiento distinto de módulos Supabase:
   - `src/lib/supabase.js` lanza un Error si faltan las variables de entorno.
   - `src/config/supabase.js` existe también con una configuración ligeramente distinta (detectSessionInUrl true/false).
   - Recomendación: unificar a un solo archivo `src/lib/supabase.js` o `src/config/supabase.js` y actualizar imports.

2. Backend con dos implementaciones (Supabase vs MongoDB):
   - `server/index.js` (ESM + Supabase) es el que se ejecuta por `npm run server`.
   - `server/server.js`, `server/models/*`, `server/routes/*` son CommonJS y esperan una base MongoDB. Esto puede confundir y producir deuda técnica.
   - Recomendación: decidir cuál backend mantener y eliminar o archivar la otra versión.

3. `src/lib/supabase.js` hace `throw` si no hay vars; esto es útil en producción, pero en desarrollo prefieres un mensaje y no romper el proceso para poder correr tests estáticos.

4. Rutas de servidor y tablas supabase asumidas: `events`, `event_attendees`, `favorites`, `profiles`. Asegúrate de que tu esquema de Supabase contiene estas tablas con las columnas que el código espera (`latitude`, `longitude`, `user_id`, `created_at`, etc.).

5. Dependencias y versiones: React 19 + react-dom 19, asegúrate de que plugins y tipos sean compatibles.

6. Uso de `import.meta.env` (Vite) vs `process.env` (Node): ten cuidado en cómo compartes variables en CI/CD.

## 7) Calidad / gates recomendados antes de cambios grandes

- Build: `npm run build` (Vite) — validar que no rompe por variables faltantes o imports duplicados.
- Lint: ejecutar `eslint` si tienes config (hay devDependency). Añadir script `npm run lint` si no existe.
- Tests: actualmente no se encontraron tests; si vas a cambiar la lógica, añade pruebas unitarias para `eventService` y para hooks `useEvents`.

## 8) Contrato pequeño (para trabajar en features nuevo que interactúen con eventos)

- Inputs: filtros de búsqueda (category, location, date_from, date_to, price_max, search)
- Outputs: lista de eventos (array de objetos event), evento único por id
- Error modes: falta de red, permisos de Supabase, validación fallida
- Success: HTTP 200 y payload esperado (event fields)

Edge cases:
- Usuario no autenticado intentando acciones protegidas
- Fechas inválidas o timezone
- Eventos sin lat/long (fallback a coordenadas por defecto)
- Race conditions en suscripciones en tiempo real

## 9) Sugerencias y próximos pasos (elige una para que lo implemente ahora)

1. Crear un `.env.example` con las variables necesarias y añadir instrucciones concretas. (recomendado, rápido)
2. Unificar `supabase` client en un único módulo y arreglar imports. (mediano)
3. Eliminar o mover a `archive/` la versión de backend con MongoDB si no la usarás. (mediano)
4. Añadir un script `npm run lint` y correcciones automáticas. (pequeño)
5. Añadir tests unitarios básicos para `eventService` y `useEvents`. (mediano)

---

Si quieres, puedo:
- Crear ahora un `.env.example` y un `README.md` (he creado este README ya).
- Unificar el cliente Supabase (puedo aplicar el cambio y ejecutar `npm run dev` para verificar arranque local si me confirmas que tienes las variables de entorno disponibles).
- Añadir un script `npm run lint` y ejecutar ESLint para ver problemas.

Dime cuál de los siguientes prefieres que haga a continuación: crear `.env.example`, unificar `supabase` client, o eliminar/archivar el backend MongoDB. También puedo hacer otra cosa si prefieres.

---

Fin del mapeo inicial.
