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
  const handleClick = (e) => {
    e.cancelBubble = true
    onClick()
  }

  return (
    <Group>
      {/* Fondo del botón QUITAR */}
      <Rect
        x={x}
        y={y}
        width={60}
        height={24}
        fill={COLORS.redPrimary}
        cornerRadius={12}
        onClick={handleClick}
        shadowBlur={4}
        shadowColor="rgba(0,0,0,0.3)"
        shadowOffsetY={2}
      />
      <Text
        x={x}
        y={y}
        width={60}
        height={24}
        text="QUITAR"
        fontSize={10}
        fontStyle="bold"
        fill={COLORS.white}
        align="center"
        verticalAlign="middle"
        onClick={handleClick}
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
  const indicatorWidth = 80
  const indicatorX = x + (width / 2) - (indicatorWidth / 2)

  return (
    <Group>
      {/* Fondo del indicador ARRASTRAR */}
      <Rect
        x={indicatorX}
        y={y}
        width={indicatorWidth}
        height={24}
        fill="rgba(20, 18, 16, 0.85)"
        cornerRadius={12}
        shadowBlur={4}
        shadowColor="rgba(0,0,0,0.3)"
        shadowOffsetY={2}
      />
      <Text
        x={indicatorX}
        y={y}
        width={indicatorWidth}
        height={24}
        text="⤭ ARRASTRAR"
        fontSize={9}
        fontStyle="bold"
        fill="#ffffff"
        align="center"
        verticalAlign="middle"
      />
    </Group>
  )
}
