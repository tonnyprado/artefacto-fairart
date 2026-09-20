# 🔧 Guía de Solución: Error "Failed to Fetch"

## 📋 Problema

Usuarios reportan error **"Failed to fetch"** al intentar registrarse. Este error significa que la petición **no llega al backend**.

---

## ✅ Verificación Realizada (2026-09-20)

- ✅ Backend está **ACTIVO** y respondiendo: `https://artefacto-fairart-production.up.railway.app`
- ✅ Health check funciona correctamente
- ✅ CORS configurado para:
  - `https://arte-facto.mx`
  - `https://www.arte-facto.mx`
  - `https://artefacto-fairart.vercel.app`
  - `http://localhost:3000` (desarrollo)

---

## 🔍 Posibles Causas

### 1. **Variable de entorno mal configurada en Vercel** ⚠️ MÁS PROBABLE
   - **Problema:** `NEXT_PUBLIC_API_URL` no está configurada o tiene valor incorrecto
   - **Solución:**
     1. Ir a https://vercel.com → Proyecto → Settings → Environment Variables
     2. Agregar/verificar:
        - **Key:** `NEXT_PUBLIC_API_URL`
        - **Value:** `https://artefacto-fairart-production.up.railway.app/api`
     3. **IMPORTANTE:** Hacer re-deploy después de cambiar variables

### 2. **Dominio no permitido en CORS**
   - **Problema:** Usuario accede desde un dominio no configurado
   - **Síntomas:** Error de CORS en consola del navegador
   - **Solución:** Agregar dominio en `backend/src/server.js` línea 107-115

### 3. **Rate Limit alcanzado**
   - **Problema:** Demasiadas peticiones (>100 cada 15 min)
   - **Síntomas:** Error 429 en consola
   - **Solución:** Esperar 15 minutos o incrementar límite en `server.js`

### 4. **Problemas de red del usuario**
   - **Problema:** Firewall, VPN, DNS bloqueando Railway
   - **Síntomas:** Solo afecta a ciertos usuarios
   - **Solución:** Usuario debe:
     - Desactivar VPN
     - Probar en otra red (datos móviles)
     - Limpiar caché DNS: `ipconfig /flushdns` (Windows) o `sudo dscacheutil -flushcache` (Mac)

### 5. **Navegador/extensiones bloqueando**
   - **Problema:** Adblocker, extensiones de privacidad
   - **Síntomas:** Funciona en modo incógnito o en otro navegador
   - **Solución:** Desactivar extensiones o whitelist el sitio

---

## 🛠️ Script de Diagnóstico para Usuarios

Ver archivo: `diagnostic-script.js`

**Instrucciones para el usuario:**
1. Abrir la consola del navegador (F12)
2. Copiar y pegar el script completo
3. Presionar Enter
4. Tomar screenshot de los resultados
5. Enviar al administrador

---

## 🚨 Checklist de Verificación

### Para el Administrador:

- [ ] **Verificar backend activo:**
  ```bash
  curl https://artefacto-fairart-production.up.railway.app/health
  ```
  Debe responder: `{"status":"OK",...}`

- [ ] **Verificar variables de entorno en Vercel:**
  - Ir a: https://vercel.com/[tu-equipo]/[proyecto]/settings/environment-variables
  - Verificar que `NEXT_PUBLIC_API_URL` = `https://artefacto-fairart-production.up.railway.app/api`
  - Si cambias algo, hacer **Redeploy**

- [ ] **Verificar logs del backend:**
  ```bash
  # En Railway, ver logs en tiempo real
  railway logs --tail
  ```

- [ ] **Probar endpoint de pre-registro:**
  ```bash
  curl -X POST https://artefacto-fairart-production.up.railway.app/api/preregistro \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","nombre":"Test","apellido":"User","ubicacion":"CDMX"}'
  ```

### Para el Usuario:

- [ ] ¿Está usando `https://arte-facto.mx`? (NO otra URL)
- [ ] ¿Tiene internet funcionando? (Abrir google.com para verificar)
- [ ] ¿Probó refrescar con Ctrl+F5 / Cmd+Shift+R?
- [ ] ¿Probó en modo incógnito?
- [ ] ¿Probó en otro navegador?
- [ ] ¿Desactivó VPN si tiene?

---

## 📊 Logs Esperados (Cuando Funciona)

### En el backend (Railway logs):
```
✅ CORS: Origin permitido - https://arte-facto.mx
📨 POST /api/preregistro - Origin: https://arte-facto.mx
📝 Creando nuevo pre-registro...
✅ PRE-REGISTRO EXITOSO
```

### En el frontend (Consola del navegador):
```
Enviando a: https://artefacto-fairart-production.up.railway.app/api/registro
Tamaño total FormData: 12.5 MB
✅ Registro exitoso
```

---

## 🔄 Solución Rápida (95% de los casos)

**Para administrador:**
1. Verificar variable `NEXT_PUBLIC_API_URL` en Vercel
2. Si no existe o está mal, configurarla:
   - `https://artefacto-fairart-production.up.railway.app/api`
3. Hacer redeploy en Vercel
4. Esperar 1-2 minutos
5. Pedir al usuario que refresque la página

**Para usuario:**
1. Refrescar página con Ctrl+F5 (Windows) o Cmd+Shift+R (Mac)
2. Limpiar caché del navegador
3. Si sigue fallando, probar en modo incógnito
4. Si sigue fallando, usar el script de diagnóstico

---

## 📞 Escalación

Si ninguna solución funciona:

1. Ejecutar script de diagnóstico con el usuario
2. Revisar logs completos de Railway en el momento exacto del error
3. Verificar si Railway está en mantenimiento: https://status.railway.app
4. Verificar si Vercel está en mantenimiento: https://status.vercel.com
5. Contactar soporte de Railway/Vercel si es necesario

---

## 🎯 Prevención Futura

1. **Agregar retry automático en el frontend:**
   ```javascript
   // En fetch, agregar retry con backoff exponencial
   async function fetchWithRetry(url, options, retries = 3) {
     for (let i = 0; i < retries; i++) {
       try {
         return await fetch(url, options)
       } catch (error) {
         if (i === retries - 1) throw error
         await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)))
       }
     }
   }
   ```

2. **Agregar mensaje de error más descriptivo:**
   ```javascript
   catch (error) {
     if (error.message === 'Failed to fetch') {
       alert('❌ Error de conexión. Verifica tu internet e intenta de nuevo.')
     }
   }
   ```

3. **Agregar endpoint de status visible:**
   - Mostrar indicador verde/rojo del backend en la página

4. **Configurar alertas:**
   - Notificación cuando backend está caído
   - Notificación cuando hay muchos errores de CORS

---

**Última actualización:** 2026-09-20
**Mantenido por:** Claude Code
**Contacto:** [admin del sistema]
