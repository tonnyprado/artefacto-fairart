# Base de Datos - ARTEFACT

Estructura de base de datos PostgreSQL para el proyecto ARTEFACT Feria de Arte.

## Configuración Inicial

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

### `obras`
Obras de arte de cada artista.

### `eventos`
Ferias y eventos organizados por ARTEFACT.

### `paquetes`
Paquetes de inscripción con diferentes precios y beneficios.

### `inscripciones`
Registro de artistas inscritos a eventos específicos.

### `contenido`
Páginas, noticias y otro contenido general del sitio.

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
