# 📋 Instrucciones: Configurar PostgreSQL para el sistema de registro

## ⚠️ IMPORTANTE: Ejecuta esto ANTES de probar el registro

El sistema necesita que exista **al menos una fase con inscripciones abiertas** para funcionar.

---

## 🔧 Paso 1: Conectar a Railway PostgreSQL

### Opción A: Desde la web de Railway

1. Ve a Railway.app
2. Entra a tu proyecto
3. Click en el servicio PostgreSQL
4. Click en **"Data"** → **"Query"**
5. Pega y ejecuta las queries

### Opción B: Desde terminal con psql

```bash
# Railway te da esta URL en las variables de entorno
psql "postgresql://usuario:password@host:puerto/database"
```

---

## 🚀 Paso 2: Ejecutar el script de configuración

Copia y pega TODO el contenido del archivo:
```
backend/SETUP_FASES_ACTIVAS.sql
```

O ejecuta estas queries en orden:

### 1️⃣ Verificar que las tablas existen

```sql
-- Verificar artistas_fases
SELECT
  CASE
    WHEN EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_name = 'artistas_fases'
    ) THEN '✅ Tabla artistas_fases existe'
    ELSE '❌ ERROR: Tabla NO existe'
  END as status;
```

Si dice **❌ ERROR**, necesitas correr las migraciones primero:

```bash
cd backend
npm run migrate
```

### 2️⃣ Ver si hay fases activas

```sql
SELECT id, nombre, inscripciones_abiertas
FROM fases
ORDER BY created_at DESC;
```

**Si NO hay resultados o todas tienen `inscripciones_abiertas = false`**, continúa al paso 3.

### 3️⃣ Crear edición y fase activa

```sql
-- Crear edición 2027 si no existe
INSERT INTO ediciones (nombre, anio, descripcion, fecha_inicio, fecha_fin, activa)
SELECT
  'ARTEFACT 2027',
  2027,
  'Primera edición de ARTEFACT',
  '2027-01-15 00:00:00',
  '2027-03-31 23:59:59',
  true
WHERE NOT EXISTS (SELECT 1 FROM ediciones WHERE anio = 2027);

-- Crear Fase 1 con inscripciones ABIERTAS
INSERT INTO fases (
  nombre,
  edicion_id,
  numero_fase,
  inscripciones_abiertas,
  votaciones_abiertas,
  finalizada,
  fecha_inicio_inscripciones,
  fecha_fin_inscripciones
)
SELECT
  'Fase 1 - Registro de Artistas',
  (SELECT id FROM ediciones WHERE anio = 2027 LIMIT 1),
  1,
  true,  -- ✅ INSCRIPCIONES ABIERTAS
  false,
  false,
  NOW(),
  NOW() + INTERVAL '30 days'
WHERE NOT EXISTS (
  SELECT 1 FROM fases WHERE nombre = 'Fase 1 - Registro de Artistas'
);
```

### 4️⃣ Verificar que funcionó

```sql
SELECT
  f.id,
  f.nombre,
  f.inscripciones_abiertas,
  e.nombre as edicion
FROM fases f
LEFT JOIN ediciones e ON e.id = f.edicion_id
WHERE f.inscripciones_abiertas = true;
```

Deberías ver algo como:

```
 id |            nombre             | inscripciones_abiertas |    edicion
----+-------------------------------+------------------------+----------------
  1 | Fase 1 - Registro de Artistas | true                   | ARTEFACT 2027
```

### 5️⃣ Si ya tienes artistas sin fase asignada

Si registraste artistas ANTES de crear la fase, asígnalos ahora:

```sql
-- Ver artistas sin fase
SELECT
  a.id,
  a.nombre,
  a.apellido,
  a.email
FROM artistas a
LEFT JOIN artistas_fases af ON af.artista_id = a.id
WHERE af.id IS NULL;

-- Asignarlos a la fase activa
INSERT INTO artistas_fases (artista_id, fase_id, seleccionado)
SELECT
  a.id,
  (SELECT id FROM fases WHERE inscripciones_abiertas = true LIMIT 1),
  false
FROM artistas a
LEFT JOIN artistas_fases af ON af.artista_id = a.id
WHERE af.id IS NULL
ON CONFLICT (artista_id, fase_id) DO NOTHING;
```

