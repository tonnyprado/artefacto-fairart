-- =====================================================
-- MIGRATION 016: Sistema de Concurso
-- =====================================================
-- Descripción: Implementa funcionalidad de concurso con
-- selección manual de obras por admin
-- Fecha: 2026-09-29
-- =====================================================

BEGIN;

-- =====================================================
-- 1. AGREGAR CAMPO acepta_concurso A TABLA artistas
-- =====================================================

ALTER TABLE artistas
ADD COLUMN IF NOT EXISTS acepta_concurso BOOLEAN DEFAULT false;

COMMENT ON COLUMN artistas.acepta_concurso IS
'Indica si el artista acepta participar en concursos donde solo se seleccionen algunas de sus obras';

-- Índice para filtrado rápido de artistas elegibles
CREATE INDEX IF NOT EXISTS idx_artistas_acepta_concurso
ON artistas(acepta_concurso) WHERE acepta_concurso = true;

-- =====================================================
-- 2. TABLA obras_seleccionadas_concurso
-- =====================================================

CREATE TABLE IF NOT EXISTS obras_seleccionadas_concurso (
  id SERIAL PRIMARY KEY,

  -- Referencias
  fase_id INTEGER NOT NULL REFERENCES fases(id) ON DELETE CASCADE,
  artista_id INTEGER NOT NULL REFERENCES artistas(id) ON DELETE CASCADE,
  obra_id INTEGER NOT NULL REFERENCES obras(id) ON DELETE CASCADE,

  -- Metadata de selección
  seleccionada_por INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  fecha_seleccion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notas TEXT,

  -- Constraints
  UNIQUE(fase_id, obra_id), -- Una obra solo puede estar una vez por concurso

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimizar queries
CREATE INDEX IF NOT EXISTS idx_obras_concurso_fase
ON obras_seleccionadas_concurso(fase_id);

CREATE INDEX IF NOT EXISTS idx_obras_concurso_artista
ON obras_seleccionadas_concurso(artista_id);

CREATE INDEX IF NOT EXISTS idx_obras_concurso_obra
ON obras_seleccionadas_concurso(obra_id);

CREATE INDEX IF NOT EXISTS idx_obras_concurso_fecha
ON obras_seleccionadas_concurso(fecha_seleccion DESC);

COMMENT ON TABLE obras_seleccionadas_concurso IS
'Almacena las obras específicas seleccionadas por admin para cada concurso';

-- =====================================================
-- 3. VISTA v_artistas_elegibles_concurso
-- =====================================================

CREATE OR REPLACE VIEW v_artistas_elegibles_concurso AS
SELECT
  a.id,
  a.folio,
  a.nombre,
  a.apellido,
  a.nombre_artistico,
  a.email,
  a.telefono,
  a.categoria,
  a.foto,
  a.bio,
  a.instagram,
  a.website,
  a.paquete_id,
  a.acepta_concurso,
  a.aprobado,
  a.estado_registro,
  a.created_at,
  COUNT(o.id) as total_obras,
  COUNT(CASE WHEN o.en_lienzo = true THEN 1 END) as obras_en_lienzo
FROM artistas a
LEFT JOIN obras o ON o.artista_id = a.id
WHERE a.acepta_concurso = true
  AND a.aprobado = true
  AND a.estado_registro != 'pre_registrado'
GROUP BY a.id, a.folio, a.nombre, a.apellido, a.nombre_artistico, a.email,
         a.telefono, a.categoria, a.foto, a.bio, a.instagram, a.website,
         a.paquete_id, a.acepta_concurso, a.aprobado, a.estado_registro, a.created_at;

COMMENT ON VIEW v_artistas_elegibles_concurso IS
'Vista de artistas elegibles para concurso: acepta_concurso=true, aprobados, registro completo';

-- =====================================================
-- 4. FUNCIÓN validar_obra_para_concurso
-- =====================================================

CREATE OR REPLACE FUNCTION validar_obra_para_concurso(
  p_obra_id INTEGER,
  p_fase_id INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  v_artista_id INTEGER;
  v_acepta_concurso BOOLEAN;
  v_tipo_fase VARCHAR(50);
  v_obra_existe BOOLEAN;
BEGIN
  -- Verificar que la fase exista y sea de tipo concurso
  SELECT tipo INTO v_tipo_fase
  FROM fases
  WHERE id = p_fase_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Fase % no encontrada', p_fase_id;
  END IF;

  IF v_tipo_fase != 'concurso' THEN
    RAISE EXCEPTION 'La fase % no es de tipo concurso (tipo actual: %)', p_fase_id, v_tipo_fase;
  END IF;

  -- Verificar que la obra exista
  SELECT artista_id INTO v_artista_id
  FROM obras
  WHERE id = p_obra_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Obra % no encontrada', p_obra_id;
  END IF;

  -- Verificar que el artista acepta concurso
  SELECT acepta_concurso INTO v_acepta_concurso
  FROM artistas
  WHERE id = v_artista_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Artista % no encontrado', v_artista_id;
  END IF;

  IF v_acepta_concurso = false THEN
    RAISE EXCEPTION 'El artista (ID: %) no acepta participar en concursos', v_artista_id;
  END IF;

  RETURN true;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION validar_obra_para_concurso IS
'Valida que una obra pueda ser seleccionada para un concurso: fase tipo concurso + artista acepta concurso';

-- =====================================================
-- 5. CREAR FASE DE CONCURSO PERMANENTE
-- =====================================================

-- Verificar si ya existe una fase de tipo concurso
DO $$
DECLARE
  v_concurso_existente INTEGER;
  v_edicion_activa INTEGER;
BEGIN
  -- Buscar fase de concurso existente
  SELECT id INTO v_concurso_existente
  FROM fases
  WHERE tipo = 'concurso'
  LIMIT 1;

  -- Si no existe, crear una nueva
  IF v_concurso_existente IS NULL THEN
    -- Obtener edición activa o usar NULL
    SELECT id INTO v_edicion_activa
    FROM ediciones
    WHERE activa = true
    LIMIT 1;

    INSERT INTO fases (
      nombre,
      tipo,
      numero_fase,
      descripcion,
      edicion_id,
      inscripciones_abiertas,
      votaciones_abiertas,
      finalizada,
      porcentaje_seleccion,
      config_json
    ) VALUES (
      'Concurso Permanente',
      'concurso',
      NULL,
      'Concurso permanente con selección curada de obras. Los artistas deben aceptar participar durante el registro y el admin selecciona manualmente las obras que participarán.',
      v_edicion_activa,
      true,
      false,
      false,
      20.00,
      '{
        "curadores": 6,
        "quorum": 5,
        "cupo_2d": null,
        "cupo_3d": null,
        "umbral_r1": 0.60,
        "umbral_reserva": 0.30,
        "votos_r2": 10,
        "umbral_consenso": 0.80,
        "umbral_delib": 0.50,
        "cortesia_max": 4
      }'::jsonb
    );

    RAISE NOTICE 'Fase de concurso permanente creada exitosamente';
  ELSE
    RAISE NOTICE 'Ya existe una fase de tipo concurso (ID: %)', v_concurso_existente;
  END IF;
END $$;

-- =====================================================
-- 6. TRIGGER para updated_at en obras_seleccionadas_concurso
-- =====================================================

CREATE OR REPLACE FUNCTION update_obras_concurso_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_obras_concurso_timestamp
ON obras_seleccionadas_concurso;

CREATE TRIGGER trigger_update_obras_concurso_timestamp
BEFORE UPDATE ON obras_seleccionadas_concurso
FOR EACH ROW
EXECUTE FUNCTION update_obras_concurso_timestamp();

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

DO $$
DECLARE
  v_columna_existe BOOLEAN;
  v_tabla_existe BOOLEAN;
  v_vista_existe BOOLEAN;
  v_funcion_existe BOOLEAN;
  v_fase_concurso INTEGER;
BEGIN
  -- Verificar columna acepta_concurso
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'artistas' AND column_name = 'acepta_concurso'
  ) INTO v_columna_existe;

  -- Verificar tabla obras_seleccionadas_concurso
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'obras_seleccionadas_concurso'
  ) INTO v_tabla_existe;

  -- Verificar vista
  SELECT EXISTS (
    SELECT 1 FROM information_schema.views
    WHERE table_name = 'v_artistas_elegibles_concurso'
  ) INTO v_vista_existe;

  -- Verificar función
  SELECT EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname = 'validar_obra_para_concurso'
  ) INTO v_funcion_existe;

  -- Verificar fase de concurso
  SELECT id INTO v_fase_concurso
  FROM fases
  WHERE tipo = 'concurso'
  LIMIT 1;

  -- Reportar resultados
  RAISE NOTICE '========================================';
  RAISE NOTICE 'VERIFICACIÓN DE MIGRACIÓN 016';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Columna acepta_concurso: %', CASE WHEN v_columna_existe THEN '✓ OK' ELSE '✗ FALLO' END;
  RAISE NOTICE 'Tabla obras_seleccionadas_concurso: %', CASE WHEN v_tabla_existe THEN '✓ OK' ELSE '✗ FALLO' END;
  RAISE NOTICE 'Vista v_artistas_elegibles_concurso: %', CASE WHEN v_vista_existe THEN '✓ OK' ELSE '✗ FALLO' END;
  RAISE NOTICE 'Función validar_obra_para_concurso: %', CASE WHEN v_funcion_existe THEN '✓ OK' ELSE '✗ FALLO' END;
  RAISE NOTICE 'Fase de concurso permanente: %', CASE WHEN v_fase_concurso IS NOT NULL THEN '✓ OK (ID: ' || v_fase_concurso || ')' ELSE '✗ FALLO' END;
  RAISE NOTICE '========================================';

  -- Lanzar excepción si algo falló
  IF NOT (v_columna_existe AND v_tabla_existe AND v_vista_existe AND v_funcion_existe AND v_fase_concurso IS NOT NULL) THEN
    RAISE EXCEPTION 'La migración no se completó correctamente. Revisa los errores anteriores.';
  END IF;

  RAISE NOTICE 'Migración 016 completada exitosamente ✓';
END $$;

COMMIT;
