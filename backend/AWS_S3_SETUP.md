# Guía de Configuración AWS S3 para ARTEFACT

## Pasos para configurar AWS S3

### 1. Crear cuenta de AWS
- Ve a https://aws.amazon.com/
- Crea una cuenta (el primer año tiene Free Tier GRATIS)
- Completa la verificación de tarjeta de crédito (no se cobrará nada durante el Free Tier)

### 2. Crear un Bucket S3

1. Inicia sesión en AWS Console: https://console.aws.amazon.com/
2. Busca "S3" en la barra de búsqueda
3. Haz clic en "Create bucket" (Crear bucket)
4. Configuración del bucket:
   - **Bucket name**: `artefact-uploads` (o el nombre que prefieras, debe ser único globalmente)
   - **AWS Region**: `us-east-1` (Virginia del Norte - es la más barata)
   - **Object Ownership**: ACLs enabled
   - **Block Public Access**: DESACTIVA todas las opciones (para permitir acceso público a las imágenes)
   - ⚠️ IMPORTANTE: Confirma que entiendes que los archivos serán públicos
   - Deja todo lo demás por defecto
5. Haz clic en "Create bucket"

### 3. Configurar permisos del Bucket

1. Entra al bucket que acabas de crear
2. Ve a la pestaña "Permissions" (Permisos)
3. Edita "Bucket policy" (Política del bucket)
4. Pega esta política (reemplaza `artefact-uploads` con tu nombre de bucket):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::artefact-uploads/*"
    }
  ]
}
```

5. Guarda los cambios

### 4. Crear usuario IAM con acceso a S3

1. En AWS Console, busca "IAM" (Identity and Access Management)
2. En el menú lateral, selecciona "Users" (Usuarios)
3. Haz clic en "Add users" (Agregar usuarios)
4. Configuración:
   - **User name**: `artefact-s3-uploader`
   - **Access type**: ✅ Access key - Programmatic access
5. Haz clic en "Next: Permissions"
6. Selecciona "Attach existing policies directly"
7. Busca y marca la política: `AmazonS3FullAccess`
8. Haz clic en "Next: Tags" → "Next: Review" → "Create user"

⚠️ **MUY IMPORTANTE**: En la siguiente pantalla verás:
- **Access key ID**: `AKIAIOSFODNN7EXAMPLE`
- **Secret access key**: `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`

**COPIA ESTAS CREDENCIALES AHORA - NO LAS VOLVERÁS A VER**

### 5. Configurar variables de entorno

Edita el archivo `.env` en `/backend/.env`:

```env
# AWS S3 (reemplaza con tus credenciales REALES)
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=artefact-uploads
```

### 6. Probar la configuración

```bash
cd backend
npm run dev
```

Luego, usa Postman o curl para probar el upload:

```bash
curl -X POST http://localhost:4000/api/upload/single \
  -F "file=@/ruta/a/tu/imagen.jpg" \
  -F "folder=test"
```

Deberías recibir una respuesta con la URL del archivo subido a S3.

---

## Estimación de Costos

### Free Tier (primer año GRATIS)
- **S3**: 5GB de almacenamiento
- **S3**: 20,000 GET requests/mes
- **S3**: 2,000 PUT requests/mes
- **Data Transfer**: 15GB salida/mes

### Después del Free Tier
Con **100 artistas/año** con compresión:
- Cada artista: ~4.5MB (comprimido desde ~15MB)
- Total: 450MB = 0.45GB

**Costo mensual estimado**:
- Almacenamiento (0.45GB): $0.01/mes
- Requests (PUT): $0.01/mes
- Requests (GET): $0.01/mes
- Data Transfer (1GB/mes): $0.09/mes
- **TOTAL: ~$0.12/mes** (casi nada!)

Con **500 artistas**:
- Total: 2.5GB
- **TOTAL: ~$0.60/mes**

Con **1000 artistas**:
- Total: 5GB
- **TOTAL: ~$1.15/mes**

### Compresión automática con Sharp
- Comprime imágenes JPG/PNG con calidad 85%
- Reduce 70-90% del tamaño original
- 10MB → 1-2MB fácilmente
- PDFs se suben sin comprimir (ya están optimizados)

---

## Seguridad

⚠️ **NUNCA** subas el archivo `.env` a Git

El archivo `.gitignore` ya incluye `.env`, pero verifica:

```bash
# En la raíz del proyecto
cat .gitignore | grep ".env"
```

Debería aparecer `.env`.

---

## Migración a AWS RDS PostgreSQL (Fase 2)

Cuando estés listo para migrar la base de datos a AWS:

1. Crear instancia RDS PostgreSQL (db.t3.micro - Free Tier)
2. Configurar Security Groups para permitir acceso
3. Actualizar `.env` con credenciales de RDS
4. Migrar datos de Railway a RDS

**Costo estimado**: $15-18/mes (después del Free Tier)

---

## Soporte

Si tienes problemas:
1. Verifica que las credenciales AWS estén correctas
2. Verifica que el bucket tenga la política de acceso público
3. Verifica que el usuario IAM tenga permisos `AmazonS3FullAccess`
4. Revisa los logs del servidor para ver errores específicos
