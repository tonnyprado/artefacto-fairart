# Base de Datos - ARTEFACT

Estructura de base de datos PostgreSQL para el proyecto ARTEFACT Feria de Arte.

## 🚀 Configuración Rápida con Neon (Recomendado)

### Opción A: Usando la consola SQL de Neon (Más Rápido)

1. Ve a [Neon Console](https://console.neon.tech) y abre tu proyecto
2. Haz clic en **"SQL Editor"** en el menú lateral
3. Copia y pega el contenido de `schema.sql` y ejecuta
4. Copia y pega el contenido de `seed.sql` y ejecuta
5. ¡Listo! Tu admin está creado con:
   - **Email:** `admin@artefact.com`
   - **Password:** `admin123`

### Opción B: Usando el script automatizado

```bash
cd database

# Con Node.js (no requiere psql instalado)
npm install pg  # Instalar dependencia si no la tienes
node setup-neon.js "postgresql://user:password@host.neon.tech/dbname?sslmode=require"

# O con bash (requiere psql instalado)
./setup-neon.sh "postgresql://user:password@host.neon.tech/dbname?sslmode=require"
```

**Obtén tu Connection String desde:**
- Neon Console → Tu Proyecto → "Connection String" (copia el string completo)

### Actualizar Backend

Una vez configurada la BD, actualiza `backend/.env`:

```env
# Descomentar y actualizar con tu URL de Neon
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
```

---

## 🔧 Configuración Local (Alternativa)

### 1. Instalar PostgreSQL

**macOS (con Homebrew):**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Descargar e instalar desde [postgresql.org](https://www.postgresql.org/download/windows/)

### 2. Crear la Base de Datos

```bash
# Acceder a PostgreSQL
psql postgres

# Crear la base de datos
CREATE DATABASE artefact_db;

# Crear usuario (opcional)
CREATE USER artefact_user WITH PASSWORD 'tu_password_seguro';
GRANT ALL PRIVILEGES ON DATABASE artefact_db TO artefact_user;

# Salir
\q
```

### 3. Ejecutar el Schema

```bash
# Conectarse a la base de datos y ejecutar el schema
psql -U postgres -d artefact_db -f schema.sql

# O si creaste un usuario personalizado
psql -U artefact_user -d artefact_db -f schema.sql
```

### 4. Poblar con Datos de Ejemplo (Opcional)

```bash
psql -U postgres -d artefact_db -f seed.sql
```

## Estructura de Tablas

### `usuarios`
Administradores del sistema que pueden gestionar contenido.

### `artistas`
Información de los artistas que participan en las ferias.
- El campo `categoria` determina qué tipo de paquetes puede seleccionar:
  - `escultura` → solo paquetes 3D
  - Otras categorías → solo paquetes 2D

### `obras`
Obras de arte de cada artista.

### `eventos`
Ferias y eventos organizados por ARTEFACT.

### `paquetes`
Paquetes de inscripción con diferentes precios y beneficios.
- **Paquetes 2D** (obra bidimensional - pared):
  - Tienen `tipo = '2D'`
  - Usan `metros_lineales` y `altura_pared` para definir el espacio
  - Para: Pintura, Fotografía, Ilustración, Grabado, etc.
- **Paquetes 3D** (obra tridimensional - base/piso):
  - Tienen `tipo = '3D'`
  - Usan `metros_cuadrados` para definir el espacio de base
  - Para: Escultura, Instalación, Cerámica, etc.
- Los precios varían por fase:
  - `precio_fase1`: Fase I con -20% de descuento
  - `precio_fase2`: Fase II con -10% de descuento
  - `precio_fase3` / `precio`: Precio completo en Fase III

### `inscripciones`
Registro de artistas inscritos a eventos específicos.

### `contenido`
Páginas, noticias y otro contenido general del sitio.

## Migraciones

### Migration 001: Agregar campos tipo y metros_cuadrados a paquetes
Ver: `database/migrations/001_add_paquetes_tipo_fields.sql`

Esta migración agrega soporte para diferenciar paquetes bidimensionales (2D) y tridimensionales (3D):
- Agrega campo `tipo` con valores '2D' o '3D'
- Agrega campo `metros_cuadrados` para paquetes 3D
- Actualiza paquetes existentes con su tipo correcto
- Establece metros cuadrados para paquetes 3D según convocatoria

**Para aplicar la migración:**
```bash
psql -U postgres -d artefact_db -f database/migrations/001_add_paquetes_tipo_fields.sql
```

## Comandos Útiles de PostgreSQL

```bash
# Listar bases de datos
\l

# Conectarse a una base de datos
\c artefact_db

# Listar tablas
\dt

# Ver estructura de una tabla
\d nombre_tabla

# Ejecutar archivo SQL
\i ruta/al/archivo.sql
```

## Respaldo y Restauración

### Crear respaldo
```bash
pg_dump -U postgres artefact_db > backup.sql
```

### Restaurar desde respaldo
```bash
psql -U postgres artefact_db < backup.sql
```

## Notas

- El usuario admin por defecto tiene email: `admin@artefact.com` y password: `admin123`
- Cambiar la contraseña del admin en producción
- Los datos de `seed.sql` son solo para desarrollo y pruebas
