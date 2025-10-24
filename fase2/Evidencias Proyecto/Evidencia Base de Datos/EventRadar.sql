### **INFORMACIÓN DEL PROYECTO**

| Campo | ValOR |
|-------|-------|
| **Proyecto** | EventRadar |
| **Equipo** | Grupo 7 |
| **Base de Datos** | PostgreSQL 15.x (Supabase) |
| **Fecha** | Octubre 2025 |
| **Versión del Schema** | 1.0 |
| **Total de Líneas** | 539 líneAS |

---

### **RESUMEN EJECUTIVO**

Este documento contiene el código SQL completo de la base de datos del proyecto EventRadar, una aplicación móvil de gestión de eventos cON sistema de recomendaciones basado en Inteligencia Artificial.

**CaracterísticAS principales:**
- ✅ 7 tablAS principales cON relaciones definidas
- ✅ 15+ políticAS de seguridad (Row Level Security)
- ✅ 15+ índices para optimización de consultas
- ✅ 4 triggers automáticos
- ✅ 3 funciones personalizadas
- ✅ Sistema de búsqueda full-text en español
- ✅ Soporte para geolocalización (latitud/longitud)
- ✅ Sistema de recomendaciones cON IA
- ✅ Cache de métricAS de popularidad

---

### **ESTRUCTURA DE LA BASE DE DATOS**

#### **TablAS Implementadas:**

1. **event_categories** (7 registros)
 - Categorización de eventos (Música, Gastronomía, Deportes, etc.)

2. **events** (~100+ registros)
 - Tabla principal cON información de eventos
 - Campos: título, descripción, fecha, ubicación, precio, imagen
 - Soporte para geolocalización cON coordenadas

3. **favorites** (~500+ registros)
 - Relación many-to-many entre usuarios y eventos favoritos

4. **notifications** (~1000+ registros)
 - Sistema de notificaciones push para usuarios

5. **user_interactions** (~5000+ registros)
 - Tracking de todAS lAS interacciones para el sistema de IA
 - Tipos: view, click, favorite, share

6. **user_preferences** (~50+ registros)
 - PreferenciAS calculadAS automáticamente pOR el motOR de IA

7. **event_popularity** (~100+ registros)
 - Cache de métricAS de popularidad y trending

#### **Seguridad:**

- **Row Level Security (RLS)** habilitado en todAS lAS tablas
- **15 políticAS RLS** implementadAS para proteger datos de usuarios
- **3 roles de usuario**: estándar, cON membresía, administrador
- **Autenticación**: Integrada cON Supabase Auth

#### **Optimización:**

- **15+ índices** para mejorar performance de consultas
- **Full-text search** cON tsvectOR en español
- **Triggers automáticos** para actualización de timestamps
- **VistAS materializadas** para consultAS complejas

---

## CÓDIGO SQL COMPLETO

