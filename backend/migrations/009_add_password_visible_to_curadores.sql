-- =====================================================
-- MIGRATION: Agregar password_visible a curadores
-- =====================================================
-- Descripción: Agrega columna para almacenar contraseña visible
--              para que el admin pueda ver las contraseñas de los curadores
-- Fecha: 2026-09-21
-- ADVERTENCIA: Esto reduce la seguridad al guardar contraseñas en texto plano
-- =====================================================

-- Agregar columna password_visible
ALTER TABLE curadores ADD COLUMN IF NOT EXISTS password_visible VARCHAR(255);

-- Comentario explicativo
COMMENT ON COLUMN curadores.password_visible IS 'Contraseña en texto plano visible solo para admin. NOTA DE SEGURIDAD: Esto permite que el admin vea las contraseñas de los curadores.';

-- =====================================================
-- FIN DE LA MIGRATION
-- =====================================================
