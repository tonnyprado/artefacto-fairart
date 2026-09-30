# Guía Rápida - Sistema de Consignación

Comandos y operaciones comunes para administrar el sistema de hojas de consignación.

---

## Comandos NPM

### Base de Datos

```bash
# Crear snapshot de base de datos
npm run db:snapshot [nombre-opcional]

# Ejemplo con nombre personalizado
npm run db:snapshot pre-migration-2024-03-15

# Restaurar snapshot
npm run db:restore nombre-del-snapshot

# Ejecutar migraciones de consigna
npm run consigna:migrate
```

### Invitaciones

```bash
# Generar invitaciones para artistas aprobados
npm run consigna:invitaciones [edicion]

# Ejemplo para edición AF2
npm run consigna:invitaciones AF2

# Salida: CSV con tokens y URLs
# artista_id,folio,nombre,correo,url,expira_en
```

---

## SQL Queries Útiles

### Estadísticas Generales

```sql
-- Resumen de invitaciones por edición
SELECT
  edicion,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE abierta_en IS NOT NULL) as abiertas,
  COUNT(*) FILTER (WHERE revocada = true) as revocadas
FROM consigna.invitaciones
GROUP BY edicion;

-- Tasa de conversión
SELECT
  i.edicion,
  COUNT(DISTINCT i.id) as invitaciones_enviadas,
  COUNT(DISTINCT a.id) as acuerdos_completados,
  ROUND(
    COUNT(DISTINCT a.id)::numeric / NULLIF(COUNT(DISTINCT i.id), 0) * 100,
    2
  ) as tasa_conversion_pct
FROM consigna.invitaciones i
LEFT JOIN consigna.acuerdos a ON a.invitacion_id = i.id
GROUP BY i.edicion;
```

### Invitaciones

```sql
-- Listar invitaciones pendientes (no abiertas)
SELECT
  i.id,
  a.folio,
  a.nombre,
  a.correo,
  i.creada_en,
  i.expira_en,
  CASE
    WHEN i.expira_en < NOW() THEN 'EXPIRADA'
    ELSE 'VIGENTE'
  END as estado
FROM consigna.invitaciones i
JOIN consigna.v_artistas_seleccionados a ON a.artista_id = i.artista_id
WHERE i.abierta_en IS NULL
  AND i.revocada = false
  AND i.edicion = 'AF2'
ORDER BY i.creada_en DESC;

-- Invitaciones expiradas sin completar
SELECT
  a.folio,
  a.nombre,
  a.correo,
  i.expira_en
FROM consigna.invitaciones i
JOIN consigna.v_artistas_seleccionados a ON a.artista_id = i.artista_id
WHERE i.expira_en < NOW()
  AND NOT EXISTS (
    SELECT 1 FROM consigna.acuerdos ac WHERE ac.invitacion_id = i.id
  )
  AND i.edicion = 'AF2';

-- Revocar invitación (si es necesario)
UPDATE consigna.invitaciones
SET revocada = true, revocada_en = NOW()
WHERE id = 'UUID-AQUI';
```

### Acuerdos (Hojas completadas)

```sql
-- Listar todos los acuerdos firmados
SELECT
  a.folio,
  a.nombre,
  ac.firmado_en,
  ac.datos->>'estadoFiscal' as situacion_fiscal,
  jsonb_array_length(ac.datos->'obras') as num_obras,
  ac.pdf_key
FROM consigna.acuerdos ac
JOIN consigna.v_artistas_seleccionados a ON a.artista_id = ac.artista_id
WHERE ac.invitacion_id IN (
  SELECT id FROM consigna.invitaciones WHERE edicion = 'AF2'
)
ORDER BY ac.firmado_en DESC;

-- Acuerdos sin constancia fiscal
SELECT
  a.folio,
  a.nombre,
  a.correo,
  ac.firmado_en
FROM consigna.acuerdos ac
JOIN consigna.v_artistas_seleccionados a ON a.artista_id = ac.artista_id
WHERE ac.constancia_fiscal_key IS NULL
  AND ac.invitacion_id IN (
    SELECT id FROM consigna.invitaciones WHERE edicion = 'AF2'
  );

-- Total de obras consignadas por artista
SELECT
  a.folio,
  a.nombre,
  COUNT(ao.obra_id) as total_obras,
  SUM((ao.desglose->>'precioPublico')::numeric) as valor_total_publico
FROM consigna.acuerdos ac
JOIN consigna.acuerdo_obras ao ON ao.acuerdo_id = ac.id
JOIN consigna.v_artistas_seleccionados a ON a.artista_id = ac.artista_id
WHERE ac.invitacion_id IN (
  SELECT id FROM consigna.invitaciones WHERE edicion = 'AF2'
)
GROUP BY a.folio, a.nombre
ORDER BY total_obras DESC;
```

