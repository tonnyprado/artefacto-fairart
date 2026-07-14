-- Datos de ejemplo para ARTEFACT

-- Usuario admin por defecto (password: admin123)
INSERT INTO usuarios (email, password, nombre, role) VALUES
('admin@artefact.com', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa', 'Administrador', 'admin');

-- Paquetes de inscripción de ejemplo
INSERT INTO paquetes (nombre, descripcion, precio, beneficios) VALUES
('Básico', 'Paquete básico para artistas emergentes', 1500.00, '["Espacio de 2x2 metros", "Mesa y silla", "Acceso durante el evento"]'),
('Estándar', 'Paquete estándar con beneficios adicionales', 3000.00, '["Espacio de 3x3 metros", "Mesa, silla y biombo", "Acceso durante el evento", "Mención en redes sociales"]'),
('Premium', 'Paquete premium con todos los beneficios', 5000.00, '["Espacio de 4x4 metros", "Mobiliario completo", "Acceso VIP", "Promoción destacada en redes", "Sesión fotográfica profesional"]');

-- Evento de ejemplo
INSERT INTO eventos (nombre, descripcion, fecha_inicio, fecha_fin, ubicacion, slug) VALUES
('ARTEFACT 2026 - Primavera', 'Primera edición de la feria de arte ARTEFACT. Descubre talento emergente y obras únicas.', '2026-03-15 10:00:00', '2026-03-17 20:00:00', 'Centro Cultural Metro CDMX', 'artefact-2026-primavera'),
('ARTEFACT 2026 - Otoño', 'Segunda edición de la feria con más artistas y categorías.', '2026-09-10 10:00:00', '2026-09-12 20:00:00', 'Museo de Arte Moderno', 'artefact-2026-otono');

-- Artistas de ejemplo
INSERT INTO artistas (nombre, email, bio, categoria, slug, redes_sociales) VALUES
('María González', 'maria@example.com', 'Artista visual especializada en arte abstracto y técnicas mixtas. 10 años de experiencia en galerías internacionales.', 'Pintura', 'maria-gonzalez', '{"instagram": "@mariagonzalezart", "facebook": "mariagonzalezarte"}'),
('Carlos Ramírez', 'carlos@example.com', 'Escultor contemporáneo trabajando con materiales reciclados. Premio Nacional de Arte 2024.', 'Escultura', 'carlos-ramirez', '{"instagram": "@carlosramirezarte", "website": "https://carlosramirez.art"}'),
('Ana Torres', 'ana@example.com', 'Fotógrafa documental enfocada en retratos urbanos y paisajes mexicanos.', 'Fotografía', 'ana-torres', '{"instagram": "@anatorresphoto", "twitter": "@anatorres"}');

-- Obras de ejemplo
INSERT INTO obras (titulo, descripcion, artista_id, precio, categoria, dimensiones, año, disponible) VALUES
('Sueños de Color', 'Obra abstracta en acrílico sobre lienzo, explorando emociones a través del color.', 1, 8500.00, 'Pintura', '100x80 cm', 2025, true),
('Reflejo Urbano', 'Escultura en metal reciclado representando la vida en la ciudad moderna.', 2, 15000.00, 'Escultura', '150x60x40 cm', 2025, true),
('Atardecer en Oaxaca', 'Fotografía fine art de paisaje oaxaqueño al atardecer.', 3, 3500.00, 'Fotografía', '60x40 cm', 2024, true),
('Geometría Interior', 'Pintura minimalista explorando formas geométricas y espacios negativos.', 1, 6000.00, 'Pintura', '80x80 cm', 2025, true);

-- Inscripciones de ejemplo
INSERT INTO inscripciones (artista_id, evento_id, paquete_id, estado, notas) VALUES
(1, 1, 2, 'aprobada', 'Artista con excelente portafolio'),
(2, 1, 3, 'aprobada', 'Premio Nacional de Arte'),
(3, 1, 1, 'pendiente', 'Primera participación en feria');

-- Contenido del sitio
INSERT INTO contenido (tipo, titulo, slug, contenido, publicado) VALUES
('pagina', 'Acerca de ARTEFACT', 'acerca-de', 'ARTEFACT es una feria de arte que busca promover el talento emergente mexicano...', true),
('noticia', 'Lanzamiento ARTEFACT 2026', 'lanzamiento-artefact-2026', 'Nos complace anunciar el lanzamiento de la primera edición de ARTEFACT...', true);
