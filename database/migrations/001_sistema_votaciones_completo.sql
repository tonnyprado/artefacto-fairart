-- ============================================================================
-- MIGRACIÓN: Sistema de Votaciones Completo - ARTEFACT
-- Fecha: 2026-09-20
-- Descripción: Implementa el sistema de 3 rondas con todas las funcionalidades
-- ============================================================================

-- ============================================================================
-- 1. MODIFICAR TABLA FASES - Agregar config_json
-- ============================================================================

ALTER TABLE fases ADD COLUMN IF NOT EXISTS config_json JSONB DEFAULT '{
  "curadores": 6,
  "quorum": 5,
  "cupo_2d": 8,
  "cupo_3d": null,
  "umbral_r1": 0.60,
  "umbral_reserva": 0.30,
  "votos_r2": 10,
  "umbral_consenso": 0.80,
  "umbral_delib": 0.50,
  "cortesia_max": 4,
  "piezas_cortesia_min": 1,
  "piezas_cortesia_max": 3
}'::jsonb;

ALTER TABLE fases ADD COLUMN IF NOT EXISTS fecha_publicacion TIMESTAMP;
ALTER TABLE fases ADD COLUMN IF NOT EXISTS porcentaje_seleccion DECIMAL(5, 2) DEFAULT 20.00;

COMMENT ON COLUMN fases.config_json IS 'Parámetros configurables de la fase según especificación';

-- ============================================================================
-- 2. CREAR TABLA POSTULACIONES
-- ============================================================================

CREATE TABLE IF NOT EXISTS postulaciones (
  id SERIAL PRIMARY KEY,
  fase_origen_id INTEGER NOT NULL REFERENCES fases(id) ON DELETE CASCADE,
  artista_id INTEGER NOT NULL REFERENCES artistas(id) ON DELETE CASCADE,
  disciplina VARCHAR(100) NOT NULL,
  tipo VARCHAR(3) NOT NULL CHECK (tipo IN ('2d', '3d')),
  estado VARCHAR(50) DEFAULT 'admitida' CHECK (estado IN (
    'admitida', 'ronda_1', 'shortlist', 'reserva',
    'ronda_2', 'deliberacion', 'ronda_3',
    'seleccionada', 'cortesia', 'no_continua'
  )),
  fase_actual_id INTEGER REFERENCES fases(id) ON DELETE CASCADE,
  es_carryover BOOLEAN DEFAULT false,

  -- Métricas de votación
  indice_r1 DECIMAL(5, 4), -- Índice de respaldo Ronda 1 (0.0000 - 1.0000)
  respaldo_r2 DECIMAL(5, 4), -- Respaldo Ronda 2 (0.0000 - 1.0000)
  aprobacion_r3 DECIMAL(5, 4), -- Aprobación Ronda 3 (0.0000 - 1.0000)
  posicion INTEGER, -- Posición en el ranking final

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(artista_id, fase_origen_id)
);

CREATE INDEX idx_postulaciones_fase_origen ON postulaciones(fase_origen_id);
CREATE INDEX idx_postulaciones_fase_actual ON postulaciones(fase_actual_id);
CREATE INDEX idx_postulaciones_artista ON postulaciones(artista_id);
CREATE INDEX idx_postulaciones_estado ON postulaciones(estado);
CREATE INDEX idx_postulaciones_tipo ON postulaciones(tipo);
CREATE INDEX idx_postulaciones_carryover ON postulaciones(es_carryover);

COMMENT ON TABLE postulaciones IS 'Postulaciones de artistas con su ciclo de vida completo';

-- ============================================================================
-- 3. MIGRAR DATOS DE artistas_fases A postulaciones
-- ============================================================================

-- Migrar registros existentes
INSERT INTO postulaciones (
  fase_origen_id, artista_id, disciplina, tipo, estado, fase_actual_id,
  es_carryover, created_at
)
SELECT
  COALESCE(af.fase_origen_id, af.fase_id) as fase_origen_id,
  af.artista_id,
  COALESCE(a.categoria, 'sin_categoria') as disciplina,
  '2d' as tipo, -- Por defecto 2d, actualizar manualmente si es necesario
  CASE
    WHEN af.seleccionado THEN 'seleccionada'
    WHEN af.estado = 'inscrito' THEN 'admitida'
    ELSE 'no_continua'
  END as estado,
  af.fase_id as fase_actual_id,
  COALESCE(af.es_rescatado, false) as es_carryover,
  af.created_at
FROM artistas_fases af
JOIN artistas a ON a.id = af.artista_id
ON CONFLICT (artista_id, fase_origen_id) DO NOTHING;

