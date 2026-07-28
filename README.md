# ARTEFACT - Feria de Arte Contemporáneo

Sistema integral de gestión para feria de arte con sistema de fases, votaciones y roles (Admin/Curador).

---

## 📁 ESTRUCTURA DEL PROYECTO

```
artefact-web/
├── frontend/          # Next.js 14 + React 18 + Tailwind CSS
├── backend/           # Express.js + PostgreSQL
├── database/          # Schema SQL y seeds
├── docs/              # Documentación y assets
├── ARCHITECTURE.md    # Documentación completa de arquitectura
└── DATABASE_STRUCTURE.md  # Estructura de BDD para componentes
```

---

## 🚀 QUICK START

### Requisitos
- Node.js 18+
- PostgreSQL 14+
- npm o yarn

### 1. Instalación del Frontend

```bash
cd frontend
npm install
```

### 2. Configurar variables de entorno

```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### 3. Correr el frontend

```bash
cd frontend
npm run dev
```

El sitio estará disponible en: **http://localhost:3000**

### 4. Instalación del Backend (Cuando esté listo)

```bash
cd backend
npm install
```

```bash
# backend/.env
PORT=4000
DATABASE_URL=postgresql://user:password@localhost:5432/artefact
JWT_SECRET=tu_secreto_aqui
FRONTEND_URL=http://localhost:3000
```

### 5. Configurar Base de Datos (Cuando esté listo)

```bash
# Crear base de datos
createdb artefact

# Ejecutar schema
psql artefact < database/schema.sql