---

## ✅ Paso 3: Verificar el resumen

```sql
SELECT
  'Total de artistas' as metrica,
  COUNT(*) as valor
FROM artistas
UNION ALL
SELECT
  'Artistas pendientes',
  COUNT(*)
FROM artistas
WHERE estado_registro = 'pendiente'
UNION ALL
SELECT
  'Fases activas',
  COUNT(*)
FROM fases
WHERE inscripciones_abiertas = true
UNION ALL
SELECT
  'Artistas inscritos',
  COUNT(*)
FROM artistas_fases;
```

Deberías ver algo como:

```
        metrica         | valor
------------------------+-------
 Total de artistas      |     0
 Artistas pendientes    |     0
 Fases activas          |     1  ✅ IMPORTANTE
 Artistas inscritos     |     0
```

**Lo CRÍTICO es que "Fases activas" sea >= 1**

---

## 🧪 Paso 4: Probar el registro

Ahora puedes probar registrar un artista:

```bash
curl -X POST https://tu-backend.railway.app/api/registro \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Test",
    "apellido": "Artist",
    "email": "test@example.com",
    "telefono": "1234567890",
    "fecha_nacimiento": "1990-01-01",
    "ciudad": "CDMX",
    "pais": "México",
    "categoria": "Pintura"
  }'
```

Deberías recibir:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "Test",
    ...
  },
  "message": "¡Registro exitoso! ..."
}
```

Y en los logs del backend (Railway):

```
✅ Artista registrado exitosamente con ID: 1
✅ Artista inscrito a la fase 1
```

---

## 🔍 Verificar en la base de datos

```sql
-- Ver el artista y su fase
SELECT
  a.id,
  a.nombre,
  a.apellido,
  a.estado_registro,
  f.nombre as fase
FROM artistas a
LEFT JOIN artistas_fases af ON af.artista_id = a.id
LEFT JOIN fases f ON f.id = af.fase_id
ORDER BY a.created_at DESC;
```

Deberías ver:

```
 id | nombre | apellido | estado_registro |            fase
----+--------+----------+-----------------+-----------------------------
  1 | Test   | Artist   | pendiente       | Fase 1 - Registro de Artistas
```

---

## 🎯 Verificar en el Admin Panel

Ve a: `https://tu-frontend.vercel.app/admin/artistas`

Deberías ver el artista en la tabla con:
- ✅ Nombre: Test Artist
- ✅ Estado: ⏳ Pendiente
- ✅ Botones de Aprobar/Rechazar

---

## 🆘 Troubleshooting

### "No hay fases activas con inscripciones abiertas"

Ejecuta de nuevo:

```sql
UPDATE fases
SET inscripciones_abiertas = true
WHERE id = 1;
```

### "La tabla artistas_fases no existe"

Corre las migraciones:

```bash
cd backend
npm run migrate
```

### "El artista no aparece en el admin panel"

Verifica CORS en el backend. La URL de Vercel debe estar en:

```javascript
// backend/src/server.js
const allowedOrigins = [
  'https://tu-frontend.vercel.app',  // ← Agregar esta
  ...
]
```

---

## 📊 Queries útiles para monitoreo

```sql
-- Artistas por fase
SELECT
  f.nombre as fase,
  COUNT(af.artista_id) as total_artistas
FROM fases f
LEFT JOIN artistas_fases af ON af.fase_id = f.id
GROUP BY f.id, f.nombre;

-- Artistas por estado
SELECT
  estado_registro,
  COUNT(*) as total
FROM artistas
GROUP BY estado_registro;

-- Artistas registrados hoy
SELECT
  COUNT(*) as registrados_hoy
FROM artistas
WHERE DATE(created_at) = CURRENT_DATE;
```

---

## ✅ Checklist final

- [ ] Tabla `artistas_fases` existe
- [ ] Tabla `fases` existe
- [ ] Hay al menos 1 fase con `inscripciones_abiertas = true`
- [ ] Puedo registrar un artista exitosamente
- [ ] El artista aparece en `artistas_fases`
- [ ] El artista aparece en el admin panel
- [ ] Puedo aprobar/rechazar desde el panel
