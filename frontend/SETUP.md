# ARTEFACT - Guía de Configuración

Esta guía te ayudará a configurar el proyecto completo de ARTEFACT, incluyendo la base de datos y el sistema de registro de artistas.

## Requisitos Previos

- Node.js 18+ y npm/yarn
- PostgreSQL 15+
- Cuenta de Cloudinary (para subir archivos)
- Cuenta SMTP (Gmail, SendGrid, etc.) para enviar emails

## Paso 1: Clonar e Instalar Dependencias

```bash
# Navegar a la carpeta del frontend
cd artefact-web/frontend

# Instalar dependencias
npm install

# Instalar dependencia de PostgreSQL
npm install pg
```

## Paso 2: Configurar PostgreSQL

### Instalar PostgreSQL

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Windows:**
Descarga el instalador desde: https://www.postgresql.org/download/windows/

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Crear la Base de Datos

```bash
# Acceder a PostgreSQL
psql -U postgres

# Dentro de psql, ejecuta:
CREATE DATABASE artefact_db;

# Salir
\q
```

### Ejecutar el Schema

```bash
# Desde la carpeta artefact-web/frontend
psql -U postgres -d artefact_db -f database/schema.sql
```

Verás mensajes de confirmación como:
```
CREATE EXTENSION
CREATE TABLE
CREATE TABLE
...
INSERT 0 4
```

### Verificar que funcionó

```bash
psql -U postgres -d artefact_db -c "SELECT * FROM fases;"
```

Deberías ver las 4 fases creadas.

## Paso 3: Configurar Variables de Entorno

### Crear archivo .env.local

```bash
cp .env.example .env.local
```

### Editar .env.local

Abre `.env.local` y completa:

```env
# Database (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=artefact_db
DB_USER=postgres
DB_PASSWORD=tu_password_postgresql

# Cloudinary (crear cuenta en cloudinary.com)
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# Email (Gmail example - necesitas App Password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASSWORD=tu_app_password
SMTP_FROM=noreply@artefact-feria.com

# SEO
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=ARTEFACT - Feria de Arte
NEXT_PUBLIC_SITE_DESCRIPTION=Descubre y conecta con artistas emergentes

# Admin
NEXT_PUBLIC_ADMIN_EMAIL=admin@artefact-feria.com
```

### Configurar Cloudinary

1. Crea una cuenta gratuita en https://cloudinary.com
2. Ve a Dashboard
3. Copia tu Cloud Name, API Key y API Secret
4. Pégalos en `.env.local`

### Configurar Email (Gmail)

1. Ve a tu cuenta de Google
2. Habilita "Verificación en 2 pasos"
3. Ve a Seguridad → Contraseñas de aplicaciones
4. Genera una contraseña para "Mail"
5. Usa esa contraseña en `SMTP_PASSWORD`

## Paso 4: Probar el Servidor de Desarrollo

```bash
npm run dev
```

Abre http://localhost:3000

Deberías ver la página principal de ARTEFACT.

## Paso 5: Probar el Registro

1. Ve a http://localhost:3000
2. Haz clic en "REGISTRARSE AHORA" (sección Convocatoria)
3. Completa el formulario multi-step
4. Envía el registro

### Verificar que el registro funcionó

```bash
# Ver artistas en la base de datos
psql -U postgres -d artefact_db -c "SELECT id, nombre, apellido, email, estado FROM artistas;"

# Ver inscripciones a fases
psql -U postgres -d artefact_db -c "SELECT * FROM inscripciones_fases;"
```

## Estructura del Proyecto

```
artefact-web/frontend/
├── app/
│   ├── api/
│   │   └── artistas/
│   │       └── route.js         # API endpoint para registro
│   ├── registro/
│   │   └── page.js              # Página de registro
│   └── page.js                  # Landing page
├── components/
│   ├── artefacto/               # Componentes principales
│   └── registro/                # Steps del formulario
├── database/
│   ├── schema.sql               # Schema de PostgreSQL
│   └── README.md                # Documentación DB
├── lib/
│   └── db.js                    # Conexión a PostgreSQL
└── .env.local                   # Variables de entorno (NO SUBIR A GIT)
```

## API Endpoints

### POST /api/artistas
Registrar un nuevo artista.

**Ejemplo con curl:**
```bash
curl -X POST http://localhost:3000/api/artistas \
  -F "nombre=Juan" \
  -F "apellido=Pérez" \
  -F "email=juan@example.com" \
  -F "telefono=5512345678" \
  -F "fecha_nacimiento=1990-01-01" \
  -F "pais=México" \
  -F "ciudad=CDMX" \
  -F "direccion=Calle Falsa 123" \
  -F "categoria=pintura" \
  -F "bio=Artista contemporáneo con más de 200 caracteres de biografía..." \
  -F "foto=@/path/to/foto.jpg" \
  -F "cv=@/path/to/cv.pdf"
```

### GET /api/artistas
Obtener lista de artistas (para admin).

**Ejemplo:**
```bash
curl http://localhost:3000/api/artistas
curl "http://localhost:3000/api/artistas?estado=pendiente&limit=10"
```

## Comandos Útiles

### Base de Datos

```bash
# Ver todos los artistas
psql -U postgres -d artefact_db -c "SELECT * FROM artistas;"

# Ver fase activa
psql -U postgres -d artefact_db -c "SELECT * FROM fases WHERE activa = true;"

# Cambiar a Fase 2
psql -U postgres -d artefact_db -c "UPDATE fases SET activa = false; UPDATE fases SET activa = true WHERE nombre = 'Fase 2';"

# Contar artistas por estado
psql -U postgres -d artefact_db -c "SELECT estado, COUNT(*) FROM artistas GROUP BY estado;"

# Limpiar todos los artistas (CUIDADO)
psql -U postgres -d artefact_db -c "TRUNCATE artistas CASCADE;"
```

### Desarrollo

```bash
# Ejecutar en modo desarrollo
npm run dev

# Compilar para producción
npm run build

# Ejecutar producción
npm start

# Linter
npm run lint
```

## Troubleshooting

### Error: "relation artistas does not exist"
→ No ejecutaste el schema. Corre:
```bash
psql -U postgres -d artefact_db -f database/schema.sql
```

### Error: "password authentication failed"
→ Verifica que `DB_PASSWORD` en `.env.local` sea correcta

### Error: "ECONNREFUSED ::1:5432"
→ PostgreSQL no está corriendo. Inícialo:
```bash
# macOS
brew services start postgresql@15

# Linux
sudo systemctl start postgresql
```

### Error al subir archivos
→ Verifica tus credenciales de Cloudinary en `.env.local`

### El botón "REGISTRARSE AHORA" no funciona
→ Verifica que estés en http://localhost:3000 (no 4000)

## Próximos Pasos

1. **Implementar subida a Cloudinary** en `/app/api/artistas/route.js`
2. **Configurar email notifications** para confirmación de registro
3. **Crear panel de admin** para revisar artistas
4. **Implementar sistema de votación** para curadores
5. **Agregar dashboard de artistas** para ver su estado

## Soporte

Si tienes problemas:
1. Revisa los logs del servidor (`npm run dev`)
2. Verifica los logs de PostgreSQL
3. Consulta la documentación en `database/README.md`
4. Contacta al equipo de desarrollo

¡Buena suerte! 🎨
