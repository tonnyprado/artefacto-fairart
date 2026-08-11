# Guía: Compresión Automática de Imágenes en el Frontend

## ¿Qué hace esto?

Cuando el usuario sube una imagen en el formulario de registro:

1. ✅ **Comprime automáticamente** la imagen en el navegador (de 10MB → 1-2MB)
2. ✅ **Guarda en localStorage** el archivo comprimido
3. ✅ **Muestra preview** de la imagen comprimida
4. ✅ **Envía al backend** cuando el usuario confirma el registro

**IMPORTANTE**: Esto funciona **SIN necesitar AWS S3**. Los archivos se quedan en localStorage del navegador hasta que se envíe el formulario.

---

## Instalación

Ya instalamos la librería:
```bash
npm install browser-image-compression
```

Ya creamos el archivo de utilidades:
```
frontend/app/utils/imageCompression.js
```

---

## Cómo usar en el componente de Registro

### Paso 1: Importar funciones

En `app/registro/page.js`, agrega al inicio:

```javascript
import {
  compressImage,
  compressAndSaveToLocalStorage,
  getFileFromLocalStorage,
  clearFilesFromLocalStorage,
  getFileInfo,
  validateFileSize,
  validateImageType
} from '../utils/imageCompression'
```

### Paso 2: Modificar el handler de archivos

Encuentra la función donde manejas el cambio de archivos (ejemplo: `handleFileChange` o similar).

**ANTES** (sin compresión):
```javascript
const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    setFormData({
      ...formData,
      foto: file
    })
  }
}
```

**DESPUÉS** (con compresión automática):
```javascript
const handleFileChange = async (e) => {
  const file = e.target.files[0]

  if (!file) return

  try {
    // Validar tamaño (máx 10MB antes de comprimir)
    if (!validateFileSize(file, 10)) {
      alert('El archivo es demasiado grande (máximo 10MB)')
      return
    }

    // Validar que sea imagen
    if (!validateImageType(file)) {
      alert('Solo se permiten imágenes (JPG, PNG, WebP)')
      return
    }

    // Mostrar loading
    setIsCompressing(true)

    // Comprimir imagen automáticamente
    const compressedFile = await compressImage(file)

    // Guardar en localStorage
    await compressAndSaveToLocalStorage(compressedFile, 'registro_foto')

    // Actualizar state con el archivo comprimido
    setFormData({
      ...formData,
      foto: compressedFile
    })

    // Mostrar info de compresión
    const info = getFileInfo('registro_foto')
    console.log(`✅ Imagen comprimida: ${info.compressionRatio}% de ahorro`)

  } catch (error) {
    console.error('Error al comprimir imagen:', error)
    alert('Error al procesar la imagen')
  } finally {
    setIsCompressing(false)
  }
}
```

### Paso 3: Agregar estado de loading

Agrega un estado para mostrar cuando se está comprimiendo:

```javascript
const [isCompressing, setIsCompressing] = useState(false)
```

En el componente de input de archivo, muestra el estado:

```jsx
<input
  type="file"
  accept="image/*"
  onChange={handleFileChange}
  disabled={isCompressing}
/>

{isCompressing && (
  <div className="text-sm text-blue-600 mt-2">
    🔄 Comprimiendo imagen...
  </div>
)}

{formData.foto && !isCompressing && (
  <div className="text-sm text-green-600 mt-2">
    ✅ Imagen lista: {(formData.foto.size / 1024 / 1024).toFixed(2)}MB
  </div>
)}
```

### Paso 4: Recuperar archivos de localStorage al montar

Si el usuario sale del formulario y vuelve, recupera los archivos:

```javascript
useEffect(() => {
  // Recuperar archivos guardados
  const fotoGuardada = getFileFromLocalStorage('registro_foto')
  if (fotoGuardada) {
    setFormData(prev => ({
      ...prev,
      foto: fotoGuardada
    }))
  }

  // También recuperar otros archivos
  const cvGuardado = getFileFromLocalStorage('registro_cv')
  if (cvGuardado) {
    setFormData(prev => ({
      ...prev,
      documentos: {
        ...prev.documentos,
        cv: cvGuardado
      }
    }))
  }
}, [])
```

