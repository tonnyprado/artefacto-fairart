/**
 * Hook para manejar la lógica de colisiones de obras
 */

import { useState, useCallback } from 'react'
import { checkPositionCollision, boundToArea } from '../utils/collision.utils'

/**
 * Hook que maneja la detección y validación de colisiones durante el drag
 * @param {Object} obra - Obra actual
 * @param {Array} otrasObras - Otras obras en el canvas
 * @param {Object} areaRestriccion - Área de restricción
 * @returns {Object} - Funciones y estado de colisión
 */
export function useObraCollision(obra, otrasObras, areaRestriccion) {
  const [lastValidPos, setLastValidPos] = useState({ x: obra.x, y: obra.y })
  const [isColliding, setIsColliding] = useState(false)

  /**
   * Verifica si una posición tiene colisión
   */
  const checkPositionHasCollision = useCallback(
    (pos) => {
      const testObra = {
        ...obra,
        x: pos.x,
        y: pos.y
      }
      return checkPositionCollision(testObra, otrasObras)
    },
    [obra, otrasObras]
  )

  /**
   * Función de límite para el drag que maneja colisiones
   */
  const dragBoundFunc = useCallback(
    (pos) => {
      // DEBUG: Ver qué área se está usando para limitar
      console.log('dragBoundFunc - areaRestriccion:', areaRestriccion)
      console.log('dragBoundFunc - obra dimensions:', { width: obra.width, height: obra.height })
      console.log('dragBoundFunc - pos:', pos)

      // Limitar al área de restricción
      const boundedPos = boundToArea(pos, areaRestriccion, obra.width, obra.height)

      console.log('dragBoundFunc - boundedPos:', boundedPos)

      // Verificar colisión en la nueva posición
      const hasCollision = checkPositionHasCollision(boundedPos)
      setIsColliding(hasCollision)

      // Si NO hay colisión, guardar como última posición válida
      if (!hasCollision) {
        setLastValidPos(boundedPos)
      }

      // PERMITIR el movimiento incluso con colisión (para mostrar indicador visual)
      return boundedPos
    },
    [areaRestriccion, obra.width, obra.height, checkPositionHasCollision]
  )

  /**
   * Resetea el estado de colisión
   */
  const resetCollision = useCallback(() => {
    setIsColliding(false)
  }, [])

  /**
   * Actualiza la última posición válida
   */
  const updateLastValidPos = useCallback((pos) => {
    setLastValidPos(pos)
  }, [])

  return {
    lastValidPos,
    isColliding,
    dragBoundFunc,
    checkPositionHasCollision,
    resetCollision,
    updateLastValidPos,
    setIsColliding
  }
}
