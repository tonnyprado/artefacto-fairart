-- Base de datos para ARTEFACT Feria de Arte
-- PostgreSQL Schema

-- Tabla de usuarios (administradores y curadores)
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  apellido VARCHAR(255),
  telefono VARCHAR(20),
  role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('admin', 'curador')),
  especialidad VARCHAR(255), -- Para curadores: especialidad en arte
  bio TEXT, -- Para curadores: biografía profesional
  foto VARCHAR(500),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para usuarios
CREATE INDEX idx_usuarios_role ON usuarios(role);
CREATE INDEX idx_usuarios_activo ON usuarios(activo);

-- Tabla de artistas
CREATE TABLE IF NOT EXISTS artistas (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  apellido VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  telefono VARCHAR(20),
  fecha_nacimiento DATE,
  pais VARCHAR(100),
  ciudad VARCHAR(100),
  direccion TEXT,
  bio TEXT,
  categoria VARCHAR(100) NOT NULL, -- pintura, escultura, fotografía, etc.
  foto VARCHAR(500),
  slug VARCHAR(255) UNIQUE NOT NULL,
  redes_sociales JSONB DEFAULT '{}', -- {instagram, facebook, website, etc.}
  documentos JSONB DEFAULT '{}', -- {cv, portfolio, identificacion, etc.}
  estado VARCHAR(50) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobado', 'rechazado')),
  notas_admin TEXT, -- Notas internas del admin
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para artistas
CREATE INDEX idx_artistas_categoria ON artistas(categoria);
CREATE INDEX idx_artistas_slug ON artistas(slug);
CREATE INDEX idx_artistas_activo ON artistas(activo);
CREATE INDEX idx_artistas_estado ON artistas(estado);

-- Tabla de obras de arte
CREATE TABLE IF NOT EXISTS obras (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  artista_id INTEGER NOT NULL REFERENCES artistas(id) ON DELETE CASCADE,
  precio DECIMAL(10, 2) NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  imagen VARCHAR(500),
  dimensiones VARCHAR(100),
  año INTEGER,
  disponible BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para obras
CREATE INDEX idx_obras_artista ON obras(artista_id);
CREATE INDEX idx_obras_categoria ON obras(categoria);
CREATE INDEX idx_obras_disponible ON obras(disponible);

-- Tabla de eventos/ferias
CREATE TABLE IF NOT EXISTS eventos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  fecha_inicio TIMESTAMP NOT NULL,
  fecha_fin TIMESTAMP NOT NULL,
  ubicacion TEXT NOT NULL,
  imagen VARCHAR(500),
  slug VARCHAR(255) UNIQUE NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para eventos
CREATE INDEX idx_eventos_fecha_inicio ON eventos(fecha_inicio);
CREATE INDEX idx_eventos_slug ON eventos(slug);
CREATE INDEX idx_eventos_activo ON eventos(activo);

-- Tabla de paquetes de inscripción
CREATE TABLE IF NOT EXISTS paquetes (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT NOT NULL,
  precio DECIMAL(10, 2) NOT NULL,
  beneficios JSONB DEFAULT '[]',
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de inscripciones a eventos
CREATE TABLE IF NOT EXISTS inscripciones (
  id SERIAL PRIMARY KEY,
  artista_id INTEGER NOT NULL REFERENCES artistas(id) ON DELETE CASCADE,
  evento_id INTEGER NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  paquete_id INTEGER NOT NULL REFERENCES paquetes(id) ON DELETE RESTRICT,
  estado VARCHAR(50) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobada', 'rechazada')),
  notas TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(artista_id, evento_id)
);

-- Índices para inscripciones
CREATE INDEX idx_inscripciones_artista ON inscripciones(artista_id);
CREATE INDEX idx_inscripciones_evento ON inscripciones(evento_id);
CREATE INDEX idx_inscripciones_estado ON inscripciones(estado);

-- Tabla para contenido general del sitio (páginas, secciones)
CREATE TABLE IF NOT EXISTS contenido (
  id SERIAL PRIMARY KEY,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('pagina', 'seccion', 'noticia')),
  titulo VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  contenido TEXT,
  imagen VARCHAR(500),
  publicado BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_contenido_tipo ON contenido(tipo);
CREATE INDEX idx_contenido_slug ON contenido(slug);
CREATE INDEX idx_contenido_publicado ON contenido(publicado);

-- ============================================================================
-- SISTEMA DE FASES Y VOTACIONES
-- ============================================================================

-- Tabla de fases (Fase 1, Fase 2, Fase 3, Concurso)
CREATE TABLE IF NOT EXISTS fases (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL, -- 'Fase 1', 'Fase 2', 'Fase 3', 'Concurso'
  descripcion TEXT,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('fase', 'concurso')),
  numero_fase INTEGER, -- 1, 2, 3, null para concurso
  fecha_inicio_inscripciones TIMESTAMP,
  fecha_fin_inscripciones TIMESTAMP,
  fecha_inicio_votaciones TIMESTAMP,
  fecha_fin_votaciones TIMESTAMP,
  porcentaje_seleccion DECIMAL(5, 2) DEFAULT 20.00, -- % de artistas a seleccionar
  max_artistas_seleccionados INTEGER, -- Número máximo de artistas a seleccionar
  inscripciones_abiertas BOOLEAN DEFAULT false,
  votaciones_abiertas BOOLEAN DEFAULT false,
  finalizada BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para fases
CREATE INDEX idx_fases_tipo ON fases(tipo);
CREATE INDEX idx_fases_inscripciones_abiertas ON fases(inscripciones_abiertas);
CREATE INDEX idx_fases_votaciones_abiertas ON fases(votaciones_abiertas);
CREATE INDEX idx_fases_finalizada ON fases(finalizada);

-- Tabla de inscripciones por fase
CREATE TABLE IF NOT EXISTS inscripciones_fases (
  id SERIAL PRIMARY KEY,
  artista_id INTEGER NOT NULL REFERENCES artistas(id) ON DELETE CASCADE,
  fase_id INTEGER NOT NULL REFERENCES fases(id) ON DELETE CASCADE,
  estado VARCHAR(50) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_revision', 'aprobado', 'rechazado')),
  notas_admin TEXT,
  fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(artista_id, fase_id) -- Un artista solo puede inscribirse una vez por fase
);

-- Índices para inscripciones_fases
CREATE INDEX idx_inscripciones_fases_artista ON inscripciones_fases(artista_id);
CREATE INDEX idx_inscripciones_fases_fase ON inscripciones_fases(fase_id);
CREATE INDEX idx_inscripciones_fases_estado ON inscripciones_fases(estado);

-- Tabla de votaciones de curadores
CREATE TABLE IF NOT EXISTS votaciones (
  id SERIAL PRIMARY KEY,
  curador_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  artista_id INTEGER NOT NULL REFERENCES artistas(id) ON DELETE CASCADE,
  fase_id INTEGER NOT NULL REFERENCES fases(id) ON DELETE CASCADE,
  voto BOOLEAN NOT NULL, -- true = a favor, false = en contra
  comentario TEXT, -- Comentario opcional del curador
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(curador_id, artista_id, fase_id) -- Un curador solo puede votar una vez por artista por fase
);

-- Índices para votaciones
CREATE INDEX idx_votaciones_curador ON votaciones(curador_id);
CREATE INDEX idx_votaciones_artista ON votaciones(artista_id);
CREATE INDEX idx_votaciones_fase ON votaciones(fase_id);
CREATE INDEX idx_votaciones_voto ON votaciones(voto);

-- Tabla de artistas seleccionados por fase
CREATE TABLE IF NOT EXISTS artistas_seleccionados (
  id SERIAL PRIMARY KEY,
  artista_id INTEGER NOT NULL REFERENCES artistas(id) ON DELETE CASCADE,
  fase_id INTEGER NOT NULL REFERENCES fases(id) ON DELETE CASCADE,
  total_votos_favor INTEGER DEFAULT 0,
  total_votos_contra INTEGER DEFAULT 0,
  porcentaje_aprobacion DECIMAL(5, 2), -- % de votos a favor
  posicion INTEGER, -- Posición en el ranking de la fase
  notificado BOOLEAN DEFAULT false, -- Si ya se le notificó por email
  fecha_seleccion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(artista_id, fase_id) -- Un artista solo puede ser seleccionado una vez por fase
);

-- Índices para artistas_seleccionados
CREATE INDEX idx_artistas_seleccionados_artista ON artistas_seleccionados(artista_id);
CREATE INDEX idx_artistas_seleccionados_fase ON artistas_seleccionados(fase_id);
CREATE INDEX idx_artistas_seleccionados_notificado ON artistas_seleccionados(notificado);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artistas_updated_at BEFORE UPDATE ON artistas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_obras_updated_at BEFORE UPDATE ON obras
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_eventos_updated_at BEFORE UPDATE ON eventos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_paquetes_updated_at BEFORE UPDATE ON paquetes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inscripciones_updated_at BEFORE UPDATE ON inscripciones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contenido_updated_at BEFORE UPDATE ON contenido
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fases_updated_at BEFORE UPDATE ON fases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inscripciones_fases_updated_at BEFORE UPDATE ON inscripciones_fases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_votaciones_updated_at BEFORE UPDATE ON votaciones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artistas_seleccionados_updated_at BEFORE UPDATE ON artistas_seleccionados
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
