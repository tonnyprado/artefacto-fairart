# PANEL DE ADMINISTRACIÓN - Documentación Completa

Panel completo de administración para gestionar artistas, fases, curadores y todo el sistema de votación de ARTEFACT.

---

## 📋 COMPONENTES CREADOS

### Stores (Zustand)
- ✅ **artistasStore.js** - Gestión de artistas con datos hardcoded
- ✅ **fasesStore.js** - Gestión de fases (3 fases + concurso)
- ✅ **curadoresStore.js** - Gestión de curadores

### Componentes de UI
- ✅ **Table.jsx** - Componente de tabla reutilizable
- ✅ **Badge.jsx** - Badges de estado (success, warning, error, info)
- ✅ **Modal.jsx** - Modal reutilizable con overlay

### Componentes de Admin
- ✅ **ArtistasTable.jsx** - Tabla de gestión de artistas
- ✅ **FasesControl.jsx** - Panel de control de fases
- ✅ **CuradoresTable.jsx** - Tabla de gestión de curadores

### Páginas
- ✅ **/admin** - Dashboard completo con tabs y estadísticas

---

## 🎯 CARACTERÍSTICAS PRINCIPALES

### Dashboard Principal
- **Estadísticas en tiempo real**
  - Total de artistas (aprobados, pendientes, rechazados)
  - Total de fases (activas, finalizadas)
  - Total de curadores (activos, votaciones realizadas)
  - Total de inscripciones
- **Fase activa destacada** con información clave
- **Accesos rápidos** a las 3 secciones principales
- **Navegación por tabs** (Dashboard, Artistas, Fases, Curadores)

### Gestión de Artistas
- **Listado completo** con foto, nombre, email, categoría, estado
- **Filtros avanzados**:
  - Búsqueda por nombre o email
  - Filtro por estado (pendiente, aprobado, rechazado)
  - Filtro por categoría (13 categorías disponibles)
- **Acciones por artista**:
  - Ver detalles completos (biografía, redes, documentos)
  - Cambiar estado (aprobar/rechazar con notas)
  - Eliminar artista
- **Modal de detalles** con toda la información del artista
- **Modal de cambio de estado** con notas administrativas

### Control de Fases
- **Vista de todas las fases** (Fase 1, 2, 3 + Concurso)
- **Estadísticas por fase**:
  - Total inscritos
  - Total seleccionados
  - Número de curadores
  - Porcentaje de selección
- **Controles por fase**:
  - Abrir/cerrar inscripciones (solo Fase 1)
  - Abrir/cerrar votaciones
  - Finalizar fase
- **Barras de progreso** visuales
- **Timeline con fechas** de inscripciones y votaciones
- **Advertencia**: Solo una fase puede estar activa a la vez

### Gestión de Curadores
- **Listado completo** con foto, nombre, email, especialidad
- **Estadísticas de votación** por curador
- **Crear nuevo curador** con formulario completo
- **Editar información** de curadores existentes
- **Activar/desactivar** curadores
- **Eliminar** curadores
- **Modal de creación** con todos los campos
- **Modal de edición** con datos precargados

---

## 🗂 ESTRUCTURA DE DATOS

### Artistas (artistasStore.js)

```javascript
{
  id: number,
  nombre: string,
  apellido: string,
  email: string,
  telefono: string,
  fecha_nacimiento: string (date),
  pais: string,
  ciudad: string,
  direccion: string,
  codigo_postal: string,
  categoria: string, // 'pintura' | 'escultura' | 'fotografia' | ...
  bio: string,
  foto: string (url),
  slug: string,
  redes_sociales: {
    instagram?: string,
    facebook?: string,
    website?: string,
    twitter?: string,
    behance?: string
  },
  documentos: {
    cv: string (url),
    portfolio: string (url),
    identificacion: string (url)
  },
  estado: 'pendiente' | 'aprobado' | 'rechazado',
  notas_admin: string | null,
  activo: boolean,
  fase_actual: number | null,
  total_votos_favor: number,
  total_votos_contra: number,
  created_at: string (timestamp)
}
```

### Fases (fasesStore.js)

```javascript
{
  id: number,
  nombre: string,
  tipo: 'fase' | 'concurso',
  numero_fase: number | null,
  descripcion: string,
  fecha_inicio_inscripciones: string (timestamp) | null,
  fecha_fin_inscripciones: string (timestamp) | null,
  fecha_inicio_votaciones: string (timestamp),
  fecha_fin_votaciones: string (timestamp),
  porcentaje_seleccion: number, // 20.00
  max_artistas_seleccionados: number | null,
  inscripciones_abiertas: boolean,
  votaciones_abiertas: boolean,
  finalizada: boolean,
  total_inscritos: number,
  total_seleccionados: number,
  total_curadores: number,
  created_at: string (timestamp)
}
```

