-- =====================================================
-- MIGRATION: Agregar soporte para Ediciones y Fases
-- =====================================================
-- Descripción: Crea tabla de ediciones y actualiza tabla de fases
--             para soportar la jerarquía EDICION -> FASES -> ARTISTAS
-- Fecha: 2024
-- =====================================================

-- 1. Crear tabla de EDICIONES
CREATE TABLE IF NOT EXISTS ediciones (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  anio INTEGER NOT NULL,
  descripcion TEXT,
  fecha_inicio TIMESTAMP NOT NULL,
  fecha_fin TIMESTAMP NOT NULL,
  evento_id INTEGER,
  activa BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para ediciones
CREATE INDEX idx_ediciones_activa ON ediciones(activa);
CREATE INDEX idx_ediciones_anio ON ediciones(anio);

-- 2. Verificar si la tabla fases existe, si no, crearla
CREATE TABLE IF NOT EXISTS fases (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Agregar columnas nuevas a la tabla FASES (si no existen)
-- Usamos ALTER TABLE con IF NOT EXISTS para evitar errores si ya existen

-- Relación con edición
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='fases' AND column_name='edicion_id') THEN
    ALTER TABLE fases ADD COLUMN edicion_id INTEGER REFERENCES ediciones(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Tipo de fase
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='fases' AND column_name='tipo') THEN
    ALTER TABLE fases ADD COLUMN tipo VARCHAR(50) DEFAULT 'fase';
  END IF;
END $$;

-- Número de fase
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='fases' AND column_name='numero_fase') THEN
    ALTER TABLE fases ADD COLUMN numero_fase INTEGER;
  END IF;
END $$;

-- Fechas de inscripciones
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='fases' AND column_name='fecha_inicio_inscripciones') THEN
    ALTER TABLE fases ADD COLUMN fecha_inicio_inscripciones TIMESTAMP;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='fases' AND column_name='fecha_fin_inscripciones') THEN
    ALTER TABLE fases ADD COLUMN fecha_fin_inscripciones TIMESTAMP;
  END IF;
END $$;

-- Fechas de votaciones
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='fases' AND column_name='fecha_inicio_votaciones') THEN
    ALTER TABLE fases ADD COLUMN fecha_inicio_votaciones TIMESTAMP;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='fases' AND column_name='fecha_fin_votaciones') THEN
    ALTER TABLE fases ADD COLUMN fecha_fin_votaciones TIMESTAMP;
  END IF;
END $$;

-- Estados de inscripciones y votaciones
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='fases' AND column_name='inscripciones_abiertas') THEN
    ALTER TABLE fases ADD COLUMN inscripciones_abiertas BOOLEAN DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='fases' AND column_name='votaciones_abiertas') THEN
    ALTER TABLE fases ADD COLUMN votaciones_abiertas BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Estado de finalización
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='fases' AND column_name='finalizada') THEN
    ALTER TABLE fases ADD COLUMN finalizada BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Max artistas para concursos
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='fases' AND column_name='max_artistas_seleccionados') THEN
    ALTER TABLE fases ADD COLUMN max_artistas_seleccionados INTEGER;
  END IF;
END $$;

-- Contadores (campos calculados/cache)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='fases' AND column_name='total_inscritos') THEN
    ALTER TABLE fases ADD COLUMN total_inscritos INTEGER DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='fases' AND column_name='total_seleccionados') THEN
    ALTER TABLE fases ADD COLUMN total_seleccionados INTEGER DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='fases' AND column_name='total_curadores') THEN
    ALTER TABLE fases ADD COLUMN total_curadores INTEGER DEFAULT 0;
  END IF;
END $$;

-- 4. Crear índices para fases
CREATE INDEX IF NOT EXISTS idx_fases_edicion_id ON fases(edicion_id);
CREATE INDEX IF NOT EXISTS idx_fases_tipo ON fases(tipo);
CREATE INDEX IF NOT EXISTS idx_fases_inscripciones_abiertas ON fases(inscripciones_abiertas);
CREATE INDEX IF NOT EXISTS idx_fases_votaciones_abiertas ON fases(votaciones_abiertas);
CREATE INDEX IF NOT EXISTS idx_fases_finalizada ON fases(finalizada);

-- 5. Crear tabla artistas_fases si no existe (relación many-to-many)
CREATE TABLE IF NOT EXISTS artistas_fases (
  id SERIAL PRIMARY KEY,
  artista_id INTEGER NOT NULL,
  fase_id INTEGER NOT NULL REFERENCES fases(id) ON DELETE CASCADE,
  seleccionado BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(artista_id, fase_id)
);

CREATE INDEX IF NOT EXISTS idx_artistas_fases_artista ON artistas_fases(artista_id);
CREATE INDEX IF NOT EXISTS idx_artistas_fases_fase ON artistas_fases(fase_id);
CREATE INDEX IF NOT EXISTS idx_artistas_fases_seleccionado ON artistas_fases(seleccionado);

