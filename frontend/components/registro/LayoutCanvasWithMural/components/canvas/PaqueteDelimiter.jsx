'use client'

import { Group, Line, Rect, Text } from 'react-konva'
import { LineaDelimitante } from './LineaDelimitante'

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
      {/* Líneas delimitantes verticales usando el SVG personalizado */}
      {/* Línea izquierda - posicionada en el borde izquierdo del área */}
      <LineaDelimitante x={delimiterX} height={canvasHeight} />

      {/* Línea derecha - posicionada en el borde derecho del área */}
      <LineaDelimitante x={delimiterX + delimiterWidth} height={canvasHeight} />

      {/* Rectángulo del área válida - MUY VISIBLE con borde grueso amarillo */}
      <Rect
        x={delimiterX}
        y={delimiterY}
        width={delimiterWidth}
        height={delimiterHeight}
        stroke="#FFD700"
        strokeWidth={6}
        listening={false}
      />

      {/* Texto en las esquinas para indicar el límite */}
      <Text
        x={delimiterX + 5}
        y={delimiterY + 5}
        text="LÍMITE"
        fontSize={14}
        fontStyle="bold"
        fill="#FFD700"
        listening={false}
      />
      <Text
        x={delimiterX + delimiterWidth - 55}
        y={delimiterY + 5}
        text="LÍMITE"
        fontSize={14}
        fontStyle="bold"
        fill="#FFD700"
        listening={false}
      />
      <Text
        x={delimiterX + 5}
        y={delimiterY + delimiterHeight - 20}
        text="LÍMITE"
        fontSize={14}
        fontStyle="bold"
        fill="#FFD700"
        listening={false}
      />
      <Text
        x={delimiterX + delimiterWidth - 55}
        y={delimiterY + delimiterHeight - 20}
        text="LÍMITE"
        fontSize={14}
        fontStyle="bold"
        fill="#FFD700"
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

      {/* Esquinas para referencia visual */}
      <Text
        x={delimiterX - 15}
        y={delimiterY - 15}
        text="┌"
        fontSize={20}
        fill="rgba(255, 255, 255, 0.5)"
        listening={false}
      />
      <Text
        x={delimiterX + delimiterWidth - 5}
        y={delimiterY - 15}
        text="┐"
        fontSize={20}
        fill="rgba(255, 255, 255, 0.5)"
        listening={false}
      />
      <Text
        x={delimiterX - 15}
        y={delimiterY + delimiterHeight - 5}
        text="└"
        fontSize={20}
        fill="rgba(255, 255, 255, 0.5)"
        listening={false}
      />
      <Text
        x={delimiterX + delimiterWidth - 5}
        y={delimiterY + delimiterHeight - 5}
        text="┘"
        fontSize={20}
        fill="rgba(255, 255, 255, 0.5)"
        listening={false}
      />
    </Group>
  )
}
