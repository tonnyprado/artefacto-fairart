# Backend Implementation - ARTEFACT API

## Overview

The backend API for ARTEFACT has been successfully implemented with hardcoded data for development. The API includes authentication, artist management, phase management, curator management, and voting system.

**Status**: ✅ Complete - Ready for frontend integration
**Data Source**: In-memory (hardcoded in `mockData.js`)
**Authentication**: JWT-based
**Port**: 4000 (default)

---

## Quick Start

```bash
cd backend
npm install
npm run dev
```

The API will be available at `http://localhost:4000`

### Test Credentials

```javascript
// Admin
Email: admin@artefact.com
Password: admin123
Role: admin

// Curadores
Email: sofia.martinez@artefact.com
Password: admin123
Role: curador
CuradorId: 1

Email: diego.ruiz@artefact.com
Password: admin123
Role: curador
CuradorId: 2
```

---

## API Endpoints

### 1. Authentication (`/api/auth`)

#### POST /api/auth/register
Register a new user (currently disabled for curators - use admin panel)

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name"
}
```

**Response:**
```json
{
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": 4,
    "email": "user@example.com",
    "nombre": "User Name",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST /api/auth/login
Login with email and password

**Request:**
```json
{
  "email": "sofia.martinez@artefact.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "message": "Login exitoso",
  "user": {
    "id": 2,
    "email": "sofia.martinez@artefact.com",
    "nombre": "Sofía Martínez",
    "role": "curador",
    "curadorId": 1
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Note:** For curador users, the token includes `curadorId` which is used for voting operations.

#### GET /api/auth/verify
Verify JWT token validity

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "valid": true,
  "user": {
    "id": 2,
    "email": "sofia.martinez@artefact.com",
    "nombre": "Sofía Martínez",
    "role": "curador",
    "curadorId": 1
  }
}
```

---

### 2. Artistas (`/api/artistas`)

All artista endpoints require authentication (admin or curator).

#### GET /api/artistas
Get all artists with optional filters

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `categoria`: Filter by category (e.g., "pintura", "escultura")
- `aprobado`: Filter by approval status (true/false)
- `estado_registro`: Filter by registration status ("pendiente", "aprobado", "rechazado")
- `search`: Search in name, last name, email, or bio
- `limit`: Number of results (default: 50)
- `offset`: Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "María",
      "apellido": "González",
      "email": "maria.gonzalez@example.com",
      "telefono": "+52 55 1234 5678",
      "fecha_nacimiento": "1990-05-15",
      "ciudad": "Ciudad de México",
      "pais": "México",
      "categoria": "pintura",
      "bio": "Artista visual especializada...",
      "foto": "https://i.pravatar.cc/300?img=1",
      "redes_sociales": {
        "instagram": "https://instagram.com/mariagonzalezart",
        "facebook": "https://facebook.com/mariagonzalezarte"
      },
      "documentos": {
        "cv": "https://cloudinary.com/sample-cv-1.pdf",
        "portfolio": "https://cloudinary.com/sample-portfolio-1.pdf",
        "identificacion": "https://cloudinary.com/sample-id-1.pdf"
      },
      "aprobado": true,
      "estado_registro": "aprobado",
      "created_at": "2027-01-20T14:30:00Z",
      "updated_at": "2027-02-01T10:00:00Z"
    }
  ],
  "total": 5
}
```

#### GET /api/artistas/:id
Get artist by ID with additional info

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "María",
    "apellido": "González",
    // ... all artist fields ...
    "fases": [1, 2],
    "total_votos": 2
  }
}
```

#### GET /api/artistas/fase/:fase_id
Get all artists enrolled in a specific phase

**Response:**
```json
{
  "success": true,
  "data": [
    // Array of artists
  ]
}
```

#### POST /api/artistas
Create new artist (Public - for artist registration)

**No authentication required**

**Request:**
```json
{
  "nombre": "Elena",
  "apellido": "Castro",
  "email": "elena@example.com",
  "telefono": "+52 55 6543 2109",
  "fecha_nacimiento": "1995-07-28",
  "ciudad": "Puebla",
  "pais": "México",
  "categoria": "arte_digital",
  "bio": "Artista digital...",
  "foto": "https://...",
  "redes_sociales": {
    "instagram": "https://..."
  },
  "documentos": {
    "cv": "https://...",
    "portfolio": "https://...",
    "identificacion": "https://..."
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* new artist */ },
  "message": "Artista registrado exitosamente"
}
```

#### PUT /api/artistas/:id
Update artist (Admin only)

