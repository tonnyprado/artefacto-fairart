# Sistema de Votaciones - Implementación Completada

## ✅ Completado (Backend + Infraestructura Frontend)

### 1. Base de Datos PostgreSQL en AWS ✅

**Archivo**: `/database/migrations/001_sistema_votaciones_completo.sql`

**Tablas Nuevas:**
- `postulaciones` - Postulaciones con ciclo de vida completo
- `rondas` - Rondas 1, 2, 3 por fase
- `justificaciones` - Justificaciones de curadores
- `seleccion_piezas` - Para concurso de cortesía
- `log_votaciones` - Log inmutable de acciones

**Modificaciones:**
- `fases` → +`config_json` (parámetros configurables)
- `votaciones` → +`ronda_id`, `postulacion_id`, `valor`, `conoce_artista`
- `obras` → +`postulacion_id`, medidas

**Funciones SQL:**
- `calcular_indice_r1()`
- `calcular_respaldo_r2()`
- `calcular_aprobacion_r3()`

**Vista:**
- `v_postulaciones_metricas` - Con todas las métricas

✅ **Migración ejecutada exitosamente en AWS RDS**

---

### 2. Controladores Backend ✅

**Archivo**: `/backend/src/controllers/rondas.controller.js`

Funciones implementadas:
- `getRondasPorFase` - Listar rondas de una fase
- `getRonda` - Ver ronda específica
- `createRonda` - Crear ronda (admin)
- `abrirRonda` - Abrir para votación (admin)
- `cerrarRonda` - Cerrar y calcular resultados automáticamente (admin)
- `getEstadisticasRonda` - Ver quién ha votado
- `deleteRonda` - Eliminar si no tiene votos (admin)

**Lógica de cierre**:
- Verifica quórum mínimo
- Calcula índices/respaldos según fórmulas
- Actualiza estados de postulaciones según umbrales
- Log inmutable de todo

---

**Archivo**: `/backend/src/controllers/postulaciones.controller.js`

Funciones implementadas:
- `getPostulaciones` - Listar con filtros
- `getPostulacion` - Ver detalle + obras + votos
- `createPostulacion` - Crear (admin)
- `updatePostulacion` - Actualizar (admin)
- `moverAShortlist` - Rescatar de reserva (admin)
- `getPostulacionesParaVotacion` - **Orden aleatorio estable por curador**
- `deletePostulacion` - Eliminar si no tiene votos (admin)

**Características especiales**:
- Orden aleatorio estable (semilla = curador_id + ronda_id)
- Incluye badge de carryover automáticamente

---

**Archivo**: `/backend/src/controllers/votaciones.controller.js` (Actualizado)

Funciones implementadas:
- `createOrUpdateVotacion` - Crear o actualizar voto con validaciones por ronda
- `getMisVotaciones` - Votos del curador autenticado
- `getResultadosRonda` - Resultados (SOLO si ronda cerrada o es admin) ← **VOTO CIEGO**
- `getProgresoRonda` - Progreso del curador en una ronda
- `getEstadisticasCurador` - Estadísticas personales
- `deleteVotacion` - Eliminar (solo si ronda abierta)

**Validaciones por ronda**:
- **Ronda 1**: valor debe ser 0, 1 o 2 (No, Tal vez, Sí)
- **Ronda 2**: valor debe ser 1, con límite configurable (ej: 10 votos)
- **Ronda 3**: valor debe ser 0 o 1 (No, Sí)

**Voto Ciego**: Los resultados NO se pueden ver mientras la ronda está abierta (excepto admin)

---

### 3. Rutas API ✅

**Archivo**: `/backend/src/routes/rondas.routes.js`

```
GET    /api/rondas/fase/:fase_id
GET    /api/rondas/:id
GET    /api/rondas/:id/estadisticas
POST   /api/rondas                        (admin)
POST   /api/rondas/:id/abrir              (admin)
POST   /api/rondas/:id/cerrar             (admin)
DELETE /api/rondas/:id                    (admin)
```

---

**Archivo**: `/backend/src/routes/postulaciones.routes.js`

```
GET    /api/postulaciones
GET    /api/postulaciones/:id
GET    /api/postulaciones/fase/:fase_id/para-votacion  (curador)
POST   /api/postulaciones                 (admin)
PUT    /api/postulaciones/:id             (admin)
POST   /api/postulaciones/:id/mover-a-shortlist  (admin)
DELETE /api/postulaciones/:id             (admin)
```

