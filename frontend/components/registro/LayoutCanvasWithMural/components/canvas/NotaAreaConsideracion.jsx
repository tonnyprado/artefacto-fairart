'use client'

import { Image as KonvaImage } from 'react-konva'
import useImage from 'use-image'
import { NOTA_AREA_CONSIDERACION_2D_URL } from '../../constants/canvas.constants'

/**
 * Nota de área de consideración para canvas 2D
 * Muestra el aviso sobre el área de consideración del Comité Curatorial
 * Se posiciona en la parte superior del canvas, en la zona de las diagonales
 */
export function NotaAreaConsideracion({ canvasWidth, canvasHeight }) {
  const [image, status] = useImage(NOTA_AREA_CONSIDERACION_2D_URL)

  if (status !== 'loaded' || !image) return null

  // Dimensiones del SVG original: 161.2 x 69.7
  // Escalar proporcionalmente para que se vea bien en el canvas
  const scale = 1.2
  const imgWidth = 161.2 * scale
  const imgHeight = 69.7 * scale

  // Posicionar en la parte superior derecha, en la zona de las diagonales
  // Margen desde el borde derecho y superior
  const marginRight = 20
  const marginTop = 15

  const x = canvasWidth - imgWidth - marginRight
  const y = marginTop

  return (
    <KonvaImage
      image={image}
      x={x}
      y={y}
      width={imgWidth}
      height={imgHeight}
      listening={false}
    />
  )
}
