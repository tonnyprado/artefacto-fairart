-- =====================================================
-- MIGRATION 010: Sistema de Pre-Registro de Artistas
-- =====================================================
-- Descripcion: Agregar soporte para pre-registros con recordatorios
-- Permite capturar datos de Step1 antes de registro completo
-- =====================================================

-- 1. Eliminar constraint existente de estado_registro (si existe)
ALTER TABLE artistas
DROP CONSTRAINT IF EXISTS artistas_estado_registro_check;

-- 2. Agregar nuevo constraint con 'pre_registrado'
ALTER TABLE artistas
ADD CONSTRAINT artistas_estado_registro_check
CHECK (estado_registro IN ('pre_registrado', 'pendiente', 'aprobado', 'rechazado'));

-- 3. Nuevas columnas para tracking de pre-registro
ALTER TABLE artistas
ADD COLUMN IF NOT EXISTS fecha_pre_registro TIMESTAMP DEFAULT NULL;

ALTER TABLE artistas
ADD COLUMN IF NOT EXISTS recordatorios_enviados INTEGER DEFAULT 0;

ALTER TABLE artistas
ADD COLUMN IF NOT EXISTS ultimo_recordatorio_enviado TIMESTAMP DEFAULT NULL;

ALTER TABLE artistas
ADD COLUMN IF NOT EXISTS fecha_registro_completo TIMESTAMP DEFAULT NULL;

-- 4. Indices para consultas eficientes de pre-registros
CREATE INDEX IF NOT EXISTS idx_artistas_pre_registro
ON artistas(estado_registro, fecha_pre_registro)
WHERE estado_registro = 'pre_registrado';

CREATE INDEX IF NOT EXISTS idx_artistas_recordatorios
ON artistas(ultimo_recordatorio_enviado, recordatorios_enviados)
WHERE estado_registro = 'pre_registrado';

-- =====================================================
-- FIN DE LA MIGRATION
-- =====================================================
SELECT 'Migration 010 completada - Pre-registro' as info;
