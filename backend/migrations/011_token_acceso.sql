-- =====================================================
-- MIGRATION 011: Token de Acceso para Magic Link
-- =====================================================
-- Descripcion: Agregar token único para que usuarios
-- pre-registrados puedan regresar a completar registro
-- =====================================================

-- 1. Agregar columna token_acceso
ALTER TABLE artistas
ADD COLUMN IF NOT EXISTS token_acceso VARCHAR(64) UNIQUE DEFAULT NULL;

-- 2. Índice para búsqueda rápida por token
CREATE INDEX IF NOT EXISTS idx_artistas_token
ON artistas(token_acceso)
WHERE token_acceso IS NOT NULL;

-- =====================================================
-- FIN DE LA MIGRATION
-- =====================================================
SELECT 'Migration 011 completada - Token acceso' as info;
