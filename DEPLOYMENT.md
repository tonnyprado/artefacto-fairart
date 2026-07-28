# Guía de Deployment - ARTEFACT

Este proyecto contiene:
- **Frontend**: Aplicación Next.js (Landing page + UI de admin/curador)
- **Backend**: API Express con datos mock (opcional, para desarrollo futuro)

## 🚀 Deployment Rápido - Solo Frontend (RECOMENDADO)

Esta es la opción más simple para mostrar la UI del proyecto.

### Paso 1: Conectar Repositorio a Vercel

1. Ve a [Vercel](https://vercel.com) y crea una cuenta (puedes usar GitHub)
2. Haz click en **"Add New Project"**
3. Importa tu repositorio de GitHub
4. Vercel detectará automáticamente la configuración gracias a `vercel.json`

### Paso 2: Verificar Configuración

Vercel debería autodetectar:
- ✅ **Framework Preset**: Next.js
- ✅ **Build Command**: `cd frontend && npm run build`
- ✅ **Output Directory**: `frontend/.next`
- ✅ **Install Command**: `cd frontend && npm install`

Si no lo detecta automáticamente, configura manualmente estos valores.

### Paso 3: Variables de Entorno (Opcional)

Por ahora no necesitas variables de entorno ya que es solo UI.

Si en el futuro quieres conectar un backend:
```
NEXT_PUBLIC_API_URL=https://tu-backend.com
```

### Paso 4: Deploy

1. Haz click en **"Deploy"**
2. Espera a que termine el build (~2-3 minutos)
3. ¡Listo! Tu sitio estará disponible en `https://tu-proyecto.vercel.app`

---

## 📱 Lo que funcionará después del deployment

### ✅ Funcionará perfectamente:
- Landing page principal (/)
- Todas las animaciones y transiciones
- Navegación entre secciones
- Formularios de contacto (solo UI, no envían emails)
- Diseño responsive
- SEO optimizado

### ⚠️ No funcionará (requiere backend):
- Login de admin/curador
- Registro de artistas
- Panel de administración
- Panel de curadores
- Sistema de votaciones

Estas funciones requieren el backend con base de datos. Por ahora están disponibles solo visualmente.

---

## 🔧 Desarrollo Local

### Requisitos
- Node.js >= 18
- npm >= 9

### Setup Rápido

1. Instala dependencias del frontend:
```bash
cd frontend
npm install
```

2. Corre el servidor de desarrollo:
```bash
npm run dev
```

3. Abre http://localhost:3000

### Setup Completo (Frontend + Backend)

Si quieres probar también el backend con datos mock:

1. Instala todas las dependencias:
```bash
npm run install:all
```

2. Configura variables de entorno:

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

**Backend** (`backend/.env`):
```env
JWT_SECRET=tu-secret-key-local
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
PORT=4000
```

3. Corre ambos servidores:
```bash
# Desde el root
npm run dev
```

Esto iniciará:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000

---

## 🎯 Próximos Pasos (Cuando necesites backend)

### Opción A: Backend en Railway

1. Crea cuenta en [Railway](https://railway.app)
2. Crea nuevo proyecto
3. Configura:
   - **Root Directory**: `backend`
   - **Start Command**: `npm start`
4. Agrega PostgreSQL database
5. Configura variables de entorno
6. Actualiza `NEXT_PUBLIC_API_URL` en Vercel

### Opción B: Backend en Render

1. Crea cuenta en [Render](https://render.com)
2. Crea Web Service
3. Configura:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Agrega PostgreSQL database
5. Configura variables de entorno
6. Actualiza `NEXT_PUBLIC_API_URL` en Vercel

---

## 📝 Scripts Disponibles

### Root (monorepo)
```bash
npm run dev              # Corre frontend y backend juntos
npm run dev:frontend     # Solo frontend
npm run dev:backend      # Solo backend
npm run build            # Build del frontend
npm run install:all      # Instala deps de todo
```

### Frontend (cd frontend)
```bash
npm run dev     # Dev server (puerto 3000)
npm run build   # Build de producción
npm run start   # Servidor de producción
npm run lint    # ESLint
```

### Backend (cd backend)
```bash
npm run dev     # Dev server con nodemon (puerto 4000)
npm run start   # Servidor de producción
```

---

## 🐛 Troubleshooting

### Build falla en Vercel

**Error**: `Cannot find module 'X'`
- **Solución**: Verifica que la dependencia esté en `frontend/package.json`

**Error**: `Build exceeded maximum duration`
- **Solución**: El build de Next.js es pesado. Espera o intenta nuevamente.

### La página se ve rota después del deploy

**Problema**: Estilos no se cargan
- **Solución**: Limpia cache de Vercel y redeploy
- O verifica que `tailwind.config.js` esté bien configurado

### Imágenes no se cargan

**Problema**: 404 en imágenes
- **Solución**: Verifica que las imágenes estén en `frontend/public/`

---

## 🌐 Dominios Personalizados

Una vez deployado en Vercel, puedes agregar un dominio personalizado:

1. Ve a tu proyecto en Vercel
2. Settings → Domains
3. Agrega tu dominio (ejemplo: `artefact.com`)
4. Configura los DNS según las instrucciones de Vercel
5. Espera propagación DNS (hasta 48h)

---

## 📊 Estado Actual del Proyecto

```
✅ Landing page completamente funcional
✅ Diseño responsive
✅ Animaciones y transiciones
✅ SEO optimizado
⚠️  Backend usa datos mock (en memoria)
⚠️  Sin base de datos real
⚠️  Sin autenticación real
⚠️  Sin persistencia de datos
```

---

## 📚 Recursos

- [Documentación de Vercel](https://vercel.com/docs)
- [Documentación de Next.js](https://nextjs.org/docs)
- [Guía de Railway](https://docs.railway.app)
- [Guía de Render](https://render.com/docs)

---

## ✉️ Soporte

Para problemas con el deployment o preguntas sobre la configuración, revisa los logs de build en Vercel o abre un issue en el repositorio.
