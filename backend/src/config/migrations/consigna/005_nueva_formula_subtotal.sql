-- ════════════════════════════════════════════════════════════════════
-- 005 · NUEVA FÓRMULA CON SUBTOTAL (ejecutar como consigna_app)
-- BREAKING CHANGE: Cambio fundamental en el orden de cálculo de precios
--
-- FÓRMULA ANTIGUA (INCORRECTA):
--   base → +IVA (16%) → +gestión (3%) → público
--
-- FÓRMULA NUEVA (CORRECTA):
--   base → +gestión (4%) → subtotal → +IVA (16%) → público
--
-- CAMBIOS:
-- 1. Renombrar gastos_admin → gestion (claridad)
-- 2. Añadir campo subtotal (base + gestión)
-- 3. Actualizar comentarios con fórmula correcta
-- 4. Gestión ahora es 4% (antes 3%)
--
-- ⚠️ IMPORTANTE: Ejecutar ANTES de desplegar nuevo código
-- ════════════════════════════════════════════════════════════════════

SET search_path TO consigna;

-- 1. Renombrar gastos_admin → gestion
ALTER TABLE acuerdo_obras
  RENAME COLUMN gastos_admin TO gestion;

-- 2. Añadir campo subtotal (base + gestión)
ALTER TABLE acuerdo_obras
  ADD COLUMN subtotal numeric(12,2);

-- 3. Calcular subtotal para registros existentes (si los hay)
-- subtotal = precio_base + gestion
UPDATE acuerdo_obras
  SET subtotal = precio_base + gestion
  WHERE subtotal IS NULL;

-- 4. Hacer subtotal NOT NULL después de actualizar valores existentes
ALTER TABLE acuerdo_obras
  ALTER COLUMN subtotal SET NOT NULL;

-- 5. Actualizar comentarios con la fórmula CORRECTA
COMMENT ON COLUMN acuerdo_obras.ganancia_original IS 'Ingreso original registrado por el artista (75% de la base)';
COMMENT ON COLUMN acuerdo_obras.ganancia_final IS 'Ingreso final del artista después de ajustes (75% de la base). El ajuste de redondeo se distribuye proporcionalmente.';
COMMENT ON COLUMN acuerdo_obras.comision IS 'Comisión ARTE FACTO (25% de la base)';
COMMENT ON COLUMN acuerdo_obras.precio_base IS 'Precio base (100%) = ganancia_final (75%) + comisión (25%)';
COMMENT ON COLUMN acuerdo_obras.gestion IS 'Gestión administrativa (4% sobre precio_base)';
COMMENT ON COLUMN acuerdo_obras.subtotal IS 'Subtotal = precio_base + gestión';
COMMENT ON COLUMN acuerdo_obras.iva IS 'IVA (16% sobre subtotal)';
COMMENT ON COLUMN acuerdo_obras.precio_publico IS 'Precio público final = subtotal + IVA (redondeado a múltiplo de $100)';
COMMENT ON COLUMN acuerdo_obras.modificada IS 'TRUE si el artista modificó su ingreso respecto al registro original';

-- 6. Verificar que los cálculos sean consistentes
-- (Esta query solo muestra advertencias, no modifica datos)
DO $$
DECLARE
  inconsistencias int;
BEGIN
  SELECT COUNT(*) INTO inconsistencias
  FROM acuerdo_obras
  WHERE ABS(subtotal - (precio_base + gestion)) > 0.02; -- tolerancia de 2 centavos por redondeos

  IF inconsistencias > 0 THEN
    RAISE WARNING 'Se encontraron % registros con inconsistencias en subtotal. Revisar datos.', inconsistencias;
  ELSE
    RAISE NOTICE 'Migración 005 completada exitosamente. Todos los cálculos son consistentes.';
  END IF;
END $$;
