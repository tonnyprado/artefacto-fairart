-- ════════════════════════════════════════════════════════════════════
-- 001 · AGREGAR CAMPO TAGS A ARTISTAS
-- Agrega un campo para almacenar etiquetas/tags como array de strings
-- Ejemplo: ['Fase 2', 'Concurso', 'Premium']
-- ════════════════════════════════════════════════════════════════════

-- Agregar columna tags como array de texto (default: array vacío)
ALTER TABLE artistas
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Crear índice GIN para búsquedas eficientes en el array de tags
CREATE INDEX IF NOT EXISTS idx_artistas_tags ON artistas USING GIN (tags);

-- Comentario explicativo
COMMENT ON COLUMN artistas.tags IS 'Etiquetas del artista (ej: fase de inscripción, categorías especiales, etc.)';
