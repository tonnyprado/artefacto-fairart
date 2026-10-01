-- ════════════════════════════════════════════════════════════════════
-- 003 · RENOMBRAR COLUMNA tarjeta → gastos_admin (ejecutar como consigna_app)
-- Migración para Consigna v4: cambio de terminología
-- ════════════════════════════════════════════════════════════════════

SET search_path TO consigna;

-- Renombrar columna en la tabla acuerdo_obras
-- De: tarjeta (término v3)
-- A:  gastos_admin (término v4: "gastos de gestión administrativa")
ALTER TABLE acuerdo_obras
  RENAME COLUMN tarjeta TO gastos_admin;

-- Actualizar comentario de la columna para documentar
COMMENT ON COLUMN acuerdo_obras.gastos_admin IS '3% gastos de gestión administrativa sobre (precio_venta + IVA)';
