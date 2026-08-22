'use client'

import { useEffect, useState } from 'react'
import { Group, Rect, Text, Image } from 'react-konva'
import { useObraCollision } from '../../hooks/useObraCollision'
import { ObraDeleteButton, ObraDragIndicator } from './ObraDeleteButton'
import { COLORS, COMPONENT_SIZES, SHADOWS } from '../../constants/style.constants'

/**
 * Componente de obra 3D (escultura)
 * Muestra un cuadrado que representa la base de la escultura
 * @param {Object} obra - Datos de la obra
 * @param {Function} onDragEnd - Callback al terminar arrastre
 * @param {Function} onDragMove - Callback durante el arrastre
 * @param {boolean} isSelected - Si la obra está seleccionada
 * @param {Function} onSelect - Callback al seleccionar
 * @param {Function} onDelete - Callback al eliminar
 * @param {Array} otrasObras - Otras obras en el canvas
 * @param {Object} areaDelimitada - Área delimitada del paquete
 * @param {Object} freeArea - Área libre por defecto
 * @param {number} obraIndex - Índice de la obra (para mostrar número)
 */
export function Obra3D({
  obra,
  onDragEnd,
  onDragMove,
  isSelected,
  onSelect,
  onDelete,
  otrasObras,
  areaDelimitada,
  freeArea,
  obraIndex = 0,
  onCursorDragStart,
  onCursorDragEnd,
  onCursorMouseEnter,
  onCursorMouseLeave
}) {
  const areaRestriccion = areaDelimitada || freeArea

  const {
    lastValidPos,
    isColliding,
    dragBoundFunc,
    resetCollision,
    updateLastValidPos,
    checkPositionHasCollision,
    setIsColliding
  } = useObraCollision(obra, otrasObras, areaRestriccion)

  const numeroObra = obraIndex + 1

  // Estado para la imagen de la obra
  const [obraImage, setObraImage] = useState(null)
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 })

  // Cargar la imagen de la obra si existe preview
  useEffect(() => {
    if (obra.preview) {
      const img = new window.Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        setObraImage(img)
        setImageDimensions({ width: img.width, height: img.height })
      }
      img.src = obra.preview
    } else {
      setObraImage(null)
    }
  }, [obra.preview])

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

    // Aplicar límites del área delimitada
    const minX = areaRestriccion.x
    const maxX = areaRestriccion.x + areaRestriccion.width - obra.width
    const minY = areaRestriccion.y
    const maxY = areaRestriccion.y + areaRestriccion.height - obra.height

    // Limitar X
    if (currentX < minX) {
      e.target.x(minX)
      currentX = minX
    } else if (currentX > maxX) {
      e.target.x(maxX)
      currentX = maxX
    }

    // Limitar Y
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

  return (
    <Group>
      {/* Base del cuadrado */}
      <Rect
        id={obra.id}
        x={obra.x}
        y={obra.y}
        width={obra.width}
        height={obra.height}
        fill={COLORS.beigeLight}
        stroke={isColliding ? COLORS.redBright : isSelected ? COLORS.redPrimary : COLORS.black}
        strokeWidth={isColliding ? 4 : isSelected ? 4 : 2}
        cornerRadius={4}
        draggable
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        onClick={handleSelect}
        onTap={handleSelect}
        onMouseEnter={() => onCursorMouseEnter && onCursorMouseEnter()}
        onMouseLeave={() => onCursorMouseLeave && onCursorMouseLeave()}
        shadowBlur={isSelected ? SHADOWS.large.blur : SHADOWS.small.blur}
        shadowColor={COLORS.black}
        shadowOpacity={SHADOWS.large.opacity}
      />

      {/* Imagen de la obra centrada en la base */}
      {obraImage && imageDimensions.width > 0 && (() => {
        // Calcular dimensiones de la imagen para que quepa centrada
        // Usamos un margen del 15% en cada lado
        const margin = 0.15
        const availableWidth = obra.width * (1 - margin * 2)
        const availableHeight = obra.height * (1 - margin * 2)

        // Calcular escala manteniendo proporción
        const scaleX = availableWidth / imageDimensions.width
        const scaleY = availableHeight / imageDimensions.height
        const scale = Math.min(scaleX, scaleY)

        const imgWidth = imageDimensions.width * scale
        const imgHeight = imageDimensions.height * scale

        // Centrar la imagen
        const imgX = obra.x + (obra.width - imgWidth) / 2
        const imgY = obra.y + (obra.height - imgHeight) / 2

        return (
          <Image
            image={obraImage}
            x={imgX}
            y={imgY}
            width={imgWidth}
            height={imgHeight}
            listening={false}
          />
        )
      })()}

      {/* Texto de info solo si no hay imagen */}
      {!obraImage && (
        <>
          <Text
            x={obra.x}
            y={obra.y + obra.height / 2 - 12}
            text={obra.titulo || `Escultura ${numeroObra}`}
            fontSize={13}
            fontStyle="bold"
            fill={COLORS.black}
            width={obra.width}
            align="center"
            listening={false}
          />
          <Text
            x={obra.x}
            y={obra.y + obra.height / 2 + 4}
            text={`${obra.ancho_cm} × ${obra.alto_cm} cm`}
            fontSize={11}
            fill={COLORS.grayDark}
            width={obra.width}
            align="center"
            listening={false}
          />
        </>
      )}

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