# (Opcional) Cargar datos iniciales
psql artefact < database/seed.sql
```

### 6. Correr el backend (Cuando esté listo)

```bash
cd backend
npm run dev
```

El API estará disponible en: **http://localhost:4000**

---

## ✅ LO QUE ESTÁ HECHO

### 🎨 Landing Page Completo (Frontend)
- ✅ **Navbar** - Navegación sticky con smooth scroll
- ✅ **Hero Section** - Hero con CTA y stats
- ✅ **About Section** - Información de la feria + ubicación con mapa
- ✅ **Convocatoria Section** - Info de fases + descarga PDF + botón registro
- ✅ **Calendar Section** - Timeline visual de eventos
- ✅ **Contact Section** - Formulario de contacto funcional
- ✅ **Footer** - Footer completo con links y redes sociales

### 🎨 Página de Registro de Artistas (Frontend)
- ✅ **Formulario Multi-Step** - 4 pasos con progress bar
- ✅ **Paso 1: Datos Personales** - Información básica del artista
- ✅ **Paso 2: Información Artística** - Categoría, bio, redes sociales
- ✅ **Paso 3: Upload de Documentos** - CV, portfolio, ID, foto con drag & drop
- ✅ **Paso 4: Confirmación** - Resumen y términos
- ✅ **Validación Completa** - Client-side validation en cada paso
- ✅ **Pantalla de Éxito** - Confirmación post-registro
- ✅ **Diseño Responsive** - Funciona en todos los dispositivos

### 🔐 Sistema de Autenticación (Frontend)
- ✅ **authStore** - Zustand store con persistencia en localStorage
- ✅ **auth.service** - Servicio de autenticación con credenciales hardcoded
- ✅ **useAuth Hook** - Hook personalizado para manejo de autenticación
- ✅ **AuthGuard** - Componente de protección de rutas (requiere login)
- ✅ **RoleGuard** - Componente de protección por rol (admin/curador)
- ✅ **Login Page** - Página de login completa (`/loginpage`)
- ✅ **Dashboard Admin** - Panel protegido para administradores
- ✅ **Dashboard Curador** - Panel protegido para curadores
- ✅ **Redirección Automática** - Por rol después del login
- ✅ **Persistencia de Sesión** - Login persiste al recargar página

### 🎛 Panel de Administración Completo (Frontend)
- ✅ **Dashboard con Tabs** - Navegación entre secciones
- ✅ **Estadísticas en Tiempo Real** - Cards con totals y métricas
- ✅ **Gestión de Artistas**:
  - Tabla completa con filtros y búsqueda
  - Ver detalles (bio, redes, documentos)
  - Aprobar/rechazar con notas
  - Eliminar artistas
  - Filtro por estado y categoría
- ✅ **Control de Fases**:
  - Vista de 4 fases (3 fases + concurso)
  - Abrir/cerrar inscripciones
  - Abrir/cerrar votaciones
  - Finalizar fase
  - Estadísticas por fase
  - Barras de progreso visual
- ✅ **Gestión de Curadores**:
  - Crear nuevos curadores
  - Editar información
  - Activar/desactivar
  - Eliminar curadores
  - Ver estadísticas de votación
- ✅ **Stores con Zustand**:
  - artistasStore.js (5 artistas hardcoded)
  - fasesStore.js (4 fases hardcoded)
  - curadoresStore.js (3 curadores hardcoded)

### 🧩 Componentes UI Reutilizables
- ✅ **Button** - Botones con variantes (primary, secondary, ghost, dark)
- ✅ **Card** - Tarjetas reutilizables con hover effects
- ✅ **Input/Textarea** - Inputs y textareas para formularios
- ✅ **Select** - Dropdown select con estilos personalizados
- ✅ **FileUpload** - Upload de archivos con drag & drop y preview
- ✅ **ProgressBar** - Barra de progreso para multi-step forms
- ✅ **Table** - Componente de tabla con head, body, rows, cells
- ✅ **Badge** - Badges de estado (success, warning, error, info, purple, gray)
- ✅ **Modal** - Modal reutilizable con overlay y animaciones

### 📊 Base de Datos
- ✅ **Schema completo** en `database/schema.sql`
  - Tabla `usuarios` (admin/curador)
  - Tabla `artistas` (expandida con campos completos)
  - Tabla `fases` (Fase 1, 2, 3, Concurso)
  - Tabla `inscripciones_fases`
  - Tabla `votaciones`
  - Tabla `artistas_seleccionados`
  - Tabla `obras`
  - Tabla `eventos`
  - Tabla `paquetes`
  - Tabla `inscripciones`
  - Tabla `contenido`

### 📖 Documentación
- ✅ **ARCHITECTURE.md** - Documentación completa del sistema (700+ líneas)
  - Stack tecnológico
  - Estructura de carpetas
  - Esquema de BDD
  - Sistema de roles y permisos
  - Flujo de fases y votaciones
  - 50+ API endpoints documentados
  - 6 flujos de trabajo completos
- ✅ **DATABASE_STRUCTURE.md** - Mapeo de campos BDD usados en componentes
- ✅ **REGISTRO_ARTISTAS.md** - Sistema de registro de artistas completo
- ✅ **AUTENTICACION.md** - Sistema de autenticación y roles
- ✅ **PANEL_ADMIN.md** - Panel de administración completo
  - Gestión de artistas con filtros
  - Control de fases e inscripciones
  - Gestión de curadores
  - API endpoints necesarios
  - Flujos de trabajo detallados

---

## 🔧 ESTADO ACTUAL

### ✅ Funcionando (Frontend Completo)
- ✅ Landing page completo con todos los componentes
- ✅ Diseño responsive en todos los componentes
- ✅ Navegación suave entre secciones
- ✅ **Formulario de registro de artistas completo** (4 pasos)
- ✅ Upload de archivos con drag & drop
- ✅ Validación de formularios client-side
- ✅ Formulario de contacto (UI funcional, backend pendiente)
- ✅ Descarga de PDF de convocatoria
- ✅ Schema de base de datos completo
- ✅ Progress bar para multi-step forms
- ✅ **Sistema de autenticación completo** (hardcoded)
  - Login/logout funcional
  - Protección de rutas
  - Roles (admin/curador)
  - Persistencia en localStorage
- ✅ **Panel de Admin completo** con tabs:
  - Dashboard con estadísticas en tiempo real
  - Gestión de artistas (ver, aprobar, rechazar, eliminar)
  - Control de fases (abrir/cerrar inscripciones y votaciones)
  - Gestión de curadores (crear, editar, activar/desactivar)
- ✅ **Panel de Curador** (estructura básica)
- ✅ **3 Stores con Zustand** (artistas, fases, curadores)

### 🎯 Credenciales de Prueba
```
Admin:
Email: admin@artefact.com
Password: admin123

