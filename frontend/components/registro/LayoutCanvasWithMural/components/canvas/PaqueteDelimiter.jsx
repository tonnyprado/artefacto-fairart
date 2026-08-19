'use client'

import { Group, Line, Rect, Text } from 'react-konva'

/**
 * Componente de líneas delimitadoras basadas en las medidas del paquete
 * Las líneas se posicionan EXACTAMENTE en los bordes del área delimitada
 * @param {Object} paquete - Paquete seleccionado
 * @param {Object} areaDelimitada - Área delimitada calculada (debe ser la misma que usan las obras para drag)
 * @param {number} canvasWidth - Ancho del canvas (dinámica según tipo)
 * @param {number} canvasHeight - Altura del canvas (dinámica según tipo)
 */
export function PaqueteDelimiter({ paquete, areaDelimitada, canvasWidth, canvasHeight }) {
  if (!paquete || !areaDelimitada) return null

  const { x: delimiterX, y: delimiterY, width: delimiterWidth, height: delimiterHeight } = areaDelimitada

  return (
    <Group>
      {/* Líneas delimitantes verticales */}
      {/* Línea izquierda - posicionada en el borde izquierdo del área */}
      <Line
        points={[delimiterX, 0, delimiterX, canvasHeight]}
        stroke="white"
        strokeWidth={2}
        dash={[10, 5]}
        listening={false}
      />

      {/* Línea derecha - posicionada en el borde derecho del área */}
      <Line
        points={[delimiterX + delimiterWidth, 0, delimiterX + delimiterWidth, canvasHeight]}
        stroke="white"
        strokeWidth={2}
        dash={[10, 5]}
        listening={false}
      />

      {/* Líneas delimitantes horizontales */}
      {/* Línea superior - posicionada en el borde superior del área */}
      <Line
        points={[delimiterX, delimiterY, delimiterX + delimiterWidth, delimiterY]}
        stroke="white"
        strokeWidth={2}
        dash={[10, 5]}
        listening={false}
      />

      {/* Línea inferior - posicionada en el borde inferior del área */}
      <Line
        points={[delimiterX, delimiterY + delimiterHeight, delimiterX + delimiterWidth, delimiterY + delimiterHeight]}
        stroke="white"
        strokeWidth={2}
        dash={[10, 5]}
        listening={false}
      />

      {/* Etiqueta con las medidas */}
      <Group>
        <Rect
          x={delimiterX + 10}
          y={delimiterY - 35}
          width={60}
          height={28}
          fill="rgba(184, 48, 48, 0.95)"
          cornerRadius={6}
          listening={false}
        />
        <Text
          x={delimiterX + 10}
          y={delimiterY - 35}
          width={60}
          height={28}
          text={paquete.tipo === '3D'
            ? `${paquete.metros_cuadrados}m²`
            : `${paquete.metros_lineales}m`}
          fontSize={14}
          fontStyle="bold"
          fill="white"
          align="center"
          verticalAlign="middle"
          listening={false}
        />
      </Group>
    </Group>
  )
}
