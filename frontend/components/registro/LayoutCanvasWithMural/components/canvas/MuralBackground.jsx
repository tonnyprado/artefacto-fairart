'use client'

import { useEffect } from 'react'
import { Image as KonvaImage } from 'react-konva'
import useImage from 'use-image'

/**
 * Componente del fondo del mural (SVG)
 * @param {string} plantillaURL - URL de la plantilla SVG
 * @param {number} width - Ancho del canvas
 * @param {number} height - Alto del canvas
 */
export function MuralBackground({ plantillaURL, width, height }) {
  const [image, status] = useImage(plantillaURL)

  // Debug: log status
  useEffect(() => {
    console.log('MuralBackground status:', status, 'URL:', plantillaURL)
  }, [status, plantillaURL])

  if (status === 'loading') {
    console.log('Cargando imagen de fondo del mural...')
    return null
  }

  if (status === 'failed') {
    console.error('Error cargando imagen de fondo del mural desde:', plantillaURL)
    return null
  }

  if (!image) return null

  return (
    <KonvaImage
      image={image}
      x={0}
      y={0}
      width={width}
      height={height}
      listening={false}
    />
  )
}
