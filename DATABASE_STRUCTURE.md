# ESTRUCTURA DE BASE DE DATOS - CAMPOS USADOS EN COMPONENTES

Este documento lista TODOS los campos de base de datos que están siendo referenciados en los componentes del frontend (actualmente hardcodeados). Usar este archivo como referencia al conectar con la base de datos real.

---

## 📊 TABLAS Y CAMPOS REQUERIDOS POR COMPONENTES

### 1. **configuracion_sitio** (Configuración general del sitio)

Usada en: `Navbar.jsx`, `Footer.jsx`, `ContactSection.jsx`

```sql
CREATE TABLE IF NOT EXISTS configuracion_sitio (
  id SERIAL PRIMARY KEY,
  -- Información básica
  nombre_sitio VARCHAR(255) NOT NULL DEFAULT 'ARTEFACT',
  logo_url VARCHAR(500), -- URL de Cloudinary
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

**Datos hardcodeados actualmente:**
```javascript
{
  nombre_sitio: 'ARTEFACT',
  email_contacto: 'info@artefact.com.mx',
  telefono_contacto: '+52 55 1234 5678',
  whatsapp: '+52 55 1234 5678',
  direccion_completa: 'Av. Reforma 123, Cuauhtémoc, CDMX',
  instagram: 'https://instagram.com/artefact',
  facebook: 'https://facebook.com/artefact',
  twitter: 'https://twitter.com/artefact',
  linkedin: 'https://linkedin.com/company/artefact'
}
```

---

### 2. **contenido** (Contenido dinámico de secciones)

Usada en: `Hero.jsx`, `AboutSection.jsx`, `ConvocatoriaSection.jsx`

```sql
-- Esta tabla ya existe en schema.sql, pero aquí están los campos usados:
CREATE TABLE IF NOT EXISTS contenido (
  id SERIAL PRIMARY KEY,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('hero', 'about', 'convocatoria', 'pagina', 'seccion', 'noticia')),
  titulo VARCHAR(255) NOT NULL,
  subtitulo VARCHAR(500),
  slug VARCHAR(255) UNIQUE NOT NULL,
  contenido TEXT,
  imagen VARCHAR(500), -- URL de Cloudinary
  publicado BOOLEAN DEFAULT false,

  -- Campos específicos para Hero
  cta_principal_texto VARCHAR(100),
  cta_principal_url VARCHAR(255),
  cta_secundario_texto VARCHAR(100),
  cta_secundario_url VARCHAR(255),

  -- Campos específicos para About
  mision TEXT,
  vision TEXT,
  valores JSONB, -- Array de objetos {title, description, icon}

  -- Campos específicos para Convocatoria
  requisitos JSONB, -- Array de strings
  beneficios JSONB, -- Array de strings
  pdf_url VARCHAR(500), -- URL del PDF en Cloudinary

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Datos hardcodeados por tipo:**

#### Hero (`tipo = 'hero'`):
```javascript
{
  titulo: 'ARTEFACT 2027',
  subtitulo: 'Feria de Arte Contemporáneo',
  contenido: 'Descubre el talento emergente de artistas locales...',
  imagen: '/images/hero-bg.jpg',
  cta_principal_texto: 'Registrarse como Artista',
  cta_principal_url: '/registro',
  cta_secundario_texto: 'Ver Convocatoria',
  cta_secundario_url: '#convocatoria'
}
```

#### About (`tipo = 'about'`):
```javascript
{
  titulo: 'Acerca de ARTEFACT',
  contenido: 'ARTEFACT es una feria de arte contemporáneo...',
  mision: 'Nuestra misión es crear un puente entre artistas...',
  valores: [
    {
      title: 'Calidad',
      description: 'Selección rigurosa de artistas...',
      icon: '🎨'
    },
    // ... más valores
  ]
}
```

#### Convocatoria (`tipo = 'convocatoria'`):
```javascript
{
  titulo: 'Convocatoria Abierta',
  contenido: 'Invitamos a artistas emergentes...',
  pdf_url: '/pdfs/Convocatoria_ARTEFACTO.pdf',
  requisitos: [
    'Ser mayor de 18 años',
    'Obra original y de autoría propia',
    // ... más requisitos
  ],
  beneficios: [
    'Espacio de exhibición profesional',
    'Difusión en redes sociales',
    // ... más beneficios
  ]
}
```

