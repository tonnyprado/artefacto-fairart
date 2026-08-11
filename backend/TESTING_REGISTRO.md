# Guía de Prueba del Sistema de Registro

## Pre-requisitos

1. **PostgreSQL configurado** (Railway o local)
2. **AWS S3 configurado** (ver `AWS_S3_SETUP.md`)
3. **Variables de entorno configuradas** en `.env`

Verifica tu archivo `.env`:

```env
# PostgreSQL (Railway proporciona DATABASE_URL automáticamente)
DATABASE_URL=postgres://usuario:password@host:puerto/database
# O para desarrollo local:
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=artefact_db
# DB_USER=postgres
# DB_PASSWORD=tu_password

# AWS S3
AWS_ACCESS_KEY_ID=tu_access_key_real
AWS_SECRET_ACCESS_KEY=tu_secret_key_real
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=artefact-uploads
```

---

## Flujo del Registro

### Opción A: Endpoint TODO-EN-UNO (Recomendado)

El frontend envía **un solo request** con FormData conteniendo TODOS los campos y archivos:

**Endpoint**: `POST /api/registro`

**Ventajas**:
- ✅ Un solo request
- ✅ Transacción atómica (todo o nada)
- ✅ Más simple para el frontend
- ✅ Compresión automática de imágenes

**Desventajas**:
- ❌ Request más pesado (todos los archivos juntos)
- ❌ Si falla a mitad, se pierde todo

---

### Opción B: Upload separado + Registro

1. Frontend sube archivos primero: `POST /api/upload/artista`
2. Recibe URLs de vuelta
3. Envía datos del artista con las URLs: `POST /api/artistas`

**Ventajas**:
- ✅ Progreso más granular
- ✅ Puede reintentar uploads individuales

**Desventajas**:
- ❌ Más complejo
- ❌ Dos requests
- ❌ Si falla el segundo, quedan archivos huérfanos en S3

---

## Prueba con Postman/Insomnia

### 1. Prueba del Endpoint de Registro TODO-EN-UNO

**URL**: `http://localhost:4000/api/registro`

**Method**: `POST`

**Headers**: (se configuran automáticamente al usar Form-data)

**Body** (form-data):

| Key | Type | Value | Requerido |
|-----|------|-------|-----------|
| nombre | Text | Juan | ✅ |
| apellido | Text | Pérez | ✅ |
| email | Text | juan@example.com | ✅ |
| telefono | Text | +52 1234567890 | ✅ |
| fecha_nacimiento | Text | 1990-05-15 | ✅ |
| ciudad | Text | Guadalajara | ✅ |
| pais | Text | México | ✅ |
| categoria | Text | Pintura | ✅ |
| bio | Text | Artista contemporáneo... | ❌ |
| instagram | Text | @juanartista | ❌ |
| facebook | Text | facebook.com/juan | ❌ |
| website | Text | juanarte.com | ❌ |
| paquete_id | Text | 1 | ❌ |
| layout_canvas_data | Text | {"width":1000,"height":800} | ❌ |
| foto | File | (selecciona una imagen JPG/PNG) | ❌ |
| cv | File | (selecciona un PDF) | ❌ |
| portfolio | File | (selecciona un PDF) | ❌ |
| identificacion | File | (selecciona JPG/PNG/PDF) | ❌ |
| layout_canvas_image | File | (imagen del canvas) | ❌ |
| obra_lienzo_0 | File | (imagen obra 1) | ❌ |
| obra_lienzo_0_titulo | Text | Mi primera obra | ❌ |
| obra_lienzo_0_alto_cm | Text | 100 | ❌ |
| obra_lienzo_0_ancho_cm | Text | 80 | ❌ |
| obra_lienzo_1 | File | (imagen obra 2) | ❌ |
| obra_lienzo_1_titulo | Text | Mi segunda obra | ❌ |
| obra_lienzo_1_alto_cm | Text | 120 | ❌ |
| obra_lienzo_1_ancho_cm | Text | 90 | ❌ |

