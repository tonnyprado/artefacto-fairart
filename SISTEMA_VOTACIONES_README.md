# Sistema de Votaciones - ARTEFACT

## Estado de la Implementación ✅

### Backend Completado

#### Base de Datos (PostgreSQL en AWS)

**Tablas Creadas:**
- `postulaciones` - Postulaciones de artistas con ciclo de vida completo
- `rondas` - Rondas de votación (1, 2, 3) por fase
- `justificaciones` - Justificaciones de curadores al cierre de fase
- `seleccion_piezas` - Selección de piezas para concurso de cortesía
- `log_votaciones` - Log inmutable de todas las acciones

**Tablas Modificadas:**
- `fases` - Agregado `config_json` con parámetros configurables
- `votaciones` - Agregado `ronda_id`, `postulacion_id`, `valor`, `conoce_artista`
- `obras` - Agregado `postulacion_id` y campos de medidas

**Funciones SQL:**
- `calcular_indice_r1()` - Índice de respaldo Ronda 1
- `calcular_respaldo_r2()` - Respaldo Ronda 2
- `calcular_aprobacion_r3()` - Aprobación Ronda 3

**Vista:**
- `v_postulaciones_metricas` - Vista con todas las métricas calculadas

---

### Controladores Backend

#### 1. `rondas.controller.js`
- `GET /api/rondas/fase/:fase_id` - Obtener rondas de una fase
- `GET /api/rondas/:id` - Obtener ronda específica
- `POST /api/rondas` - Crear ronda (admin)
- `POST /api/rondas/:id/abrir` - Abrir ronda para votación (admin)
- `POST /api/rondas/:id/cerrar` - Cerrar ronda y calcular resultados (admin)
- `GET /api/rondas/:id/estadisticas` - Estadísticas de participación
- `DELETE /api/rondas/:id` - Eliminar ronda sin votos (admin)

**Lógica de Cierre:**
- Verifica quórum mínimo
- Calcula automáticamente índices/respaldos según la ronda
- Actualiza estados de postulaciones según umbrales configurables
- Registra todo en log inmutable

#### 2. `postulaciones.controller.js`
- `GET /api/postulaciones` - Obtener postulaciones con filtros
- `GET /api/postulaciones/:id` - Obtener postulación con obras y votos
- `POST /api/postulaciones` - Crear postulación
- `PUT /api/postulaciones/:id` - Actualizar postulación
- `POST /api/postulaciones/:id/mover-a-shortlist` - Mover de reserva a shortlist (admin)
- `GET /api/postulaciones/fase/:fase_id/para-votacion` - Para panel de curador (orden aleatorio estable)
- `DELETE /api/postulaciones/:id` - Eliminar postulación sin votos

**Características:**
- Orden aleatorio por curador (semilla = curador_id + ronda_id)
- Incluye badge de carryover
- Filtra postulaciones según estado de ronda

#### 3. `votaciones.controller.js` (Actualizado)
- `POST /api/votaciones` - Crear o actualizar votación
- `GET /api/votaciones/mis-votos` - Votos del curador autenticado
- `GET /api/votaciones/ronda/:ronda_id/resultados` - Resultados (solo ronda cerrada o admin)
- `GET /api/votaciones/ronda/:ronda_id/progreso` - Progreso del curador
- `GET /api/votaciones/estadisticas` - Estadísticas del curador
- `DELETE /api/votaciones/:id` - Eliminar voto (solo ronda abierta)

**Reglas Implementadas:**
- **Voto Ciego**: No se pueden ver resultados de ronda abierta (excepto admin)
- **Validación de valores por ronda**:
  - Ronda 1: 0=No, 1=Tal vez, 2=Sí
  - Ronda 2: 1=voto (con límite configurable, ej: 10 votos)
  - Ronda 3: 0=No, 1=Sí
- **Límite R2**: Contador en vivo "te quedan N votos"
- **Marca "Conozco al artista"**: Opcional, no afecta cálculo

---

## Configuración de Fase (config_json)

```json
{
  "curadores": 6,              // Miembros del comité
  "quorum": 5,                 // Mínimo de votantes para validar ronda
  "cupo_2d": 8,                // Lugares de muro (metros lineales)
  "cupo_3d": null,             // Lugares de piso (libre)
  "umbral_r1": 0.60,           // Índice mínimo para shortlist
  "umbral_reserva": 0.30,      // Piso de la reserva
  "votos_r2": 10,              // Votos por curador en Ronda 2
  "umbral_consenso": 0.80,     // Selección automática R2
  "umbral_delib": 0.50,        // Piso para pasar a Ronda 3
  "cortesia_max": 4,           // Ganadores de concurso por fase
  "piezas_cortesia_min": 1,
  "piezas_cortesia_max": 3
}
```

---

## Ciclo de Vida de una Postulación

```
Admitida
   ↓
Ronda 1 (Cribado)
   ├→ Shortlist (≥60%)
   ├→ Reserva (30-60%) → (manual admin) → Shortlist
   └→ No Continúa (<30%)

Ronda 2 (10 votos por curador)
   ├→ Consenso (≥80%) → Seleccionada
   ├→ Deliberación (50-80%)
   └→ No Continúa (<50%)

Ronda 3 (Mayoría simple)
   ├→ Seleccionada (ordenadas por respaldo_r2, cupo 2d/3d)
   └→ No Continúa

Concurso de Cortesía (postulaciones no_continua)
```

---

## Fórmulas de Cálculo

### Ronda 1 - Índice de Respaldo
```
indice = suma(valores) / (2 * numero_de_votos_emitidos)

Ejemplo:
- 3 votos Sí (2) = 6 puntos
- 1 voto Tal vez (1) = 1 punto
- 1 voto No (0) = 0 puntos
Total = 7 / (2 * 5) = 0.70 → Shortlist
```

