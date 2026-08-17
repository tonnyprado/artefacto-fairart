'use client'

import { Group, Line, Rect, Text } from 'react-konva'
import { LineaDelimitante } from './LineaDelimitante'

/**
 * Componente de líneas delimitadoras basadas en las medidas del paquete
 * Las líneas se posicionan EXACTAMENTE en los bordes del área delimitada
 * @param {Object} paquete - Paquete seleccionado
 * @param {Object} areaDelimitada - Área delimitada calculada (debe ser la misma que usan las obras para drag)
 * @param {number} canvasHeight - Altura del canvas (dinámica según tipo)
 */
export function PaqueteDelimiter({ paquete, areaDelimitada, canvasHeight }) {
  if (!paquete || !areaDelimitada) return null

  const { x: delimiterX, y: delimiterY, width: delimiterWidth, height: delimiterHeight } = areaDelimitada

  return (
    <Group>
      {/* Líneas delimitantes verticales usando el SVG personalizado */}
      {/* Línea izquierda - posicionada en el borde izquierdo del área */}
      <LineaDelimitante x={delimiterX} height={canvasHeight} />

      {/* Línea derecha - posicionada en el borde derecho del área */}
      <LineaDelimitante x={delimiterX + delimiterWidth} height={canvasHeight} />

      {/* Rectángulo del área válida - muy visible */}
      <Rect
        x={delimiterX}
        y={delimiterY}
        width={delimiterWidth}
        height={delimiterHeight}
        stroke="#00FF00"
        strokeWidth={4}
        dash={[15, 10]}
        listening={false}
        shadowColor="rgba(0, 255, 0, 0.5)"
        shadowBlur={10}
        shadowEnabled={true}
      />

      {/* Área externa oscurecida para mostrar claramente el límite */}
      <Rect
        x={0}
        y={0}
        width={canvasWidth}
        height={delimiterY}
        fill="rgba(0, 0, 0, 0.3)"
        listening={false}
      />
      <Rect
        x={0}
        y={delimiterY + delimiterHeight}
        width={canvasWidth}
        height={canvasHeight - delimiterY - delimiterHeight}
        fill="rgba(0, 0, 0, 0.3)"
        listening={false}
      />
      <Rect
        x={0}
        y={delimiterY}
        width={delimiterX}
        height={delimiterHeight}
        fill="rgba(0, 0, 0, 0.3)"
        listening={false}
      />
      <Rect
        x={delimiterX + delimiterWidth}
        y={delimiterY}
        width={canvasWidth - delimiterX - delimiterWidth}
        height={delimiterHeight}
        fill="rgba(0, 0, 0, 0.3)"
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
