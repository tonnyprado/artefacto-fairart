# GUÍA DE MIGRACIÓN - De Hardcoded a Base de Datos

Esta guía te lleva paso a paso para conectar todos los componentes del frontend con la base de datos real.

---

## 🎯 ESTRATEGIA DE MIGRACIÓN

Vamos a migrar de forma **incremental** para mantener el sitio funcionando en todo momento:

1. ✅ Configuración básica (tablas + APIs simples)
2. ✅ Formulario de contacto (primer feature conectado)
3. ✅ Contenido dinámico (Hero, About, Convocatoria)
4. ✅ Fases y Eventos
5. ✅ Sistema completo de autenticación
6. ✅ Registro de artistas
7. ✅ Paneles de Admin y Curador

---

## PASO 1: Setup Inicial del Backend

### 1.1 Crear Base de Datos

```bash
# Crear base de datos PostgreSQL
createdb artefact

# Ejecutar schema
psql artefact < database/schema.sql
```

### 1.2 Actualizar Schema con Tablas Adicionales

Agregar a `database/schema.sql`:

```sql
-- Tabla de configuración del sitio
CREATE TABLE IF NOT EXISTS configuracion_sitio (
  id SERIAL PRIMARY KEY,
  nombre_sitio VARCHAR(255) NOT NULL DEFAULT 'ARTEFACT',
  logo_url VARCHAR(500),
  descripcion TEXT,
  email_contacto VARCHAR(255),
  telefono_contacto VARCHAR(20),
  whatsapp VARCHAR(20),
  direccion_completa TEXT,
  instagram VARCHAR(255),
  facebook VARCHAR(255),
  twitter VARCHAR(255),
  linkedin VARCHAR(255),
  copyright_text TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de mensajes de contacto
CREATE TABLE IF NOT EXISTS mensajes_contacto (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefono VARCHAR(20),
  asunto VARCHAR(255) NOT NULL,
  mensaje TEXT NOT NULL,
  leido BOOLEAN DEFAULT false,
  respondido BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_mensajes_contacto_leido ON mensajes_contacto(leido);
CREATE INDEX idx_mensajes_contacto_created_at ON mensajes_contacto(created_at DESC);

-- Triggers
CREATE TRIGGER update_configuracion_sitio_updated_at BEFORE UPDATE ON configuracion_sitio
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mensajes_contacto_updated_at BEFORE UPDATE ON mensajes_contacto
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 1.3 Actualizar Tabla `contenido`

```sql
-- Agregar campos a tabla contenido existente
ALTER TABLE contenido ADD COLUMN IF NOT EXISTS subtitulo VARCHAR(500);
ALTER TABLE contenido ADD COLUMN IF NOT EXISTS cta_principal_texto VARCHAR(100);
ALTER TABLE contenido ADD COLUMN IF NOT EXISTS cta_principal_url VARCHAR(255);
ALTER TABLE contenido ADD COLUMN IF NOT EXISTS cta_secundario_texto VARCHAR(100);
ALTER TABLE contenido ADD COLUMN IF NOT EXISTS cta_secundario_url VARCHAR(255);
ALTER TABLE contenido ADD COLUMN IF NOT EXISTS mision TEXT;
ALTER TABLE contenido ADD COLUMN IF NOT EXISTS vision TEXT;
ALTER TABLE contenido ADD COLUMN IF NOT EXISTS valores JSONB;
ALTER TABLE contenido ADD COLUMN IF NOT EXISTS requisitos JSONB;
ALTER TABLE contenido ADD COLUMN IF NOT EXISTS beneficios JSONB;
ALTER TABLE contenido ADD COLUMN IF NOT EXISTS pdf_url VARCHAR(500);

-- Actualizar check constraint para incluir nuevos tipos
ALTER TABLE contenido DROP CONSTRAINT IF EXISTS contenido_tipo_check;
ALTER TABLE contenido ADD CONSTRAINT contenido_tipo_check
  CHECK (tipo IN ('hero', 'about', 'convocatoria', 'pagina', 'seccion', 'noticia'));
