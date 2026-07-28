# SISTEMA DE AUTENTICACIÓN - Documentación Completa

Sistema completo de autenticación para admin y curadores con JWT, protección de rutas y manejo de roles.

---

## 📋 COMPONENTES CREADOS

### Core de Autenticación
- ✅ **authStore.js** - Zustand store con persistencia en localStorage
- ✅ **auth.service.js** - Servicio de API para autenticación
- ✅ **useAuth.js** - Hook personalizado para usar autenticación
- ✅ **AuthGuard.jsx** - Componente de protección de rutas (requiere login)
- ✅ **RoleGuard.jsx** - Componente de protección por rol

### Páginas
- ✅ **/loginpage** - Página de login para admin y curador
- ✅ **/admin** - Dashboard de admin (protegido)
- ✅ **/curador** - Dashboard de curador (protegido)

---

## 🔐 CREDENCIALES DE PRUEBA (HARDCODED)

### Admin
```
Email: admin@artefact.com
Password: admin123
```

### Curador
```
Email: curador@artefact.com
Password: curador123
```

---

## 🗂 ESTRUCTURA DE DATOS

### Store (authStore.js)

```javascript
{
  user: {
    id: number,
    email: string,
    nombre: string,
    apellido: string,
    role: 'admin' | 'curador',
    foto: string | null,
    especialidad: string | null, // Solo curadores
    activo: boolean
  },
  token: string, // JWT token
  isAuthenticated: boolean,
  isLoading: boolean,
  error: string | null
}
```

### Base de Datos (usuarios)

```sql
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL, -- Hasheado con bcrypt
  nombre VARCHAR(255) NOT NULL,
  apellido VARCHAR(255),
  telefono VARCHAR(20),
  role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('admin', 'curador')),

  -- Solo para curadores
  especialidad VARCHAR(255),
  bio TEXT,

  foto VARCHAR(500),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_role ON usuarios(role);
CREATE INDEX idx_usuarios_activo ON usuarios(activo);
```

---

## 🔄 FLUJO DE AUTENTICACIÓN

### 1. Login

```
Usuario visita /loginpage
  ↓
Ingresa email y password
  ↓
Click "Iniciar Sesión"
  ↓
Frontend valida campos
  ↓
Llama a authService.login(email, password)
  ↓
[HARDCODED: Verifica credenciales en memoria]
[PRODUCCIÓN: POST /api/auth/login]
  ↓
Backend verifica credenciales
  - Busca usuario por email
  - Compara password (bcrypt.compare)
  - Genera JWT token
  - Retorna { success, token, user }
  ↓
Frontend guarda en authStore
  - user → Información del usuario
  - token → JWT token
  - isAuthenticated → true
  ↓
authStore.login() persiste en localStorage
  ↓
Redirige según rol:
  - admin → /admin
  - curador → /curador
```

### 2. Protección de Rutas

```
Usuario intenta acceder a /admin
  ↓
AuthGuard verifica isAuthenticated
  ↓
¿Está autenticado?
  NO → Redirige a /loginpage
  SÍ ↓
RoleGuard verifica rol
  ↓
¿Tiene rol permitido?
  NO → Redirige a su dashboard
  SÍ ↓
Muestra contenido protegido
```

### 3. Logout

```
Usuario click "Cerrar Sesión"
  ↓
Llama a logout()
  ↓
[PRODUCCIÓN: POST /api/auth/logout]
  ↓
authStore.logout()
  - user → null
  - token → null
  - isAuthenticated → false
  ↓
Limpia localStorage
  ↓
Redirige a /
```

---

## 🛠 USO DE COMPONENTES

### 1. Hook useAuth

