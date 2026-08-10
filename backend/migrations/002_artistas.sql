-- =====================================================
-- MIGRATION: Agregar tabla de Artistas
-- =====================================================
-- Descripción: Crea tabla de artistas con todos los campos necesarios
-- Fecha: 2024
-- =====================================================

-- IMPORTANTE: Si la tabla artistas ya existe pero con estructura vieja, la eliminamos
DROP TABLE IF EXISTS obras CASCADE;
DROP TABLE IF EXISTS artistas CASCADE;

-- 1. Crear tabla de ARTISTAS
CREATE TABLE artistas (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  apellido VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  telefono VARCHAR(50),
  fecha_nacimiento DATE,
  ciudad VARCHAR(255),
  pais VARCHAR(255),
  categoria VARCHAR(100),
  bio TEXT,
  foto TEXT, -- URL de Cloudinary
  instagram VARCHAR(500),
  facebook VARCHAR(500),
  website VARCHAR(500),
  cv_url TEXT, -- URL de Cloudinary
  portfolio_url TEXT, -- URL de Cloudinary
  identificacion_url TEXT, -- URL de Cloudinary
  aprobado BOOLEAN DEFAULT false,
  estado_registro VARCHAR(50) DEFAULT 'pendiente',
  paquete_id INTEGER,
  layout_canvas_url TEXT, -- URL del canvas guardado
  layout_canvas_data JSONB, -- Datos del canvas en JSON
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para artistas
CREATE INDEX IF NOT EXISTS idx_artistas_email ON artistas(email);
CREATE INDEX IF NOT EXISTS idx_artistas_categoria ON artistas(categoria);
CREATE INDEX IF NOT EXISTS idx_artistas_aprobado ON artistas(aprobado);
CREATE INDEX IF NOT EXISTS idx_artistas_estado ON artistas(estado_registro);
CREATE INDEX IF NOT EXISTS idx_artistas_paquete ON artistas(paquete_id);
CREATE INDEX IF NOT EXISTS idx_artistas_created ON artistas(created_at DESC);

-- 2. Crear tabla de OBRAS (imágenes del portfolio/lienzo)
CREATE TABLE obras (
  id SERIAL PRIMARY KEY,
  artista_id INTEGER NOT NULL REFERENCES artistas(id) ON DELETE CASCADE,
  titulo VARCHAR(255),
  imagen_url TEXT NOT NULL, -- URL de Cloudinary
  alto_cm DECIMAL(10,2),
  ancho_cm DECIMAL(10,2),
  precio_mxn DECIMAL(10,2),
  en_lienzo BOOLEAN DEFAULT false, -- Si está en el lienzo del evento
  orden_lienzo INTEGER, -- Orden en el lienzo
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para obras
CREATE INDEX IF NOT EXISTS idx_obras_artista ON obras(artista_id);
CREATE INDEX IF NOT EXISTS idx_obras_lienzo ON obras(en_lienzo);

-- 3. Trigger para updated_at en artistas
DROP TRIGGER IF EXISTS update_artistas_updated_at ON artistas;
CREATE TRIGGER update_artistas_updated_at
  BEFORE UPDATE ON artistas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FIN DE LA MIGRATION
-- =====================================================
-- Verificación:
SELECT 'Tabla artistas creada' as info, COUNT(*) as total FROM artistas;
SELECT 'Tabla obras creada' as info, COUNT(*) as total FROM obras;
