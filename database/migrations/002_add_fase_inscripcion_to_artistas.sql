-- Migration: Agregar campo fase_inscripcion_id a tabla artistas
-- Fecha: 2026-08-09
-- Descripción: Registrar en qué fase se inscribió cada artista

-- 1. Agregar columna fase_inscripcion_id
ALTER TABLE artistas
ADD COLUMN IF NOT EXISTS fase_inscripcion_id INTEGER REFERENCES fases(id) ON DELETE SET NULL;

-- 2. Agregar comentario a la columna
COMMENT ON COLUMN artistas.fase_inscripcion_id IS 'ID de la fase en la que el artista se registró por primera vez (Fase 1, 2, 3)';

-- 3. Crear índice para mejorar consultas
CREATE INDEX IF NOT EXISTS idx_artistas_fase_inscripcion ON artistas(fase_inscripcion_id);

-- 4. Actualizar artistas existentes (asignar a Fase 1 por defecto si existe)
-- Solo actualizar artistas que no tengan fase asignada
UPDATE artistas
SET fase_inscripcion_id = (SELECT id FROM fases WHERE numero_fase = 1 AND tipo = 'fase' LIMIT 1)
WHERE fase_inscripcion_id IS NULL
  AND EXISTS (SELECT 1 FROM fases WHERE numero_fase = 1 AND tipo = 'fase');
