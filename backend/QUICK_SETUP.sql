-- =====================================================
-- SCRIPT RÁPIDO: Crear fase activa para registro
-- =====================================================
-- Copia y pega ESTO si tienes el error de "tipo"
-- =====================================================

-- 1. Crear edición 2027 si no existe
INSERT INTO ediciones (nombre, anio, descripcion, fecha_inicio, fecha_fin, activa)
VALUES (
  'ARTEFACT 2027',
  2027,
  'Primera edición de ARTEFACT - Feria de Arte Contemporáneo',
  '2027-01-15 00:00:00',
  '2027-03-31 23:59:59',
  true
)
ON CONFLICT DO NOTHING;

-- 2. Crear Fase 1 con inscripciones ABIERTAS
INSERT INTO fases (
  nombre,
  edicion_id,
  descripcion,
  tipo,
  numero_fase,
  inscripciones_abiertas,
  votaciones_abiertas,
  finalizada,
  fecha_inicio_inscripciones,
  fecha_fin_inscripciones
)
VALUES (
  'Fase 1 - Registro de Artistas',
  (SELECT id FROM ediciones WHERE anio = 2027 LIMIT 1),
  'Fase de registro e inscripción de artistas para ARTEFACT 2027',
  'fase',  -- ← IMPORTANTE: tipo de fase
  1,
  true,   -- ← INSCRIPCIONES ABIERTAS
  false,
  false,
  NOW(),
  NOW() + INTERVAL '30 days'
)
ON CONFLICT DO NOTHING;

-- 3. VERIFICAR que funcionó
SELECT
  id,
  nombre,
  tipo,
  inscripciones_abiertas,
  created_at
FROM fases
WHERE inscripciones_abiertas = true;

-- Deberías ver algo como:
-- id |            nombre             | tipo | inscripciones_abiertas
-- ---+-------------------------------+------+------------------------
--  1 | Fase 1 - Registro de Artistas | fase | t

-- =====================================================
-- SI YA TIENES ARTISTAS, ASIGNARLOS A LA FASE
-- =====================================================

-- Ver artistas sin fase
SELECT
  a.id,
  a.nombre,
  a.apellido,
  a.email
FROM artistas a
LEFT JOIN artistas_fases af ON af.artista_id = a.id
WHERE af.id IS NULL;

-- Asignarlos a la fase activa
INSERT INTO artistas_fases (artista_id, fase_id, seleccionado)
SELECT
  a.id,
  (SELECT id FROM fases WHERE inscripciones_abiertas = true LIMIT 1),
  false
FROM artistas a
LEFT JOIN artistas_fases af ON af.artista_id = a.id
WHERE af.id IS NULL
  AND EXISTS (SELECT 1 FROM fases WHERE inscripciones_abiertas = true)
ON CONFLICT (artista_id, fase_id) DO NOTHING;

-- =====================================================
-- RESUMEN FINAL
-- =====================================================

SELECT
  (SELECT COUNT(*) FROM ediciones WHERE activa = true) as ediciones_activas,
  (SELECT COUNT(*) FROM fases WHERE inscripciones_abiertas = true) as fases_activas,
  (SELECT COUNT(*) FROM artistas) as total_artistas,
  (SELECT COUNT(*) FROM artistas WHERE estado_registro = 'pendiente') as artistas_pendientes,
  (SELECT COUNT(*) FROM artistas_fases) as artistas_inscritos;

-- Resultado esperado:
-- ediciones_activas | fases_activas | total_artistas | artistas_pendientes | artistas_inscritos
-- ------------------+---------------+----------------+---------------------+--------------------
--                 1 |             1 |              0 |                   0 |                  0
