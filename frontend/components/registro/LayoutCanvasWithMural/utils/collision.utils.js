/**
 * Utilidades para detección de colisiones entre obras
 */

import { COLLISION_MARGIN } from '../constants/canvas.constants'

/**
 * Verifica si dos obras colisionan considerando el margen de separación
 * @param {Object} obra1 - Primera obra con x, y, width, height
 * @param {Object} obra2 - Segunda obra con x, y, width, height
 * @param {number} margin - Margen de separación en píxeles
 * @returns {boolean} - true si hay colisión, false si no
 */
export function checkCollision(obra1, obra2, margin = COLLISION_MARGIN) {
  return (
    obra1.x - margin < obra2.x + obra2.width &&
    obra1.x + obra1.width + margin > obra2.x &&
    obra1.y - margin < obra2.y + obra2.height &&
    obra1.y + obra1.height + margin > obra2.y
  )
}

/**
 * Verifica si una posición tiene colisión con un array de obras
 * @param {Object} testObra - Obra a verificar con x, y, width, height, id
 * @param {Array} otrasObras - Array de otras obras
 * @param {number} margin - Margen de separación
 * @returns {boolean} - true si hay colisión con alguna obra
 */
export function checkPositionCollision(testObra, otrasObras, margin = COLLISION_MARGIN) {
  for (const otraObra of otrasObras) {
    if (otraObra.id !== testObra.id && checkCollision(testObra, otraObra, margin)) {
      return true
    }
  }
  return false
}

/**
 * Encuentra todas las obras con las que colisiona una obra dada
 * @param {Object} obra - Obra a verificar
 * @param {Array} otrasObras - Array de otras obras
 * @param {number} margin - Margen de separación
 * @returns {Array} - Array de obras que colisionan
 */
export function findCollisions(obra, otrasObras, margin = COLLISION_MARGIN) {
  return otrasObras.filter(otraObra =>
    otraObra.id !== obra.id && checkCollision(obra, otraObra, margin)
  )
}

/**
 * Limita una posición al área delimitada
 * @param {Object} pos - Posición con x, y
 * @param {Object} area - Área delimitada con x, y, width, height
 * @param {number} obraWidth - Ancho de la obra
 * @param {number} obraHeight - Alto de la obra
 * @returns {Object} - Posición limitada { x, y }
 */
export function boundToArea(pos, area, obraWidth, obraHeight) {
  const boundedX = Math.max(
    area.x,
    Math.min(pos.x, area.x + area.width - obraWidth)
  )
  const boundedY = Math.max(
    area.y,
    Math.min(pos.y, area.y + area.height - obraHeight)
  )

  return { x: boundedX, y: boundedY }
}

/**
 * Verifica si una obra está completamente dentro del área delimitada
 * @param {Object} obra - Obra con x, y, width, height
 * @param {Object} area - Área delimitada con x, y, width, height
 * @returns {boolean} - true si está completamente dentro
 */
export function isObraWithinBounds(obra, area) {
  return (
    obra.x >= area.x &&
    obra.y >= area.y &&
    obra.x + obra.width <= area.x + area.width &&
    obra.y + obra.height <= area.y + area.height
  )
}