**Respuesta esperada**:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "juan@example.com",
    "foto": "https://artefact-uploads.s3.us-east-1.amazonaws.com/artistas/fotos/1234567890-abc123.jpg",
    "cv_url": "https://artefact-uploads.s3.us-east-1.amazonaws.com/artistas/documentos/1234567890-def456.pdf",
    "estado_registro": "pendiente",
    "aprobado": false,
    "redes_sociales": {
      "instagram": "@juanartista",
      "facebook": "facebook.com/juan",
      "website": "juanarte.com"
    },
    "documentos": {
      "cv_url": "https://...",
      "portfolio_url": "https://...",
      "identificacion_url": "https://...",
      "portfolio_images": [
        {
          "id": 1,
          "titulo": "Mi primera obra",
          "imagen_url": "https://...",
          "alto_cm": 100,
          "ancho_cm": 80
        }
      ]
    }
  },
  "message": "¡Registro exitoso! Tu solicitud está pendiente de aprobación."
}
```

---

## Prueba con cURL

```bash
curl -X POST http://localhost:4000/api/registro \
  -F "nombre=Juan" \
  -F "apellido=Pérez" \
  -F "email=juan@example.com" \
  -F "telefono=+52 1234567890" \
  -F "fecha_nacimiento=1990-05-15" \
  -F "ciudad=Guadalajara" \
  -F "pais=México" \
  -F "categoria=Pintura" \
  -F "bio=Artista contemporáneo mexicano" \
  -F "instagram=@juanartista" \
  -F "foto=@/ruta/a/tu/foto.jpg" \
  -F "cv=@/ruta/a/tu/cv.pdf" \
  -F "obra_lienzo_0=@/ruta/a/obra1.jpg" \
  -F "obra_lienzo_0_titulo=Mi obra" \
  -F "obra_lienzo_0_alto_cm=100" \
  -F "obra_lienzo_0_ancho_cm=80"
```

---

## Verificar en la Base de Datos

```sql
-- Ver todos los artistas
SELECT id, nombre, apellido, email, estado_registro, foto, cv_url
FROM artistas
ORDER BY created_at DESC;

-- Ver obras de un artista
SELECT * FROM obras WHERE artista_id = 1;
```

---

## Verificar en AWS S3

1. Ve a la consola de AWS S3
2. Abre tu bucket `artefact-uploads`
3. Verifica las carpetas:
   - `artistas/fotos/` - Fotos de perfil comprimidas
   - `artistas/documentos/` - CVs, portfolios, identificaciones
   - `artistas/canvas/` - Canvas generados
   - `artistas/obras/` - Imágenes de obras comprimidas

Verifica que las imágenes estén comprimidas (mucho más pequeñas que las originales).

---

## Logs a Revisar

En la consola del servidor (`npm run dev`) deberías ver:

```
📝 Iniciando registro de artista...
📦 Archivos recibidos: foto, cv, portfolio, obra_lienzo_0, obra_lienzo_1
📋 Datos recibidos: nombre, apellido, email, ...
📸 Subiendo foto de perfil...
📸 Imagen original: 3.50MB, 4000x3000
✅ Imagen comprimida: 0.85MB (ahorro: 75.7%)
✅ Archivo subido a S3: https://artefact-uploads.s3...
📄 Subiendo CV...
📄 Archivo sin comprimir: cv.pdf (1.20MB)
✅ Archivo subido a S3: https://artefact-uploads.s3...
🖼️ Subiendo obra 1...
📸 Imagen original: 8.50MB, 5000x4000
✅ Imagen comprimida: 1.50MB (ahorro: 82.4%)
✅ Artista registrado exitosamente con ID: 1
```

---

## Troubleshooting

### Error: "AWS Access Key ID not found"
→ Verifica que las variables de AWS estén configuradas en `.env`

### Error: "The bucket does not allow ACLs"
→ Ve a la configuración de S3 y habilita ACLs en el bucket

### Error: "Base de datos no configurada"
→ Verifica que `DATABASE_URL` o las variables `DB_*` estén en `.env`

### Error: "El email ya está registrado"
→ Usa otro email o elimina el registro anterior de la DB

### Imágenes no se ven en el navegador
→ Verifica que la Bucket Policy permita acceso público (ver `AWS_S3_SETUP.md`)

### Error: "File too large"
→ Los archivos tienen un límite de 10MB. Sharp los comprimirá automáticamente.

---

## Siguientes Pasos

Una vez que el registro funcione:

1. ✅ Modificar el frontend para usar `/api/registro` en lugar del endpoint anterior
2. ✅ Mostrar progreso de subida al usuario
3. ✅ Manejar errores de red y reintentos
4. ✅ Implementar panel de admin para aprobar artistas
5. ✅ Migrar a AWS RDS para PostgreSQL en producción (Fase 2)
