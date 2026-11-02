-- ════════════════════════════════════════════════════════════════════
-- 005 · ELIMINAR OPCIÓN tercero_sin_datos (ejecutar como postgres)
-- Elimina la opción 'tercero_sin_datos' que fue removida de la UI
-- Migra registros existentes a 'pendiente'
-- ════════════════════════════════════════════════════════════════════

SET search_path TO consigna;

-- 1. Actualizar borradores existentes con tercero_sin_datos → pendiente
UPDATE borradores
SET datos = jsonb_set(datos, '{estadoFiscal}', '"pendiente"')
WHERE datos->>'estadoFiscal' = 'tercero_sin_datos';

-- 2. Actualizar acuerdos firmados con tercero_sin_datos → pendiente
UPDATE acuerdos
SET estado_fiscal = 'pendiente'
WHERE estado_fiscal = 'tercero_sin_datos';

-- 3. Eliminar constraint antigua
ALTER TABLE acuerdos
DROP CONSTRAINT IF EXISTS acuerdos_estado_fiscal_check;

-- 4. Agregar constraint nueva (solo permite 'cargada' y 'pendiente')
ALTER TABLE acuerdos
ADD CONSTRAINT acuerdos_estado_fiscal_check
CHECK (estado_fiscal IN ('cargada', 'pendiente'));

-- Comentario en la columna para documentar los valores válidos
COMMENT ON COLUMN acuerdos.estado_fiscal IS 'Estado de la constancia fiscal: cargada (subida en el paso 9), pendiente (enviar después)';
