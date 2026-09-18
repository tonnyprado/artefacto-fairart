-- =====================================================
-- MIGRATION: Agregar fotos de detalle a obras
-- =====================================================
-- Descripción: Agregar campo JSONB para almacenar URLs de fotos de detalle
-- Fecha: 2026-09-18
-- =====================================================

-- 1. Agregar campo fotos_detalle_urls a obras
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='obras' AND column_name='fotos_detalle_urls') THEN
    ALTER TABLE obras ADD COLUMN fotos_detalle_urls JSONB DEFAULT '[]'::jsonb;
    COMMENT ON COLUMN obras.fotos_detalle_urls IS 'Array JSON con URLs de fotos de detalle de la obra (para esculturas, detalles de técnica, etc.)';
  END IF;
END $$;

-- 2. Crear índice para búsquedas en JSONB (opcional pero recomendado)
CREATE INDEX IF NOT EXISTS idx_obras_fotos_detalle ON obras USING gin(fotos_detalle_urls);

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Verificar que la columna se agregó
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'obras'
  AND column_name = 'fotos_detalle_urls';

-- Ver ejemplo de obras con fotos de detalle
SELECT
  id,
  titulo,
  artista_id,
  fotos_detalle_urls,
  jsonb_array_length(COALESCE(fotos_detalle_urls, '[]'::jsonb)) as num_fotos_detalle
FROM obras
WHERE fotos_detalle_urls IS NOT NULL
  AND jsonb_array_length(fotos_detalle_urls) > 0
LIMIT 5;

-- =====================================================
-- FIN DE LA MIGRATION
-- =====================================================
