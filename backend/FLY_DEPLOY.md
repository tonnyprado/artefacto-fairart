# Deploy a Fly.io - Guía Paso a Paso

## Requisitos Previos
- Tarjeta de crédito (para verificación, no se cobra en free tier)
- Cuenta en Fly.io

## Paso 1: Instalar Fly CLI

### macOS
```bash
curl -L https://fly.io/install.sh | sh
```

### Agregar al PATH
```bash
echo 'export PATH="$HOME/.fly/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### Verificar instalación
```bash
fly version
```

## Paso 2: Login en Fly.io

```bash
fly auth login
```

Se abrirá el navegador para autenticarte.

## Paso 3: Crear App y PostgreSQL

```bash
cd backend

# Crear app (NO hacer deploy todavía)
fly launch --no-deploy

# Cuando pregunte:
# - App name: artefacto-backend (o el que prefieras)
# - Region: iad (Virginia - cerca de AWS RDS)
# - PostgreSQL: SÍ (seleccionar)
# - Redis: NO

# Configuración PostgreSQL recomendada:
# - Development (256MB) - Gratis
# - O Production si necesitas más
```

## Paso 4: Configurar Variables de Entorno

```bash
# Copiar del .env actual y pegar uno por uno:

fly secrets set NODE_ENV=production
fly secrets set JWT_SECRET=tu_jwt_secret_aqui
fly secrets set EDICION_SUFIJO=AF2

# AWS S3 (usar las credenciales de tu .env)
fly secrets set AWS_REGION=us-east-2
fly secrets set AWS_ACCESS_KEY_ID=TU_AWS_ACCESS_KEY_AQUI
fly secrets set AWS_SECRET_ACCESS_KEY=TU_AWS_SECRET_KEY_AQUI
fly secrets set AWS_S3_BUCKET_NAME=artefacto-artistas

# Email (si usas)
fly secrets set EMAIL_FROM=tu_email@ejemplo.com
# ... otros secretos
```

## Paso 5: Obtener Credenciales de PostgreSQL

```bash
fly postgres connect -a artefacto-backend-db

# Dentro de psql:
\conninfo

# Tomar nota de:
# - Host
# - Port
# - Database
# - User
# - Password
```

## Paso 6: Migrar Datos desde AWS RDS

### Opción A: Dump y Restore

```bash
# 1. Hacer dump de AWS RDS
pg_dump -h database-1.c92k2sa2ka4j.us-east-2.rds.amazonaws.com \
  -U postgres -d postgres \
  --no-owner --no-acl \
  -f backup.sql

# 2. Restaurar en Fly PostgreSQL
fly postgres connect -a artefacto-backend-db < backup.sql
```

### Opción B: Migración Manual (más control)

Ver scripts en `/database/migrations/`

## Paso 7: Configurar DATABASE_URL

```bash
# La URL de conexión sigue el formato:
# postgresql://usuario:password@host:port/database

fly secrets set DATABASE_URL="postgresql://postgres:PASSWORD@artefacto-backend-db.flycast:5432/artefacto_backend"
```

## Paso 8: Deploy

```bash
fly deploy

# Ver logs en tiempo real
fly logs
```

## Paso 9: Verificar Health

```bash
# Ver status
fly status

# Ver URL de la app
fly apps list

# Probar health check
curl https://artefacto-backend.fly.dev/health
```

## Paso 10: Configurar Cron Jobs

Los cron jobs se configuran con Fly Machines. Ver `FLY_CRON.md` para detalles.

## Comandos Útiles

```bash
# Ver logs
fly logs

# SSH a la máquina
fly ssh console

# Escalar
fly scale count 2

# Ver métricas
fly dashboard

# Reiniciar
fly apps restart artefacto-backend

# Ver secretos configurados
fly secrets list
```

## Costo Estimado

- **App (1 VM shared-cpu-1x 512MB):** ~$5-8/mes
- **PostgreSQL Development:** GRATIS
- **PostgreSQL Production (1GB):** ~$4/mes
- **Tráfico:** Primer GB gratis, después $0.02/GB

**Total mensual: ~$5-12/mes**

## Troubleshooting

### Error de build
```bash
fly logs
```

### Error de conexión a PostgreSQL
```bash
# Verificar que DATABASE_URL está correcto
fly secrets list

# Probar conexión interna
fly ssh console
nc -zv artefacto-backend-db.flycast 5432
```

### Health check falla
Verificar que `/health` endpoint existe y responde 200.
