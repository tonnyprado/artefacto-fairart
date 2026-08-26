-- =====================================================
-- MIGRATION: Mejorar workflow de artistas por fase
-- =====================================================
-- Descripcion: Cambiar de "aprobado manual" a workflow basado en votaciones
-- Fecha: 2026-08-26
-- =====================================================
-- FLUJO:
-- 1. Artista se registra -> inscrito en fase actual
-- 2. Votaciones -> curadores votan
-- 3. Resultados -> aprobado/rechazado segun votos
-- 4. Admin puede "rescatar" rechazados para siguiente fase
-- 5. Rescatados entran con etiqueta de fase origen
-- =====================================================

-- Agregar nuevas columnas a artistas_fases
-- Estado del artista en esta fase especifica
ALTER TABLE artistas_fases
ADD COLUMN IF NOT EXISTS estado VARCHAR(50) DEFAULT 'inscrito';

-- Fase donde el artista se inscribio originalmente
ALTER TABLE artistas_fases
ADD COLUMN IF NOT EXISTS fase_origen_id INTEGER REFERENCES fases(id);

-- Si el artista fue rescatado por admin (no paso votaciones pero admin lo agrego)
ALTER TABLE artistas_fases
ADD COLUMN IF NOT EXISTS es_rescatado BOOLEAN DEFAULT false;

-- Quien rescato al artista (admin user id)
ALTER TABLE artistas_fases
ADD COLUMN IF NOT EXISTS rescatado_por INTEGER;

-- Cuando fue rescatado
ALTER TABLE artistas_fases
ADD COLUMN IF NOT EXISTS fecha_rescate TIMESTAMP;

-- Notas del admin al rescatar
ALTER TABLE artistas_fases
ADD COLUMN IF NOT EXISTS notas_rescate TEXT;

-- Actualizar registros existentes: fase_origen = fase actual (se inscribieron ahi)
UPDATE artistas_fases
SET fase_origen_id = fase_id
WHERE fase_origen_id IS NULL;

-- Crear indice para estado
CREATE INDEX IF NOT EXISTS idx_artistas_fases_estado ON artistas_fases(estado);
CREATE INDEX IF NOT EXISTS idx_artistas_fases_origen ON artistas_fases(fase_origen_id);
CREATE INDEX IF NOT EXISTS idx_artistas_fases_rescatado ON artistas_fases(es_rescatado);

-- Comentario sobre el campo artistas.aprobado:
-- Este campo YA NO SE USARA para pre-aprobar artistas
-- El estado de aprobacion ahora se maneja en artistas_fases.estado
-- basado en resultados de votaciones
-- Mantenemos el campo por compatibilidad pero lo ignoramos

-- =====================================================
-- ESTADOS POSIBLES en artistas_fases.estado:
-- =====================================================
-- 'inscrito'    -> Artista inscrito, esperando votaciones
-- 'votando'     -> Fase de votaciones activa
-- 'aprobado'    -> Paso las votaciones, va a siguiente fase
-- 'rechazado'   -> No paso las votaciones
-- 'en_espera'   -> Admin lo puso en espera para siguiente fase
-- =====================================================

-- =====================================================
-- FIN DE LA MIGRATION
-- =====================================================
SELECT 'Migration 008 completada' as info;

-- Verificar estructura
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'artistas_fases'
ORDER BY ordinal_position;
