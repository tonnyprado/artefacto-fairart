-- =====================================================
-- MIGRATION: Agregar tablas de Usuarios y Curadores
-- =====================================================
-- Descripción: Crea tablas para autenticación de usuarios y curadores
-- Fecha: 2026-08-10
-- =====================================================

-- Eliminar tablas si existen (para recrear estructura correcta)
DROP TABLE IF EXISTS curadores CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- 1. Crear tabla de USUARIOS
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL, -- Hash bcrypt
  nombre VARCHAR(500),
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'curador')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para usuarios
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_role ON usuarios(role);

-- 2. Crear tabla de CURADORES
CREATE TABLE curadores (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER UNIQUE NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  apellido VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  telefono VARCHAR(50),
  especialidad VARCHAR(255),
  bio TEXT,
  foto TEXT, -- URL de foto
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para curadores
CREATE INDEX IF NOT EXISTS idx_curadores_usuario ON curadores(usuario_id);
CREATE INDEX IF NOT EXISTS idx_curadores_email ON curadores(email);
CREATE INDEX IF NOT EXISTS idx_curadores_activo ON curadores(activo);

-- 3. Trigger para updated_at en usuarios
DROP TRIGGER IF EXISTS update_usuarios_updated_at ON usuarios;
CREATE TRIGGER update_usuarios_updated_at
  BEFORE UPDATE ON usuarios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 4. Trigger para updated_at en curadores
DROP TRIGGER IF EXISTS update_curadores_updated_at ON curadores;
CREATE TRIGGER update_curadores_updated_at
  BEFORE UPDATE ON curadores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. Insertar usuario admin por defecto
INSERT INTO usuarios (email, password, nombre, role)
VALUES (
  'admin@artefact.com',
  '$2a$10$YourHashedPasswordHere', -- Debes actualizar esto con el hash real
  'Administrador',
  'admin'
) ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- FIN DE LA MIGRATION
-- =====================================================
-- Verificación:
SELECT 'Tabla usuarios creada' as info, COUNT(*) as total FROM usuarios;
SELECT 'Tabla curadores creada' as info, COUNT(*) as total FROM curadores;