#### PUT /api/artistas/:id/aprobar
Approve artist (Admin only)

#### PUT /api/artistas/:id/rechazar
Reject artist (Admin only)

#### DELETE /api/artistas/:id
Delete artist (Admin only)

---

### 3. Fases (`/api/fases`)

All fase endpoints require authentication (admin or curator).

#### GET /api/fases
Get all phases

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Fase 1 - Selección Inicial",
      "descripcion": "Primera fase de selección...",
      "fecha_inicio": "2027-02-01T00:00:00Z",
      "fecha_fin": "2027-02-15T23:59:59Z",
      "votaciones_abiertas": false,
      "finalizada": true,
      "porcentaje_seleccion": 20,
      "created_at": "2027-01-25T10:00:00Z",
      "updated_at": "2027-02-16T10:00:00Z"
    }
  ]
}
```

#### GET /api/fases/:id
Get phase by ID with statistics

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "Fase 1 - Selección Inicial",
    // ... all phase fields ...
    "total_artistas": 4,
    "total_votos": 6
  }
}
```

#### GET /api/fases/:id/artistas
Get artist IDs enrolled in phase

**Response:**
```json
{
  "success": true,
  "data": [1, 2, 3, 4]
}
```

#### POST /api/fases
Create new phase (Admin only)

**Request:**
```json
{
  "nombre": "Fase 3 - Final",
  "descripcion": "Fase final de selección",
  "fecha_inicio": "2027-03-01T00:00:00Z",
  "fecha_fin": "2027-03-15T23:59:59Z",
  "porcentaje_seleccion": 20
}
```

#### PUT /api/fases/:id
Update phase (Admin only)

#### PUT /api/fases/:id/abrir-votaciones
Open voting for phase (Admin only)

#### PUT /api/fases/:id/cerrar-votaciones
Close voting for phase (Admin only)

#### PUT /api/fases/:id/finalizar
Finalize phase (Admin only)

**This closes voting and marks phase as finished**

#### POST /api/fases/:id/artistas
Enroll artists in phase (Admin only)

**Request:**
```json
{
  "artista_ids": [1, 2, 3, 4, 5]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "nuevas_inscripciones": 5,
    "ya_inscritos": 0
  },
  "message": "5 artistas inscritos exitosamente"
}
```

#### DELETE /api/fases/:id
Delete phase (Admin only)

---

### 4. Curadores (`/api/curadores`)

#### GET /api/curadores
Get all curators

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "usuario_id": 2,
      "nombre": "Sofía",
      "apellido": "Martínez",
      "email": "sofia.martinez@artefact.com",
      "telefono": "+52 55 1111 2222",
      "especialidad": "Arte Contemporáneo",
      "bio": "Curadora con 15 años de experiencia...",
      "foto": "https://i.pravatar.cc/300?img=47",
      "activo": true,
      "created_at": "2027-01-15T10:00:00Z",
      "updated_at": "2027-01-15T10:00:00Z"
    }
  ]
}
```

#### GET /api/curadores/:id
Get curator by ID with statistics

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    // ... curator fields ...
    "total_votaciones": 3
  }
}
```

#### GET /api/curadores/:id/votaciones
Get all votes from a curator

**Response:**
```json
{
  "success": true,
  "data": [
    // Array of votaciones
  ]
}
```

#### POST /api/curadores
Create new curator (Admin only)

**Request:**
```json
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan.perez@artefact.com",
  "password": "password123",
  "telefono": "+52 55 5555 6666",
  "especialidad": "Escultura Moderna",
  "bio": "Curador especializado...",
  "foto": "https://..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "curador": { /* curator data */ },
    "usuario": { /* user data without password */ }
  },
  "message": "Curador creado exitosamente"
}
```

#### PUT /api/curadores/:id
Update curator (Admin only)

#### PUT /api/curadores/:id/activar
Activate curator (Admin only)

#### PUT /api/curadores/:id/desactivar
Deactivate curator (Admin only)

#### DELETE /api/curadores/:id
Delete curator (Admin only)

---

### 5. Votaciones (`/api/votaciones`)

**All voting endpoints require curator authentication**

