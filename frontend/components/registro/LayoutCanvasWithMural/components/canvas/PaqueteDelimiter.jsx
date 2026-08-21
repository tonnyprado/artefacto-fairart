'use client'

import { Group, Line, Rect, Text } from 'react-konva'

/**
 * Genera líneas diagonales para el patrón de área de consideración
 * Dirección: de abajo-izquierda hacia arriba-derecha (/)
 */
function DiagonalLines({ x, y, width, height, spacing = 7 }) {
  const lines = []
  const totalDiagonals = Math.ceil((width + height) / spacing)

  for (let i = 0; i < totalDiagonals; i++) {
    const offset = i * spacing

    // Línea va de (x, y + offset) hacia (x + offset, y)
    // Recortada a los límites del rectángulo
    let x1 = x
    let y1 = y + height - offset
    let x2 = x + offset
    let y2 = y

    // Ajustar si la línea empieza fuera del área (abajo)
    if (y1 > y + height) {
      const excess = y1 - (y + height)
      x1 += excess
      y1 = y + height
    }

    // Ajustar si la línea termina fuera del área (arriba)
    if (y2 < y) {
      y2 = y
    }

    // Ajustar si la línea empieza fuera del área (izquierda)
    if (x1 < x) {
      const excess = x - x1
      y1 -= excess
      x1 = x
    }

    // Ajustar si la línea termina fuera del área (derecha)
    if (x2 > x + width) {
      const excess = x2 - (x + width)
      y2 += excess
      x2 = x + width
    }

    // Solo dibujar si la línea está dentro del área
    if (x1 <= x + width && x2 >= x && y1 >= y && y2 <= y + height) {
      lines.push(
        <Line
          key={`diag-${i}`}
          points={[x1, y1, x2, y2]}
          stroke="rgba(255, 255, 255, 0.4)"
          strokeWidth={0.5}
          lineCap="round"
          listening={false}
        />
      )
    }
  }
  return <>{lines}</>
}

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
      {/* Área de consideración IZQUIERDA con líneas diagonales */}
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
          <DiagonalLines x={0} y={0} width={leftAreaWidth} height={canvasHeight} spacing={7} />
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

      {/* Área de consideración DERECHA con líneas diagonales */}
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
          <DiagonalLines x={rightAreaX} y={0} width={rightAreaWidth} height={canvasHeight} spacing={7} />
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

      {/* COTAS - Líneas de medidas en los lados */}
      {/* Cota horizontal superior (ancho del área) */}
      <Group>
        {/* Línea de cota horizontal */}
        <Line
          points={[delimiterX, -15, delimiterX + delimiterWidth, -15]}
          stroke="rgba(255, 255, 255, 0.8)"
          strokeWidth={1}
          listening={false}
        />
        {/* Flechas/marcas en los extremos */}
        <Line
          points={[delimiterX, -20, delimiterX, -10]}
          stroke="rgba(255, 255, 255, 0.8)"
          strokeWidth={1}
          listening={false}
        />
        <Line
          points={[delimiterX + delimiterWidth, -20, delimiterX + delimiterWidth, -10]}
          stroke="rgba(255, 255, 255, 0.8)"
          strokeWidth={1}
          listening={false}
        />
        {/* Texto de la medida horizontal */}
        <Rect
          x={delimiterX + delimiterWidth / 2 - 30}
          y={-28}
          width={60}
          height={18}
          fill="rgba(20, 18, 16, 0.85)"
          cornerRadius={4}
          listening={false}
        />
        <Text
          x={delimiterX + delimiterWidth / 2 - 30}
          y={-28}
          width={60}
          height={18}
          text={paquete.tipo === '3D'
            ? `${(paquete.metros_cuadrados || 1).toFixed(1)}m`
            : `${(paquete.metros_lineales || 1).toFixed(1)}m`}
          fontSize={11}
          fontStyle="bold"
          fill="white"
          align="center"
          verticalAlign="middle"
          listening={false}
        />
      </Group>

      {/* Cota vertical izquierda (alto del área) */}
      <Group>
        {/* Línea de cota vertical */}
        <Line
          points={[delimiterX - 15, delimiterY, delimiterX - 15, delimiterY + delimiterHeight]}
          stroke="rgba(255, 255, 255, 0.8)"
          strokeWidth={1}
          listening={false}
        />
        {/* Marcas en los extremos */}
        <Line
          points={[delimiterX - 20, delimiterY, delimiterX - 10, delimiterY]}
          stroke="rgba(255, 255, 255, 0.8)"
          strokeWidth={1}
          listening={false}
        />
        <Line
          points={[delimiterX - 20, delimiterY + delimiterHeight, delimiterX - 10, delimiterY + delimiterHeight]}
          stroke="rgba(255, 255, 255, 0.8)"
          strokeWidth={1}
          listening={false}
        />
        {/* Texto de la medida vertical */}
        <Rect
          x={delimiterX - 45}
          y={delimiterY + delimiterHeight / 2 - 9}
          width={50}
          height={18}
          fill="rgba(20, 18, 16, 0.85)"
          cornerRadius={4}
          listening={false}
        />
        <Text
          x={delimiterX - 45}
          y={delimiterY + delimiterHeight / 2 - 9}
          width={50}
          height={18}
          text={`${(delimiterHeight / 100).toFixed(1)}m`}
          fontSize={11}
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