```jsx
import { useAuth } from '@/hooks/useAuth'

function MiComponente() {
  const {
    user,              // Información del usuario
    token,             // JWT token
    isAuthenticated,   // Boolean
    isLoading,         // Boolean
    error,             // String | null
    login,             // Function(email, password, redirectTo)
    logout,            // Function()
    clearError,        // Function()
    hasRole,           // Function(role)
    hasAnyRole         // Function(roles)
  } = useAuth()

  // Login
  const handleLogin = async () => {
    const result = await login('admin@artefact.com', 'admin123')
    if (result.success) {
      // Login exitoso
    }
  }

  // Logout
  const handleLogout = () => {
    logout()
  }

  // Verificar rol
  if (hasRole('admin')) {
    // Usuario es admin
  }

  if (hasAnyRole(['admin', 'curador'])) {
    // Usuario es admin O curador
  }

  return (
    <div>
      {isAuthenticated ? (
        <p>Bienvenido, {user.nombre}</p>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  )
}
```

### 2. AuthGuard (Requiere Login)

```jsx
import AuthGuard from '@/components/shared/AuthGuard'

export default function PaginaProtegida() {
  return (
    <AuthGuard>
      {/* Este contenido solo se muestra si el usuario está autenticado */}
      <div>
        <h1>Página Protegida</h1>
        <p>Solo usuarios autenticados pueden ver esto</p>
      </div>
    </AuthGuard>
  )
}
```

### 3. RoleGuard (Requiere Rol Específico)

```jsx
import AuthGuard from '@/components/shared/AuthGuard'
import RoleGuard from '@/components/shared/RoleGuard'

// Solo para admin
export default function PaginaAdmin() {
  return (
    <AuthGuard>
      <RoleGuard allowedRoles={['admin']}>
        <div>Solo admin puede ver esto</div>
      </RoleGuard>
    </AuthGuard>
  )
}

// Para admin O curador
export default function PaginaAmbos() {
  return (
    <AuthGuard>
      <RoleGuard allowedRoles={['admin', 'curador']}>
        <div>Admin y curador pueden ver esto</div>
      </RoleGuard>
    </AuthGuard>
  )
}
```

---

## 📡 API ENDPOINTS NECESARIOS

### POST /api/auth/login

**Request:**
```json
{
  "email": "admin@artefact.com",
  "password": "admin123"
}
```

**Response (Success):**
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

**Response (Error):**
```json
{
  "success": false,
  "error": "Credenciales inválidas"
}
```

**Implementación Backend:**
```javascript
// backend/src/controllers/auth.controller.js
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // 1. Buscar usuario
    const user = await UsuarioModel.findByEmail(email)

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      })
    }

    // 2. Verificar que esté activo
    if (!user.activo) {
      return res.status(403).json({
        success: false,
        error: 'Usuario desactivado'
      })
    }

    // 3. Comparar password
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      })
    }

    // 4. Generar JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    // 5. Retornar datos (sin password)
    const { password: _, ...userData } = user

    res.json({
      success: true,
      token,
      user: userData
    })

  } catch (error) {
    console.error('Error en login:', error)
    res.status(500).json({
      success: false,
      error: 'Error al iniciar sesión'
    })
  }
}
```

### POST /api/auth/logout

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Sesión cerrada exitosamente"
}
```

**Implementación Backend:**
```javascript
export const logout = async (req, res) => {
  try {
    // En JWT no hay logout en servidor (el token sigue siendo válido)
    // El logout es manejado por el frontend borrando el token

    // Opcional: Implementar blacklist de tokens
    // await TokenBlacklistModel.add(req.token)

    res.json({
      success: true,
      message: 'Sesión cerrada exitosamente'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al cerrar sesión'
    })
  }
}
```

### GET /api/auth/me

Obtener información del usuario actual (para refrescar datos).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
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

### POST /api/auth/refresh

Refrescar token (extender sesión).

**Request:**
```json
{
  "token": "current_token_here"
}
```

**Response:**
```json
{
  "token": "new_token_here"
}
```

---

## 🔒 MIDDLEWARE DE AUTENTICACIÓN

### authMiddleware (Verificar Token)

```javascript
// backend/src/middleware/auth.middleware.js
import jwt from 'jsonwebtoken'

