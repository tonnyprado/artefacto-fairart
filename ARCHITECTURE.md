# ARQUITECTURA - ARTEFACT FERIA DE ARTE
## Sistema de Gestión Integral para Feria de Arte

---

## 📋 TABLA DE CONTENIDOS

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Base de Datos](#base-de-datos)
5. [Sistema de Roles y Permisos](#sistema-de-roles-y-permisos)
6. [Flujo del Sistema de Fases](#flujo-del-sistema-de-fases)
7. [API Endpoints](#api-endpoints)
8. [Arquitectura del Frontend](#arquitectura-del-frontend)
9. [Arquitectura del Backend](#arquitectura-del-backend)
10. [Características en Tiempo Real](#características-en-tiempo-real)
11. [Sistema de Notificaciones](#sistema-de-notificaciones)
12. [Seguridad](#seguridad)
13. [Flujos de Trabajo](#flujos-de-trabajo)

---

## 📖 RESUMEN EJECUTIVO

ARTEFACT es una plataforma web integral para la gestión de una feria de arte que incluye:

- **Landing page público** con información de la feria
- **Sistema de registro** para artistas interesados
- **Sistema de fases** (3 fases + 1 concurso) con inscripciones y votaciones
- **Panel de administración** para gestión completa del evento
- **Panel de curaduría** para votaciones y selección de artistas
- **Votaciones en tiempo real** con dashboards interactivos
- **Notificaciones automáticas** por email a artistas seleccionados

### Timeline del Evento
- **Agosto 2026**: Lanzamiento de convocatoria
- **Agosto 2026 - Febrero 2027**: Proceso de fases de selección
- **Febrero 2027**: Feria de arte

---

## 🛠 STACK TECNOLÓGICO

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI**: React 18
- **Estilos**: Tailwind CSS
- **Estado Global**: Zustand
- **Formularios**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Utilidades**: date-fns, clsx, tailwind-merge

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Base de Datos**: PostgreSQL
- **ORM**: pg (node-postgres)
- **Autenticación**: JWT (jsonwebtoken) + bcryptjs
- **Validación**: express-validator
- **Seguridad**: Helmet, CORS, express-rate-limit
- **File Upload**: Multer + Cloudinary
- **Logging**: Morgan

### Infraestructura
- **Base de Datos**: PostgreSQL 14+
- **Storage**: Cloudinary (imágenes y documentos)
- **Email**: (Por definir: SendGrid, AWS SES, Resend)

---

## 📁 ESTRUCTURA DEL PROYECTO

```
Benito-web/
└── artefact-web/
    ├── frontend/                    # Aplicación Next.js
    │   ├── app/                     # App Router de Next.js 14
    │   │   ├── (public)/           # Rutas públicas
    │   │   │   ├── page.js         # Landing page
    │   │   │   ├── layout.js       # Layout público
    │   │   │   └── sections/       # Secciones del landing
    │   │   │       ├── Hero.jsx
    │   │   │       ├── AboutSection.jsx
    │   │   │       ├── ConvocatoriaSection.jsx
    │   │   │       ├── ContactSection.jsx
    │   │   │       ├── CalendarSection.jsx
    │   │   │       └── LocationSection.jsx
    │   │   │
    │   │   ├── registro/           # Registro público de artistas
    │   │   │   ├── page.js
    │   │   │   └── layout.js
    │   │   │
    │   │   ├── loginpage/          # Login (URL especial)
    │   │   │   └── page.js
    │   │   │
    │   │   ├── admin/              # Panel de administración
    │   │   │   ├── layout.js       # Layout con sidebar admin
    │   │   │   ├── page.js         # Dashboard admin
    │   │   │   ├── dashboard/      # Dashboard con gráficas
    │   │   │   │   └── page.js
    │   │   │   ├── artistas/       # Gestión de artistas
    │   │   │   │   ├── page.js     # Lista de artistas
    │   │   │   │   ├── nuevo/      # Inscribir artista manualmente
    │   │   │   │   │   └── page.js
    │   │   │   │   └── [id]/       # Detalle/editar artista
    │   │   │   │       └── page.js
    │   │   │   ├── curadores/      # Gestión de curadores
    │   │   │   │   ├── page.js     # Lista de curadores
    │   │   │   │   └── nuevo/      # Crear curador
    │   │   │   │       └── page.js
    │   │   │   ├── fases/          # Gestión de fases
    │   │   │   │   ├── page.js     # Lista y gestión de fases
    │   │   │   │   └── [id]/       # Detalle de fase
    │   │   │   │       └── page.js
    │   │   │   └── votaciones/     # Resultados de votaciones
    │   │   │       └── page.js
    │   │   │
    │   │   └── curador/            # Panel de curaduría
    │   │       ├── layout.js       # Layout con sidebar curador
    │   │       ├── page.js         # Dashboard curador
    │   │       ├── votaciones/     # Sistema de votación
    │   │       │   └── page.js
    │   │       └── perfil/         # Perfil del curador
    │   │           └── page.js
    │   │
    │   ├── components/             # Componentes React
    │   │   ├── landing/           # Componentes del landing
    │   │   │   ├── Hero.jsx
    │   │   │   ├── Navbar.jsx
    │   │   │   ├── Footer.jsx
    │   │   │   └── ...
    │   │   ├── admin/             # Componentes del admin
    │   │   │   ├── Sidebar.jsx
    │   │   │   ├── ArtistasList.jsx
    │   │   │   ├── ArtistaCard.jsx
    │   │   │   ├── FaseControl.jsx
    │   │   │   ├── VotacionChart.jsx
    │   │   │   └── ...
    │   │   ├── curador/           # Componentes del curador
    │   │   │   ├── VotacionCard.jsx
    │   │   │   ├── ArtistaPreview.jsx
    │   │   │   └── ...
    │   │   ├── shared/            # Componentes compartidos
    │   │   │   ├── AuthGuard.jsx  # Protección de rutas
    │   │   │   ├── RoleGuard.jsx  # Protección por rol
    │   │   │   └── ...
    │   │   └── ui/                # Componentes UI reutilizables
    │   │       ├── Button.jsx
    │   │       ├── Input.jsx
    │   │       ├── Modal.jsx
    │   │       ├── Card.jsx
    │   │       ├── Table.jsx
    │   │       └── ...
    │   │
    │   ├── hooks/                 # Custom hooks
    │   │   ├── useAuth.js        # Hook de autenticación
    │   │   ├── useArtistas.js    # Hook para artistas
    │   │   ├── useFases.js       # Hook para fases
    │   │   ├── useVotaciones.js  # Hook para votaciones
    │   │   └── ...
    │   │
    │   ├── services/             # Servicios de API
    │   │   ├── api.js           # Cliente Axios configurado
    │   │   ├── auth.service.js
    │   │   ├── artistas.service.js
    │   │   ├── fases.service.js
    │   │   ├── votaciones.service.js
    │   │   └── ...
    │   │
    │   ├── stores/              # Stores de Zustand
    │   │   ├── authStore.js
    │   │   ├── artistasStore.js
    │   │   ├── fasesStore.js
    │   │   └── ...
    │   │
    │   ├── utils/               # Utilidades
    │   │   ├── constants.js
    │   │   ├── helpers.js
    │   │   └── validators.js
    │   │
    │   ├── types/               # TypeScript types (si se usa TS)
    │   │   └── ...
    │   │
    │   ├── public/              # Archivos estáticos
    │   │   ├── images/
    │   │   ├── pdfs/           # PDFs de convocatoria
    │   │   └── ...
    │   │
    │   ├── lib/                # Librerías y configuración
    │   │   ├── seo.js
    │   │   └── utils.js
    │   │
    │   └── package.json
    │
    ├── backend/                # API Express
    │   ├── src/
    │   │   ├── server.js       # Punto de entrada
    │   │   │
    │   │   ├── config/         # Configuración
    │   │   │   ├── database.js # Config de PostgreSQL
    │   │   │   ├── email.js    # Config de email
    │   │   │   └── cloudinary.js
    │   │   │
    │   │   ├── routes/         # Rutas de la API
    │   │   │   ├── auth.routes.js
    │   │   │   ├── artistas.routes.js
    │   │   │   ├── obras.routes.js
    │   │   │   ├── eventos.routes.js
    │   │   │   ├── inscripciones.routes.js
    │   │   │   ├── paquetes.routes.js
    │   │   │   ├── fases.routes.js
    │   │   │   ├── votaciones.routes.js
    │   │   │   └── curadores.routes.js
    │   │   │
    │   │   ├── controllers/    # Controladores
    │   │   │   ├── auth.controller.js
    │   │   │   ├── artistas.controller.js
    │   │   │   ├── fases.controller.js
    │   │   │   ├── votaciones.controller.js
    │   │   │   └── ...
    │   │   │
    │   │   ├── models/         # Modelos de datos
    │   │   │   ├── Usuario.model.js
    │   │   │   ├── Artista.model.js
    │   │   │   ├── Fase.model.js
    │   │   │   ├── Votacion.model.js
    │   │   │   └── ...
    │   │   │
    │   │   ├── services/       # Lógica de negocio
    │   │   │   ├── email.service.js
    │   │   │   ├── votacion.service.js
    │   │   │   ├── fase.service.js
    │   │   │   └── ...
    │   │   │
    │   │   ├── middleware/     # Middlewares
    │   │   │   ├── auth.middleware.js
    │   │   │   ├── validation.middleware.js
    │   │   │   └── role.middleware.js
    │   │   │
    │   │   └── utils/          # Utilidades
    │   │       ├── helpers.js
    │   │       └── constants.js
    │   │
    │   └── package.json
    │
    ├── database/              # Base de datos
    │   ├── schema.sql        # Esquema completo
    │   ├── seed.sql          # Datos iniciales
    │   └── README.md
    │
    └── docs/                 # Documentación y assets
        ├── ARCHITECTURE.md   # Este archivo
        └── ...
```

---

## 🗄 BASE DE DATOS

### Esquema de Tablas

#### 1. **usuarios** (Administradores y Curadores)
```sql
- id: SERIAL PRIMARY KEY
- email: VARCHAR(255) UNIQUE NOT NULL
- password: VARCHAR(255) NOT NULL (hashed)
- nombre: VARCHAR(255) NOT NULL
- apellido: VARCHAR(255)
- telefono: VARCHAR(20)
- role: VARCHAR(50) CHECK IN ('admin', 'curador')
- especialidad: VARCHAR(255) -- Para curadores
- bio: TEXT -- Para curadores
- foto: VARCHAR(500)
- activo: BOOLEAN DEFAULT true
- created_at, updated_at: TIMESTAMP
```

#### 2. **artistas** (Artistas que se registran)
```sql
- id: SERIAL PRIMARY KEY
- nombre: VARCHAR(255) NOT NULL
- apellido: VARCHAR(255) NOT NULL
- email: VARCHAR(255) UNIQUE NOT NULL
- telefono: VARCHAR(20)
- fecha_nacimiento: DATE
- pais: VARCHAR(100)
- ciudad: VARCHAR(100)
- direccion: TEXT
- bio: TEXT
- categoria: VARCHAR(100) NOT NULL
- foto: VARCHAR(500)
- slug: VARCHAR(255) UNIQUE NOT NULL
- redes_sociales: JSONB -- {instagram, facebook, website}
- documentos: JSONB -- {cv, portfolio, identificacion}
- estado: VARCHAR(50) CHECK IN ('pendiente', 'aprobado', 'rechazado')
- notas_admin: TEXT
- activo: BOOLEAN DEFAULT true
- created_at, updated_at: TIMESTAMP
```

#### 3. **fases** (Fase 1, Fase 2, Fase 3, Concurso)
```sql
- id: SERIAL PRIMARY KEY
- nombre: VARCHAR(100) NOT NULL
- descripcion: TEXT
- tipo: VARCHAR(50) CHECK IN ('fase', 'concurso')
- numero_fase: INTEGER -- 1, 2, 3, null para concurso
- fecha_inicio_inscripciones: TIMESTAMP
- fecha_fin_inscripciones: TIMESTAMP
- fecha_inicio_votaciones: TIMESTAMP
- fecha_fin_votaciones: TIMESTAMP
- porcentaje_seleccion: DECIMAL(5,2) DEFAULT 20.00
- max_artistas_seleccionados: INTEGER
- inscripciones_abiertas: BOOLEAN DEFAULT false
- votaciones_abiertas: BOOLEAN DEFAULT false
- finalizada: BOOLEAN DEFAULT false
- created_at, updated_at: TIMESTAMP
```

#### 4. **inscripciones_fases** (Inscripciones por fase)
```sql
- id: SERIAL PRIMARY KEY
- artista_id: INTEGER REFERENCES artistas(id)
- fase_id: INTEGER REFERENCES fases(id)
- estado: VARCHAR(50) CHECK IN ('pendiente', 'en_revision', 'aprobado', 'rechazado')
- notas_admin: TEXT
- fecha_inscripcion: TIMESTAMP
- created_at, updated_at: TIMESTAMP
- UNIQUE(artista_id, fase_id)
```

#### 5. **votaciones** (Votos de curadores)
```sql
- id: SERIAL PRIMARY KEY
- curador_id: INTEGER REFERENCES usuarios(id)
- artista_id: INTEGER REFERENCES artistas(id)
- fase_id: INTEGER REFERENCES fases(id)
- voto: BOOLEAN NOT NULL -- true = a favor, false = en contra
- comentario: TEXT
- created_at, updated_at: TIMESTAMP
- UNIQUE(curador_id, artista_id, fase_id)
```

#### 6. **artistas_seleccionados** (Resultados por fase)
```sql
- id: SERIAL PRIMARY KEY
- artista_id: INTEGER REFERENCES artistas(id)
- fase_id: INTEGER REFERENCES fases(id)
- total_votos_favor: INTEGER DEFAULT 0
- total_votos_contra: INTEGER DEFAULT 0
- porcentaje_aprobacion: DECIMAL(5,2)
- posicion: INTEGER -- Ranking en la fase
- notificado: BOOLEAN DEFAULT false
- fecha_seleccion: TIMESTAMP
- created_at, updated_at: TIMESTAMP
- UNIQUE(artista_id, fase_id)
```

#### 7. **obras** (Obras de arte)
```sql
- id: SERIAL PRIMARY KEY
- titulo: VARCHAR(255) NOT NULL
- descripcion: TEXT
- artista_id: INTEGER REFERENCES artistas(id)
- precio: DECIMAL(10,2) NOT NULL
- categoria: VARCHAR(100) NOT NULL
- imagen: VARCHAR(500)
- dimensiones: VARCHAR(100)
- año: INTEGER
- disponible: BOOLEAN DEFAULT true
- created_at, updated_at: TIMESTAMP
```

#### 8. **eventos** (Eventos de la feria)
```sql
- id: SERIAL PRIMARY KEY
- nombre: VARCHAR(255) NOT NULL
- descripcion: TEXT
- fecha_inicio: TIMESTAMP NOT NULL
- fecha_fin: TIMESTAMP NOT NULL
- ubicacion: TEXT NOT NULL
- imagen: VARCHAR(500)
- slug: VARCHAR(255) UNIQUE NOT NULL
- activo: BOOLEAN DEFAULT true
- created_at, updated_at: TIMESTAMP
```

#### 9. **inscripciones** (Inscripciones a eventos)
```sql
- id: SERIAL PRIMARY KEY
- artista_id: INTEGER REFERENCES artistas(id)
- evento_id: INTEGER REFERENCES eventos(id)
- paquete_id: INTEGER REFERENCES paquetes(id)
- estado: VARCHAR(50) CHECK IN ('pendiente', 'aprobada', 'rechazada')
- notas: TEXT
- created_at, updated_at: TIMESTAMP
- UNIQUE(artista_id, evento_id)
```

#### 10. **paquetes** (Paquetes de inscripción)
```sql
- id: SERIAL PRIMARY KEY
- nombre: VARCHAR(255) NOT NULL
- descripcion: TEXT NOT NULL
- precio: DECIMAL(10,2) NOT NULL
- beneficios: JSONB DEFAULT '[]'
- activo: BOOLEAN DEFAULT true
- created_at, updated_at: TIMESTAMP
```

#### 11. **contenido** (Contenido del sitio)
```sql
- id: SERIAL PRIMARY KEY
- tipo: VARCHAR(50) CHECK IN ('pagina', 'seccion', 'noticia')
- titulo: VARCHAR(255) NOT NULL
- slug: VARCHAR(255) UNIQUE NOT NULL
- contenido: TEXT
- imagen: VARCHAR(500)
- publicado: BOOLEAN DEFAULT false
- created_at, updated_at: TIMESTAMP
```

### Relaciones Principales

```
usuarios (admin/curador)
    └── votaciones (muchos a muchos con artistas por fase)

artistas
    ├── inscripciones_fases (muchos a muchos con fases)
    ├── votaciones (muchos a muchos con curadores por fase)
    ├── artistas_seleccionados (uno a muchos con fases)
    ├── obras (uno a muchos)
    └── inscripciones (muchos a muchos con eventos)

fases
    ├── inscripciones_fases (uno a muchos)
    ├── votaciones (uno a muchos)
    └── artistas_seleccionados (uno a muchos)
```

---

## 👥 SISTEMA DE ROLES Y PERMISOS

### Roles Definidos

#### 1. **Público (Sin autenticación)**
- ✅ Ver landing page
- ✅ Registrarse como artista
- ✅ Descargar convocatoria (PDF)
- ❌ No puede acceder a paneles

#### 2. **Admin (role: 'admin')**
Permisos completos sobre todo el sistema:

**Artistas:**
- ✅ Ver lista completa de artistas
- ✅ Inscribir artistas manualmente
- ✅ Editar información de artistas
- ✅ Eliminar artistas
- ✅ Ver documentos y datos completos
- ✅ Cambiar estado (pendiente/aprobado/rechazado)
- ✅ Agregar notas internas

**Curadores:**
- ✅ Crear cuentas de curadores
- ✅ Editar información de curadores
- ✅ Activar/desactivar curadores
- ✅ Ver lista de curadores

**Fases:**
- ✅ Crear fases
- ✅ Abrir/cerrar inscripciones por fase
- ✅ Abrir/cerrar votaciones por fase
- ✅ Ver resultados de votaciones en tiempo real
- ✅ Finalizar fases
- ✅ Seleccionar artistas manualmente para concurso

**Dashboard:**
- ✅ Ver gráficas de votaciones en tiempo real
- ✅ Ver estadísticas generales
- ✅ Ver tabla de seleccionados por fase
- ✅ Ver actividad reciente

**Sistema:**
- ✅ Acceso completo a toda la plataforma
- ✅ Gestión de contenido del sitio
- ✅ Configuración de eventos y paquetes

#### 3. **Curador (role: 'curador')**
Permisos enfocados en votación:

**Votaciones:**
- ✅ Ver lista de artistas inscritos en fase activa
- ✅ Votar por artistas (a favor/en contra)
- ✅ Agregar comentarios en votos
- ✅ Ver resultados en tiempo real
- ✅ Ver dashboard de votaciones

**Artistas:**
- ✅ Ver información completa de artistas
- ✅ Ver documentos de artistas
- ❌ No puede editar
- ❌ No puede eliminar

**Restricciones:**
- ❌ No puede gestionar fases
- ❌ No puede inscribir/eliminar artistas
- ❌ No puede crear otros curadores
- ❌ No puede cerrar inscripciones/votaciones

### Protección de Rutas

```javascript
// Rutas públicas (sin autenticación)
/ (landing)
/registro

// Rutas de autenticación
/loginpage (solo accesible sin auth)

// Rutas protegidas - Solo autenticados
/admin/* (requiere role: 'admin')
/curador/* (requiere role: 'curador')

// Middleware de protección
authMiddleware: Verifica JWT token
roleMiddleware: Verifica role específico
```

---

## 🔄 FLUJO DEL SISTEMA DE FASES

### Descripción General

El sistema de fases es el corazón de la plataforma. Consta de:
- **3 Fases regulares** de selección
- **1 Concurso** especial

Cada fase sigue el mismo ciclo de vida.

### Ciclo de Vida de una Fase

```
1. CREACIÓN
   ↓
2. INSCRIPCIONES ABIERTAS
   ↓
3. INSCRIPCIONES CERRADAS
   ↓
4. VOTACIONES ABIERTAS
   ↓
5. VOTACIONES CERRADAS
   ↓
6. CÁLCULO DE RESULTADOS
   ↓
7. SELECCIÓN DE ARTISTAS (~20%)
   ↓
8. NOTIFICACIÓN POR EMAIL
   ↓
9. FASE FINALIZADA
```

### Detalle de Cada Etapa

#### 1. **Creación de Fase** (Admin)
- Admin crea la fase desde panel de administración
- Configura:
  - Nombre (ej: "Fase 1")
  - Tipo (fase/concurso)
  - Porcentaje de selección (default: 20%)
  - Fechas (inscripciones, votaciones)

#### 2. **Inscripciones Abiertas** (Admin)
- Admin hace clic en "Abrir Inscripciones"
- Se actualiza: `inscripciones_abiertas = true`
- Artistas pueden:
  - Registrarse desde landing
  - Llenar formulario de inscripción
  - Subir documentos
  - Enviar inscripción

- Los artistas aparecen en tiempo real en panel de admin
- Admin puede inscribir artistas manualmente

#### 3. **Inscripciones Cerradas** (Admin)
- Admin hace clic en "Cerrar Inscripciones"
- Se actualiza: `inscripciones_abiertas = false`
- Ya no se aceptan más artistas para esa fase
- Se congela la lista de artistas

#### 4. **Votaciones Abiertas** (Admin)
- Admin hace clic en "Abrir Votaciones"
- Se actualiza: `votaciones_abiertas = true`
- Curadores pueden:
  - Ver lista de artistas inscritos en esa fase
  - Votar a favor/en contra
  - Agregar comentarios opcionales
  - Cambiar su voto antes del cierre

- Dashboard muestra en tiempo real:
  - Gráficas de porcentajes
  - Ranking de artistas
  - % de aprobación de cada artista

#### 5. **Votaciones Cerradas** (Admin)
- Admin hace clic en "Cerrar Votaciones"
- Se actualiza: `votaciones_abiertas = false`
- Se congelan los votos
- Ya no se pueden hacer cambios

#### 6. **Cálculo de Resultados** (Automático)
Al cerrar votaciones, el sistema automáticamente:
- Cuenta votos a favor/en contra por artista
- Calcula % de aprobación
- Ordena artistas por % de aprobación (ranking)
- Determina el top 20% (o el % configurado)

```javascript
// Ejemplo de cálculo
Total artistas inscritos: 100
Porcentaje selección: 20%
Artistas a seleccionar: 20

// Para cada artista:
Total votos a favor: 15
Total votos en contra: 5
% aprobación: (15 / 20) * 100 = 75%
```

#### 7. **Selección de Artistas** (Automático + Manual)
- Sistema selecciona automáticamente top 20%
- Guarda en tabla `artistas_seleccionados`
- Admin puede:
  - Ver tabla de seleccionados
  - Ajustar manualmente si es necesario

#### 8. **Notificación por Email** (Automático)
- Sistema envía email automático a artistas seleccionados
- Marca: `notificado = true`
- Email incluye:
  - Felicitaciones
  - Información de la fase
  - Próximos pasos

#### 9. **Fase Finalizada** (Admin)
- Admin marca fase como finalizada
- Se actualiza: `finalizada = true`
- Fase queda como histórico
- Se puede proceder a la siguiente fase

### Caso Especial: Concurso

El concurso funciona igual que las fases, con estas diferencias:
- Admin selecciona manualmente artistas para participar
- Puede incluir artistas de cualquier fase anterior
- No sigue el % de selección automático
- Admin tiene control total

---

## 🌐 API ENDPOINTS

### Autenticación

```
POST   /api/auth/login              Login de admin/curador
POST   /api/auth/logout             Logout
GET    /api/auth/me                 Obtener usuario actual
POST   /api/auth/refresh            Refrescar token
```

### Artistas

```
GET    /api/artistas                Lista de artistas (paginada)
GET    /api/artistas/:id            Detalle de artista
POST   /api/artistas                Crear artista (registro público)
PUT    /api/artistas/:id            Actualizar artista (admin)
DELETE /api/artistas/:id            Eliminar artista (admin)
GET    /api/artistas/:id/documentos Obtener documentos de artista
POST   /api/artistas/:id/documentos Subir documentos
```

### Fases

```
GET    /api/fases                        Lista de fases
GET    /api/fases/:id                    Detalle de fase
POST   /api/fases                        Crear fase (admin)
PUT    /api/fases/:id                    Actualizar fase (admin)
POST   /api/fases/:id/abrir-inscripciones   Abrir inscripciones (admin)
POST   /api/fases/:id/cerrar-inscripciones  Cerrar inscripciones (admin)
POST   /api/fases/:id/abrir-votaciones      Abrir votaciones (admin)
POST   /api/fases/:id/cerrar-votaciones     Cerrar votaciones (admin)
POST   /api/fases/:id/finalizar             Finalizar fase (admin)
GET    /api/fases/:id/artistas              Artistas inscritos en fase
GET    /api/fases/:id/resultados            Resultados de votaciones
```

### Inscripciones por Fase

```
GET    /api/inscripciones-fases             Lista de inscripciones
POST   /api/inscripciones-fases             Inscribir artista a fase
GET    /api/inscripciones-fases/:id         Detalle de inscripción
PUT    /api/inscripciones-fases/:id         Actualizar estado (admin)
DELETE /api/inscripciones-fases/:id         Eliminar inscripción (admin)
```

### Votaciones

```
GET    /api/votaciones                      Lista de votaciones
POST   /api/votaciones                      Crear/actualizar voto (curador)
GET    /api/votaciones/fase/:faseId         Votaciones por fase
GET    /api/votaciones/artista/:artistaId   Votaciones por artista
GET    /api/votaciones/resultados/:faseId   Resultados en tiempo real
DELETE /api/votaciones/:id                  Eliminar voto (curador)
```

### Curadores (Admin only)

```
GET    /api/curadores                       Lista de curadores
GET    /api/curadores/:id                   Detalle de curador
POST   /api/curadores                       Crear curador (admin)
PUT    /api/curadores/:id                   Actualizar curador (admin)
DELETE /api/curadores/:id                   Eliminar curador (admin)
```

### Obras

```
GET    /api/obras                           Lista de obras
GET    /api/obras/:id                       Detalle de obra
POST   /api/obras                           Crear obra
PUT    /api/obras/:id                       Actualizar obra
DELETE /api/obras/:id                       Eliminar obra
```

### Eventos

```
GET    /api/eventos                         Lista de eventos
GET    /api/eventos/:id                     Detalle de evento
POST   /api/eventos                         Crear evento (admin)
PUT    /api/eventos/:id                     Actualizar evento (admin)
DELETE /api/eventos/:id                     Eliminar evento (admin)
```

### Paquetes

```
GET    /api/paquetes                        Lista de paquetes
GET    /api/paquetes/:id                    Detalle de paquete
POST   /api/paquetes                        Crear paquete (admin)
PUT    /api/paquetes/:id                    Actualizar paquete (admin)
DELETE /api/paquetes/:id                    Eliminar paquete (admin)
```

### Dashboard

```
GET    /api/dashboard/stats                 Estadísticas generales
GET    /api/dashboard/votaciones-live       Datos en tiempo real de votaciones
GET    /api/dashboard/actividad-reciente    Actividad reciente del sistema
```

---

## 🎨 ARQUITECTURA DEL FRONTEND

### Componentes Principales

#### Landing Page (Público)

**Componentes:**
- `Hero`: Hero section con call to action
- `AboutSection`: Información de la feria (incluye ubicación)
- `ConvocatoriaSection`: Info + botón descarga PDF + botón Registro
- `ContactSection`: Formulario de contacto
- `CalendarSection`: Calendario de eventos
- `Navbar`: Navegación principal
- `Footer`: Footer del sitio

**Rutas:**
- `/` - Landing page principal

#### Página de Registro (Público)

**Componentes:**
- `RegistroForm`: Formulario multi-step para artistas
  - Paso 1: Datos personales
  - Paso 2: Información artística
  - Paso 3: Documentos (CV, portfolio, ID)
  - Paso 4: Confirmación

**Rutas:**
- `/registro` - Formulario de registro

**Funcionalidad:**
- Validación con Zod
- Upload de archivos a Cloudinary
- Envío a backend
- Notificación en tiempo real al admin

#### Login Page

**Componentes:**
- `LoginForm`: Formulario de login con email/password

**Rutas:**
- `/loginpage` - URL especial para login

**Funcionalidad:**
- Login con JWT
- Redirección según role:
  - admin → `/admin`
  - curador → `/curador`

#### Panel de Admin

**Layout:**
- Sidebar con navegación
- Header con usuario/logout
- Área de contenido principal

**Páginas:**

1. **Dashboard** (`/admin` o `/admin/dashboard`)
   - Cards con estadísticas (total artistas, inscripciones, etc.)
   - Gráfica de votaciones en tiempo real
   - Tabla de seleccionados
   - Actividad reciente

2. **Gestión de Artistas** (`/admin/artistas`)
   - Lista paginada de artistas
   - Filtros (categoría, estado, fase)
   - Búsqueda
   - Botón "Inscribir Artista"
   - Acciones: Ver, Editar, Eliminar
   - Ver documentos

3. **Inscribir Artista** (`/admin/artistas/nuevo`)
   - Mismo formulario que registro público
   - Admin puede llenar manualmente

4. **Gestión de Curadores** (`/admin/curadores`)
   - Lista de curadores
   - Crear nuevo curador
   - Editar/eliminar curadores
   - Ver estadísticas de votos

5. **Gestión de Fases** (`/admin/fases`)
   - Lista de fases
   - Crear nueva fase
   - Controles por fase:
     - Abrir/cerrar inscripciones
     - Abrir/cerrar votaciones
     - Finalizar fase
   - Ver artistas inscritos
   - Ver resultados

6. **Votaciones** (`/admin/votaciones`)
   - Dashboard de votaciones en tiempo real
   - Gráficas interactivas
   - Ranking de artistas
   - Filtro por fase

**Componentes Clave:**
- `ArtistasList`: Tabla de artistas
- `ArtistaCard`: Card con info de artista
- `FaseControl`: Panel de control de fase
- `VotacionChart`: Gráfica de votaciones (Chart.js/Recharts)
- `SeleccionadosTable`: Tabla de artistas seleccionados

#### Panel de Curador

**Layout:**
- Sidebar con navegación
- Header con usuario/logout
- Área de contenido principal

**Páginas:**

1. **Dashboard** (`/curador`)
   - Fase actual activa
   - Gráficas de resultados en tiempo real
   - Mis votaciones recientes

2. **Votaciones** (`/curador/votaciones`)
   - Lista de artistas en fase activa
   - Card por artista con:
     - Info del artista
     - Documentos/portfolio
     - Botones: Votar a favor / Votar en contra
     - Campo para comentario
   - Filtros y búsqueda
   - Indicador de ya votado

3. **Perfil** (`/curador/perfil`)
   - Ver/editar información personal
   - Cambiar contraseña

**Componentes Clave:**
- `VotacionCard`: Card de artista para votar
- `ArtistaPreview`: Preview de info de artista
- `VotacionButton`: Botón de voto con estado

### Estado Global (Zustand)

**Stores:**

```javascript
// authStore.js
{
  user: null,
  token: null,
  isAuthenticated: false,
  login: (credentials) => {},
  logout: () => {},
  checkAuth: () => {}
}

// artistasStore.js
{
  artistas: [],
  loading: false,
  error: null,
  fetchArtistas: () => {},
  createArtista: () => {},
  updateArtista: () => {},
  deleteArtista: () => {}
}

// fasesStore.js
{
  fases: [],
  faseActual: null,
  loading: false,
  fetchFases: () => {},
  abrirInscripciones: (faseId) => {},
  cerrarInscripciones: (faseId) => {},
  abrirVotaciones: (faseId) => {},
  cerrarVotaciones: (faseId) => {}
}

// votacionesStore.js
{
  votaciones: [],
  resultados: null,
  loading: false,
  fetchResultados: (faseId) => {},
  votar: (artistaId, voto, comentario) => {},
  updateVoto: () => {}
}
```

### Hooks Personalizados

```javascript
// useAuth.js
- Maneja autenticación
- Protege rutas
- Verifica roles

// useArtistas.js
- CRUD de artistas
- Paginación
- Filtros

// useFases.js
- Gestión de fases
- Control de estados

// useVotaciones.js
- Sistema de votaciones
- Resultados en tiempo real
- Cálculos de porcentajes

// useRealTime.js
- WebSockets/Polling para actualizaciones en tiempo real
- Dashboard live
```

---

## ⚙️ ARQUITECTURA DEL BACKEND

### Estructura de Capas

```
Routes → Controllers → Services → Models → Database
```

### Controllers (Lógica de rutas)

**Responsabilidades:**
- Recibir requests
- Validar datos (express-validator)
- Llamar a servicios
- Enviar responses
- Manejo de errores

**Ejemplos:**
```javascript
// artistas.controller.js
- getArtistas()
- getArtistaById()
- createArtista()
- updateArtista()
- deleteArtista()

// fases.controller.js
- getFases()
- createFase()
- abrirInscripciones()
- cerrarInscripciones()
- abrirVotaciones()
- cerrarVotaciones()
- getResultados()

// votaciones.controller.js
- getVotaciones()
- votar()
- getResultadosByFase()
- calcularResultados()
```

### Services (Lógica de negocio)

**Responsabilidades:**
- Lógica de negocio compleja
- Cálculos
- Integraciones externas
- Transacciones

**Ejemplos:**
```javascript
// votacion.service.js
- calcularResultadosVotacion(faseId)
  - Cuenta votos
  - Calcula porcentajes
  - Ordena ranking
  - Selecciona top 20%
  - Guarda en artistas_seleccionados

// email.service.js
- enviarEmailSeleccionados(faseId)
  - Obtiene artistas seleccionados
  - Genera template de email
  - Envía emails
  - Marca como notificado

// fase.service.js
- cerrarVotacionesYCalcular(faseId)
  - Cierra votaciones
  - Llama a calcularResultados
  - Llama a enviarEmails
  - Finaliza proceso
```

### Models (Acceso a datos)

**Responsabilidades:**
- Queries a la base de datos
- CRUD básico
- Queries complejas
- Joins

**Ejemplos:**
```javascript
// Artista.model.js
- findAll(filters, pagination)
- findById(id)
- create(data)
- update(id, data)
- delete(id)
- findByFase(faseId)

// Votacion.model.js
- findByFase(faseId)
- findByCurador(curadorId)
- create(data)
- update(id, data)
- countVotosByArtista(artistaId, faseId)

// Fase.model.js
- findAll()
- findById(id)
- create(data)
- update(id, data)
- getFaseActiva()
```

### Middleware

**auth.middleware.js:**
```javascript
- verifyToken: Verifica JWT válido
- requireAuth: Requiere autenticación
```

**role.middleware.js:**
```javascript
- requireAdmin: Solo admin
- requireCurador: Solo curador
- requireAdminOrCurador: Admin o curador
```

**validation.middleware.js:**
```javascript
- validateArtista: Valida datos de artista
- validateFase: Valida datos de fase
- validateVotacion: Valida datos de votación
```

---

## ⚡ CARACTERÍSTICAS EN TIEMPO REAL

### Dashboard de Votaciones en Vivo

**Tecnología:**
- Polling cada 5 segundos (simple)
- O WebSockets con Socket.io (avanzado)

**Funcionalidad:**
- Actualización automática de:
  - Gráficas de porcentajes
  - Ranking de artistas
  - Conteo de votos
  - % de curadores que han votado

**Implementación (Polling):**
```javascript
// Frontend
useEffect(() => {
  const interval = setInterval(() => {
    fetchResultadosVotacion(faseId)
  }, 5000) // Cada 5 segundos

  return () => clearInterval(interval)
}, [faseId])
```

**Implementación (WebSockets):**
```javascript
// Backend
io.on('connection', (socket) => {
  socket.on('join-votacion', (faseId) => {
    socket.join(`fase-${faseId}`)
  })
})

// Cuando hay un nuevo voto
io.to(`fase-${faseId}`).emit('nuevo-voto', resultados)

// Frontend
socket.on('nuevo-voto', (resultados) => {
  updateResultados(resultados)
})
```

### Notificación de Nuevas Inscripciones

**Funcionalidad:**
- Cuando un artista se registra, admin ve notificación en tiempo real

**Implementación:**
```javascript
// Backend - Después de crear artista
io.to('admin').emit('nueva-inscripcion', artistaData)

// Frontend - Admin panel
socket.on('nueva-inscripcion', (artista) => {
  showNotification(`Nuevo artista inscrito: ${artista.nombre}`)
  addArtistaToList(artista)
})
```

---

## 📧 SISTEMA DE NOTIFICACIONES

### Email Templates

**1. Artista Seleccionado**
```
Asunto: ¡Felicitaciones! Has sido seleccionado para ARTEFACT [Fase X]

Hola [Nombre],

¡Felicitaciones! Has sido seleccionado para participar en ARTEFACT [Fase X].

Tu obra ha sido evaluada por nuestro equipo de curadores profesionales
y has quedado entre el top 20% de artistas de esta fase.

Próximos pasos:
- [Información sobre siguientes fases]
- [Fecha de la feria]
- [Contacto para más información]

¡Te esperamos!

Equipo ARTEFACT
```

**2. Confirmación de Registro**
```
Asunto: Confirmación de registro - ARTEFACT

Hola [Nombre],

Tu registro ha sido recibido exitosamente.

Tu información será revisada por nuestro equipo y entrarás en el proceso
de votación de la [Fase X].

Te notificaremos por email sobre los resultados.

Gracias por tu interés en ARTEFACT.
```

### Servicio de Email

**Provider:** SendGrid / AWS SES / Resend

**Configuración:**
```javascript
// email.service.js
import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

export const enviarEmailSeleccionado = async (artista, fase) => {
  const msg = {
    to: artista.email,
    from: 'info@artefact.com',
    subject: `¡Felicitaciones! Has sido seleccionado para ARTEFACT ${fase.nombre}`,
    html: renderTemplate('seleccionado', { artista, fase })
  }

  await sgMail.send(msg)
}
```

---

## 🔒 SEGURIDAD

### Autenticación

**JWT (JSON Web Tokens):**
```javascript
// Generación de token
const token = jwt.sign(
  { id: usuario.id, email: usuario.email, role: usuario.role },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
)

// Verificación de token
const decoded = jwt.verify(token, process.env.JWT_SECRET)
```

**Passwords:**
```javascript
// Hash de contraseñas con bcryptjs
const hashedPassword = await bcrypt.hash(password, 10)

// Verificación
const isValid = await bcrypt.compare(password, hashedPassword)
```

### Protección de Rutas

**Backend:**
```javascript
// Solo admin
router.post('/artistas', authMiddleware, requireAdmin, createArtista)

// Admin o curador
router.get('/resultados', authMiddleware, requireAdminOrCurador, getResultados)
```

**Frontend:**
```javascript
// Componente AuthGuard
function AuthGuard({ children }) {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/loginpage" />
  }

  return children
}

// Componente RoleGuard
function RoleGuard({ allowedRoles, children }) {
  const { user } = useAuth()

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" />
  }

  return children
}
```

### Validación de Datos

**Backend (express-validator):**
```javascript
router.post('/artistas', [
  body('nombre').trim().notEmpty().withMessage('Nombre requerido'),
  body('email').isEmail().withMessage('Email inválido'),
  body('telefono').isMobilePhone().withMessage('Teléfono inválido'),
  validationMiddleware
], createArtista)
```

**Frontend (Zod):**
```javascript
const artistaSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido'),
  apellido: z.string().min(1, 'Apellido requerido'),
  email: z.string().email('Email inválido'),
  telefono: z.string().regex(/^\d{10}$/, 'Teléfono inválido'),
  categoria: z.string().min(1, 'Categoría requerida')
})
```

### Otras Medidas

- **Rate Limiting:** express-rate-limit
- **CORS:** Configurado para frontend específico
- **Helmet:** Headers de seguridad
- **SQL Injection:** Uso de prepared statements (pg)
- **XSS:** Sanitización de inputs

---

## 🔄 FLUJOS DE TRABAJO

### Flujo 1: Registro de Artista (Público)

```
1. Artista visita landing page
   ↓
2. Click en "Registro" en sección Convocatoria
   ↓
3. Redirige a /registro
   ↓
4. Llena formulario multi-step:
   - Datos personales
   - Información artística
   - Sube documentos (CV, portfolio, ID)
   ↓
5. Submit formulario
   ↓
6. Frontend valida con Zod
   ↓
7. Sube archivos a Cloudinary
   ↓
8. POST /api/artistas (registro público)
   ↓
9. Backend valida datos
   ↓
10. Crea artista en DB (estado: 'pendiente')
    ↓
11. Inscribe automáticamente a fase activa
    ↓
12. Envía email de confirmación
    ↓
13. Notifica a admin en tiempo real (WebSocket/Polling)
    ↓
14. Muestra mensaje de éxito al artista
```

### Flujo 2: Admin Abre Fase

```
1. Admin va a /admin/fases
   ↓
2. Click en "Crear Nueva Fase"
   ↓
3. Llena formulario:
   - Nombre: "Fase 1"
   - Tipo: "fase"
   - % selección: 20
   - Fechas
   ↓
4. POST /api/fases
   ↓
5. Fase creada (inscripciones_abiertas: false)
   ↓
6. Admin click "Abrir Inscripciones"
   ↓
7. POST /api/fases/:id/abrir-inscripciones
   ↓
8. Se actualiza: inscripciones_abiertas = true
   ↓
9. Artistas pueden inscribirse
   ↓
10. Admin ve lista de inscritos en tiempo real
```

### Flujo 3: Proceso de Votación

```
1. Admin cierra inscripciones
   POST /api/fases/:id/cerrar-inscripciones
   ↓
2. Admin abre votaciones
   POST /api/fases/:id/abrir-votaciones
   ↓
3. Curadores reciben notificación (email)
   ↓
4. Curador va a /curador/votaciones
   ↓
5. Ve lista de artistas de la fase activa
   ↓
6. Por cada artista:
   - Ve perfil completo
   - Ve documentos/portfolio
   - Click "Votar a favor" o "Votar en contra"
   - Opcional: Agrega comentario
   ↓
7. POST /api/votaciones
   {
     curador_id: X,
     artista_id: Y,
     fase_id: Z,
     voto: true/false,
     comentario: "..."
   }
   ↓
8. Voto guardado en DB
   ↓
9. WebSocket emite 'nuevo-voto'
   ↓
10. Dashboards de admin y curador se actualizan en tiempo real
    - Gráficas
    - Porcentajes
    - Ranking
```

### Flujo 4: Cierre de Votación y Selección

```
1. Admin decide cerrar votaciones
   ↓
2. Click "Cerrar Votaciones"
   ↓
3. POST /api/fases/:id/cerrar-votaciones
   ↓
4. Backend Service: calcularResultadosVotacion(faseId)
   ↓
5. Para cada artista en la fase:
   - Cuenta votos a favor
   - Cuenta votos en contra
   - Calcula % aprobación = (favor / total) * 100
   ↓
6. Ordena artistas por % aprobación (descendente)
   ↓
7. Selecciona top 20%
   Ejemplo: 100 inscritos → selecciona 20
   ↓
8. Guarda en tabla artistas_seleccionados:
   {
     artista_id,
     fase_id,
     total_votos_favor,
     total_votos_contra,
     porcentaje_aprobacion,
     posicion (1-20),
     notificado: false
   }
   ↓
9. Backend Service: enviarEmailsSeleccionados(faseId)
   ↓
10. Para cada seleccionado:
    - Genera email personalizado
    - Envía email
    - Marca notificado = true
    ↓
11. Admin ve tabla de "Seleccionados Fase X"
    ↓
12. Fase queda como finalizada
```

### Flujo 5: Curador Vota

```
1. Curador logged in va a /curador/votaciones
   ↓
2. Sistema obtiene fase activa
   GET /api/fases/activa
   ↓
3. Obtiene artistas inscritos en esa fase
   GET /api/fases/:id/artistas
   ↓
4. Renderiza lista de artistas
   ↓
5. Curador click en un artista
   ↓
6. Modal/Panel muestra:
   - Foto del artista
   - Bio
   - Categoría
   - Portfolio (imágenes)
   - Documentos (CV, etc.)
   ↓
7. Curador lee información
   ↓
8. Decide votar a favor
   ↓
9. Click "Votar a Favor"
   ↓
10. Opcional: Escribe comentario
    ↓
11. Click "Confirmar Voto"
    ↓
12. POST /api/votaciones
    {
      artista_id: X,
      voto: true,
      comentario: "Excelente técnica..."
    }
    ↓
13. Backend:
    - Verifica que votaciones estén abiertas
    - Verifica que curador no haya votado antes por este artista
    - Guarda voto en DB
    - Emite evento en tiempo real
    ↓
14. Frontend:
    - Muestra confirmación
    - Marca artista como "Ya votado"
    - Actualiza contador de votaciones
    ↓
15. Dashboard se actualiza en tiempo real
```

### Flujo 6: Admin Inscribe Artista Manualmente

```
1. Admin va a /admin/artistas
   ↓
2. Click "Inscribir Artista"
   ↓
3. Redirige a /admin/artistas/nuevo
   ↓
4. Llena formulario (igual que registro público)
   ↓
5. Admin puede:
   - Llenar datos personalmente
   - Subir documentos del artista
   - Seleccionar fase de inscripción
   - Establecer estado inicial
   ↓
6. Submit formulario
   ↓
7. POST /api/artistas (con auth de admin)
   ↓
8. Artista creado en DB
   ↓
9. Inscrito en fase seleccionada
   ↓
10. Redirige a lista de artistas
    ↓
11. Nuevo artista aparece en lista
```

---

## 🚀 CONSIDERACIONES TÉCNICAS

### Performance

**Frontend:**
- Code splitting con Next.js
- Lazy loading de componentes
- Optimización de imágenes con Next/Image
- Paginación en listas largas
- Debounce en búsquedas

**Backend:**
- Índices en columnas frecuentes (ver schema.sql)
- Paginación en queries grandes
- Caching con Redis (opcional)
- Connection pooling en PostgreSQL

### Escalabilidad

**Base de Datos:**
- PostgreSQL soporta alto volumen
- Índices optimizados
- Prepared statements

**Backend:**
- Stateless API (escala horizontalmente)
- JWT en cookies (no sesiones en servidor)

**Frontend:**
- Deploy en Vercel/Netlify (CDN global)
- Assets en Cloudinary

### Monitoring y Logs

**Backend:**
- Morgan para logs HTTP
- Winston para logs de aplicación (opcional)
- Sentry para error tracking (opcional)

**Base de Datos:**
- Logs de queries lentas
- Monitoring de performance

### Testing

**Frontend:**
- Jest + React Testing Library
- Cypress para E2E

**Backend:**
- Jest para unit tests
- Supertest para integration tests

### Deployment

**Frontend:**
```
Vercel / Netlify
- Auto deploy desde git
- Environment variables
- Custom domain
```

**Backend:**
```
Heroku / Railway / DigitalOcean
- PostgreSQL addon
- Environment variables
- HTTPS
```

**Base de Datos:**
```
Heroku Postgres / Supabase / Railway
- Backups automáticos
- SSL connection
```

---

## 📝 NOTAS FINALES

### Próximos Pasos

1. **Implementar autenticación completa**
   - JWT setup
   - Login/logout
   - Protected routes

2. **Crear componentes del landing**
   - Hero
   - Secciones
   - Formulario de contacto

3. **Implementar registro de artistas**
   - Formulario multi-step
   - Upload de archivos
   - Integración con backend

4. **Desarrollar panel de admin**
   - Dashboard con estadísticas
   - CRUD de artistas
   - Gestión de fases
   - Sistema de votaciones en tiempo real

5. **Desarrollar panel de curador**
   - Dashboard
   - Sistema de votación
   - Visualización de artistas

6. **Implementar sistema de emails**
   - Templates
   - Servicio de envío
   - Notificaciones automáticas

7. **Testing completo**
   - Unit tests
   - Integration tests
   - E2E tests

8. **Deployment**
   - Configurar entornos
   - CI/CD
   - Monitoring

### Mejoras Futuras

- **WebSockets** para tiempo real más eficiente
- **Notificaciones push** en navegador
- **App móvil** con React Native
- **Sistema de mensajería** entre admin y artistas
- **Analytics** de votaciones y comportamiento
- **Exportación de datos** a Excel/PDF
- **Sistema de pagos** para paquetes
- **Galería virtual** de obras
- **QR codes** para obras en la feria física

---

**Versión:** 1.0
**Fecha:** Julio 2026
**Autor:** Equipo de Desarrollo ARTEFACT
**Cliente:** Benito - Feria de Arte
