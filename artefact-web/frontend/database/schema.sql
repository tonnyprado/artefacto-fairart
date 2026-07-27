-- ============================================
-- ARTEFACT - Database Schema
-- ============================================

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Tabla: artistas
-- Almacena información de todos los artistas registrados
-- ============================================
CREATE TABLE IF NOT EXISTS artistas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Datos Personales
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  fecha_nacimiento DATE NOT NULL,

  -- Dirección
  pais VARCHAR(100) NOT NULL,
  ciudad VARCHAR(100) NOT NULL,
  codigo_postal VARCHAR(20),
  direccion TEXT NOT NULL,

  -- Información Artística
  categoria VARCHAR(50) NOT NULL, -- pintura, escultura, fotografía, etc.
  bio TEXT NOT NULL,

  -- Redes Sociales (JSONB para flexibilidad)
  redes_sociales JSONB DEFAULT '{}'::jsonb,
  -- Ejemplo: {"instagram": "@artista", "facebook": "fb.com/artista", "website": "www.artista.com"}

  -- Archivos (URLs de Cloudinary u otro CDN)
  foto_perfil TEXT,
  cv_url TEXT,
  portfolio_url TEXT,
  identificacion_url TEXT,

  -- Metadata
  estado VARCHAR(20) DEFAULT 'pendiente', -- pendiente, aprobado, rechazado
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Índices para búsqueda
  CONSTRAINT email_lowercase CHECK (email = LOWER(email))
);

-- ============================================
-- Tabla: fases
-- Catálogo de fases de selección
-- ============================================
CREATE TABLE IF NOT EXISTS fases (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL, -- "Fase 1", "Fase 2", etc.
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  activa BOOLEAN DEFAULT false,
  descripcion TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Tabla: inscripciones_fases
-- Relación entre artistas y fases
-- ============================================
CREATE TABLE IF NOT EXISTS inscripciones_fases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artista_id UUID REFERENCES artistas(id) ON DELETE CASCADE,
  fase_id INTEGER REFERENCES fases(id) ON DELETE CASCADE,
  estado VARCHAR(20) DEFAULT 'pendiente', -- pendiente, seleccionado, rechazado
  votos INTEGER DEFAULT 0,
  fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_resultado TIMESTAMP,

  -- Un artista solo puede inscribirse una vez por fase
  CONSTRAINT unique_artista_fase UNIQUE(artista_id, fase_id)
);

-- ============================================
-- Tabla: votos
-- Registro de votos de curadores
-- ============================================
CREATE TABLE IF NOT EXISTS votos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inscripcion_id UUID REFERENCES inscripciones_fases(id) ON DELETE CASCADE,
  curador_email VARCHAR(255) NOT NULL, -- Email del curador que vota
  voto BOOLEAN NOT NULL, -- true = aprobado, false = rechazado
  comentario TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Un curador solo puede votar una vez por inscripción
  CONSTRAINT unique_curador_inscripcion UNIQUE(inscripcion_id, curador_email)
);

-- ============================================
-- Índices para mejorar performance
-- ============================================
CREATE INDEX idx_artistas_email ON artistas(email);
CREATE INDEX idx_artistas_estado ON artistas(estado);
CREATE INDEX idx_artistas_created_at ON artistas(created_at);
CREATE INDEX idx_inscripciones_artista ON inscripciones_fases(artista_id);
CREATE INDEX idx_inscripciones_fase ON inscripciones_fases(fase_id);
CREATE INDEX idx_inscripciones_estado ON inscripciones_fases(estado);
CREATE INDEX idx_votos_inscripcion ON votos(inscripcion_id);

-- ============================================
-- Trigger para actualizar updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_artistas_updated_at BEFORE UPDATE ON artistas
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Datos iniciales: Fases 2027
-- ============================================
INSERT INTO fases (nombre, fecha_inicio, fecha_fin, activa, descripcion) VALUES
  ('Fase 1', '2026-08-01', '2026-10-31', true, 'Primera ronda de selección'),
  ('Fase 2', '2026-10-01', '2026-12-31', false, 'Segunda ronda de selección'),
  ('Fase 3', '2026-12-01', '2027-01-31', false, 'Tercera ronda de selección'),
  ('Concurso', '2027-01-01', '2027-01-31', false, 'Concurso especial por invitación')
ON CONFLICT DO NOTHING;

-- ============================================
-- Vista: artistas_con_fase_actual
-- Vista útil para obtener artistas con su fase actual
-- ============================================
CREATE OR REPLACE VIEW artistas_con_fase_actual AS
SELECT
  a.*,
  i.fase_id,
  i.estado as estado_inscripcion,
  i.votos,
  f.nombre as fase_nombre,
  f.activa as fase_activa
FROM artistas a
LEFT JOIN inscripciones_fases i ON a.id = i.artista_id
LEFT JOIN fases f ON i.fase_id = f.id
WHERE f.activa = true OR i.id IS NULL;
