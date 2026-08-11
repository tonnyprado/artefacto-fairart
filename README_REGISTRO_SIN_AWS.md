# 🚀 Guía Rápida: Sistema de Registro SIN AWS (Temporal)

## ✅ ¿Qué YA está implementado?

### Backend (Node.js + PostgreSQL)
- ✅ Endpoint `POST /api/registro` que funciona CON o SIN AWS S3
- ✅ Detección automática de si S3 está configurado
- ✅ Guarda artistas en PostgreSQL aunque NO haya archivos
- ✅ Campos de archivos quedan en `NULL` si no hay S3
- ✅ Sistema de compresión Sharp listo para cuando tengas S3

### Frontend (Next.js)
- ✅ Librería `browser-image-compression` instalada
- ✅ Utilidades de compresión creadas en `app/utils/imageCompression.js`
- ✅ Funciones para comprimir, guardar en localStorage y recuperar
- ✅ Guía completa de implementación en `COMPRESSION_GUIDE.md`

---

## 🎯 Lo que puedes hacer AHORA (sin AWS)

### 1. Probar el registro sin archivos

Puedes registrar artistas AHORA mismo sin configurar AWS:

```bash
cd backend
npm run dev
```

Luego en Postman o el frontend, envía:

```json
POST http://localhost:4000/api/registro
Content-Type: application/json

{
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan@example.com",
  "telefono": "+52 1234567890",
  "fecha_nacimiento": "1990-05-15",
  "ciudad": "Guadalajara",
  "pais": "México",
  "categoria": "Pintura",
  "bio": "Artista contemporáneo...",
  "instagram": "@juanartista"
}
```

**Resultado**: El artista se guardará en PostgreSQL con:
- ✅ Todos los datos personales
- ❌ Archivos en `NULL` (foto, cv, portfolio, etc.)
- ✅ Aparecerá en el admin panel

### 2. Ver artistas en el admin panel

```bash
# Verificar en PostgreSQL
SELECT id, nombre, apellido, email, estado_registro, foto, cv_url
FROM artistas
ORDER BY created_at DESC;
```

Deberías ver los artistas registrados, con `foto` y `cv_url` en `NULL`.

El admin panel mostrará:
- ✅ Nombre y apellido
- ✅ Email
- ✅ Categoría
- ✅ Estado de registro
- ❌ Sin foto (placeholder o ícono por defecto)

---

## 🔧 Implementar compresión en el frontend

### Paso 1: Modificar el formulario de registro

Edita `frontend/app/registro/page.js` siguiendo la guía en:
```
frontend/COMPRESSION_GUIDE.md
```

### Paso 2: Agregar compresión a los handlers

**Ejemplo para foto de perfil**:

```javascript
import { compressImage, compressAndSaveToLocalStorage } from '../utils/imageCompression'

const handleFotoChange = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  setIsCompressing(true)

  try {
    // Comprimir automáticamente
    const compressedFile = await compressImage(file)

    // Guardar en localStorage
    await compressAndSaveToLocalStorage(compressedFile, 'registro_foto')

    // Actualizar state
    setFormData({
      ...formData,
      foto: compressedFile
    })

    console.log('✅ Foto comprimida y lista')
  } catch (error) {
    console.error('Error:', error)
  } finally {
    setIsCompressing(false)
  }
}
```

### Paso 3: Probar compresión

1. Sube una imagen grande (5-10MB)
2. Verás en consola:
   ```
   📸 Comprimiendo imagen: foto.jpg (5.20MB)
   ✅ Imagen comprimida: 1.50MB (ahorro: 71.2%)
   💾 Archivo guardado en localStorage: registro_foto
   ```
3. Verifica en DevTools → Application → Local Storage

### Paso 4: Enviar al backend

Cuando el usuario confirme el registro, el frontend enviará FormData con los archivos comprimidos.

**POR AHORA**: Como no tenemos S3, los archivos NO se guardarán en el servidor, pero:
- ✅ El artista SÍ se guardará en PostgreSQL
- ✅ Aparecerá en el admin panel
- ✅ Los archivos quedan pendientes
- ⏳ Cuando configures S3, podrás subir archivos manualmente o crear un endpoint de actualización

