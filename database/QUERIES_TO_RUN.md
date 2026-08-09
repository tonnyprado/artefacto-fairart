# Queries SQL para Actualizar Base de Datos

## Instrucciones

Ejecuta estas queries en tu base de datos de PostgreSQL para habilitar el sistema de paquetes 2D/3D y registro de fase de inscripción.

### Opción 1: Usar los archivos de migración (Recomendado)

```bash
# Migración 001: Agregar campos tipo y metros_cuadrados a paquetes
psql -U postgres -d artefact_db -f database/migrations/001_add_paquetes_tipo_fields.sql

# Migración 002: Agregar campo fase_inscripcion_id a artistas
psql -U postgres -d artefact_db -f database/migrations/002_add_fase_inscripcion_to_artistas.sql
```

### Opción 2: Copiar y pegar en consola SQL

Si usas Neon o prefieres copiar manualmente, ejecuta las siguientes queries:

```sql
-- 1. Agregar columna tipo
ALTER TABLE paquetes
ADD COLUMN IF NOT EXISTS tipo VARCHAR(10) CHECK (tipo IN ('2D', '3D')) DEFAULT '2D';

-- 2. Agregar columna metros_cuadrados (solo para paquetes 3D)
ALTER TABLE paquetes
ADD COLUMN IF NOT EXISTS metros_cuadrados DECIMAL(5,2);

-- 3. Agregar columnas de precios por fase
ALTER TABLE paquetes
ADD COLUMN IF NOT EXISTS precio_fase1 DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS precio_fase2 DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS precio_fase3 DECIMAL(10,2);

-- 4. Agregar comentarios a las columnas
COMMENT ON COLUMN paquetes.tipo IS 'Tipo de paquete: 2D para obra bidimensional (pared), 3D para obra tridimensional (piso/base)';
COMMENT ON COLUMN paquetes.metros_lineales IS 'Metros lineales de pared (solo para paquetes 2D)';
COMMENT ON COLUMN paquetes.metros_cuadrados IS 'Metros cuadrados de base/piso (solo para paquetes 3D)';
COMMENT ON COLUMN paquetes.altura_pared IS 'Altura de la pared en metros (solo para paquetes 2D)';

-- 5. Actualizar paquetes existentes con el tipo correcto
-- Paquetes 2D (IDs 1-5)
UPDATE paquetes SET tipo = '2D' WHERE id IN (1, 2, 3, 4, 5);

-- Paquetes 3D (IDs 6-10)
UPDATE paquetes SET tipo = '3D' WHERE id IN (6, 7, 8, 9, 10);

-- 6. Actualizar metros_cuadrados para paquetes 3D según convocatoria
UPDATE paquetes SET metros_cuadrados = 1 WHERE id = 6;  -- Básico 3D: 1m²
UPDATE paquetes SET metros_cuadrados = 2 WHERE id = 7;  -- Estándar 3D: 2m²
UPDATE paquetes SET metros_cuadrados = 3 WHERE id = 8;  -- Medio 3D: 3m²
UPDATE paquetes SET metros_cuadrados = 4 WHERE id = 9;  -- Amplio 3D: 4m²
UPDATE paquetes SET metros_cuadrados = 9 WHERE id = 10; -- Completo 3D: 9m²

-- 7. Actualizar precios por fase para todos los paquetes
-- Paquetes 2D
UPDATE paquetes SET precio_fase1 = 7600, precio_fase2 = 8550, precio_fase3 = 9500 WHERE id = 1;   -- Básico 2D
UPDATE paquetes SET precio_fase1 = 10400, precio_fase2 = 11700, precio_fase3 = 13000 WHERE id = 2; -- Estándar 2D
UPDATE paquetes SET precio_fase1 = 15600, precio_fase2 = 17550, precio_fase3 = 19500 WHERE id = 3; -- Medio 2D
UPDATE paquetes SET precio_fase1 = 19600, precio_fase2 = 22050, precio_fase3 = 24500 WHERE id = 4; -- Amplio 2D
UPDATE paquetes SET precio_fase1 = 26800, precio_fase2 = 30150, precio_fase3 = 33500 WHERE id = 5; -- Completo 2D

-- Paquetes 3D
UPDATE paquetes SET precio_fase1 = 7600, precio_fase2 = 8550, precio_fase3 = 9500 WHERE id = 6;   -- Básico 3D
UPDATE paquetes SET precio_fase1 = 12400, precio_fase2 = 13950, precio_fase3 = 15500 WHERE id = 7; -- Estándar 3D
UPDATE paquetes SET precio_fase1 = 16000, precio_fase2 = 18000, precio_fase3 = 20000 WHERE id = 8; -- Medio 3D
UPDATE paquetes SET precio_fase1 = 19200, precio_fase2 = 21600, precio_fase3 = 24000 WHERE id = 9; -- Amplio 3D
UPDATE paquetes SET precio_fase1 = 36000, precio_fase2 = 40500, precio_fase3 = 45000 WHERE id = 10; -- Completo 3D

-- 8. Crear índice para el campo tipo
CREATE INDEX IF NOT EXISTS idx_paquetes_tipo ON paquetes(tipo);

-- =======================================================
-- MIGRACIÓN 002: Agregar fase_inscripcion_id a artistas
-- =======================================================

-- 1. Agregar columna fase_inscripcion_id
ALTER TABLE artistas
ADD COLUMN IF NOT EXISTS fase_inscripcion_id INTEGER REFERENCES fases(id) ON DELETE SET NULL;

-- 2. Agregar comentario a la columna
COMMENT ON COLUMN artistas.fase_inscripcion_id IS 'ID de la fase en la que el artista se registró por primera vez (Fase 1, 2, 3)';

-- 3. Crear índice para mejorar consultas
CREATE INDEX IF NOT EXISTS idx_artistas_fase_inscripcion ON artistas(fase_inscripcion_id);

-- 4. Actualizar artistas existentes (asignar a Fase 1 por defecto si existe)
UPDATE artistas
SET fase_inscripcion_id = (SELECT id FROM fases WHERE numero_fase = 1 AND tipo = 'fase' LIMIT 1)
WHERE fase_inscripcion_id IS NULL
  AND EXISTS (SELECT 1 FROM fases WHERE numero_fase = 1 AND tipo = 'fase');
```

