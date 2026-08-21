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

  // Áreas de consideración (fuera del área delimitada)
  const leftAreaWidth = delimiterX
  const rightAreaX = delimiterX + delimiterWidth
  const rightAreaWidth = canvasWidth - rightAreaX

  return (
    <Group>
      {/* Área de consideración IZQUIERDA */}
      {leftAreaWidth > 30 && (
        <Group>
          <Rect
            x={0}
            y={0}
            width={leftAreaWidth}
            height={canvasHeight}
            fill="rgba(0, 0, 0, 0.15)"
            listening={false}
          />
          {/* Label área de consideración izquierda - tamaño fijo */}
          <Group>
            <Rect
              x={leftAreaWidth / 2 - 40}
              y={canvasHeight / 2 - 25}
              width={80}
              height={50}
              fill="rgba(184, 48, 48, 0.9)"
              cornerRadius={6}
              listening={false}
            />
            <Text
              x={leftAreaWidth / 2 - 40}
              y={canvasHeight / 2 - 20}
              width={80}
              height={14}
              text="ÁREA DE"
              fontSize={8}
              fontStyle="italic"
              fill="white"
              align="center"
              listening={false}
            />
            <Text
              x={leftAreaWidth / 2 - 40}
              y={canvasHeight / 2 - 6}
              width={80}
              height={14}
              text="CONSIDERACIÓN"
              fontSize={8}
              fontStyle="italic"
              fill="white"
              align="center"
              listening={false}
            />
            <Text
              x={leftAreaWidth / 2 - 40}
              y={canvasHeight / 2 + 8}
              width={80}
              height={12}
              text="Comité Curatorial"
              fontSize={7}
              fontStyle="bold italic"
              fill="white"
              align="center"
              listening={false}
            />
          </Group>
        </Group>
      )}

      {/* Área de consideración DERECHA */}
      {rightAreaWidth > 30 && (
        <Group>
          <Rect
            x={rightAreaX}
            y={0}
            width={rightAreaWidth}
            height={canvasHeight}
            fill="rgba(0, 0, 0, 0.15)"
            listening={false}
          />
          {/* Label área de consideración derecha - tamaño fijo */}
          <Group>
            <Rect
              x={rightAreaX + rightAreaWidth / 2 - 40}
              y={canvasHeight / 2 - 25}
              width={80}
              height={50}
              fill="rgba(184, 48, 48, 0.9)"
              cornerRadius={6}
              listening={false}
            />
            <Text
              x={rightAreaX + rightAreaWidth / 2 - 40}
              y={canvasHeight / 2 - 20}
              width={80}
              height={14}
              text="ÁREA DE"
              fontSize={8}
              fontStyle="italic"
              fill="white"
              align="center"
              listening={false}
            />
            <Text
              x={rightAreaX + rightAreaWidth / 2 - 40}
              y={canvasHeight / 2 - 6}
              width={80}
              height={14}
              text="CONSIDERACIÓN"
              fontSize={8}
              fontStyle="italic"
              fill="white"
              align="center"
              listening={false}
            />
            <Text
              x={rightAreaX + rightAreaWidth / 2 - 40}
              y={canvasHeight / 2 + 8}
              width={80}
              height={12}
              text="Comité Curatorial"
              fontSize={7}
              fontStyle="bold italic"
              fill="white"
              align="center"
              listening={false}
            />
          </Group>
        </Group>
      )}

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