-- ============================================================================
-- 4. CREAR TABLA RONDAS
-- ============================================================================

CREATE TABLE IF NOT EXISTS rondas (
  id SERIAL PRIMARY KEY,
  fase_id INTEGER NOT NULL REFERENCES fases(id) ON DELETE CASCADE,
  numero INTEGER NOT NULL CHECK (numero IN (1, 2, 3)),
  estado VARCHAR(20) DEFAULT 'cerrada' CHECK (estado IN ('abierta', 'cerrada')),
  fecha_apertura TIMESTAMP,
  fecha_cierre TIMESTAMP,
  votos_asignados INTEGER, -- Solo para Ronda 2 (por curador)

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(fase_id, numero)
);

CREATE INDEX idx_rondas_fase ON rondas(fase_id);
CREATE INDEX idx_rondas_estado ON rondas(estado);
CREATE INDEX idx_rondas_numero ON rondas(numero);

COMMENT ON TABLE rondas IS 'Rondas de votación por fase';

-- ============================================================================
-- 5. ACTUALIZAR TABLA VOTACIONES
-- ============================================================================

-- Agregar nuevas columnas
ALTER TABLE votaciones ADD COLUMN IF NOT EXISTS ronda_id INTEGER REFERENCES rondas(id) ON DELETE CASCADE;
ALTER TABLE votaciones ADD COLUMN IF NOT EXISTS postulacion_id INTEGER REFERENCES postulaciones(id) ON DELETE CASCADE;
ALTER TABLE votaciones ADD COLUMN IF NOT EXISTS valor INTEGER CHECK (valor IN (0, 1, 2));
ALTER TABLE votaciones ADD COLUMN IF NOT EXISTS conoce_artista BOOLEAN DEFAULT false;

-- Actualizar constraint para incluir ronda_id
ALTER TABLE votaciones DROP CONSTRAINT IF EXISTS votaciones_curador_id_artista_id_fase_id_key;
ALTER TABLE votaciones ADD CONSTRAINT votaciones_curador_postulacion_ronda_unique
  UNIQUE(curador_id, postulacion_id, ronda_id);

CREATE INDEX IF NOT EXISTS idx_votaciones_ronda ON votaciones(ronda_id);
CREATE INDEX IF NOT EXISTS idx_votaciones_postulacion ON votaciones(postulacion_id);
CREATE INDEX IF NOT EXISTS idx_votaciones_valor ON votaciones(valor);
CREATE INDEX IF NOT EXISTS idx_votaciones_conoce_artista ON votaciones(conoce_artista);

COMMENT ON COLUMN votaciones.valor IS 'R1: 2=Sí, 1=Tal vez, 0=No | R2: 1=voto | R3: 1=Sí, 0=No';
COMMENT ON COLUMN votaciones.conoce_artista IS 'Marca si el curador conoce personalmente al artista';

-- ============================================================================
-- 6. ACTUALIZAR TABLA OBRAS
-- ============================================================================

ALTER TABLE obras ADD COLUMN IF NOT EXISTS postulacion_id INTEGER REFERENCES postulaciones(id) ON DELETE CASCADE;
ALTER TABLE obras ADD COLUMN IF NOT EXISTS tecnica VARCHAR(255);
ALTER TABLE obras ADD COLUMN IF NOT EXISTS anio INTEGER;
ALTER TABLE obras ADD COLUMN IF NOT EXISTS medida_alto DECIMAL(8, 2);
ALTER TABLE obras ADD COLUMN IF NOT EXISTS medida_ancho DECIMAL(8, 2);
ALTER TABLE obras ADD COLUMN IF NOT EXISTS medida_prof DECIMAL(8, 2);
ALTER TABLE obras ADD COLUMN IF NOT EXISTS ganancia_deseada DECIMAL(10, 2);
ALTER TABLE obras ADD COLUMN IF NOT EXISTS notas TEXT;
ALTER TABLE obras ADD COLUMN IF NOT EXISTS orden INTEGER DEFAULT 0;

-- Renombrar columnas existentes si es necesario
ALTER TABLE obras RENAME COLUMN dimensiones TO dimensiones_legacy;

CREATE INDEX IF NOT EXISTS idx_obras_postulacion ON obras(postulacion_id);
CREATE INDEX IF NOT EXISTS idx_obras_orden ON obras(orden);

COMMENT ON TABLE obras IS 'Obras de arte asociadas a postulaciones';

-- ============================================================================
-- 7. CREAR TABLA JUSTIFICACIONES
-- ============================================================================

