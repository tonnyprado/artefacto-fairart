'use client'

import { Group, Rect, Text } from 'react-konva'
import { COLORS, COMPONENT_SIZES } from '../../constants/style.constants'

/**
 * Botón de eliminar para obras en el canvas
 * @param {number} x - Posición X del botón
 * @param {number} y - Posición Y del botón
 * @param {Function} onClick - Callback al hacer click
 */
export function ObraDeleteButton({ x, y, onClick }) {
  const { width, height, fontSize } = COMPONENT_SIZES.deleteButton

  const handleClick = (e) => {
    e.cancelBubble = true
    onClick()
  }

  return (
    <Group>
      <Rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={COLORS.redPrimary}
        cornerRadius={width / 2}
        onClick={handleClick}
      />
      <Text
        x={x}
        y={y}
        width={width}
        height={height}
        text="×"
        fontSize={fontSize}
        fill={COLORS.white}
        align="center"
        verticalAlign="middle"
        onClick={handleClick}
      />
    </Group>
  )
}
