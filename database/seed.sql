-- SEED DATA INICIAL PARA ARTEFACT
-- Ejecutar DESPUÉS de schema.sql

-- 1. Admin inicial (password: admin123)
INSERT INTO usuarios (email, password, nombre, role)
VALUES ('admin@artefact.com', '$2a$10$6M62/oODgMNGizQENsGY.ObsynGWcQbEBMEq04QQkpSaYE2itDTM.', 'Admin Principal', 'admin')
ON CONFLICT (email) DO NOTHING;

-- 2. Configuración del sitio (solo un registro)
INSERT INTO configuracion_sitio (
  nombre_sitio, email_contacto, telefono_contacto, whatsapp,
  direccion_completa, instagram, facebook, twitter,
  copyright_text
) VALUES (
  'ARTEFACT',
  'info@artefact.com.mx',
  '+52 55 1234 5678',
  '+52 55 1234 5678',
  'Av. Reforma 123, Cuauhtémoc, CDMX, México',
  'https://instagram.com/artefact',
  'https://facebook.com/artefact',
  'https://twitter.com/artefact',
  '© 2027 ARTEFACT - Todos los derechos reservados'
);

-- 3. Paquetes de inscripcion - Convocatoria ARTE FACTO 2027
-- PAQUETES 2D (Obra Bidimensional)
INSERT INTO paquetes (id, nombre, tipo, descripcion, precio, metros_lineales, altura_pared, beneficios, activo)
VALUES
(1, 'Basico 2D', '2D', 'Paquete basico para obra bidimensional', 9500.00, 2.0, 2.4,
 '["2 metros lineales de pared", "Bootcamp de ceramica con material incluido", "5 boletos dobles de cortesia", "Asesores de venta durante la feria", "Acceso a 1-2 talleres en Estudio ARTE FACTO", "Difusion masiva en redes", "Playeras y totebags con serigrafias de tu arte", "Publicaciones y entrevistas previas al evento"]'::jsonb, true),
(2, 'Estandar 2D', '2D', 'Paquete estandar para obra bidimensional', 13000.00, 3.0, 2.4,
 '["3 metros lineales de pared", "Bootcamp de ceramica con material incluido", "5 boletos dobles de cortesia", "Asesores de venta durante la feria", "Acceso a 1-2 talleres en Estudio ARTE FACTO", "Difusion masiva en redes", "Playeras y totebags con serigrafias de tu arte", "Publicaciones y entrevistas previas al evento"]'::jsonb, true),
(3, 'Medio 2D', '2D', 'Paquete medio para obra bidimensional', 19500.00, 5.0, 2.4,
 '["5 metros lineales de pared", "Bootcamp de ceramica con material incluido", "5 boletos dobles de cortesia", "Asesores de venta durante la feria", "Acceso a 1-2 talleres en Estudio ARTE FACTO", "Difusion masiva en redes", "Playeras y totebags con serigrafias de tu arte", "Publicaciones y entrevistas previas al evento"]'::jsonb, true),
(4, 'Amplio 2D', '2D', 'Paquete amplio para obra bidimensional', 24500.00, 7.0, 2.4,
 '["7 metros lineales de pared", "Bootcamp de ceramica con material incluido", "5 boletos dobles de cortesia", "Asesores de venta durante la feria", "Acceso a 1-2 talleres en Estudio ARTE FACTO", "Difusion masiva en redes", "Playeras y totebags con serigrafias de tu arte", "Publicaciones y entrevistas previas al evento"]'::jsonb, true),
(5, 'Completo 2D', '2D', 'Paquete completo para obra bidimensional', 33500.00, 10.0, 2.4,
 '["10 metros lineales de pared", "Bootcamp de ceramica con material incluido", "5 boletos dobles de cortesia", "Asesores de venta durante la feria", "Acceso a 1-2 talleres en Estudio ARTE FACTO", "Difusion masiva en redes", "Playeras y totebags con serigrafias de tu arte", "Publicaciones y entrevistas previas al evento"]'::jsonb, true);

