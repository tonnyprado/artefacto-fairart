/**
 * Utilidades para validación de obras y layouts
 */

import { checkCollision } from './collision.utils'
import { isObraWithinBounds, isObraWithinBounds2D } from './collision.utils'

/**
 * Valida que una obra tenga todos los campos de metadata requeridos
 * @param {Object} obra - Obra a validar
 * @param {boolean} es3D - Si el paquete es 3D
 * @returns {Object} - { isValid, errors }
 */
export function validateObraMetadata(obra, es3D) {
  const errors = []

  if (!obra.titulo || obra.titulo.trim() === '') {
    errors.push('El título es requerido')
  }

  if (!obra.ancho_cm || isNaN(parseFloat(obra.ancho_cm)) || parseFloat(obra.ancho_cm) <= 0) {
    errors.push('El ancho es requerido y debe ser mayor a 0')
  }

  if (!obra.alto_cm || isNaN(parseFloat(obra.alto_cm)) || parseFloat(obra.alto_cm) <= 0) {
    errors.push('El alto es requerido y debe ser mayor a 0')
  }

  // Para paquetes 3D, validar también el largo
  if (es3D) {
    if (!obra.largo_cm || isNaN(parseFloat(obra.largo_cm)) || parseFloat(obra.largo_cm) <= 0) {
      errors.push('El largo es requerido y debe ser mayor a 0')
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Valida un layout completo de obras en el canvas
 * @param {Array} obrasEnCanvas - Obras colocadas en el canvas
 * @param {Object} areaDelimitada - Área delimitada del paquete
 * @param {number} limiteObras - Número máximo de obras permitidas
 * @param {boolean} es3D - Si el paquete es 3D (afecta validación de límites)
 * @param {Object} freeArea - Área libre del canvas (para obras 2D, evitar ir sobre reglas)
 * @returns {Object} - { isValid, errors }
 */
export function validateLayout(obrasEnCanvas, areaDelimitada, limiteObras, es3D = false, freeArea = null) {
  const errors = []

  // Validar número de obras
  if (obrasEnCanvas.length === 0) {
    errors.push('Debes colocar al menos una obra en el canvas')
  }

  if (limiteObras && obrasEnCanvas.length > limiteObras) {
    errors.push(`Este paquete permite máximo ${limiteObras} obras`)
  }

  // Validar que todas las obras estén dentro del área delimitada
  // Para 2D: X dentro de área delimitada, Y dentro de área libre (no sobre reglas)
  // Para 3D: validar todos los límites dentro del área delimitada
  obrasEnCanvas.forEach((obra, index) => {
    const withinBounds = es3D
      ? isObraWithinBounds(obra, areaDelimitada)
      : isObraWithinBounds2D(obra, areaDelimitada, freeArea || areaDelimitada)

    if (!withinBounds) {
      const boundaryMsg = es3D
        ? 'está fuera del área delimitada'
        : 'está fuera de los límites del paquete o sobre las reglas'
      errors.push(`La obra "${obra.titulo || `#${index + 1}`}" ${boundaryMsg}`)
    }
  })

  // Validar que no haya colisiones entre obras
  for (let i = 0; i < obrasEnCanvas.length; i++) {
    for (let j = i + 1; j < obrasEnCanvas.length; j++) {
      if (checkCollision(obrasEnCanvas[i], obrasEnCanvas[j])) {
        errors.push(
          `Las obras "${obrasEnCanvas[i].titulo || `#${i + 1}`}" y "${obrasEnCanvas[j].titulo || `#${j + 1}`}" están superpuestas`
        )
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Valida el tamaño de un archivo
 * @param {File} file - Archivo a validar
 * @param {number} maxSize - Tamaño máximo en bytes
 * @returns {Object} - { isValid, error }
 */
export function validateFileSize(file, maxSize) {
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `${file.name} excede el límite de ${Math.round(maxSize / 1024 / 1024)}MB`
    }
  }
  return { isValid: true, error: null }
}

/**
 * Valida que un archivo sea una imagen
 * @param {File} file - Archivo a validar
 * @returns {Object} - { isValid, error }
 */
export function validateImageFile(file) {
  if (!file.type.startsWith('image/')) {
    return {
      isValid: false,
      error: `${file.name} no es una imagen válida`
    }
  }
  return { isValid: true, error: null }
}

/**
 * Filtra archivos válidos de un array de archivos
 * @param {Array} files - Array de archivos
 * @param {number} maxSize - Tamaño máximo en bytes
 * @returns {Object} - { validFiles, errors }
 */
export function filterValidFiles(files, maxSize) {
  const validFiles = []
  const errors = []

  files.forEach(file => {
    const sizeValidation = validateFileSize(file, maxSize)
    if (!sizeValidation.isValid) {
      errors.push(sizeValidation.error)
      return
    }

    const typeValidation = validateImageFile(file)
    if (!typeValidation.isValid) {
      errors.push(typeValidation.error)
      return
    }

    validFiles.push(file)
  })

  return { validFiles, errors }
}
