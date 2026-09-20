/**
 * Utilidad para comprimir imágenes del lado del cliente
 * Reduce el tamaño de archivos de imagen antes de enviarlos al servidor
 * Preserva transparencias en PNG automáticamente
 */

/**
 * Detecta si una imagen tiene transparencia (canal alpha)
 * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
 * @param {number} width - Ancho de la imagen
 * @param {number} height - Alto de la imagen
 * @returns {boolean} - True si tiene transparencia
 */
function detectTransparency(ctx, width, height) {
  try {
    // Optimización: solo analizar una muestra de píxeles para imágenes grandes
    const sampleSize = Math.min(100, width * height)
    const step = Math.max(1, Math.floor((width * height) / sampleSize))

    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data

    // Verificar cada N píxeles (optimizado para imágenes grandes)
    for (let i = 3; i < data.length; i += step * 4) {
      // Canal alpha está en posiciones 3, 7, 11, 15...
      if (data[i] < 255) {
        return true // Encontró transparencia
      }
    }

    return false // No hay transparencia
  } catch (error) {
    console.warn('No se pudo detectar transparencia, usando JPEG por defecto:', error)
    return false // Por seguridad, usar JPEG si hay error
  }
}

/**
 * Comprime una imagen manteniendo su aspect ratio
 * Detecta automáticamente transparencia y preserva PNG si es necesario
 * @param {File} file - Archivo de imagen a comprimir
 * @param {Object} options - Opciones de compresión
 * @param {number} options.maxWidth - Ancho máximo en píxeles (default: 1920)
 * @param {number} options.maxHeight - Alto máximo en píxeles (default: 1920)
 * @param {number} options.quality - Calidad JPEG (0-1, default: 0.85)
 * @param {number} options.maxSizeKB - Tamaño máximo objetivo en KB (default: 500)
 * @returns {Promise<File>} - Archivo comprimido (JPEG o PNG según transparencia)
 */
export async function compressImage(file, options = {}) {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.85,
    maxSizeKB = 500
  } = options

  // Si no es una imagen, retornar tal cual
  if (!file.type.startsWith('image/')) {
    return file
  }

  // Si ya es suficientemente pequeño, retornar tal cual
  if (file.size <= maxSizeKB * 1024) {
    console.log(`Imagen ${file.name} ya es pequeña (${Math.round(file.size / 1024)}KB), no se comprime`)
    return file
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onerror = () => reject(new Error('Error al leer el archivo'))

    reader.onload = (e) => {
      const img = new Image()

      img.onerror = () => reject(new Error('Error al cargar la imagen'))

      img.onload = () => {
        // Calcular nuevas dimensiones manteniendo aspect ratio
        let width = img.width
        let height = img.height

        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }

        // Crear canvas y redimensionar
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        // Detectar si la imagen tiene transparencia
        const hasTransparency = detectTransparency(ctx, width, height)

        // Elegir formato según transparencia
        const outputFormat = hasTransparency ? 'image/png' : 'image/jpeg'
        const extension = hasTransparency ? '.png' : '.jpg'
        const outputQuality = hasTransparency ? 0.95 : quality // PNG usa calidad más alta

        // Convertir a blob con compresión
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Error al comprimir la imagen'))
              return
            }

            // Crear nuevo File desde el blob
            const compressedFile = new File(
              [blob],
              file.name.replace(/\.[^.]+$/, extension),
              {
                type: outputFormat,
                lastModified: Date.now()
              }
            )

            const originalSizeKB = Math.round(file.size / 1024)
            const compressedSizeKB = Math.round(compressedFile.size / 1024)
            const reduction = Math.round((1 - compressedFile.size / file.size) * 100)
            const formatInfo = hasTransparency ? 'PNG (transparencia preservada)' : 'JPEG'

            console.log(`✅ Imagen comprimida: ${file.name} → ${formatInfo}`)
            console.log(`   Original: ${originalSizeKB}KB → Comprimido: ${compressedSizeKB}KB (${reduction}% reducción)`)
            console.log(`   Dimensiones: ${img.width}x${img.height} → ${Math.round(width)}x${Math.round(height)}`)

            resolve(compressedFile)
          },
          outputFormat,
          outputQuality
        )
      }

      img.src = e.target.result
    }

    reader.readAsDataURL(file)
  })
}

/**
 * Valida el tamaño de un archivo PDF
 * @param {File} file - Archivo a validar
 * @param {number} maxSizeMB - Tamaño máximo en MB (default: 2)
 * @returns {Object} - { valid: boolean, message: string, sizeKB: number }
 */
export function validatePDFSize(file, maxSizeMB = 2) {
  const sizeKB = Math.round(file.size / 1024)
  const sizeMB = (file.size / (1024 * 1024)).toFixed(2)
  const maxSizeKB = maxSizeMB * 1024

  if (file.size > maxSizeKB * 1024) {
    return {
      valid: false,
      message: `El archivo ${file.name} es muy grande (${sizeMB}MB). El tamaño máximo es ${maxSizeMB}MB. Por favor, comprime el PDF antes de subirlo.`,
      sizeKB
    }
  }

  return {
    valid: true,
    message: '',
    sizeKB
  }
}

/**
 * Valida el tamaño total de todos los archivos
 * @param {Array<File>} files - Array de archivos
 * @param {number} maxTotalMB - Tamaño total máximo en MB (default: 4)
 * @returns {Object} - { valid: boolean, message: string, totalKB: number }
 */
export function validateTotalSize(files, maxTotalMB = 4) {
  const totalSize = files.reduce((sum, file) => sum + file.size, 0)
  const totalKB = Math.round(totalSize / 1024)
  const totalMB = (totalSize / (1024 * 1024)).toFixed(2)
  const maxTotalKB = maxTotalMB * 1024

  if (totalSize > maxTotalKB * 1024) {
    return {
      valid: false,
      message: `El tamaño total de archivos es ${totalMB}MB, pero el límite es ${maxTotalMB}MB. Por favor, comprime algunos archivos.`,
      totalKB
    }
  }

  return {
    valid: true,
    message: '',
    totalKB
  }
}
