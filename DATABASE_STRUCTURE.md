# ESTRUCTURA COMPLETA DE BASE DE DATOS - ARTEFACT

Este documento describe **TODA** la estructura de la base de datos de ARTEFACT, incluyendo tanto el landing page público como el sistema completo de gestión de artistas, votaciones, fases y administración.

**Estado actual:** Backend funcionando con **mockData** (datos hardcodeados). Schema SQL completo en `/database/schema.sql`.

**Última actualización:** Agosto 2026 (Endpoints del landing implementados ✅)

---

## 📋 ÍNDICE

1. [Resumen de Tablas](#resumen-de-tablas)
2. [Schema Completo](#schema-completo)
3. [APIs Implementadas](#apis-implementadas)
4. [Próximos Pasos para Hosting](#próximos-pasos-para-hosting)

---

## 📊 RESUMEN DE TABLAS

### Tablas Principales (14 tablas)

| Tabla | Propósito | Estado Schema | Estado API | Prioridad |
|-------|-----------|---------------|------------|-----------|
| `usuarios` | Admins y curadores | ✅ | ✅ Mock | Alta |
| `artistas` | Registro de artistas | ✅ | ✅ Mock | Alta |
| `obras` | Obras de arte | ✅ | ⚠️ Parcial | Media |
| `paquetes` | Paquetes de inscripción | ✅ | ✅ Mock | Alta |
| `eventos` | Ferias/eventos | ✅ | ✅ Mock | Alta |
| `inscripciones` | Artistas en eventos | ✅ | ✅ Mock | Alta |
| `fases` | Fases de selección | ✅ | ✅ Mock | Alta |
| `inscripciones_fases` | Artistas por fase | ✅ | ✅ Mock | Alta |
| `votaciones` | Votos de curadores | ✅ | ✅ Mock | Alta |
| `artistas_seleccionados` | Resultados por fase | ✅ | ⚠️ Parcial | Media |
| `contenido` | CMS del landing | ✅ | ❌ | Alta |
| `configuracion_sitio` | Config general | ❌ Schema | ❌ | Alta |
| `mensajes_contacto` | Formulario contacto | ❌ Schema | ❌ | Media |

**Leyenda:**
- ✅ Implementado completamente
- ⚠️ Implementado parcialmente
- ❌ No implementado

---

## 🗄️ SCHEMA COMPLETO

### 1. **usuarios** - Sistema de autenticación

**Descripción:** Administradores y curadores con acceso al panel admin.

```sql
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  apellido VARCHAR(255),
  telefono VARCHAR(20),
  role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('admin', 'curador')),

  -- Campos específicos para curadores
  especialidad VARCHAR(255), -- Ej: "Arte Contemporáneo", "Fotografía"
  bio TEXT,
  foto VARCHAR(500), -- URL Cloudinary

  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_usuarios_role ON usuarios(role);
CREATE INDEX idx_usuarios_activo ON usuarios(activo);
```

**Campos clave:**
- `role`: 'admin' (gestión completa) o 'curador' (solo votación)
- `especialidad` y `bio`: Solo para curadores, se muestra en su perfil
- Contraseña hasheada con bcrypt (salt rounds: 10)

**API endpoints:**
- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login (devuelve JWT)
- `GET /api/auth/verify` - Verificar token

---

### 2. **artistas** - Registro de artistas

**Descripción:** Artistas que se registran para participar en ARTEFACT.

```sql
CREATE TABLE IF NOT EXISTS artistas (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  apellido VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  telefono VARCHAR(20),
  fecha_nacimiento DATE,
  pais VARCHAR(100),
  ciudad VARCHAR(100),
  direccion TEXT,
  bio TEXT,
  categoria VARCHAR(100) NOT NULL, -- pintura, escultura, fotografía, ilustracion, arte_digital, etc.
  foto VARCHAR(500), -- URL Cloudinary
  slug VARCHAR(255) UNIQUE NOT NULL,

  -- Redes sociales
  redes_sociales JSONB DEFAULT '{}', -- {instagram, facebook, website, behance, etc.}

  -- Documentos subidos (Cloudinary URLs)
  documentos JSONB DEFAULT '{}', -- {cv, portfolio, identificacion, portfolio_images: [...]}

  -- Paquete y layout
  paquete_id INTEGER REFERENCES paquetes(id) ON DELETE SET NULL,
  layout_canvas_url VARCHAR(500), -- URL de la imagen del canvas en Cloudinary
  layout_canvas_data JSONB DEFAULT '{}', -- {obras: [{x, y, width, height, image_url, titulo}], scale, ...}

  -- Estado de aprobación
  estado VARCHAR(50) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobado', 'rechazado')),
  notas_admin TEXT, -- Notas internas del admin

  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_artistas_categoria ON artistas(categoria);
CREATE INDEX idx_artistas_slug ON artistas(slug);
CREATE INDEX idx_artistas_activo ON artistas(activo);
CREATE INDEX idx_artistas_estado ON artistas(estado);
```

**Campos JSONB:**

`documentos` estructura:
```json
{
  "cv": "https://cloudinary.com/...",
  "portfolio": "https://cloudinary.com/...",
  "identificacion": "https://cloudinary.com/...",
  "portfolio_images": [
    {
      "id": "img-123",
      "titulo": "Obra 1",
      "url": "https://cloudinary.com/...",
      "alto_cm": 100,
      "ancho_cm": 80
    }
  ]
}
```

`layout_canvas_data` estructura:
```json
{
  "obras": [
    {
      "id": "obra-1",
      "x": 50,
      "y": 100,
      "width": 200,
      "height": 250,
      "image_url": "https://cloudinary.com/...",
      "titulo": "Amanecer",
      "alto_cm": 100,
      "ancho_cm": 80
    }
  ],
  "scale": 1.5,
  "canvas_width": 3000,
  "canvas_height": 2400
}
```

**API endpoints:**
- `GET /api/artistas` - Listar (con filtros: categoria, estado, search)
- `GET /api/artistas/:id` - Detalle
- `POST /api/artistas` - Crear (registro público)
- `PUT /api/artistas/:id` - Actualizar
- `PUT /api/artistas/:id/aprobar` - Aprobar (admin)
- `PUT /api/artistas/:id/rechazar` - Rechazar (admin)
- `DELETE /api/artistas/:id` - Eliminar (admin)
- `GET /api/artistas/fase/:fase_id` - Artistas de una fase

---

### 3. **obras** - Obras de arte

**Descripción:** Obras individuales de cada artista (opcional, complementa el portfolio).

```sql
CREATE TABLE IF NOT EXISTS obras (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  artista_id INTEGER NOT NULL REFERENCES artistas(id) ON DELETE CASCADE,
  precio DECIMAL(10, 2) NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  imagen VARCHAR(500), -- URL Cloudinary
  dimensiones VARCHAR(100), -- "100x80 cm"
  año INTEGER,
  disponible BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_obras_artista ON obras(artista_id);
CREATE INDEX idx_obras_categoria ON obras(categoria);
CREATE INDEX idx_obras_disponible ON obras(disponible);
```

**Nota:** Actualmente las obras se guardan dentro de `artistas.documentos.portfolio_images`. Esta tabla permite gestión más detallada.

---

### 4. **paquetes** - Paquetes de inscripción

**Descripción:** Opciones de espacio de exhibición para artistas (Básico, Profesional, Premium).

```sql
CREATE TABLE IF NOT EXISTS paquetes (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT NOT NULL,
  precio DECIMAL(10, 2) NOT NULL,

  -- Dimensiones del espacio
  metros_lineales DECIMAL(5, 2) NOT NULL DEFAULT 3.0, -- Ancho de pared
  altura_pared DECIMAL(5, 2) NOT NULL DEFAULT 2.4, -- Altura de pared
  obras_maximas INTEGER NOT NULL DEFAULT 10, -- Límite de obras

  -- Beneficios incluidos
  beneficios JSONB DEFAULT '[]', -- Array de strings

  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Ejemplo de beneficios:**
```json
[
  "Espacio de 3 metros lineales de pared",
  "Altura de 2.4 metros",
  "Iluminación profesional LED",
  "Tarjeta de presentación junto a las obras",
  "Mención en catálogo digital"
]
```

**Paquetes predefinidos:**
- **Básico** ($1,500 MXN): 3m × 2.4m, 8 obras máx
- **Profesional** ($2,800 MXN): 5m × 2.8m, 15 obras máx
- **Premium** ($4,500 MXN): 8m × 3m, 25 obras máx

**API endpoints:**
- `GET /api/paquetes` - Listar (filtro: activo=true)
- `GET /api/paquetes/:id` - Detalle
- `POST /api/paquetes` - Crear (admin)
- `PUT /api/paquetes/:id` - Actualizar (admin)
- `DELETE /api/paquetes/:id` - Eliminar (admin)

---

### 5. **eventos** - Ferias y eventos

**Descripción:** Eventos/ferias organizadas por ARTEFACT (ej: ARTEFACT 2027).

```sql
CREATE TABLE IF NOT EXISTS eventos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  tipo_evento VARCHAR(50) DEFAULT 'feria_principal', -- 'feria_principal', 'calendario', 'especial'
  fecha_inicio TIMESTAMP NOT NULL,
  fecha_fin TIMESTAMP NOT NULL,

  -- Ubicación
  ubicacion TEXT NOT NULL,
  lugar_nombre VARCHAR(255), -- 'Centro de Convenciones CDMX'
  direccion_completa TEXT,
  ciudad VARCHAR(100),
  estado VARCHAR(100),
  codigo_postal VARCHAR(10),
  pais VARCHAR(100) DEFAULT 'México',
  coordenadas_lat DECIMAL(10, 8),
  coordenadas_lng DECIMAL(11, 8),
  mapa_embed_url TEXT, -- Google Maps embed

  -- Transporte
  info_transporte JSONB, -- {metro, metrobus, estacionamiento}

  imagen VARCHAR(500),
  slug VARCHAR(255) UNIQUE NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_eventos_fecha_inicio ON eventos(fecha_inicio);
CREATE INDEX idx_eventos_slug ON eventos(slug);
CREATE INDEX idx_eventos_activo ON eventos(activo);
```

**Campos expandidos (vs schema.sql):**
- Necesita agregar: `tipo_evento`, `lugar_nombre`, `direccion_completa`, `ciudad`, `estado`, `codigo_postal`, `pais`, `coordenadas_lat`, `coordenadas_lng`, `mapa_embed_url`, `info_transporte`

**API endpoints necesarias:**
- `GET /api/eventos/principal` - Evento principal activo
- `GET /api/eventos/calendario` - Eventos del calendario
- `GET /api/eventos` - Listar todos
- `GET /api/eventos/:id` - Detalle

---

### 6. **inscripciones** - Artistas inscritos a eventos

**Descripción:** Relación artista-evento-paquete. Inscripción a ferias.

```sql
CREATE TABLE IF NOT EXISTS inscripciones (
  id SERIAL PRIMARY KEY,
  artista_id INTEGER NOT NULL REFERENCES artistas(id) ON DELETE CASCADE,
  evento_id INTEGER NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  paquete_id INTEGER NOT NULL REFERENCES paquetes(id) ON DELETE RESTRICT,
  estado VARCHAR(50) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobada', 'rechazada')),
  notas TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(artista_id, evento_id)
);

CREATE INDEX idx_inscripciones_artista ON inscripciones(artista_id);
CREATE INDEX idx_inscripciones_evento ON inscripciones(evento_id);
CREATE INDEX idx_inscripciones_estado ON inscripciones(estado);
```

**API endpoints:**
- `GET /api/inscripciones` - Listar
- `POST /api/inscripciones` - Crear inscripción
- `PUT /api/inscripciones/:id` - Actualizar estado

---

### 7. **fases** - Sistema de fases de selección

**Descripción:** Fases de selección progresiva (Fase 1, Fase 2, Fase 3, Concurso).

```sql
CREATE TABLE IF NOT EXISTS fases (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL, -- 'Fase 1', 'Fase 2', 'Fase 3', 'Concurso'
  descripcion TEXT,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('fase', 'concurso')),
  numero_fase INTEGER, -- 1, 2, 3, null para concurso

  -- Fechas de inscripción
  fecha_inicio_inscripciones TIMESTAMP,
  fecha_fin_inscripciones TIMESTAMP,

  -- Fechas de votación
  fecha_inicio_votaciones TIMESTAMP,
  fecha_fin_votaciones TIMESTAMP,

  -- Criterios de selección
  porcentaje_seleccion DECIMAL(5, 2) DEFAULT 20.00, -- % artistas seleccionados
  max_artistas_seleccionados INTEGER, -- Límite absoluto

  -- Estados
  inscripciones_abiertas BOOLEAN DEFAULT false,
  votaciones_abiertas BOOLEAN DEFAULT false,
  finalizada BOOLEAN DEFAULT false,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_fases_tipo ON fases(tipo);
CREATE INDEX idx_fases_inscripciones_abiertas ON fases(inscripciones_abiertas);
CREATE INDEX idx_fases_votaciones_abiertas ON fases(votaciones_abiertas);
CREATE INDEX idx_fases_finalizada ON fases(finalizada);
```

**Flujo de fases:**
1. Admin crea fase
2. Admin abre inscripciones
3. Artistas se inscriben (o admin los inscribe)
4. Admin cierra inscripciones y abre votaciones
5. Curadores votan
6. Admin cierra votaciones y finaliza fase
7. Los artistas con mejor porcentaje de aprobación pasan

**API endpoints:**
- `GET /api/fases` - Listar
- `GET /api/fases/:id` - Detalle
- `POST /api/fases` - Crear (admin)
- `PUT /api/fases/:id` - Actualizar (admin)
- `PUT /api/fases/:id/abrir-votaciones` - Abrir votaciones (admin)
- `PUT /api/fases/:id/cerrar-votaciones` - Cerrar votaciones (admin)
- `PUT /api/fases/:id/finalizar` - Finalizar fase (admin)
- `DELETE /api/fases/:id` - Eliminar (admin)
- `GET /api/fases/:id/artistas` - IDs de artistas en fase
- `POST /api/fases/:id/artistas` - Inscribir artistas (admin)

---

### 8. **inscripciones_fases** - Artistas por fase

**Descripción:** Relación many-to-many entre artistas y fases. Un artista puede estar en múltiples fases.

```sql
CREATE TABLE IF NOT EXISTS inscripciones_fases (
  id SERIAL PRIMARY KEY,
  artista_id INTEGER NOT NULL REFERENCES artistas(id) ON DELETE CASCADE,
  fase_id INTEGER NOT NULL REFERENCES fases(id) ON DELETE CASCADE,
  estado VARCHAR(50) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_revision', 'aprobado', 'rechazado')),
  notas_admin TEXT,
  fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(artista_id, fase_id) -- Un artista solo puede inscribirse una vez por fase
);

CREATE INDEX idx_inscripciones_fases_artista ON inscripciones_fases(artista_id);
CREATE INDEX idx_inscripciones_fases_fase ON inscripciones_fases(fase_id);
CREATE INDEX idx_inscripciones_fases_estado ON inscripciones_fases(estado);
```

**Estados:**
- `pendiente`: Inscrito, esperando revisión
- `en_revision`: Admin/curadores revisando
- `aprobado`: Pasa a votación
- `rechazado`: No cumple requisitos

---

### 9. **votaciones** - Votos de curadores

**Descripción:** Sistema de votación de curadores por artista en cada fase.

```sql
CREATE TABLE IF NOT EXISTS votaciones (
  id SERIAL PRIMARY KEY,
  curador_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  artista_id INTEGER NOT NULL REFERENCES artistas(id) ON DELETE CASCADE,
  fase_id INTEGER NOT NULL REFERENCES fases(id) ON DELETE CASCADE,
  voto BOOLEAN NOT NULL, -- true = a favor, false = en contra
  comentario TEXT, -- Comentario opcional del curador
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(curador_id, artista_id, fase_id) -- Un curador solo vota una vez por artista por fase
);

CREATE INDEX idx_votaciones_curador ON votaciones(curador_id);
CREATE INDEX idx_votaciones_artista ON votaciones(artista_id);
CREATE INDEX idx_votaciones_fase ON votaciones(fase_id);
CREATE INDEX idx_votaciones_voto ON votaciones(voto);
```

**Lógica:**
- Cada curador vota `true` (aprueba) o `false` (rechaza)
- Se calcula porcentaje de aprobación: `(votos_favor / total_votos) * 100`
- Los artistas con mayor % de aprobación pasan a la siguiente fase

**API endpoints:**
- `POST /api/votaciones` - Crear voto (curador)
- `PUT /api/votaciones/:id` - Actualizar voto (curador)
- `GET /api/votaciones/mis-votos` - Votos del curador autenticado
- `GET /api/votaciones/resultados/:fase_id` - Ranking de artistas en fase
- `GET /api/votaciones/estadisticas` - Estadísticas del curador
- `DELETE /api/votaciones/:id` - Eliminar voto (curador/admin)
- `GET /api/votaciones/fase/:fase_id/artista/:artista_id` - Verificar si ya votó

---

### 10. **artistas_seleccionados** - Resultados por fase

**Descripción:** Artistas que pasaron cada fase (resultados finales).

```sql
CREATE TABLE IF NOT EXISTS artistas_seleccionados (
  id SERIAL PRIMARY KEY,
  artista_id INTEGER NOT NULL REFERENCES artistas(id) ON DELETE CASCADE,
  fase_id INTEGER NOT NULL REFERENCES fases(id) ON DELETE CASCADE,
  total_votos_favor INTEGER DEFAULT 0,
  total_votos_contra INTEGER DEFAULT 0,
  porcentaje_aprobacion DECIMAL(5, 2), -- % votos a favor
  posicion INTEGER, -- Posición en ranking
  notificado BOOLEAN DEFAULT false, -- Si ya se notificó por email
  fecha_seleccion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(artista_id, fase_id)
);

CREATE INDEX idx_artistas_seleccionados_artista ON artistas_seleccionados(artista_id);
CREATE INDEX idx_artistas_seleccionados_fase ON artistas_seleccionados(fase_id);
CREATE INDEX idx_artistas_seleccionados_notificado ON artistas_seleccionados(notificado);
```

**Uso:**
- Admin ejecuta proceso de selección al finalizar fase
- Se crean registros con los top X% artistas (según `porcentaje_seleccion`)
- Sistema envía emails a artistas seleccionados

**API necesaria:**
- `POST /api/fases/:id/procesar-resultados` - Calcular y guardar seleccionados

---

### 11. **contenido** - CMS del landing page

**Descripción:** Contenido dinámico del landing (hero, about, convocatoria, etc).

```sql
CREATE TABLE IF NOT EXISTS contenido (
  id SERIAL PRIMARY KEY,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('hero', 'about', 'convocatoria', 'pagina', 'seccion', 'noticia')),
  titulo VARCHAR(255) NOT NULL,
  subtitulo VARCHAR(500),
  slug VARCHAR(255) UNIQUE NOT NULL,
  contenido TEXT,
  imagen VARCHAR(500), -- URL Cloudinary
  publicado BOOLEAN DEFAULT false,

  -- Campos específicos para Hero
  cta_principal_texto VARCHAR(100),
  cta_principal_url VARCHAR(255),
  cta_secundario_texto VARCHAR(100),
  cta_secundario_url VARCHAR(255),

  -- Campos específicos para About
  mision TEXT,
  vision TEXT,
  valores JSONB, -- [{title, description, icon}]

  -- Campos específicos para Convocatoria
  requisitos JSONB, -- Array de strings
  beneficios JSONB, -- Array de strings
  pdf_url VARCHAR(500), -- PDF de convocatoria en Cloudinary

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_contenido_tipo ON contenido(tipo);
CREATE INDEX idx_contenido_slug ON contenido(slug);
CREATE INDEX idx_contenido_publicado ON contenido(publicado);
```

**Campos nuevos (agregar al schema.sql):**
- `subtitulo`, `cta_principal_texto`, `cta_principal_url`, `cta_secundario_texto`, `cta_secundario_url`
- `mision`, `vision`, `valores`
- `requisitos`, `beneficios`, `pdf_url`

**API necesaria:**
- `GET /api/contenido?tipo=hero` - Contenido del hero
- `GET /api/contenido?tipo=about` - Contenido de about
- `GET /api/contenido?tipo=convocatoria` - Contenido de convocatoria

---

### 12. **configuracion_sitio** - Configuración general (NUEVA TABLA)

**Descripción:** Configuración global del sitio (contacto, redes, logo, etc).

```sql
CREATE TABLE IF NOT EXISTS configuracion_sitio (
  id SERIAL PRIMARY KEY,
  -- Información básica
  nombre_sitio VARCHAR(255) NOT NULL DEFAULT 'ARTEFACT',
  logo_url VARCHAR(500), -- URL Cloudinary
  descripcion TEXT,

  -- Contacto
  email_contacto VARCHAR(255),
  telefono_contacto VARCHAR(20),
  whatsapp VARCHAR(20),
  direccion_completa TEXT,

  -- Redes sociales
  instagram VARCHAR(255),
  facebook VARCHAR(255),
  twitter VARCHAR(255),
  linkedin VARCHAR(255),

  -- Legal
  copyright_text TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**API necesaria:**
- `GET /api/configuracion` - Obtener configuración

**Nota:** Esta tabla debe tener **un solo registro** (singleton pattern).

---

### 13. **mensajes_contacto** - Formulario de contacto (NUEVA TABLA)

**Descripción:** Mensajes enviados desde el formulario de contacto del landing.

```sql
CREATE TABLE IF NOT EXISTS mensajes_contacto (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefono VARCHAR(20),
  asunto VARCHAR(255) NOT NULL,
  mensaje TEXT NOT NULL,

  -- Estado
  leido BOOLEAN DEFAULT false,
  respondido BOOLEAN DEFAULT false,

  -- Respuesta (opcional)
  respuesta TEXT,
  respondido_por INTEGER REFERENCES usuarios(id),
  fecha_respuesta TIMESTAMP,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_mensajes_contacto_leido ON mensajes_contacto(leido);
CREATE INDEX idx_mensajes_contacto_respondido ON mensajes_contacto(respondido);
CREATE INDEX idx_mensajes_contacto_created_at ON mensajes_contacto(created_at DESC);
```

**API necesaria:**
- `POST /api/contacto` - Enviar mensaje
- `GET /api/contacto` - Listar mensajes (admin)
- `PUT /api/contacto/:id/marcar-leido` - Marcar como leído
- `PUT /api/contacto/:id/responder` - Responder mensaje

---

### 14. **layouts** - Upload de canvas (NO ES TABLA)

**Descripción:** Endpoint para subir imágenes del canvas layout a Cloudinary.

**API implementada:**
- `POST /api/layouts/upload` - Subir imagen del canvas (devuelve URL de Cloudinary)

**Nota:** No es tabla, los datos se guardan en `artistas.layout_canvas_url` y `artistas.layout_canvas_data`.

---

## 🔌 APIS IMPLEMENTADAS

### Estado de implementación

| Endpoint | Método | Descripción | Estado | Auth |
|----------|--------|-------------|--------|------|
| **AUTH** |
| `/api/auth/register` | POST | Registro de usuario | ✅ Mock | - |
| `/api/auth/login` | POST | Login (devuelve JWT) | ✅ Mock | - |
| `/api/auth/verify` | GET | Verificar token | ✅ Mock | - |
| **ARTISTAS** |
| `/api/artistas` | GET | Listar artistas | ✅ Mock | Admin |
| `/api/artistas/:id` | GET | Detalle de artista | ✅ Mock | Admin |
| `/api/artistas` | POST | Crear artista (registro) | ✅ Mock | Público |
| `/api/artistas/:id` | PUT | Actualizar artista | ✅ Mock | Admin |
| `/api/artistas/:id/aprobar` | PUT | Aprobar artista | ✅ Mock | Admin |
| `/api/artistas/:id/rechazar` | PUT | Rechazar artista | ✅ Mock | Admin |
| `/api/artistas/:id` | DELETE | Eliminar artista | ✅ Mock | Admin |
| `/api/artistas/fase/:fase_id` | GET | Artistas de fase | ✅ Mock | Admin |
| **FASES** |
| `/api/fases` | GET | Listar fases | ✅ Mock | Admin |
| `/api/fases/:id` | GET | Detalle de fase | ✅ Mock | Admin |
| `/api/fases` | POST | Crear fase | ✅ Mock | Admin |
| `/api/fases/:id` | PUT | Actualizar fase | ✅ Mock | Admin |
| `/api/fases/:id/abrir-votaciones` | PUT | Abrir votaciones | ✅ Mock | Admin |
| `/api/fases/:id/cerrar-votaciones` | PUT | Cerrar votaciones | ✅ Mock | Admin |
| `/api/fases/:id/finalizar` | PUT | Finalizar fase | ✅ Mock | Admin |
| `/api/fases/:id` | DELETE | Eliminar fase | ✅ Mock | Admin |
| `/api/fases/:id/artistas` | GET | IDs artistas en fase | ✅ Mock | Admin |
| `/api/fases/:id/artistas` | POST | Inscribir artistas | ✅ Mock | Admin |
| **VOTACIONES** |
| `/api/votaciones` | POST | Crear voto | ✅ Mock | Curador |
| `/api/votaciones/:id` | PUT | Actualizar voto | ✅ Mock | Curador |
| `/api/votaciones/mis-votos` | GET | Votos del curador | ✅ Mock | Curador |
| `/api/votaciones/resultados/:fase_id` | GET | Ranking de fase | ✅ Mock | Admin/Curador |
| `/api/votaciones/estadisticas` | GET | Stats del curador | ✅ Mock | Curador |
| `/api/votaciones/:id` | DELETE | Eliminar voto | ✅ Mock | Curador |
| `/api/votaciones/fase/:fase_id/artista/:artista_id` | GET | Verificar voto | ✅ Mock | Curador |
| **PAQUETES** |
| `/api/paquetes` | GET | Listar paquetes | ✅ Mock | Público |
| `/api/paquetes/:id` | GET | Detalle de paquete | ✅ Mock | Público |
| `/api/paquetes` | POST | Crear paquete | ✅ Mock | Admin |
| `/api/paquetes/:id` | PUT | Actualizar paquete | ✅ Mock | Admin |
| `/api/paquetes/:id` | DELETE | Eliminar paquete | ✅ Mock | Admin |
| **LAYOUTS** |
| `/api/layouts/upload` | POST | Upload canvas image | ✅ Mock | Público |
| **CURADORES** |
| `/api/curadores` | GET | Listar curadores | ✅ Mock | Admin |
| **CONFIGURACIÓN** |
| `/api/configuracion` | GET | Config del sitio | ✅ Mock | Público |
| `/api/configuracion` | PUT | Actualizar config | ✅ Mock | Admin |
| **CONTENIDO** |
| `/api/contenido` | GET | Contenido dinámico (query: tipo) | ✅ Mock | Público |
| `/api/contenido/all` | GET | Listar todos | ✅ Mock | Admin |
| `/api/contenido/:id` | GET | Detalle de contenido | ✅ Mock | Admin |
| `/api/contenido` | POST | Crear contenido | ✅ Mock | Admin |
| `/api/contenido/:id` | PUT | Actualizar contenido | ✅ Mock | Admin |
| `/api/contenido/:id` | DELETE | Eliminar contenido | ✅ Mock | Admin |
| **EVENTOS** |
| `/api/eventos/principal` | GET | Evento principal | ✅ Mock | Público |
| `/api/eventos/calendario` | GET | Eventos calendario | ✅ Mock | Público |
| `/api/eventos` | GET | Listar eventos | ✅ Mock | Público |
| `/api/eventos/:id` | GET | Detalle de evento | ✅ Mock | Público |
| `/api/eventos/slug/:slug` | GET | Evento por slug | ✅ Mock | Público |
| `/api/eventos` | POST | Crear evento | ✅ Mock | Admin |
| `/api/eventos/:id` | PUT | Actualizar evento | ✅ Mock | Admin |
| `/api/eventos/:id` | DELETE | Eliminar evento | ✅ Mock | Admin |
| **CONTACTO** |
| `/api/contacto` | POST | Enviar mensaje | ✅ Mock | Público |
| `/api/contacto` | GET | Listar mensajes | ✅ Mock | Admin |
| `/api/contacto/estadisticas` | GET | Stats de mensajes | ✅ Mock | Admin |
| `/api/contacto/:id` | GET | Detalle mensaje | ✅ Mock | Admin |
| `/api/contacto/:id/marcar-leido` | PUT | Marcar como leído | ✅ Mock | Admin |
| `/api/contacto/:id/responder` | PUT | Responder mensaje | ✅ Mock | Admin |
| `/api/contacto/:id` | DELETE | Eliminar mensaje | ✅ Mock | Admin |

---

## 🚀 PRÓXIMOS PASOS PARA HOSTING

### 1. **Preparación del Schema**

```bash
# Ya tienes el schema en /database/schema.sql
# Necesitas agregarlo al servicio de PostgreSQL
```

**Tareas:**
- [ ] Agregar campos faltantes a tabla `contenido` (ver sección 11)
- [ ] Agregar campos faltantes a tabla `eventos` (ver sección 5)
- [ ] Crear tabla `configuracion_sitio` (ver sección 12)
- [ ] Crear tabla `mensajes_contacto` (ver sección 13)
- [ ] Ejecutar script SQL completo en PostgreSQL de producción

---

### 2. **Conexión a PostgreSQL**

**Variables de entorno necesarias:**

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/artefact_db
DB_HOST=your-postgres-host.com
DB_PORT=5432
DB_NAME=artefact_db
DB_USER=your_user
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-super-secret-key-here
JWT_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Frontend
FRONTEND_URL=https://artefact.com
```

**Modificar archivos:**
- [ ] `/backend/src/config/database.js` - Configurar pool de PostgreSQL
- [ ] Crear `/backend/src/db/queries.js` - Queries SQL parametrizadas
- [ ] Reemplazar imports de `mockData.js` por queries reales en todos los controllers

---

### 3. **Seed Data Inicial**

**Crear archivo:** `/database/seed.sql`

```sql
-- Insertar configuración del sitio
INSERT INTO configuracion_sitio (nombre_sitio, email_contacto, telefono_contacto, ...)
VALUES ('ARTEFACT', 'info@artefact.com', '+52 55 1234 5678', ...);

-- Insertar usuario admin inicial
INSERT INTO usuarios (email, password, nombre, role)
VALUES ('admin@artefact.com', '$2a$10$...', 'Admin Principal', 'admin');

-- Insertar paquetes
INSERT INTO paquetes (nombre, descripcion, precio, metros_lineales, altura_pared, obras_maximas, beneficios)
VALUES
  ('Paquete Básico', '...', 1500.00, 3.0, 2.4, 8, '[...]'),
  ('Paquete Profesional', '...', 2800.00, 5.0, 2.8, 15, '[...]'),
  ('Paquete Premium', '...', 4500.00, 8.0, 3.0, 25, '[...]');

-- Insertar contenido del landing
INSERT INTO contenido (tipo, titulo, slug, contenido, publicado, ...)
VALUES
  ('hero', 'ARTEFACT 2027', 'hero-principal', '...', true, ...),
  ('about', 'Acerca de ARTEFACT', 'about', '...', true, ...),
  ('convocatoria', 'Convocatoria Abierta', 'convocatoria', '...', true, ...);

-- Insertar evento principal
INSERT INTO eventos (nombre, descripcion, fecha_inicio, fecha_fin, ubicacion, slug, activo, ...)
VALUES ('ARTEFACT 2027', '...', '2027-02-01', '2027-02-28', '...', 'artefact-2027', true, ...);

-- Insertar fases
INSERT INTO fases (nombre, descripcion, tipo, numero_fase, porcentaje_seleccion)
VALUES
  ('Fase 1 - Selección Inicial', '...', 'fase', 1, 20.00),
  ('Fase 2 - Selección Semifinal', '...', 'fase', 2, 20.00),
  ('Fase 3 - Selección Final', '...', 'fase', 3, 20.00),
  ('Concurso', 'Votación del público', 'concurso', null, 10.00);
```

---

### 4. **APIs Pendientes para Landing**

**Prioridad Alta:**

```javascript
// backend/src/controllers/configuracion.controller.js
export const getConfiguracion = async (req, res) => {
  // SELECT * FROM configuracion_sitio LIMIT 1
}

// backend/src/controllers/contenido.controller.js
export const getContenidoPorTipo = async (req, res) => {
  // SELECT * FROM contenido WHERE tipo = $1 AND publicado = true
}

// backend/src/controllers/eventos.controller.js
export const getEventoPrincipal = async (req, res) => {
  // SELECT * FROM eventos WHERE tipo_evento = 'feria_principal' AND activo = true
}

// backend/src/controllers/contacto.controller.js
export const enviarMensaje = async (req, res) => {
  // INSERT INTO mensajes_contacto (nombre, email, ...) VALUES (...)
}
```

**Rutas:**
```javascript
// backend/src/server.js
import configuracionRoutes from './routes/configuracion.routes.js'
import contenidoRoutes from './routes/contenido.routes.js'
import eventosRoutes from './routes/eventos.routes.js'
import contactoRoutes from './routes/contacto.routes.js'

app.use('/api/configuracion', configuracionRoutes)
app.use('/api/contenido', contenidoRoutes)
app.use('/api/eventos', eventosRoutes)
app.use('/api/contacto', contactoRoutes)
```

---

### 5. **Hosting Recomendado**

**Backend + Base de Datos:**
- **Railway** (recomendado): PostgreSQL incluido, deploy automático desde Git
- **Render**: Free tier con PostgreSQL
- **Vercel** (serverless): Requiere PostgreSQL externo (Supabase/Neon)

**Pasos Railway:**
1. Crear cuenta en railway.app
2. New Project > Deploy PostgreSQL
3. New Service > GitHub Repo (vincular backend)
4. Agregar variables de entorno
5. Ejecutar schema.sql en PostgreSQL
6. Ejecutar seed.sql para datos iniciales

**Frontend:**
- Vercel (recomendado para Next.js)
- Netlify

---

### 6. **Checklist Final**

**Base de Datos:**
- [ ] Crear servicio PostgreSQL en Railway/Render
- [ ] Ejecutar `/database/schema.sql` completo
- [ ] Ejecutar `/database/seed.sql` con datos iniciales
- [ ] Verificar todas las tablas creadas
- [ ] Verificar índices creados
- [ ] Verificar triggers funcionando

**Backend:**
- [ ] Configurar variables de entorno en hosting
- [ ] Reemplazar mockData por queries SQL en controllers
- [ ] Crear controllers para landing (configuracion, contenido, eventos, contacto)
- [ ] Testing de endpoints con PostgreSQL real
- [ ] Configurar CORS con dominio de producción
- [ ] Deploy del backend

**Frontend:**
- [ ] Crear services para consumir APIs del landing
- [ ] Actualizar componentes del landing para usar APIs reales
- [ ] Testing de integración frontend-backend
- [ ] Deploy del frontend
- [ ] Configurar variables de entorno (NEXT_PUBLIC_API_URL)

**Cloudinary:**
- [ ] Crear cuenta Cloudinary
- [ ] Configurar folders: `/layouts`, `/artistas`, `/obras`, `/documentos`
- [ ] Configurar upload presets
- [ ] Actualizar controller de layouts para usar Cloudinary real

**Panel Admin:**
- [ ] Verificar autenticación funcionando
- [ ] Verificar CRUD de artistas
- [ ] Verificar sistema de fases y votaciones
- [ ] Verificar gestión de paquetes
- [ ] Crear dashboard de estadísticas

---

## 📊 ESTADÍSTICAS DEL PROYECTO

**Estado Actual:**
- ✅ **Schema SQL:** 14 tablas definidas (11 completas, 3 pendientes)
- ✅ **Backend API:** 75+ endpoints implementados con mockData
- ✅ **Sistema de Auth:** JWT completo
- ✅ **Sistema de Fases/Votaciones:** Completo
- ✅ **APIs Landing:** COMPLETO (configuracion, contenido, eventos, contacto)
- ❌ **PostgreSQL:** No conectado (usando mockData)
- ❌ **Cloudinary:** Mock (no subiendo archivos reales)

**Próximo milestone:** Hacer hosting y conectar PostgreSQL real.

---

**Mantenido por:** Equipo de Desarrollo ARTEFACT
**Última actualización:** Agosto 2026
**Versión:** 2.0 (Completa)
