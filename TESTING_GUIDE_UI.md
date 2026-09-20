# Guía de Testing - Sistema de Votaciones por Rondas

## Estado de Implementación

### Backend (Completado)
- ✅ Migración de base de datos ejecutada en AWS RDS
- ✅ Controladores implementados (rondas, postulaciones, votaciones)
- ✅ Rutas API registradas en server.js
- ✅ Validaciones y voto ciego implementados
- ✅ Cálculos automáticos de resultados por ronda

### Frontend (Completado)
- ✅ Stores de Zustand actualizados (rondasStore, postulacionesStore, votacionesStore)
- ✅ API clients en lib/api.js
- ✅ Componentes del Panel de Curador:
  - PanelVotacionRondas.jsx
  - FichaPostulacion.jsx
  - ControlVotoRondas.jsx
- ✅ Componentes del Panel de Admin:
  - PanelAdminRondas.jsx
  - EstadisticasRonda.jsx

---

## Pruebas a Realizar

### 1. Verificar Backend

#### Test 1.1: Verificar Servidor
```bash
cd /Users/tonyprado/Documents/Proyectos/Benito-web/backend
npm start
```

Deberías ver:
```
🚀 Servidor corriendo en puerto 4000
✅ PostgreSQL conectado exitosamente
```

#### Test 1.2: Health Check
```bash
curl http://localhost:4000/health
```

Respuesta esperada:
```json
{
  "status": "OK",
  "message": "ARTEFACT API is running",
  "timestamp": "2024-XX-XX..."
}
```

#### Test 1.3: Verificar Tablas de Base de Datos
```bash
# Conectar a AWS RDS
psql "postgresql://[user]:[pass]@[host]/artefact_db"

# Verificar que las tablas existen
\dt

# Deberías ver:
# - rondas
# - postulaciones
# - votaciones (modificada)
# - obras (modificada)
# - justificaciones
# - seleccion_piezas
# - log_votaciones
```

### 2. Testing de API Endpoints

#### Test 2.1: Crear Ronda (Admin)
```bash
# Primero autenticarse como admin
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "tu_password"}'

# Guardar el token que devuelve

# Crear ronda
curl -X POST http://localhost:4000/api/rondas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [TU_TOKEN]" \
  -d '{
    "fase_id": 1,
    "numero": 1,
    "votos_asignados": null
  }'
```

#### Test 2.2: Listar Rondas de una Fase
```bash
curl http://localhost:4000/api/rondas/fase/1 \
  -H "Authorization: Bearer [TU_TOKEN]"
```

#### Test 2.3: Abrir Ronda (Admin)
```bash
curl -X POST http://localhost:4000/api/rondas/[RONDA_ID]/abrir \
  -H "Authorization: Bearer [TU_TOKEN]"
```

#### Test 2.4: Obtener Postulaciones para Votar (Curador)
```bash
# Autenticarse como curador
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "curador@example.com", "password": "password"}'

# Obtener postulaciones
curl http://localhost:4000/api/postulaciones/para-votar/[FASE_ID]/[RONDA_ID] \
  -H "Authorization: Bearer [TU_TOKEN_CURADOR]"
```

#### Test 2.5: Crear Votación (Curador)
```bash
# Ronda 1: valor puede ser 0, 1, o 2
curl -X POST http://localhost:4000/api/votaciones \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [TU_TOKEN_CURADOR]" \
  -d '{
    "postulacion_id": 1,
    "ronda_id": 1,
    "valor": 2,
    "comentario": "Excelente trabajo",
    "conoce_artista": false
  }'
```

#### Test 2.6: Obtener Progreso en Ronda
```bash
curl http://localhost:4000/api/votaciones/progreso/[RONDA_ID] \
  -H "Authorization: Bearer [TU_TOKEN_CURADOR]"
```

#### Test 2.7: Cerrar Ronda (Admin)
```bash
curl -X POST http://localhost:4000/api/rondas/[RONDA_ID]/cerrar \
  -H "Authorization: Bearer [TU_TOKEN_ADMIN]"
```

