# Testing del Sistema de Votaciones

## Preparación

### 1. Iniciar el servidor backend
```bash
cd backend
npm run dev
```

### 2. Variables de entorno
Asegurarse de que el archivo `.env` tiene configurado:
- `DATABASE_URL` apuntando a AWS RDS
- `JWT_SECRET` configurado

---

## Tests a Ejecutar

### Test 1: Verificar Migración de BD

```bash
# Conectarse a la BD y verificar tablas
export PGPASSWORD='150599Ph$'
psql -h database-1.c92k2sa2ka4j.us-east-2.rds.amazonaws.com -U postgres -d postgres

# En psql:
\dt  # Ver tablas (debe mostrar postulaciones, rondas, etc.)
\d postulaciones  # Ver estructura
\d rondas
\d votaciones  # Debe tener ronda_id, postulacion_id, valor, conoce_artista
SELECT * FROM fases LIMIT 1;  # Ver config_json
```

**Resultado esperado**:
- Todas las tablas nuevas existen
- `fases.config_json` tiene el objeto JSON con configuraciones
- `votaciones` tiene las nuevas columnas

---

### Test 2: Login y obtener tokens

```bash
# Login como admin
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@arte-facto.mx",
    "password": "tu_password_admin"
  }'

# Guardar el token que devuelve
export ADMIN_TOKEN="<token_aqui>"

# Login como curador
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "curador@arte-facto.mx",
    "password": "tu_password_curador"
  }'

# Guardar el token
export CURADOR_TOKEN="<token_aqui>"
```

**Resultado esperado**:
- Ambos logins exitosos
- Se reciben tokens JWT válidos

---

### Test 3: Crear Ronda (Admin)

```bash
# Obtener ID de una fase existente
curl http://localhost:4000/api/fases \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Crear Ronda 1 para esa fase (ejemplo: fase_id = 1)
curl -X POST http://localhost:4000/api/rondas \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fase_id": 1,
    "numero": 1,
    "votos_asignados": null
  }'
```

**Resultado esperado**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "fase_id": 1,
    "numero": 1,
    "estado": "cerrada",
    "votos_asignados": null,
    "...": "..."
  },
  "message": "Ronda creada exitosamente"
}
```

---

### Test 4: Abrir Ronda (Admin)

```bash
# Abrir la ronda que acabamos de crear
curl -X POST http://localhost:4000/api/rondas/1/abrir \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Resultado esperado**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "estado": "abierta",
    "fecha_apertura": "2026-09-20T...",
    "...": "..."
  },
  "message": "Ronda 1 abierta exitosamente"
}
```

---

### Test 5: Crear Postulación (Admin)

```bash
# Obtener un artista existente
curl http://localhost:4000/api/artistas \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Crear postulación
curl -X POST http://localhost:4000/api/postulaciones \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fase_origen_id": 1,
    "artista_id": 1,
    "disciplina": "Pintura",
    "tipo": "2d"
  }'
```

**Resultado esperado**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "artista_id": 1,
    "estado": "admitida",
    "tipo": "2d",
    "...": "..."
  }
}
```

---

### Test 6: Ver Postulaciones para Votar (Curador)

```bash
curl "http://localhost:4000/api/postulaciones/fase/1/para-votacion?ronda_id=1" \
  -H "Authorization: Bearer $CURADOR_TOKEN"
```

**Resultado esperado**:
- Lista de postulaciones en orden aleatorio estable
- Cada postulación tiene `ya_votado: false`
- Incluye información del artista y obras

---

### Test 7: Votar en Ronda 1 (Curador)

```bash
# Votar Sí (valor=2)
curl -X POST http://localhost:4000/api/votaciones \
  -H "Authorization: Bearer $CURADOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "postulacion_id": 1,
    "ronda_id": 1,
    "valor": 2,
    "comentario": "Excelente propuesta artística",
    "conoce_artista": false
  }'
```

