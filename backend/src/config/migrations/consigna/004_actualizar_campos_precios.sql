-- ════════════════════════════════════════════════════════════════════
-- 004 · ACTUALIZAR CAMPOS DE PRECIOS (ejecutar como consigna_app)
-- Refactorización: eliminar campo ajuste, renombrar precio_venta → precio_base
-- Nueva fórmula: base → +IVA (16%) → +gestión (3%) → redondeo
-- ════════════════════════════════════════════════════════════════════

SET search_path TO consigna;

-- Renombrar precio_venta a precio_base
ALTER TABLE acuerdo_obras
  RENAME COLUMN precio_venta TO precio_base;

-- Eliminar columna ajuste (el ajuste ahora se absorbe en el desglose)
ALTER TABLE acuerdo_obras
  DROP COLUMN IF EXISTS ajuste;

-- Actualizar comentarios en columnas para documentar la nueva fórmula
COMMENT ON COLUMN acuerdo_obras.precio_base IS 'Precio base (100%) = ganancia (75%) + comisión (25%). El ajuste de redondeo se distribuye proporcionalmente.';
COMMENT ON COLUMN acuerdo_obras.iva IS 'IVA 16% sobre precio base';
COMMENT ON COLUMN acuerdo_obras.gastos_admin IS 'Gestión administrativa 3% sobre (precio base + IVA)';
COMMENT ON COLUMN acuerdo_obras.precio_publico IS 'Precio final público = precio base + IVA + gestión (redondeado a múltiplo de $100)';
