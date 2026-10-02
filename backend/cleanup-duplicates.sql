-- Script para limpiar perfiles dobles en artistas_fases
-- Ejecutar este script en la base de datos de producción

-- 1. Ver cuántos perfiles dobles hay
SELECT
  a.id,
  a.email,
  a.nombre,
  a.apellido,
  array_agg(DISTINCT f.nombre ORDER BY f.nombre) as fases,
  array_agg(DISTINCT f.id ORDER BY f.id) as fase_ids
FROM artistas a
JOIN artistas_fases af ON af.artista_id = a.id
JOIN fases f ON f.id = af.fase_id
GROUP BY a.id, a.email, a.nombre, a.apellido
HAVING COUNT(DISTINCT af.fase_id) > 1
ORDER BY a.id;

-- 2. Limpiar duplicados manualmente
-- Para cada artista con perfil doble, ejecutar:

-- Ejemplo: Si artista 98 está en Fase 2 (7) y Concurso (8), y queremos dejarlo SOLO en Concurso:
-- DELETE FROM artistas_fases WHERE artista_id = 98 AND fase_id = 7;

-- Ejemplo: Si artista 120 está en Fase 2 (7) y Concurso (8), y queremos dejarlo SOLO en Concurso:
-- DELETE FROM artistas_fases WHERE artista_id = 120 AND fase_id = 7;

-- 3. Verificar que ya no hay duplicados
SELECT
  COUNT(*) as artistas_con_perfiles_dobles
FROM (
  SELECT artista_id
  FROM artistas_fases
  GROUP BY artista_id
  HAVING COUNT(DISTINCT fase_id) > 1
) sub;
-- Resultado esperado: 0

-- 4. Verificar el estado final
SELECT
  f.nombre as fase,
  COUNT(DISTINCT af.artista_id) as total_artistas
FROM fases f
LEFT JOIN artistas_fases af ON af.fase_id = f.id
GROUP BY f.id, f.nombre
ORDER BY f.nombre;