---

**Archivo**: `/backend/src/routes/votaciones.routes.js` (Actualizado)

```
POST   /api/votaciones
PUT    /api/votaciones/:id
GET    /api/votaciones/mis-votos
GET    /api/votaciones/estadisticas
GET    /api/votaciones/ronda/:ronda_id/progreso
GET    /api/votaciones/ronda/:ronda_id/resultados  (cerrada o admin)
DELETE /api/votaciones/:id
```

✅ **Rutas registradas en** `/backend/src/server.js`

---

### 4. Frontend - API Clients ✅

**Archivo**: `/frontend/lib/api.js` (Actualizado)

**Nuevo**: `rondasApi`
```javascript
rondasApi.getByFase(faseId)
rondasApi.getById(id)
rondasApi.getEstadisticas(id)
rondasApi.create(data)      // admin
rondasApi.abrir(id)         // admin
rondasApi.cerrar(id)        // admin
rondasApi.delete(id)        // admin
```

**Nuevo**: `postulacionesApi`
```javascript
postulacionesApi.getAll(params)
postulacionesApi.getById(id)
postulacionesApi.getParaVotacion(faseId, rondaId)
postulacionesApi.create(data)
postulacionesApi.update(id, data)
postulacionesApi.moverAShortlist(id)
postulacionesApi.delete(id)
```

**Actualizado**: `votacionesApi`
```javascript
votacionesApi.create(data)
votacionesApi.update(id, data)
votacionesApi.getMisVotos(params)
votacionesApi.getEstadisticas(params)
votacionesApi.getProgreso(rondaId)
votacionesApi.getResultadosRonda(rondaId)
votacionesApi.getResultados(faseId)
votacionesApi.verificarVoto(faseId, artistaId, rondaId)
votacionesApi.delete(id)
```

---

### 5. Frontend - Stores Zustand ✅

**Archivo**: `/frontend/stores/rondasStore.js`

```javascript
useRondasStore:
  - fetchRondasPorFase(faseId)
  - fetchRonda(id)
  - getRondaAbierta(faseId)
  - fetchEstadisticas(id)
  - createRonda(data)         // admin
  - abrirRonda(id)            // admin
  - cerrarRonda(id)           // admin
  - deleteRonda(id)           // admin
  - clearError()
  - clear()
```

---

**Archivo**: `/frontend/stores/postulacionesStore.js`

```javascript
usePostulacionesStore:
  - fetchPostulaciones(params)
  - fetchPostulacion(id)
  - fetchPostulacionesParaVotar(faseId, rondaId)
  - createPostulacion(data)      // admin
  - updatePostulacion(id, data)  // admin
  - moverAShortlist(id)          // admin
  - deletePostulacion(id)        // admin
  - getEstadisticasLocales()
  - clearError()
  - clear()
```

---

## 📋 Pendiente (Componentes UI)

### 1. Panel de Votación - Curador

Componentes necesarios:

**`/frontend/components/curador/PanelVotacion.jsx`**
- Lista de postulaciones en orden aleatorio estable
- Filtros: sin votar, votadas, 2D/3D, disciplina
- Indicador de progreso "18 de 38 revisadas"
- Para R2: "Te quedan N votos"

**`/frontend/components/curador/FichaPostulacion.jsx`**
- Visor de obra con zoom y pantalla completa
- Medida siempre visible junto a la imagen
- Portfolio (10-15 imágenes) en la misma vista
- Ficha técnica completa, CV, notas

**`/frontend/components/curador/ControlVoto.jsx`**
- **Ronda 1**: 3 botones (No / Tal vez / Sí)
- **Ronda 2**: Botón único "Votar" + contador de votos restantes
- **Ronda 3**: 2 botones (No / Sí)
- Checkbox "Conozco a este artista" (opcional)
- Campo de comentario (opcional)

**`/frontend/components/curador/FormularioJustificacion.jsx`**
- Al cerrar fase (opcional, no bloquea envío)
- 3 campos: perfil de seleccionados, líneas temáticas, observaciones

---

### 2. Panel Admin - Gestión de Rondas

Componentes necesarios:

**`/frontend/components/admin/PanelRondas.jsx`**
- Lista de rondas por fase
- Botones: Abrir / Cerrar ronda
- Crear nueva ronda
- Ver estadísticas

