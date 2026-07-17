# ROADMAP - Próximos Pasos de Desarrollo

Hoja de ruta completa con todos los pasos siguientes para completar la plataforma ARTEFACT.

---

## 📊 ESTADO ACTUAL

### ✅ Completado (100% Frontend)

1. **Landing Page** - Completo con todas las secciones
2. **Sistema de Registro de Artistas** - Formulario multi-step con validación
3. **Sistema de Autenticación** - Login/logout con roles y protección de rutas
4. **Panel de Administración** - Dashboard completo con gestión de artistas, fases y curadores
5. **Documentación** - 5 archivos MD con toda la arquitectura y flows

### ⏳ Pendiente

1. Panel de Curador con Sistema de Votaciones
2. Backend completo (API + Base de datos)
3. Integración Frontend-Backend
4. Sistema de emails
5. Sistema en tiempo real
6. Testing y deployment

---

## 🎯 FASE 1: PANEL DE CURADOR (FRONTEND)

**Prioridad:** ALTA
**Estimación:** 1-2 días
**Dependencias:** Ninguna (puede hacerse con datos hardcoded)

### Componentes a Crear

#### 1. `/curador/page.js` - Actualizar Dashboard de Curador

**Funcionalidades:**

- [ ] **Vista de Fase Activa**
  - Mostrar nombre de la fase actual con votaciones abiertas
  - Contador de artistas totales vs votados
  - Barra de progreso personal
  - Fecha límite de votaciones

- [ ] **Estadísticas Personales**
  - Total de votos emitidos (favor/contra)
  - Porcentaje de participación
  - Comparación con otros curadores (anónimo)

- [ ] **Navegación por tabs:**
  - Dashboard
  - Votar
  - Mis Votaciones
  - Resultados (si hay fases finalizadas)

#### 2. `components/curador/ArtistasVotacion.jsx`

**Vista de Artistas para Votar:**

- [ ] Listado de artistas de la fase activa
- [ ] Filtros:
  - Todos / Votados / Sin votar
  - Por categoría
  - Búsqueda por nombre
- [ ] Card por artista mostrando:
  - Foto
  - Nombre completo
  - Categoría
  - Ciudad, país
  - Botón "Ver Perfil y Votar"
  - Badge si ya votó (con voto emitido)

#### 3. `components/curador/ArtistaPerfilModal.jsx`

**Modal de Perfil de Artista:**

- [ ] **Información completa:**
  - Foto grande
  - Datos personales
  - Biografía
  - Redes sociales (links)

- [ ] **Documentos con preview:**
  - CV (PDF viewer o link)
  - Portfolio (PDF viewer o link)
  - Identificación (solo mencionar que está verificado)

- [ ] **Interfaz de Votación:**
  - Botones grandes: "A Favor" / "En Contra"
  - Textarea para comentarios (opcional)
  - Botón "Guardar Voto"
  - Si ya votó: mostrar voto actual con opción de editar

#### 4. `components/curador/MisVotaciones.jsx`

**Historial de Votaciones:**

- [ ] Tabla de todas las votaciones emitidas
- [ ] Columnas:
  - Artista (foto + nombre)
  - Categoría
  - Voto (badge verde/rojo)
  - Comentario
  - Fecha
  - Fase
  - Acciones (editar mientras votación esté abierta)

#### 5. `components/curador/ResultadosFases.jsx`

**Resultados de Fases Finalizadas:**

- [ ] Selector de fase finalizada
- [ ] Ranking de artistas seleccionados
- [ ] Mostrar:
  - Posición
  - Artista
  - Total votos a favor
  - Total votos en contra
  - % de aprobación
  - Estado (Seleccionado / No seleccionado)

### Store Necesario

#### `stores/votacionesStore.js`

**Datos hardcoded:**

```javascript
{
  votaciones: [
    {
      id: 1,
      curador_id: 2,
      artista_id: 1,
      fase_id: 1,
      voto: true, // true = favor, false = contra
      comentario: "Excelente uso del color",
      fecha: "2027-02-05T14:30:00Z"
    },
    // ... más votaciones
  ]
}
```

**Métodos:**

- [ ] `fetchVotacionesByCurador(curadorId)`
- [ ] `fetchVotacionesByFase(faseId)`
- [ ] `createVotacion(artista_id, voto, comentario)`
- [ ] `updateVotacion(votacionId, voto, comentario)`
- [ ] `hasVotado(artistaId, faseId)` - Verificar si ya votó
- [ ] `getVotacionByArtista(artistaId, faseId)` - Obtener voto existente

### Flujo de Votación

