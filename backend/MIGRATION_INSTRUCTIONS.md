# 🚀 Migración a PostgreSQL en Railway

## Paso 1: Verificar conexión a Railway PostgreSQL

1. Entra a tu proyecto en Railway
2. Ve a tu servicio de PostgreSQL
3. Copia la variable `DATABASE_URL` (debe verse algo así: `postgresql://user:pass@host:port/database`)

## Paso 2: Configurar variables de entorno

Agrega en Railway (o en tu `.env` local):

```bash
DATABASE_URL=postgresql://user:pass@host:port/database
NODE_ENV=production
```

## Paso 3: Ejecutar la migración

### Opción A: Desde Railway CLI (Recomendado)

```bash
# 1. Instala Railway CLI si no lo tienes
npm install -g @railway/cli

# 2. Inicia sesión
railway login

# 3. Vincula el proyecto
railway link

# 4. Ejecuta la migración
railway run psql -f migrations/001_ediciones_fases.sql
```

### Opción B: Desde psql local

```bash
# Usa la DATABASE_URL de Railway
psql "postgresql://user:pass@host:port/database" -f migrations/001_ediciones_fases.sql
```

### Opción C: Desde Railway Dashboard

1. Ve a Railway Dashboard
2. Abre tu servicio PostgreSQL
3. Click en "Query"
4. Copia y pega TODO el contenido de `migrations/001_ediciones_fases.sql`
5. Ejecuta

## Paso 4: Verificar que funcionó

Ejecuta este query en Railway:

```sql
-- Debe mostrar 1 edición
SELECT * FROM ediciones;

-- Debe mostrar 4 fases (3 fases + 1 concurso)
SELECT * FROM fases;
```

## Paso 5: Actualizar el backend para usar PostgreSQL

El código backend ya está preparado para usar PostgreSQL automáticamente si detecta `DATABASE_URL`.

Reinicia el servidor y verifica los logs:

```
✅ Conectado a PostgreSQL
✅ PostgreSQL conectado exitosamente
```

Si ves:
```
ℹ️  PostgreSQL deshabilitado - Usando datos en memoria
```

Significa que falta la variable `DATABASE_URL`.

## ⚠️ IMPORTANTE

Después de ejecutar la migración:

1. ✅ Las ediciones y fases se guardarán en PostgreSQL
2. ✅ Los cambios persistirán entre reinicios
3. ✅ Los artistas podrán inscribirse a fases reales
4. ❌ Ya NO uses mockData - todo viene de la DB

## Verificación final

Prueba en el panel de admin:

1. Crea una nueva edición
2. Reinicia el servidor
3. La edición debe seguir ahí ✅

Si sigue mostrando datos mockeados = la migración no corrió o DATABASE_URL no está configurada.