---

### 3. **eventos** (Información de la feria principal)

Usada en: `Hero.jsx`, `AboutSection.jsx`, `CalendarSection.jsx`

```sql
-- Esta tabla ya existe en schema.sql, expandida con campos adicionales:
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
  mapa_embed_url TEXT, -- Google Maps embed URL

  -- Transporte
  info_transporte JSONB, -- {metro, metrobus, estacionamiento}

  imagen VARCHAR(500),
  slug VARCHAR(255) UNIQUE NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Datos hardcodeados:**
```javascript
{
  nombre: 'ARTEFACT 2027',
  fecha_inicio: '2027-02-01',
  fecha_fin: '2027-02-28',
  lugar_nombre: 'Centro de Convenciones CDMX',
  direccion_completa: 'Av. Reforma 123, Cuauhtémoc',
  ciudad: 'Ciudad de México',
  estado: 'CDMX',
  codigo_postal: '06600',
  pais: 'México',
  mapa_embed_url: 'https://www.google.com/maps/embed?pb=...',
  info_transporte: {
    metro: 'Línea 1 - Estación Reforma',
    metrobus: 'Línea 4 - Reforma',
    estacionamiento: 'Disponible en el lugar'
  }
}
```

---

### 4. **fases** (Ya existe en schema.sql)

Usada en: `ConvocatoriaSection.jsx`, `CalendarSection.jsx`

**Campos utilizados en componentes:**
- `nombre` - "Fase 1", "Fase 2", etc.
- `descripcion` - Descripción de la fase
- `tipo` - 'fase' o 'concurso'
- `numero_fase` - 1, 2, 3, null para concurso
- `fecha_inicio_inscripciones`
- `fecha_fin_inscripciones`
- `fecha_inicio_votaciones`
- `fecha_fin_votaciones`
- `inscripciones_abiertas`
- `votaciones_abiertas`
- `porcentaje_seleccion` - Default 20%

**Datos hardcodeados en ConvocatoriaSection:**
```javascript
{
  phases: [
    {
      nombre: 'Fase 1',
      descripcion: 'Primera ronda de selección',
      periodo: 'Agosto - Octubre 2026',
      inscripciones_abiertas: true
    },
    // ... más fases
  ]
}
```

**Datos hardcodeados en CalendarSection:**
```javascript
{
  timelineEvents: [
    {
      date: 'Agosto 2026',
      title: 'Lanzamiento Convocatoria',
      description: 'Apertura oficial...',
      type: 'milestone', // 'phase', 'voting', 'special', 'main-event'
    },
    // ... más eventos
  ]
}
```

---

### 5. **mensajes_contacto** (Formulario de contacto)

Usada en: `ContactSection.jsx`

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

-- Índices
CREATE INDEX idx_mensajes_contacto_leido ON mensajes_contacto(leido);
CREATE INDEX idx_mensajes_contacto_respondido ON mensajes_contacto(respondido);
CREATE INDEX idx_mensajes_contacto_created_at ON mensajes_contacto(created_at DESC);
```

**Datos enviados desde formulario:**
```javascript
{
  nombre: 'Juan Pérez',
  email: 'juan@email.com',
  telefono: '55 1234 5678',
  asunto: 'Consulta sobre inscripción',
  mensaje: 'Hola, tengo una pregunta...'
}
```

---

## 🔄 APIS NECESARIAS PARA CONECTAR LANDING

### 1. Obtener configuración del sitio
```
GET /api/configuracion
Response: { nombre_sitio, email_contacto, telefono_contacto, ... }
```

### 2. Obtener contenido por tipo
```
GET /api/contenido?tipo=hero
GET /api/contenido?tipo=about
GET /api/contenido?tipo=convocatoria
Response: { titulo, subtitulo, contenido, imagen, ... }
```

### 3. Obtener evento principal activo
```
GET /api/eventos/principal
Response: { nombre, fecha_inicio, ubicacion, ... }
```

### 4. Obtener fases activas
```
GET /api/fases?activas=true
Response: [{ nombre, descripcion, inscripciones_abiertas, ... }]
```

