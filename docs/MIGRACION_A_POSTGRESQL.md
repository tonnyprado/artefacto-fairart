# Migración de Datos Hardcodeados a PostgreSQL

## Estado Actual

Actualmente el backend está funcionando con **datos en memoria** almacenados en el archivo:
- `backend/src/data/mockData.js`

Todos los controladores han sido modificados temporalmente para usar estos datos en lugar de consultas a PostgreSQL.

## Datos Hardcodeados Disponibles

### 1. Usuarios
```javascript
{
  id: 1,
  email: 'admin@artefact.com',
  password: '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa', // admin123
  nombre: 'Administrador',
  role: 'admin'
}
```

**Credenciales de prueba:**
- Email: `admin@artefact.com`
- Password: `admin123`

### 2. Artistas (3 registros)
- María González (Pintura)
- Carlos Ramírez (Escultura)
- Ana Torres (Fotografía)

### 3. Obras (4 registros)
- Sueños de Color ($8,500)
- Reflejo Urbano ($15,000)
- Atardecer en Oaxaca ($3,500)
- Geometría Interior ($6,000)

### 4. Eventos (2 registros)
- ARTEFACT 2026 - Primavera (Marzo 15-17)
- ARTEFACT 2026 - Otoño (Septiembre 10-12)

### 5. Paquetes (3 registros)
- Básico ($1,500)
- Estándar ($3,000)
- Premium ($5,000)

### 6. Inscripciones (3 registros)
Relaciones entre artistas y eventos con sus paquetes seleccionados

## Pasos para Migrar a PostgreSQL

### 1. Instalar y Configurar PostgreSQL

```bash
# macOS (con Homebrew)
brew install postgresql@16
brew services start postgresql@16

# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

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
cd database
psql -U postgres -d artefact_db -f schema.sql
```

### 4. Poblar con Datos Iniciales

```bash
psql -U postgres -d artefact_db -f seed.sql
```

### 5. Actualizar Configuración del Backend

Editar `backend/.env`:

```env
# Descomentar y configurar:
DB_HOST=localhost
DB_PORT=5432
DB_NAME=artefact_db
DB_USER=postgres
DB_PASSWORD=tu_password
```

### 6. Restaurar Controladores Originales

**IMPORTANTE:** Los controladores actuales en `backend/src/controllers/` tienen comentarios:
```javascript
// TEMPORAL: Usando datos hardcodeados en lugar de PostgreSQL
// TODO: Reemplazar con queries a la base de datos cuando se configure PostgreSQL
```

**Para migrar a PostgreSQL:**

1. Los archivos originales con queries de PostgreSQL ya existen en el repositorio
2. Simplemente necesitas **revertir** los cambios en los controladores
3. O puedes usar git para recuperar las versiones originales:

```bash
# Si usas git y quieres recuperar los controladores originales:
git checkout HEAD -- backend/src/controllers/*.js
```

**Alternativamente**, modifica cada controlador:
- Reemplazar `import { artistas, ... } from '../data/mockData.js'`
- Con `import { query } from '../config/database.js'`
- Restaurar las queries SQL en cada función

### 7. Archivos a Modificar

**Controladores que necesitan cambios:**
- `backend/src/controllers/artistas.controller.js`
- `backend/src/controllers/eventos.controller.js`
- `backend/src/controllers/paquetes.controller.js`
- `backend/src/controllers/inscripciones.controller.js`
- `backend/src/controllers/obras.controller.js`
- `backend/src/controllers/auth.controller.js`

**Todos estos archivos** tienen los queries SQL comentados o guardados en:
- `database/schema.sql` - Estructura de tablas
- `database/seed.sql` - Datos de ejemplo

### 8. Verificar la Migración

```bash
# Iniciar el backend
cd backend
npm run dev

# Verificar conexión a base de datos
# El servidor debería mostrar: "🚀 Servidor corriendo en puerto 4000"
# Sin errores de conexión a PostgreSQL

# Probar endpoints
curl http://localhost:4000/api/artistas
curl http://localhost:4000/api/eventos
```

## Diferencias Entre Datos en Memoria vs PostgreSQL

### Ventajas de PostgreSQL
1. **Persistencia**: Los datos NO se pierden al reiniciar el servidor
2. **Transacciones**: Operaciones atómicas y seguras
3. **Relaciones**: Foreign keys y constraints automáticos
4. **Performance**: Mejor rendimiento con grandes volúmenes
5. **Concurrencia**: Múltiples usuarios simultáneos
6. **Búsqueda avanzada**: Full-text search, índices

### Limitaciones Actuales (Datos en Memoria)
1. ❌ Los datos se pierden al reiniciar el servidor
2. ❌ No hay persistencia real
3. ❌ No hay validación de foreign keys
4. ⚠️ Solo para desarrollo y pruebas
5. ✅ Fácil de probar sin configurar base de datos

## Mantener Ambos Sistemas

Si quieres mantener la opción de usar datos en memoria O PostgreSQL:

1. Crear una variable de entorno:
```env
USE_MOCK_DATA=true  # o false para PostgreSQL
```

2. En cada controlador, usar condicionales:
```javascript
import { USE_MOCK_DATA } from '../config/index.js'

if (USE_MOCK_DATA) {
  // Usar mockData.js
} else {
  // Usar queries PostgreSQL
}
```

## Verificación Post-Migración

Después de migrar a PostgreSQL, verifica:

- [ ] Backend arranca sin errores
- [ ] Endpoint `/api/artistas` devuelve datos
- [ ] Endpoint `/api/eventos` devuelve datos
- [ ] Login funciona con `admin@artefact.com` / `admin123`
- [ ] Se pueden crear nuevos registros
- [ ] Los datos persisten después de reiniciar el servidor
- [ ] Las relaciones (foreign keys) funcionan correctamente

## Soporte

Si encuentras problemas durante la migración:

1. Revisa los logs del servidor: `backend/src/server.js`
2. Verifica la conexión a PostgreSQL: `backend/src/config/database.js`
3. Comprueba que las tablas existen: `\dt` en psql
4. Verifica que hay datos: `SELECT * FROM artistas;` en psql

---

**Fecha de este documento**: 2026-07-14
**Autor**: Sistema ARTEFACT
**Versión**: 1.0 (Datos en Memoria)