```
Curador accede a /curador → Tab "Votar"
  ↓
Ve lista de artistas de la fase activa
  ↓
Filtra por "Sin votar"
  ↓
Click en "Ver Perfil y Votar" de un artista
  ↓
Modal se abre mostrando:
  - Perfil completo
  - Biografía
  - Links a documentos
  ↓
Curador revisa información
  ↓
Decide: "A Favor" o "En Contra"
  ↓
Click en botón correspondiente
  ↓
(Opcional) Escribe comentario
  ↓
Click "Guardar Voto"
  ↓
[PRODUCCIÓN: POST /api/votaciones]
  ↓
Store actualiza votaciones
  ↓
Modal se cierra
  ↓
Lista se actualiza: artista muestra badge "Votado ✓"
  ↓
Contador de progreso aumenta
```

### Validaciones

- [ ] Solo puede votar en fase con votaciones_abiertas = true
- [ ] Solo puede votar artistas inscritos en la fase actual
- [ ] Puede editar su voto mientras votaciones estén abiertas
- [ ] No puede votar después de cerrar votaciones

### Documentación

- [ ] Crear `PANEL_CURADOR.md` con:
  - Componentes creados
  - Estructura de datos
  - API endpoints necesarios
  - Flujos de votación
  - Ejemplos de uso

---

## 🎯 FASE 2: BACKEND - SETUP INICIAL

**Prioridad:** ALTA
**Estimación:** 2-3 días
**Dependencias:** Ninguna

### 1. Setup del Proyecto Backend

- [ ] **Crear estructura de carpetas:**
  ```
  backend/
  ├── src/
  │   ├── config/         # Configuración (DB, JWT, etc)
  │   ├── controllers/    # Controladores de rutas
  │   ├── models/         # Modelos de BD
  │   ├── middleware/     # Middleware (auth, roles, etc)
  │   ├── routes/         # Definición de rutas
  │   ├── services/       # Lógica de negocio
  │   ├── utils/          # Utilidades
  │   └── app.js          # App Express
  ├── tests/              # Tests
  ├── .env.example
  ├── .gitignore
  ├── package.json
  └── README.md
  ```

- [ ] **Instalar dependencias:**
  ```bash
  npm init -y
  npm install express
  npm install pg # PostgreSQL client
  npm install dotenv
  npm install cors
  npm install helmet
  npm install express-rate-limit
  npm install bcryptjs
  npm install jsonwebtoken
  npm install express-validator
  npm install multer
  npm install cloudinary
  npm install nodemailer
  npm install --save-dev nodemon
  ```

- [ ] **Configurar .env:**
  ```
  PORT=4000
  NODE_ENV=development

  # Database
  DB_HOST=localhost
  DB_PORT=5432
  DB_NAME=artefact
  DB_USER=postgres
  DB_PASSWORD=tu_password

  # JWT
  JWT_SECRET=tu_super_secreto_aqui
  JWT_EXPIRES_IN=7d

  # Frontend
  FRONTEND_URL=http://localhost:3000

  # Cloudinary
  CLOUDINARY_CLOUD_NAME=tu_cloud_name
  CLOUDINARY_API_KEY=tu_api_key
  CLOUDINARY_API_SECRET=tu_api_secret

  # Email
  EMAIL_HOST=smtp.gmail.com
  EMAIL_PORT=587
  EMAIL_USER=tu_email@gmail.com
  EMAIL_PASS=tu_app_password
  EMAIL_FROM=ARTEFACT <noreply@artefact.com>
  ```

### 2. Configuración de Base de Datos

- [ ] **Crear base de datos:**
  ```bash
  createdb artefact
  ```

- [ ] **Ejecutar schema:**
  ```bash
  psql artefact < database/schema.sql
  ```

- [ ] **Configurar conexión en `src/config/database.js`:**
  ```javascript
  import pkg from 'pg'
  const { Pool } = pkg

  const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  })

  export default pool
  ```

- [ ] **Crear seeds con datos iniciales:**
  ```sql
  -- database/seeds/01_usuarios.sql
  -- Crear admin y curadores iniciales

  -- database/seeds/02_fases.sql
  -- Crear las 4 fases

  -- database/seeds/03_artistas.sql
  -- Crear artistas de prueba
  ```

### 3. Configurar Middleware Básico

- [ ] **`src/middleware/auth.middleware.js`:**
  - Verificar JWT token
  - Extraer user del token
  - Agregar req.user

- [ ] **`src/middleware/role.middleware.js`:**
  - requireAdmin
  - requireCurador
  - requireAdminOrCurador

- [ ] **`src/middleware/error.middleware.js`:**
  - Manejador global de errores
  - Logger de errores

- [ ] **`src/middleware/validation.middleware.js`:**
  - Validar request body/params/query
  - Sanitización de inputs

### 4. App Express Básica