**Resultado esperado**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "curador_id": 1,
    "postulacion_id": 1,
    "ronda_id": 1,
    "valor": 2,
    "comentario": "Excelente propuesta artística",
    "conoce_artista": false
  },
  "message": "Voto registrado exitosamente"
}
```

---

### Test 8: Verificar Voto Ciego (Curador NO debe ver resultados)

```bash
curl http://localhost:4000/api/votaciones/ronda/1/resultados \
  -H "Authorization: Bearer $CURADOR_TOKEN"
```

**Resultado esperado**:
```json
{
  "success": false,
  "error": "No se pueden ver los resultados de una ronda abierta"
}
```
✅ **VOTO CIEGO FUNCIONANDO**

---

### Test 9: Admin SÍ puede ver resultados de ronda abierta

```bash
curl http://localhost:4000/api/votaciones/ronda/1/resultados \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Resultado esperado**:
- Muestra resultados parciales
- Incluye distribución de votos

---

### Test 10: Ver Progreso del Curador

```bash
curl http://localhost:4000/api/votaciones/ronda/1/progreso \
  -H "Authorization: Bearer $CURADOR_TOKEN"
```

**Resultado esperado**:
```json
{
  "success": true,
  "data": {
    "total_postulaciones": 10,
    "total_votadas": 1,
    "max_votos_r2": null,
    "votos_restantes_r2": null
  }
}
```

---

### Test 11: Cerrar Ronda y Calcular Resultados (Admin)

```bash
# Primero, hacer que más curadores voten para tener datos significativos
# ... (repetir Test 7 con diferentes curadores)

# Cerrar la ronda
curl -X POST http://localhost:4000/api/rondas/1/cerrar \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Resultado esperado**:
```json
{
  "success": true,
  "message": "Ronda 1 cerrada exitosamente",
  "data": {
    "total_votantes": 5,
    "quorum_requerido": 5
  }
}
```

**Verificar en la BD**:
```sql
SELECT id, estado, indice_r1 FROM postulaciones WHERE fase_actual_id = 1;
```

Debe mostrar:
- Postulaciones con `indice_r1` calculado
- Estados actualizados: `shortlist`, `reserva`, `no_continua`

---

### Test 12: Ahora SÍ ver resultados (Ronda Cerrada)

```bash
curl http://localhost:4000/api/votaciones/ronda/1/resultados \
  -H "Authorization: Bearer $CURADOR_TOKEN"
```

**Resultado esperado**:
- Muestra resultados completos
- Incluye votos individuales de cada curador
- Muestra quién marcó "Conozco al artista"

---

### Test 13: Crear y Abrir Ronda 2

```bash
# Crear Ronda 2
curl -X POST http://localhost:4000/api/rondas \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fase_id": 1,
    "numero": 2,
    "votos_asignados": 10
  }'

# Abrir Ronda 2
curl -X POST http://localhost:4000/api/rondas/2/abrir \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

### Test 14: Votar en Ronda 2 (con límite)

```bash
# Votar por 10 postulaciones
for i in {1..10}; do
  curl -X POST http://localhost:4000/api/votaciones \
    -H "Authorization: Bearer $CURADOR_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"postulacion_id\": $i,
      \"ronda_id\": 2,
      \"valor\": 1,
      \"comentario\": \"Voto R2 $i\"
    }"
  sleep 0.5
done

# Intentar votar el 11vo (debe fallar)
curl -X POST http://localhost:4000/api/votaciones \
  -H "Authorization: Bearer $CURADOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "postulacion_id": 11,
    "ronda_id": 2,
    "valor": 1
  }'
```

**Resultado esperado (voto 11)**:
```json
{
  "success": false,
  "error": "Has alcanzado el límite de 10 votos para esta ronda",
  "total_votos": 10,
  "max_votos": 10
}
```

---

### Test 15: Validación de Valores por Ronda

