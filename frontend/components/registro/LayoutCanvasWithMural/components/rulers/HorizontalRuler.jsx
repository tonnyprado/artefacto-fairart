'use client'

import { Group, Rect, Line, Text } from 'react-konva'
import {
  RULER_SIZE,
  RULER_BG_COLOR,
  RULER_TEXT_COLOR,
  RULER_LINE_COLOR,
  METROS_A_PIXELES
} from '../../constants/canvas.constants'

/**
 * Componente de regla horizontal (en metros)
 * @param {number} width - Ancho de la regla en píxeles
 */
export function HorizontalRuler({ width }) {
  const marks = []
  const metrosStep = 0.5 // Marca cada 0.5 metros
  const largeMetrosStep = 1 // Marcas grandes cada 1 metro
  const pixelsPerMeter = METROS_A_PIXELES

  // Calcular cuántos metros representa el ancho total
  const totalMetros = width / pixelsPerMeter

  for (let metros = 0; metros <= totalMetros; metros += metrosStep) {
    const x = metros * pixelsPerMeter
    const isLarge = metros % largeMetrosStep === 0

    marks.push(
      <Line
        key={`hline-${metros}`}
        points={[x, RULER_SIZE, x, isLarge ? RULER_SIZE - 10 : RULER_SIZE - 5]}
        stroke={RULER_LINE_COLOR}
        strokeWidth={1}
      />
    )

    if (isLarge) {
      marks.push(
        <Text
          key={`htext-${metros}`}
          x={x - 15}
          y={5}
          text={`${metros}m`}
          fontSize={10}
          fill={RULER_TEXT_COLOR}
          width={30}
          align="center"
        />
      )
    }
  }

  return (
    <Group>
      <Rect
        x={0}
        y={0}
        width={width}
        height={RULER_SIZE}
        fill={RULER_BG_COLOR}
      />
      {marks}
    </Group>
  )
}