CREATE TABLE IF NOT EXISTS justificaciones (
  id SERIAL PRIMARY KEY,
  fase_id INTEGER NOT NULL REFERENCES fases(id) ON DELETE CASCADE,
  curador_id INTEGER NOT NULL REFERENCES curadores(id) ON DELETE CASCADE,
  perfil TEXT,
  lineas_tematicas TEXT,
  observaciones TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(fase_id, curador_id)
);

CREATE INDEX idx_justificaciones_fase ON justificaciones(fase_id);
CREATE INDEX idx_justificaciones_curador ON justificaciones(curador_id);

COMMENT ON TABLE justificaciones IS 'Justificaciones de curadores al cierre de cada fase';

-- ============================================================================
-- 8. CREAR TABLA SELECCIÓN DE PIEZAS (Cortesía)
-- ============================================================================

CREATE TABLE IF NOT EXISTS seleccion_piezas (
  id SERIAL PRIMARY KEY,
  fase_id INTEGER NOT NULL REFERENCES fases(id) ON DELETE CASCADE,
  curador_id INTEGER NOT NULL REFERENCES curadores(id) ON DELETE CASCADE,
  obra_id INTEGER NOT NULL REFERENCES obras(id) ON DELETE CASCADE,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(fase_id, curador_id, obra_id)
);

CREATE INDEX idx_seleccion_piezas_fase ON seleccion_piezas(fase_id);
CREATE INDEX idx_seleccion_piezas_curador ON seleccion_piezas(curador_id);
CREATE INDEX idx_seleccion_piezas_obra ON seleccion_piezas(obra_id);

COMMENT ON TABLE seleccion_piezas IS 'Selección de piezas por curador para concurso de cortesía';

-- ============================================================================
-- 9. CREAR TABLA DE LOG DE ACCIONES
-- ============================================================================

