# PANEL DE CURADOR - Documentación Completa

Panel completo de curaduría para evaluar y votar artistas en el sistema de fases de ARTEFACT.

---

## 📋 COMPONENTES CREADOS

### Stores (Zustand)
- ✅ **votacionesStore.js** - Gestión de votaciones con datos hardcoded (3 votaciones de ejemplo)

### Componentes de Curador
- ✅ **ArtistasVotacion.jsx** - Vista de artistas para votar con filtros
- ✅ **ArtistaPerfilModal.jsx** - Modal de perfil completo con interfaz de votación
- ✅ **MisVotaciones.jsx** - Historial de votaciones del curador
- ✅ **ResultadosFases.jsx** - Resultados de fases finalizadas

### Páginas
- ✅ **/curador** - Dashboard completo con tabs y sistema de votación

---

## 🎯 CARACTERÍSTICAS PRINCIPALES

### Dashboard Principal
- **Estadísticas personales en tiempo real**:
  - Total de votaciones emitidas
  - Votos a favor
  - Votos en contra
  - % de votos a favor
  - Fase actual activa
- **Alerta de fase activa** con información clave y progreso
- **Accesos rápidos** a las 3 secciones principales
- **Navegación por tabs** (Dashboard, Votar, Mis Votaciones, Resultados)

### Sistema de Votación
- **Vista de artistas** de la fase activa con votaciones abiertas
- **Barra de progreso personal** (X de Y artistas votados)
- **Filtros avanzados**:
  - Búsqueda por nombre
  - Filtro por categoría (13 categorías)
  - Filtro por estado de votación (Todos / Votados / Sin votar)
- **Cards de artistas** con:
  - Foto grande
  - Nombre y categoría
  - Preview de biografía
  - Badge si ya votó (con voto emitido)
  - Botón para ver perfil y votar

### Modal de Votación
- **Información completa del artista**:
  - Foto y datos personales
  - Biografía completa
  - Redes sociales (links activos)
  - Documentos (CV, Portfolio, ID) con links
- **Interfaz de votación intuitiva**:
  - Botones grandes "A Favor" / "En Contra"
  - Textarea para comentarios opcionales
  - Guardar voto o actualizar voto existente
- **Validaciones**:
  - Debe seleccionar un voto
  - Solo puede votar en fase con votaciones abiertas
  - Puede editar su voto mientras votaciones estén abiertas

### Historial de Votaciones
- **Estadísticas personales**:
  - Total de votaciones
  - Votos a favor
  - Votos en contra
  - % a favor
- **Tabla completa** con todas las votaciones emitidas
- **Filtros**:
  - Por fase
  - Por tipo de voto (Favor / Contra)
- **Información mostrada**:
  - Artista (foto + nombre)
  - Categoría
  - Voto emitido
  - Fase
  - Fecha y hora
  - Comentario

### Resultados de Fases
- **Selector de fase finalizada**
- **Estadísticas de la fase**:
  - Total de participantes
  - Seleccionados (Top 20%)
  - Curadores votantes
  - % de selección
- **Ranking completo** con:
  - Posición (🥇🥈🥉 para top 3)
  - Artista (foto + nombre)
  - Categoría
  - Votos a favor
  - Votos en contra
  - Total de votos
  - % de aprobación (con barra visual)
  - Estado (Seleccionado / No seleccionado)
- **Filas verdes** para artistas seleccionados

---

## 🗂 ESTRUCTURA DE DATOS

### Votaciones (votacionesStore.js)

```javascript
{
  id: number,
  curador_id: number,
  artista_id: number,
  fase_id: number,
  voto: boolean, // true = a favor, false = en contra
  comentario: string,
  fecha: string (timestamp ISO 8601)
}
```

**Ejemplo:**
```javascript
{
  id: 1,
  curador_id: 2,
  artista_id: 1,
  fase_id: 1,
  voto: true,
  comentario: 'Excelente uso del color y composición',
  fecha: '2027-02-05T14:30:00Z'
}
```

