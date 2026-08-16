/**
 * Utilidades para validación de obras y layouts
 */

import { checkCollision } from './collision.utils'
import { isObraWithinBounds } from './collision.utils'

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
 * @returns {Object} - { isValid, errors }
 */
export function validateLayout(obrasEnCanvas, areaDelimitada, limiteObras) {
  const errors = []

  // Validar número de obras
  if (obrasEnCanvas.length === 0) {
    errors.push('Debes colocar al menos una obra en el canvas')
  }

  if (limiteObras && obrasEnCanvas.length > limiteObras) {
    errors.push(`Este paquete permite máximo ${limiteObras} obras`)
  }

  // Validar que todas las obras estén dentro del área delimitada
  obrasEnCanvas.forEach((obra, index) => {
    if (!isObraWithinBounds(obra, areaDelimitada)) {
      errors.push(`La obra "${obra.titulo || `#${index + 1}`}" está fuera del área delimitada`)
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
