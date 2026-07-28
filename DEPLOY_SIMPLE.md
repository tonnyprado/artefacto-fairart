# 🚀 Deployment en Vercel - Guía Rápida

## Pasos para Deploy

### 1. Push a GitHub
```bash
git add .
git commit -m "chore: preparar proyecto para deployment"
git push origin main
```

### 2. Ve a Vercel
1. Abre [vercel.com](https://vercel.com)
2. Inicia sesión con GitHub
3. Click en **"Add New Project"**
4. Selecciona tu repositorio
5. Click en **"Import"**

### 3. Configuración
Vercel detectará automáticamente todo gracias a `vercel.json`. Solo verifica que muestre:

```
Framework Preset: Next.js
Build Command: cd frontend && npm run build
Output Directory: frontend/.next
Install Command: cd frontend && npm install
```

### 4. Deploy
1. Click en **"Deploy"**
2. Espera 2-3 minutos
3. ¡Listo! 🎉

Tu sitio estará en: `https://tu-proyecto.vercel.app`

---

## ⚠️ Importante

**Por ahora solo se desplegará el frontend (Landing page + UI).**

Las siguientes secciones NO funcionarán porque requieren backend:
- ❌ Login admin/curador
- ❌ Panel de administración
- ❌ Panel de curadores
- ❌ Registro de artistas

Pero SÍ funcionará:
- ✅ Landing page completa
- ✅ Todas las animaciones
- ✅ Diseño responsive
- ✅ Navegación

---

## 📝 Variables de Entorno (No necesarias por ahora)

Por ahora NO necesitas configurar variables de entorno porque es solo UI.

Cuando quieras conectar un backend en el futuro, agrega en Vercel:
```
NEXT_PUBLIC_API_URL=https://tu-backend.com
```

---

## 🔄 Redeploys Automáticos

Cada vez que hagas push a `main`, Vercel hará deploy automáticamente.

```bash
git add .
git commit -m "feat: agregar nueva funcionalidad"
git push origin main
```

Y en ~2 minutos verás los cambios en tu sitio.

---

## 🐛 Si algo falla

1. Revisa los **Build Logs** en Vercel
2. Verifica que todas las dependencias estén en `frontend/package.json`
3. Prueba hacer build local:
   ```bash
   cd frontend
   npm run build
   ```

---

Para más detalles, revisa `DEPLOYMENT.md`