### Obras Consignadas

```sql
-- Listado completo de obras consignadas con precios
SELECT
  a.folio,
  a.nombre as artista,
  o.titulo as obra,
  (ao.desglose->>'ganancia')::numeric as ganancia_artista,
  (ao.desglose->>'comision')::numeric as comision_arte_facto,
  (ao.desglose->>'precioVenta')::numeric as precio_venta,
  (ao.desglose->>'precioPublico')::numeric as precio_publico
FROM consigna.acuerdo_obras ao
JOIN consigna.acuerdos ac ON ac.id = ao.acuerdo_id
JOIN consigna.v_artistas_seleccionados a ON a.artista_id = ac.artista_id
JOIN consigna.v_obras_postuladas o ON o.obra_id = ao.obra_id
WHERE ac.invitacion_id IN (
  SELECT id FROM consigna.invitaciones WHERE edicion = 'AF2'
)
ORDER BY a.folio, o.titulo;

-- Rango de precios de obras
SELECT
  MIN((desglose->>'precioPublico')::numeric) as precio_minimo,
  MAX((desglose->>'precioPublico')::numeric) as precio_maximo,
  AVG((desglose->>'precioPublico')::numeric)::numeric(10,2) as precio_promedio,
  COUNT(*) as total_obras
FROM consigna.acuerdo_obras ao
JOIN consigna.acuerdos ac ON ac.id = ao.acuerdo_id
WHERE ac.invitacion_id IN (
  SELECT id FROM consigna.invitaciones WHERE edicion = 'AF2'
);

-- Obras con precio público > 10,000
SELECT
  a.folio,
  a.nombre,
  o.titulo,
  (ao.desglose->>'precioPublico')::numeric as precio_publico
FROM consigna.acuerdo_obras ao
JOIN consigna.acuerdos ac ON ac.id = ao.acuerdo_id
JOIN consigna.v_artistas_seleccionados a ON a.artista_id = ac.artista_id
JOIN consigna.v_obras_postuladas o ON o.obra_id = ao.obra_id
WHERE (ao.desglose->>'precioPublico')::numeric > 10000
ORDER BY (ao.desglose->>'precioPublico')::numeric DESC;
```

### Auditoría y Eventos

```sql
-- Últimos 50 eventos del sistema
SELECT
  tipo,
  datos->>'artistaId' as artista_id,
  datos,
  ocurrido_en
FROM consigna.eventos
ORDER BY ocurrido_en DESC
LIMIT 50;

-- Eventos de un artista específico
SELECT
  tipo,
  datos,
  ocurrido_en
FROM consigna.eventos
WHERE datos->>'artistaId' = '123'
ORDER BY ocurrido_en DESC;

-- Eventos por tipo
SELECT
  tipo,
  COUNT(*) as cantidad,
  MAX(ocurrido_en) as ultimo_evento
FROM consigna.eventos
GROUP BY tipo
ORDER BY cantidad DESC;
```

---

## API Endpoints

### Endpoints Públicos

