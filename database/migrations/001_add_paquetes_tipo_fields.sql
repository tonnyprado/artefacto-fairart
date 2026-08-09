-- Migration: Agregar campos tipo y metros_cuadrados a tabla paquetes
-- Fecha: 2026-08-09
-- Descripción: Diferenciar paquetes 2D (obra bidimensional) y 3D (obra tridimensional/escultura)

-- 1. Agregar columna tipo
ALTER TABLE paquetes
ADD COLUMN IF NOT EXISTS tipo VARCHAR(10) CHECK (tipo IN ('2D', '3D')) DEFAULT '2D';

-- 2. Agregar columna metros_cuadrados (solo para paquetes 3D)
ALTER TABLE paquetes
ADD COLUMN IF NOT EXISTS metros_cuadrados DECIMAL(5,2);

-- 3. Agregar comentarios a las columnas
COMMENT ON COLUMN paquetes.tipo IS 'Tipo de paquete: 2D para obra bidimensional (pared), 3D para obra tridimensional (piso/base)';
COMMENT ON COLUMN paquetes.metros_lineales IS 'Metros lineales de pared (solo para paquetes 2D)';
COMMENT ON COLUMN paquetes.metros_cuadrados IS 'Metros cuadrados de base/piso (solo para paquetes 3D)';
COMMENT ON COLUMN paquetes.altura_pared IS 'Altura de la pared en metros (solo para paquetes 2D)';

-- 4. Actualizar paquetes existentes con el tipo correcto
-- Paquetes 2D (IDs 1-5)
UPDATE paquetes SET tipo = '2D' WHERE id IN (1, 2, 3, 4, 5) AND tipo IS NULL;

-- Paquetes 3D (IDs 6-10)
UPDATE paquetes SET tipo = '3D' WHERE id IN (6, 7, 8, 9, 10) AND tipo IS NULL;

-- 5. Actualizar metros_cuadrados para paquetes 3D según convocatoria
UPDATE paquetes SET metros_cuadrados = 1 WHERE id = 6;  -- Básico 3D: 1m²
UPDATE paquetes SET metros_cuadrados = 2 WHERE id = 7;  -- Estándar 3D: 2m²
UPDATE paquetes SET metros_cuadrados = 3 WHERE id = 8;  -- Medio 3D: 3m²
UPDATE paquetes SET metros_cuadrados = 4 WHERE id = 9;  -- Amplio 3D: 4m²
UPDATE paquetes SET metros_cuadrados = 9 WHERE id = 10; -- Completo 3D: 9m²

-- 6. Crear índice para el campo tipo
CREATE INDEX IF NOT EXISTS idx_paquetes_tipo ON paquetes(tipo);
