-- Migration SEGURA: Actualizar paquetes con precios correctos
-- Fecha: 2026-08-25
-- Esta version usa UPDATE en lugar de DELETE para no romper foreign keys

-- Primero verificar cuantos artistas tienen paquetes asignados
SELECT COUNT(*) as artistas_con_paquete FROM artistas WHERE paquete_id IS NOT NULL;

-- ============================================
-- ACTUALIZAR PAQUETES 2D EXISTENTES
-- ============================================

-- Paquete 1: Basico 2D
UPDATE paquetes SET
  nombre = 'Basico 2D',
  tipo = '2D',
  descripcion = 'Paquete basico para obra bidimensional',
  precio = 9500.00,
  metros_lineales = 2.0,
  altura_pared = 2.4,
  metros_cuadrados = NULL,
  beneficios = '["2 metros lineales de pared", "Bootcamp de ceramica con material incluido", "5 boletos dobles de cortesia", "Asesores de venta durante la feria", "Acceso a 1-2 talleres en Estudio ARTE FACTO", "Difusion masiva en redes", "Playeras y totebags con serigrafias de tu arte", "Publicaciones y entrevistas previas al evento"]'::jsonb,
  activo = true
WHERE id = 1;

-- Paquete 2: Estandar 2D
UPDATE paquetes SET
  nombre = 'Estandar 2D',
  tipo = '2D',
  descripcion = 'Paquete estandar para obra bidimensional',
  precio = 13000.00,
  metros_lineales = 3.0,
  altura_pared = 2.4,
  metros_cuadrados = NULL,
  beneficios = '["3 metros lineales de pared", "Bootcamp de ceramica con material incluido", "5 boletos dobles de cortesia", "Asesores de venta durante la feria", "Acceso a 1-2 talleres en Estudio ARTE FACTO", "Difusion masiva en redes", "Playeras y totebags con serigrafias de tu arte", "Publicaciones y entrevistas previas al evento"]'::jsonb,
  activo = true
WHERE id = 2;

-- Paquete 3: Medio 2D
UPDATE paquetes SET
  nombre = 'Medio 2D',
  tipo = '2D',
  descripcion = 'Paquete medio para obra bidimensional',
  precio = 19500.00,
  metros_lineales = 5.0,
  altura_pared = 2.4,
  metros_cuadrados = NULL,
  beneficios = '["5 metros lineales de pared", "Bootcamp de ceramica con material incluido", "5 boletos dobles de cortesia", "Asesores de venta durante la feria", "Acceso a 1-2 talleres en Estudio ARTE FACTO", "Difusion masiva en redes", "Playeras y totebags con serigrafias de tu arte", "Publicaciones y entrevistas previas al evento"]'::jsonb,
  activo = true
WHERE id = 3;