### Curadores (curadoresStore.js)

```javascript
{
  id: number,
  email: string,
  nombre: string,
  apellido: string,
  telefono: string,
  role: 'curador',
  especialidad: string,
  bio: string,
  foto: string (url),
  activo: boolean,
  total_votaciones: number,
  created_at: string (timestamp)
}
```

---

## 📡 API ENDPOINTS NECESARIOS

### Artistas

#### GET /api/artistas
Obtener todos los artistas con filtros opcionales

**Query params:**
```
?estado=pendiente|aprobado|rechazado
?categoria=pintura|escultura|...
?search=nombre_o_email
?page=1&limit=20
```

**Response:**
```json
{
  "artistas": [
    {
      "id": 1,
      "nombre": "María",
      "apellido": "González",
      "email": "maria@email.com",
      ...
    }
  ],
  "total": 100,
  "page": 1,
  "pages": 5
}
```

#### GET /api/artistas/:id
Obtener detalles de un artista

**Response:**
```json
{
  "id": 1,
  "nombre": "María",
  "apellido": "González",
  ...
}
```

#### POST /api/artistas
Crear nuevo artista (admin puede inscribir artistas manualmente)

**Request:**
```json
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan@email.com",
  ...
}
```

#### PUT /api/artistas/:id
Actualizar información del artista

**Request:**
```json
{
  "estado": "aprobado",
  "notas_admin": "Excelente portafolio"
}
```

#### DELETE /api/artistas/:id
Eliminar artista

**Response:**
```json
{
  "success": true,
  "message": "Artista eliminado"
}
```

#### PUT /api/artistas/:id/estado
Cambiar estado del artista (aprobar/rechazar)

**Request:**
```json
{
  "estado": "aprobado",
  "notas": "Cumple con todos los requisitos"
}
```

### Fases

#### GET /api/fases
Obtener todas las fases

**Response:**
```json
[
  {
    "id": 1,
    "nombre": "Fase 1 - Selección Inicial",
    "tipo": "fase",
    "inscripciones_abiertas": true,
    ...
  }
]
```

#### GET /api/fases/:id
Obtener detalles de una fase

#### POST /api/fases
Crear nueva fase (admin puede crear fases adicionales)

**Request:**
```json
{
  "nombre": "Fase Especial",
  "tipo": "fase",
  "fecha_inicio_votaciones": "2027-04-01T00:00:00Z",
  "fecha_fin_votaciones": "2027-04-15T23:59:59Z",
  "porcentaje_seleccion": 20.00
}
```

#### PUT /api/fases/:id
Actualizar información de la fase

#### PUT /api/fases/:id/inscripciones
Abrir/cerrar inscripciones

**Request:**
```json
{
  "abrir": true
}
```

**Backend debe:**
1. Verificar que no haya otra fase con inscripciones abiertas
2. Cerrar inscripciones de otras fases
3. Actualizar inscripciones_abiertas

#### PUT /api/fases/:id/votaciones
Abrir/cerrar votaciones

**Request:**
```json
{
  "abrir": true
}
```

**Backend debe:**
1. Verificar que no haya otra fase con votaciones abiertas
2. Cerrar votaciones de otras fases
3. Actualizar votaciones_abiertas

#### POST /api/fases/:id/finalizar
Finalizar fase

**Backend debe:**
1. Cerrar inscripciones y votaciones
2. Calcular resultados finales
3. Seleccionar top 20% de artistas
4. Auto-inscribir seleccionados en siguiente fase
5. Enviar emails de notificación
6. Marcar fase como finalizada

### Curadores

#### GET /api/curadores
Obtener todos los curadores

**Response:**
```json
[
  {
    "id": 2,
    "nombre": "Patricia",
    "apellido": "Morales",
    "email": "curador@artefact.com",
    "especialidad": "Arte Contemporáneo",
    "activo": true,
    "total_votaciones": 8
  }
]
```

#### GET /api/curadores/:id
Obtener detalles de un curador

#### POST /api/curadores
Crear nuevo curador

**Request:**
```json
{
  "nombre": "Carlos",
  "apellido": "Sánchez",
  "email": "carlos@email.com",
  "telefono": "+52 555 1234567",
  "especialidad": "Fotografía Contemporánea",
  "bio": "Curador especializado en..."
}
```

**Backend debe:**
1. Crear usuario en tabla `usuarios` con role='curador'
2. Generar contraseña temporal
3. Enviar email con credenciales
4. Marcar como activo

#### PUT /api/curadores/:id
Actualizar información del curador

#### DELETE /api/curadores/:id
Eliminar curador

**Backend debe:**
1. Verificar que no tenga votaciones activas
2. Eliminar usuario de tabla usuarios

#### PUT /api/curadores/:id/activar
Activar/desactivar curador

**Request:**
```json
{
  "activo": false
}
```