## Verificación

Después de ejecutar las queries, verifica que todo se haya actualizado correctamente:

```sql
-- Ver todos los paquetes con sus nuevos campos
SELECT id, nombre, tipo, metros_lineales, metros_cuadrados, precio_fase1, precio_fase2, precio_fase3
FROM paquetes
ORDER BY tipo, id;

-- Ver artistas con sus paquetes y fases de inscripción
SELECT
  a.id,
  a.nombre,
  a.apellido,
  a.categoria,
  p.nombre AS paquete,
  p.tipo AS tipo_paquete,
  f.nombre AS fase_inscripcion
FROM artistas a
LEFT JOIN paquetes p ON a.paquete_id = p.id
LEFT JOIN fases f ON a.fase_inscripcion_id = f.id
ORDER BY a.created_at DESC
LIMIT 10;
```

Deberías ver:
- 5 paquetes 2D (IDs 1-5) con metros_lineales
- 5 paquetes 3D (IDs 6-10) con metros_cuadrados
- Todos los paquetes con precios para las 3 fases
- Artistas con su paquete asignado y fase de inscripción

## ¿Qué hace cada query?

1. **Agregar columna tipo**: Permite identificar si un paquete es para obra bidimensional (2D) o tridimensional (3D)
2. **Agregar metros_cuadrados**: Almacena el área de base/piso disponible para paquetes 3D
3. **Agregar precios por fase**: Almacena los diferentes precios según la fase de inscripción
4. **Comentarios**: Documentación inline en la base de datos
5-7. **Actualizar datos**: Establece valores correctos según la convocatoria
8. **Índice**: Mejora el rendimiento de búsquedas por tipo de paquete