**`/frontend/components/admin/EstadisticasRonda.jsx`**
- Lista de curadores con estado: ha votado / no ha votado
- Total de votos emitidos
- Vista en vivo: "Con el umbral actual pasan N postulaciones"
- Ajustar umbral dinámicamente
- Exportar resultados (CSV + PDF)

**`/frontend/components/admin/GestionPostulaciones.jsx`**
- Ver postulaciones por estado
- Mover manualmente de reserva a shortlist
- Contadores 2D/3D en vivo
- Gráficas de distribución

**`/frontend/components/admin/ResultadosRonda.jsx`**
- Tabla de resultados ordenados
- Votos individuales de cada curador
- Desglose de "Conozco al artista"

---

## 🧪 Testing Requerido

### Backend

1. **Crear ronda y abrir**
```bash
curl -X POST http://localhost:4000/api/rondas \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"fase_id": 1, "numero": 1, "votos_asignados": null}'

curl -X POST http://localhost:4000/api/rondas/1/abrir \
  -H "Authorization: Bearer <admin_token>"
```

2. **Votar en Ronda 1**
```bash
curl -X POST http://localhost:4000/api/votaciones \
  -H "Authorization: Bearer <curador_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "postulacion_id": 1,
    "ronda_id": 1,
    "valor": 2,
    "comentario": "Excelente trabajo",
    "conoce_artista": false
  }'
```

3. **Verificar voto ciego (debe fallar si ronda abierta)**
```bash
curl http://localhost:4000/api/votaciones/ronda/1/resultados \
  -H "Authorization: Bearer <curador_token>"
# Debe devolver 403
```

4. **Cerrar ronda y ver resultados**
```bash
curl -X POST http://localhost:4000/api/rondas/1/cerrar \
  -H "Authorization: Bearer <admin_token>"

# Ahora sí debe funcionar
curl http://localhost:4000/api/votaciones/ronda/1/resultados \
  -H "Authorization: Bearer <curador_token>"
```

5. **Verificar cálculos automáticos**
- Ver que las postulaciones se movieron a shortlist/reserva/no_continua
- Verificar que `indice_r1` se calculó correctamente

### Frontend

1. **Login como curador**
2. **Ver panel de votación con postulaciones en orden aleatorio**
3. **Votar en Ronda 1 (3 opciones)**
4. **Intentar ver resultados → debe estar bloqueado**
5. **Admin cierra ronda**
6. **Ahora sí ver resultados**
7. **Abrir Ronda 2**
8. **Votar con límite de 10 votos → contador debe actualizarse**
9. **Intentar votar más de 10 → debe dar error**

---

## 📝 Documentación

### Configuración de Fase (config_json)

```json
{
  "curadores": 6,
  "quorum": 5,
  "cupo_2d": 8,
  "cupo_3d": null,
  "umbral_r1": 0.60,
  "umbral_reserva": 0.30,
  "votos_r2": 10,
  "umbral_consenso": 0.80,
  "umbral_delib": 0.50,
  "cortesia_max": 4,
  "piezas_cortesia_min": 1,
  "piezas_cortesia_max": 3
}
```

### Fórmulas

**Ronda 1 - Índice de Respaldo**
```
indice = suma(valores) / (2 * numero_de_votos_emitidos)

Valores: Sí=2, Tal vez=1, No=0
Ejemplo: (2+2+1+0+2) / (2*5) = 7/10 = 0.70
```

**Ronda 2 - Respaldo**
```
respaldo = curadores_que_votaron_al_artista / curadores_que_votaron_en_la_ronda

Ejemplo: 5 de 6 curadores = 5/6 = 0.8333
```

**Ronda 3 - Aprobación + Ranking**
```
aprobacion = votos_si / votos_emitidos

Luego se ordenan por:
1. respaldo_r2 DESC
2. indice_r1 DESC

Se toman hasta llenar cupo
```

---

## 🚀 Próximos Pasos

1. **Crear componentes UI** (panel curador + panel admin)
2. **Implementar navegación** entre rondas
3. **Testing end-to-end** completo
4. **Deployment** a producción
5. **Manual de usuario** para curadores

---

**Fecha**: 2026-09-20
**Estado**: Backend ✅ | API Clients ✅ | Stores ✅ | UI Pendiente
**Estimación UI**: 2-3 días de desarrollo