### Estadísticas del Curador

```javascript
{
  total_votos: number,
  votos_favor: number,
  votos_contra: number,
  porcentaje_favor: string // "66.7"
}
```

### Resultados de Fase

```javascript
{
  artista_id: number,
  total_votos_favor: number,
  total_votos_contra: number,
  porcentaje_aprobacion: string, // "83.33"
  posicion: number
}
```

---

## 📡 API ENDPOINTS NECESARIOS

### Votaciones

#### POST /api/votaciones
Crear nueva votación

**Request:**
```json
{
  "artista_id": 1,
  "fase_id": 1,
  "voto": true,
  "comentario": "Excelente técnica y composición"
}
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (Success):**
```json
{
  "success": true,
  "votacion": {
    "id": 1,
    "curador_id": 2,
    "artista_id": 1,
    "fase_id": 1,
    "voto": true,
    "comentario": "Excelente técnica y composición",
    "fecha": "2027-02-05T14:30:00Z"
  }
}
```

**Response (Error - Ya votó):**
```json
{
  "success": false,
  "error": "Ya has votado por este artista en esta fase"
}
```

**Validaciones Backend:**
- Fase debe tener votaciones_abiertas = true
- Artista debe estar inscrito en la fase
- Curador no puede haber votado ya por este artista en esta fase
- Voto debe ser boolean

**Implementación Backend:**
```javascript
export const createVotacion = async (req, res) => {
  try {
    const { artista_id, fase_id, voto, comentario } = req.body
    const curador_id = req.user.id

    // 1. Verificar que la fase tiene votaciones abiertas
    const fase = await FaseModel.findById(fase_id)
    if (!fase || !fase.votaciones_abiertas) {
      return res.status(400).json({
        success: false,
        error: 'La fase no tiene votaciones abiertas'
      })
    }

    // 2. Verificar que el artista está inscrito en la fase
    const inscripcion = await InscripcionFaseModel.find(artista_id, fase_id)
    if (!inscripcion) {
      return res.status(400).json({
        success: false,
        error: 'El artista no está inscrito en esta fase'
      })
    }

    // 3. Verificar que no haya votado ya
    const votacionExistente = await VotacionModel.findByCuradorArtista(
      curador_id,
      artista_id,
      fase_id
    )
    if (votacionExistente) {
      return res.status(400).json({
        success: false,
        error: 'Ya has votado por este artista en esta fase'
      })
    }

    // 4. Crear votación
    const nuevaVotacion = await VotacionModel.create({
      curador_id,
      artista_id,
      fase_id,
      voto,
      comentario
    })

    res.json({
      success: true,
      votacion: nuevaVotacion
    })

  } catch (error) {
    console.error('Error al crear votación:', error)
    res.status(500).json({
      success: false,
      error: 'Error al guardar votación'
    })
  }
}
```

#### PUT /api/votaciones/:id
Actualizar votación existente

**Request:**
```json
{
  "voto": false,
  "comentario": "Después de revisar, cambio mi voto"
}
```

**Validaciones:**
- Votación debe pertenecer al curador actual
- Fase debe tener votaciones_abiertas = true

#### GET /api/votaciones/mis-votos
Obtener votaciones del curador actual

**Query params:**
```
?faseId=1 (opcional)
```

**Response:**
```json
[
  {
    "id": 1,
    "curador_id": 2,
    "artista_id": 1,
    "fase_id": 1,
    "voto": true,
    "comentario": "Excelente técnica",
    "fecha": "2027-02-05T14:30:00Z"
  }
]
```

#### GET /api/votaciones/fase/:faseId/resultados
Obtener resultados de una fase

**Response:**
```json
[
  {
    "artista_id": 1,
    "nombre": "María González",
    "total_votos_favor": 15,
    "total_votos_contra": 3,
    "porcentaje_aprobacion": "83.33",
    "posicion": 1,
    "seleccionado": true
  },
  {
    "artista_id": 3,
    "nombre": "Ana Martínez",
    "total_votos_favor": 14,
    "total_votos_contra": 4,
    "porcentaje_aprobacion": "77.78",
    "posicion": 2,
    "seleccionado": true
  }
]
```

**Cálculo de resultados:**
```javascript
// backend/src/services/votacion.service.js

