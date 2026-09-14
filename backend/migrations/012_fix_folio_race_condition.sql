-- =====================================================
-- MIGRATION: Fix Race Condition en Generación de Folios
-- =====================================================
-- Descripción: Usar secuencia PostgreSQL para evitar duplicados
-- Fecha: 2026-09-14
-- Problema: Dos registros simultáneos pueden generar el mismo folio
-- Solución: Usar nextval() de una secuencia para garantizar unicidad
-- =====================================================

-- 1. Crear secuencia para folios del año actual
-- Esta secuencia se reiniciará cada año manualmente o por trigger
CREATE SEQUENCE IF NOT EXISTS folio_2026_seq START 1;

-- 2. Función mejorada para generar folios usando secuencia
CREATE OR REPLACE FUNCTION generar_folio_artista()
RETURNS TRIGGER AS $$
DECLARE
  anio_actual INTEGER;
  contador INTEGER;
  nuevo_folio VARCHAR(20);
  max_intentos INTEGER := 10;
  intento INTEGER := 0;
BEGIN
  -- Obtener año actual
  anio_actual := EXTRACT(YEAR FROM CURRENT_DATE);

  -- Solo generar folio si no tiene uno
  IF NEW.folio IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- Intentar generar folio único (con reintentos en caso de colisión)
  LOOP
    intento := intento + 1;

    -- Obtener siguiente número de la secuencia
    -- IMPORTANTE: Usamos nextval que es atómico y thread-safe
    EXECUTE format('SELECT nextval(''folio_%s_seq'')', anio_actual) INTO contador;

    -- Generar folio: ART-2026-001
    nuevo_folio := 'ART-' || anio_actual || '-' || LPAD(contador::TEXT, 3, '0');

    -- Verificar si ya existe (por si acaso)
    IF NOT EXISTS (SELECT 1 FROM artistas WHERE folio = nuevo_folio) THEN
      NEW.folio := nuevo_folio;
      RETURN NEW;
    END IF;

    -- Si llegamos aquí, el folio ya existe (muy raro)
    -- Reintentar con el siguiente número
    IF intento >= max_intentos THEN
      RAISE EXCEPTION 'No se pudo generar un folio único después de % intentos', max_intentos;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 3. Recrear trigger con la función actualizada
DROP TRIGGER IF EXISTS trigger_generar_folio ON artistas;
CREATE TRIGGER trigger_generar_folio
  BEFORE INSERT ON artistas
  FOR EACH ROW
  WHEN (NEW.folio IS NULL)
  EXECUTE FUNCTION generar_folio_artista();

-- 4. Crear función para inicializar/resetear secuencia de un año
-- Útil para cuando cambie el año o para mantenimiento
CREATE OR REPLACE FUNCTION reset_folio_sequence(anio INTEGER)
RETURNS VOID AS $$
DECLARE
  max_numero INTEGER;
  sequence_name TEXT;
BEGIN
  sequence_name := 'folio_' || anio || '_seq';

  -- Buscar el número más alto ya usado ese año
  EXECUTE format(
    'SELECT COALESCE(MAX(CAST(SUBSTRING(folio FROM ''ART-%s-([0-9]+)'') AS INTEGER)), 0) FROM artistas WHERE folio LIKE ''ART-%s-%%''',
    anio, anio
  ) INTO max_numero;

  -- Crear secuencia si no existe
  EXECUTE format('CREATE SEQUENCE IF NOT EXISTS %I START 1', sequence_name);

  -- Resetear al siguiente número disponible
  EXECUTE format('SELECT setval(''%I'', %s)', sequence_name, max_numero + 1);

  RAISE NOTICE 'Secuencia % reseteada a %', sequence_name, max_numero + 1;
END;
$$ LANGUAGE plpgsql;

-- 5. Sincronizar secuencia actual con los folios existentes
-- Esto previene duplicados al migrar
SELECT reset_folio_sequence(2026);

-- 6. Crear secuencia para 2027 por adelantado
CREATE SEQUENCE IF NOT EXISTS folio_2027_seq START 1;

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Ver estado de las secuencias
SELECT
  sequencename as secuencia,
  last_value as ultimo_valor,
  is_called as fue_llamada
FROM pg_sequences
WHERE sequencename LIKE 'folio_%';

-- Ver últimos folios generados
SELECT
  id,
  folio,
  nombre,
  apellido,
  email,
  estado_registro,
  created_at
FROM artistas
WHERE folio IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;

-- Test: Simular inserción concurrente (descomentar para probar)
-- BEGIN;
-- INSERT INTO artistas (nombre, apellido, email, estado_registro)
-- VALUES ('Test', 'Concurrent1', 'test1@test.com', 'pendiente');
-- INSERT INTO artistas (nombre, apellido, email, estado_registro)
-- VALUES ('Test', 'Concurrent2', 'test2@test.com', 'pendiente');
-- INSERT INTO artistas (nombre, apellido, email, estado_registro)
-- VALUES ('Test', 'Concurrent3', 'test3@test.com', 'pendiente');
-- SELECT folio FROM artistas WHERE email LIKE 'test%@test.com' ORDER BY created_at;
-- ROLLBACK;

-- =====================================================
-- NOTAS DE MANTENIMIENTO
-- =====================================================
--
-- Al inicio de cada año, ejecutar:
-- SELECT reset_folio_sequence(2027); -- Año nuevo
--
-- Si se detecta gap en los números:
-- SELECT reset_folio_sequence(EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER);
--
-- =====================================================
-- FIN DE LA MIGRATION
-- =====================================================
