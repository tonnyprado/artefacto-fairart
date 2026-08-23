'use client'

import { useEffect } from 'react'
import { Group, Image as KonvaImage, Rect, Text } from 'react-konva'
import useImage from 'use-image'
import { useObraCollision } from '../../hooks/useObraCollision'
import { ObraDeleteButton, ObraDragIndicator } from './ObraDeleteButton'
import { COLORS, SHADOWS } from '../../constants/style.constants'

/**
 * Componente de obra 2D (imagen pintada/fotografía)
 * @param {Object} obra - Datos de la obra
 * @param {Function} onDragEnd - Callback al terminar arrastre
 * @param {Function} onDragMove - Callback durante el arrastre
 * @param {boolean} isSelected - Si la obra está seleccionada
 * @param {Function} onSelect - Callback al seleccionar
 * @param {Function} onDelete - Callback al eliminar
 * @param {Array} otrasObras - Otras obras en el canvas
 * @param {Object} areaDelimitada - Área delimitada del paquete
 * @param {Object} freeArea - Área libre por defecto
 */
export function Obra2D({
  obra,
  onDragEnd,
  onDragMove,
  isSelected,
  onSelect,
  onDelete,
  otrasObras,
  areaDelimitada,
  freeArea,
  onCursorDragStart,
  onCursorDragEnd,
  onCursorMouseEnter,
  onCursorMouseLeave
}) {
  const [image, status] = useImage(obra.preview, 'anonymous')
  const areaRestriccion = areaDelimitada || freeArea

  const {
    lastValidPos,
    isColliding,
    resetCollision,
    updateLastValidPos,
    setIsColliding,
    checkPositionHasCollision
  } = useObraCollision(obra, otrasObras, areaRestriccion)

  // Actualizar última posición válida cuando cambia la obra
  useEffect(() => {
    updateLastValidPos({ x: obra.x, y: obra.y })
  }, [obra.x, obra.y, updateLastValidPos])

  const handleDragStart = () => {
    resetCollision()
    onDragMove && onDragMove(obra.id, obra.x, obra.y, obra.width, obra.height, false)
    onCursorDragStart && onCursorDragStart()
  }

  const handleDragMove = (e) => {
    let currentX = e.target.x()
    let currentY = e.target.y()

    // Límites horizontales: usar área delimitada del paquete (lados)
    const minX = areaRestriccion.x
    const maxX = areaRestriccion.x + areaRestriccion.width - obra.width

    // Límites verticales: usar área libre del canvas (arriba/abajo)
    const minY = freeArea.y
    const maxY = freeArea.y + freeArea.height - obra.height

    // Limitar X (lados del paquete)
    if (currentX < minX) {
      e.target.x(minX)
      currentX = minX
    } else if (currentX > maxX) {
      e.target.x(maxX)
      currentX = maxX
    }

    // Limitar Y (bordes del canvas, no del paquete)
    if (currentY < minY) {
      e.target.y(minY)
      currentY = minY
    } else if (currentY > maxY) {
      e.target.y(maxY)
      currentY = maxY
    }

    // Verificar colisión y actualizar guías
    const currentCollision = checkPositionHasCollision({ x: currentX, y: currentY })
    setIsColliding(currentCollision)

    // Si NO hay colisión, guardar como última posición válida
    if (!currentCollision) {
      updateLastValidPos({ x: currentX, y: currentY })
    }

    onDragMove && onDragMove(obra.id, currentX, currentY, obra.width, obra.height, currentCollision)
  }

  const handleDragEnd = (e) => {
    const finalX = e.target.x()
    const finalY = e.target.y()
    const finalCollision = isColliding
    resetCollision()
    onDragMove && onDragMove(null, null, null, null, null, false)
    onCursorDragEnd && onCursorDragEnd()
    // Si hay colisión, usar la última posición válida guardada
    // Si no hay colisión, usar la posición final
    onDragEnd(obra.id, finalX, finalY, finalCollision, lastValidPos)
  }

  const handleSelect = () => {
    onSelect(obra.id)
  }

  // Estado de carga
  if (!image || status === 'loading') {
    return (
      <>
        <Rect
          x={obra.x}
          y={obra.y}
          width={obra.width}
          height={obra.height}
          fill={COLORS.grayLightest}
          stroke={COLORS.grayMedium}
          strokeWidth={2}
          cornerRadius={4}
        />
        <Text
          x={obra.x}
          y={obra.y + obra.height / 2 - 10}
          text="Cargando..."
          fontSize={12}
          fill={COLORS.grayLight}
          width={obra.width}
          align="center"
        />
      </>
    )
  }

  // Estado de error
  if (status === 'failed') {
    return (
      <Rect
        x={obra.x}
        y={obra.y}
        width={obra.width}
        height={obra.height}
        fill={COLORS.redLight}
        stroke={COLORS.redDark}
        strokeWidth={2}
        cornerRadius={4}
      />
    )
  }

  return (
    <Group>
      <KonvaImage
        id={obra.id}
        image={image}
        x={obra.x}
        y={obra.y}
        width={obra.width}
        height={obra.height}
        draggable
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        onClick={handleSelect}
        onTap={handleSelect}
        onMouseEnter={() => onCursorMouseEnter && onCursorMouseEnter()}
        onMouseLeave={() => onCursorMouseLeave && onCursorMouseLeave()}
        shadowBlur={isSelected ? SHADOWS.selected.blur : SHADOWS.medium.blur}
        shadowColor={COLORS.black}
        shadowOpacity={isSelected ? SHADOWS.selected.opacity : SHADOWS.medium.opacity}
        stroke={isColliding ? COLORS.redBright : isSelected ? COLORS.white : 'transparent'}
        strokeWidth={isColliding || isSelected ? 4 : 0}
      />

      {/* Indicadores cuando está seleccionada */}
      {isSelected && (
        <>
          {/* Indicador de arrastrar arriba */}
          <ObraDragIndicator
            x={obra.x}
            y={obra.y - 32}
            width={obra.width}
          />
          {/* Botón de quitar */}
          <ObraDeleteButton
            x={obra.x + obra.width - 65}
            y={obra.y + obra.height + 8}
            onClick={() => onDelete(obra.id)}
          />
        </>
      )}
    </Group>
  )
}