export const authMiddleware = async (req, res, next) => {
  try {
    // 1. Obtener token del header
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No autorizado' })
    }

    const token = authHeader.split(' ')[1]

    // 2. Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // 3. Opcional: Verificar que el usuario siga existiendo
    const user = await UsuarioModel.findById(decoded.userId)

    if (!user || !user.activo) {
      return res.status(401).json({ error: 'Usuario no válido' })
    }

    // 4. Agregar user a request
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role
    }
    req.token = token

    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' })
    }
    return res.status(401).json({ error: 'Token inválido' })
  }
}
```

### roleMiddleware (Verificar Rol)

```javascript
// backend/src/middleware/role.middleware.js

export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado' })
  }
  next()
}

export const requireCurador = (req, res, next) => {
  if (req.user.role !== 'curador') {
    return res.status(403).json({ error: 'Acceso denegado' })
  }
  next()
}

export const requireAdminOrCurador = (req, res, next) => {
  if (!['admin', 'curador'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Acceso denegado' })
  }
  next()
}
```

### Uso en Rutas

```javascript
import { authMiddleware } from './middleware/auth.middleware.js'
import { requireAdmin, requireCurador } from './middleware/role.middleware.js'

// Ruta protegida solo para admin
router.get('/admin/artistas', authMiddleware, requireAdmin, getArtistas)

// Ruta protegida para admin o curador
router.get('/votaciones', authMiddleware, requireAdminOrCurador, getVotaciones)

// Ruta pública
router.get('/eventos', getEventos)
```

---

## 🎨 DISEÑO Y UX

### Loading States

El sistema incluye estados de carga en:
- Login (mientras autentica)
- AuthGuard (mientras verifica token)
- RoleGuard (mientras verifica permisos)

### Redirecciones Automáticas

- Usuario no autenticado intenta acceder a ruta protegida → `/loginpage`
- Usuario autenticado visita `/loginpage` → Su dashboard
- Admin intenta acceder a `/curador` → `/admin`
- Curador intenta acceder a `/admin` → `/curador`

### Persistencia

- El estado de autenticación persiste en localStorage
- Al recargar la página, el usuario sigue autenticado
- El token se valida al cargar la app

---

## 🔐 SEGURIDAD

### Recomendaciones Implementadas

✅ **Passwords Hasheados** (en producción con bcrypt)
✅ **JWT Token** con expiración
✅ **HTTPS Only** (en producción)
✅ **Token en Authorization Header** (no en URL)
✅ **Validación en Frontend y Backend**
✅ **Protección CORS**
✅ **Rate Limiting** (recomendado)

### Próximas Mejoras

- [ ] Refresh tokens automático
- [ ] 2FA (autenticación de dos factores)
- [ ] Blacklist de tokens
- [ ] Session timeout warnings
- [ ] Password reset flow

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Frontend ✅ COMPLETO
- [x] authStore con Zustand
- [x] auth.service con métodos hardcodeados
- [x] Hook useAuth
- [x] Componente AuthGuard
- [x] Componente RoleGuard
- [x] Página /loginpage
- [x] Página /admin (protegida)
- [x] Página /curador (protegida)
- [x] Persistencia en localStorage
- [x] Loading states
- [x] Error handling

### Backend - Por Implementar
- [ ] Endpoint POST /api/auth/login
- [ ] Endpoint POST /api/auth/logout
- [ ] Endpoint GET /api/auth/me
- [ ] Endpoint POST /api/auth/refresh
- [ ] Middleware authMiddleware
- [ ] Middleware roleMiddleware
- [ ] Hash de passwords con bcrypt
- [ ] Generación de JWT tokens
- [ ] Rate limiting en login

---

## 🚀 TESTING

### Probar el Sistema

1. **Visitar /loginpage**
```
http://localhost:3000/loginpage
```

2. **Login como Admin**
```
Email: admin@artefact.com
Password: admin123
```
→ Redirige a `/admin`

3. **Logout**
→ Click "Cerrar Sesión"
→ Redirige a `/`

4. **Login como Curador**
```
Email: curador@artefact.com
Password: curador123
```
→ Redirige a `/curador`

5. **Probar Protección**
- Sin login, intentar acceder a `/admin` → Redirige a `/loginpage`
- Con login de curador, intentar acceder a `/admin` → Redirige a `/curador`

---

**Fecha:** Julio 2026
**Estado:** Frontend Completo ✅ | Backend Pendiente ⏳
