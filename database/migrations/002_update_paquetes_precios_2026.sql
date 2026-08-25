-- Migration: Actualizar paquetes con precios y datos de Convocatoria 2026-2027
-- Fecha: 2026-08-25
-- Descripcion: Sincronizar datos de paquetes con los valores actuales de la convocatoria
-- IMPORTANTE: Ejecutar esta migración para corregir los datos de paquetes en produccion

-- Primero verificar si hay artistas con paquetes asignados (para no romper FK)
-- Si hay artistas, solo actualizamos; si no hay, podemos recrear

-- Limpiar paquetes existentes SOLO si no hay artistas con paquetes asignados
-- NOTA: Comentar las siguientes lineas si hay artistas con paquetes asignados
DELETE FROM paquetes WHERE id > 0;

-- Reiniciar secuencia
ALTER SEQUENCE paquetes_id_seq RESTART WITH 1;

-- ============================================
-- PAQUETES OBRA BIDIMENSIONAL (2D)
-- Precios segun Convocatoria ARTE FACTO 2027
-- ============================================

INSERT INTO paquetes (id, nombre, tipo, descripcion, precio, metros_lineales, altura_pared, beneficios, activo)
VALUES
(1, 'Basico 2D', '2D', 'Paquete basico para obra bidimensional', 9500.00, 2.0, 2.4,
 '["2 metros lineales de pared", "Bootcamp de ceramica con material incluido", "5 boletos dobles de cortesia", "Asesores de venta durante la feria", "Acceso a 1-2 talleres en Estudio ARTE FACTO", "Difusion masiva en redes", "Playeras y totebags con serigrafias de tu arte", "Publicaciones y entrevistas previas al evento"]'::jsonb,
 true),

(2, 'Estandar 2D', '2D', 'Paquete estandar para obra bidimensional', 13000.00, 3.0, 2.4,
 '["3 metros lineales de pared", "Bootcamp de ceramica con material incluido", "5 boletos dobles de cortesia", "Asesores de venta durante la feria", "Acceso a 1-2 talleres en Estudio ARTE FACTO", "Difusion masiva en redes", "Playeras y totebags con serigrafias de tu arte", "Publicaciones y entrevistas previas al evento"]'::jsonb,
 true),

(3, 'Medio 2D', '2D', 'Paquete medio para obra bidimensional', 19500.00, 5.0, 2.4,
 '["5 metros lineales de pared", "Bootcamp de ceramica con material incluido", "5 boletos dobles de cortesia", "Asesores de venta durante la feria", "Acceso a 1-2 talleres en Estudio ARTE FACTO", "Difusion masiva en redes", "Playeras y totebags con serigrafias de tu arte", "Publicaciones y entrevistas previas al evento"]'::jsonb,
 true),

(4, 'Amplio 2D', '2D', 'Paquete amplio para obra bidimensional', 24500.00, 7.0, 2.4,
 '["7 metros lineales de pared", "Bootcamp de ceramica con material incluido", "5 boletos dobles de cortesia", "Asesores de venta durante la feria", "Acceso a 1-2 talleres en Estudio ARTE FACTO", "Difusion masiva en redes", "Playeras y totebags con serigrafias de tu arte", "Publicaciones y entrevistas previas al evento"]'::jsonb,
 true),

(5, 'Completo 2D', '2D', 'Paquete completo para obra bidimensional', 33500.00, 10.0, 2.4,
 '["10 metros lineales de pared", "Bootcamp de ceramica con material incluido", "5 boletos dobles de cortesia", "Asesores de venta durante la feria", "Acceso a 1-2 talleres en Estudio ARTE FACTO", "Difusion masiva en redes", "Playeras y totebags con serigrafias de tu arte", "Publicaciones y entrevistas previas al evento"]'::jsonb,
 true);

-- ============================================
-- PAQUETES OBRA TRIDIMENSIONAL (3D)
-- ============================================

INSERT INTO paquetes (id, nombre, tipo, descripcion, precio, metros_cuadrados, beneficios, activo)
VALUES
(6, 'Basico 3D', '3D', 'Paquete basico para obra tridimensional', 6500.00, 1.0,
 '["1 metro cuadrado de espacio", "Bootcamp de ceramica con material incluido", "5 boletos dobles de cortesia", "Asesores de venta durante la feria", "Acceso a 1-2 talleres en Estudio ARTE FACTO", "Difusion masiva en redes", "Playeras y totebags con serigrafias de tu arte", "Publicaciones y entrevistas previas al evento"]'::jsonb,
 true),

(7, 'Estandar 3D', '3D', 'Paquete estandar para obra tridimensional', 11500.00, 2.0,
 '["2 metros cuadrados de espacio", "Bootcamp de ceramica con material incluido", "5 boletos dobles de cortesia", "Asesores de venta durante la feria", "Acceso a 1-2 talleres en Estudio ARTE FACTO", "Difusion masiva en redes", "Playeras y totebags con serigrafias de tu arte", "Publicaciones y entrevistas previas al evento"]'::jsonb,
 true),

(8, 'Medio 3D', '3D', 'Paquete medio para obra tridimensional', 15500.00, 3.0,
 '["3 metros cuadrados de espacio", "Bootcamp de ceramica con material incluido", "5 boletos dobles de cortesia", "Asesores de venta durante la feria", "Acceso a 1-2 talleres en Estudio ARTE FACTO", "Difusion masiva en redes", "Playeras y totebags con serigrafias de tu arte", "Publicaciones y entrevistas previas al evento"]'::jsonb,
 true),

(9, 'Amplio 3D', '3D', 'Paquete amplio para obra tridimensional', 19000.00, 4.0,
 '["4 metros cuadrados de espacio", "Bootcamp de ceramica con material incluido", "5 boletos dobles de cortesia", "Asesores de venta durante la feria", "Acceso a 1-2 talleres en Estudio ARTE FACTO", "Difusion masiva en redes", "Playeras y totebags con serigrafias de tu arte", "Publicaciones y entrevistas previas al evento"]'::jsonb,
 true),

(10, 'Completo 3D', '3D', 'Paquete completo para obra tridimensional', 33500.00, 9.0,
 '["9 metros cuadrados de espacio", "Bootcamp de ceramica con material incluido", "5 boletos dobles de cortesia", "Asesores de venta durante la feria", "Acceso a 1-2 talleres en Estudio ARTE FACTO", "Difusion masiva en redes", "Playeras y totebags con serigrafias de tu arte", "Publicaciones y entrevistas previas al evento"]'::jsonb,
 true);

-- Actualizar secuencia para futuros inserts
SELECT setval('paquetes_id_seq', (SELECT MAX(id) FROM paquetes));

-- Verificar
SELECT id, nombre, tipo, precio, metros_lineales, metros_cuadrados FROM paquetes ORDER BY id;
