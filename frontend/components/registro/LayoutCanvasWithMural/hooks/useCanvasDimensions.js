/**
 * Hook para obtener dimensiones del canvas según el tipo de paquete
 */

import { useMemo } from 'react'
import {
  CANVAS_2D_WIDTH,
  CANVAS_2D_HEIGHT,
  CANVAS_3D_WIDTH,
  CANVAS_3D_HEIGHT,
  FREE_AREA_2D,
  FREE_AREA_3D,
  PLANTILLA_2D_URL,
  PLANTILLA_3D_URL
} from '../constants/canvas.constants'
import { calcularAreaDelimitada } from '../utils/scaling.utils'

/**
 * Hook que retorna las dimensiones y configuración del canvas según el tipo de paquete
 * @param {Object} paquete - Paquete con tipo ('2D' o '3D')
 * @returns {Object} - Configuración del canvas
 */
export function useCanvasDimensions(paquete) {
  const config = useMemo(() => {
    const es3D = paquete?.tipo === '3D'

    const canvasWidth = es3D ? CANVAS_3D_WIDTH : CANVAS_2D_WIDTH
    const canvasHeight = es3D ? CANVAS_3D_HEIGHT : CANVAS_2D_HEIGHT
    const freeArea = es3D ? FREE_AREA_3D : FREE_AREA_2D
    const plantillaURL = es3D ? PLANTILLA_3D_URL : PLANTILLA_2D_URL
    const areaDelimitada = calcularAreaDelimitada(paquete, freeArea)

    return {
      es3D,
      canvasWidth,
      canvasHeight,
      freeArea,
      plantillaURL,
      areaDelimitada
    }
  }, [paquete])

  return config
}
