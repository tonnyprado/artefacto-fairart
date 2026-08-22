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

  // Metros del paquete
  const metros = paquete.tipo === '3D' ? paquete.metros_cuadrados : paquete.metros_lineales

  // Para 3D: áreas superior e inferior del cuadrado
  const topAreaHeight = delimiterY
  const bottomAreaY = delimiterY + delimiterHeight
  const bottomAreaHeight = canvasHeight - bottomAreaY

  return (
    <Group>
      {/* ===== SOMBREADO PARA 2D: solo columnas izquierda y derecha ===== */}
      {paquete.tipo !== '3D' && (
        <>
          {/* Área IZQUIERDA */}
          {leftAreaWidth > 10 && (
            <Rect
              x={0}
              y={0}
              width={leftAreaWidth}
              height={canvasHeight}
              fill="rgba(0, 0, 0, 0.15)"
              listening={false}
            />
          )}
          {/* Área DERECHA */}
          {rightAreaWidth > 10 && (
            <Rect
              x={rightAreaX}
              y={0}
              width={rightAreaWidth}
              height={canvasHeight}
              fill="rgba(0, 0, 0, 0.15)"
              listening={false}
            />
          )}
        </>
      )}

      {/* ===== SOMBREADO PARA 3D: todo excepto el cuadrado delimitado ===== */}
      {paquete.tipo === '3D' && (
        <>
          {/* Área SUPERIOR (todo el ancho) */}
          {topAreaHeight > 0 && (
            <Rect
              x={0}
              y={0}
              width={canvasWidth}
              height={topAreaHeight}
              fill="rgba(0, 0, 0, 0.15)"
              listening={false}
            />
          )}
          {/* Área INFERIOR (todo el ancho) */}
          {bottomAreaHeight > 0 && (
            <Rect
              x={0}
              y={bottomAreaY}
              width={canvasWidth}
              height={bottomAreaHeight}
              fill="rgba(0, 0, 0, 0.15)"
              listening={false}
            />
          )}
          {/* Área IZQUIERDA (solo altura del cuadrado) */}
          {leftAreaWidth > 0 && (
            <Rect
              x={0}
              y={delimiterY}
              width={leftAreaWidth}
              height={delimiterHeight}
              fill="rgba(0, 0, 0, 0.15)"
              listening={false}
            />
          )}
          {/* Área DERECHA (solo altura del cuadrado) */}
          {rightAreaWidth > 0 && (
            <Rect
              x={rightAreaX}
              y={delimiterY}
              width={rightAreaWidth}
              height={delimiterHeight}
              fill="rgba(0, 0, 0, 0.15)"
              listening={false}
            />
          )}
        </>
      )}

      {/* Para 2D: líneas verticales que cruzan todo el canvas */}
      {paquete.tipo !== '3D' && (
        <>
          <Line
            points={[delimiterX, 0, delimiterX, canvasHeight]}
            stroke="white"
            strokeWidth={2}
            dash={[10, 5]}
            listening={false}
          />
          <Line
            points={[delimiterX + delimiterWidth, 0, delimiterX + delimiterWidth, canvasHeight]}
            stroke="white"
            strokeWidth={2}
            dash={[10, 5]}
            listening={false}
          />
        </>
      )}

      {/* Para 3D: cuadrado completo del área delimitada */}
      {paquete.tipo === '3D' && (
        <>
          {/* Línea izquierda */}
          <Line
            points={[delimiterX, delimiterY, delimiterX, delimiterY + delimiterHeight]}
            stroke="white"
            strokeWidth={2}
            dash={[10, 5]}
            listening={false}
          />
          {/* Línea derecha */}
          <Line
            points={[delimiterX + delimiterWidth, delimiterY, delimiterX + delimiterWidth, delimiterY + delimiterHeight]}
            stroke="white"
            strokeWidth={2}
            dash={[10, 5]}
            listening={false}
          />
          {/* Línea superior */}
          <Line
            points={[delimiterX, delimiterY, delimiterX + delimiterWidth, delimiterY]}
            stroke="white"
            strokeWidth={2}
            dash={[10, 5]}
            listening={false}
          />
          {/* Línea inferior */}
          <Line
            points={[delimiterX, delimiterY + delimiterHeight, delimiterX + delimiterWidth, delimiterY + delimiterHeight]}
            stroke="white"
            strokeWidth={2}
            dash={[10, 5]}
            listening={false}
          />
        </>
      )}

      {/* COTA HORIZONTAL - muestra los metros */}
      <Group>
        {/* Línea de cota horizontal en la parte inferior */}
        <Line
          points={[delimiterX, canvasHeight + 15, delimiterX + delimiterWidth, canvasHeight + 15]}
          stroke="rgba(255, 255, 255, 0.9)"
          strokeWidth={1.5}
          listening={false}
        />
        {/* Marcas verticales en los extremos */}
        <Line
          points={[delimiterX, canvasHeight + 8, delimiterX, canvasHeight + 22]}
          stroke="rgba(255, 255, 255, 0.9)"
          strokeWidth={1.5}
          listening={false}
        />
        <Line
          points={[delimiterX + delimiterWidth, canvasHeight + 8, delimiterX + delimiterWidth, canvasHeight + 22]}
          stroke="rgba(255, 255, 255, 0.9)"
          strokeWidth={1.5}
          listening={false}
        />
        {/* Etiqueta con los metros */}
        <Rect
          x={delimiterX + delimiterWidth / 2 - 30}
          y={canvasHeight + 25}
          width={60}
          height={22}
          fill="rgba(184, 48, 48, 0.95)"
          cornerRadius={4}
          listening={false}
        />
        <Text
          x={delimiterX + delimiterWidth / 2 - 30}
          y={canvasHeight + 25}
          width={60}
          height={22}
          text={paquete.tipo === '3D' ? `${metros}m²` : `${metros}m`}
          fontSize={12}
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