export const calcularResultadosFase = async (faseId) => {
  // 1. Obtener todas las votaciones de la fase
  const votaciones = await VotacionModel.findByFase(faseId)

  // 2. Agrupar por artista y contar votos
  const resultadosPorArtista = {}

  votaciones.forEach(v => {
    if (!resultadosPorArtista[v.artista_id]) {
      resultadosPorArtista[v.artista_id] = {
        artista_id: v.artista_id,
        total_votos_favor: 0,
        total_votos_contra: 0
      }
    }

    if (v.voto === true) {
      resultadosPorArtista[v.artista_id].total_votos_favor++
    } else {
      resultadosPorArtista[v.artista_id].total_votos_contra++
    }
  })

  // 3. Calcular porcentaje de aprobación
  const resultados = Object.values(resultadosPorArtista).map(r => {
    const total = r.total_votos_favor + r.total_votos_contra
    const porcentaje = total > 0
      ? (r.total_votos_favor / total) * 100
      : 0

    return {
      ...r,
      total_votos: total,
      porcentaje_aprobacion: porcentaje.toFixed(2)
    }
  })

  // 4. Ordenar por % de aprobación (mayor a menor)
  resultados.sort((a, b) =>
    parseFloat(b.porcentaje_aprobacion) - parseFloat(a.porcentaje_aprobacion)
  )

  // 5. Agregar posición
  resultados.forEach((r, index) => {
    r.posicion = index + 1
  })

  // 6. Calcular top 20% seleccionados
  const totalParticipantes = resultados.length
  const cantidadSeleccionados = Math.ceil(totalParticipantes * 0.20)

  resultados.forEach((r, index) => {
    r.seleccionado = index < cantidadSeleccionados
  })

  // 7. Enriquecer con datos de artistas
  const artistasIds = resultados.map(r => r.artista_id)
  const artistas = await ArtistaModel.findByIds(artistasIds)

  const resultadosEnriquecidos = resultados.map(r => {
    const artista = artistas.find(a => a.id === r.artista_id)
    return {
      ...r,
      nombre: `${artista.nombre} ${artista.apellido}`,
      categoria: artista.categoria,
      foto: artista.foto
    }
  })

  return resultadosEnriquecidos
}
```

---

## 🔄 FLUJOS PRINCIPALES

### 1. Flujo Completo de Votación

```
Curador accede a /curador
  ↓
Ve dashboard con estadísticas personales
  ↓
Ve alerta de "Fase 1 - Votaciones Abiertas"
  ↓
Click "Ir a Votar" o tab "Votar"
  ↓
Ve grid de artistas de la fase activa
  ↓
Barra de progreso muestra: "3 de 5 votados (60%)"
  ↓
Aplica filtro "Sin votar"
  ↓
Ve 2 artistas sin votar
  ↓
Click "Ver Perfil y Votar" en un artista
  ↓
Modal se abre mostrando:
  - Foto grande del artista
  - Datos personales completos
  - Biografía completa (scroll)
  - Redes sociales (links clicables)
  - Documentos (CV, Portfolio, ID) con links para abrir
  ↓
Curador revisa toda la información
  ↓
Click en botón "A Favor" (se marca en verde)
  ↓
(Opcional) Escribe comentario:
  "Excelente manejo de técnicas mixtas. Propuesta muy original."
  ↓
Click "Guardar Voto"
  ↓
[PRODUCCIÓN: POST /api/votaciones]
  ↓
Backend:
  1. Verifica que fase.votaciones_abiertas = true
  2. Verifica que artista está inscrito
  3. Verifica que curador no ha votado ya
  4. Inserta en tabla votaciones
  5. Retorna votación creada
  ↓