#### POST /api/votaciones
Create new vote (Curator only)

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "artista_id": 1,
  "fase_id": 2,
  "voto": true,
  "comentario": "Excelente trabajo, muestra gran madurez artística"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 7,
    "curador_id": 1,
    "artista_id": 1,
    "fase_id": 2,
    "voto": true,
    "comentario": "Excelente trabajo...",
    "fecha": "2027-02-20T10:30:00Z",
    "created_at": "2027-02-20T10:30:00Z",
    "updated_at": "2027-02-20T10:30:00Z"
  },
  "message": "Voto registrado exitosamente"
}
```

**Validations:**
- Phase must exist
- Voting must be open (`votaciones_abiertas: true`)
- Phase must not be finalized
- Artist must exist
- Artist must be enrolled in the phase
- Curator must not have already voted for this artist in this phase

#### PUT /api/votaciones/:id
Update existing vote (Curator only)

**Request:**
```json
{
  "voto": false,
  "comentario": "Después de revisar nuevamente..."
}
```

**Validations:**
- Curator must own the vote
- Phase must not be finalized

#### GET /api/votaciones/mis-votos
Get my votes (Curator only)

**Query Parameters:**
- `fase_id`: Optional, filter by phase

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "curador_id": 1,
      "artista_id": 1,
      "fase_id": 1,
      "voto": true,
      "comentario": "Excelente...",
      "fecha": "2027-02-05T14:30:00Z",
      "created_at": "2027-02-05T14:30:00Z",
      "updated_at": "2027-02-05T14:30:00Z"
    }
  ]
}
```

#### GET /api/votaciones/estadisticas
Get my voting statistics (Curator only)

**Query Parameters:**
- `fase_id`: Optional, filter by phase

**Response:**
```json
{
  "success": true,
  "data": {
    "total_votos": 3,
    "votos_favor": 2,
    "votos_contra": 1,
    "porcentaje_favor": 66.7
  }
}
```

#### GET /api/votaciones/resultados/:fase_id
Get phase results (ranking)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "artista_id": 2,
      "total_votos_favor": 2,
      "total_votos_contra": 0,
      "porcentaje_aprobacion": 100,
      "posicion": 1
    },
    {
      "artista_id": 1,
      "total_votos_favor": 2,
      "total_votos_contra": 0,
      "porcentaje_aprobacion": 100,
      "posicion": 2
    },
    {
      "artista_id": 3,
      "total_votos_favor": 1,
      "total_votos_contra": 1,
      "porcentaje_aprobacion": 50,
      "posicion": 3
    }
  ]
}
```

**Results are sorted by:**
1. Percentage of approval (higher first)
2. Position is assigned sequentially

#### GET /api/votaciones/fase/:fase_id/artista/:artista_id
Verify if curator has voted

**Response:**
```json
{
  "success": true,
  "data": {
    "has_votado": true,
    "votacion": {
      "id": 1,
      "voto": true,
      "comentario": "...",
      // ... full votacion object
    }
  }
}
```

#### DELETE /api/votaciones/:id
Delete vote (Curator only)

**Validations:**
- Curator must own the vote
- Phase must not be finalized

---

## Data Structure

### Hardcoded Data Summary

The `mockData.js` file contains:

- **3 usuarios**: 1 admin, 2 curators
- **5 artistas**: 4 approved, 1 pending
- **2 fases**: 1 finalized, 1 active
- **2 curadores**: Both active
- **6 artistas_fases**: Artist-phase relationships
- **6 votaciones**: Sample votes from both curators

### Categories

```javascript
const CATEGORIAS = {
  pintura: 'Pintura',
  escultura: 'Escultura',
  fotografia: 'Fotografía',
  ilustracion: 'Ilustración',
  arte_digital: 'Arte Digital',
  instalacion: 'Instalación',
  video_arte: 'Video Arte',
  performance: 'Performance',
  arte_textil: 'Arte Textil',
  grabado: 'Grabado',
  ceramica: 'Cerámica',
  arte_objeto: 'Arte Objeto',
  otro: 'Otro'
}
```

---

## Middleware

### Auth Middleware (`src/middleware/auth.middleware.js`)

#### verifyToken
Verifies JWT token and adds decoded user to `req.user`

#### isAdmin
Requires user role to be 'admin'

#### isCurador
Requires user role to be 'curador'

#### isAdminOrCurador
Requires user role to be either 'admin' or 'curador'

#### isArtista
Requires user role to be 'artista'

#### optionalAuth
Adds user to request if token is valid, but doesn't fail if token is missing

---

## Error Handling

All API responses follow this format:

**Success:**
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation successful"
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message"
}
```