---

## 📊 Flujo actual (SIN AWS)

```
1. Usuario llena formulario
   ↓
2. Frontend comprime imágenes con browser-image-compression
   ↓
3. Guarda archivos comprimidos en localStorage (3-5MB total)
   ↓
4. Usuario confirma registro
   ↓
5. Frontend envía datos a POST /api/registro
   ↓
6. Backend detecta que S3 NO está configurado
   ↓
7. Guarda artista en PostgreSQL con archivos en NULL
   ↓
8. Responde: "Registro exitoso, archivos pendientes"
   ↓
9. Artista aparece en admin panel (sin foto)
```

---

## 🔮 Flujo futuro (CON AWS)

```
1-3. [Mismo que arriba]
   ↓
4. Usuario confirma registro
   ↓
5. Frontend envía FormData con archivos comprimidos
   ↓
6. Backend detecta que S3 SÍ está configurado
   ↓
7. Comprime aún más las imágenes con Sharp (backend)
   ↓
8. Sube archivos a S3
   ↓
9. Guarda artista en PostgreSQL con URLs de S3
   ↓
10. Artista aparece en admin panel CON foto
```

---

## 🎨 Modificar el Admin Panel

Para mostrar artistas sin foto, modifica el componente de tabla:

```jsx
// En el admin panel
<img
  src={artista.foto || '/placeholder-avatar.png'}
  alt={artista.nombre}
  className="w-12 h-12 rounded-full object-cover"
/>

{!artista.foto && (
  <div className="text-xs text-gray-500 mt-1">
    Foto pendiente
  </div>
)}
```

---

## 📝 Checklist de implementación

### Ahora (sin AWS)
- [ ] Probar `POST /api/registro` con solo datos (sin archivos)
- [ ] Verificar que artista se guarde en PostgreSQL
- [ ] Ver artista en admin panel (sin foto)
- [ ] Implementar compresión en frontend (página de registro)
- [ ] Probar compresión de imágenes en el navegador
- [ ] Verificar localStorage en DevTools
- [ ] Modificar admin panel para mostrar placeholder si no hay foto

### Después (con AWS)
- [ ] Seguir guía en `backend/AWS_S3_SETUP.md`
- [ ] Configurar credenciales AWS en `.env`
- [ ] Probar upload completo con archivos
- [ ] Verificar archivos en S3
- [ ] Verificar URLs en PostgreSQL
- [ ] Ver fotos en admin panel

---

## 🆘 Troubleshooting

### "Base de datos no configurada"
→ Verifica que tengas `DATABASE_URL` en `.env` (Railway te lo da automáticamente)

### "El artista no aparece en el admin panel"
→ Verifica la query en el frontend: debe traer artistas aunque `foto` sea `NULL`

### "Error al comprimir imagen"
→ Verifica que instalaste `browser-image-compression`:
```bash
cd frontend
npm install browser-image-compression
```

### "localStorage lleno"
→ Límite es ~5-10MB. Con compresión deberías estar dentro del límite.
Si necesitas más, usa IndexedDB.

---

## 📚 Archivos creados

### Backend
- `src/controllers/registro.controller.js` - Controlador de registro (con/sin S3)
- `src/routes/registro.routes.js` - Ruta `/api/registro`
- `src/services/upload.service.js` - Servicio de upload S3 + Sharp
- `src/middleware/upload.middleware.js` - Middleware Multer
- `AWS_S3_SETUP.md` - Guía de configuración AWS
- `TESTING_REGISTRO.md` - Guía de pruebas

### Frontend
- `app/utils/imageCompression.js` - Utilidades de compresión
- `COMPRESSION_GUIDE.md` - Guía de implementación
- `README_REGISTRO_SIN_AWS.md` - Esta guía

---

## ✨ Próximos pasos

1. **AHORA**: Implementar compresión en el frontend
2. **AHORA**: Probar registro sin archivos
3. **AHORA**: Ver artistas en admin panel
4. **DESPUÉS**: Configurar AWS S3
5. **DESPUÉS**: Probar upload completo con archivos