Store actualiza votaciones
  ↓
Modal se cierra automáticamente
  ↓
Lista se actualiza:
  - Artista ahora muestra badge "A Favor ✓"
  - Barra de progreso: "4 de 5 votados (80%)"
  - Contador de pendientes: 1
  ↓
Curador continúa votando hasta completar todos
```

### 2. Flujo de Editar Voto

```
Curador en tab "Votar"
  ↓
Ve artista con badge "En Contra"
  ↓
Decide cambiar su voto
  ↓
Click "Ver Perfil y Editar Voto"
  ↓
Modal se abre con voto actual precargado:
  - Botón "En Contra" está seleccionado (rojo)
  - Comentario actual se muestra
  ↓
Curador lee nuevamente la información
  ↓
Click en "A Favor" (cambia de rojo a verde)
  ↓
Actualiza comentario:
  "Después de revisar con más detalle, cambio mi evaluación"
  ↓
Click "Actualizar Voto"
  ↓
[PRODUCCIÓN: PUT /api/votaciones/:id]
  ↓
Backend:
  1. Verifica que votación pertenece al curador
  2. Verifica que fase sigue con votaciones abiertas
  3. Actualiza voto y comentario
  4. Retorna votación actualizada
  ↓
Store actualiza votaciones
  ↓
Modal se cierra
  ↓
Badge cambia de "En Contra" a "A Favor ✓"
```

### 3. Flujo de Ver Resultados

```
Curador accede a tab "Resultados"
  ↓
Ve selector de fase con "Fase 1 - Selección Inicial" seleccionada
  ↓
[PRODUCCIÓN: GET /api/votaciones/fase/1/resultados]
  ↓
Backend calcula resultados:
  1. Agrupa votaciones por artista
  2. Cuenta votos a favor y en contra
  3. Calcula % de aprobación
  4. Ordena por % (mayor a menor)
  5. Calcula top 20%
  6. Marca seleccionados
  ↓
Frontend recibe resultados
  ↓
Muestra estadísticas:
  - Total: 5 participantes
  - Seleccionados: 1 (20%)
  - Curadores: 3
  ↓
Muestra tabla ordenada:
  Pos 1: 🥇 María González - 15 favor / 3 contra (83.33%) ✓ Seleccionado (fila verde)
  Pos 2: 🥈 Ana Martínez   - 14 favor / 4 contra (77.78%)   No seleccionado
  Pos 3: 🥉 Carlos Ramírez -  8 favor / 10 contra (44.44%)   No seleccionado
  ...
  ↓
Curador puede cambiar a otra fase en el selector
  ↓
Resultados se actualizan para la nueva fase
```

---

## 🎨 DISEÑO Y UX

### Colores Temáticos
- **Púrpura** (#9333EA) - Color principal del curador
- **Verde** (#10B981) - Voto a favor, seleccionado
- **Rojo** (#EF4444) - Voto en contra
- **Azul** (#3B82F6) - Información, categorías
- **Gris** (#6B7280) - No seleccionado, inactivo

### Estados Visuales

#### Artistas sin votar
- Card normal con botón primario "Ver Perfil y Votar"

#### Artistas con voto a favor
- Badge verde "A Favor ✓" en esquina superior
- Botón secundario "Ver Perfil y Editar Voto"

#### Artistas con voto en contra
- Badge rojo "En Contra" en esquina superior
- Botón secundario "Ver Perfil y Editar Voto"

#### Modal de votación
- Botón "A Favor" seleccionado:
  - Border verde grueso
  - Fondo verde claro
  - Ícono blanco en círculo verde
  - Sombra pronunciada

- Botón "En Contra" seleccionado:
  - Border rojo grueso
  - Fondo rojo claro
  - Ícono blanco en círculo rojo
  - Sombra pronunciada

### Animaciones
- Transiciones suaves en hover de cards
- Fade in/out de modales
- Progress bar animada
- Cambio de color en botones de votación

---

## 🔐 ACCESO Y SEGURIDAD

### Protección de Rutas
```jsx
<AuthGuard>
  <RoleGuard allowedRoles={['curador']}>
    <CuradorDashboardContent />
  </RoleGuard>
