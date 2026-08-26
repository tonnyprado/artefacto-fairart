-- =====================================================
-- MIGRATION: Agregar tabla de Favoritos para Curadores
-- =====================================================
-- Descripcion: Sistema de favoritos privados por curador y fase
-- Fecha: 2026-08-26
-- =====================================================

-- Crear tabla de FAVORITOS
-- NOTA: curador_id referencia curadores(id), igual que votaciones
-- Permite a curadores marcar artistas como favoritos antes de votar
CREATE TABLE IF NOT EXISTS favoritos (
  id SERIAL PRIMARY KEY,
  curador_id INTEGER NOT NULL REFERENCES curadores(id) ON DELETE CASCADE,
  artista_id INTEGER NOT NULL REFERENCES artistas(id) ON DELETE CASCADE,
  fase_id INTEGER NOT NULL REFERENCES fases(id) ON DELETE CASCADE,
  notas TEXT, -- Notas privadas opcionales del curador
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  -- Un curador solo puede marcar un artista como favorito una vez por fase
  UNIQUE(curador_id, artista_id, fase_id)
);

-- Indices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_favoritos_curador ON favoritos(curador_id);
CREATE INDEX IF NOT EXISTS idx_favoritos_artista ON favoritos(artista_id);
CREATE INDEX IF NOT EXISTS idx_favoritos_fase ON favoritos(fase_id);
CREATE INDEX IF NOT EXISTS idx_favoritos_curador_fase ON favoritos(curador_id, fase_id);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_favoritos_updated_at ON favoritos;
CREATE TRIGGER update_favoritos_updated_at
  BEFORE UPDATE ON favoritos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FIN DE LA MIGRATION
-- =====================================================
-- Verificacion:
SELECT 'Tabla favoritos creada' as info, COUNT(*) as total FROM favoritos;
