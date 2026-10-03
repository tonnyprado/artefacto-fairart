# Lista de Verificación para Deployment - Sistema de Consignación

Este documento guía el proceso completo de deployment del sistema de hojas de consignación desde desarrollo hasta producción.

---

## Pre-Requisitos

Antes de comenzar, asegúrate de tener:

- [ ] Acceso SSH a servidor de staging
- [ ] Acceso SSH a servidor de producción
- [ ] Acceso al dashboard de Brevo (https://app.brevo.com)
- [ ] Acceso a AWS Console (S3)
- [ ] Acceso a base de datos PostgreSQL (staging y producción)
- [ ] `pg_dump` y `psql` instalados localmente
- [ ] Node.js v18+ instalado

---

## Fase 1: Preparación Local

### 1.1 Instalar Dependencias

```bash
cd /Users/tonyprado/Documents/Proyectos/Benito-web/backend
npm install
```

Verificar que se instaló PDFKit:
```bash
npm list pdfkit
# Debe mostrar: pdfkit@0.15.0
```

### 1.2 Verificar Estructura de Archivos

```bash
# Verificar que existen todos los archivos críticos
ls -la src/consigna/contenedor.js
ls -la src/consigna/http/rutas.js
ls -la src/routes/consigna.routes.js
ls -la src/config/migrations/consigna/
ls -la src/scripts/db-snapshot.js
ls -la src/scripts/db-restore.js
```

- [ ] Todos los archivos existen
- [ ] No hay errores de sintaxis (ejecutar: `node --check src/server.js`)

---

## Fase 2: Configuración de Staging

### 2.1 Crear Snapshot de Base de Datos (Staging)

**IMPORTANTE**: Siempre crear snapshot antes de ejecutar migraciones.

```bash
# En servidor de staging
npm run db:snapshot staging-pre-consigna
```

Verificar que se creó el archivo:
```bash
ls -lh backend/snapshots/
```

- [ ] Snapshot creado exitosamente
- [ ] Tamaño del archivo es razonable (> 1 MB)
- [ ] Anotar ubicación del snapshot: ______________________

### 2.2 Configurar Variables de Entorno (Staging)

Editar `/backend/.env` en staging y agregar:

```bash
# ==========================================
# SISTEMA DE CONSIGNA - STAGING
# ==========================================

# URLs y configuración general
PUBLIC_APP_URL=https://staging.arte-facto.mx/consigna
INVITACION_DIAS_VIGENCIA=4
EDICION_SUFIJO=AF2

# Datos de pago (usar datos reales de producción)
PAGO_BENEFICIARIO="ARTE FACTO S.A. de C.V."
PAGO_BANCO="BBVA"
PAGO_CLABE="012345678901234567"
PAGO_CUENTA="0123456789"
PAGO_PLAZOS="Feria: 15 días o 10 mar 2027; Post-evento: 15 días (hasta 6 meses)"

# Contacto
CONTACTO_WHATSAPP="+525578363207"
CONTACTO_URL="https://staging.arte-facto.mx/#contacto"

# S3 (usar bucket de staging)
S3_CONSIGNA_BUCKET=artefacto-consigna-staging
S3_CONSIGNA_PREFIX=af2/
FIRMA_DIRECCION_KEY=assets/firma-direccion.png

# Emails admin (usar emails de prueba en staging)
ADMIN_EMAILS=dev@arte-facto.mx,test@arte-facto.mx

# Brevo Templates (usar IDs de staging/desarrollo)
BREVO_TEMPLATE_CONSIGNA_INVITACION=4
BREVO_TEMPLATE_CONSIGNA_RECHAZO=5
BREVO_TEMPLATE_CONSIGNA_ACUERDO=6
```

- [ ] Variables agregadas a `.env`
- [ ] Valores verificados (sin typos)
- [ ] Archivo guardado

### 2.3 Crear Bucket S3 para Staging

```bash
# En AWS Console o usando AWS CLI
aws s3 mb s3://artefacto-consigna-staging --region us-east-1

# Configurar bucket como privado (ya es default, pero confirmar)
aws s3api put-public-access-block \
  --bucket artefacto-consigna-staging \
  --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

# Habilitar versionado
aws s3api put-bucket-versioning \
  --bucket artefacto-consigna-staging \
  --versioning-configuration Status=Enabled

# Configurar lifecycle para limpiar archivos viejos (opcional)
aws s3api put-bucket-lifecycle-configuration \
  --bucket artefacto-consigna-staging \
  --lifecycle-configuration file://s3-lifecycle.json
```

Contenido de `s3-lifecycle.json`:
```json
{
  "Rules": [{
    "Id": "DeleteOldSnapshots",
    "Status": "Enabled",
    "Prefix": "snapshots/",
    "Expiration": {
      "Days": 90
    }
  }]
}
```

- [ ] Bucket creado
- [ ] Bucket es privado (verificado)
- [ ] Versionado habilitado
- [ ] Lifecycle configurado (opcional)

### 2.4 Subir Firma Digital a S3

```bash
# Crear imagen de firma (puede ser un PNG transparente con la firma de la dirección)
# Dimensiones recomendadas: 300x100 px

aws s3 cp firma-direccion.png s3://artefacto-consigna-staging/assets/firma-direccion.png \
  --content-type image/png
```

- [ ] Imagen de firma subida
- [ ] Ruta correcta: `assets/firma-direccion.png`

### 2.5 Ejecutar Migraciones SQL (Staging)

```bash
# En servidor de staging
npm run consigna:migrate
```

Salida esperada:
```
Ejecutando: 000_roles.sql
Ejecutando: 001_esquema_consigna.sql
Ejecutando: 002_vistas_lectura.sql
✅ Migraciones completadas
```

Verificar en base de datos:
```sql
-- Conectar a PostgreSQL
psql -h localhost -U postgres -d benito_staging

-- Verificar que existe el esquema
\dn consigna

-- Verificar tablas creadas
\dt consigna.*

-- Verificar vistas
\dv consigna.*

-- Verificar rol
\du consigna_app

-- Probar vista de artistas
SELECT * FROM consigna.v_artistas_seleccionados LIMIT 5;

-- Probar vista de obras
SELECT * FROM consigna.v_obras_postuladas LIMIT 5;
```

- [ ] Migraciones ejecutadas sin errores
- [ ] Esquema `consigna` existe
- [ ] 5 tablas creadas: `invitaciones`, `borradores`, `acuerdos`, `acuerdo_obras`, `eventos`
- [ ] 2 vistas creadas: `v_artistas_seleccionados`, `v_obras_postuladas`
- [ ] Rol `consigna_app` existe
- [ ] Vistas devuelven datos correctamente

**Si algo falla:**
```bash
# Restaurar snapshot
npm run db:restore staging-pre-consigna
```

### 2.6 Reiniciar Servidor Backend (Staging)

```bash
# Método depende de tu configuración (PM2, systemd, etc.)

# Con PM2:
pm2 restart benito-backend

# Con systemd:
sudo systemctl restart benito-backend

# Verificar que inició correctamente
pm2 logs benito-backend --lines 50
# O
sudo journalctl -u benito-backend -n 50
```

Buscar en logs:
```
✅ Módulo Consigna cargado (público + admin)
```

- [ ] Servidor reiniciado
- [ ] Sin errores en logs
- [ ] Mensaje "Módulo Consigna cargado" presente

### 2.7 Verificar Endpoints (Staging)

```bash
# Obtener token de admin
TOKEN="tu-token-admin-aqui"

# Test endpoint público (debe retornar 404 con token inválido)
curl https://staging.arte-facto.mx/api/consigna/TEST123/contexto
# Esperado: {"error": "Token inválido o expirado"}

# Test endpoint admin - listar invitaciones
curl -H "Authorization: Bearer $TOKEN" \
  https://staging.arte-facto.mx/api/admin/consigna/invitaciones?edicion=AF2
# Esperado: {"success": true, "data": []}

# Test endpoint admin - estadísticas
curl -H "Authorization: Bearer $TOKEN" \
  https://staging.arte-facto.mx/api/admin/consigna/estadisticas?edicion=AF2
# Esperado: {"success": true, "data": {...}}
```

- [ ] Endpoint público responde correctamente
- [ ] Endpoints admin requieren autenticación
- [ ] Endpoints admin funcionan con token válido
- [ ] No hay errores 500

---

## Fase 3: Configurar Plantillas Brevo

### 3.1 Crear Templates en Dashboard

Seguir instrucciones en `/docs/BREVO_TEMPLATES.md`

1. Ir a https://app.brevo.com/campaign/template/create
2. Crear Template 1: CONSIGNA_INVITACION
3. Crear Template 2: CONSIGNA_RECHAZO
4. Crear Template 3: CONSIGNA_ACUERDO

- [ ] Template 1 creado (ID: _____)
- [ ] Template 2 creado (ID: _____)
- [ ] Template 3 creado (ID: _____)

### 3.2 Actualizar IDs en .env

Editar `/backend/.env` en staging:

```bash
# Usar los IDs reales asignados por Brevo
BREVO_TEMPLATE_CONSIGNA_INVITACION=4
BREVO_TEMPLATE_CONSIGNA_RECHAZO=5
BREVO_TEMPLATE_CONSIGNA_ACUERDO=6
```

Reiniciar servidor para aplicar cambios:
```bash
pm2 restart benito-backend
```

- [ ] IDs actualizados en `.env`
- [ ] Servidor reiniciado

### 3.3 Probar Envío de Emails

Crear archivo de prueba `test-email.js`:

```javascript
import { sendEmailWithTemplate } from './src/services/email.service.js'

// Test Template 1 - Invitación
await sendEmailWithTemplate({
  to: 'tu-email@ejemplo.com',
  toName: 'Test Artista',
  templateId: 4, // ID real de Brevo
  params: {
    nombre: 'María',
    edicion: 'AF2',
    link_consigna: 'https://staging.arte-facto.mx/consigna/TEST123',
    folio: 'AF2-TEST',
    dias_vigencia: 21
  }
})

console.log('✅ Email de invitación enviado')

// Test Template 2 - Rechazo
await sendEmailWithTemplate({
  to: 'tu-email@ejemplo.com',
  toName: 'Test Artista',
  templateId: 5,
  params: {
    nombre: 'Carlos',
    edicion: 'AF2'
  }
})

console.log('✅ Email de rechazo enviado')
```

Ejecutar:
```bash
node test-email.js
```

- [ ] Email 1 (invitación) recibido correctamente
- [ ] Email 2 (rechazo) recibido correctamente
- [ ] Variables renderizadas correctamente
- [ ] Links funcionan
- [ ] Formato correcto en desktop y móvil

---

## Fase 4: Testing End-to-End (Staging)

### 4.1 Preparar Datos de Prueba

Asegurarse de tener al menos un artista en estado `aprobado = false` para probar el flujo completo.

```sql
-- En staging DB
INSERT INTO public.artistas (nombre, apellido, email, folio, aprobado, estado_registro)
VALUES
  ('Test', 'Artista', 'test@ejemplo.com', 'AF2-TEST001', false, 'pendiente'),
  ('María', 'Prueba', 'maria@ejemplo.com', 'AF2-TEST002', false, 'pendiente');

-- Insertar obras para los artistas
INSERT INTO public.obras (artista_id, titulo, tecnica, anio, alto_cm, ancho_cm, precio_mxn)
VALUES
  (
    (SELECT id FROM public.artistas WHERE email = 'test@ejemplo.com'),
    'Obra de Prueba 1',
    'Óleo sobre lienzo',
    2024,
    100,
    80,
    5000
  ),
  (
    (SELECT id FROM public.artistas WHERE email = 'test@ejemplo.com'),
    'Obra de Prueba 2',
    'Acrílico',
    2023,
    60,
    60,
    3000
  );
```

- [ ] Artistas de prueba creados
- [ ] Obras de prueba asociadas

### 4.2 Test 1: Aprobar Artista y Recibir Email

1. Login al panel admin (staging)
2. Ir a sección "Artistas"
3. Aprobar artista "Test Artista"
4. Verificar que email de invitación se envió

- [ ] Email recibido en bandeja de entrada
- [ ] Link único presente en email
- [ ] Link tiene formato correcto: `https://staging.arte-facto.mx/consigna/{TOKEN}`

### 4.3 Test 2: Completar Formulario de Consignación

1. Abrir link del email
2. Verificar que página carga correctamente
3. Completar 12 pasos:
   - Paso 1-8: Leer y aceptar cláusulas
   - Paso 9: Subir constancia fiscal (PDF de prueba)
   - Paso 10: Editar precios de obras
   - Paso 11: Firmar en lienzo
   - Paso 12: Revisar y enviar

Verificaciones durante el proceso:
- [ ] Paso 1: Bienvenida muestra nombre y folio correctos
- [ ] Paso 2-8: Cláusulas renderizadas correctamente
- [ ] Paso 9: Upload de constancia fiscal funciona
- [ ] Paso 10: Tabla de obras muestra datos correctos
- [ ] Paso 10: Desglose de precios se calcula correctamente
- [ ] Paso 10: Cambios se guardan automáticamente
- [ ] Paso 11: Lienzo de firma funciona (mouse y touch)
- [ ] Paso 11: Botón "Limpiar" funciona
- [ ] Paso 12: Vista previa PDF se genera
- [ ] Paso 12: Descarga de vista previa funciona
- [ ] Paso 12: Botón "Enviar Acuerdo" funciona

### 4.4 Test 3: Verificar PDF Generado

Después de enviar el acuerdo:

- [ ] Email con PDF recibido
- [ ] PDF adjunto se puede abrir
- [ ] PDF contiene:
  - [ ] Información del artista
  - [ ] Tabla de obras con precios
  - [ ] Firma digital del artista
  - [ ] Cláusulas completas
  - [ ] Información de pago
  - [ ] Firma de la dirección

### 4.5 Test 4: Verificar Panel Admin

1. Login al panel admin
2. Ir a "Artistas" → Sub-tab "Aceptados"

Verificar:
- [ ] Tabla muestra artista aprobado
- [ ] Estado invitación: "Completada"
- [ ] Hoja consigna: "Firmada"
- [ ] Situación fiscal: "Cargada"
- [ ] Botón "Descargar PDF" funciona
- [ ] PDF descargado es idéntico al recibido por email

### 4.6 Test 5: Verificar Datos en Base de Datos

```sql
-- Verificar invitación creada
SELECT * FROM consigna.invitaciones WHERE edicion = 'AF2';

-- Verificar acuerdo firmado
SELECT * FROM consigna.acuerdos WHERE artista_id = (
  SELECT id FROM artistas WHERE email = 'test@ejemplo.com'
);

-- Verificar obras en acuerdo
SELECT * FROM consigna.acuerdo_obras WHERE acuerdo_id IN (
  SELECT id FROM consigna.acuerdos WHERE artista_id = (
    SELECT id FROM artistas WHERE email = 'test@ejemplo.com'
  )
);

-- Verificar eventos registrados
SELECT * FROM consigna.eventos ORDER BY ocurrido_en DESC LIMIT 10;

-- Verificar archivos en S3
SELECT pdf_key, constancia_fiscal_key FROM consigna.acuerdos;
```

- [ ] Invitación existe con estado correcto
- [ ] Acuerdo existe con datos completos
- [ ] Obras del acuerdo registradas
- [ ] Eventos del proceso registrados
- [ ] Archivos en S3 existen (verificar en AWS Console)

### 4.7 Test 6: Probar en Dispositivos Móviles

**iOS Safari:**
1. Abrir link en iPhone/iPad
2. Completar formulario completo
3. Verificar firma táctil funciona

- [ ] Página se ve correctamente
- [ ] Todos los pasos funcionan
- [ ] Firma táctil funciona en orientación vertical
- [ ] Firma táctil funciona en orientación horizontal
- [ ] PDF se genera correctamente

**Android Chrome:**
1. Abrir link en Android
2. Completar formulario completo
3. Verificar firma táctil funciona

- [ ] Página se ve correctamente
- [ ] Todos los pasos funcionan
- [ ] Firma táctil funciona
- [ ] PDF se genera correctamente

### 4.8 Test 7: Casos Edge

**Token Expirado:**
```sql
-- Hacer que un token expire
UPDATE consigna.invitaciones
SET expira_en = NOW() - INTERVAL '1 day'
WHERE artista_id = (SELECT id FROM artistas WHERE email = 'test@ejemplo.com');
```
- [ ] Abrir link muestra error 410 "Token expirado"

**Token Inválido:**
- [ ] Abrir `https://staging.arte-facto.mx/consigna/TOKENINVALIDO` muestra error 404

**Artista con Muchas Obras (>12):**
```sql
-- Crear artista con 20 obras
-- Verificar que tabla de precios pagina correctamente
-- Verificar que PDF incluye todas las obras
```
- [ ] Tabla de precios funciona con scroll
- [ ] PDF incluye todas las obras (puede ser multi-página)

**Rechazo de Artista:**
1. Rechazar un artista desde panel admin
2. Verificar que email de rechazo se envía

- [ ] Email de rechazo recibido
- [ ] Contenido del email es apropiado

### 4.9 Verificar Performance

```bash
# Test de carga con Apache Bench (opcional)
ab -n 100 -c 10 https://staging.arte-facto.mx/api/consigna/TEST123/contexto
```

- [ ] Endpoint responde en < 500ms
- [ ] No hay memory leaks (verificar con `pm2 monit`)
- [ ] PDF se genera en < 5 segundos

---

## Fase 5: Deployment a Producción

### 5.1 Crear Snapshot de Producción

**CRÍTICO**: Snapshot de producción antes de cualquier cambio.

```bash
# En servidor de producción
npm run db:snapshot production-pre-consigna-$(date +%Y%m%d)
```

- [ ] Snapshot creado
- [ ] Tamaño verificado (> 10 MB esperado)
- [ ] Archivo respaldado en ubicación segura externa

### 5.2 Merge y Deploy de Código

```bash
# En local
git checkout main
git pull origin main

# Verificar que todos los cambios están commiteados
git status

# Tag de versión
git tag -a v1.1.0-consigna -m "Sistema de hojas de consignación"
git push origin v1.1.0-consigna

# Deploy a producción (método depende de tu setup)
# Ejemplo con deploy script:
./scripts/deploy-production.sh
```

- [ ] Código mergeado a main
- [ ] Tag de versión creado
- [ ] Deploy ejecutado sin errores
- [ ] Dependencias instaladas (`npm install` en producción)

### 5.3 Configurar Variables de Entorno (Producción)

Editar `/backend/.env` en producción:

```bash
# SISTEMA DE CONSIGNA - PRODUCCIÓN
PUBLIC_APP_URL=https://arte-facto.mx/consigna
INVITACION_DIAS_VIGENCIA=4
EDICION_SUFIJO=AF2

# Datos de pago (USAR DATOS REALES)
PAGO_BENEFICIARIO="ARTE FACTO S.A. de C.V."
PAGO_BANCO="BBVA"
PAGO_CLABE="[CLABE REAL]"
PAGO_CUENTA="[CUENTA REAL]"
PAGO_PLAZOS="Feria: 15 días o 10 mar 2027; Post-evento: 15 días (hasta 6 meses)"

# Contacto (USAR DATOS REALES)
CONTACTO_WHATSAPP="+525578363207"
CONTACTO_URL="https://arte-facto.mx/#contacto"

# S3 Producción
S3_CONSIGNA_BUCKET=artefacto-consigna-prod
S3_CONSIGNA_PREFIX=af2/
FIRMA_DIRECCION_KEY=assets/firma-direccion.png

# Emails admin (USAR EMAILS REALES)
ADMIN_EMAILS=admin@arte-facto.mx,curatorial@arte-facto.mx

# Brevo Templates (IDs de producción)
BREVO_TEMPLATE_CONSIGNA_INVITACION=[ID REAL]
BREVO_TEMPLATE_CONSIGNA_RECHAZO=[ID REAL]
BREVO_TEMPLATE_CONSIGNA_ACUERDO=[ID REAL]
```

- [ ] Variables configuradas con datos reales
- [ ] Sin datos de prueba
- [ ] Archivo guardado

### 5.4 Crear Bucket S3 de Producción

```bash
aws s3 mb s3://artefacto-consigna-prod --region us-east-1

aws s3api put-public-access-block \
  --bucket artefacto-consigna-prod \
  --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

aws s3api put-bucket-versioning \
  --bucket artefacto-consigna-prod \
  --versioning-configuration Status=Enabled

# Subir firma
aws s3 cp firma-direccion.png s3://artefacto-consigna-prod/assets/firma-direccion.png
```

- [ ] Bucket creado
- [ ] Bucket privado
- [ ] Versionado habilitado
- [ ] Firma subida

### 5.5 Ejecutar Migraciones en Producción

```bash
# En servidor de producción
npm run consigna:migrate
```

Verificar migraciones exitosas (ver sección 2.5).

- [ ] Migraciones ejecutadas sin errores
- [ ] Esquema `consigna` creado
- [ ] Tablas y vistas funcionando

**Si algo falla:**
```bash
npm run db:restore production-pre-consigna-YYYYMMDD
```

### 5.6 Reiniciar Servidor (Producción)

```bash
pm2 restart benito-backend
pm2 logs benito-backend --lines 100
```

Buscar:
```
✅ Módulo Consigna cargado (público + admin)
```

- [ ] Servidor reiniciado
- [ ] Sin errores en logs
- [ ] Módulo cargado correctamente

### 5.7 Smoke Test en Producción

```bash
# Test básico de endpoints
curl https://arte-facto.mx/api/consigna/TEST/contexto
# Esperado: error 404

curl -H "Authorization: Bearer $TOKEN" \
  https://arte-facto.mx/api/admin/consigna/estadisticas?edicion=AF2
# Esperado: JSON con estadísticas
```

- [ ] Endpoints responden
- [ ] No hay errores 500
- [ ] Autenticación funciona

---

## Fase 6: Monitoreo Post-Deploy

### 6.1 Monitoreo Primeras 24 Horas

```bash
# Ver logs en tiempo real
pm2 logs benito-backend --lines 200

# Buscar errores
grep -i "error" /var/log/benito-backend/error.log | tail -50

# Monitorear uso de memoria
pm2 monit
```

Verificar:
- [ ] No hay errores recurrentes
- [ ] Uso de memoria es estable
- [ ] No hay memory leaks
- [ ] Tiempos de respuesta normales

### 6.2 Verificar Primer Uso Real

Cuando el primer artista complete su hoja de consignación:

- [ ] Email de invitación se envió correctamente
- [ ] Artista pudo abrir el link
- [ ] Formulario funcionó sin problemas
- [ ] PDF se generó correctamente
- [ ] Email con PDF se recibió
- [ ] Admin puede ver y descargar PDF
- [ ] Datos en BD son correctos

### 6.3 Métricas a Monitorear

**Base de Datos:**
```sql
-- Cuántas invitaciones generadas
SELECT COUNT(*) FROM consigna.invitaciones WHERE edicion = 'AF2';

-- Cuántas completadas
SELECT COUNT(*) FROM consigna.acuerdos WHERE invitacion_id IN (
  SELECT id FROM consigna.invitaciones WHERE edicion = 'AF2'
);

-- Tasa de conversión
SELECT
  (SELECT COUNT(*)::float FROM consigna.acuerdos WHERE invitacion_id IN (
    SELECT id FROM consigna.invitaciones WHERE edicion = 'AF2'
  )) / NULLIF((SELECT COUNT(*)::float FROM consigna.invitaciones WHERE edicion = 'AF2'), 0) * 100
  AS tasa_conversion;
```

**S3:**
```bash
# Cuántos archivos subidos
aws s3 ls s3://artefacto-consigna-prod/af2/ --recursive | wc -l

# Tamaño total usado
aws s3 ls s3://artefacto-consigna-prod/af2/ --recursive --human-readable --summarize
```

**Logs:**
```bash
# Emails enviados exitosamente
grep "✅ Email" /var/log/benito-backend/combined.log | wc -l

# Errores de email
grep "⚠️.*email" /var/log/benito-backend/error.log
```

---

## Rollback Plan

Si algo sale mal en producción:

### Opción 1: Rollback de Base de Datos

```bash
# Restaurar snapshot
npm run db:restore production-pre-consigna-YYYYMMDD

# Reiniciar servidor con código anterior
pm2 restart benito-backend
```

### Opción 2: Deshabilitar Módulo sin Rollback

Editar `/backend/src/server.js`:
```javascript
// Comentar integración de consigna
// try {
//   const { controller } = crearContenedor()
//   app.use('/api/consigna', rutasConsigna(controller))
//   app.use('/api/admin/consigna', consignaAdminRoutes)
// } catch (error) {
//   console.error('❌ Error al cargar Consigna:', error.message)
// }
```

Reiniciar:
```bash
pm2 restart benito-backend
```

---

## Checklist Final

### Pre-Deploy
- [ ] Código completo en repositorio
- [ ] Tests pasando localmente
- [ ] Documentación actualizada
- [ ] Snapshots de BD creados (staging + producción)

### Staging
- [ ] Migraciones ejecutadas
- [ ] Variables de entorno configuradas
- [ ] S3 bucket configurado
- [ ] Templates Brevo creados y probados
- [ ] Testing end-to-end completado
- [ ] Testing en móviles completado
- [ ] Performance aceptable

### Producción
- [ ] Snapshot de producción creado
- [ ] Código deployd
- [ ] Variables de entorno configuradas (datos reales)
- [ ] S3 bucket de producción configurado
- [ ] Migraciones ejecutadas
- [ ] Servidor reiniciado sin errores
- [ ] Smoke tests pasando

### Post-Deploy
- [ ] Monitoreo activo primeras 24h
- [ ] Logs sin errores críticos
- [ ] Primer uso real exitoso
- [ ] Métricas registradas
- [ ] Rollback plan documentado

---

## Contactos de Emergencia

**En caso de problemas críticos, contactar:**

- DevOps: _________________
- DBA: _________________
- Backend Lead: _________________

**Recursos:**
- Documentación: `/docs/CONSIGNA.md`
- Templates Brevo: `/docs/BREVO_TEMPLATES.md`
- Snapshots BD: `/backend/snapshots/`
- Logs: `/var/log/benito-backend/`
