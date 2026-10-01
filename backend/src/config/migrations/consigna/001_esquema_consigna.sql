-- ════════════════════════════════════════════════════════════════════
-- 001 · ESQUEMA CONSIGNA  (ejecutar como consigna_app)
-- Solo CREA tablas nuevas en el esquema "consigna".
-- No hay ALTER / DROP / UPDATE / DELETE sobre tablas existentes.
-- ════════════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS pgcrypto; -- gen_random_uuid() (si no existe, pedirlo al admin)

SET search_path TO consigna;

-- Liga personalizada por artista (se guarda SOLO el hash del token)
CREATE TABLE IF NOT EXISTS invitaciones (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artista_id    text        NOT NULL,          -- ⚠ ajustar tipo al PK real de artistas (int/uuid)
  edicion       text        NOT NULL DEFAULT 'AF2',
  token_hash    char(64)    NOT NULL UNIQUE,   -- sha256(token) en hex
  expira_en     timestamptz NOT NULL,
  creada_en     timestamptz NOT NULL DEFAULT now(),
  abierta_en    timestamptz,
  revocada      boolean     NOT NULL DEFAULT false,
  UNIQUE (artista_id, edicion)
);

-- Progreso guardado para retomar (sin firma)
CREATE TABLE IF NOT EXISTS borradores (
  invitacion_id  uuid PRIMARY KEY REFERENCES invitaciones(id) ON DELETE CASCADE,
  datos          jsonb       NOT NULL,
  actualizado_en timestamptz NOT NULL DEFAULT now()
);

-- Acuerdo firmado (inmutable una vez creado)
CREATE TABLE IF NOT EXISTS acuerdos (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invitacion_id     uuid        NOT NULL UNIQUE REFERENCES invitaciones(id),
  artista_id        text        NOT NULL,
  folio             text        NOT NULL,
  version_acuerdo   text        NOT NULL,
  snapshot_artista  jsonb       NOT NULL,      -- datos tal como aparecieron en el PDF
  estado_fiscal     text        NOT NULL CHECK (estado_fiscal IN ('cargada','pendiente','tercero_sin_datos')),
  constancia_key    text,                      -- S3 key
  descuento_max     numeric(5,2) NOT NULL CHECK (descuento_max BETWEEN 0 AND 100),
  firma_key         text        NOT NULL,      -- S3 key PNG
  pdf_key           text        NOT NULL,      -- S3 key PDF
  pdf_sha256        char(64)    NOT NULL,      -- integridad del documento
  ip                inet,
  user_agent        text,
  firmado_en        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS acuerdo_obras (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  acuerdo_id         uuid        NOT NULL REFERENCES acuerdos(id) ON DELETE CASCADE,
  obra_id            text        NOT NULL,     -- ⚠ ajustar tipo al PK real de obras
  titulo             text        NOT NULL,
  tecnica            text        NOT NULL,
  medida             text        NOT NULL,
  ganancia_original  numeric(12,2) NOT NULL,
  ganancia_final     numeric(12,2) NOT NULL,
  comision           numeric(12,2) NOT NULL,
  ajuste             numeric(12,2) NOT NULL,
  precio_venta       numeric(12,2) NOT NULL,
  iva                numeric(12,2) NOT NULL,
  gastos_admin       numeric(12,2) NOT NULL,  -- 3% gastos de gestión administrativa
  precio_publico     numeric(12,2) NOT NULL,
  modificada         boolean GENERATED ALWAYS AS (ganancia_original <> ganancia_final) STORED
);
CREATE INDEX IF NOT EXISTS acuerdo_obras_acuerdo_idx ON acuerdo_obras(acuerdo_id);

-- Bitácora (auditoría): apertura, guardado, subida de constancia, envío
CREATE TABLE IF NOT EXISTS eventos (
  id            bigserial PRIMARY KEY,
  invitacion_id uuid        NOT NULL REFERENCES invitaciones(id),
  tipo          text        NOT NULL,
  detalle       jsonb,
  ip            inet,
  creado_en     timestamptz NOT NULL DEFAULT now()
);