Debería:
- Verificar quórum
- Calcular resultados automáticamente
- Actualizar estados de postulaciones
- Devolver estadísticas

#### Test 2.8: Ver Resultados (Admin o Ronda Cerrada)
```bash
curl http://localhost:4000/api/votaciones/resultados/[RONDA_ID] \
  -H "Authorization: Bearer [TU_TOKEN]"
```

### 3. Testing de Frontend

#### Test 3.1: Iniciar Frontend
```bash
cd /Users/tonyprado/Documents/Proyectos/Benito-web/frontend
npm run dev
```

#### Test 3.2: Verificar Componentes de Curador
1. Iniciar sesión como curador
2. Navegar a la sección de votaciones
3. Verificar que aparece el componente `PanelVotacionRondas`
4. Debe mostrar:
   - Header con info de ronda actual
   - Progreso (X/Y postulaciones votadas)
   - Filtros (estado, tipo, disciplina)
   - Grid de tarjetas de postulaciones
   - Badge "Votado" en las ya revisadas

#### Test 3.3: Verificar Flujo de Votación
1. Click en una tarjeta de postulación
2. Se abre modal `FichaPostulacion`
3. Verificar:
   - Visor de obras con galería
   - Información del artista
   - Componente de votación adaptado a la ronda
   - Checkbox "Conozco a este artista"
   - Campo de comentario
4. Seleccionar voto y guardar
5. Modal se cierra
6. La tarjeta ahora muestra badge "Votado"
7. Contador de progreso se actualiza

#### Test 3.4: Verificar Controles por Ronda

**Ronda 1 - Cribado:**
- 3 botones: No (rojo), Tal vez (amarillo), Sí (verde)
- Sin límite de votos

**Ronda 2 - Votos Limitados:**
- 1 botón toggle: "Votar por este artista"
- Contador visible: "Te quedan N votos"
- Al agotar votos, no permite más

**Ronda 3 - Deliberación:**
- 2 botones: No (rojo), Sí (verde)
- Sin límite de votos

#### Test 3.5: Verificar Panel de Admin
1. Iniciar sesión como admin
2. Navegar a gestión de rondas
3. Verificar componente `PanelAdminRondas`
4. Debe mostrar:
   - Configuración de la fase (quorum, cupos, umbrales)
   - Tabla de rondas con estados
   - Botones: Crear Ronda, Abrir, Cerrar, Ver Estadísticas
5. Crear nueva ronda
6. Abrir ronda (debe cerrar otras automáticamente)
7. Ver estadísticas:
   - Modal con `EstadisticasRonda`
   - Participación de curadores
   - Tabla de quién votó y quién no
   - Para ronda cerrada: resultados por postulación

### 4. Tests de Flujo Completo

#### Test 4.1: Ronda 1 Completa
1. Admin crea Ronda 1
2. Admin abre Ronda 1
3. 6 curadores votan (Sí/Tal vez/No) por todas las postulaciones
4. Admin cierra Ronda 1
5. Verificar que se calculó `indice_r1` correctamente
6. Verificar estados resultantes:
   - `indice_r1 >= 0.60` → shortlist
   - `0.30 <= indice_r1 < 0.60` → reserva
   - `indice_r1 < 0.30` → no_continua

#### Test 4.2: Ronda 2 Completa
1. Admin crea Ronda 2 con votos_asignados=10
2. Admin abre Ronda 2
3. Curadores ven solo las postulaciones en "shortlist"
4. Cada curador vota por máximo 10 postulaciones
5. Sistema impide votar más de 10
6. Admin cierra Ronda 2
7. Verificar que se calculó `respaldo_r2` correctamente
8. Verificar estados resultantes:
   - `respaldo_r2 >= 0.80` → seleccionada
   - `0.50 <= respaldo_r2 < 0.80` → deliberacion
   - `respaldo_r2 < 0.50` → no_continua

