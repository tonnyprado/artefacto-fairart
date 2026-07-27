# Base de Datos ARTEFACT

Este directorio contiene el schema y la configuración de la base de datos PostgreSQL para ARTEFACT.

## Configuración Inicial

### 1. Instalar PostgreSQL

Si no tienes PostgreSQL instalado:

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Crear la Base de Datos

```bash
# Acceder a PostgreSQL
psql -U postgres

# Crear la base de datos
CREATE DATABASE artefact_db;

# Salir
\q
```

### 3. Ejecutar el Schema

```bash
# Desde la carpeta del proyecto
psql -U postgres -d artefact_db -f database/schema.sql
```

### 4. Configurar Variables de Entorno

Copia `.env.example` a `.env.local` y actualiza las credenciales:

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=artefact_db
DB_USER=postgres
DB_PASSWORD=tu_password
```

## Estructura de Tablas

### `artistas`
Almacena la información completa de cada artista registrado.

**Campos principales:**
- Datos personales (nombre, apellido, email, teléfono, etc.)
- Dirección (país, ciudad, código postal, dirección)
- Información artística (categoría, biografía)
- Redes sociales (JSONB flexible)
- URLs de archivos (foto, CV, portfolio, identificación)
- Estado (pendiente, aprobado, rechazado)

### `fases`
Catálogo de fases de selección (Fase 1, Fase 2, Fase 3, Concurso).

**Campos principales:**
- Nombre de la fase
- Fechas de inicio y fin
- Si está activa
- Descripción

### `inscripciones_fases`
Relación muchos a muchos entre artistas y fases.

**Campos principales:**
- artista_id
- fase_id
- estado (pendiente, seleccionado, rechazado)
- votos (contador)
- fechas de inscripción y resultado

### `votos`
Registro de cada voto de los curadores.

**Campos principales:**
- inscripcion_id
- curador_email
- voto (boolean: true = aprobado, false = rechazado)
- comentario
- fecha

## API Endpoints

### POST /api/artistas
Registrar un nuevo artista.

**FormData esperado:**
```javascript
{
  // Datos personales
  nombre: string,
  apellido: string,
  email: string,
  telefono: string,
  fecha_nacimiento: date,
  pais: string,
  ciudad: string,
  codigo_postal: string,
  direccion: string,

  // Información artística
  categoria: string,
  bio: string,

  // Redes sociales
  instagram: string,
  facebook: string,
  website: string,
  portfolio_web: string,

  // Archivos (File objects)
  foto: File,
  cv: File,
  portfolio: File,
  identificacion: File
}
```

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "message": "Registro exitoso",
  "data": {
    "id": "uuid",
    "email": "artista@example.com",
    "nombre": "Juan",
    "apellido": "Pérez"
  }
}
```

### GET /api/artistas
Obtener lista de artistas (para admin).

**Query params:**
- `estado`: filtrar por estado (pendiente, aprobado, rechazado)
- `fase_id`: filtrar por fase
- `limit`: límite de resultados (default: 50)
- `offset`: offset para paginación (default: 0)

## Instalación de Dependencias

```bash
npm install pg
# o
yarn add pg
```

## Notas Importantes

1. **Cloudinary**: Los archivos se suben a Cloudinary. Configura tus credenciales en `.env.local`
2. **Email**: Configura SMTP para enviar notificaciones
3. **Seguridad**: Nunca subas `.env.local` al repositorio
4. **Backups**: Configura backups automáticos de la base de datos en producción

## Comandos Útiles

```bash
# Ver artistas registrados
psql -U postgres -d artefact_db -c "SELECT nombre, email, estado FROM artistas;"

# Ver fase activa
psql -U postgres -d artefact_db -c "SELECT * FROM fases WHERE activa = true;"

# Cambiar fase activa
psql -U postgres -d artefact_db -c "UPDATE fases SET activa = false; UPDATE fases SET activa = true WHERE id = 2;"

# Resetear la base de datos (¡CUIDADO!)
psql -U postgres -d artefact_db -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
psql -U postgres -d artefact_db -f database/schema.sql
```
