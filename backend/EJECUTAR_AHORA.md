# 🚨 EJECUTAR ESTO AHORA EN RAILWAY 🚨

## El problema que tienes:

- ❌ Ediciones/fases que creas en admin desaparecen al reiniciar
- ❌ Artistas que se registran NO aparecen en la lista
- ❌ Sigues viendo datos "mockeados" que no creaste

## Por qué pasa:

El backend **NO está usando PostgreSQL**, está usando datos en memoria (mockData) que se pierden al reiniciar.

## Solución (2 opciones):

---

### OPCIÓN 1: Railway Dashboard (MÁS FÁCIL) ⭐

1. **Abre Railway** → https://railway.app
2. **Ve a tu proyecto** → Selecciona el proyecto ARTEFACT
3. **Abre PostgreSQL** → Click en el servicio PostgreSQL
4. **Click en "Data"** → Luego click en "Query"

5. **PRIMERA MIGRACIÓN** - Copia y pega TODO esto:

```sql
-- Abre: backend/migrations/001_ediciones_fases.sql
-- Copia TODO el contenido del archivo
-- Pégalo aquí y presiona "Run Query"
```

6. **Espera** a que termine (debe decir "Query successful")

7. **SEGUNDA MIGRACIÓN** - Copia y pega TODO esto:

```sql
-- Abre: backend/migrations/002_artistas.sql
-- Copia TODO el contenido del archivo
-- Pégalo aquí y presiona "Run Query"
```

8. **Verifica** que funcionó:

```sql
-- Ejecuta esto para ver las tablas creadas:
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Debes ver:
-- artistas
-- artistas_fases
-- ediciones
-- fases
-- obras
```

9. **Reinicia el backend**:
   - Ve al servicio del backend en Railway
   - Settings → Restart

10. **Verifica los logs**:
    - Click en el servicio backend
    - Logs
    - Debes ver:
      ```
      ✅ Conectado a PostgreSQL
      ✅ PostgreSQL conectado exitosamente
      ```

---

### OPCIÓN 2: Railway CLI (SI TIENES CLI INSTALADA)

```bash
# En la terminal:
cd backend

# Ejecuta PRIMERA migración
railway run psql -f migrations/001_ediciones_fases.sql

# Ejecuta SEGUNDA migración
railway run psql -f migrations/002_artistas.sql

# Reinicia el backend
railway up --detach
```

---

## ¿Cómo saber si ya funcionó?

### ✅ ANTES (mockData - MAL):
```
Logs del backend:
ℹ️  PostgreSQL deshabilitado - Usando datos en memoria (mockData.js)
```

Comportamiento:
- Panel admin muestra ediciones/fases que no creaste
- Al crear edición y reiniciar, desaparece
- Artistas registrados no aparecen

### ✅ DESPUÉS (PostgreSQL - BIEN):
```
Logs del backend:
✅ Conectado a PostgreSQL
✅ PostgreSQL conectado exitosamente - [fecha actual]
```

Comportamiento:
- Panel admin muestra solo lo que TÚ creas
- Al crear edición y reiniciar, SIGUE AHÍ
- Artistas registrados aparecen en la lista

---

## Variables de entorno necesarias en Railway

Ve a tu servicio Backend → Variables:

Debe existir:
```
DATABASE_URL = postgresql://user:pass@host.railway.app:5432/railway
```

Esta variable se crea automáticamente cuando agregas PostgreSQL al proyecto.

---

## Después de ejecutar las migraciones:

1. Ve al panel de admin
2. ELIMINA las ediciones/fases mockeadas que aparecen
3. Crea UNA edición nueva desde cero
4. Crea fases dentro de esa edición
5. Reinicia el backend
6. Verifica que TODO siga ahí ✅

---

## Si algo sale mal:

1. Verifica que DATABASE_URL existe en variables de entorno
2. Verifica los logs del backend (debe decir "Conectado a PostgreSQL")
3. Si sigue usando mockData, el problema es que DATABASE_URL no está configurada

---

## Contacto si necesitas ayuda:

- Los logs completos del backend cuando inicia
- Screenshot de las variables de entorno en Railway
- Screenshot de las tablas creadas en PostgreSQL
