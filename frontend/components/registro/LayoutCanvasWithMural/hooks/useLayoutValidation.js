/**
 * Hook para validación y gestión de layout
 */

import { useState, useCallback } from 'react'
import { validateLayout } from '../utils/validation.utils'

/**
 * Hook que maneja la validación del layout y guardado
 * @param {Array} obrasEnCanvas - Obras en el canvas
 * @param {Object} areaDelimitada - Área delimitada del paquete
 * @param {number} limiteObras - Número máximo de obras
 * @param {boolean} es3D - Si el paquete es 3D
 * @param {Object} freeArea - Área libre del canvas (para obras 2D)
 * @returns {Object} - Funciones y estado de validación
 */
export function useLayoutValidation(obrasEnCanvas, areaDelimitada, limiteObras, es3D = false, freeArea = null) {
  const [validationErrors, setValidationErrors] = useState([])
  const [isSaving, setIsSaving] = useState(false)

  /**
   * Valida el layout actual
   */
  const validate = useCallback(() => {
    const { isValid, errors } = validateLayout(obrasEnCanvas, areaDelimitada, limiteObras, es3D, freeArea)
    setValidationErrors(errors)
    return isValid
  }, [obrasEnCanvas, areaDelimitada, limiteObras, es3D, freeArea])

  /**
   * Limpia los errores de validación
   */
  const clearErrors = useCallback(() => {
    setValidationErrors([])
  }, [])

  /**
   * Verifica si el layout es válido sin setear errores
   */
  const isValid = useCallback(() => {
    const { isValid } = validateLayout(obrasEnCanvas, areaDelimitada, limiteObras, es3D, freeArea)
    return isValid
  }, [obrasEnCanvas, areaDelimitada, limiteObras, es3D, freeArea])

  return {
    validationErrors,
    isSaving,
    setIsSaving,
    validate,
    clearErrors,
    isValid
  }
}
