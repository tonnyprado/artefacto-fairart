'use client'

import { Group, Image } from 'react-konva'
import useImage from 'use-image'

/**
 * Botón de eliminar para obras en el canvas
 * @param {number} x - Posición X del botón
 * @param {number} y - Posición Y del botón
 * @param {Function} onClick - Callback al hacer click
 */
export function ObraDeleteButton({ x, y, onClick }) {
  const [deleteIcon] = useImage('/assets/icon-delete.svg')
  const iconSize = 32

  const handleClick = (e) => {
    e.cancelBubble = true
    onClick()
  }

  return (
    <Group>
      <Image
        image={deleteIcon}
        x={x}
        y={y}
        width={iconSize}
        height={iconSize}
        onClick={handleClick}
        onTap={handleClick}
        shadowBlur={4}
        shadowColor="rgba(0,0,0,0.3)"
        shadowOffsetY={2}
      />
    </Group>
  )
}

/**
 * Indicador de arrastrar para obras en el canvas
 * @param {number} x - Posición X
 * @param {number} y - Posición Y
 * @param {number} width - Ancho de la obra
 */
export function ObraDragIndicator({ x, y, width }) {
  const [dragIcon] = useImage('/assets/icon-drag.svg')
  const iconSize = 32
  const indicatorX = x + (width / 2) - (iconSize / 2)

  return (
    <Group>
      <Image
        image={dragIcon}
        x={indicatorX}
        y={y}
        width={iconSize}
        height={iconSize}
        shadowBlur={4}
        shadowColor="rgba(0,0,0,0.3)"
        shadowOffsetY={2}
      />
    </Group>
  )
}