**Common HTTP Status Codes:**
- 200: Success
- 201: Created
- 400: Bad Request (validation error)
- 401: Unauthorized (missing or invalid token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 500: Internal Server Error

---

## Frontend Integration Guide

### Authentication Flow

1. **Login:**
```javascript
const response = await fetch('http://localhost:4000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'sofia.martinez@artefact.com',
    password: 'admin123'
  })
})
const { user, token } = await response.json()
// Store token in localStorage or cookie
localStorage.setItem('token', token)
localStorage.setItem('user', JSON.stringify(user))
```

2. **Authenticated Requests:**
```javascript
const token = localStorage.getItem('token')
const response = await fetch('http://localhost:4000/api/votaciones/mis-votos', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
```

### Curator Panel Integration

The backend is fully ready for the curator panel implementation. Here's how to integrate with the frontend stores:

#### Update artistasStore.js
```javascript
export const fetchArtistas = async (faseId) => {
  const token = localStorage.getItem('token')
  const response = await fetch(`http://localhost:4000/api/artistas/fase/${faseId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  const { data } = await response.json()
  set({ artistas: data })
}
```

#### Update fasesStore.js
```javascript
export const fetchFases = async () => {
  const token = localStorage.getItem('token')
  const response = await fetch('http://localhost:4000/api/fases', {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  const { data } = await response.json()
  set({ fases: data })
}
```

#### Update votacionesStore.js
```javascript
export const createVotacion = async (curadorId, artistaId, faseId, voto, comentario) => {
  const token = localStorage.getItem('token')
  const response = await fetch('http://localhost:4000/api/votaciones', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ artista_id: artistaId, fase_id: faseId, voto, comentario })
  })
  const result = await response.json()
  return result
}
```

---

## Next Steps

### To Complete Full Integration:

1. **Update Frontend Stores** (FASE 9 from ROADMAP)
   - Replace hardcoded data in all Zustand stores with API calls
   - Update `authStore.js` to use `/api/auth` endpoints
   - Update `artistasStore.js` to use `/api/artistas` endpoints
   - Update `fasesStore.js` to use `/api/fases` endpoints
   - Update `curadoresStore.js` to use `/api/curadores` endpoints
   - Update `votacionesStore.js` to use `/api/votaciones` endpoints

2. **Setup PostgreSQL** (FASE 2 from ROADMAP)
   - Install PostgreSQL
   - Run database schema from `database/schema.sql`
   - Update `.env` with database credentials
   - Migrate controllers to use database queries instead of mockData

3. **Setup Cloudinary** (FASE 4 from ROADMAP)
   - Create Cloudinary account
   - Add credentials to `.env`
   - Implement file upload endpoints for artist photos and documents

4. **Email System** (FASE 8 from ROADMAP)
   - Setup email service (SendGrid, Resend, etc.)
   - Implement email templates
   - Add email notifications for approvals, rejections, phase changes

---

## Testing

### Manual Testing with cURL

**Login:**
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sofia.martinez@artefact.com","password":"admin123"}'
```

**Get Phases:**
```bash
curl -X GET http://localhost:4000/api/fases \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Create Vote:**
```bash
curl -X POST http://localhost:4000/api/votaciones \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"artista_id":1,"fase_id":2,"voto":true,"comentario":"Excelente trabajo"}'
```

**Get Results:**
```bash
curl -X GET http://localhost:4000/api/votaciones/resultados/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## File Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # Database configuration (PostgreSQL ready)
│   ├── controllers/
│   │   ├── auth.controller.js   # Authentication logic
│   │   ├── artistas.controller.js
│   │   ├── fases.controller.js
│   │   ├── curadores.controller.js
│   │   └── votaciones.controller.js
│   ├── data/
│   │   └── mockData.js          # Hardcoded data (temporary)
│   ├── middleware/
│   │   ├── auth.middleware.js   # JWT verification & role checks
│   │   └── validation.middleware.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── artistas.routes.js
│   │   ├── fases.routes.js
│   │   ├── curadores.routes.js
│   │   └── votaciones.routes.js
│   └── server.js                # Express app setup
├── .env                          # Environment variables
├── .gitignore
└── package.json
```

---

## Summary

✅ **Authentication** - JWT-based with role support
✅ **Artist Management** - Full CRUD with approval workflow
✅ **Phase Management** - Create, update, open/close voting, finalize
✅ **Curator Management** - Full CRUD with user creation
✅ **Voting System** - Create, update, delete votes with validations
✅ **Results** - Automatic ranking calculation
✅ **Middleware** - Role-based access control
✅ **Error Handling** - Consistent response format

The backend is **100% functional** with hardcoded data and ready for frontend integration. Once the frontend stores are updated to use these endpoints, the curator panel will work seamlessly with real API data.