-- 6. Insertar edición inicial (ARTEFACT 2027) si no existe
INSERT INTO ediciones (nombre, anio, descripcion, fecha_inicio, fecha_fin, activa)
SELECT
  'ARTEFACT 2027',
  2027,
  'Primera edición de ARTEFACT - Feria de Arte Contemporáneo',
  '2027-01-15 00:00:00',
  '2027-03-31 23:59:59',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM ediciones WHERE nombre = 'ARTEFACT 2027'
);

-- 7. Obtener el ID de la edición creada (para las fases)
DO $$
DECLARE
  edicion_id_var INTEGER;
BEGIN
  SELECT id INTO edicion_id_var FROM ediciones WHERE nombre = 'ARTEFACT 2027' LIMIT 1;

  -- Insertar Fase 1 si no existe
  IF NOT EXISTS (SELECT 1 FROM fases WHERE nombre = 'Fase 1 - Selección Inicial') THEN
    INSERT INTO fases (
      edicion_id, nombre, descripcion, tipo, numero_fase,
      fecha_inicio_inscripciones, fecha_fin_inscripciones,
      fecha_inicio_votaciones, fecha_fin_votaciones,
      inscripciones_abiertas, votaciones_abiertas, finalizada,
      total_inscritos, total_seleccionados, total_curadores
    ) VALUES (
      edicion_id_var,
      'Fase 1 - Selección Inicial',
      'Primera fase de selección de artistas para ARTEFACT 2027',
      'fase',
      1,
      '2027-01-15 00:00:00',
      '2027-01-31 23:59:59',
      '2027-02-01 00:00:00',
      '2027-02-15 23:59:59',
      false,
      false,
      false,
      0,
      0,
      0
    );
  END IF;

  -- Insertar Fase 2 si no existe
  IF NOT EXISTS (SELECT 1 FROM fases WHERE nombre = 'Fase 2 - Selección Intermedia') THEN
    INSERT INTO fases (
      edicion_id, nombre, descripcion, tipo, numero_fase,
      fecha_inicio_inscripciones, fecha_fin_inscripciones,
      fecha_inicio_votaciones, fecha_fin_votaciones,
      inscripciones_abiertas, votaciones_abiertas, finalizada,
      total_inscritos, total_seleccionados, total_curadores
    ) VALUES (
      edicion_id_var,
      'Fase 2 - Selección Intermedia',
      'Segunda fase de selección para artistas que pasaron la Fase 1',
      'fase',
      2,
      NULL,
      NULL,
      '2027-02-16 00:00:00',
      '2027-02-28 23:59:59',
      false,
      false,
      false,
      0,
      0,
      0
    );
  END IF;

  -- Insertar Fase 3 si no existe
  IF NOT EXISTS (SELECT 1 FROM fases WHERE nombre = 'Fase 3 - Selección Final') THEN
    INSERT INTO fases (
      edicion_id, nombre, descripcion, tipo, numero_fase,
      fecha_inicio_inscripciones, fecha_fin_inscripciones,
      fecha_inicio_votaciones, fecha_fin_votaciones,
      inscripciones_abiertas, votaciones_abiertas, finalizada,
      total_inscritos, total_seleccionados, total_curadores
    ) VALUES (
      edicion_id_var,
      'Fase 3 - Selección Final',
      'Tercera y última fase de selección',
      'fase',
      3,
      NULL,
      NULL,
      '2027-03-01 00:00:00',
      '2027-03-15 23:59:59',
      false,
      false,
      false,
      0,
      0,
      0
    );
  END IF;

  -- Insertar Concurso Final si no existe
  IF NOT EXISTS (SELECT 1 FROM fases WHERE nombre = 'Concurso Final') THEN
    INSERT INTO fases (
      edicion_id, nombre, descripcion, tipo, numero_fase,
      fecha_inicio_inscripciones, fecha_fin_inscripciones,
      fecha_inicio_votaciones, fecha_fin_votaciones,
      inscripciones_abiertas, votaciones_abiertas, finalizada,
      max_artistas_seleccionados,
      total_inscritos, total_seleccionados, total_curadores
    ) VALUES (
      edicion_id_var,
      'Concurso Final',
      'Concurso final para seleccionar a los ganadores de ARTEFACT 2027',
      'concurso',
      NULL,
      NULL,
      NULL,
      '2027-03-16 00:00:00',
      '2027-03-30 23:59:59',
      false,
      false,
      false,
      10,
      0,
      0,
      0
    );
  END IF;
END $$;

-- 8. Función para actualizar automáticamente updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Triggers para updated_at
DROP TRIGGER IF EXISTS update_ediciones_updated_at ON ediciones;
CREATE TRIGGER update_ediciones_updated_at
  BEFORE UPDATE ON ediciones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_fases_updated_at ON fases;
CREATE TRIGGER update_fases_updated_at
  BEFORE UPDATE ON fases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FIN DE LA MIGRATION
-- =====================================================
-- Verificación:
SELECT 'Ediciones creadas:' as info, COUNT(*) as total FROM ediciones;
SELECT 'Fases creadas:' as info, COUNT(*) as total FROM fases;