- [ ] **`src/app.js`:**
  ```javascript
  import express from 'express'
  import cors from 'cors'
  import helmet from 'helmet'
  import rateLimit from 'express-rate-limit'

  const app = express()

  // Security
  app.use(helmet())
  app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
  }))

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100
  })
  app.use(limiter)

  // Body parser
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  // Routes
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' })
  })

  // Error handler
  app.use(errorMiddleware)

  export default app
  ```

- [ ] **`src/server.js`:**
  ```javascript
  import app from './app.js'

  const PORT = process.env.PORT || 4000

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
  })
  ```

- [ ] **`package.json` scripts:**
  ```json
  {
    "scripts": {
      "dev": "nodemon src/server.js",
      "start": "node src/server.js"
    }
  }
  ```

---

## 🎯 FASE 3: BACKEND - AUTENTICACIÓN

**Prioridad:** ALTA
**Estimación:** 1-2 días
**Dependencias:** FASE 2

### Endpoints a Implementar

#### 1. POST /api/auth/login

**Archivo:** `src/controllers/auth.controller.js`

**Lógica:**
- [ ] Recibir email y password
- [ ] Buscar usuario en BD por email
- [ ] Verificar que usuario existe y está activo
- [ ] Comparar password con bcrypt
- [ ] Generar JWT token
- [ ] Retornar token y datos del usuario (sin password)