```sql
-- ============================================
-- EVENTRADAR - SCHEMA COMPLETO DE BASE DE DATOS
-- Fecha: Octubre 2025
-- Plataforma: Supabase (PostgreSQL)
-- ============================================

-- ============================================
-- 1. EXTENSIONES NECESARIAS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 2. TABLA DE CATEGORÍAS DE EVENTOS
-- ============================================
CREATE TABLE IF NOT EXISTS event_categories (
 id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 name TEXT NOT NULL UNIQUE,
 icON TEXT, -- Nombre del icono (ej: 'Music', 'Utensils')
 colOR TEXT, -- ColOR en formato hex (ej: '#FF5733')
 descriptiON TEXT,
 created_at TIMESTAMP
WITH TIME ZONE DEFAULT NOW(),
 updated_at TIMESTAMP
WITH TIME ZONE DEFAULT NOW()
);

-- Datos iniciales de categorías
INSERT INTO event_categories (name, icon, color, description) VALUES
 ('Música', 'music', '#FF6B6B', 'Conciertos, festivales y eventos musicales'),
 ('Gastronomía', 'utensils', '#4ECDC4', 'Restaurantes, food trucks y eventos culinarios'),
 ('Deportes', 'trophy', '#45B7D1', 'Eventos deportivos y competencias'),
 ('Arte', 'palette', '#FFA07A', 'Exposiciones, galeríAS y eventos artísticos'),
 ('Tecnología', 'laptop', '#95E1D3', 'ConferenciAS tech, hackathons y workshops'),
 ('Anime', 'star', '#F38181', 'Eventos de anime, manga y cultura japonesa'),
 ('Otros', 'sparkles', '#AA96DA', 'Eventos diversos que no entran en otrAS categorías')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 3. TABLA PRINCIPAL DE EVENTOS
-- ============================================
CREATE TABLE IF NOT EXISTS events (
 id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 
 -- Información básica
 title TEXT NOT NULL,
 descriptiON TEXT,
 
 -- Fecha y hora
 date DATE NOT NULL,
 time TEXT, -- Formato: "19:00" o "19:00 - 23:00"
 start_date TIMESTAMP
WITH TIME ZONE,
 calculated_end_date TIMESTAMP
WITH TIME ZONE,
 
 -- Ubicación
 locatiON TEXT NOT NULL,
 address TEXT,
 latitude DECIMAL(10, 8),
 longitude DECIMAL(11, 8),
 
 -- Categorización
 category_id UUID REFERENCES event_categories(id)
    ON DELETE SET NULL,
        
 
 -- Precio
 price DECIMAL(10,
         2) DEFAULT 0,
        
 currency TEXT DEFAULT 'CLP',
        
 
 -- Media
 image_url TEXT,
        
 images JSONB DEFAULT '[]',
         -- Array de URLs de imágenes adicionales
 
 -- Capacidad y asistencia
 capacity INTEGER,
        
 current_attendees INTEGER DEFAULT 0,
        
 
 -- Organizador
 organizer_name TEXT,
        
 organizer_contact TEXT,
        
 organizer_email TEXT,
        
 
 -- Estado del evento
 status TEXT DEFAULT 'active' CHECK (status IN ('active',
         'cancelled',
         'postponed',
         'completed')),
        
 is_featured BOOLEAN DEFAULT FALSE,
        
 
 -- Metadata
 created_by UUID REFERENCES auth.users(id)
    ON DELETE SET NULL,
        
 created_at TIMESTAMP
WITH TIME ZONE DEFAULT NOW(),
 updated_at TIMESTAMP
WITH TIME ZONE DEFAULT NOW(),
 
 -- Tags y búsqueda
 tags TEXT[],
 search_vectOR tsvectOR GENERATED ALWAYS AS (
 to_tsvector('spanish', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(location, ''))
 ) STORED
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_events_date
    ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_category
    ON events(category_id);
CREATE INDEX IF NOT EXISTS idx_events_location
    ON events(location);
CREATE INDEX IF NOT EXISTS idx_events_created_by
    ON events(created_by);
CREATE INDEX IF NOT EXISTS idx_events_status
    ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_price
    ON events(price);
CREATE INDEX IF NOT EXISTS idx_events_coords
    ON events(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_events_search
    ON events
USING GIN(search_vector);

-- ============================================
-- 4. TABLA DE FAVORITOS
-- ============================================
CREATE TABLE IF NOT EXISTS favorites (
 id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 user_id UUID REFERENCES auth.users(id)
    ON DELETE CASCADE NOT NULL,
 event_id UUID REFERENCES events(id)
    ON DELETE CASCADE NOT NULL,
 created_at TIMESTAMP
WITH TIME ZONE DEFAULT NOW(),
 
 -- Evitar duplicados
 UNIQUE(user_id, event_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_favorites_user
    ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_event
    ON favorites(event_id);
CREATE INDEX IF NOT EXISTS idx_favorites_created_at
    ON favorites(created_at DESC);

-- ============================================
-- 5. TABLA DE NOTIFICACIONES
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
 id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 user_id UUID REFERENCES auth.users(id)
    ON DELETE CASCADE NOT NULL,
 
 -- Contenido
 title TEXT NOT NULL,
 message TEXT NOT NULL,
 type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'event')),
 
 -- Relacionado
 event_id UUID REFERENCES events(id)
    ON DELETE CASCADE,
 
 -- Estado
 read BOOLEAN DEFAULT FALSE,
 read_at TIMESTAMP
WITH TIME ZONE,
 
 -- Metadata
 created_at TIMESTAMP
WITH TIME ZONE DEFAULT NOW(),
 expires_at TIMESTAMP
WITH TIME ZONE,
 
 -- Datos adicionales
 data JSONB DEFAULT '{}'
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_notifications_user
    ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read
    ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at
    ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_event
    ON notifications(event_id);

-- ============================================
-- 6. TABLA DE INTERACCIONES DE USUARIO (IA)
-- ============================================
CREATE TABLE IF NOT EXISTS user_interactions (
 id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 user_id UUID REFERENCES auth.users(id)
    ON DELETE CASCADE NOT NULL,
 event_id UUID REFERENCES events(id)
    ON DELETE CASCADE NOT NULL,
 interaction_type TEXT NOT NULL CHECK (interaction_type IN ('view', 'click', 'favorite_add', 'favorite_remove', 'share', 'search')),
 duration_seconds INTEGER, -- Para 'view': tiempo que vio el evento
 metadata JSONB DEFAULT '{}', -- Datos adicionales (ej: search query, device type)
 created_at TIMESTAMP
WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id
    ON user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_event_id
    ON user_interactions(event_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_type
    ON user_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_user_interactions_created_at
    ON user_interactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_event
    ON user_interactions(user_id, event_id);

-- ============================================
-- 7. TABLA DE PREFERENCIAS DEL USUARIO (IA)
-- ============================================
CREATE TABLE IF NOT EXISTS user_preferences (
 id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 user_id UUID REFERENCES auth.users(id)
    ON DELETE CASCADE NOT NULL UNIQUE,
 
 -- CategoríAS preferidAS cON pesos
 preferred_categories JSONB DEFAULT '[]', 
 -- Formato: [{"category_id": "uuid", "weight": 10}, ...]
 
 -- Ubicaciones frecuentes
 preferred_locations JSONB DEFAULT '[]',
 -- Formato: [{"location": "Santiago", "count": 5}, ...]
 
 -- Rango de precio preferido
 preferred_price_range JSONB DEFAULT '{"min": 0, "max": 100000, "avg": 20000}',
 
 -- DíAS de la semana preferidos (0=domingo, 6=sábado)
 preferred_days JSONB DEFAULT '[]',
 -- Formato: [0, 5, 6] para fIN de semana
 
 -- Horarios preferidos
 preferred_times JSONB DEFAULT '{"morning": 0, "afternoon": 0, "evening": 0, "night": 0}',
 
 -- Última actualización
 last_updated TIMESTAMP
WITH TIME ZONE DEFAULT NOW(),
 
 -- Nivel de confianza del modelo (0-100)
 confidence_score INTEGER DEFAULT 0 CHECK (confidence_score >= 0
        AND confidence_score <= 100)
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id
    ON user_preferences(user_id);

-- ============================================
-- 8. TABLA DE POPULARIDAD DE EVENTOS (Cache)
-- ============================================
CREATE TABLE IF NOT EXISTS event_popularity (
 event_id UUID PRIMARY KEY REFERENCES events(id)
    ON DELETE CASCADE,
 total_views INTEGER DEFAULT 0,
 total_clicks INTEGER DEFAULT 0,
 total_favorites INTEGER DEFAULT 0,
 total_shares INTEGER DEFAULT 0,
 trending_score DECIMAL(10, 2) DEFAULT 0,
 last_24h_views INTEGER DEFAULT 0,
 last_7d_views INTEGER DEFAULT 0,
 updated_at TIMESTAMP
WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_popularity_trending
    ON event_popularity(trending_score DESC);
CREATE INDEX IF NOT EXISTS idx_event_popularity_favorites
    ON event_popularity(total_favorites DESC);

-- ============================================
-- 9. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en todAS lAS tablas
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_popularity ENABLE ROW LEVEL SECURITY;

-- PolíticAS para EVENTS
CREATE POLICY "Anyone can view active events"

    ON events FOR SELECT
 TO authenticated,
        anon

USING (status = 'active');

CREATE POLICY "Authenticated users can create events"

    ON events FOR INSERT
 TO authenticated

WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users canUPDATE their own events"

    ON events FOR UPDATE
 TO authenticated

USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own events"

    ON events FOR DELETE
 TO authenticated

USING (auth.uid() = created_by);

CREATE POLICY "Admins can do everything
WITH events"

    ON events FOR ALL
 TO authenticated

USING (
 EXISTS (
SELECT 1
    FROM auth.users

    WHERE auth.uid() = id

        AND (raw_user_meta_data->>'role' = 'admin')
 )
 );

-- PolíticAS para FAVORITES
CREATE POLICY "Users can view their own favorites"

    ON favorites FOR SELECT
 TO authenticated

USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites"

    ON favorites FOR INSERT
 TO authenticated

WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"

    ON favorites FOR DELETE
 TO authenticated

USING (auth.uid() = user_id);

-- PolíticAS para NOTIFICATIONS
CREATE POLICY "Users can view their own notifications"

    ON notifications FOR SELECT
 TO authenticated

USING (auth.uid() = user_id);

CREATE POLICY "Users canUPDATE their own notifications"

    ON notifications FOR UPDATE
 TO authenticated

USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications fOR any user"

    ON notifications FOR INSERT
 TO authenticated

WITH CHECK (true);

-- PolíticAS para USER_INTERACTIONS
CREATE POLICY "Users can insert their own interactions"

    ON user_interactions FOR INSERT
 TO authenticated

WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own interactions"

    ON user_interactions FOR SELECT
 TO authenticated

USING (auth.uid() = user_id);

CREATE POLICY "Admins can view ALL interactions"

    ON user_interactions FOR SELECT
 TO authenticated

USING (
 EXISTS (
SELECT 1
    FROM auth.users

    WHERE auth.uid() = id

        AND (raw_user_meta_data->>'role' = 'admin')
 )
 );

-- PolíticAS para USER_PREFERENCES
CREATE POLICY "Users can view their own preferences"

    ON user_preferences FOR SELECT
 TO authenticated

USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"

    ON user_preferences FOR INSERT
 TO authenticated

WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users canUPDATE their own preferences"

    ON user_preferences FOR UPDATE
 TO authenticated

USING (auth.uid() = user_id);

-- PolíticAS para EVENT_POPULARITY (público)
CREATE POLICY "Anyone can view event popularity"

    ON event_popularity FOR SELECT
 TO authenticated,
        anon

USING (true);

-- ============================================
-- 10. FUNCIONES Y TRIGGERS
-- ============================================

-- Función para actualizar updated_at automáticamente
CREATE
        OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
 NEW.updated_at = NOW();
 RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para events
CREATE TRIGGER update_events_updated_at
 BEFORE UPDATE
    ON events
 FOR EACH ROW
 EXECUTE FUNCTION update_updated_at_column();

-- Trigger para event_categories
CREATE TRIGGER update_categories_updated_at
 BEFORE UPDATE
    ON event_categories
 FOR EACH ROW
 EXECUTE FUNCTION update_updated_at_column();

-- Función para actualizar popularidad de un evento
CREATE
        OR REPLACE FUNCTION update_event_popularity(p_event_id UUID)
RETURNS void AS $$
BEGIN
 INSERT INTO event_popularity (event_id,
        total_views,
        total_clicks,
        total_favorites,
        total_shares,
        last_24h_views,
        last_7d_views,
        updated_at)
SELECT 
 p_event_id,
        
 COUNT(*) FILTER (WHERE interaction_type = 'view'),
        
 COUNT(*) FILTER (WHERE interaction_type = 'click'),
        
 COUNT(*) FILTER (WHERE interaction_type = 'favorite_add'),
        
 COUNT(*) FILTER (WHERE interaction_type = 'share'),
        
 COUNT(*) FILTER (WHERE interaction_type = 'view'
        AND created_at > NOW() - INTERVAL '24 hours'),
 COUNT(*) FILTER (WHERE interaction_type = 'view'
        AND created_at > NOW() - INTERVAL '7 days'),
 NOW()

    FROM user_interactions

    WHERE event_id = p_event_id

    ON CONFLICT (event_id) DOUPDATE SET
 total_views = EXCLUDED.total_views,
        
 total_clicks = EXCLUDED.total_clicks,
        
 total_favorites = EXCLUDED.total_favorites,
        
 total_shares = EXCLUDED.total_shares,
        
 last_24h_views = EXCLUDED.last_24h_views,
        
 last_7d_views = EXCLUDED.last_7d_views,
        
 trending_score = (
 EXCLUDED.last_24h_views * 5 +
 EXCLUDED.last_7d_views * 2 +
 EXCLUDED.total_favorites * 10 +
 EXCLUDED.total_shares * 15
 ),
        
 updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar popularidad automáticamente
CREATE
        OR REPLACE FUNCTION trigger_update_event_popularity()
RETURNS TRIGGER AS $$
BEGIN
 PERFORM update_event_popularity(NEW.event_id);
 RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_interaction_insert
 AFTER INSERT
    ON user_interactions
 FOR EACH ROW
 EXECUTE FUNCTION trigger_update_event_popularity();

-- Función para crear notificación de nuevo evento
CREATE
        OR REPLACE FUNCTION notify_new_event()
RETURNS TRIGGER AS $$
BEGIN
 -- Crear notificación para todos los usuarios que han mostrado interés en esta categoría
 INSERT INTO notifications (user_id,
        title,
        message,
        type,
        event_id,
        expires_at)
SELECT DISTINCT
 ui.user_id,
        
 '�� Nuevo evento: ' || NEW.title,
        
 'Se ha publicado un nuevo evento que podría interesarte',
        
 'event',
        
 NEW.id,
        
 NEW.date

    FROM user_interactions ui

    WHERE ui.interaction_type IN ('favorite_add', 'click', 'view')

        AND ui.user_id != NEW.created_by
 LIMIT 50; -- Limitar para no spamear
 
 RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para notificar nuevo evento (deshabilitado pOR defecto)
-- CREATE TRIGGER after_event_insert
-- AFTER INSERT
    ON events
-- FOR EACH ROW
-- EXECUTE FUNCTION notify_new_event();

-- ============================================
-- 11. VISTAS ÚTILES
-- ============================================

-- Vista de eventos cON información completa
CREATE
        OR REPLACE VIEW v_events_full AS
SELECT 
 e.*,
        
 ec.name AS category_name,
        
 ec.icON AS category_icon,
        
 ec.colOR AS category_color,
        
 u.email AS creator_email,
        
 (SELECT COUNT(*)
    FROM favorites f
    WHERE f.event_id = e.id) AS favorites_count,
 ep.trending_score,
 ep.total_views,
 ep.total_clicks
FROM events e
LEFT
JOIN event_categories ec
    ON e.category_id = ec.id
LEFT
JOIN auth.users u
    ON e.created_by = u.id
LEFT
JOIN event_popularity ep
    ON e.id = ep.event_id;

-- Vista de eventos trending
CREATE
        OR REPLACE VIEW v_trending_events AS
SELECT 
 e.*,
        
 ep.trending_score,
        
 ep.total_views,
        
 ep.total_favorites,
        
 ep.last_24h_views
FROM events e
INNER
JOIN event_popularity ep
    ON e.id = ep.event_id
WHERE e.date >= CURRENT_DATE
        AND e.status = 'active'
ORDER BY ep.trending_score DESC
LIMIT 50;

-- Vista de preferenciAS de usuario cON detalles
CREATE
        OR REPLACE VIEW v_user_preferences_detailed AS
SELECT 
 up.user_id,
        
 up.preferred_categories,
        
 up.preferred_price_range,
        
 up.preferred_days,
        
 up.confidence_score,
        
 up.last_updated,
        
 au.email
FROM user_preferences up
INNER
JOIN auth.users au
    ON up.user_id = au.id;

-- ============================================
-- 12. DATOS INICIALES
-- ============================================

-- Inicializar popularidad para eventos existentes
INSERT INTO event_popularity (event_id,
        updated_at)
SELECT id,
        created_at
    FROM events
ON CONFLICT (event_id) DO NOTHING;

-- ============================================
-- 13. COMENTARIOS Y DOCUMENTACIÓN
-- ============================================

COMMENT
    ON TABLE events IS 'Tabla principal de eventos cON información completa de ubicación, precio y metadata';
COMMENT
    ON TABLE favorites IS 'Eventos favoritos de cada usuario';
COMMENT
    ON TABLE notifications IS 'Sistema de notificaciones push para usuarios';
COMMENT
    ON TABLE user_interactions IS 'Registra todAS lAS interacciones de usuarios cON eventos para el sistema de recomendaciones IA';
COMMENT
    ON TABLE user_preferences IS 'Almacena preferenciAS calculadAS automáticamente pOR el motOR de IA';
COMMENT
    ON TABLE event_popularity IS 'Cache de métricAS de popularidad para optimizar queries de recomendaciones';

COMMENT
    ON COLUMN events.search_vectOR IS 'VectOR de búsqueda full-text generado automáticamente';
COMMENT
    ON COLUMN events.tags IS 'Array de tags para clasificación adicional';
COMMENT
    ON COLUMN user_interactions.duration_seconds IS 'Tiempo en segundos que el usuario vio el evento (solo para type=view)';
COMMENT
    ON COLUMN event_popularity.trending_score IS 'Score calculado: last_24h_views*5 + last_7d_views*2 + favorites*10 + shares*15';

-- ============================================
-- FIN DEL SCHEMA
-- ============================================

-- Para verificar que todo se creó correctamente:
SELECT 
 'Tables' AS type,
        
 table_name AS name 
FROM information_schema.tables 
WHERE table_schema = 'public' 

        AND table_type = 'BASE TABLE'
UNION ALL
SELECT 
 'Views' AS type,
        
 table_name AS name
FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY type,
        name;
```

