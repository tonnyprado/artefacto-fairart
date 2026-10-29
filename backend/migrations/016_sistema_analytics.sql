-- Migración 016: Sistema de Analytics
-- Crea tablas para trackear eventos y sesiones de usuarios
-- Optimizado para queries rápidas y análisis de datos

-- =====================================================
-- TABLA: analytics_sessions
-- Almacena sesiones de usuario con métricas agregadas
-- =====================================================

CREATE TABLE IF NOT EXISTS analytics_sessions (
  id BIGSERIAL PRIMARY KEY,
  session_id UUID NOT NULL UNIQUE,
  user_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,

  -- Privacy: IP hasheada, no se guarda IP completa
  ip_hash VARCHAR(64),
  user_agent TEXT,

  -- Origen y navegación
  referrer TEXT,
  landing_page TEXT,
  exit_page TEXT,

  -- Métricas temporales
  started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP,
  duration_seconds INTEGER,

  -- Contadores
  page_views INTEGER DEFAULT 0,
  events_count INTEGER DEFAULT 0,

  -- Conversión
  converted BOOLEAN DEFAULT false,
  conversion_type VARCHAR(50),

  -- Metadata flexible (JSONB para queries avanzadas)
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLA: analytics_events
-- Almacena cada evento individual de usuario
-- =====================================================

CREATE TABLE IF NOT EXISTS analytics_events (
  id BIGSERIAL PRIMARY KEY,

  -- Relaciones
  session_id UUID REFERENCES analytics_sessions(session_id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,

  -- Tipo de evento (page_view, click, conversion, error, etc.)
  event_type VARCHAR(50) NOT NULL,
  event_name VARCHAR(100),

  -- Contexto de página
  page_url TEXT,
  page_title VARCHAR(255),

  -- Contexto de elemento (para clicks)
  element_id VARCHAR(100),
  element_text TEXT,

  -- Valor numérico (tiempo, precio, scroll depth, etc.)
  value NUMERIC,

  -- Metadata flexible (JSONB para datos custom)
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamp
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ÍNDICES OPTIMIZADOS
-- Para queries rápidas en dashboard y reportes
-- =====================================================

-- Índices para analytics_sessions
CREATE INDEX idx_analytics_sessions_user_id ON analytics_sessions(user_id);
CREATE INDEX idx_analytics_sessions_started_at ON analytics_sessions(started_at DESC);
CREATE INDEX idx_analytics_sessions_converted ON analytics_sessions(converted) WHERE converted = true;
CREATE INDEX idx_analytics_sessions_session_id ON analytics_sessions(session_id);

-- Índices para analytics_events
CREATE INDEX idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_type_created ON analytics_events(event_type, created_at DESC);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX idx_analytics_events_event_type ON analytics_events(event_type);

-- Índice GIN para búsquedas en metadata JSONB
CREATE INDEX idx_analytics_events_metadata ON analytics_events USING GIN (metadata);
CREATE INDEX idx_analytics_sessions_metadata ON analytics_sessions USING GIN (metadata);

-- =====================================================
-- TRIGGER: Actualizar updated_at en sessions
-- =====================================================

DROP TRIGGER IF EXISTS update_analytics_sessions_updated_at ON analytics_sessions;

CREATE TRIGGER update_analytics_sessions_updated_at
  BEFORE UPDATE ON analytics_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCIÓN: Limpiar eventos antiguos (opcional)
-- Puede ejecutarse manualmente o con cron job
-- =====================================================

CREATE OR REPLACE FUNCTION cleanup_old_analytics()
RETURNS void AS $$
BEGIN
  -- Eliminar eventos más antiguos de 90 días
  DELETE FROM analytics_events WHERE created_at < NOW() - INTERVAL '90 days';

  -- Eliminar sesiones más antiguas de 1 año
  DELETE FROM analytics_sessions WHERE started_at < NOW() - INTERVAL '1 year';

  RAISE NOTICE 'Analytics cleanup completed';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMENTARIOS: Documentación de tablas
-- =====================================================

COMMENT ON TABLE analytics_sessions IS 'Sesiones de usuario con métricas agregadas para análisis';
COMMENT ON TABLE analytics_events IS 'Eventos individuales de usuario (clicks, pageviews, conversiones, etc.)';

COMMENT ON COLUMN analytics_sessions.session_id IS 'UUID único de la sesión (generado en cliente)';
COMMENT ON COLUMN analytics_sessions.ip_hash IS 'Hash SHA256 de IP para privacidad';
COMMENT ON COLUMN analytics_sessions.converted IS 'TRUE si la sesión resultó en conversión';
COMMENT ON COLUMN analytics_sessions.conversion_type IS 'Tipo de conversión (registro_artista, contacto, etc.)';

COMMENT ON COLUMN analytics_events.event_type IS 'Tipo: page_view, click, conversion, error, scroll_depth, etc.';
COMMENT ON COLUMN analytics_events.value IS 'Valor numérico (segundos, pixels, precio, etc.)';
COMMENT ON COLUMN analytics_events.metadata IS 'Datos custom en formato JSONB';

-- =====================================================
-- GRANTS: Permisos (ajustar según tu configuración)
-- =====================================================

-- Si tienes un usuario específico para la app, otorgar permisos:
-- GRANT SELECT, INSERT, UPDATE, DELETE ON analytics_sessions TO app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON analytics_events TO app_user;
-- GRANT USAGE, SELECT ON SEQUENCE analytics_sessions_id_seq TO app_user;
-- GRANT USAGE, SELECT ON SEQUENCE analytics_events_id_seq TO app_user;

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Verificar que las tablas se crearon correctamente
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'analytics_sessions') AND
     EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'analytics_events') THEN
    RAISE NOTICE '✅ Migración 016 completada: Tablas analytics_sessions y analytics_events creadas';
  ELSE
    RAISE EXCEPTION '❌ Error en migración 016: Las tablas no se crearon correctamente';
  END IF;
END $$;
