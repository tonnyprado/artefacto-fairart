# Configuración CORS para S3

## Problema

El bucket de S3 `artefacto-artistas` no tiene configuración CORS que permita subir archivos desde `https://arte-facto.mx`, causando el error:

```
Access to fetch at 'https://artefacto-artistas.s3.us-east-2.amazonaws.com/...'
from origin 'https://arte-facto.mx' has been blocked by CORS policy
```

## Solución

### Opción 1: Ejecutar el script automatizado (Recomendado)

1. **Configurar credenciales AWS** (una sola vez):

   ```bash
   # Opción A: Configurar perfil AWS
   aws configure
   # Ingresa: AWS Access Key ID, Secret Access Key, Region (us-east-2)

   # Opción B: Variables de entorno (temporal)
   export AWS_ACCESS_KEY_ID="tu_access_key"
   export AWS_SECRET_ACCESS_KEY="tu_secret_key"
   export AWS_REGION="us-east-2"
   ```

2. **Ejecutar el script**:

   ```bash
   cd backend
   node scripts/configurar-cors-s3.js
   ```

3. **Verificar** que la salida muestre: `✅ CORS configurado correctamente!`

### Opción 2: Configurar manualmente desde AWS Console

1. **Ir a S3 Console**:
   - https://s3.console.aws.amazon.com/s3/buckets/artefacto-artistas?region=us-east-2&tab=permissions

2. **Scroll hasta "Cross-origin resource sharing (CORS)"**

3. **Click en "Edit"**

4. **Pegar esta configuración**:

   ```json
   [
     {
       "AllowedHeaders": [
         "*",
         "Content-Type",
         "x-amz-server-side-encryption",
         "x-amz-checksum-crc32",
         "x-amz-sdk-checksum-algorithm"
       ],
       "AllowedMethods": [
         "GET",
         "PUT",
         "POST",
         "HEAD"
       ],
       "AllowedOrigins": [
         "https://arte-facto.mx",
         "https://www.arte-facto.mx",
         "http://localhost:3000"
       ],
       "ExposeHeaders": [
         "ETag",
         "x-amz-server-side-encryption",
         "x-amz-request-id",
         "x-amz-id-2"
       ],
       "MaxAgeSeconds": 3600
     }
   ]
   ```

5. **Click en "Save changes"**

6. **Probar** subiendo una constancia fiscal desde https://arte-facto.mx

## Verificación

Después de aplicar la configuración CORS:

1. Ve a la página de consigna en https://arte-facto.mx/consigna/[token]
2. Avanza hasta el paso 12 "Situación fiscal"
3. Selecciona "Cargar la constancia ahora"
4. Sube un archivo PDF
5. Verifica que NO aparezca el error de CORS
6. Verifica en la consola del navegador que la subida sea exitosa (200 OK)

## Troubleshooting

### Error: "Could not load credentials from any providers"

**Causa**: Las credenciales AWS no están configuradas.

**Solución**:
- Configura las credenciales con `aws configure`
- O pide a alguien con acceso AWS que ejecute el script
- O usa la Opción 2 (manual desde AWS Console)

### Error: "AccessDenied"

**Causa**: El usuario/rol AWS no tiene permisos para modificar CORS.

**Solución**:
- Necesitas los permisos: `s3:PutBucketCors` y `s3:GetBucketCors`
- Pide a un administrador AWS que te otorgue permisos
- O que ejecute el script por ti
- O usa la Opción 2 (manual desde AWS Console)

### El error CORS persiste después de configurar

**Causa**: Los cambios CORS pueden tardar en propagarse.

**Solución**:
- Espera 1-2 minutos
- Borra caché del navegador (Ctrl+Shift+R o Cmd+Shift+R)
- Prueba en modo incógnito
- Verifica que la configuración CORS se haya guardado correctamente en S3 Console

## Notas Técnicas

- **Bucket**: `artefacto-artistas`
- **Región**: `us-east-2`
- **Ruta de constancias**: `consigna/constancias/{artistaId}/{uuid}.{ext}`
- **Método de subida**: URL presignada (cliente sube directamente a S3)
- **Headers requeridos**:
  - `Content-Type`
  - `x-amz-server-side-encryption: AES256`
  - `x-amz-checksum-crc32`
  - `x-amz-sdk-checksum-algorithm`

## ¿Por qué se necesita CORS?

1. El frontend (arte-facto.mx) solicita al backend una URL firmada para subir
2. El backend genera URL firmada: `https://artefacto-artistas.s3.amazonaws.com/...`
3. El frontend hace PUT directo a S3 con el archivo
4. **S3 verifica CORS** antes de aceptar la subida
5. Si el origen (arte-facto.mx) no está en la lista de orígenes permitidos → ERROR
6. Si el origen está permitido → ÉXITO
