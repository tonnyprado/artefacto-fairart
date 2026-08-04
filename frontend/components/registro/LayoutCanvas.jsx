'use client'

import { useState, useRef, useEffect } from 'react'
import { Stage, Layer, Rect, Image as KonvaImage, Text } from 'react-konva'
import useImage from 'use-image'
import jsPDF from 'jspdf'
import { layoutsApi } from '@/lib/api'

/**
 * LayoutCanvas - Canvas interactivo para diseñar layout de obras
 *
 * ESTRATEGIA:
 * - Canvas de ancho fijo (800px) escalado proporcionalmente
 * - Pared representada como rectángulo con dimensiones del paquete
 * - Obras se escalan según sus dimensiones reales en cm
 * - Drag & drop con validación de colisiones y límites
 * - Exportación a PDF descargable e imagen PNG para Cloudinary
 */

const CANVAS_WIDTH = 800

/**
 * Componente individual de obra en canvas
 */
function ObraImage({ obra, onDragEnd, isSelected, onSelect, scaleFactor }) {
  const [image, status] = useImage(obra.preview, 'anonymous')

  // Calcular dimensiones en canvas basadas en dimensiones reales
  const width = obra.ancho_cm * scaleFactor
  const height = obra.alto_cm * scaleFactor

  // Debug: Log del estado de carga de imagen
  useEffect(() => {
    console.log('Obra:', obra.titulo, 'Preview URL:', obra.preview, 'Status:', status, 'Image loaded:', !!image)
  }, [image, status, obra.titulo, obra.preview])

  // Si la imagen no ha cargado, mostrar un placeholder
  if (!image || status === 'loading') {
    return (
      <>
        <Rect
          x={obra.x}
          y={obra.y}
          width={width}
          height={height}
          fill="#E5E7EB"
          stroke="#9CA3AF"
          strokeWidth={2}
          cornerRadius={4}
        />
        <Text
          x={obra.x}
          y={obra.y + height / 2 - 10}
          text="Cargando..."
          fontSize={12}
          fill="#6B7280"
          width={width}
          align="center"
        />
        <Text
          x={obra.x}
          y={obra.y + height + 5}
          text={obra.titulo || 'Sin título'}
          fontSize={10}
          fill="#141210"
          width={width}
          align="center"
        />
      </>
    )
  }

  // Si hubo un error cargando la imagen
  if (status === 'failed') {
    return (
      <>
        <Rect
          x={obra.x}
          y={obra.y}
          width={width}
          height={height}
          fill="#FEE2E2"
          stroke="#EF4444"
          strokeWidth={2}
          cornerRadius={4}
        />
        <Text
          x={obra.x}
          y={obra.y + height / 2 - 10}
          text="Error al cargar"
          fontSize={12}
          fill="#DC2626"
          width={width}
          align="center"
        />
        <Text
          x={obra.x}
          y={obra.y + height + 5}
          text={obra.titulo || 'Sin título'}
          fontSize={10}
          fill="#141210"
          width={width}
          align="center"
        />
      </>
    )
  }

  return (
    <>
      <KonvaImage
        id={obra.id}
        image={image}
        x={obra.x}
        y={obra.y}
        width={width}
        height={height}
        draggable
        onDragEnd={(e) => {
          onDragEnd(obra.id, e.target.x(), e.target.y())
        }}
        onClick={() => onSelect(obra.id)}
        onTap={() => onSelect(obra.id)}
        shadowBlur={isSelected ? 10 : 5}
        shadowColor="black"
        shadowOpacity={0.6}
        stroke={isSelected ? '#141210' : 'transparent'}
        strokeWidth={isSelected ? 3 : 0}
      />

      {/* Label con título */}
      <Text
        x={obra.x}
        y={obra.y + height + 5}
        text={obra.titulo || 'Sin título'}
        fontSize={10}
        fill="#141210"
        width={width}
        align="center"
      />
    </>
  )
}