**Ronda 1 - Solo permite 0, 1, 2**:
```bash
curl -X POST http://localhost:4000/api/votaciones \
  -H "Authorization: Bearer $CURADOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "postulacion_id": 1,
    "ronda_id": 1,
    "valor": 3
  }'
```

**Resultado esperado**:
```json
{
  "success": false,
  "error": "En Ronda 1, el valor debe ser: 0=No, 1=Tal vez, 2=Sí"
}
```

**Ronda 2 - Solo permite 1**:
```bash
curl -X POST http://localhost:4000/api/votaciones \
  -H "Authorization: Bearer $CURADOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "postulacion_id": 1,
    "ronda_id": 2,
    "valor": 0
  }'
```

**Resultado esperado**:
```json
{
  "success": false,
  "error": "En Ronda 2, el valor debe ser: 1=voto"
}
```

---

### Test 16: Log Inmutable

```sql
-- En la BD
SELECT * FROM log_votaciones ORDER BY created_at DESC LIMIT 20;
```

**Resultado esperado**:
- Registro de todas las acciones: `voto_creado`, `voto_actualizado`, `ronda_abierta`, `ronda_cerrada`, etc.
- Con `valor_anterior` y `valor_nuevo` en JSON

---

### Test 17: Estadísticas de Ronda (Admin)

```bash
curl http://localhost:4000/api/rondas/1/estadisticas \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Resultado esperado**:
```json
{
  "success": true,
  "data": {
    "ronda": { "...": "..." },
    "estadisticas": {
      "total_curadores_votaron": 5,
      "total_postulaciones_votadas": 15,
      "total_votos": 75,
      "votos_con_conoce_artista": 3
    },
    "curadores": [
      {
        "id": 1,
        "nombre": "Curador 1",
        "email": "curador1@...",
        "total_votos": 15,
        "primer_voto": "2026-09-20T...",
        "ultimo_voto": "2026-09-20T..."
      }
    ]
  }
}
```

---

## Checklist de Funcionalidades

- ✅ Crear rondas
- ✅ Abrir rondas (solo una a la vez)
- ✅ Cerrar rondas con validación de quórum
- ✅ Cálculo automático de índices al cerrar
- ✅ Voto ciego (curadores no ven resultados de ronda abierta)
- ✅ Admin puede ver resultados en cualquier momento
- ✅ Validación de valores por ronda
- ✅ Límite de votos en Ronda 2
- ✅ Orden aleatorio estable por curador
- ✅ Marca "Conozco al artista"
- ✅ Comentarios opcionales
- ✅ Log inmutable de acciones
- ✅ Estadísticas por ronda
- ✅ Progreso del curador

---

## Tests de BD

```sql
-- Ver configuración de fase
SELECT id, nombre, config_json FROM fases WHERE id = 1;

-- Ver postulaciones con métricas
SELECT * FROM v_postulaciones_metricas WHERE fase_actual_id = 1;

-- Ver distribución de votos Ronda 1
SELECT
  p.id,
  a.nombre,
  COUNT(CASE WHEN v.valor = 2 THEN 1 END) as votos_si,
  COUNT(CASE WHEN v.valor = 1 THEN 1 END) as votos_tal_vez,
  COUNT(CASE WHEN v.valor = 0 THEN 1 END) as votos_no,
  p.indice_r1,
  p.estado
FROM postulaciones p
JOIN artistas a ON a.id = p.artista_id
LEFT JOIN votaciones v ON v.postulacion_id = p.id AND v.ronda_id = 1
WHERE p.fase_actual_id = 1
GROUP BY p.id, a.nombre, p.indice_r1, p.estado;

-- Verificar que el cálculo es correcto
-- Ejemplo: Si un artista tiene 3 Sí (2), 1 Tal vez (1), 0 No (0)
-- Suma = 2+2+2+1 = 7
-- Índice = 7 / (2 * 4) = 7/8 = 0.875
```

---

## Siguiente: Frontend

Una vez que todos estos tests pasen ✅, continuar con la implementación de los componentes UI.
