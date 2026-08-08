# GUÍA DE HOSTING - ARTEFACT

**Stack recomendado:**
- Frontend: **Vercel** (ya configurado)
- Backend: **Railway** (Node.js + PostgreSQL incluido)

---

## 🚂 PARTE 1: Deploy Backend en Railway

### Paso 1: Crear cuenta en Railway

1. Ve a [railway.app](https://railway.app)
2. Sign up con GitHub
3. Conecta tu repositorio

### Paso 2: Crear proyecto nuevo

1. Click en "New Project"
2. Selecciona "Deploy from GitHub repo"
3. Busca tu repo `Benito-web`
4. **IMPORTANTE:** En configuración, establece:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

### Paso 3: Agregar PostgreSQL

1. En el proyecto Railway, click en "+ New"
2. Selecciona "Database" → "PostgreSQL"
3. Railway automáticamente crea la base de datos
4. Railway automáticamente conecta las variables:
   - `DATABASE_URL` se crea automáticamente
   - `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`

### Paso 4: Configurar Variables de Entorno

En Railway, ve a tu servicio backend → "Variables" y agrega:

```env
# Database (Railway las genera automáticamente cuando agregas PostgreSQL)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# JWT
JWT_SECRET=tu-secreto-super-seguro-aqui-genera-uno-random
JWT_EXPIRES_IN=7d

# Cloudinary (por ahora puedes usar mock, después lo activas)
CLOUDINARY_CLOUD_NAME=demo
CLOUDINARY_API_KEY=demo
CLOUDINARY_API_SECRET=demo

# Frontend URL
FRONTEND_URL=https://tu-frontend.vercel.app

# Puerto (Railway lo asigna automáticamente)
PORT=${{PORT}}

# Node env
NODE_ENV=production
```

**Generar JWT_SECRET seguro:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Paso 5: Ejecutar Schema SQL

Una vez deployado, ve a Railway → PostgreSQL → "Connect" y copia las credenciales.

**Opción A - Desde tu máquina local:**
```bash
# Instalar psql si no lo tienes
brew install postgresql  # Mac
# o
sudo apt install postgresql-client  # Linux

# Conectar a Railway
psql postgresql://user:password@host:port/database

# Ejecutar schema
\i /path/to/database/schema.sql
```

**Opción B - Desde Railway CLI:**
```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Conectar al proyecto
railway link

# Ejecutar SQL
railway run psql < database/schema.sql
```

**Opción C - Desde la UI de Railway:**
1. Railway → PostgreSQL → "Data"
2. Pegar el contenido de `schema.sql`
3. Ejecutar

### Paso 6: Seed Data Inicial

Crea el archivo `/database/seed.sql` con datos iniciales:

```sql
-- Admin inicial
INSERT INTO usuarios (email, password, nombre, role)
VALUES ('admin@artefact.com', '$2a$10$6M62/oODgMNGizQENsGY.ObsynGWcQbEBMEq04QQkpSaYE2itDTM.', 'Admin Principal', 'admin');

-- Configuración del sitio
INSERT INTO configuracion_sitio (
  nombre_sitio, email_contacto, telefono_contacto, whatsapp,
  direccion_completa, instagram, facebook
) VALUES (
  'ARTEFACT',
  'info@artefact.com.mx',
  '+52 55 1234 5678',
  '+52 55 1234 5678',
  'Av. Reforma 123, Cuauhtémoc, CDMX, México',
  'https://instagram.com/artefact',
  'https://facebook.com/artefact'
);

-- Paquetes
INSERT INTO paquetes (nombre, descripcion, precio, metros_lineales, altura_pared, obras_maximas, beneficios)
VALUES
  ('Paquete Básico', 'Ideal para artistas emergentes', 1500.00, 3.0, 2.4, 8,
   '["Espacio de 3m lineales", "Iluminación LED", "Catálogo digital"]'::jsonb),
  ('Paquete Profesional', 'Para artistas establecidos', 2800.00, 5.0, 2.8, 15,
   '["Espacio de 5m lineales", "Iluminación premium", "Página en catálogo impreso", "Promoción en redes"]'::jsonb),
  ('Paquete Premium', 'Espacio exclusivo', 4500.00, 8.0, 3.0, 25,
   '["Espacio de 8m lineales", "Stand personalizado", "Video promocional", "Entrevista en revista"]'::jsonb);

-- Contenido Hero
INSERT INTO contenido (tipo, titulo, subtitulo, slug, contenido, publicado,
  cta_principal_texto, cta_principal_url, cta_secundario_texto, cta_secundario_url)
VALUES (
  'hero',
  'ARTEFACT 2027',
  'Feria de Arte Contemporáneo',
  'hero-principal',
  'Descubre el talento emergente de artistas locales en la feria de arte contemporáneo más importante de México.',
  true,
  'Registrarse como Artista',
  '/registro',
  'Ver Convocatoria',
  '#convocatoria'
);

-- Evento principal
INSERT INTO eventos (
  nombre, descripcion, tipo_evento, fecha_inicio, fecha_fin,
  ubicacion, lugar_nombre, ciudad, estado, slug, activo
) VALUES (
  'ARTEFACT 2027',
  'La feria de arte contemporáneo más importante de México',
  'feria_principal',
  '2027-02-01 10:00:00',
  '2027-02-28 20:00:00',
  'Centro de Convenciones de la Ciudad de México',
  'Centro de Convenciones CDMX',
  'Ciudad de México',
  'CDMX',
  'artefact-2027',
  true
);

-- Fases
INSERT INTO fases (nombre, descripcion, tipo, numero_fase, porcentaje_seleccion)
VALUES
  ('Fase 1 - Selección Inicial', 'Primera ronda de selección', 'fase', 1, 20.00),
  ('Fase 2 - Selección Semifinal', 'Segunda ronda de selección', 'fase', 2, 20.00),
  ('Fase 3 - Selección Final', 'Selección final de artistas', 'fase', 3, 20.00);
```

Ejecutar:
```bash
psql $DATABASE_URL < database/seed.sql
```

### Paso 7: Verificar Deploy

Railway te dará una URL como: `https://tu-proyecto.up.railway.app`

**Probar endpoints:**
```bash
# Health check
curl https://tu-proyecto.up.railway.app/health

# Configuración
curl https://tu-proyecto.up.railway.app/api/configuracion

# Paquetes
curl https://tu-proyecto.up.railway.app/api/paquetes
```

---

## 🎨 PARTE 2: Conectar Frontend en Vercel

### Paso 1: Actualizar Variables de Entorno en Vercel

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agrega:

```env
NEXT_PUBLIC_API_URL=https://tu-proyecto.up.railway.app
```

### Paso 2: Redeploy Frontend

```bash
# Desde Vercel dashboard: Deployments → Redeploy
# O desde local:
git push origin main  # Vercel auto-deploy
```

### Paso 3: Actualizar CORS en Backend

En Railway, actualiza la variable `FRONTEND_URL`:
```env
FRONTEND_URL=https://tu-frontend.vercel.app
```

---

## 🔄 PARTE 3: Migrar de Mock Data a PostgreSQL

Ahora que tienes PostgreSQL real, reemplaza los controllers:

### Ejemplo: artistas.controller.js

**Antes (mockData):**
```javascript
import { artistas } from '../data/mockData.js'
```

**Después (PostgreSQL):**
```javascript
import pool from '../config/database.js'

export const getAllArtistas = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM artistas WHERE activo = true ORDER BY created_at DESC'
    )
    res.json({
      success: true,
      data: result.rows
    })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ success: false, error: 'Error al obtener artistas' })
  }
}
```

**Crear `/backend/src/config/database.js`:**
```javascript
import pg from 'pg'
const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Railway requires SSL
  }
})

export default pool
```

---

## 📊 PARTE 4: Monitoreo

### Railway Dashboard
- **Logs:** Ver logs en tiempo real
- **Metrics:** CPU, memoria, requests
- **Database:** Queries, tamaño, connections

### Herramientas útiles
```bash
# Ver logs
railway logs

# Ejecutar comando en producción
railway run npm run migrate

# Abrir shell en PostgreSQL
railway run psql
```

---

## 🔐 PARTE 5: Cloudinary (Opcional)

Cuando estés listo para subir imágenes reales:

1. Crear cuenta en [cloudinary.com](https://cloudinary.com)
2. Dashboard → Settings → API Keys
3. Actualizar variables en Railway:
   ```env
   CLOUDINARY_CLOUD_NAME=tu-cloud-name
   CLOUDINARY_API_KEY=tu-api-key
   CLOUDINARY_API_SECRET=tu-api-secret
   ```
4. Descomentar código real en `/backend/src/controllers/layouts.controller.js`

---

## ✅ CHECKLIST FINAL

**Railway (Backend):**
- [ ] Proyecto creado con root directory = `backend`
- [ ] PostgreSQL agregado
- [ ] Variables de entorno configuradas
- [ ] Schema SQL ejecutado
- [ ] Seed data cargado
- [ ] URL funcionando (health check)

**Vercel (Frontend):**
- [ ] Variable NEXT_PUBLIC_API_URL actualizada
- [ ] Redeploy completado
- [ ] Landing conectado al backend

**Base de Datos:**
- [ ] Todas las tablas creadas
- [ ] Datos iniciales cargados
- [ ] Admin puede hacer login
- [ ] Artistas pueden registrarse

**Testing:**
- [ ] Login funciona
- [ ] Registro de artista funciona
- [ ] Landing carga contenido de BD
- [ ] Formulario de contacto funciona
- [ ] Panel admin muestra datos

---

## 💰 COSTOS ESTIMADOS

**Railway:**
- Gratis: $5 crédito/mes
- Si excedes: ~$10-20/mes para app pequeña

**Vercel:**
- Gratis: 100GB bandwidth/mes
- Hobby plan suficiente para empezar

**Supabase (si lo usas):**
- Gratis: 500MB database
- Sin costo extra para empezar

**Total:** $0-20/mes dependiendo del tráfico

---

## 🆘 TROUBLESHOOTING

**Error: Cannot connect to database**
```bash
# Verificar DATABASE_URL en Railway
railway variables

# Test conexión
railway run psql -c "SELECT 1"
```

**Error: CORS**
```javascript
// Verificar en backend/src/server.js
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}))
```

**Error: 404 en endpoints**
```bash
# Verificar que el servidor arrancó
railway logs --tail 100
```

---

**¿Necesitas ayuda?** Pregúntame en cualquier paso!