export default function LayoutCanvas({
  paquete,
  portfolioImages,
  initialLayout,
  onSave,
  errors
}) {
  const stageRef = useRef()

  // Configuración del canvas
  const canvasHeight = (paquete.altura_pared / paquete.metros_lineales) * CANVAS_WIDTH

  // Factor de escala: cuántos píxeles representa 1 cm
  // metros_lineales * 100 = cm totales
  // CANVAS_WIDTH / cm totales = px por cm
  const scaleFactor = CANVAS_WIDTH / (paquete.metros_lineales * 100)

  // Estado
  const [obrasEnCanvas, setObrasEnCanvas] = useState(initialLayout?.obras || [])
  const [selectedObraId, setSelectedObraId] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [validationErrors, setValidationErrors] = useState([])
  const [containerWidth, setContainerWidth] = useState(CANVAS_WIDTH)

  // Obras disponibles (no en canvas)
  const obrasDisponibles = portfolioImages.filter(
    (img) => !obrasEnCanvas.some((o) => o.id === img.id)
  )

  // Debug: Log de portfolioImages recibidas
  useEffect(() => {
    console.log('Portfolio images received:', portfolioImages)
  }, [portfolioImages])

  // Responsive: Ajustar ancho del contenedor
  useEffect(() => {
    const updateWidth = () => {
      const container = document.getElementById('canvas-container')
      if (container) {
        const availableWidth = container.clientWidth
        setContainerWidth(Math.min(CANVAS_WIDTH, availableWidth - 32))
      }
    }

    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  // Factor de escala visual para responsive
  const visualScale = containerWidth / CANVAS_WIDTH

  // Agregar obra al canvas
  const handleAddToCanvas = (portfolioImage) => {
    console.log('Adding obra to canvas:', portfolioImage)

    // Validar obras máximas
    if (obrasEnCanvas.length >= paquete.obras_maximas) {
      alert(
        `El paquete ${paquete.nombre} permite máximo ${paquete.obras_maximas} obras`
      )
      return
    }

    const newObra = {
      id: portfolioImage.id,
      titulo: portfolioImage.titulo,
      preview: portfolioImage.preview,
      alto_cm: parseFloat(portfolioImage.alto_cm),
      ancho_cm: parseFloat(portfolioImage.ancho_cm),
      x: 50, // posición inicial
      y: 50,
      width: parseFloat(portfolioImage.ancho_cm) * scaleFactor,
      height: parseFloat(portfolioImage.alto_cm) * scaleFactor
    }

    console.log('New obra object:', newObra)
    setObrasEnCanvas([...obrasEnCanvas, newObra])
  }

  // Remover obra del canvas
  const handleRemoveFromCanvas = (obraId) => {
    setObrasEnCanvas(obrasEnCanvas.filter((o) => o.id !== obraId))
    if (selectedObraId === obraId) setSelectedObraId(null)
  }

  // Manejar drag end con validación
  const handleDragEnd = (obraId, newX, newY) => {
    const obra = obrasEnCanvas.find((o) => o.id === obraId)
    if (!obra) return

    const width = obra.ancho_cm * scaleFactor
    const height = obra.alto_cm * scaleFactor

    // Validar que no se salga del canvas
    const boundedX = Math.max(0, Math.min(newX, CANVAS_WIDTH - width))
    const boundedY = Math.max(0, Math.min(newY, canvasHeight - height))

    // Validar colisiones (AABB - Axis-Aligned Bounding Box)
    const hasCollision = obrasEnCanvas.some((other) => {
      if (other.id === obraId) return false

      const otherWidth = other.ancho_cm * scaleFactor
      const otherHeight = other.alto_cm * scaleFactor

      return !(
        boundedX + width < other.x ||
        boundedX > other.x + otherWidth ||
        boundedY + height < other.y ||
        boundedY > other.y + otherHeight
      )
    })

    if (hasCollision) {
      alert('Las obras no pueden superponerse')
      // Revertir: forzar re-render
      setObrasEnCanvas([...obrasEnCanvas])
      return
    }

    // Actualizar posición
    setObrasEnCanvas(
      obrasEnCanvas.map((o) =>
        o.id === obraId ? { ...o, x: boundedX, y: boundedY } : o
      )
    )
  }

  // Validar layout completo
  const validateLayout = () => {
    const errors = []

    if (obrasEnCanvas.length === 0) {
      errors.push('Debes agregar al menos una obra al canvas')
    }

    if (obrasEnCanvas.length > paquete.obras_maximas) {
      errors.push(`Excedes el límite de ${paquete.obras_maximas} obras`)
    }

    setValidationErrors(errors)
    return errors.length === 0
  }

  // Exportar canvas como imagen
  const exportCanvasAsImage = async () => {
    if (!stageRef.current) return null

    const dataURL = stageRef.current.toDataURL({ pixelRatio: 2 })

    // Convertir dataURL a Blob
    const response = await fetch(dataURL)
    const blob = await response.blob()

    return blob
  }

  // Generar PDF
  const generatePDF = () => {
    if (!stageRef.current) return

    const dataURL = stageRef.current.toDataURL()

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [CANVAS_WIDTH, canvasHeight]
    })

    pdf.addImage(dataURL, 'PNG', 0, 0, CANVAS_WIDTH, canvasHeight)

    // Agregar información del paquete en segunda página
    pdf.addPage()
    pdf.setFontSize(16)
    pdf.text(`Layout - ${paquete.nombre}`, 20, 30)
    pdf.setFontSize(12)
    pdf.text(
      `Dimensiones: ${paquete.metros_lineales}m x ${paquete.altura_pared}m`,
      20,
      50
    )
    pdf.text(
      `Obras en layout: ${obrasEnCanvas.length} de ${paquete.obras_maximas}`,
      20,
      70
    )

    obrasEnCanvas.forEach((obra, index) => {
      pdf.text(
        `${index + 1}. ${obra.titulo} - ${obra.alto_cm}cm x ${obra.ancho_cm}cm`,
        20,
        90 + index * 15
      )
    })

    pdf.save('layout-paquete.pdf')
  }

  // Guardar layout
  const handleSaveLayout = async () => {
    if (!validateLayout()) {
      alert('Por favor corrige los errores antes de guardar')
      return
    }

    setIsSaving(true)

    try {
      // 1. Exportar canvas como imagen
      const imageBlob = await exportCanvasAsImage()

      // 2. Subir a Cloudinary
      const uploadResponse = await layoutsApi.uploadCanvas(imageBlob)

      // 3. Preparar datos del layout
      const layoutData = {
        paquete_id: paquete.id,
        canvas_width: CANVAS_WIDTH,
        canvas_height: canvasHeight,
        scale_factor: scaleFactor,
        obras: obrasEnCanvas.map((obra) => ({
          id: obra.id,
          titulo: obra.titulo,
          preview: obra.preview,
          alto_cm: obra.alto_cm,
          ancho_cm: obra.ancho_cm,
          x: obra.x,
          y: obra.y,
          width: obra.width,
          height: obra.height
        }))
      }

      // 4. Callback al componente padre
      onSave(layoutData, uploadResponse.data.url)

      alert('Layout guardado exitosamente')
    } catch (error) {
      console.error('Error al guardar layout:', error)
      alert('Error al guardar el layout. Inténtalo de nuevo.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Sidebar: Obras disponibles */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Tus Obras ({obrasDisponibles.length})
          </h3>
          <p className="text-xs text-gray-600 mb-4">
            Haz clic para agregar al canvas
          </p>

          <div className="space-y-3 max-h-64 lg:max-h-96 overflow-y-auto">
            {obrasDisponibles.map((img) => (
              <div
                key={img.id}
                onClick={() => handleAddToCanvas(img)}
                className="bg-white p-3 rounded-2xl cursor-pointer hover:bg-gray-100 transition-all border border-gray-200"
              >
                <img
                  src={img.preview}
                  alt={img.titulo}
                  className="w-full h-32 object-cover rounded-2xl mb-2"
                />
                <p className="text-sm text-gray-900 font-medium truncate">
                  {img.titulo}
                </p>
                <p className="text-xs text-gray-600">
                  {img.alto_cm} x {img.ancho_cm} cm
                </p>
              </div>
            ))}

            {obrasDisponibles.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-8">
                Todas tus obras están en el canvas
              </p>
            )}
          </div>
        </div>

        {/* Obras en canvas */}
        {obrasEnCanvas.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              En Canvas ({obrasEnCanvas.length}/{paquete.obras_maximas})
            </h3>
            <div className="space-y-2">
              {obrasEnCanvas.map((obra) => (
                <div
                  key={obra.id}
                  className="flex items-center justify-between bg-white p-2 rounded-2xl text-sm border border-gray-200"
                >
                  <span className="text-gray-900 truncate flex-1">
                    {obra.titulo}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFromCanvas(obra.id)}
                    className="text-red-600 hover:text-red-700 ml-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Canvas principal */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {paquete.nombre}
              </h3>
              <p className="text-xs text-gray-600">
                {paquete.metros_lineales}m x {paquete.altura_pared}m
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={generatePDF}
                disabled={obrasEnCanvas.length === 0}
                className="px-4 py-2 bg-gray-200 text-gray-900 rounded-2xl hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Exportar PDF
              </button>
              <button
                type="button"
                onClick={handleSaveLayout}
                disabled={isSaving || obrasEnCanvas.length === 0}
                className="px-4 py-2 bg-gray-900 text-white rounded-2xl hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
              >
                {isSaving ? 'Guardando...' : 'Guardar Layout'}
              </button>
            </div>
          </div>

          {/* Konva Stage */}
          <div
            id="canvas-container"
            className="bg-white rounded-2xl overflow-hidden border border-gray-300"
            style={{
              width: '100%',
              maxWidth: CANVAS_WIDTH,
              height: canvasHeight * visualScale
            }}
          >
            <div
              style={{
                transformOrigin: 'top left',
                transform: `scale(${visualScale})`,
                width: CANVAS_WIDTH,
                height: canvasHeight
              }}
            >
              <Stage ref={stageRef} width={CANVAS_WIDTH} height={canvasHeight}>
              <Layer>
                {/* Fondo de pared */}
                <Rect
                  x={0}
                  y={0}
                  width={CANVAS_WIDTH}
                  height={canvasHeight}
                  fill="#F5F5F5"
                  stroke="#CCCCCC"
                  strokeWidth={2}
                />

                {/* Grid de referencia (cada metro) */}
                {Array.from({ length: Math.floor(paquete.metros_lineales) }).map(
                  (_, i) => (
                    <Rect
                      key={`grid-${i}`}
                      x={i * 100 * scaleFactor}
                      y={0}
                      width={1}
                      height={canvasHeight}
                      fill="#DDDDDD"
                    />
                  )
                )}

                {/* Obras */}
                {obrasEnCanvas.map((obra) => (
                  <ObraImage
                    key={obra.id}
                    obra={obra}
                    onDragEnd={handleDragEnd}
                    isSelected={selectedObraId === obra.id}
                    onSelect={setSelectedObraId}
                    scaleFactor={scaleFactor}
                  />
                ))}
              </Layer>
            </Stage>
            </div>
          </div>

          {/* Validación */}
          {validationErrors.length > 0 && (
            <div className="mt-4 bg-red-50 border border-red-600 rounded-2xl p-3">
              <p className="text-sm font-semibold text-red-700 mb-2">
                Errores de validación:
              </p>
              <ul className="list-disc list-inside text-sm text-red-600">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Instrucciones */}
        <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded-r-2xl">
          <p className="text-sm font-semibold text-green-900 mb-2">
            Instrucciones:
          </p>
          <ul className="list-disc list-inside text-sm text-green-800 space-y-1">
            <li>Haz clic en una obra de la lista para agregarla al canvas</li>
            <li>Arrastra las obras para posicionarlas</li>
            <li>Las obras no pueden superponerse ni salirse del espacio</li>
            <li>Respeta el límite de {paquete.obras_maximas} obras</li>
            <li>Guarda el layout antes de continuar al siguiente paso</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