```

### 1.4 Actualizar Tabla `eventos`

```sql
-- Agregar campos de ubicación a eventos
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS tipo_evento VARCHAR(50) DEFAULT 'feria_principal';
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS lugar_nombre VARCHAR(255);
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS direccion_completa TEXT;
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS ciudad VARCHAR(100);
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS estado VARCHAR(100);
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS codigo_postal VARCHAR(10);
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS pais VARCHAR(100) DEFAULT 'México';
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS coordenadas_lat DECIMAL(10, 8);
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS coordenadas_lng DECIMAL(11, 8);
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS mapa_embed_url TEXT;
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS info_transporte JSONB;
```

### 1.5 Ejecutar migraciones

```bash
psql artefact < database/migrations/001_add_configuracion_sitio.sql
psql artefact < database/migrations/002_update_contenido.sql
psql artefact < database/migrations/003_update_eventos.sql
```

---

## PASO 2: Seed Data Inicial

### 2.1 Crear archivo `database/seeds/001_initial_data.sql`

```sql
-- Configuración del sitio
INSERT INTO configuracion_sitio (
  nombre_sitio,
  email_contacto,
  telefono_contacto,
  whatsapp,
  direccion_completa,
  instagram,
  facebook,
  twitter,
  linkedin
) VALUES (
  'ARTEFACT',
  'info@artefact.com.mx',
  '+52 55 1234 5678',
  '+52 55 1234 5678',
  'Av. Reforma 123, Cuauhtémoc, CDMX',
  'https://instagram.com/artefact',
  'https://facebook.com/artefact',
  'https://twitter.com/artefact',
  'https://linkedin.com/company/artefact'
);

-- Contenido Hero
INSERT INTO contenido (
  tipo, titulo, subtitulo, slug, contenido, publicado,
  cta_principal_texto, cta_principal_url,
  cta_secundario_texto, cta_secundario_url
) VALUES (
  'hero',
  'ARTEFACT 2027',
  'Feria de Arte Contemporáneo',
  'hero-principal',
  'Descubre el talento emergente de artistas locales. Una experiencia única donde el arte cobra vida.',
  true,
  'Registrarse como Artista',
  '/registro',
  'Ver Convocatoria',
  '#convocatoria'
);

-- Contenido About
INSERT INTO contenido (
  tipo, titulo, slug, contenido, publicado, mision, valores
) VALUES (
  'about',
  'Acerca de ARTEFACT',
  'about-artefact',
  'ARTEFACT es una feria de arte contemporáneo que nace con el objetivo de impulsar y visibilizar el talento de artistas emergentes.',
  true,
  'Nuestra misión es crear un puente entre artistas emergentes y el mercado del arte, proporcionando una plataforma profesional para la exhibición y comercialización de obras contemporáneas.',
  '[
    {"title":"Calidad","description":"Selección rigurosa de artistas a través de curadores profesionales","icon":"🎨"},
    {"title":"Inclusión","description":"Espacio abierto para todas las disciplinas y expresiones artísticas","icon":"🤝"},
    {"title":"Profesionalismo","description":"Estándares de calidad internacional en organización y curaduría","icon":"⭐"}
  ]'::jsonb
);

-- Contenido Convocatoria
INSERT INTO contenido (
  tipo, titulo, slug, contenido, publicado, pdf_url, requisitos, beneficios
) VALUES (
  'convocatoria',
  'Convocatoria Abierta',
  'convocatoria-2027',
  'Invitamos a artistas emergentes a formar parte de ARTEFACT 2027.',
  true,
  '/pdfs/Convocatoria_ARTEFACTO.pdf',
  '["Ser mayor de 18 años","Obra original y de autoría propia","CV artístico actualizado","Portfolio digital (mínimo 5 obras)","Fotografía de identificación oficial","Disponibilidad para exponer en Febrero 2027"]'::jsonb,
  '["Espacio de exhibición profesional","Difusión en redes sociales y medios","Networking con coleccionistas y galeristas","Posibilidad de venta de obras","Certificado de participación","Acceso a eventos exclusivos"]'::jsonb
);

