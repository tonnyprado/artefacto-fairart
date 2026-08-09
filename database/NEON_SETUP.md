# 🚀 Configuración de Base de Datos en Neon

Guía rápida para configurar tu base de datos PostgreSQL en Neon y crear el usuario admin.

## 📋 Prerequisitos

- Cuenta en [Neon](https://neon.tech) (gratis)
- Un proyecto creado en Neon

## 🎯 Método Rápido (Recomendado) - 5 minutos

### Paso 1: Acceder al SQL Editor de Neon

1. Ve a [console.neon.tech](https://console.neon.tech)
2. Selecciona tu proyecto
3. Haz clic en **"SQL Editor"** en el menú lateral izquierdo

### Paso 2: Ejecutar Schema (Crear Tablas)

1. Abre el archivo `schema.sql` de este directorio
2. **Copia TODO el contenido** del archivo
3. Pega en el SQL Editor de Neon
4. Haz clic en **"Run"** (o presiona Ctrl/Cmd + Enter)
5. Deberías ver un mensaje de éxito ✅

### Paso 3: Ejecutar Seed (Datos Iniciales)

1. Abre el archivo `seed.sql` de este directorio
2. **Copia TODO el contenido** del archivo
3. Pega en el SQL Editor de Neon
4. Haz clic en **"Run"**
5. Deberías ver los datos insertados ✅

### Paso 4: Verificar que el Admin se creó

Ejecuta esta consulta en el SQL Editor:

```sql
SELECT id, email, nombre, role, created_at
FROM usuarios
WHERE email = 'admin@artefact.com';
```

Deberías ver:
```
id | email                  | nombre          | role  | created_at
1  | admin@artefact.com     | Admin Principal | admin | 2026-08-09...
```

### Paso 5: Configurar Backend

1. Ve a Neon Console → Tu Proyecto → "Connection Details"
2. Copia el **Connection string** (formato: `postgresql://user:pass@host/db?sslmode=require`)
3. Abre `backend/.env`
4. Descomenta y actualiza la línea `DATABASE_URL`:

```env
# Descomentar esta línea y poner tu connection string de Neon
DATABASE_URL=postgresql://tu_user:tu_password@ep-xxx.neon.tech/neondb?sslmode=require
```

5. También puedes comentar/eliminar las variables individuales de DB:

```env
# Ya no necesitas estas si usas DATABASE_URL
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=artefact_db
# DB_USER=postgres
# DB_PASSWORD=your_password
```

### Paso 6: Reiniciar Backend

```bash
cd backend
npm run dev
```

¡Listo! Ahora tu backend está conectado a Neon.

## 🔐 Credenciales de Admin

```
Email:    admin@artefact.com
Password: admin123
```

**⚠️ IMPORTANTE:** Cambia la contraseña del admin después del primer login en producción.

## 🔧 Método Alternativo - Script Automatizado

Si prefieres automatizar todo el proceso:

```bash
cd database

# Instalar dependencia (solo primera vez)
npm install pg

# Ejecutar script (reemplaza con tu connection string de Neon)
node setup-neon.js "postgresql://user:pass@host.neon.tech/db?sslmode=require"
```

El script hará todo automáticamente:
- ✅ Crear todas las tablas
- ✅ Insertar datos iniciales
- ✅ Crear usuario admin
- ✅ Crear configuración del sitio
- ✅ Crear paquetes de ejemplo

## 🆘 Si ya tienes las tablas creadas

Si solo necesitas crear el usuario admin (ya tienes las tablas):

1. Ve al SQL Editor de Neon
2. Ejecuta el contenido de `create-admin.sql`:

```sql
INSERT INTO usuarios (email, password, nombre, role)
VALUES (
  'admin@artefact.com',
  '$2a$10$6M62/oODgMNGizQENsGY.ObsynGWcQbEBMEq04QQkpSaYE2itDTM.',
  'Admin Principal',
  'admin'
)
ON CONFLICT (email) DO NOTHING;
```

## 🐛 Troubleshooting

### Error: "relation usuarios does not exist"
- Las tablas no se crearon. Ejecuta primero `schema.sql`

### Error: "duplicate key value violates unique constraint"
- El admin ya existe. Puedes verificarlo con:
  ```sql
  SELECT * FROM usuarios WHERE email = 'admin@artefact.com';
  ```

### Backend no conecta a la base de datos
- Verifica que `DATABASE_URL` esté descomentada en `backend/.env`
- Verifica que el connection string incluya `?sslmode=require`
- Verifica que el backend esté reiniciado después de cambiar `.env`

### ¿Cómo saber si mi backend está usando Neon?
Revisa los logs del backend al iniciar. Deberías ver:
```
✅ Database connected successfully
```

## 📚 Recursos

- [Neon Documentation](https://neon.tech/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- `database/schema.sql` - Estructura de todas las tablas
- `database/seed.sql` - Datos de ejemplo y configuración inicial
