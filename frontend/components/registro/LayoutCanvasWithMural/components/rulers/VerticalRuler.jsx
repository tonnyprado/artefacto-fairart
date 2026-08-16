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
 * Componente de regla vertical (en metros)
 * @param {number} height - Altura de la regla en píxeles
 */
export function VerticalRuler({ height }) {
  const marks = []
  const metrosStep = 0.5 // Marca cada 0.5 metros
  const largeMetrosStep = 1 // Marcas grandes cada 1 metro
  const pixelsPerMeter = METROS_A_PIXELES

  // Calcular cuántos metros representa la altura total
  const totalMetros = height / pixelsPerMeter

  for (let metros = 0; metros <= totalMetros; metros += metrosStep) {
    const y = metros * pixelsPerMeter
    const isLarge = metros % largeMetrosStep === 0

    marks.push(
      <Line
        key={`vline-${metros}`}
        points={[RULER_SIZE, y, isLarge ? RULER_SIZE - 10 : RULER_SIZE - 5, y]}
        stroke={RULER_LINE_COLOR}
        strokeWidth={1}
      />
    )

    if (isLarge && metros > 0) {
      marks.push(
        <Text
          key={`vtext-${metros}`}
          x={3}
          y={y - 6}
          text={`${metros}m`}
          fontSize={10}
          fill={RULER_TEXT_COLOR}
        />
      )
    }
  }

  return (
    <Group>
      <Rect
        x={0}
        y={0}
        width={RULER_SIZE}
        height={height}
        fill={RULER_BG_COLOR}
      />
      {marks}
    </Group>
  )
}