```bash
# Obtener contexto de invitación
GET /api/consigna/:token/contexto

# Guardar borrador
POST /api/consigna/:token/borrador
Content-Type: application/json
{
  "paso": 9,
  "datos": { ... }
}

# Generar vista previa del PDF
POST /api/consigna/:token/vista-previa
Content-Type: application/json
{
  "obras": [...],
  "aceptaClausulas": true,
  "estadoFiscal": "fisica",
  "firmaBase64": "data:image/png;base64,..."
}

# Enviar acuerdo final
POST /api/consigna/:token/enviar
Content-Type: application/json
{
  "obras": [...],
  "aceptaClausulas": true,
  "estadoFiscal": "fisica",
  "firmaBase64": "data:image/png;base64,..."
}

# Subir constancia fiscal
POST /api/consigna/:token/upload-constancia
Content-Type: multipart/form-data
constancia: [archivo PDF]

# Descargar PDF enviado
GET /api/consigna/:token/pdf
```

### Endpoints Admin

```bash
# Listar invitaciones
GET /api/admin/consigna/invitaciones?edicion=AF2
Authorization: Bearer {token}

# Generar nuevas invitaciones
POST /api/admin/consigna/generar-invitaciones
Authorization: Bearer {token}
Content-Type: application/json
{
  "edicion": "AF2"
}

# Estadísticas
GET /api/admin/consigna/estadisticas?edicion=AF2
Authorization: Bearer {token}

# Listar acuerdos
GET /api/admin/consigna/acuerdos?edicion=AF2
Authorization: Bearer {token}

# Obtener URL de PDF
GET /api/admin/consigna/acuerdos/:acuerdoId/pdf
Authorization: Bearer {token}

# Reenviar invitación (NOT IMPLEMENTED - genera nueva)
POST /api/admin/consigna/reenviar/:invitacionId
Authorization: Bearer {token}
```

---

## Operaciones Comunes

### Crear invitaciones para nueva edición

```bash
# 1. Actualizar variable de entorno
echo 'EDICION_SUFIJO=AF3' >> .env

# 2. Asegurarse de tener artistas aprobados
psql -d benito -c "SELECT COUNT(*) FROM artistas WHERE aprobado = true AND estado_registro = 'aprobado';"

# 3. Generar invitaciones
npm run consigna:invitaciones AF3

# 4. Verificar en BD
psql -d benito -c "SELECT COUNT(*) FROM consigna.invitaciones WHERE edicion = 'AF3';"
```

### Re-generar invitación para artista específico

```sql
-- 1. Revocar invitación anterior (si existe)
UPDATE consigna.invitaciones
SET revocada = true, revocada_en = NOW()
WHERE artista_id = '123' AND edicion = 'AF2';

-- 2. Generar nueva invitación (desde código)
-- Usar npm run consigna:invitaciones
-- O llamar al endpoint POST /api/admin/consigna/generar-invitaciones
```

### Descargar PDF de un artista

```bash
# Obtener acuerdo_id del artista
ACUERDO_ID=$(psql -d benito -t -c "
  SELECT ac.id
  FROM consigna.acuerdos ac
  JOIN consigna.v_artistas_seleccionados a ON a.artista_id = ac.artista_id
  WHERE a.correo = 'artista@ejemplo.com'
  LIMIT 1
" | tr -d ' ')

# Obtener URL prefirmada
curl -H "Authorization: Bearer $TOKEN" \
  https://arte-facto.mx/api/admin/consigna/acuerdos/$ACUERDO_ID/pdf

# Respuesta incluye URL de S3 válida por 15 minutos
```

### Verificar integridad de archivos en S3

```bash
# Listar todos los PDFs
aws s3 ls s3://artefacto-consigna-prod/af2/pdfs/ --recursive

# Verificar que cada acuerdo tiene su PDF
psql -d benito -c "
  SELECT
    a.folio,
    a.nombre,
    ac.pdf_key,
    CASE
      WHEN ac.pdf_key IS NULL THEN 'MISSING'
      ELSE 'OK'
    END as estado
  FROM consigna.acuerdos ac
  JOIN consigna.v_artistas_seleccionados a ON a.artista_id = ac.artista_id
  WHERE ac.invitacion_id IN (
    SELECT id FROM consigna.invitaciones WHERE edicion = 'AF2'
  );
"
```