### 5. Obtener eventos del calendario
```
GET /api/eventos/calendario
Response: [{ nombre, fecha_inicio, tipo_evento, ... }]
```

### 6. Enviar mensaje de contacto
```
POST /api/contacto
Body: { nombre, email, telefono, asunto, mensaje }
Response: { success: true, message: 'Mensaje enviado' }
```

---

## 📝 PRIORIDADES DE IMPLEMENTACIÓN

### FASE 1: Configuración básica
1. ✅ Tabla `configuracion_sitio` - para Navbar y Footer
2. ✅ Tabla `mensajes_contacto` - para formulario de contacto
3. ✅ API `/api/configuracion` - GET
4. ✅ API `/api/contacto` - POST

### FASE 2: Contenido dinámico
1. ✅ Actualizar tabla `contenido` con campos adicionales
2. ✅ API `/api/contenido?tipo=hero`
3. ✅ API `/api/contenido?tipo=about`
4. ✅ API `/api/contenido?tipo=convocatoria`

### FASE 3: Eventos y fases
1. ✅ Actualizar tabla `eventos` con campos de ubicación
2. ✅ API `/api/eventos/principal`
3. ✅ API `/api/fases?activas=true`
4. ✅ API `/api/eventos/calendario`

---

## 🎨 ASSETS NECESARIOS EN CLOUDINARY

### Imágenes
- Hero background: `/images/hero-bg.jpg`
- Logo ARTEFACT: `/images/logo.png`
- Favicon: `/images/favicon.ico`

### Documentos
- PDF Convocatoria: ✅ `/pdfs/Convocatoria_ARTEFACTO.pdf` (ya copiado)

### Futuros
- Imágenes de artistas
- Imágenes de obras
- Documentos de artistas (CV, portfolio, ID)

---

## 🔧 COMPONENTES QUE NECESITAN CONEXIÓN A API

### Componentes del Landing
- ✅ `Navbar.jsx` - Necesita configuracion_sitio
- ✅ `Hero.jsx` - Necesita contenido (tipo=hero) + eventos
- ✅ `AboutSection.jsx` - Necesita contenido (tipo=about) + eventos (ubicación)
- ✅ `ConvocatoriaSection.jsx` - Necesita contenido (tipo=convocatoria) + fases
- ✅ `CalendarSection.jsx` - Necesita fases + eventos/calendario
- ✅ `ContactSection.jsx` - Necesita configuracion_sitio + POST /api/contacto
- ✅ `Footer.jsx` - Necesita configuracion_sitio

---

## 📋 CHECKLIST DE MIGRACIÓN A BASE DE DATOS REAL

### Backend
- [ ] Crear endpoint `/api/configuracion` (GET)
- [ ] Crear endpoint `/api/contacto` (POST)
- [ ] Crear endpoint `/api/contenido` (GET con query param tipo)
- [ ] Crear endpoint `/api/eventos/principal` (GET)
- [ ] Crear endpoint `/api/eventos/calendario` (GET)
- [ ] Crear endpoint `/api/fases` (GET con query params)
- [ ] Agregar campos adicionales a tabla `contenido`
- [ ] Agregar campos adicionales a tabla `eventos`
- [ ] Crear tabla `configuracion_sitio`
- [ ] Crear tabla `mensajes_contacto`
- [ ] Seed data inicial para todas las tablas

### Frontend
- [ ] Crear service: `configuracion.service.js`
- [ ] Crear service: `contacto.service.js`
- [ ] Crear service: `contenido.service.js`
- [ ] Actualizar `Navbar.jsx` para usar API
- [ ] Actualizar `Hero.jsx` para usar API
- [ ] Actualizar `AboutSection.jsx` para usar API
- [ ] Actualizar `ConvocatoriaSection.jsx` para usar API
- [ ] Actualizar `CalendarSection.jsx` para usar API
- [ ] Actualizar `ContactSection.jsx` para usar API
- [ ] Actualizar `Footer.jsx` para usar API
- [ ] Configurar variables de entorno (.env)
- [ ] Testing completo de integración

---

**Última actualización:** Julio 2026
**Mantenido por:** Equipo de Desarrollo ARTEFACT