### Paso 5: Limpiar localStorage al enviar

Después de enviar exitosamente el formulario:

```javascript
const handleSubmit = async (e) => {
  e.preventDefault()

  try {
    // Enviar formulario...
    const response = await fetch('http://localhost:4000/api/registro', {
      method: 'POST',
      body: formDataToSend
    })

    if (response.ok) {
      // Limpiar localStorage
      clearFilesFromLocalStorage([
        'registro_foto',
        'registro_cv',
        'registro_portfolio',
        'registro_identificacion',
        'registro_obra_0',
        'registro_obra_1',
        'registro_obra_2',
        'registro_obra_3',
        'registro_obra_4'
      ])

      alert('¡Registro exitoso!')
    }
  } catch (error) {
    console.error('Error:', error)
  }
}
```

---

## Ejemplo Completo: Handler para Obras del Lienzo

```javascript
const handleObraChange = async (index, file) => {
  if (!file) return

  try {
    // Validar
    if (!validateFileSize(file, 10)) {
      alert('La imagen es demasiado grande (máximo 10MB)')
      return
    }

    if (!validateImageType(file)) {
      alert('Solo se permiten imágenes (JPG, PNG, WebP)')
      return
    }

    setIsCompressing(true)

    // Comprimir
    const compressedFile = await compressImage(file)

    // Guardar en localStorage
    await compressAndSaveToLocalStorage(compressedFile, `registro_obra_${index}`)

    // Actualizar state
    const newPortfolioImages = [...formData.portfolio_images]
    newPortfolioImages[index] = {
      ...newPortfolioImages[index],
      file: compressedFile
    }

    setFormData({
      ...formData,
      portfolio_images: newPortfolioImages
    })

  } catch (error) {
    console.error('Error al comprimir obra:', error)
  } finally {
    setIsCompressing(false)
  }
}
```

---

## Testing

### Probar compresión en consola del navegador

```javascript
// Obtener info de archivo guardado
const info = getFileInfo('registro_foto')
console.log(info)
// {
//   name: "foto.jpg",
//   size: 850000,  // 0.85MB
//   originalSize: 3500000,  // 3.5MB
//   compressionRatio: "75.7",
//   timestamp: 1234567890
// }
```

### Ver localStorage

En DevTools → Application → Local Storage → Verás las claves:
- `registro_foto`
- `registro_cv`
- `registro_obra_0`
- etc.

---

## Ventajas

✅ **Compresión inmediata**: El usuario ve el tamaño reducido ANTES de enviar
✅ **Persistencia**: Si sale del formulario, los archivos se mantienen
✅ **Feedback visual**: Muestra porcentaje de ahorro
✅ **No bloquea UI**: Usa Web Workers para comprimir
✅ **Funciona SIN AWS**: No necesita S3 configurado para empezar

---

## Límites de localStorage

localStorage tiene un límite de ~5-10MB dependiendo del navegador.

Con compresión:
- Foto perfil: ~0.5MB
- CV PDF: ~0.5MB (sin comprimir)
- Portfolio PDF: ~0.8MB
- Identificación: ~0.3MB
- 5 obras: ~1.5MB total

**Total: ~3.6MB** (dentro del límite)

Si necesitas más espacio, puedes usar **IndexedDB** en lugar de localStorage.

---

## Próximos pasos

1. ✅ Implementar handlers con compresión en todos los inputs de archivo
2. ✅ Agregar UI feedback (loading, tamaño, progreso)
3. ✅ Probar subir imágenes grandes (5-10MB) y ver la compresión
4. ✅ Verificar que los artistas aparezcan en el admin panel (sin archivos)
5. ⏳ Configurar AWS S3 (cuando esté listo)
6. ⏳ Migrar archivos de localStorage a S3