### Ronda 2 - Respaldo
```
respaldo = curadores_que_votaron_al_artista / curadores_que_votaron_en_la_ronda

Ejemplo:
- 5 curadores votaron por este artista
- 6 curadores votaron en total
respaldo = 5/6 = 0.8333 → Consenso (≥0.80)
```

### Ronda 3 - Aprobación + Ranking
```
aprobacion = votos_si / votos_emitidos

Luego se ordenan por:
1. respaldo_r2 DESC
2. indice_r1 DESC

Se toman los mejores hasta llenar cupo_2d (separado de cupo_3d)
```

**Desempate en línea de corte:**
1. Mayor índice de Ronda 1
2. Criterio de diversidad (manual dirección)
3. Voto de calidad de la dirección

---

## Endpoints API

### Rondas
```
GET    /api/rondas/fase/:fase_id          # Listar rondas de fase
GET    /api/rondas/:id                    # Ver ronda
GET    /api/rondas/:id/estadisticas       # Stats de participación
POST   /api/rondas                        # Crear (admin)
POST   /api/rondas/:id/abrir              # Abrir (admin)
POST   /api/rondas/:id/cerrar             # Cerrar y calcular (admin)
DELETE /api/rondas/:id                    # Eliminar (admin, sin votos)
```

### Postulaciones
```
GET    /api/postulaciones                 # Listar con filtros
GET    /api/postulaciones/:id             # Ver detalle + obras + votos
GET    /api/postulaciones/fase/:fase_id/para-votacion  # Para curador
POST   /api/postulaciones                 # Crear (admin)
PUT    /api/postulaciones/:id             # Actualizar (admin)
POST   /api/postulaciones/:id/mover-a-shortlist  # Rescate (admin)
DELETE /api/postulaciones/:id             # Eliminar (admin, sin votos)
```

### Votaciones
```
POST   /api/votaciones                    # Crear/actualizar voto
GET    /api/votaciones/mis-votos          # Mis votos
GET    /api/votaciones/estadisticas       # Mis estadísticas
GET    /api/votaciones/ronda/:ronda_id/progreso  # Mi progreso
GET    /api/votaciones/ronda/:ronda_id/resultados  # Ver resultados (cerrada)
DELETE /api/votaciones/:id                # Eliminar voto (ronda abierta)
```

---

## Pendiente: Frontend

### Stores Zustand Necesarios
1. `rondasStore.js` - Gestión de rondas
2. `postulacionesStore.js` - Gestión de postulaciones
3. Actualizar `votacionesStore.js` - Nuevo sistema de rondas

### Componentes Curador
1. **Panel de Votación**
   - Lista de postulaciones (orden aleatorio estable)
   - Ficha de postulación con obras en alta resolución
   - Controles de voto según ronda (3 opciones / límite 10 / mayoría)
   - Checkbox "Conozco a este artista"
   - Campo de comentario opcional
   - Indicador de progreso "18 de 38 revisadas"
   - Para R2: "Te quedan N votos"

2. **Visor de Obra**
   - Zoom y pantalla completa
   - Medida siempre visible
   - Portfolio (10-15 imágenes)
   - Ficha técnica completa

3. **Formulario de Justificación** (Cierre de fase)
   - Perfil de seleccionados
   - Líneas temáticas detectadas
   - Observaciones

### Componentes Admin
1. **Panel de Control de Rondas**
   - Abrir/cerrar rondas
   - Ver quién ha votado
   - Vista en vivo: "con el umbral actual pasan N postulaciones"
   - Mover manualmente reserva → shortlist
   - Exportar resultados (CSV + PDF)

2. **Dashboard de Fase**
   - Contadores 2D/3D en vivo
   - Gráficas de participación
   - Log de acciones

---

## Archivos Creados

### Base de Datos
- `/database/migrations/001_sistema_votaciones_completo.sql` ✅

### Backend
- `/backend/src/controllers/rondas.controller.js` ✅
- `/backend/src/controllers/postulaciones.controller.js` ✅
- `/backend/src/controllers/votaciones.controller.js` ✅ (actualizado)
- `/backend/src/routes/rondas.routes.js` ✅
- `/backend/src/routes/postulaciones.routes.js` ✅
- `/backend/src/routes/votaciones.routes.js` ✅ (actualizado)
- `/backend/src/server.js` ✅ (rutas registradas)

### Frontend (Pendiente)
- `/frontend/stores/rondasStore.js`
- `/frontend/stores/postulacionesStore.js`
- `/frontend/stores/votacionesStore.js` (actualizar)
- `/frontend/components/curador/PanelVotacion.jsx`
- `/frontend/components/curador/FichaPostulacion.jsx`
- `/frontend/components/curador/ControlVoto.jsx`
- `/frontend/components/admin/PanelRondas.jsx`
- `/frontend/components/admin/EstadisticasRonda.jsx`

---

## Próximos Pasos

1. **Crear stores Zustand** para consumir las APIs
2. **Implementar panel de curador** con todas las funcionalidades
3. **Implementar panel admin** para gestión de rondas
4. **Testing** completo del flujo
5. **Documentación de usuario** (manual para curadores y admins)

---

## Notas Importantes

- ✅ Sistema de **voto ciego** implementado
- ✅ **Orden aleatorio estable** por curador
- ✅ **Log inmutable** de todas las acciones
- ✅ **Validación de quórum** antes de cerrar ronda
- ✅ **Contadores separados 2D/3D**
- ✅ **Carryover entre fases** implementado
- ✅ Todos los **umbrales configurables** (no hardcodeados)
- ✅ **Regla de oro**: Denominador = quienes votaron esa postulación

---

**Fecha**: 2026-09-20
**Estado**: Backend completo, Frontend pendiente