### Exportar datos para contabilidad

```sql
-- Exportar a CSV: ganancias de artistas
COPY (
  SELECT
    a.folio,
    a.nombre,
    a.correo,
    a.rfc,
    COUNT(ao.obra_id) as obras_consignadas,
    SUM((ao.desglose->>'ganancia')::numeric) as total_ganancia,
    SUM((ao.desglose->>'comision')::numeric) as total_comision,
    SUM((ao.desglose->>'precioVenta')::numeric) as total_precio_venta
  FROM consigna.acuerdos ac
  JOIN consigna.acuerdo_obras ao ON ao.acuerdo_id = ac.id
  JOIN consigna.v_artistas_seleccionados a ON a.artista_id = ac.artista_id
  WHERE ac.invitacion_id IN (
    SELECT id FROM consigna.invitaciones WHERE edicion = 'AF2'
  )
  GROUP BY a.folio, a.nombre, a.correo, a.rfc
  ORDER BY a.folio
) TO '/tmp/consigna-af2-ganancias.csv' WITH CSV HEADER;

-- Exportar a CSV: listado de obras
COPY (
  SELECT
    a.folio as artista_folio,
    a.nombre as artista_nombre,
    o.titulo as obra_titulo,
    o.tecnica,
    o.medida,
    (ao.desglose->>'ganancia')::numeric as ganancia_artista,
    (ao.desglose->>'comision')::numeric as comision,
    (ao.desglose->>'precioVenta')::numeric as precio_venta,
    (ao.desglose->>'iva')::numeric as iva,
    (ao.desglose->>'tarjeta')::numeric as comision_tarjeta,
    (ao.desglose->>'precioPublico')::numeric as precio_publico
  FROM consigna.acuerdo_obras ao
  JOIN consigna.acuerdos ac ON ac.id = ao.acuerdo_id
  JOIN consigna.v_artistas_seleccionados a ON a.artista_id = ac.artista_id
  JOIN consigna.v_obras_postuladas o ON o.obra_id = ao.obra_id
  WHERE ac.invitacion_id IN (
    SELECT id FROM consigna.invitaciones WHERE edicion = 'AF2'
  )
  ORDER BY a.folio, o.titulo
) TO '/tmp/consigna-af2-obras.csv' WITH CSV HEADER;
```

---

## Troubleshooting

### Error: "Token inválido o expirado"

**Síntomas:** Artista no puede abrir el link de su invitación.

**Diagnóstico:**
```sql
-- Verificar si existe la invitación
SELECT
  i.id,
  i.creada_en,
  i.expira_en,
  i.revocada,
  CASE
    WHEN i.expira_en < NOW() THEN 'EXPIRADA'
    WHEN i.revocada THEN 'REVOCADA'
    ELSE 'VIGENTE'
  END as estado
FROM consigna.invitaciones i
JOIN consigna.v_artistas_seleccionados a ON a.artista_id = i.artista_id
WHERE a.correo = 'artista@ejemplo.com';
```

**Solución:**
- Si expirada: Generar nueva invitación
- Si revocada: Verificar motivo, generar nueva si es necesario
- Si no existe: Verificar que el artista está aprobado

### Error: "No se pudo generar el PDF"

**Síntomas:** Error 500 al enviar acuerdo.

**Diagnóstico:**
```bash
# Verificar logs del backend
pm2 logs benito-backend | grep -i "pdf"

# Verificar que PDFKit está instalado
npm list pdfkit

# Verificar permisos de escritura temporal
ls -la /tmp/
```

**Solución:**
- Reinstalar PDFKit: `npm install pdfkit`
- Verificar espacio en disco: `df -h`
- Revisar logs para stack trace completo

### Error: "No se pudo subir la constancia fiscal"

