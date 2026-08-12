-- =====================================================
-- MIGRATION: Mejoras en obras y sistema de folios
-- =====================================================
-- Descripción: Agregar campos adicionales para obras y folios únicos
-- Fecha: 2026-08-12
-- =====================================================

-- 1. Agregar NOMBRE ARTÍSTICO a artistas (opcional)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='artistas' AND column_name='nombre_artistico') THEN
    ALTER TABLE artistas ADD COLUMN nombre_artistico VARCHAR(255);
    COMMENT ON COLUMN artistas.nombre_artistico IS 'Nombre artístico opcional del artista';
  END IF;
END $$;

-- 2. Agregar FOLIO único a artistas
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='artistas' AND column_name='folio') THEN
    ALTER TABLE artistas ADD COLUMN folio VARCHAR(20) UNIQUE;
    COMMENT ON COLUMN artistas.folio IS 'Folio único de identificación del artista (ej: ART-2027-001)';
  END IF;
END $$;

-- Crear índice para búsqueda rápida por folio
CREATE INDEX IF NOT EXISTS idx_artistas_folio ON artistas(folio);

-- 3. Agregar campos adicionales a OBRAS
-- Técnica
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='obras' AND column_name='tecnica') THEN
    ALTER TABLE obras ADD COLUMN tecnica VARCHAR(255);
    COMMENT ON COLUMN obras.tecnica IS 'Técnica artística utilizada (óleo, acrílico, etc.)';
  END IF;
END $$;

-- Año de creación
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='obras' AND column_name='anio') THEN
    ALTER TABLE obras ADD COLUMN anio INTEGER;
    COMMENT ON COLUMN obras.anio IS 'Año de creación de la obra';
  END IF;
END $$;

-- Precio ya existe como precio_mxn, pero vamos a asegurarnos que sea DECIMAL
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name='obras' AND column_name='precio_mxn') THEN
    -- Ya existe, no hacemos nada
    NULL;
  ELSE
    -- No existe, lo creamos
    ALTER TABLE obras ADD COLUMN precio_mxn DECIMAL(12,2);
    COMMENT ON COLUMN obras.precio_mxn IS 'Precio de venta de la obra en pesos mexicanos';
  END IF;
END $$;

-- Notas complementarias (especificaciones técnicas de montaje)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='obras' AND column_name='notas_montaje') THEN
    ALTER TABLE obras ADD COLUMN notas_montaje TEXT;
    COMMENT ON COLUMN obras.notas_montaje IS 'Notas sobre especificaciones técnicas de montaje, bases, etc.';
  END IF;
END $$;

-- 4. Modificar campos de medidas para aclarar que incluyen marco
COMMENT ON COLUMN obras.alto_cm IS 'Alto en centímetros (incluye marco si lo tiene)';
COMMENT ON COLUMN obras.ancho_cm IS 'Ancho en centímetros (incluye marco si lo tiene)';

-- 5. Generar folios para artistas existentes (si no los tienen)
-- Formato: ART-2027-001, ART-2027-002, etc.
DO $$
DECLARE
  artista_record RECORD;
  counter INTEGER := 1;
  nuevo_folio VARCHAR(20);
BEGIN
  FOR artista_record IN
    SELECT id FROM artistas WHERE folio IS NULL ORDER BY created_at ASC
  LOOP
    nuevo_folio := 'ART-2027-' || LPAD(counter::TEXT, 3, '0');
    UPDATE artistas SET folio = nuevo_folio WHERE id = artista_record.id;
    counter := counter + 1;
  END LOOP;
END $$;

-- 6. Crear función para generar folio automáticamente
CREATE OR REPLACE FUNCTION generar_folio_artista()
RETURNS TRIGGER AS $$
DECLARE
  anio_actual INTEGER;
  contador INTEGER;
  nuevo_folio VARCHAR(20);
BEGIN
  -- Obtener año actual
  anio_actual := EXTRACT(YEAR FROM CURRENT_DATE);

  -- Contar artistas del año actual
  SELECT COUNT(*) + 1 INTO contador
  FROM artistas
  WHERE folio LIKE 'ART-' || anio_actual || '-%';

  -- Generar folio: ART-2027-001
  nuevo_folio := 'ART-' || anio_actual || '-' || LPAD(contador::TEXT, 3, '0');

  -- Asignar folio si no tiene uno
  IF NEW.folio IS NULL THEN
    NEW.folio := nuevo_folio;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Crear trigger para asignar folio automáticamente
DROP TRIGGER IF EXISTS trigger_generar_folio ON artistas;
CREATE TRIGGER trigger_generar_folio
  BEFORE INSERT ON artistas
  FOR EACH ROW
  WHEN (NEW.folio IS NULL)
  EXECUTE FUNCTION generar_folio_artista();

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Verificar que las columnas se agregaron
SELECT
  column_name,
  data_type,
  character_maximum_length,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'artistas'
  AND column_name IN ('nombre_artistico', 'folio')
ORDER BY column_name;

SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'obras'
  AND column_name IN ('tecnica', 'anio', 'precio_mxn', 'notas_montaje')
ORDER BY column_name;

-- Ver artistas con sus folios
SELECT
  id,
  folio,
  nombre,
  apellido,
  nombre_artistico,
  email,
  created_at
FROM artistas
ORDER BY folio;

-- =====================================================
-- FIN DE LA MIGRATION
-- =====================================================
