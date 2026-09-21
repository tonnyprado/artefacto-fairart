-- =====================================================
-- MIGRATION: Agregar campo layout_canvas_pdf a artistas
-- =====================================================
-- Descripción: Agrega columna para almacenar URL del PDF del lienzo de diseño
-- Fecha: 2026-09-20
-- Referencia: Fix para panel de curador - mostrar PDF en lugar de solo imagen
-- =====================================================

-- Agregar columna layout_canvas_pdf a la tabla artistas
ALTER TABLE artistas
ADD COLUMN IF NOT EXISTS layout_canvas_pdf TEXT;

-- Crear índice para búsquedas más rápidas (opcional)
CREATE INDEX IF NOT EXISTS idx_artistas_layout_canvas_pdf ON artistas(layout_canvas_pdf) WHERE layout_canvas_pdf IS NOT NULL;

-- =====================================================
-- MIGRACIÓN DE DATOS EXISTENTES
-- =====================================================
-- Si hay artistas con PDF URL guardado en layout_canvas_data.pdf_url,
-- migrarlos a la nueva columna layout_canvas_pdf

UPDATE artistas
SET layout_canvas_pdf = layout_canvas_data->>'pdf_url'
WHERE layout_canvas_data IS NOT NULL
  AND layout_canvas_data->>'pdf_url' IS NOT NULL
  AND (layout_canvas_pdf IS NULL OR layout_canvas_pdf = '');

-- =====================================================
-- FIN DE LA MIGRATION
-- =====================================================
-- Verificación:
SELECT
  'Migración completada' as info,
  COUNT(*) as total_artistas,
  COUNT(layout_canvas_pdf) as artistas_con_pdf
FROM artistas;