---

## 🔄 FLUJOS PRINCIPALES

### 1. Flujo de Aprobación de Artista

```
Admin accede a /admin → Tab "Artistas"
  ↓
Ve lista de artistas con filtro "Pendientes"
  ↓
Click en "Ver detalles" de un artista
  ↓
Modal muestra:
  - Datos personales
  - Biografía
  - Redes sociales
  - Documentos (CV, portfolio, ID)
  ↓
Admin revisa y cierra modal
  ↓
Click en "Cambiar estado"
  ↓
Modal de cambio de estado:
  - Selecciona "Aprobado"
  - Escribe notas: "Excelente portafolio fotográfico"
  - Click "Guardar"
  ↓
[PRODUCCIÓN: PUT /api/artistas/:id/estado]
  ↓
Store actualiza el estado del artista
  ↓
Tabla se actualiza mostrando badge "Aprobado"
  ↓
[PRODUCCIÓN: Backend envía email al artista notificando aprobación]
```

### 2. Flujo de Control de Fase

```
Admin accede a /admin → Tab "Fases"
  ↓
Ve lista de 4 fases con su estado actual
  ↓
Fase 1 muestra:
  - "Inactiva"
  - 0 inscritos
  - Botón "Abrir Inscripciones"
  ↓
Admin click "Abrir Inscripciones"
  ↓
Confirmación: "¿Estás seguro de abrir las inscripciones?"
  ↓
Click "Aceptar"
  ↓
[PRODUCCIÓN: PUT /api/fases/1/inscripciones { abrir: true }]
  ↓
Backend:
  - Cierra inscripciones de otras fases
  - Actualiza fase 1: inscripciones_abiertas = true
  ↓
Store actualiza estado de la fase
  ↓
Vista se actualiza:
  - Badge cambia a "Inscripciones Abiertas"
  - Barra de progreso al 50%
  - Botón cambia a "Cerrar Inscripciones"
  ↓
Dashboard muestra alerta de "Fase Activa"
  ↓
[Los artistas ahora pueden registrarse en /registro]
  ↓
--- TIEMPO PASA ---
  ↓
Admin cierra inscripciones
  ↓
Admin abre votaciones
  ↓
[Curadores ahora pueden votar en /curador]
  ↓
--- VOTACIONES COMPLETAN ---
  ↓
Admin cierra votaciones
  ↓
Admin click "Finalizar Fase"
  ↓
[PRODUCCIÓN: POST /api/fases/1/finalizar]
  ↓
Backend:
  1. Calcula total de votos por artista
  2. Ordena por % de aprobación
  3. Selecciona top 20%
  4. Guarda en artistas_seleccionados
  5. Auto-inscribe en Fase 2
  6. Envía emails a seleccionados
  7. Marca fase como finalizada
  ↓
Fase 1 muestra "Finalizada" con totales finales
```

### 3. Flujo de Creación de Curador

```
Admin accede a /admin → Tab "Curadores"
  ↓
Click "Nuevo Curador"
  ↓
Modal se abre con formulario:
  - Nombre
  - Apellido
  - Email
  - Teléfono
  - Especialidad
  - Biografía
  ↓
Admin completa formulario:
  - Nombre: "Laura"
  - Apellido: "Fernández"
  - Email: "laura@email.com"
  - Especialidad: "Escultura Contemporánea"
  - Bio: "Curadora especializada en..."
  ↓
Click "Crear Curador"
  ↓
[PRODUCCIÓN: POST /api/curadores]
  ↓
Backend:
  1. Crea usuario en tabla usuarios
     - role: 'curador'
     - password: hash('temp_password_12345')
     - activo: true
  2. Genera token de activación
  3. Envía email:
     Subject: "Bienvenido a ARTEFACT - Credenciales de Acceso"
     Body: "
       Hola Laura,

       Has sido registrado como curador en ARTEFACT.

       Email: laura@email.com
       Contraseña temporal: temp_password_12345

       Por favor, cambia tu contraseña al iniciar sesión.

       Accede aquí: https://artefact.com/loginpage
     "
  ↓
Modal se cierra
  ↓
Tabla se actualiza mostrando el nuevo curador
  ↓
Curador recibe email y puede iniciar sesión
```

---

## 🎨 CATEGORÍAS DE ARTISTAS

Las 13 categorías disponibles:

1. **Pintura** - Óleo, acrílico, acuarela, técnicas mixtas
2. **Escultura** - Tridimensional, instalación escultórica
3. **Fotografía** - Fotografía artística, documental
4. **Ilustración** - Editorial, conceptual, digital
5. **Arte Digital** - NFTs, arte generativo, 3D
6. **Instalación** - Arte instalación, site-specific
7. **Video Arte** - Video experimental, videoinstalación
8. **Performance** - Arte performático, arte acción
9. **Arte Textil** - Fibras, tejido, bordado artístico
10. **Grabado** - Xilografía, litografía, serigrafía
11. **Cerámica** - Cerámica artística, escultura cerámica
12. **Arte Objeto** - Objetos encontrados, ensamblaje
13. **Otro** - Categorías no especificadas