**Response esperado:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@artefact.com",
    "nombre": "Admin",
    "apellido": "Principal",
    "role": "admin",
    "foto": null,
    "activo": true
  }
}
```

#### 2. POST /api/auth/logout

**Lógica:**
- [ ] Opcional: Implementar blacklist de tokens
- [ ] Retornar success message

#### 3. GET /api/auth/me

**Lógica:**
- [ ] Requiere authMiddleware
- [ ] Obtener usuario actual desde req.user
- [ ] Buscar datos completos en BD
- [ ] Retornar información del usuario

#### 4. POST /api/auth/refresh

**Lógica:**
- [ ] Recibir token actual
- [ ] Verificar que es válido
- [ ] Generar nuevo token
- [ ] Retornar nuevo token

### Modelos

- [ ] **`src/models/usuario.model.js`:**
  - findByEmail(email)
  - findById(id)
  - create(userData)
  - update(id, userData)
  - hashPassword(password) - Helper

### Seeds

- [ ] **Crear usuarios de prueba:**
  ```sql
  -- Admin
  INSERT INTO usuarios (email, password, nombre, apellido, role, activo)
  VALUES (
    'admin@artefact.com',
    '$2a$10$...' -- hash de 'admin123'
    'Admin',
    'Principal',
    'admin',
    true
  );

  -- Curadores (3)
  ```

### Testing Manual

- [ ] Login con admin@artefact.com
- [ ] Login con curador@artefact.com
- [ ] Login con credenciales incorrectas (debe fallar)
- [ ] Obtener usuario actual con token
- [ ] Refresh token

---

## 🎯 FASE 4: BACKEND - API DE ARTISTAS

**Prioridad:** ALTA
**Estimación:** 2-3 días
**Dependencias:** FASE 2, FASE 3

### Endpoints a Implementar

Todos documentados en `PANEL_ADMIN.md` sección "API ENDPOINTS NECESARIOS"

#### 1. GET /api/artistas

- [ ] Implementar paginación
- [ ] Filtros: ?estado=pendiente&categoria=pintura&search=maria
- [ ] Ordenamiento
- [ ] Require: authMiddleware

#### 2. GET /api/artistas/:id

- [ ] Obtener artista completo con documentos
- [ ] Require: authMiddleware

#### 3. POST /api/artistas

- [ ] Crear nuevo artista (registro público)
- [ ] Validar todos los campos
- [ ] Generar slug único
- [ ] Auto-inscribir en fase activa si aplica
- [ ] Enviar email de confirmación
- [ ] Notificar a admin
- [ ] Public route (no requiere auth)

#### 4. PUT /api/artistas/:id

- [ ] Actualizar información del artista
- [ ] Require: authMiddleware + requireAdmin

#### 5. DELETE /api/artistas/:id

- [ ] Soft delete (marcar activo = false)
- [ ] Require: authMiddleware + requireAdmin

#### 6. PUT /api/artistas/:id/estado

- [ ] Cambiar estado (aprobar/rechazar)
- [ ] Guardar notas admin
- [ ] Enviar email al artista
- [ ] Require: authMiddleware + requireAdmin

### Upload de Archivos (Cloudinary)

- [ ] **Configurar Cloudinary en `src/config/cloudinary.js`**

- [ ] **Middleware de upload `src/middleware/upload.middleware.js`:**
  - Configurar Multer
  - Límites de tamaño
  - Tipos de archivo permitidos

- [ ] **POST /api/upload/documento:**
  - Recibir archivo
  - Validar tipo y tamaño
  - Subir a Cloudinary
  - Retornar URL
  - Require: authMiddleware

- [ ] **Integrar en POST /api/artistas:**
  - Antes de crear artista, subir archivos
  - Guardar URLs en campo documentos (JSONB)

### Modelo

- [ ] **`src/models/artista.model.js`:**
  - findAll(filters, pagination)
  - findById(id)
  - create(artistaData)
  - update(id, updates)
  - delete(id)
  - cambiarEstado(id, estado, notas)
  - findByEstado(estado)
  - findByCategoria(categoria)
  - search(term)

### Validaciones

- [ ] **`src/validators/artista.validator.js`:**
  - validateCreate
  - validateUpdate
  - validateEstado

---

## 🎯 FASE 5: BACKEND - API DE FASES

**Prioridad:** ALTA
**Estimación:** 2-3 días
**Dependencias:** FASE 2, FASE 3

### Endpoints a Implementar

Todos documentados en `PANEL_ADMIN.md`

#### 1. GET /api/fases

- [ ] Obtener todas las fases
- [ ] Include: total_inscritos, total_seleccionados
- [ ] Public route (para landing page)

#### 2. GET /api/fases/:id

- [ ] Obtener fase específica con estadísticas
- [ ] Include: artistas inscritos
- [ ] Require: authMiddleware

#### 3. POST /api/fases

- [ ] Crear nueva fase
- [ ] Validar fechas
- [ ] Require: authMiddleware + requireAdmin

#### 4. PUT /api/fases/:id

- [ ] Actualizar fase
- [ ] Require: authMiddleware + requireAdmin

#### 5. PUT /api/fases/:id/inscripciones

- [ ] Abrir/cerrar inscripciones
- [ ] **Lógica importante:**
  - Verificar que no haya otra fase con inscripciones abiertas
  - Cerrar inscripciones de todas las demás fases
  - Actualizar inscripciones_abiertas
- [ ] Require: authMiddleware + requireAdmin

#### 6. PUT /api/fases/:id/votaciones

- [ ] Abrir/cerrar votaciones
- [ ] **Lógica importante:**
  - Verificar que no haya otra fase con votaciones abiertas
  - Cerrar votaciones de todas las demás fases
  - Actualizar votaciones_abiertas
- [ ] Require: authMiddleware + requireAdmin

#### 7. POST /api/fases/:id/finalizar

**Lógica crítica de negocio:**

- [ ] Cerrar inscripciones y votaciones
- [ ] **Calcular resultados:**
  - Obtener todas las votaciones de la fase
  - Contar votos a favor y en contra por artista
  - Calcular % de aprobación
  - Ordenar por % de aprobación
- [ ] **Seleccionar top 20%:**
  - Calcular cantidad a seleccionar
  - Tomar top N artistas
- [ ] **Guardar en artistas_seleccionados:**
  - Insertar registros con totales y posición
- [ ] **Auto-inscribir en siguiente fase:**
  - Si es Fase 1, inscribir en Fase 2
  - Si es Fase 2, inscribir en Fase 3
  - Si es Fase 3, inscribir en Concurso
- [ ] **Enviar emails:**
  - A seleccionados: "¡Felicidades! Pasaste a la siguiente fase"
  - A no seleccionados: "Gracias por participar"
- [ ] **Marcar fase como finalizada**
- [ ] Require: authMiddleware + requireAdmin

### Modelos

- [ ] **`src/models/fase.model.js`:**
  - findAll()
  - findById(id)
  - create(faseData)
  - update(id, updates)
  - toggleInscripciones(id, abrir)
  - toggleVotaciones(id, abrir)
  - finalizar(id)
  - getFaseActiva()
  - getEstadisticas()

- [ ] **`src/models/inscripcion_fase.model.js`:**
  - create(artistaId, faseId)
  - findByFase(faseId)
  - findByArtista(artistaId)

- [ ] **`src/models/artista_seleccionado.model.js`:**
  - create(artistaId, faseId, votos, porcentaje, posicion)
  - findByFase(faseId)
  - findByArtista(artistaId)

### Servicios

- [ ] **`src/services/fase.service.js`:**
  - calcularResultados(faseId)
  - seleccionarTop20(artistas)
  - inscribirEnSiguienteFase(artistasSeleccionados, faseActual)
  - enviarNotificaciones(seleccionados, noSeleccionados)

---

## 🎯 FASE 6: BACKEND - API DE CURADORES

**Prioridad:** ALTA
**Estimación:** 1 día
**Dependencias:** FASE 2, FASE 3

### Endpoints a Implementar

#### 1. GET /api/curadores

- [ ] Obtener todos los curadores
- [ ] Include: total_votaciones
- [ ] Require: authMiddleware + requireAdmin

#### 2. GET /api/curadores/:id

- [ ] Obtener curador específico
- [ ] Include: historial de votaciones
- [ ] Require: authMiddleware

#### 3. POST /api/curadores

- [ ] Crear nuevo curador
- [ ] **Lógica:**
  - Crear usuario en tabla usuarios con role='curador'
  - Generar contraseña temporal
  - Hashear contraseña
  - Enviar email con credenciales
- [ ] Require: authMiddleware + requireAdmin

#### 4. PUT /api/curadores/:id

- [ ] Actualizar curador
- [ ] Require: authMiddleware + requireAdmin

#### 5. DELETE /api/curadores/:id

- [ ] Eliminar curador
- [ ] **Validar:** No tenga votaciones activas
- [ ] Require: authMiddleware + requireAdmin

#### 6. PUT /api/curadores/:id/activar

- [ ] Activar/desactivar curador
- [ ] Require: authMiddleware + requireAdmin

### Modelo

Usar el mismo `usuario.model.js` pero con métodos específicos:

- [ ] findAllCuradores()
- [ ] createCurador(curadorData)

### Emails

- [ ] **Template de bienvenida a curador:**
  ```
  Subject: Bienvenido a ARTEFACT - Credenciales de Acceso

  Hola [Nombre],

  Has sido registrado como curador en ARTEFACT.

  Credenciales:
  Email: [email]
  Contraseña temporal: [password]

  Por favor, cambia tu contraseña al iniciar sesión.

  Accede aquí: [FRONTEND_URL]/loginpage
  ```

---

## 🎯 FASE 7: BACKEND - API DE VOTACIONES

**Prioridad:** ALTA
**Estimación:** 2 días
**Dependencias:** FASE 2, FASE 3, FASE 4, FASE 5

### Endpoints a Implementar

#### 1. GET /api/votaciones

- [ ] Obtener todas las votaciones (admin)
- [ ] Filtros: ?faseId=1&curadorId=2
- [ ] Require: authMiddleware + requireAdmin

#### 2. GET /api/votaciones/mis-votos

- [ ] Obtener votaciones del curador actual
- [ ] Filtros: ?faseId=1
- [ ] Require: authMiddleware + requireCurador

#### 3. POST /api/votaciones

- [ ] Crear nueva votación
- [ ] **Validaciones:**
  - Fase tiene votaciones_abiertas = true
  - Artista está inscrito en la fase
  - Curador no ha votado por este artista en esta fase
  - Voto es boolean (true/false)
- [ ] Require: authMiddleware + requireCurador

#### 4. PUT /api/votaciones/:id

- [ ] Actualizar votación (cambiar voto o comentario)
- [ ] **Validaciones:**
  - Votación pertenece al curador actual
  - Fase aún tiene votaciones abiertas
- [ ] Require: authMiddleware + requireCurador

#### 5. GET /api/votaciones/fase/:faseId/resultados

- [ ] Obtener resultados parciales o finales
- [ ] **Response:**
  ```json
  [
    {
      "artista_id": 1,
      "nombre": "María González",
      "total_votos_favor": 15,
      "total_votos_contra": 3,
      "porcentaje_aprobacion": 83.33,
      "posicion": 1
    }
  ]
  ```
- [ ] Require: authMiddleware

### Modelo

- [ ] **`src/models/votacion.model.js`:**
  - create(curadorId, artistaId, faseId, voto, comentario)
  - update(id, voto, comentario)
  - findByCurador(curadorId, faseId)
  - findByFase(faseId)
  - hasVotado(curadorId, artistaId, faseId)
  - getVotacion(curadorId, artistaId, faseId)
  - getResultadosByFase(faseId)
  - countVotosByArtista(artistaId, faseId)

---

## 🎯 FASE 8: BACKEND - SISTEMA DE EMAILS

**Prioridad:** MEDIA
**Estimación:** 1-2 días
**Dependencias:** FASE 2

### Configurar Nodemailer

- [ ] **`src/config/email.js`:**
  ```javascript
  import nodemailer from 'nodemailer'

  const transporter = nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  })

  export default transporter
  ```

### Templates de Email

- [ ] **`src/templates/email/`:**
  - `registro-artista.html` - Confirmación de registro
  - `artista-aprobado.html` - Artista aprobado
  - `artista-rechazado.html` - Artista rechazado
  - `artista-seleccionado.html` - Pasaste a siguiente fase
  - `artista-no-seleccionado.html` - No pasaste esta vez
  - `curador-bienvenida.html` - Bienvenida a curador
  - `votaciones-abiertas.html` - Notificar a curadores
  - `recordatorio-votar.html` - Recordatorio antes de cierre

### Servicio de Email

- [ ] **`src/services/email.service.js`:**
  - sendEmail(to, subject, html)
  - sendRegistroArtista(artista)
  - sendArtistaAprobado(artista)
  - sendArtistaRechazado(artista)
  - sendArtistaSeleccionado(artista, fase)
  - sendArtistaNoSeleccionado(artista, fase)
  - sendCuradorBienvenida(curador, password)
  - sendVotacionesAbiertas(curadores, fase)
  - sendRecordatorioVotar(curador, fase)

### Queue de Emails (Opcional)

Si hay muchos emails, implementar cola:

- [ ] Instalar Bull o BullMQ
- [ ] Configurar Redis
- [ ] Crear workers para procesar emails
- [ ] Retry logic para emails fallidos

---

## 🎯 FASE 9: INTEGRACIÓN FRONTEND-BACKEND

**Prioridad:** ALTA
**Estimación:** 2-3 días
**Dependencias:** FASE 3, 4, 5, 6, 7

### 1. Actualizar Stores

Reemplazar datos hardcoded con llamadas a API:

#### authStore.js

- [ ] login() → POST /api/auth/login
- [ ] logout() → POST /api/auth/logout
- [ ] Guardar token en localStorage
- [ ] Incluir token en todas las requests

#### artistasStore.js

- [ ] fetchArtistas() → GET /api/artistas
- [ ] createArtista() → POST /api/artistas
- [ ] updateArtista() → PUT /api/artistas/:id
- [ ] deleteArtista() → DELETE /api/artistas/:id
- [ ] cambiarEstadoArtista() → PUT /api/artistas/:id/estado

#### fasesStore.js

- [ ] fetchFases() → GET /api/fases
- [ ] toggleInscripciones() → PUT /api/fases/:id/inscripciones
- [ ] toggleVotaciones() → PUT /api/fases/:id/votaciones
- [ ] finalizarFase() → POST /api/fases/:id/finalizar

#### curadoresStore.js

- [ ] fetchCuradores() → GET /api/curadores
- [ ] createCurador() → POST /api/curadores
- [ ] updateCurador() → PUT /api/curadores/:id
- [ ] deleteCurador() → DELETE /api/curadores/:id
- [ ] toggleActivo() → PUT /api/curadores/:id/activar

#### votacionesStore.js

- [ ] fetchMisVotaciones() → GET /api/votaciones/mis-votos
- [ ] createVotacion() → POST /api/votaciones
- [ ] updateVotacion() → PUT /api/votaciones/:id
- [ ] fetchResultados() → GET /api/votaciones/fase/:id/resultados

### 2. Crear Servicio HTTP

- [ ] **`frontend/services/api.service.js`:**
  ```javascript
  const API_URL = process.env.NEXT_PUBLIC_API_URL

  export const api = {
    get: async (endpoint) => {
      const token = localStorage.getItem('auth-storage')?.token
      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      return response.json()
    },

    post: async (endpoint, data) => {
      const token = localStorage.getItem('auth-storage')?.token
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      })
      return response.json()
    },

    put: async (endpoint, data) => { /* ... */ },
    delete: async (endpoint) => { /* ... */ }
  }
  ```

### 3. Manejo de Errores

- [ ] Implementar interceptors para:
  - 401 Unauthorized → Logout automático
  - 403 Forbidden → Redirigir a página de error
  - 500 Server Error → Mostrar mensaje de error
  - Network errors → Modo offline

### 4. Loading States

- [ ] Agregar spinners en:
  - Login
  - Carga de tablas
  - Submit de formularios
  - Cambio de estados

### 5. Testing de Integración

- [ ] Probar flujo completo de registro de artista
- [ ] Probar login de admin y curador
- [ ] Probar gestión de artistas (aprobar/rechazar)
- [ ] Probar control de fases
- [ ] Probar sistema de votaciones
- [ ] Probar cálculo de resultados

---

## 🎯 FASE 10: TIEMPO REAL (OPCIONAL)

**Prioridad:** MEDIA
**Estimación:** 2-3 días
**Dependencias:** FASE 9

### Opción 1: WebSockets

- [ ] Instalar socket.io en backend
- [ ] Configurar servidor WebSocket
- [ ] Implementar eventos:
  - `nuevo_artista_registrado` → Notificar a admins
  - `votacion_emitida` → Actualizar contador en tiempo real
  - `fase_actualizada` → Actualizar estado en todos los clientes
  - `resultados_calculados` → Mostrar resultados en vivo

### Opción 2: Server-Sent Events (SSE)

- [ ] Más simple que WebSockets
- [ ] Solo servidor → cliente
- [ ] Implementar endpoint GET /api/events
- [ ] Frontend escucha con EventSource

### Opción 3: Polling

- [ ] Más simple pero menos eficiente
- [ ] Fetch cada 10-30 segundos
- [ ] Implementar en componentes críticos

### Componentes Afectados

- [ ] Dashboard admin → Estadísticas en tiempo real
- [ ] Tabla de artistas → Nuevos registros automáticos
- [ ] Panel de votaciones → Contador de votos en vivo
- [ ] Resultados → Rankings actualizándose

---

## 🎯 FASE 11: TESTING

**Prioridad:** ALTA
**Estimación:** 3-4 días
**Dependencias:** FASE 9

### Backend - Unit Tests

- [ ] Instalar Jest
- [ ] Tests de modelos:
  - Usuario (create, findByEmail, etc)
  - Artista (create, update, search, etc)
  - Fase (toggle inscripciones, toggle votaciones)
  - Votación (create, hasVotado, getResultados)

- [ ] Tests de servicios:
  - Email service
  - Fase service (calcularResultados, seleccionarTop20)
  - Auth service

- [ ] Tests de middleware:
  - authMiddleware
  - roleMiddleware
  - validationMiddleware

### Backend - Integration Tests

- [ ] Tests de API endpoints:
  - Auth endpoints (login, logout, me)
  - Artistas CRUD
  - Fases CRUD y control
  - Curadores CRUD
  - Votaciones CRUD

### Backend - E2E Tests

- [ ] Flujo completo de registro → aprobación → inscripción fase
- [ ] Flujo completo de votación → cierre → cálculo → selección
- [ ] Flujo completo de creación curador → login → votar

### Frontend - Unit Tests

- [ ] Instalar Vitest + React Testing Library
- [ ] Tests de componentes:
  - Button, Input, Card, etc
  - AuthGuard, RoleGuard
  - Modals

- [ ] Tests de stores:
  - authStore
  - artistasStore
  - fasesStore

- [ ] Tests de hooks:
  - useAuth

### Frontend - E2E Tests

- [ ] Instalar Playwright o Cypress
- [ ] Tests de flujos completos:
  - Registro de artista
  - Login admin → gestionar artistas
  - Login curador → votar
  - Control de fases

---

## 🎯 FASE 12: DEPLOYMENT

**Prioridad:** ALTA
**Estimación:** 2-3 días
**Dependencias:** FASE 11

### 1. Preparar Backend para Producción

- [ ] Configurar variables de entorno de producción
- [ ] Configurar CORS para dominio de producción
- [ ] Configurar rate limiting estricto
- [ ] Configurar logs (Winston o similar)
- [ ] Configurar monitoring (PM2, New Relic, etc)
- [ ] Setup de base de datos en producción

### 2. Deploy Backend

**Opciones:**

- [ ] **Opción A: Heroku**
  - Crear app en Heroku
  - Agregar PostgreSQL addon
  - Configurar env vars
  - Deploy con git push

- [ ] **Opción B: DigitalOcean**
  - Crear droplet
  - Instalar Node.js, PostgreSQL
  - Configurar Nginx como reverse proxy
  - Setup PM2
  - Configurar SSL con Let's Encrypt

- [ ] **Opción C: AWS**
  - EC2 para backend
  - RDS para PostgreSQL
  - S3 para archivos estáticos
  - CloudFront como CDN

- [ ] **Opción D: Railway / Render**
  - Deploy automático desde GitHub
  - PostgreSQL incluido
  - SSL automático

### 3. Preparar Frontend para Producción

- [ ] Configurar variables de entorno:
  ```
  NEXT_PUBLIC_API_URL=https://api.artefact.com
  ```
- [ ] Build de producción:
  ```bash
  npm run build
  ```
- [ ] Optimizaciones:
  - Image optimization
  - Code splitting
  - Lazy loading

### 4. Deploy Frontend

**Opciones:**

- [ ] **Opción A: Vercel** (Recomendado para Next.js)
  - Deploy automático desde GitHub
  - SSL automático
  - CDN global
  - Preview deployments

- [ ] **Opción B: Netlify**
  - Similar a Vercel
  - Deploy desde GitHub

- [ ] **Opción C: DigitalOcean App Platform**
  - Deploy desde GitHub
  - SSL automático

### 5. Dominio y SSL

- [ ] Comprar dominio (ej: artefact.com)
- [ ] Configurar DNS:
  - artefact.com → Frontend (Vercel)
  - api.artefact.com → Backend
- [ ] Configurar SSL (automático en Vercel/Heroku)

### 6. Cloudinary Setup

- [ ] Crear cuenta en Cloudinary
- [ ] Configurar folders:
  - /artefact/artistas/fotos
  - /artefact/artistas/cv
  - /artefact/artistas/portfolio
  - /artefact/artistas/identificacion
- [ ] Configurar transformations para imágenes
- [ ] Agregar API keys a env vars

### 7. Email Setup

- [ ] **Opción A: Gmail SMTP**
  - Crear app password
  - Configurar en env vars

- [ ] **Opción B: SendGrid**
  - Crear cuenta
  - Verificar dominio
  - Configurar templates

- [ ] **Opción C: Mailgun / AWS SES**
  - Similar a SendGrid

### 8. Monitoring y Analytics

- [ ] Google Analytics en frontend
- [ ] Sentry para error tracking (frontend y backend)
- [ ] Uptime monitoring (UptimeRobot, Pingdom)
- [ ] Performance monitoring (New Relic, Datadog)

### 9. Backups

- [ ] Configurar backups automáticos de PostgreSQL
- [ ] Configurar backups de archivos en Cloudinary
- [ ] Plan de disaster recovery

---

## 🎯 FASE 13: POST-DEPLOYMENT

**Prioridad:** MEDIA
**Estimación:** Ongoing

### 1. Documentación de Usuario

- [ ] Manual de admin:
  - Cómo aprobar artistas
  - Cómo controlar fases
  - Cómo gestionar curadores

- [ ] Manual de curador:
  - Cómo votar
  - Cómo ver portfolios
  - Cómo revisar estadísticas

- [ ] Manual de artista:
  - Cómo registrarse
  - Qué documentos subir
  - Cómo ver estado de inscripción

### 2. Training

- [ ] Sesión de training con cliente
- [ ] Demo del sistema completo
- [ ] Q&A

### 3. Feedback y Mejoras

- [ ] Recopilar feedback inicial
- [ ] Lista de bugs a corregir
- [ ] Lista de mejoras sugeridas

### 4. Mantenimiento

- [ ] Plan de actualizaciones
- [ ] Monitoreo de performance
- [ ] Respuesta a incidentes

---

## 📊 RESUMEN DE PRIORIDADES

### 🔴 CRÍTICO (Hacer primero)

1. **Panel de Curador** - Para completar frontend
2. **Backend Setup** - Fundamento de todo
3. **API de Autenticación** - Necesario para todo lo demás
4. **API de Artistas** - Core del negocio
5. **API de Fases** - Core del negocio
6. **API de Votaciones** - Core del negocio
7. **Integración Frontend-Backend** - Conectar todo
8. **Testing** - Asegurar calidad
9. **Deployment** - Poner en producción

### 🟡 IMPORTANTE (Hacer después)

10. **API de Curadores** - Gestión de usuarios
11. **Sistema de Emails** - Notificaciones importantes
12. **Tiempo Real** - Mejora la experiencia

### 🟢 OPCIONAL (Nice to have)

13. **Analytics avanzado**
14. **Gráficas y charts**
15. **Exportación de datos**
16. **Sistema de mensajería interna**

---

## 📝 NOTAS IMPORTANTES

### Consideraciones Técnicas

1. **Seguridad:**
   - Nunca exponer JWT_SECRET
   - Validar TODOS los inputs
   - Sanitizar datos antes de guardar
   - Implementar rate limiting en todos los endpoints críticos

2. **Performance:**
   - Implementar paginación en todas las listas
   - Usar índices en BD para queries frecuentes
   - Cache de resultados cuando sea posible
   - Optimizar imágenes en Cloudinary

3. **Escalabilidad:**
   - Diseñar pensando en crecimiento
   - Usar queue para tareas pesadas (emails, cálculos)
   - Considerar CDN para archivos estáticos

4. **Mantenibilidad:**
   - Código limpio y bien documentado
   - Usar TypeScript (opcional pero recomendado)
   - Tests exhaustivos
   - Logs detallados

### Estimación Total

- **Frontend (Panel Curador):** 1-2 días
- **Backend Completo:** 10-15 días
- **Integración:** 2-3 días
- **Testing:** 3-4 días
- **Deployment:** 2-3 días

**Total: ~20-30 días de desarrollo**

---

## 🔗 REFERENCIAS

- `ARCHITECTURE.md` - Arquitectura completa del sistema
- `DATABASE_STRUCTURE.md` - Esquema de base de datos
- `REGISTRO_ARTISTAS.md` - Sistema de registro
- `AUTENTICACION.md` - Sistema de auth
- `PANEL_ADMIN.md` - Panel de administración

---

**Última actualización:** Julio 2026
**Estado:** Frontend completo, Backend pendiente
**Próximo paso:** Panel de Curador (Fase 1)
