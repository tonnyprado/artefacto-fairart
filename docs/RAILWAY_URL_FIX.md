# Solución: Error de conexión al backend desde Vercel

## Problema

La aplicación en Vercel está intentando conectarse a:
```
https://artefacto-fairart.railway.internal/api/...
```

Esta es una URL **interna** de Railway que solo funciona entre servicios dentro de Railway, **NO desde el navegador** del usuario.

Por eso ves estos errores en la consola:
```
A server with the specified hostname could not be found.
Fetch API cannot load https://artefacto-fairart.railway.internal/api/...
```

## Solución

Necesitas usar la URL **pública** de tu backend en Railway.

### Paso 1: Obtener la URL pública de Railway

1. Ve a tu proyecto en Railway: https://railway.app
2. Abre el servicio del **backend**
3. Ve a la pestaña **Settings**
4. En la sección **Domains**, verás el dominio público generado automáticamente
5. Debería verse algo como:
   ```
   https://artefacto-fairart-production.up.railway.app
   ```
   O un dominio personalizado si lo configuraste

### Paso 2: Actualizar la variable de entorno en Vercel

1. Ve a tu proyecto en Vercel: https://vercel.com
2. Abre el proyecto **frontend**
3. Ve a **Settings** → **Environment Variables**
4. Busca la variable `NEXT_PUBLIC_API_URL`
5. Cámbiala de:
   ```
   https://artefacto-fairart.railway.internal/api
   ```
   a la URL pública de Railway:
   ```
   https://artefacto-fairart-production.up.railway.app/api
   ```
   *(Usa la URL exacta que obtuviste en el Paso 1)*

6. **IMPORTANTE**: Marca la variable para todos los entornos (Production, Preview, Development)
7. Guarda los cambios
8. **Re-deploy** el proyecto en Vercel (Settings → Deployments → ... → Redeploy)

### Paso 3: Verificar

Después del re-deploy:
1. Abre tu aplicación en el navegador
2. Abre la consola del navegador (F12)
3. Ve a la página de login o admin
4. Los errores de "hostname not found" deberían desaparecer
5. Deberías ver requests exitosos al backend en la pestaña Network

## Configuración correcta de variables de entorno

### Frontend (Vercel)

**Variable de entorno que DEBE usar la URL PÚBLICA:**
```bash
NEXT_PUBLIC_API_URL=https://artefacto-fairart-production.up.railway.app/api
```

### Backend (Railway)

**Variable de entorno que PUEDE usar la URL de Vercel:**
```bash
FRONTEND_URL=https://benito-web.vercel.app
```
*(o tu dominio personalizado)*

## URLs internas vs públicas en Railway

### ❌ URLs internas (NO usar desde el navegador)
```
https://artefacto-fairart.railway.internal
```
- Solo accesibles desde **dentro** de Railway (entre servicios)
- **NO** accesibles desde el navegador del usuario
- Se usan para comunicación server-to-server

### ✅ URLs públicas (usar desde el navegador)
```
https://artefacto-fairart-production.up.railway.app
```
- Accesibles desde **cualquier lugar** (navegadores, apps móviles, etc.)
- Se usan para APIs públicas
- Es lo que necesitas en `NEXT_PUBLIC_API_URL`

## Verificación rápida

Puedes verificar que la URL pública funciona abriendo en tu navegador:
```
https://artefacto-fairart-production.up.railway.app/health
```

Si ves una respuesta JSON (aunque sea un error 404), la URL está correcta.
Si no carga, verifica que el backend esté corriendo en Railway.

## ¿Por qué `NEXT_PUBLIC_`?

En Next.js, las variables de entorno con el prefijo `NEXT_PUBLIC_` son las **únicas** que se exponen al navegador. Sin este prefijo, la variable solo está disponible en el servidor de Next.js.

Como necesitamos que el navegador del usuario se conecte al backend, **DEBE** usar `NEXT_PUBLIC_API_URL`.