-- Evento Principal
INSERT INTO eventos (
  nombre, descripcion, tipo_evento, slug, activo,
  fecha_inicio, fecha_fin,
  ubicacion, lugar_nombre, direccion_completa,
  ciudad, estado, codigo_postal, pais,
  mapa_embed_url,
  info_transporte
) VALUES (
  'ARTEFACT 2027',
  'Feria de Arte Contemporáneo',
  'feria_principal',
  'artefact-2027',
  true,
  '2027-02-01',
  '2027-02-28',
  'Centro de Convenciones CDMX',
  'Centro de Convenciones CDMX',
  'Av. Reforma 123, Cuauhtémoc',
  'Ciudad de México',
  'CDMX',
  '06600',
  'México',
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3762.6026394046724!2d-99.16580168509398!3d19.432607986886587',
  '{"metro":"Línea 1 - Estación Reforma","metrobus":"Línea 4 - Reforma","estacionamiento":"Disponible en el lugar"}'::jsonb
);

-- Fases
INSERT INTO fases (nombre, descripcion, tipo, numero_fase, porcentaje_seleccion, inscripciones_abiertas) VALUES
  ('Fase 1', 'Primera ronda de selección', 'fase', 1, 20.00, true),
  ('Fase 2', 'Segunda ronda de selección', 'fase', 2, 20.00, false),
  ('Fase 3', 'Tercera ronda de selección', 'fase', 3, 20.00, false),
  ('Concurso', 'Concurso especial por invitación', 'concurso', null, 20.00, false);
```

### 2.2 Ejecutar seeds

```bash
psql artefact < database/seeds/001_initial_data.sql
```

---

## PASO 3: Implementar API Endpoints

### 3.1 Crear `backend/src/models/Configuracion.model.js`

```javascript
import pool from '../config/database.js'

export const ConfiguracionModel = {
  async getConfiguracion() {
    const result = await pool.query('SELECT * FROM configuracion_sitio LIMIT 1')
    return result.rows[0]
  },

  async updateConfiguracion(id, data) {
    const {
      nombre_sitio, email_contacto, telefono_contacto, whatsapp,
      direccion_completa, instagram, facebook, twitter, linkedin
    } = data

    const result = await pool.query(
      `UPDATE configuracion_sitio SET
        nombre_sitio = $1, email_contacto = $2, telefono_contacto = $3,
        whatsapp = $4, direccion_completa = $5, instagram = $6,
        facebook = $7, twitter = $8, linkedin = $9
      WHERE id = $10 RETURNING *`,
      [nombre_sitio, email_contacto, telefono_contacto, whatsapp,
       direccion_completa, instagram, facebook, twitter, linkedin, id]
    )
    return result.rows[0]
  }
}
```

### 3.2 Crear `backend/src/models/Contacto.model.js`

```javascript
import pool from '../config/database.js'

