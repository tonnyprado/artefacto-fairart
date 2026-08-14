-- Migración: Agregar columnas de email a mensajes_contacto
-- Fecha: 2026-08-14
-- Descripción: Agrega campos para tracking de respuestas por email

-- Agregar columna respondido_por (referencia a usuarios)
ALTER TABLE mensajes_contacto
ADD COLUMN IF NOT EXISTS respondido_por INTEGER REFERENCES usuarios(id) ON DELETE SET NULL;

-- Agregar columna email_enviado (si el email de respuesta fue enviado exitosamente)
ALTER TABLE mensajes_contacto
ADD COLUMN IF NOT EXISTS email_enviado BOOLEAN DEFAULT false;

-- Agregar índice para mejorar búsquedas
CREATE INDEX IF NOT EXISTS idx_mensajes_contacto_email_enviado ON mensajes_contacto(email_enviado);