---

## 📊 ESTADOS Y BADGES

### Estados de Artista
- **Pendiente** - Badge amarillo - Esperando revisión
- **Aprobado** - Badge verde - Aceptado para participar
- **Rechazado** - Badge rojo - No cumple requisitos

### Estados de Fase
- **Inactiva** - Badge gris - No hay actividad
- **Inscripciones Abiertas** - Badge azul - Artistas pueden registrarse
- **Votaciones Abiertas** - Badge verde - Curadores pueden votar
- **Finalizada** - Badge gris - Fase completada

### Estado de Curador
- **Activo** - Badge verde - Puede votar
- **Inactivo** - Badge gris - Desactivado temporalmente

---

## 🔐 ACCESO Y SEGURIDAD

### Protección de Rutas
```jsx
<AuthGuard>
  <RoleGuard allowedRoles={['admin']}>
    <AdminDashboardContent />
  </RoleGuard>
</AuthGuard>
```

### Credenciales de Admin
```
Email: admin@artefact.com
Password: admin123
```

### Flujo de Seguridad
1. Usuario intenta acceder a /admin
2. AuthGuard verifica isAuthenticated
3. Si no está autenticado → Redirige a /loginpage
4. RoleGuard verifica role='admin'
5. Si no es admin → Redirige a su dashboard correspondiente
6. Si todo OK → Muestra contenido de admin

---

## 🛠 COMPONENTES UI REUTILIZABLES

### Table
```jsx
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/Table'

<Table>
  <TableHead>
    <TableRow>
      <TableHeader>Nombre</TableHeader>
      <TableHeader>Email</TableHeader>
    </TableRow>
  </TableHead>
  <TableBody>
    <TableRow>
      <TableCell>María González</TableCell>
      <TableCell>maria@email.com</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### Badge
```jsx
import Badge from '@/components/ui/Badge'

<Badge variant="success">Aprobado</Badge>
<Badge variant="warning">Pendiente</Badge>
<Badge variant="error">Rechazado</Badge>
<Badge variant="info">Votaciones</Badge>
<Badge variant="purple">Curador</Badge>
<Badge variant="gray">Inactivo</Badge>
```

### Modal
```jsx
import Modal from '@/components/ui/Modal'

<Modal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Título del Modal"
  size="lg" // 'sm' | 'md' | 'lg' | 'xl'
  footer={
    <>
      <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
      <Button onClick={onConfirm}>Confirmar</Button>
    </>
  }
>
  <div>Contenido del modal</div>
</Modal>
```

---

## 📈 ESTADÍSTICAS DEL DASHBOARD

El dashboard muestra estadísticas en tiempo real usando los stores:

```javascript
// Artistas
const artistasStats = useArtistasStore(state => state.getEstadisticas())
// {
//   total: 5,
//   aprobados: 2,
//   pendientes: 2,
//   rechazados: 1,
//   activos: 4
// }

// Fases
const fasesStats = useFasesStore(state => state.getEstadisticas())
// {
//   total: 4,
//   activas: 1,
//   finalizadas: 0,
//   total_artistas_inscritos: 5
// }

// Curadores
const curadoresStats = useCuradoresStore(state => state.getEstadisticas())
// {
//   total: 3,
//   activos: 3,
//   inactivos: 0,
//   total_votaciones: 26
// }

// Fase activa
const faseActiva = useFasesStore(state => state.getFaseActiva())
// Returns la fase con inscripciones_abiertas o votaciones_abiertas = true
```

---

## 🚀 PRÓXIMAS MEJORAS

### Backend
- [ ] Conectar todos los endpoints de la API
- [ ] Implementar paginación en listados
- [ ] Sistema de notificaciones en tiempo real (WebSockets)
- [ ] Logs de auditoría (quién hizo qué y cuándo)
- [ ] Exportación de datos a Excel/PDF

### Frontend
- [ ] Gráficas con estadísticas (Chart.js)
- [ ] Filtros avanzados con múltiples criterios
- [ ] Vista de galería de artistas
- [ ] Timeline interactivo de fases
- [ ] Dashboard de analytics

### Funcionalidades
- [ ] Sistema de mensajería interna
- [ ] Comentarios en perfiles de artistas
- [ ] Etiquetas/tags personalizadas
- [ ] Comparación de artistas lado a lado
- [ ] Búsqueda avanzada con AI

---

**Fecha:** Julio 2026
**Estado:** Frontend Completo ✅ | Backend Pendiente ⏳
**Versión:** 1.0
