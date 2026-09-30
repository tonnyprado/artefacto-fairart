-- ════════════════════════════════════════════════════════════════════
-- 002 · VISTAS DE SOLO LECTURA  (ejecutar como administrador / dueño de tablas)
-- La app lee los datos del registro existente EXCLUSIVAMENTE a través de estas
-- vistas. Adaptado al esquema real de Benito-web.
-- ════════════════════════════════════════════════════════════════════

-- Vista de artistas seleccionados (aprobados)
CREATE OR REPLACE VIEW consigna.v_artistas_seleccionados AS
SELECT
  a.id::text                                 AS artista_id,
  CONCAT(a.nombre, ' ', a.apellido)          AS nombre,
  SPLIT_PART(a.nombre, ' ', 1)               AS nombre_pila,
  a.apellido                                 AS apellido,
  COALESCE(a.rfc, '')                        AS rfc,
  a.folio                                    AS folio,
  COALESCE(p.nombre, 'Sin paquete')          AS paquete,
  a.email                                    AS correo,
  COALESCE(a.telefono, '')                   AS telefono
FROM public.artistas a
LEFT JOIN public.paquetes p ON p.id = a.paquete_id
WHERE a.aprobado = true
  AND a.estado_registro = 'aprobado';

-- Vista de obras postuladas
CREATE OR REPLACE VIEW consigna.v_obras_postuladas AS
SELECT
  o.id::text                                 AS obra_id,
  o.artista_id::text                         AS artista_id,
  COALESCE(o.titulo, 'Sin título')           AS titulo,
  COALESCE(
    o.tecnica || CASE
      WHEN o.anio IS NOT NULL THEN ', ' || o.anio::text
      ELSE ''
    END,
    'Sin técnica'
  )                                          AS tecnica,
  COALESCE(
    o.alto_cm::text || ' × ' || o.ancho_cm::text || ' cm',
    'Sin dimensiones'
  )                                          AS medida,
  -- CRÍTICO: precio_mxn es la ganancia del artista (75%), según migration 014
  -- El sistema calcula automáticamente precio_publico = precio_mxn / 0.75
  COALESCE(o.precio_mxn, 0)::numeric         AS ganancia_registrada
FROM public.obras o
WHERE o.precio_mxn IS NOT NULL
  AND o.precio_mxn > 0;

-- Otorgar permisos de lectura al rol consigna_app
GRANT USAGE ON SCHEMA consigna TO consigna_app;
GRANT SELECT ON consigna.v_artistas_seleccionados, consigna.v_obras_postuladas TO consigna_app;

-- Nota: consigna_app NO recibe permisos sobre public.*; la vista corre con los
-- permisos de su dueño, así que la app solo ve lo que la vista expone.