**Síntomas:** Upload falla con error 500.

**Diagnóstico:**
```bash
# Verificar credenciales AWS
aws s3 ls s3://artefacto-consigna-prod/

# Verificar permisos del bucket
aws s3api get-bucket-acl --bucket artefacto-consigna-prod

# Verificar logs
pm2 logs | grep -i "s3\|upload"
```

**Solución:**
- Verificar AWS credentials en `.env`
- Verificar que bucket existe y es accesible
- Verificar tamaño del archivo (límite: 10 MB)

### Performance: PDF tarda mucho en generarse

**Síntomas:** Generación de PDF toma >10 segundos.

**Diagnóstico:**
```sql
-- Verificar cantidad de obras del artista
SELECT COUNT(*)
FROM consigna.v_obras_postuladas
WHERE artista_id = '123';
```

**Solución:**
- Si tiene >20 obras, optimizar template PDF
- Verificar uso de CPU: `top` o `pm2 monit`
- Considerar agregar caché para firma de dirección

---

## Mantenimiento

### Limpiar invitaciones expiradas (>90 días)

```sql
-- Ver invitaciones a limpiar
SELECT COUNT(*)
FROM consigna.invitaciones
WHERE expira_en < NOW() - INTERVAL '90 days'
  AND NOT EXISTS (
    SELECT 1 FROM consigna.acuerdos WHERE invitacion_id = invitaciones.id
  );

-- Marcar como revocadas (NO borrar - mantener auditoría)
UPDATE consigna.invitaciones
SET revocada = true, revocada_en = NOW()
WHERE expira_en < NOW() - INTERVAL '90 days'
  AND NOT EXISTS (
    SELECT 1 FROM consigna.acuerdos WHERE invitacion_id = invitaciones.id
  )
  AND revocada = false;
```

### Limpiar borradores huérfanos (>30 días)

```sql
-- Ver borradores a limpiar
SELECT COUNT(*)
FROM consigna.borradores
WHERE actualizado_en < NOW() - INTERVAL '30 days'
  AND NOT EXISTS (
    SELECT 1 FROM consigna.acuerdos WHERE artista_id = borradores.artista_id
  );

-- Borrar borradores huérfanos
DELETE FROM consigna.borradores
WHERE actualizado_en < NOW() - INTERVAL '30 days'
  AND NOT EXISTS (
    SELECT 1 FROM consigna.acuerdos WHERE artista_id = borradores.artista_id
  );
```

### Backup de archivos S3

```bash
# Backup completo de bucket de producción
aws s3 sync s3://artefacto-consigna-prod s3://artefacto-consigna-backup \
  --storage-class GLACIER

# O descargar localmente
aws s3 sync s3://artefacto-consigna-prod ./backup-consigna-$(date +%Y%m%d)
```

---

## Logs y Monitoreo

### Ver logs en tiempo real

```bash
# Logs generales
pm2 logs benito-backend

# Solo errores
pm2 logs benito-backend --err

# Buscar emails enviados
pm2 logs benito-backend | grep "✅ Email"

# Buscar errores de consigna
pm2 logs benito-backend | grep -i "consigna.*error"
```

### Métricas de uso

```bash
# Requests por minuto (últimos 5 minutos)
pm2 logs benito-backend --lines 1000 | \
  grep "GET /api/consigna" | \
  tail -n 100 | \
  wc -l

# Tasa de éxito de PDFs generados
pm2 logs benito-backend --lines 10000 | \
  grep "PDF generado" | \
  wc -l
```

---

## Referencias Rápidas

- **Documentación completa**: `/docs/CONSIGNA.md`
- **Templates Brevo**: `/docs/BREVO_TEMPLATES.md`
- **Checklist deployment**: `/docs/DEPLOYMENT_CHECKLIST.md`
- **Código backend**: `/backend/src/consigna/`
- **Código frontend**: `/frontend/features/consigna/`
- **Migraciones SQL**: `/backend/src/config/migrations/consigna/`