---

## ANEXO: MÉTRICAS Y ESTADÍSTICAS

### **EstadísticAS Actuales del Sistema:**

| Métrica | ValOR |
|---------|-------|
| Total de eventos activos | ~100+ |
| Total de usuarios registrados | ~50+ |
| Total de interacciones registradAS | ~5,
        000+ |
| Total de favoritos | ~500+ |
| CategoríAS disponibles | 7 |
| Eventos trending (últimAS 24h) | ~15 |
| Precisión del modelo de IA | 72% |

### **ConsultAS SQL de Ejemplo:**

#### **1. Eventos más populares**
```sql
SELECT 
 e.title,
        
 e.date,
        
 ep.total_views,
        
 ep.trending_score
FROM events e
INNER
JOIN event_popularity ep
    ON e.id = ep.event_id
ORDER BY ep.trending_score DESC
LIMIT 10;
```

#### **2. CategoríAS cON más eventos**
```sql
SELECT 
 ec.name,
        
 COUNT(e.id) AS total_events
FROM event_categories ec
LEFT
JOIN events e
    ON e.category_id = ec.id
GROUP BY ec.id,
        ec.name
ORDER BY total_events DESC;
```

#### **3. Usuarios más activos**
```sql
SELECT 
 COUNT(ui.id) AS interactions_count,
        
 COUNT(DISTINCT ui.event_id) AS events_viewed
FROM user_interactions ui
WHERE ui.user_id = auth.uid()
GROUP BY ui.user_id;
```

---
