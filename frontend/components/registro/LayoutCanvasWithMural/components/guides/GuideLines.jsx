'use client'

import { Group, Rect, Line, Text } from 'react-konva'
import { GUIDE_LINE_COLOR, METROS_A_PIXELES } from '../../constants/canvas.constants'
import { COLORS } from '../../constants/style.constants'

/**
 * Componente de líneas guía que se muestran durante el arrastre
 * Incluye un rectángulo de preview para mostrar la posición exacta de la obra
 * @param {number} x - Posición X
 * @param {number} y - Posición Y
 * @param {number} width - Ancho de la obra
 * @param {number} height - Alto de la obra
 * @param {number} canvasWidth - Ancho total del canvas
 * @param {number} canvasHeight - Alto total del canvas
 * @param {Object} areaDelimitada - Área delimitada del paquete
 * @param {boolean} isColliding - Si hay colisión
 */
export function GuideLines({
  x,
  y,
  width,
  height,
  canvasWidth,
  canvasHeight,
  areaDelimitada,
  isColliding
}) {
  if (x === null || y === null) return null

  // Calcular posición limitada al área delimitada
  const boundedX = areaDelimitada
    ? Math.max(areaDelimitada.x, Math.min(x, areaDelimitada.x + areaDelimitada.width - width))
    : x
  const boundedY = areaDelimitada
    ? Math.max(areaDelimitada.y, Math.min(y, areaDelimitada.y + areaDelimitada.height - height))
    : y

  // Color de las guías: rojo si hay colisión, cyan si no hay
  const guideColor = isColliding ? COLORS.redBright : GUIDE_LINE_COLOR
  const fillColor = isColliding ? COLORS.redBrightTransparent : COLORS.cyanTransparent

  return (
    <Group>
      {/* Rectángulo de preview - muestra exactamente donde quedará la obra */}
      <Rect
        x={boundedX}
        y={boundedY}
        width={width}
        height={height}
        fill={fillColor}
        stroke={guideColor}
        strokeWidth={2}
        dash={[8, 8]}
        listening={false}
      />

      {/* Línea vertical en X */}
      <Line
        points={[boundedX, 0, boundedX, canvasHeight]}
        stroke={guideColor}
        strokeWidth={1}
        dash={[5, 5]}
        opacity={0.8}
      />

      {/* Línea vertical en X + width (borde derecho) */}
      <Line
        points={[boundedX + width, 0, boundedX + width, canvasHeight]}
        stroke={guideColor}
        strokeWidth={1}
        dash={[5, 5]}
        opacity={0.8}
      />


      {/* Etiqueta de posición X (en metros) */}
      <Group>
        <Rect
          x={boundedX + 5}
          y={5}
          width={70}
          height={20}
          fill={guideColor}
          cornerRadius={4}
        />
        <Text
          x={boundedX + 5}
          y={9}
          text={`${(boundedX / METROS_A_PIXELES).toFixed(2)}m`}
          fontSize={12}
          fill={isColliding ? COLORS.white : COLORS.black}
          width={70}
          align="center"
          fontStyle="bold"
        />
      </Group>

    </Group>
  )
}