CREATE TABLE IF NOT EXISTS log_votaciones (
  id SERIAL PRIMARY KEY,
  fase_id INTEGER REFERENCES fases(id) ON DELETE CASCADE,
  ronda_id INTEGER REFERENCES rondas(id) ON DELETE CASCADE,
  curador_id INTEGER REFERENCES curadores(id) ON DELETE SET NULL,
  postulacion_id INTEGER REFERENCES postulaciones(id) ON DELETE SET NULL,
  accion VARCHAR(100) NOT NULL, -- 'voto_creado', 'voto_actualizado', 'voto_eliminado', 'ronda_cerrada', 'ronda_abierta', 'estado_cambiado'
  valor_anterior JSONB,
  valor_nuevo JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_log_votaciones_fase ON log_votaciones(fase_id);
CREATE INDEX idx_log_votaciones_ronda ON log_votaciones(ronda_id);
CREATE INDEX idx_log_votaciones_curador ON log_votaciones(curador_id);
CREATE INDEX idx_log_votaciones_accion ON log_votaciones(accion);
CREATE INDEX idx_log_votaciones_created ON log_votaciones(created_at DESC);

COMMENT ON TABLE log_votaciones IS 'Log inmutable de todas las acciones del sistema de votaciones';

-- ============================================================================
-- 10. TRIGGERS PARA UPDATED_AT
-- ============================================================================

CREATE TRIGGER update_postulaciones_updated_at
  BEFORE UPDATE ON postulaciones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rondas_updated_at
  BEFORE UPDATE ON rondas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_justificaciones_updated_at
  BEFORE UPDATE ON justificaciones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 11. FUNCIONES AUXILIARES
-- ============================================================================

-- Función para calcular índice de Ronda 1
CREATE OR REPLACE FUNCTION calcular_indice_r1(p_postulacion_id INTEGER)
RETURNS DECIMAL(5, 4) AS $$
DECLARE
  v_suma INTEGER;
  v_votos INTEGER;
  v_indice DECIMAL(5, 4);
BEGIN
  SELECT
    COALESCE(SUM(valor), 0),
    COUNT(*)
  INTO v_suma, v_votos
  FROM votaciones v
  JOIN rondas r ON r.id = v.ronda_id
  WHERE v.postulacion_id = p_postulacion_id
    AND r.numero = 1;

  IF v_votos = 0 THEN
    RETURN NULL;
  END IF;

  v_indice := v_suma::DECIMAL / (2.0 * v_votos);
  RETURN v_indice;
END;
$$ LANGUAGE plpgsql;

-- Función para calcular respaldo de Ronda 2
CREATE OR REPLACE FUNCTION calcular_respaldo_r2(p_postulacion_id INTEGER)
RETURNS DECIMAL(5, 4) AS $$
DECLARE
  v_votos_artista INTEGER;
  v_total_curadores_votaron INTEGER;
  v_respaldo DECIMAL(5, 4);
BEGIN
  -- Curadores que votaron a este artista
  SELECT COUNT(DISTINCT curador_id)
  INTO v_votos_artista
  FROM votaciones v
  JOIN rondas r ON r.id = v.ronda_id
  WHERE v.postulacion_id = p_postulacion_id
    AND r.numero = 2
    AND v.valor = 1;

  -- Total de curadores que votaron en la ronda
  SELECT COUNT(DISTINCT v.curador_id)
  INTO v_total_curadores_votaron
  FROM votaciones v
  JOIN rondas r ON r.id = v.ronda_id
  JOIN postulaciones p ON p.id = v.postulacion_id
  WHERE p.id = p_postulacion_id
    AND r.numero = 2;

  IF v_total_curadores_votaron = 0 THEN
    RETURN NULL;
  END IF;

  v_respaldo := v_votos_artista::DECIMAL / v_total_curadores_votaron;
  RETURN v_respaldo;
END;
$$ LANGUAGE plpgsql;

-- Función para calcular aprobación de Ronda 3
CREATE OR REPLACE FUNCTION calcular_aprobacion_r3(p_postulacion_id INTEGER)
RETURNS DECIMAL(5, 4) AS $$
DECLARE
  v_votos_si INTEGER;
  v_total_votos INTEGER;
  v_aprobacion DECIMAL(5, 4);
BEGIN
  SELECT
    COUNT(CASE WHEN valor = 1 THEN 1 END),
    COUNT(*)
  INTO v_votos_si, v_total_votos
  FROM votaciones v
  JOIN rondas r ON r.id = v.ronda_id
  WHERE v.postulacion_id = p_postulacion_id
    AND r.numero = 3;

  IF v_total_votos = 0 THEN
    RETURN NULL;
  END IF;

  v_aprobacion := v_votos_si::DECIMAL / v_total_votos;
  RETURN v_aprobacion;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 12. VISTA: Postulaciones con métricas calculadas
-- ============================================================================

CREATE OR REPLACE VIEW v_postulaciones_metricas AS
SELECT
  p.*,
  a.nombre,
  a.apellido,
  a.email as artista_email,
  a.foto as artista_foto,
  f_origen.nombre as fase_origen_nombre,
  f_actual.nombre as fase_actual_nombre,

  -- Ronda 1
  calcular_indice_r1(p.id) as indice_r1_calculado,
  (SELECT COUNT(*) FROM votaciones v JOIN rondas r ON r.id = v.ronda_id
   WHERE v.postulacion_id = p.id AND r.numero = 1) as total_votos_r1,

  -- Ronda 2
  calcular_respaldo_r2(p.id) as respaldo_r2_calculado,
  (SELECT COUNT(*) FROM votaciones v JOIN rondas r ON r.id = v.ronda_id
   WHERE v.postulacion_id = p.id AND r.numero = 2) as total_votos_r2,

  -- Ronda 3
  calcular_aprobacion_r3(p.id) as aprobacion_r3_calculado,
  (SELECT COUNT(*) FROM votaciones v JOIN rondas r ON r.id = v.ronda_id
   WHERE v.postulacion_id = p.id AND r.numero = 3) as total_votos_r3,

  -- Obras
  (SELECT COUNT(*) FROM obras WHERE postulacion_id = p.id) as total_obras

FROM postulaciones p
JOIN artistas a ON a.id = p.artista_id
LEFT JOIN fases f_origen ON f_origen.id = p.fase_origen_id
LEFT JOIN fases f_actual ON f_actual.id = p.fase_actual_id;

-- ============================================================================
-- 13. DATOS INICIALES
-- ============================================================================

-- Insertar configuración por defecto en fases existentes
UPDATE fases
SET config_json = '{
  "curadores": 6,
  "quorum": 5,
  "cupo_2d": 8,
  "cupo_3d": null,
  "umbral_r1": 0.60,
  "umbral_reserva": 0.30,
  "votos_r2": 10,
  "umbral_consenso": 0.80,
  "umbral_delib": 0.50,
  "cortesia_max": 4,
  "piezas_cortesia_min": 1,
  "piezas_cortesia_max": 3
}'::jsonb
WHERE config_json IS NULL;

-- ============================================================================
-- FIN DE MIGRACIÓN
-- ============================================================================

-- Verificar migración
SELECT 'Migración completada exitosamente' as status;
