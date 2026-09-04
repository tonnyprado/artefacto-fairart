-- =====================================================
-- MIGRATION: Fotos de detalle para obras
-- =====================================================
-- Descripcion: Agregar campo para guardar URLs de fotos de detalle
-- Las fotos de detalle son imagenes adicionales que muestran
-- texturas, acabados o detalles de las obras (maximo 5 por obra)
-- Fecha: 2026-09-03
-- =====================================================

-- 1. Agregar FOTOS_DETALLE_URLS a obras
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='obras' AND column_name='fotos_detalle_urls') THEN
    ALTER TABLE obras ADD COLUMN fotos_detalle_urls JSONB DEFAULT '[]';
    COMMENT ON COLUMN obras.fotos_detalle_urls IS 'Array de URLs de fotos de detalle de la obra (max 5)';
  END IF;
END $$;

-- =====================================================
-- VERIFICACION
-- =====================================================

SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'obras'
  AND column_name = 'fotos_detalle_urls';

-- =====================================================
-- FIN DE LA MIGRATION
-- =====================================================
