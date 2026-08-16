/**
 * Utilidades para conversión de escalas y cálculos de dimensiones
 */

import {
  METROS_A_PIXELES,
  SCALE_FACTOR,
  FREE_AREA_2D,
  FREE_AREA_3D
} from '../constants/canvas.constants'

/**
 * Convierte metros a píxeles usando la escala del canvas
 * @param {number} metros - Medida en metros
 * @returns {number} - Medida en píxeles
 */
export function metrosToPixeles(metros) {
  return metros * METROS_A_PIXELES
}

/**
 * Convierte píxeles a metros usando la escala del canvas
 * @param {number} pixeles - Medida en píxeles
 * @returns {number} - Medida en metros
 */
export function pixelesToMetros(pixeles) {
  return pixeles / METROS_A_PIXELES
}

/**
 * Convierte centímetros a píxeles usando el factor de escala
 * @param {number} centimetros - Medida en centímetros
 * @returns {number} - Medida en píxeles
 */
export function centimetrosToPixeles(centimetros) {
  return centimetros * SCALE_FACTOR
}

/**
 * Convierte píxeles a centímetros usando el factor de escala
 * @param {number} pixeles - Medida en píxeles
 * @returns {number} - Medida en centímetros
 */
export function pixelesToCentimetros(pixeles) {
  return pixeles / SCALE_FACTOR
}

/**
 * Calcula el área delimitada basada en el paquete
 * IMPORTANTE: Usa la misma escala para ancho y alto para mantener proporciones reales
 * @param {Object} paquete - Paquete seleccionado con tipo, metros_lineales, altura_pared o metros_cuadrados
 * @param {Object} freeArea - Área libre dinámica (2D o 3D)
 * @returns {Object} - Área delimitada { x, y, width, height }
 */
export function calcularAreaDelimitada(paquete, freeArea = FREE_AREA_2D) {
  if (!paquete) return freeArea

  let delimiterWidth, delimiterHeight

  if (paquete.tipo === '3D') {
    // Para paquetes 3D: usar metros_cuadrados
    const metrosCuadrados = paquete.metros_cuadrados || 1
    const lado = Math.sqrt(metrosCuadrados)
    delimiterWidth = metrosToPixeles(lado)
    delimiterHeight = metrosToPixeles(lado)
  } else {
    // Para paquetes 2D: usar metros_lineales × altura_pared
    // USAR LA MISMA ESCALA para ambos ejes
    delimiterWidth = metrosToPixeles(paquete.metros_lineales || 3)
    delimiterHeight = metrosToPixeles(paquete.altura_pared || 2.4)
  }

  // Centrar el delimitador en el área libre
  const delimiterX = freeArea.x + (freeArea.width - delimiterWidth) / 2
  const delimiterY = freeArea.y + (freeArea.height - delimiterHeight) / 2

  return {
    x: delimiterX,
    y: delimiterY,
    width: delimiterWidth,
    height: delimiterHeight
  }
}

/**
 * Calcula las dimensiones de una obra en píxeles según el tipo de paquete
 * @param {Object} obra - Obra con ancho_cm, alto_cm, largo_cm (para 3D)
 * @param {boolean} es3D - Si el paquete es 3D
 * @returns {Object} - Dimensiones { width, height }
 */
export function calcularDimensionesObra(obra, es3D) {
  if (es3D) {
    // Para 3D: width = largo_cm, height = ancho_cm (vista aérea)
    const width = centimetrosToPixeles(parseFloat(obra.largo_cm) || 10)
    const height = centimetrosToPixeles(parseFloat(obra.ancho_cm) || 10)
    return { width, height }
  } else {
    // Para 2D: width = ancho_cm, height = alto_cm
    const width = centimetrosToPixeles(parseFloat(obra.ancho_cm) || 10)
    const height = centimetrosToPixeles(parseFloat(obra.alto_cm) || 10)
    return { width, height }
  }
}

/**
 * Centra una obra en un área específica
 * @param {number} obraWidth - Ancho de la obra
 * @param {number} obraHeight - Alto de la obra
 * @param {Object} area - Área donde centrar { x, y, width, height }
 * @returns {Object} - Posición centrada { x, y }
 */
export function centrarObraEnArea(obraWidth, obraHeight, area) {
  return {
    x: area.x + (area.width - obraWidth) / 2,
    y: area.y + (area.height - obraHeight) / 2
  }
}

/**
 * Calcula el espacio total ocupado por un conjunto de obras
 * @param {Array} obras - Array de obras con width y height
 * @returns {Object} - Espacio ocupado { totalArea, totalWidth, totalHeight }
 */
export function calcularEspacioOcupado(obras) {
  if (!obras.length) return { totalArea: 0, totalWidth: 0, totalHeight: 0 }

  let minX = Infinity, maxX = -Infinity
  let minY = Infinity, maxY = -Infinity

  obras.forEach(obra => {
    minX = Math.min(minX, obra.x)
    maxX = Math.max(maxX, obra.x + obra.width)
    minY = Math.min(minY, obra.y)
    maxY = Math.max(maxY, obra.y + obra.height)
  })

  const totalWidth = maxX - minX
  const totalHeight = maxY - minY
  const totalArea = totalWidth * totalHeight

  return { totalArea, totalWidth, totalHeight }
}