-- PAQUETES 3D (Obra Tridimensional)
INSERT INTO paquetes (id, nombre, tipo, descripcion, precio, metros_cuadrados, beneficios, activo)
VALUES
(6, 'Basico 3D', '3D', 'Paquete basico para obra tridimensional', 6500.00, 1.0,
 '["1 metro cuadrado de espacio", "Bootcamp de ceramica con material incluido", "5 boletos dobles de cortesia", "Asesores de venta durante la feria", "Acceso a 1-2 talleres en Estudio ARTE FACTO", "Difusion masiva en redes", "Playeras y totebags con serigrafias de tu arte", "Publicaciones y entrevistas previas al evento"]'::jsonb, true),
(7, 'Estandar 3D', '3D', 'Paquete estandar para obra tridimensional', 11500.00, 2.0,
 '["2 metros cuadrados de espacio", "Bootcamp de ceramica con material incluido", "5 boletos dobles de cortesia", "Asesores de venta durante la feria", "Acceso a 1-2 talleres en Estudio ARTE FACTO", "Difusion masiva en redes", "Playeras y totebags con serigrafias de tu arte", "Publicaciones y entrevistas previas al evento"]'::jsonb, true),
(8, 'Medio 3D', '3D', 'Paquete medio para obra tridimensional', 15500.00, 3.0,
 '["3 metros cuadrados de espacio", "Bootcamp de ceramica con material incluido", "5 boletos dobles de cortesia", "Asesores de venta durante la feria", "Acceso a 1-2 talleres en Estudio ARTE FACTO", "Difusion masiva en redes", "Playeras y totebags con serigrafias de tu arte", "Publicaciones y entrevistas previas al evento"]'::jsonb, true),
(9, 'Amplio 3D', '3D', 'Paquete amplio para obra tridimensional', 19000.00, 4.0,
 '["4 metros cuadrados de espacio", "Bootcamp de ceramica con material incluido", "5 boletos dobles de cortesia", "Asesores de venta durante la feria", "Acceso a 1-2 talleres en Estudio ARTE FACTO", "Difusion masiva en redes", "Playeras y totebags con serigrafias de tu arte", "Publicaciones y entrevistas previas al evento"]'::jsonb, true),
(10, 'Completo 3D', '3D', 'Paquete completo para obra tridimensional', 33500.00, 9.0,
 '["9 metros cuadrados de espacio", "Bootcamp de ceramica con material incluido", "5 boletos dobles de cortesia", "Asesores de venta durante la feria", "Acceso a 1-2 talleres en Estudio ARTE FACTO", "Difusion masiva en redes", "Playeras y totebags con serigrafias de tu arte", "Publicaciones y entrevistas previas al evento"]'::jsonb, true);

-- Actualizar secuencia
SELECT setval('paquetes_id_seq', 10);

-- 4. Contenido Hero
INSERT INTO contenido (
  tipo, titulo, subtitulo, slug, contenido, publicado,
  cta_principal_texto, cta_principal_url,
  cta_secundario_texto, cta_secundario_url
) VALUES (
  'hero',
  'ARTEFACT 2027',
  'Feria de Arte Contemporáneo',
  'hero-principal',
  'Descubre el talento emergente de artistas locales en la feria de arte contemporáneo más importante de México. Un espacio donde el arte cobra vida y las nuevas propuestas encuentran su público.',
  true,
  'Registrarse como Artista',
  '/registro',
  'Ver Convocatoria',
  '#convocatoria'
);

