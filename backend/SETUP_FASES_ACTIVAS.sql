-- =====================================================
-- SCRIPT: Verificar y configurar fases activas
-- =====================================================
-- Ejecuta esto en Railway PostgreSQL para preparar el sistema
-- =====================================================

-- 1. VERIFICAR que la tabla artistas_fases existe
SELECT
  CASE
    WHEN EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_name = 'artistas_fases'
    ) THEN '✅ Tabla artistas_fases existe'
    ELSE '❌ ERROR: Tabla artistas_fases NO existe - corre las migraciones primero'
  END as status;

-- 2. VERIFICAR estructura de artistas_fases
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'artistas_fases'
ORDER BY ordinal_position;

-- 3. VERIFICAR que existe la tabla fases
SELECT
  CASE
    WHEN EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_name = 'fases'
    ) THEN '✅ Tabla fases existe'
    ELSE '❌ ERROR: Tabla fases NO existe - corre las migraciones primero'
  END as status;

-- 4. VER fases actuales
SELECT
  id,
  nombre,
  inscripciones_abiertas,
  votaciones_abiertas,
  finalizada,
  created_at
FROM fases
ORDER BY created_at DESC;

-- 5. VER si hay ediciones
SELECT id, nombre, anio, activa
FROM ediciones
ORDER BY created_at DESC;

-- =====================================================
-- SI NO HAY FASES, EJECUTA ESTO:
-- =====================================================

-- Asegurarse de que existe al menos una edición
INSERT INTO ediciones (nombre, anio, descripcion, fecha_inicio, fecha_fin, activa)
SELECT
  'ARTEFACT 2027',
  2027,
  'Primera edición de ARTEFACT - Feria de Arte Contemporáneo',
  '2027-01-15 00:00:00',
  '2027-03-31 23:59:59',
  true
WHERE NOT EXISTS (SELECT 1 FROM ediciones WHERE anio = 2027);

-- Crear Fase 1 con inscripciones ABIERTAS
INSERT INTO fases (
  nombre,
  edicion_id,
  descripcion,
  numero_fase,
  inscripciones_abiertas,
  votaciones_abiertas,
  finalizada,
  fecha_inicio_inscripciones,
  fecha_fin_inscripciones
)
SELECT
  'Fase 1 - Registro de Artistas',
  (SELECT id FROM ediciones WHERE anio = 2027 LIMIT 1),
  'Fase de registro e inscripción de artistas para ARTEFACT 2027',
  1,
  true,  -- ✅ INSCRIPCIONES ABIERTAS
  false,
  false,
  NOW(),
  NOW() + INTERVAL '30 days'
WHERE NOT EXISTS (
  SELECT 1 FROM fases
  WHERE nombre = 'Fase 1 - Registro de Artistas'
);

-- =====================================================
-- VERIFICAR QUE TODO QUEDÓ BIEN
-- =====================================================

-- Ver fases después de crear
SELECT
  f.id,
  f.nombre,
  f.inscripciones_abiertas,
  f.votaciones_abiertas,
  e.nombre as edicion
FROM fases f
LEFT JOIN ediciones e ON e.id = f.edicion_id
ORDER BY f.created_at DESC;

-- Ver si hay artistas inscritos
SELECT
  a.id,
  a.nombre,
  a.apellido,
  a.estado_registro,
  af.fase_id,
  f.nombre as fase
FROM artistas a
LEFT JOIN artistas_fases af ON af.artista_id = a.id
LEFT JOIN fases f ON f.id = af.fase_id
ORDER BY a.created_at DESC;

-- =====================================================
-- QUERIES ÚTILES
-- =====================================================

-- Ver cuántos artistas hay por fase
SELECT
  f.nombre as fase,
  COUNT(af.artista_id) as total_artistas,
  COUNT(CASE WHEN a.estado_registro = 'pendiente' THEN 1 END) as pendientes,
  COUNT(CASE WHEN a.estado_registro = 'aprobado' THEN 1 END) as aprobados
FROM fases f
LEFT JOIN artistas_fases af ON af.fase_id = f.id
LEFT JOIN artistas a ON a.id = af.artista_id
GROUP BY f.id, f.nombre
ORDER BY f.created_at DESC;

-- Ver artistas SIN fase asignada
SELECT
  a.id,
  a.nombre,
  a.apellido,
  a.email,
  a.estado_registro
FROM artistas a
LEFT JOIN artistas_fases af ON af.artista_id = a.id
WHERE af.id IS NULL;

-- =====================================================
-- SI TIENES ARTISTAS SIN FASE, ASIGNARLOS:
-- =====================================================

-- Asignar todos los artistas sin fase a la Fase 1
INSERT INTO artistas_fases (artista_id, fase_id, seleccionado)
SELECT
  a.id,
  (SELECT id FROM fases WHERE inscripciones_abiertas = true ORDER BY created_at DESC LIMIT 1),
  false
FROM artistas a
LEFT JOIN artistas_fases af ON af.artista_id = a.id
WHERE af.id IS NULL
  AND EXISTS (SELECT 1 FROM fases WHERE inscripciones_abiertas = true)
ON CONFLICT (artista_id, fase_id) DO NOTHING;

-- =====================================================
-- RESUMEN FINAL
-- =====================================================

SELECT '=== RESUMEN ===' as info;

SELECT
  'Total de artistas:' as metrica,
  COUNT(*) as valor
FROM artistas
UNION ALL
SELECT
  'Artistas pendientes:',
  COUNT(*)
FROM artistas
WHERE estado_registro = 'pendiente'
UNION ALL
SELECT
  'Artistas aprobados:',
  COUNT(*)
FROM artistas
WHERE estado_registro = 'aprobado'
UNION ALL
SELECT
  'Total de fases:',
  COUNT(*)
FROM fases
UNION ALL
SELECT
  'Fases con inscripciones abiertas:',
  COUNT(*)
FROM fases
WHERE inscripciones_abiertas = true
UNION ALL
SELECT
  'Artistas inscritos en fases:',
  COUNT(*)
FROM artistas_fases;
