-- =====================================================
-- MIGRATION: Agregar campos nombre_artistico y como_te_enteraste
-- =====================================================
-- Descripción: Agrega el campo nombre_artistico y como_te_enteraste a la tabla artistas
-- Fecha: 2026-09-28
-- =====================================================

-- Agregar campo nombre_artistico (opcional)
ALTER TABLE artistas
ADD COLUMN IF NOT EXISTS nombre_artistico VARCHAR(255);

-- Agregar campo como_te_enteraste (para tracking de referencia)
ALTER TABLE artistas
ADD COLUMN IF NOT EXISTS como_te_enteraste VARCHAR(50);

-- Crear índice para análisis de referencias
CREATE INDEX IF NOT EXISTS idx_artistas_referencia ON artistas(como_te_enteraste);

-- =====================================================
-- FIN DE LA MIGRATION
-- =====================================================
-- Verificación:
SELECT
  'Campos agregados exitosamente' as info,
  COUNT(*) FILTER (WHERE nombre_artistico IS NOT NULL) as con_nombre_artistico,
  COUNT(*) FILTER (WHERE como_te_enteraste IS NOT NULL) as con_referencia,
  COUNT(*) as total_artistas
FROM artistas;