#### Test 4.3: Ronda 3 Completa
1. Admin crea Ronda 3
2. Admin abre Ronda 3
3. Curadores ven solo las postulaciones en "deliberacion"
4. Curadores votan Sí/No
5. Admin cierra Ronda 3
6. Verificar que se calculó `aprobacion_r3`
7. Verificar selección final:
   - Se toman las mejores hasta llenar cupo_2d
   - Orden: respaldo_r2 DESC, indice_r1 DESC

#### Test 4.4: Voto Ciego
1. Con ronda abierta, curador intenta ver resultados
2. Debe recibir error 403: "No se pueden ver los resultados de una ronda abierta"
3. Admin puede ver resultados incluso con ronda abierta
4. Al cerrar ronda, todos pueden ver resultados

---

## Checklist de Funcionalidades

### Core Features
- [ ] Crear rondas por fase
- [ ] Abrir/cerrar rondas
- [ ] Sistema de voto ciego (resultados ocultos mientras está abierta)
- [ ] Orden aleatorio estable por curador
- [ ] Límite de votos en Ronda 2
- [ ] Cálculos automáticos al cerrar ronda
- [ ] Transiciones de estado automáticas

### Validaciones
- [ ] Solo una ronda abierta a la vez por fase
- [ ] Valores de voto correctos por ronda (0/1/2 para R1, 1 para R2, 0/1 para R3)
- [ ] Verificar quórum antes de cerrar
- [ ] No permitir votar en ronda cerrada
- [ ] No permitir más votos que el límite en R2

### UI/UX
- [ ] Diseño coherente con el sistema global
- [ ] Sin emojis (como solicitado)
- [ ] Filtros funcionales
- [ ] Progreso visible
- [ ] Feedback claro de acciones
- [ ] Confirmaciones para acciones destructivas
- [ ] Estados de carga
- [ ] Manejo de errores

---

## Posibles Problemas y Soluciones

### Problema 1: No aparecen las postulaciones
**Causa:** No hay postulaciones en estado correcto para la ronda
**Solución:**
- Ronda 1: requiere postulaciones en estado "admitida"
- Ronda 2: requiere postulaciones en estado "shortlist"
- Ronda 3: requiere postulaciones en estado "deliberacion"

### Problema 2: No se puede cerrar la ronda
**Causa:** No se alcanzó el quórum mínimo
**Solución:** Verificar que `config.quorum` curadores hayan votado

### Problema 3: No se ven los resultados
**Causa:** Sistema de voto ciego activo
**Solución:**
- Si eres curador y la ronda está abierta: esperar a que se cierre
- Si eres admin: deberías poder verlos siempre

### Problema 4: Error al crear votación
**Causa:** Valor de voto incorrecto para la ronda
**Solución:**
- R1: usar 0, 1, o 2
- R2: usar 1
- R3: usar 0 o 1

---

## Próximos Pasos (Opcional)

### Funcionalidades Adicionales (No Implementadas Aún)
1. **Concurso de Cortesía**
   - Nominaciones de curadores
   - Selección de piezas

2. **Gestión de Postulaciones (Admin)**
   - Mover de reserva a shortlist manualmente
   - Vista de todas las postulaciones por estado

3. **Exportar Resultados**
   - PDF con resultados finales
   - Excel con estadísticas

4. **Notificaciones**
   - Email cuando se abre una ronda
   - Recordatorios de votación pendiente

---

## Documentación de Referencia

- `SISTEMA_VOTACIONES_README.md` - Documentación técnica completa
- `IMPLEMENTACION_COMPLETADA.md` - Estado de implementación
- `TESTING_SISTEMA_VOTACIONES.md` - Tests de backend
- `VERIFICACION_FLUJO_VOTACIONES.md` - Verificación del flujo correcto
- `panel_votaciones.pdf` - Especificación original

---

## Contacto y Soporte

Si encuentras algún problema durante las pruebas, verifica:
1. Logs del backend (consola donde corre npm start)
2. Logs del frontend (consola del navegador)
3. Respuestas de la API (Network tab en DevTools)
4. Estado de la base de datos (psql queries)

Todos los cálculos y flujos han sido verificados contra la especificación original.