-- Si solo hay 3 paquetes, insertar los que faltan
-- Paquete 4: Amplio 2D
INSERT INTO paquetes (id, nombre, tipo, descripcion, precio, metros_lineales, altura_pared, beneficios, activo)
VALUES (4, 'Amplio 2D', '2D', 'Paquete amplio para obra bidimensional', 24500.00, 7.0, 2.4,
 '["7 metros lineales de pared", "Bootcamp de ceramica con material incluido", "5 boletos dobles de cortesia", "Asesores de venta durante la feria", "Acceso a 1-2 talleres en Estudio ARTE FACTO", "Difusion masiva en redes", "Playeras y totebags con serigrafias de tu arte", "Publicaciones y entrevistas previas al evento"]'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  tipo = EXCLUDED.tipo,
  descripcion = EXCLUDED.descripcion,
  precio = EXCLUDED.precio,
  metros_lineales = EXCLUDED.metros_lineales,
  altura_pared = EXCLUDED.altura_pared,
  beneficios = EXCLUDED.beneficios,
  activo = EXCLUDED.activo;

-- Paquete 5: Completo 2D
INSERT INTO paquetes (id, nombre, tipo, descripcion, precio, metros_lineales, altura_pared, beneficios, activo)
VALUES (5, 'Completo 2D', '2D', 'Paquete completo para obra bidimensional', 33500.00, 10.0, 2.4,
 '["10 metros lineales de pared", "Bootcamp de ceramica con material incluido", "5 boletos dobles de cortesia", "Asesores de venta durante la feria", "Acceso a 1-2 talleres en Estudio ARTE FACTO", "Difusion masiva en redes", "Playeras y totebags con serigrafias de tu arte", "Publicaciones y entrevistas previas al evento"]'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  tipo = EXCLUDED.tipo,
  descripcion = EXCLUDED.descripcion,
  precio = EXCLUDED.precio,
  metros_lineales = EXCLUDED.metros_lineales,
  altura_pared = EXCLUDED.altura_pared,
  beneficios = EXCLUDED.beneficios,
  activo = EXCLUDED.activo;

-- ============================================
-- INSERTAR/ACTUALIZAR PAQUETES 3D
-- ============================================

-- Paquete 6: Basico 3D
INSERT INTO paquetes (id, nombre, tipo, descripcion, precio, metros_cuadrados, beneficios, activo)
VALUES (6, 'Basico 3D', '3D', 'Paquete basico para obra tridimensional', 6500.00, 1.0,
 '["1 metro cuadrado de espacio", "Bootcamp de ceramica con material incluido", "5 boletos dobles de cortesia", "Asesores de venta durante la feria", "Acceso a 1-2 talleres en Estudio ARTE FACTO", "Difusion masiva en redes", "Playeras y totebags con serigrafias de tu arte", "Publicaciones y entrevistas previas al evento"]'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  tipo = EXCLUDED.tipo,
  descripcion = EXCLUDED.descripcion,
  precio = EXCLUDED.precio,
  metros_cuadrados = EXCLUDED.metros_cuadrados,
  beneficios = EXCLUDED.beneficios,
  activo = EXCLUDED.activo;

-- Paquete 7: Estandar 3D
INSERT INTO paquetes (id, nombre, tipo, descripcion, precio, metros_cuadrados, beneficios, activo)
VALUES (7, 'Estandar 3D', '3D', 'Paquete estandar para obra tridimensional', 11500.00, 2.0,
 '["2 metros cuadrados de espacio", "Bootcamp de ceramica con material incluido", "5 boletos dobles de cortesia", "Asesores de venta durante la feria", "Acceso a 1-2 talleres en Estudio ARTE FACTO", "Difusion masiva en redes", "Playeras y totebags con serigrafias de tu arte", "Publicaciones y entrevistas previas al evento"]'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  tipo = EXCLUDED.tipo,
  descripcion = EXCLUDED.descripcion,
  precio = EXCLUDED.precio,
  metros_cuadrados = EXCLUDED.metros_cuadrados,
  beneficios = EXCLUDED.beneficios,
  activo = EXCLUDED.activo;

-- Paquete 8: Medio 3D
INSERT INTO paquetes (id, nombre, tipo, descripcion, precio, metros_cuadrados, beneficios, activo)
VALUES (8, 'Medio 3D', '3D', 'Paquete medio para obra tridimensional', 15500.00, 3.0,
 '["3 metros cuadrados de espacio", "Bootcamp de ceramica con material incluido", "5 boletos dobles de cortesia", "Asesores de venta durante la feria", "Acceso a 1-2 talleres en Estudio ARTE FACTO", "Difusion masiva en redes", "Playeras y totebags con serigrafias de tu arte", "Publicaciones y entrevistas previas al evento"]'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  tipo = EXCLUDED.tipo,
  descripcion = EXCLUDED.descripcion,
  precio = EXCLUDED.precio,
  metros_cuadrados = EXCLUDED.metros_cuadrados,
  beneficios = EXCLUDED.beneficios,
  activo = EXCLUDED.activo;

-- Paquete 9: Amplio 3D
INSERT INTO paquetes (id, nombre, tipo, descripcion, precio, metros_cuadrados, beneficios, activo)
VALUES (9, 'Amplio 3D', '3D', 'Paquete amplio para obra tridimensional', 19000.00, 4.0,
 '["4 metros cuadrados de espacio", "Bootcamp de ceramica con material incluido", "5 boletos dobles de cortesia", "Asesores de venta durante la feria", "Acceso a 1-2 talleres en Estudio ARTE FACTO", "Difusion masiva en redes", "Playeras y totebags con serigrafias de tu arte", "Publicaciones y entrevistas previas al evento"]'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  tipo = EXCLUDED.tipo,
  descripcion = EXCLUDED.descripcion,
  precio = EXCLUDED.precio,
  metros_cuadrados = EXCLUDED.metros_cuadrados,
  beneficios = EXCLUDED.beneficios,
  activo = EXCLUDED.activo;

-- Paquete 10: Completo 3D
INSERT INTO paquetes (id, nombre, tipo, descripcion, precio, metros_cuadrados, beneficios, activo)
VALUES (10, 'Completo 3D', '3D', 'Paquete completo para obra tridimensional', 33500.00, 9.0,
 '["9 metros cuadrados de espacio", "Bootcamp de ceramica con material incluido", "5 boletos dobles de cortesia", "Asesores de venta durante la feria", "Acceso a 1-2 talleres en Estudio ARTE FACTO", "Difusion masiva en redes", "Playeras y totebags con serigrafias de tu arte", "Publicaciones y entrevistas previas al evento"]'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  tipo = EXCLUDED.tipo,
  descripcion = EXCLUDED.descripcion,
  precio = EXCLUDED.precio,
  metros_cuadrados = EXCLUDED.metros_cuadrados,
  beneficios = EXCLUDED.beneficios,
  activo = EXCLUDED.activo;

-- Actualizar secuencia
SELECT setval('paquetes_id_seq', GREATEST((SELECT MAX(id) FROM paquetes), 10));

-- Verificar resultado
SELECT id, nombre, tipo, precio, metros_lineales, metros_cuadrados FROM paquetes ORDER BY id;