-- 5. Contenido About
INSERT INTO contenido (
  tipo, titulo, slug, contenido, publicado,
  mision, vision, valores
) VALUES (
  'about',
  'Acerca de ARTEFACT',
  'about',
  'ARTEFACT es una feria de arte contemporáneo que nace con el objetivo de crear un puente entre artistas emergentes y el público amante del arte. Creemos en el poder transformador del arte y en la importancia de dar voz a nuevos talentos.',
  true,
  'Nuestra misión es crear un puente entre artistas emergentes y coleccionistas, galeristas y público en general, promoviendo el arte contemporáneo mexicano.',
  'Ser la plataforma líder en América Latina para el descubrimiento y promoción de artistas contemporáneos emergentes.',
  '[
    {"title": "Calidad", "description": "Selección rigurosa de artistas que demuestren excelencia técnica y propuesta conceptual sólida.", "icon": "🎨"},
    {"title": "Inclusión", "description": "Abrimos espacios para artistas de todas las disciplinas, estilos y orígenes.", "icon": "🤝"},
    {"title": "Innovación", "description": "Fomentamos propuestas creativas que desafíen los límites del arte contemporáneo.", "icon": "💡"},
    {"title": "Transparencia", "description": "Proceso de selección claro y justo evaluado por curadores profesionales.", "icon": "✨"}
  ]'::jsonb
);

-- 6. Contenido Convocatoria
INSERT INTO contenido (
  tipo, titulo, slug, contenido, publicado,
  requisitos, beneficios, pdf_url
) VALUES (
  'convocatoria',
  'Convocatoria Abierta',
  'convocatoria',
  'Invitamos a artistas emergentes a formar parte de ARTEFACT 2027. Esta es tu oportunidad de mostrar tu trabajo ante coleccionistas, galeristas y un público ávido de nuevas propuestas artísticas.',
  true,
  '["Ser mayor de 18 años", "Obra original y de autoría propia", "No haber participado en ediciones anteriores de ARTEFACT como artista seleccionado", "Contar con mínimo 5 obras disponibles para exhibición", "Presentar portfolio digital con imágenes de alta calidad", "Comprometerse a montar y desmontar obra en las fechas establecidas"]'::jsonb,
  '["Espacio de exhibición profesional con iluminación especializada", "Difusión en redes sociales y medios de comunicación", "Inclusión en catálogo oficial (digital e impreso según paquete)", "Acceso a eventos de networking con coleccionistas y galeristas", "Posibilidad de venta directa de obras", "Certificado de participación", "Asesoría para el montaje de obra"]'::jsonb,
  '/pdfs/Convocatoria_ARTEFACTO.pdf'
);

-- 7. Evento principal
INSERT INTO eventos (
  nombre, descripcion, tipo_evento,
  fecha_inicio, fecha_fin,
  ubicacion, lugar_nombre, direccion_completa,
  ciudad, estado, codigo_postal, pais,
  slug, activo
) VALUES (
  'ARTEFACT 2027',
  'La feria de arte contemporáneo más importante de México regresa en 2027 con una selección de los mejores artistas emergentes del país.',
  'feria_principal',
  '2027-02-01 10:00:00',
  '2027-02-28 20:00:00',
  'Centro de Convenciones de la Ciudad de México',
  'Centro de Convenciones CDMX',
  'Av. Paseo de la Reforma 123, Cuauhtémoc, 06600 Ciudad de México, CDMX',
  'Ciudad de México',
  'CDMX',
  '06600',
  'México',
  'artefact-2027',
  true
);

-- 8. Fases de selección
INSERT INTO fases (nombre, descripcion, tipo, numero_fase, porcentaje_seleccion)
VALUES
  ('Fase 1 - Selección Inicial', 'Primera ronda de selección de artistas para ARTEFACT 2027', 'fase', 1, 20.00),
  ('Fase 2 - Selección Semifinal', 'Segunda fase de selección para artistas que pasaron la Fase 1', 'fase', 2, 20.00),
  ('Fase 3 - Selección Final', 'Selección final de artistas que participarán en ARTEFACT 2027', 'fase', 3, 20.00),
  ('Concurso', 'Votación del público para elegir obra destacada', 'concurso', NULL, 10.00);

-- Verificar que todo se insertó correctamente
SELECT 'Usuarios creados:' as info, COUNT(*) as total FROM usuarios;
SELECT 'Paquetes creados:' as info, COUNT(*) as total FROM paquetes;
SELECT 'Contenidos creados:' as info, COUNT(*) as total FROM contenido;
SELECT 'Eventos creados:' as info, COUNT(*) as total FROM eventos;
SELECT 'Fases creadas:' as info, COUNT(*) as total FROM fases;
