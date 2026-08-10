# Configuración de Variables de Entorno en Railway

## Variables de Entorno Requeridas

Para que el backend funcione correctamente en Railway y se conecte con el frontend en Vercel, necesitas configurar estas variables de entorno:

### 1. FRONTEND_URL

**Valor:** La URL de tu aplicación frontend en Vercel

```bash
FRONTEND_URL=https://benito-web.vercel.app
```

**Por qué es importante:**
- El backend usa esta URL para configurar CORS
- Sin esta variable, el navegador bloqueará las peticiones desde Vercel
- El backend validará que las peticiones vengan de este origen

### 2. NODE_ENV

**Valor:** `production`

```bash
NODE_ENV=production
```

**Por qué es importante:**
- Activa el modo producción en el backend
- Desactiva mensajes de debug innecesarios
- Optimiza el rendimiento

### 3. JWT_SECRET

**Valor:** Una cadena aleatoria segura (mínimo 32 caracteres)

```bash
JWT_SECRET=tu_secreto_super_seguro_aqui_cambiar_en_produccion_2026
```

**Por qué es importante:**
- Se usa para firmar los tokens de autenticación
- DEBE ser diferente del valor de desarrollo
- Si lo cambias, todos los usuarios tendrán que volver a hacer login

### 4. JWT_EXPIRES_IN

**Valor:** Duración de la sesión (ejemplo: 7d para 7 días)

```bash
JWT_EXPIRES_IN=7d
```

### 5. DATABASE_URL (PostgreSQL)

**Valor:** La URL de conexión a tu base de datos

```bash
DATABASE_URL=postgresql://usuario:password@host:5432/nombre_db
```

**Railway genera esto automáticamente si usas Postgres de Railway**

Si estás usando Neon u otro proveedor:
```bash
DATABASE_URL=postgresql://usuario:password@ep-nombre-123456.region.aws.neon.tech/neondb
```

## Cómo Configurar en Railway

### Opción 1: Desde la interfaz web

1. Ve a https://railway.app
2. Selecciona tu proyecto
3. Haz clic en el servicio del **backend**
4. Ve a la pestaña **Variables**
5. Haz clic en **+ New Variable**
6. Agrega cada variable con su valor
7. Railway re-deployará automáticamente

### Opción 2: Desde la CLI de Railway

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Vincular proyecto
railway link

# Agregar variables
railway variables set FRONTEND_URL=https://benito-web.vercel.app
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=tu_secreto_aqui
railway variables set JWT_EXPIRES_IN=7d
```

## Variables Opcionales

### CLOUDINARY (para subir archivos)

Si vas a usar Cloudinary para almacenar imágenes:

```bash
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

### SMTP (para enviar emails)

Si vas a enviar emails de notificación:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASSWORD=tu_app_password
SMTP_FROM=noreply@artefact.com
```

## Verificación

Después de configurar las variables:

1. Railway re-deployará automáticamente el backend
2. Verifica los logs en Railway → Deployments → View logs
3. Deberías ver:
   ```
   🔐 CORS - Orígenes permitidos: [ 'http://localhost:3000', ... 'https://benito-web.vercel.app' ]
   🚀 Servidor corriendo en puerto 4000
   ```

4. Abre tu aplicación en Vercel
5. Los errores de CORS deberían desaparecer

## Errores Comunes

### Error: "No permitido por CORS"

**Problema:** FRONTEND_URL no está configurado o tiene la URL incorrecta

**Solución:**
1. Verifica que FRONTEND_URL esté configurado en Railway
2. Asegúrate de usar la URL exacta de Vercel (sin / al final)
3. Ejemplo correcto: `https://benito-web.vercel.app`
4. Ejemplo incorrecto: `https://benito-web.vercel.app/`

### Error: "Preflight response is not successful"

**Problema:** El backend no acepta peticiones OPTIONS

**Solución:**
- Este error debería resolverse con la nueva configuración de CORS
- Verifica los logs en Railway para ver si hay errores
- Asegúrate de que el último deploy del backend incluye los cambios de CORS

### Error: "Cannot find module 'dotenv'"

**Problema:** Las dependencias no se instalaron correctamente

**Solución:**
1. Ve a Railway → Settings → Build
2. Verifica que buildCommand sea: `cd backend && npm install`
3. Haz un nuevo deploy

## URLs Importantes

### Backend en Railway
```
https://artefacto-fairart-production.up.railway.app
```

### Frontend en Vercel
```
https://benito-web.vercel.app
```

Estas dos URLs deben estar configuradas correctamente:
- **Backend** debe conocer la URL del **Frontend** → `FRONTEND_URL`
- **Frontend** debe conocer la URL del **Backend** → `NEXT_PUBLIC_API_URL`

## Resumen de Configuración

| Variable | Ubicación | Valor |
|----------|-----------|-------|
| `NEXT_PUBLIC_API_URL` | **Vercel** (frontend) | URL pública del backend |
| `FRONTEND_URL` | **Railway** (backend) | URL de Vercel |
| `NODE_ENV` | **Railway** (backend) | `production` |
| `JWT_SECRET` | **Railway** (backend) | Secreto fuerte y único |
| `DATABASE_URL` | **Railway** (backend) | URL de PostgreSQL |
