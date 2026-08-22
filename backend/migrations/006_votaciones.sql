-- =====================================================
-- MIGRATION: Agregar tabla de Votaciones
-- =====================================================
-- Descripción: Crea tabla de votaciones para curadores
-- Fecha: 2026-08-22
-- =====================================================

-- Crear tabla de VOTACIONES
CREATE TABLE IF NOT EXISTS votaciones (
  id SERIAL PRIMARY KEY,
  curador_id INTEGER NOT NULL REFERENCES curadores(id) ON DELETE CASCADE,
  artista_id INTEGER NOT NULL REFERENCES artistas(id) ON DELETE CASCADE,
  fase_id INTEGER NOT NULL REFERENCES fases(id) ON DELETE CASCADE,
  voto BOOLEAN NOT NULL, -- true = a favor, false = en contra
  comentario TEXT,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  -- Un curador solo puede votar una vez por artista en cada fase
  UNIQUE(curador_id, artista_id, fase_id)
);

-- Índices para votaciones
CREATE INDEX IF NOT EXISTS idx_votaciones_curador ON votaciones(curador_id);
CREATE INDEX IF NOT EXISTS idx_votaciones_artista ON votaciones(artista_id);
CREATE INDEX IF NOT EXISTS idx_votaciones_fase ON votaciones(fase_id);
CREATE INDEX IF NOT EXISTS idx_votaciones_voto ON votaciones(voto);
CREATE INDEX IF NOT EXISTS idx_votaciones_fecha ON votaciones(fecha DESC);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_votaciones_updated_at ON votaciones;
CREATE TRIGGER update_votaciones_updated_at
  BEFORE UPDATE ON votaciones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FIN DE LA MIGRATION
-- =====================================================
-- Verificación:
SELECT 'Tabla votaciones creada' as info, COUNT(*) as total FROM votaciones;
