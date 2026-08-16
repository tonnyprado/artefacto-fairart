/**
 * Hook para exportación del canvas a imagen y PDF
 */

import { useCallback } from 'react'
import jsPDF from 'jspdf'
import { RULER_SIZE, EXPORT_CONFIG } from '../constants/canvas.constants'

/**
 * Hook que maneja la exportación del canvas a diferentes formatos
 * @param {Object} stageRef - Referencia al Stage de Konva
 * @param {Object} config - Configuración { canvasWidth, canvasHeight }
 * @param {Array} obrasEnCanvas - Obras colocadas en el canvas
 * @param {Object} paquete - Información del paquete
 * @returns {Object} - Funciones de exportación
 */
export function useCanvasExport(stageRef, config, obrasEnCanvas, paquete) {
  const { canvasWidth, canvasHeight } = config

  /**
   * Convierte una URL de imagen (blob o normal) a base64
   * Necesario porque las URLs de blob expiran y jsPDF no puede cargarlas
   */
  const imageUrlToBase64 = useCallback(async (url) => {
    if (!url) return null

    // Si ya es base64, retornar directamente
    if (url.startsWith('data:')) {
      return url
    }

    try {
      const response = await fetch(url)
      const blob = await response.blob()

      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })
    } catch (error) {
      console.warn('Error convirtiendo imagen a base64:', error)
      return null
    }
  }, [])

  /**
   * Exporta el canvas como imagen JPEG optimizada
   * @returns {Promise<Blob>} - Blob de la imagen
   */
  const exportAsImage = useCallback(async () => {
    if (!stageRef.current) return null

    // Exportar solo el área del canvas sin las reglas
    // Usar JPEG con compresión agresiva para reducir tamaño del archivo
    const dataURL = stageRef.current.toDataURL({
      x: RULER_SIZE,
      y: RULER_SIZE,
      width: canvasWidth,
      height: canvasHeight,
      pixelRatio: EXPORT_CONFIG.pixelRatio,
      mimeType: EXPORT_CONFIG.format,
      quality: EXPORT_CONFIG.quality
    })

    const response = await fetch(dataURL)
    const blob = await response.blob()

    console.log('Canvas exportado - Tamaño:', Math.round(blob.size / 1024), 'KB')
    return blob
  }, [stageRef, canvasWidth, canvasHeight])

  /**
   * Exporta el canvas como PDF con fichas técnicas de obras
   * @returns {Promise<{pdfBlob: Blob, previewDataUrl: string}>}
   */
  const exportAsPDF = useCallback(async () => {
    if (!stageRef.current) return null

    // Exportar el canvas como imagen JPEG de alta calidad
    const dataURL = stageRef.current.toDataURL({
      x: RULER_SIZE,
      y: RULER_SIZE,
      width: canvasWidth,
      height: canvasHeight,
      pixelRatio: 1.5,
      mimeType: 'image/jpeg',
      quality: 0.85
    })

    // Pre-cargar todas las imágenes de obras como base64
    console.log('Convirtiendo imágenes de obras a base64...')
    const obrasConBase64 = await Promise.all(
      obrasEnCanvas.map(async (obra) => {
        const base64Image = await imageUrlToBase64(obra.preview)
        return { ...obra, base64Image }
      })
    )

    // Crear PDF con compresión
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [canvasWidth, canvasHeight],
      compress: true
    })

    // Agregar metadata
    pdf.setProperties({
      title: `Layout - ${paquete?.nombre || 'Artista'}`,
      subject: 'Layout del Lienzo - ARTEFACTO 2027',
      creator: 'ARTEFACTO Feria de Arte'
    })

    // Agregar la imagen del canvas
    pdf.addImage(dataURL, 'JPEG', 0, 0, canvasWidth, canvasHeight)

    // Agregar ficha técnica de cada obra
    if (obrasConBase64.length > 0) {
      for (let index = 0; index < obrasConBase64.length; index++) {
        const obra = obrasConBase64[index]
        pdf.addPage([canvasWidth, canvasHeight], 'landscape')

        // Título de la página
        pdf.setFontSize(20)
        pdf.setTextColor(184, 48, 48)
        pdf.text(`FICHA TÉCNICA - OBRA ${index + 1}`, 40, 40)

        // Línea divisora
        pdf.setDrawColor(184, 48, 48)
        pdf.setLineWidth(2)
        pdf.line(40, 50, canvasWidth - 40, 50)

        // Layout: Imagen (55%) + Ficha técnica (45%)
        const imageAreaWidth = (canvasWidth - 80) * 0.55
        const textAreaX = 40 + imageAreaWidth + 30

        // Agregar imagen de la obra
        if (obra.base64Image) {
          try {
            const maxImgWidth = imageAreaWidth
            const maxImgHeight = canvasHeight - 120
            const aspectRatio = obra.ancho_cm / obra.alto_cm

            let imgWidth, imgHeight
            if (aspectRatio > maxImgWidth / maxImgHeight) {
              imgWidth = maxImgWidth
              imgHeight = maxImgWidth / aspectRatio
            } else {
              imgHeight = maxImgHeight
              imgWidth = maxImgHeight * aspectRatio
            }

            const imgY = 70 + (maxImgHeight - imgHeight) / 2

            pdf.addImage(obra.base64Image, 'JPEG', 40, imgY, imgWidth, imgHeight)

            // Marco
            pdf.setDrawColor(200, 200, 200)
            pdf.setLineWidth(1)
            pdf.rect(40, imgY, imgWidth, imgHeight)
          } catch (imgError) {
            console.warn(`Error agregando imagen de obra ${index + 1}:`, imgError)
            // Placeholder
            pdf.setFillColor(240, 240, 240)
            pdf.rect(40, 70, imageAreaWidth, 300, 'F')
            pdf.setTextColor(150, 150, 150)
            pdf.setFontSize(14)
            pdf.text('Imagen no disponible', 40 + imageAreaWidth / 2 - 60, 220)
          }
        } else {
          // Placeholder si no hay imagen
          pdf.setFillColor(240, 240, 240)
          pdf.rect(40, 70, imageAreaWidth, 300, 'F')
          pdf.setTextColor(150, 150, 150)
          pdf.setFontSize(14)
          pdf.text('Imagen no disponible', 40 + imageAreaWidth / 2 - 60, 220)
        }

        // Ficha técnica
        let yPos = 80
        const lineHeight = 28

        pdf.setFontSize(18)
        pdf.setTextColor(20, 18, 16)
        pdf.text(obra.titulo || 'Sin título', textAreaX, yPos)
        yPos += lineHeight + 10

        const fichaData = [
          { label: 'Dimensiones', value: `${obra.ancho_cm} × ${obra.alto_cm} cm` },
          { label: 'Técnica', value: obra.tecnica || '-' },
          { label: 'Año', value: obra.anio?.toString() || '-' },
          { label: 'Precio', value: obra.precio_mxn ? `$${obra.precio_mxn.toLocaleString('es-MX')} MXN` : '-' }
        ]

        fichaData.forEach(({ label, value }) => {
          pdf.setFontSize(11)
          pdf.setTextColor(107, 107, 107)
          pdf.text(label.toUpperCase(), textAreaX, yPos)
          yPos += 18

          pdf.setFontSize(14)
          pdf.setTextColor(20, 18, 16)
          pdf.text(value, textAreaX, yPos)
          yPos += lineHeight
        })

        // Notas de montaje
        if (obra.notas_montaje) {
          yPos += 10
          pdf.setFontSize(11)
          pdf.setTextColor(107, 107, 107)
          pdf.text('NOTAS DE MONTAJE', textAreaX, yPos)
          yPos += 18

          pdf.setFontSize(12)
          pdf.setTextColor(20, 18, 16)
          const maxWidth = canvasWidth - textAreaX - 40
          const lines = pdf.splitTextToSize(obra.notas_montaje, maxWidth)
          pdf.text(lines, textAreaX, yPos)
        }

        // Pie de página
        pdf.setFontSize(10)
        pdf.setTextColor(150, 150, 150)
        pdf.text(
          `ARTEFACTO 2027 - ${paquete?.nombre || 'Lienzo'} - Obra ${index + 1} de ${obrasEnCanvas.length}`,
          40,
          canvasHeight - 30
        )
      }
    }

    const pdfBlob = pdf.output('blob')
    console.log('PDF generado - Tamaño:', Math.round(pdfBlob.size / 1024), 'KB')

    return {
      pdfBlob,
      previewDataUrl: dataURL
    }
  }, [stageRef, canvasWidth, canvasHeight, obrasEnCanvas, paquete, imageUrlToBase64])

  /**
   * Genera y descarga el PDF
   */
  const generatePDF = useCallback(() => {
    if (!stageRef.current) return

    const dataURL = stageRef.current.toDataURL({
      x: RULER_SIZE,
      y: RULER_SIZE,
      width: canvasWidth,
      height: canvasHeight,
      pixelRatio: 1
    })

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [canvasWidth, canvasHeight]
    })

    pdf.addImage(dataURL, 'PNG', 0, 0, canvasWidth, canvasHeight)
    pdf.save(`layout-${paquete.nombre.toLowerCase().replace(/ /g, '-')}.pdf`)
  }, [stageRef, canvasWidth, canvasHeight, paquete])

  return {
    exportAsImage,
    exportAsPDF,
    generatePDF,
    imageUrlToBase64
  }
}