Curador:
Email: curador@artefact.com
Password: curador123
```

### ⏳ Pendiente (Backend)
- [ ] Conexión del registro de artistas con backend
- [ ] Upload de archivos a Cloudinary
- [ ] Implementación de todos los API endpoints
- [ ] Sistema de autenticación con JWT real
- [ ] Panel de curador con sistema de votaciones
- [ ] Dashboard en tiempo real con WebSockets
- [ ] Sistema de emails (confirmaciones, notificaciones)
- [ ] Cálculo automático de resultados al finalizar fases
- [ ] Auto-inscripción de seleccionados a siguiente fase

---

## 📝 DATOS ACTUALES

### TODOS los datos son HARDCODEADOS por ahora

Los componentes tienen datos de ejemplo hardcodeados. Al conectar con la base de datos, estos datos vendrán de las siguientes tablas:

- **Navbar/Footer** → `configuracion_sitio`
- **Hero** → `contenido` (tipo='hero') + `eventos`
- **About** → `contenido` (tipo='about') + `eventos`
- **Convocatoria** → `contenido` (tipo='convocatoria') + `fases`
- **Calendar** → `fases` + `eventos`
- **Contact** → `configuracion_sitio` + `mensajes_contacto`
- **Registro Artistas** → `artistas` + `inscripciones_fases` + Cloudinary

Ver `DATABASE_STRUCTURE.md` y `REGISTRO_ARTISTAS.md` para detalles completos.

---

## 🎯 PRÓXIMOS PASOS

### 1. ✅ ~~Frontend Admin Panel~~ (COMPLETADO)
- ✅ ~~Dashboard con estadísticas~~
- ✅ ~~CRUD de artistas~~
- ✅ ~~Gestión de curadores~~
- ✅ ~~Gestión de fases~~
- ✅ ~~Control de inscripciones/votaciones~~

### 2. Panel de Curador (Votaciones)
- [ ] Vista de artistas a votar (filtrada por fase activa)
- [ ] Interfaz de votación (favor/contra + comentarios)
- [ ] Ver portfolio y documentos de artistas
- [ ] Estadísticas de votación personal
- [ ] Progreso de votación en fase actual

### 3. Backend - API Implementation
- [ ] Implementar todos los endpoints documentados en PANEL_ADMIN.md
- [ ] Sistema de autenticación con JWT
- [ ] Setup Cloudinary para upload de archivos
- [ ] Sistema de emails (confirmaciones, notificaciones)
- [ ] WebSockets o polling para actualizaciones en tiempo real

### 4. Lógica de Negocio en Backend
- [ ] Cálculo automático de resultados al cerrar votaciones
- [ ] Selección automática del top 20% de artistas
- [ ] Auto-inscripción de seleccionados en siguiente fase
- [ ] Generación de rankings y estadísticas
- [ ] Logs de auditoría (quién hizo qué y cuándo)

### 5. Testing y Deployment
- [ ] Testing de flujos completos
- [ ] Testing de votaciones y cálculos
- [ ] Setup de producción
- [ ] Deploy de frontend y backend
- [ ] Configuración de dominio y SSL

---

## 📚 DOCUMENTACIÓN

### 1. Arquitectura Completa
```bash
cat ARCHITECTURE.md
```
Incluye:
- Stack tecnológico completo
- Estructura de carpetas detallada
- Esquema de base de datos
- Sistema de roles y permisos
- Flujo del sistema de fases (3 fases + concurso)
- 50+ API endpoints
- Flujos de trabajo paso a paso

### 2. Base de Datos
```bash
cat DATABASE_STRUCTURE.md
```
Incluye:
- Todas las tablas necesarias
- Campos utilizados en cada componente
- Datos hardcodeados actuales
- APIs necesarias
- Checklist de migración a BDD real

### 3. Sistema de Registro
```bash
cat REGISTRO_ARTISTAS.md
```
Incluye:
- Formulario multi-step completo
- Validaciones y reglas de negocio
- Upload de documentos
- Flow diagrams
- API endpoints necesarios

### 4. Sistema de Autenticación
```bash
cat AUTENTICACION.md
```
Incluye:
- Stores y servicios
- Hooks y componentes de protección
- Credenciales hardcodeadas
- Flow de login/logout
- JWT pattern para producción
- Middleware examples

### 5. Panel de Administración
```bash
cat PANEL_ADMIN.md
```
Incluye:
- Gestión de artistas (filtros, aprobación, etc)
- Control de fases (inscripciones/votaciones)
- Gestión de curadores
- Todos los API endpoints necesarios
- Flows detallados de cada acción
- Estructura de datos completa

---

## 🎨 STACK TECNOLÓGICO

### Frontend
- **Framework:** Next.js 14 (App Router)
- **UI:** React 18
- **Estilos:** Tailwind CSS
- **Estado:** Zustand ✅ (authStore, artistasStore, fasesStore, curadoresStore)
- **Persistencia:** Zustand persist middleware (localStorage)
- **Formularios:** Validación nativa React (Zod por implementar)
- **HTTP:** Fetch API nativo (Axios por implementar)

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Base de Datos:** PostgreSQL
- **Auth:** JWT + bcryptjs
- **Validación:** express-validator
- **Seguridad:** Helmet, CORS, rate-limit
- **Files:** Multer + Cloudinary

---

## 🌟 CARACTERÍSTICAS PRINCIPALES

### Sistema de Fases
- 3 fases de selección regulares
- 1 concurso especial
- Control de inscripciones por fase
- Sistema de votaciones por curadores
- Selección automática del top 20%
- Notificaciones por email

### Roles de Usuario
- **Admin:** Control total del sistema
- **Curador:** Votación y evaluación de artistas
- **Público:** Registro como artista

### Funcionalidades
- Landing page público con información de la feria
- Registro de artistas con upload de documentos
- Dashboard de votaciones en tiempo real
- Gestión completa de artistas y curadores
- Sistema de fases con inscripciones y votaciones
- Notificaciones automáticas por email
- Resultados y rankings en vivo

---

## 📞 CONTACTO

**Cliente:** Benito - Feria de Arte
**Proyecto:** ARTEFACT 2027

---

## 📄 LICENCIA

Proyecto privado - Todos los derechos reservados
© 2026 ARTEFACT Feria de Arte
