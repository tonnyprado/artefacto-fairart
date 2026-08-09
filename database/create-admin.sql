-- Script para crear SOLO el usuario admin
-- Ejecutar si ya tienes las tablas creadas y solo necesitas el admin
--
-- CREDENCIALES:
--   Email: admin@artefact.com
--   Password: admin123
--
-- ⚠️  IMPORTANTE: Cambiar la contraseña en producción

-- Crear usuario admin
INSERT INTO usuarios (email, password, nombre, role)
VALUES (
  'admin@artefact.com',
  '$2a$10$6M62/oODgMNGizQENsGY.ObsynGWcQbEBMEq04QQkpSaYE2itDTM.',
  'Admin Principal',
  'admin'
)
ON CONFLICT (email) DO NOTHING;

-- Verificar que se creó
SELECT id, email, nombre, role, created_at
FROM usuarios
WHERE email = 'admin@artefact.com';
