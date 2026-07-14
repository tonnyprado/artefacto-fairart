-- Base de datos para ARTEFACT Feria de Arte
-- PostgreSQL Schema

-- Tabla de usuarios (administradores)
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de artistas
CREATE TABLE IF NOT EXISTS artistas (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  bio TEXT,
  categoria VARCHAR(100) NOT NULL,
  foto VARCHAR(500),
  slug VARCHAR(255) UNIQUE NOT NULL,
  redes_sociales JSONB DEFAULT '{}',
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para artistas
CREATE INDEX idx_artistas_categoria ON artistas(categoria);
CREATE INDEX idx_artistas_slug ON artistas(slug);
CREATE INDEX idx_artistas_activo ON artistas(activo);

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
