-- =====================================================
-- MIGRATION: Dimensiones para obras 3D (esculturas)
-- =====================================================
-- Descripción: Agregar campo largo_cm para esculturas 3D
-- La base de la escultura se define con largo × ancho (vista aérea)
-- El alto es la altura de la escultura (no visible en canvas)
-- Fecha: 2026-08-15
-- =====================================================

-- 1. Agregar LARGO_CM a obras (para esculturas 3D)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='obras' AND column_name='largo_cm') THEN
    ALTER TABLE obras ADD COLUMN largo_cm DECIMAL(10,2);
    COMMENT ON COLUMN obras.largo_cm IS 'Largo de la base en cm (solo para esculturas 3D, vista aérea)';
  END IF;
END $$;

-- 2. Agregar TIPO_OBRA para distinguir entre 2D y 3D
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='obras' AND column_name='tipo_obra') THEN
    ALTER TABLE obras ADD COLUMN tipo_obra VARCHAR(10) DEFAULT '2D';
    COMMENT ON COLUMN obras.tipo_obra IS 'Tipo de obra: 2D (pintura, fotografía) o 3D (escultura)';
  END IF;
END $$;

-- 3. Actualizar comentarios de campos existentes para aclarar uso
COMMENT ON COLUMN obras.alto_cm IS 'Para 2D: alto de la obra. Para 3D: altura de la escultura (no visible en canvas de vista aérea)';
COMMENT ON COLUMN obras.ancho_cm IS 'Para 2D: ancho de la obra. Para 3D: ancho de la base de la escultura';

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'obras'
  AND column_name IN ('largo_cm', 'tipo_obra', 'alto_cm', 'ancho_cm')
ORDER BY column_name;

-- =====================================================
-- FIN DE LA MIGRATION
-- =====================================================
