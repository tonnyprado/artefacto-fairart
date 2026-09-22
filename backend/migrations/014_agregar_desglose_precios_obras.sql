-- =====================================================
-- MIGRATION: Agregar desglose de precios a obras
-- =====================================================
-- Descripción: Agregar campos para guardar el desglose completo
-- de precios de las obras (precio público, comisión, precio sugerido)
-- Fecha: 2026-09-22
-- =====================================================

-- 1. Agregar PRECIO_PUBLICO a obras
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='obras' AND column_name='precio_publico') THEN
    ALTER TABLE obras ADD COLUMN precio_publico DECIMAL(12,2);
    COMMENT ON COLUMN obras.precio_publico IS 'Precio al público calculado (ganancia artista / 0.75)';
  END IF;
END $$;

-- 2. Agregar COMISION_ARTEFACTO a obras
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='obras' AND column_name='comision_artefacto') THEN
    ALTER TABLE obras ADD COLUMN comision_artefacto DECIMAL(12,2);
    COMMENT ON COLUMN obras.comision_artefacto IS 'Comisión de Artefacto (25% del precio público)';
  END IF;
END $$;

-- 3. Agregar PRECIO_SUGERIDO a obras
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='obras' AND column_name='precio_sugerido') THEN
    ALTER TABLE obras ADD COLUMN precio_sugerido DECIMAL(12,2);
    COMMENT ON COLUMN obras.precio_sugerido IS 'Precio sugerido redondeado a la centena más cercana';
  END IF;
END $$;

-- 4. Calcular y actualizar precios para obras existentes
-- Solo si tienen precio_mxn definido
UPDATE obras
SET
  precio_publico = CASE
    WHEN precio_mxn > 0 THEN precio_mxn / 0.75
    ELSE NULL
  END,
  comision_artefacto = CASE
    WHEN precio_mxn > 0 THEN (precio_mxn / 0.75) - precio_mxn
    ELSE NULL
  END,
  precio_sugerido = CASE
    WHEN precio_mxn > 0 THEN CEIL((precio_mxn / 0.75) / 500) * 500
    ELSE NULL
  END
WHERE precio_mxn IS NOT NULL AND precio_mxn > 0;

-- 5. Crear función para calcular precios automáticamente
CREATE OR REPLACE FUNCTION calcular_precios_obra()
RETURNS TRIGGER AS $$
BEGIN
  -- Si hay precio_mxn (ganancia artista), calcular los demás precios
  IF NEW.precio_mxn IS NOT NULL AND NEW.precio_mxn > 0 THEN
    -- Precio público = ganancia / 0.75
    NEW.precio_publico := NEW.precio_mxn / 0.75;

    -- Comisión = precio público - ganancia
    NEW.comision_artefacto := NEW.precio_publico - NEW.precio_mxn;

    -- Precio sugerido = redondear precio público a la centena más cercana
    NEW.precio_sugerido := CEIL(NEW.precio_publico / 500) * 500;
  ELSE
    -- Si no hay precio, limpiar los campos calculados
    NEW.precio_publico := NULL;
    NEW.comision_artefacto := NULL;
    NEW.precio_sugerido := NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Crear trigger para calcular precios automáticamente en INSERT y UPDATE
DROP TRIGGER IF EXISTS trigger_calcular_precios_obra ON obras;
CREATE TRIGGER trigger_calcular_precios_obra
  BEFORE INSERT OR UPDATE OF precio_mxn ON obras
  FOR EACH ROW
  EXECUTE FUNCTION calcular_precios_obra();

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Verificar que las columnas se agregaron
SELECT
  column_name,
  data_type,
  numeric_precision,
  numeric_scale,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'obras'
  AND column_name IN ('precio_mxn', 'precio_publico', 'comision_artefacto', 'precio_sugerido')
ORDER BY column_name;

-- Ver obras con sus precios calculados (solo primeras 5)
SELECT
  id,
  titulo,
  precio_mxn as ganancia_artista,
  comision_artefacto,
  precio_publico,
  precio_sugerido
FROM obras
WHERE precio_mxn IS NOT NULL
ORDER BY id
LIMIT 5;

-- =====================================================
-- FIN DE LA MIGRATION
-- =====================================================