export const ContactoModel = {
  async create(data) {
    const { nombre, email, telefono, asunto, mensaje } = data

    const result = await pool.query(
      `INSERT INTO mensajes_contacto (nombre, email, telefono, asunto, mensaje)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [nombre, email, telefono, asunto, mensaje]
    )
    return result.rows[0]
  },

  async getAll(filters = {}) {
    let query = 'SELECT * FROM mensajes_contacto'
    const conditions = []
    const values = []

    if (filters.leido !== undefined) {
      conditions.push(`leido = $${values.length + 1}`)
      values.push(filters.leido)
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ')
    }

    query += ' ORDER BY created_at DESC'

    const result = await pool.query(query, values)
    return result.rows
  },

  async markAsRead(id) {
    const result = await pool.query(
      'UPDATE mensajes_contacto SET leido = true WHERE id = $1 RETURNING *',
      [id]
    )
    return result.rows[0]
  }
}
```

### 3.3 Crear `backend/src/controllers/configuracion.controller.js`

```javascript
import { ConfiguracionModel } from '../models/Configuracion.model.js'

export const getConfiguracion = async (req, res) => {
  try {
    const config = await ConfiguracionModel.getConfiguracion()
    res.json(config)
  } catch (error) {
    console.error('Error getting configuracion:', error)
    res.status(500).json({ error: 'Error al obtener configuración' })
  }
}
```

### 3.4 Crear `backend/src/controllers/contacto.controller.js`

```javascript
import { ContactoModel } from '../models/Contacto.model.js'
import { body, validationResult } from 'express-validator'

export const crearMensaje = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const mensaje = await ContactoModel.create(req.body)

    // TODO: Enviar email de notificación al admin

    res.status(201).json({
      success: true,
      message: 'Mensaje enviado correctamente',
      data: mensaje
    })
  } catch (error) {
    console.error('Error creating mensaje:', error)
    res.status(500).json({ error: 'Error al enviar mensaje' })
  }
}

export const validateMensaje = [
  body('nombre').trim().notEmpty().withMessage('Nombre es requerido'),
  body('email').isEmail().withMessage('Email inválido'),
  body('asunto').trim().notEmpty().withMessage('Asunto es requerido'),
  body('mensaje').trim().notEmpty().withMessage('Mensaje es requerido')
]
```

### 3.5 Crear `backend/src/routes/configuracion.routes.js`

```javascript
import express from 'express'
import { getConfiguracion } from '../controllers/configuracion.controller.js'

const router = express.Router()

router.get('/', getConfiguracion)

export default router
```

### 3.6 Crear `backend/src/routes/contacto.routes.js`

```javascript
import express from 'express'
import { crearMensaje, validateMensaje } from '../controllers/contacto.controller.js'

const router = express.Router()

router.post('/', validateMensaje, crearMensaje)

export default router
```

### 3.7 Registrar rutas en `backend/src/server.js`

```javascript
import configuracionRoutes from './routes/configuracion.routes.js'
import contactoRoutes from './routes/contacto.routes.js'

// ... resto del código

// Rutas de la API
app.use('/api/configuracion', configuracionRoutes)
app.use('/api/contacto', contactoRoutes)
// ... otras rutas existentes
```

---

## PASO 4: Conectar Frontend

### 4.1 Crear `frontend/services/api.js`

```javascript
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para agregar token si existe
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)
```

### 4.2 Crear `frontend/services/configuracion.service.js`

```javascript
import { api } from './api'

export const configuracionService = {
  async getConfiguracion() {
    const response = await api.get('/configuracion')
    return response.data
  }
}
```

### 4.3 Crear `frontend/services/contacto.service.js`

```javascript
import { api } from './api'

export const contactoService = {
  async enviarMensaje(data) {
    const response = await api.post('/contacto', data)
    return response.data
  }
}
```

### 4.4 Actualizar `ContactSection.jsx`

```javascript
// Reemplazar la función handleSubmit:
import { contactoService } from '@/services/contacto.service'

const handleSubmit = async (e) => {
  e.preventDefault()
  setIsSubmitting(true)
  setSubmitStatus(null)

  try {
    // ✅ CONECTADO A API REAL
    const response = await contactoService.enviarMensaje(formData)

    console.log('Mensaje enviado:', response)
    setSubmitStatus('success')
    setFormData({
      nombre: '',
      email: '',
      telefono: '',
      asunto: '',
      mensaje: ''
    })
  } catch (error) {
    console.error('Error:', error)
    setSubmitStatus('error')
  } finally {
    setIsSubmitting(false)
  }
}
```

---

## PASO 5: Conectar Navbar y Footer

### 5.1 Crear hook `frontend/hooks/useConfiguracion.js`

```javascript
'use client'

import { useEffect, useState } from 'react'
import { configuracionService } from '@/services/configuracion.service'

export function useConfiguracion() {
  const [configuracion, setConfiguracion] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchConfiguracion() {
      try {
        const data = await configuracionService.getConfiguracion()
        setConfiguracion(data)
      } catch (err) {
        console.error('Error fetching configuracion:', err)
        setError(err)
        // Fallback a datos hardcodeados
        setConfiguracion({
          nombre_sitio: 'ARTEFACT',
          email_contacto: 'info@artefact.com.mx',
          // ... resto de datos hardcodeados
        })
      } finally {
        setLoading(false)
      }
    }

    fetchConfiguracion()
  }, [])

  return { configuracion, loading, error }
}
```

### 5.2 Actualizar `Navbar.jsx`

```javascript
'use client'

import { useConfiguracion } from '@/hooks/useConfiguracion'

export default function Navbar() {
  const { configuracion, loading } = useConfiguracion()

  // Mientras carga, usa valores por defecto
  const siteName = configuracion?.nombre_sitio || 'ARTEFACT'

  return (
    <nav>
      {/* ... */}
      <span className="text-2xl font-bold">{siteName}</span>
      {/* ... */}
    </nav>
  )
}
```

### 5.3 Actualizar `Footer.jsx` de la misma manera

---

## PASO 6: Conectar Contenido Dinámico

### 6.1 Crear Model y Controller para Contenido

```javascript
// backend/src/models/Contenido.model.js
export const ContenidoModel = {
  async getByTipo(tipo) {
    const result = await pool.query(
      'SELECT * FROM contenido WHERE tipo = $1 AND publicado = true LIMIT 1',
      [tipo]
    )
    return result.rows[0]
  }
}

// backend/src/controllers/contenido.controller.js
export const getContenidoByTipo = async (req, res) => {
  try {
    const { tipo } = req.query
    const contenido = await ContenidoModel.getByTipo(tipo)

    if (!contenido) {
      return res.status(404).json({ error: 'Contenido no encontrado' })
    }

    res.json(contenido)
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Error al obtener contenido' })
  }
}

// backend/src/routes/contenido.routes.js
router.get('/', getContenidoByTipo)
```

### 6.2 Conectar Hero, About y Convocatoria de la misma manera

Ver `DATABASE_STRUCTURE.md` para detalles de cada componente.

---

## 📋 CHECKLIST COMPLETO

### Backend - Base de Datos
- [ ] Crear base de datos PostgreSQL
- [ ] Ejecutar schema principal
- [ ] Agregar tabla `configuracion_sitio`
- [ ] Agregar tabla `mensajes_contacto`
- [ ] Actualizar tabla `contenido`
- [ ] Actualizar tabla `eventos`
- [ ] Ejecutar seeds iniciales

### Backend - API
- [ ] Endpoint `/api/configuracion` (GET)
- [ ] Endpoint `/api/contacto` (POST)
- [ ] Endpoint `/api/contenido` (GET)
- [ ] Endpoint `/api/eventos/principal` (GET)
- [ ] Endpoint `/api/fases` (GET)

### Frontend - Services
- [ ] Crear `api.js` base
- [ ] Crear `configuracion.service.js`
- [ ] Crear `contacto.service.js`
- [ ] Crear `contenido.service.js`
- [ ] Crear `eventos.service.js`
- [ ] Crear `fases.service.js`

### Frontend - Hooks
- [ ] Crear `useConfiguracion.js`
- [ ] Crear `useContenido.js`
- [ ] Crear `useEventos.js`
- [ ] Crear `useFases.js`

### Frontend - Componentes
- [ ] Conectar `ContactSection.jsx` ✅ (PRIMER COMPONENTE)
- [ ] Conectar `Navbar.jsx`
- [ ] Conectar `Footer.jsx`
- [ ] Conectar `Hero.jsx`
- [ ] Conectar `AboutSection.jsx`
- [ ] Conectar `ConvocatoriaSection.jsx`
- [ ] Conectar `CalendarSection.jsx`

---

## 🎯 ORDEN RECOMENDADO DE IMPLEMENTACIÓN

1. ✅ **Configuración + Contacto** (más simple, prueba inicial)
2. ✅ **Navbar + Footer** (usan configuración)
3. ✅ **Hero** (contenido dinámico básico)
4. ✅ **About** (contenido + ubicación)
5. ✅ **Convocatoria** (contenido + fases)
6. ✅ **Calendar** (fases + eventos)

Después de esto, seguir con el registro de artistas y paneles de admin/curador.

---

¡Con esta guía puedes migrar progresivamente cada componente del frontend a la base de datos! 🚀