</AuthGuard>
```

### Credenciales de Curador
```
Email: curador@artefact.com
Password: curador123
```

### Validaciones de Seguridad

**Frontend:**
- No puede votar si no hay fase activa
- No puede votar si votaciones están cerradas
- Debe seleccionar un voto (favor/contra)

**Backend:**
- Verificar JWT token válido
- Verificar que user.role === 'curador'
- Verificar que curador está activo
- Verificar que fase tiene votaciones_abiertas = true
- Verificar que artista está inscrito en la fase
- Verificar que no ha votado ya (para crear)
- Verificar que votación le pertenece (para editar)
- Sanitizar comentarios (prevenir XSS)

---

## 📊 DATOS HARDCODED

### Votaciones de Ejemplo (3)
```javascript
[
  {
    id: 1,
    curador_id: 2,
    artista_id: 1,
    voto: true,
    comentario: 'Excelente uso del color'
  },
  {
    id: 2,
    curador_id: 2,
    artista_id: 3,
    voto: true,
    comentario: 'Fotografía excepcional'
  },
  {
    id: 3,
    curador_id: 2,
    artista_id: 2,
    voto: false,
    comentario: 'Necesita más desarrollo'
  }
]
```

### Fase Activa
- **Fase 1** con votaciones_abiertas = true
- 5 artistas inscritos
- Fecha límite: 15 de Febrero 2027

---

## ✅ FEATURES IMPLEMENTADAS

### ✅ Dashboard
- [x] Estadísticas personales en tiempo real
- [x] Alerta de fase activa
- [x] Barra de progreso de votación
- [x] Navegación por tabs
- [x] Quick actions

### ✅ Sistema de Votación
- [x] Vista de artistas con filtros
- [x] Grid responsivo de cards
- [x] Modal de perfil completo
- [x] Interfaz de votación (favor/contra)
- [x] Comentarios opcionales
- [x] Crear voto
- [x] Editar voto existente
- [x] Validaciones client-side

### ✅ Historial
- [x] Tabla de votaciones emitidas
- [x] Filtros por fase y tipo de voto
- [x] Estadísticas personales
- [x] Información completa de cada voto

### ✅ Resultados
- [x] Selector de fase
- [x] Estadísticas de fase
- [x] Ranking completo ordenado
- [x] Top 3 con medallas
- [x] Indicador visual de seleccionados
- [x] Barras de % aprobación

---

## 🚀 PRÓXIMAS MEJORAS

### Backend
- [ ] Conectar todos los endpoints de votaciones
- [ ] Implementar notificaciones en tiempo real
- [ ] Sistema de alertas (recordatorios para votar)
- [ ] Exportar resultados a PDF

### Frontend
- [ ] Gráfica de distribución de votos
- [ ] Comparación de votación personal vs general
- [ ] Vista de galería de portfolios
- [ ] Sistema de favoritos
- [ ] Filtro por progreso de votación

### Funcionalidades
- [ ] Comentarios destacados
- [ ] Votación por categorías
- [ ] Preguntas frecuentes para curadores
- [ ] Tutoriales interactivos

---

## 📝 RESUMEN

El panel de curador está **100% completo en frontend** con datos hardcoded. Incluye:

- ✅ Dashboard completo con estadísticas
- ✅ Sistema de votación funcional
- ✅ Historial de votaciones
- ✅ Resultados de fases
- ✅ Navegación intuitiva por tabs
- ✅ Diseño responsive
- ✅ Validaciones client-side

**Listo para conectar con backend** siguiendo los endpoints documentados.

---

**Fecha:** Julio 2026
**Estado:** Frontend Completo ✅ | Backend Pendiente ⏳
**Versión:** 1.0
