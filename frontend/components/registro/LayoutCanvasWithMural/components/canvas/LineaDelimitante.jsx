'use client'

import { Image as KonvaImage } from 'react-konva'
import useImage from 'use-image'
import {
  SVG_LINEA_ASPECT_RATIO,
  SVG_LINEA_POSITION_RATIO
} from '../../constants/canvas.constants'

/**
 * Componente de línea delimitante usando el SVG personalizado
 * La línea se posiciona EXACTAMENTE en la coordenada x proporcionada
 * @param {number} x - Posición X donde debe quedar la línea visual
 * @param {number} height - Altura total de la línea
 */
export function LineaDelimitante({ x, height }) {
  const [image] = useImage('/LINEAS_DELIMITANTE.svg')

  if (!image) return null

  // El SVG original tiene viewBox="0 0 231 1981"
  // Lo escalamos para que tenga el alto que necesitamos
  const svgWidth = height * SVG_LINEA_ASPECT_RATIO

  // CRÍTICO: La línea visual dentro del SVG NO está centrada
  // Posición proporcional de la línea dentro del viewBox: 0.4845
  const lineOffsetInSvg = svgWidth * SVG_LINEA_POSITION_RATIO

  // Ajustar offsetX para que la línea visual del SVG quede exactamente en x
  const offsetX = x - lineOffsetInSvg

  return (
    <KonvaImage
      image={image}
      x={offsetX}
      y={0}
      width={svgWidth}
      height={height}
      listening={false}
    />
  )
}
