/**
 * Hook para manejar la lógica de colisiones de obras
 */

import { useState, useCallback } from 'react'
import { checkPositionCollision, boundToArea } from '../utils/collision.utils'
import { RULER_SIZE } from '../constants/canvas.constants'

/**
 * Hook que maneja la detección y validación de colisiones durante el drag
 * @param {Object} obra - Obra actual
 * @param {Array} otrasObras - Otras obras en el canvas
 * @param {Object} areaRestriccion - Área de restricción en coordenadas de layer
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
   * IMPORTANTE: Konva dragBoundFunc recibe y retorna posiciones en coordenadas ABSOLUTAS (stage),
   * pero areaRestriccion está en coordenadas de layer. Necesitamos convertir entre sistemas.
   */
  const dragBoundFunc = useCallback(
    (pos) => {
      // 1. Convertir posición de stage a layer (restar el offset del layer)
      const layerPos = {
        x: pos.x - RULER_SIZE,
        y: pos.y - RULER_SIZE
      }

      // 2. Limitar al área de restricción (en coordenadas de layer)
      const boundedLayerPos = boundToArea(layerPos, areaRestriccion, obra.width, obra.height)

      // 3. Verificar colisión en la nueva posición
      const hasCollision = checkPositionHasCollision(boundedLayerPos)
      setIsColliding(hasCollision)

      // 4. Si NO hay colisión, guardar como última posición válida (en coordenadas de layer)
      if (!hasCollision) {
        setLastValidPos(boundedLayerPos)
      }

      // 5. Convertir de vuelta a coordenadas de stage (sumar el offset del layer)
      const boundedStagePos = {
        x: boundedLayerPos.x + RULER_SIZE,
        y: boundedLayerPos.y + RULER_SIZE
      }

      // 6. PERMITIR el movimiento incluso con colisión (para mostrar indicador visual)
      return boundedStagePos
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
