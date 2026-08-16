'use client'

import { useState, useRef, useEffect } from 'react'
import { Stage, Layer, Group, Rect } from 'react-konva'
import { layoutsApi } from '@/lib/api'

// Hooks
import { useCanvasDimensions } from './hooks/useCanvasDimensions'
import { useCanvasExport } from './hooks/useCanvasExport'
import { useObraMetadata } from './hooks/useObraMetadata'
import { useLayoutValidation } from './hooks/useLayoutValidation'

// Componentes
import { HorizontalRuler } from './components/rulers/HorizontalRuler'
import { VerticalRuler } from './components/rulers/VerticalRuler'
import { GuideLines } from './components/guides/GuideLines'
import { MuralBackground } from './components/canvas/MuralBackground'
import { PaqueteDelimiter } from './components/canvas/PaqueteDelimiter'
import { Obra2D } from './components/obras/Obra2D'
import { Obra3D } from './components/obras/Obra3D'
import { ObrasGallery } from './components/gallery/ObrasGallery'
import { ObraMetadataModal } from './components/modal/ObraMetadataModal'

// Utilidades
import { calcularDimensionesObra, centrarObraEnArea } from './utils/scaling.utils'
import { checkPositionCollision } from './utils/collision.utils'

// Constantes
import { RULER_SIZE, RULER_BG_COLOR } from './constants/canvas.constants'

// Estilos
import styles from './styles/LayoutCanvas.module.css'

/**
 * LayoutCanvasWithMural - Canvas principal con gestión de obras
 * Refactorizado aplicando principios SOLID
 */
export default function LayoutCanvasWithMural({
  paquete,
  portfolioImages = [],
  initialLayout,
  onSave,
  onSaveAndContinue,
  errors
}) {
  // Referencias
  const stageRef = useRef()

  // Hooks personalizados
  const { es3D, canvasWidth, canvasHeight, freeArea, plantillaURL, areaDelimitada } =
    useCanvasDimensions(paquete)

  const {
    todasLasObras,
    setTodasLasObras,
    editingObra,
    showMetadataForm,
    handleAddNewObra,
    updateObraMetadata,
    deleteObra,
    openMetadataForm,
    closeMetadataForm,
    hasCompleteMetadata,
    getObraDimensions
  } = useObraMetadata(portfolioImages, es3D)

  const { exportAsImage, exportAsPDF } = useCanvasExport(
    stageRef,
    { canvasWidth, canvasHeight },
    obrasEnCanvas,
    paquete
  )

  // Estado local
  const [obrasEnCanvas, setObrasEnCanvas] = useState(initialLayout?.obras || [])
  const [selectedObraId, setSelectedObraId] = useState(null)
  const [dragGuide, setDragGuide] = useState({ x: null, y: null, width: null, height: null, isColliding: false })
  const [draggedFromRow, setDraggedFromRow] = useState(null)
  const [dropPreview, setDropPreview] = useState(null)

  const { validationErrors, isSaving, setIsSaving, validate } = useLayoutValidation(
    obrasEnCanvas,
    areaDelimitada,
    paquete?.obras_maximas
  )

  // Actualizar obras cuando cambian las imágenes del portfolio
  useEffect(() => {
    setTodasLasObras(portfolioImages)
  }, [portfolioImages, setTodasLasObras])

  // ========== MANEJADORES DE DRAG & DROP ==========

  const handleDragMove = (obraId, x, y, width, height, isColliding) => {
    setDragGuide({ x, y, width, height, isColliding })
  }

  const handleDragEnd = (obraId, newX, newY, hasCollision, lastValidPos) => {
    if (hasCollision) {
      alert('⚠️ No puedes soltar la obra aquí porque colisiona con otra. Por favor, colócala en un espacio libre.')
      // Restaurar a última posición válida
      setObrasEnCanvas(obras =>
        obras.map(o =>
          o.id === obraId ? { ...o, x: lastValidPos.x, y: lastValidPos.y } : o
        )
      )
    } else {
      // Actualizar posición
      setObrasEnCanvas(obras =>
        obras.map(o => (o.id === obraId ? { ...o, x: newX, y: newY } : o))
      )
    }
    setDragGuide({ x: null, y: null, width: null, height: null, isColliding: false })
  }

  const handleRemoveFromCanvas = (obraId) => {
    setObrasEnCanvas(obras => obras.filter(o => o.id !== obraId))
    if (selectedObraId === obraId) {
      setSelectedObraId(null)
    }
  }

  const handleRowDragStart = (e, obra) => {
    setDraggedFromRow(obra)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleCanvasDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'

    if (!draggedFromRow) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left - RULER_SIZE
    const y = e.clientY - rect.top - RULER_SIZE

    const dimensions = getObraDimensions(draggedFromRow)
    const boundedX = Math.max(
      areaDelimitada.x,
      Math.min(x, areaDelimitada.x + areaDelimitada.width - dimensions.width)
    )
    const boundedY = Math.max(
      areaDelimitada.y,
      Math.min(y, areaDelimitada.y + areaDelimitada.height - dimensions.height)
    )

    const hasCollision = checkPositionCollision(
      { id: 'preview', x: boundedX, y: boundedY, ...dimensions },
      obrasEnCanvas
    )

    setDropPreview({
      x: boundedX,
      y: boundedY,
      width: dimensions.width,
      height: dimensions.height,
      isColliding: hasCollision
    })
  }

  const handleCanvasDrop = (e) => {
    e.preventDefault()

    if (!draggedFromRow || !dropPreview) {
      setDraggedFromRow(null)
      setDropPreview(null)
      return
    }

    if (dropPreview.isColliding) {
      alert('⚠️ No puedes soltar la obra aquí porque colisiona con otra.')
      setDraggedFromRow(null)
      setDropPreview(null)
      return
    }

    const newObra = {
      id: draggedFromRow.id,
      x: dropPreview.x,
      y: dropPreview.y,
      width: dropPreview.width,
      height: dropPreview.height,
      preview: draggedFromRow.preview,
      titulo: draggedFromRow.titulo,
      ancho_cm: parseFloat(draggedFromRow.ancho_cm),
      alto_cm: parseFloat(draggedFromRow.alto_cm),
      largo_cm: es3D ? parseFloat(draggedFromRow.largo_cm) : null,
      tecnica: draggedFromRow.tecnica,
      anio: parseInt(draggedFromRow.anio),
      precio_mxn: parseFloat(draggedFromRow.precio_mxn),
      notas_montaje: draggedFromRow.notas_montaje || '',
      tipo_obra: es3D ? '3D' : '2D'
    }

    setObrasEnCanvas([...obrasEnCanvas, newObra])
    setDraggedFromRow(null)
    setDropPreview(null)
  }

  const handleCanvasDragLeave = () => {
    setDropPreview(null)
  }

  // ========== MANEJADORES DE GUARDADO ==========

  const handleSaveAndContinueLayout = async () => {
    if (!validate()) {
      alert('Por favor agrega al menos una obra al lienzo')
      return
    }

    setIsSaving(true)

    try {
      console.log('Exportando canvas como PDF...')

      const pdfResult = await exportAsPDF()
      if (!pdfResult) {
        throw new Error('No se pudo generar el PDF')
      }

      const { pdfBlob, previewDataUrl } = pdfResult
      console.log('PDF generado, blob size:', pdfBlob.size)

      const imageBlob = await exportAsImage()
      const imageReader = new FileReader()
      const imageDataURL = await new Promise((resolve) => {
        imageReader.onloadend = () => resolve(imageReader.result)
        imageReader.readAsDataURL(imageBlob)
      })

      const layoutData = {
        paquete_id: paquete.id,
        paquete_nombre: paquete.nombre,
        metros_lineales: paquete.metros_lineales,
        canvas_width: canvasWidth,
        canvas_height: canvasHeight,
        canvas_pdf_blob: pdfBlob,
        canvas_image_blob: imageBlob,
        canvas_image_url: imageDataURL,
        canvas_preview_url: previewDataUrl,
        obras: obrasEnCanvas.map((obra) => ({
          id: obra.id,
          titulo: obra.titulo,
          preview: obra.preview,
          alto_cm: obra.alto_cm,
          ancho_cm: obra.ancho_cm,
          tecnica: obra.tecnica,
          anio: obra.anio,
          precio_mxn: obra.precio_mxn,
          notas_montaje: obra.notas_montaje,
          x: obra.x,
          y: obra.y,
          width: obra.width,
          height: obra.height
        }))
      }

      const obrasCompletas = todasLasObras.filter(obra =>
        layoutData.obras.some(obraCanvas => obraCanvas.id === obra.id)
      )

      console.log('Layout data preparado con PDF, obras:', obrasCompletas.length)

      if (onSaveAndContinue) {
        console.log('Llamando a onSaveAndContinue...')
        onSaveAndContinue(layoutData, imageDataURL, obrasCompletas)
      } else {
        console.warn('onSaveAndContinue no está definido')
      }

      console.log('Guardado exitoso')
    } catch (error) {
      console.error('Error al guardar layout:', error)
      alert('Error al guardar el layout: ' + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  // ========== RENDERIZADO ==========

  if (!paquete) {
    return (
      <div className={styles.loading}>
        <p>Cargando información del paquete...</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* Galería de obras */}
      <ObrasGallery
        obras={todasLasObras}
        obrasEnCanvas={obrasEnCanvas}
        obrasMaximas={paquete.obras_maximas}
        onAddNewObra={(e) => handleAddNewObra(e.target.files)}
        onEditObra={openMetadataForm}
        onDeleteObra={deleteObra}
        onDragStart={handleRowDragStart}
        hasCompleteMetadata={hasCompleteMetadata}
      />

      {/* Canvas */}
      <div className={styles.canvasSection}>
        {/* Botones de acción */}
        <div className={styles.canvasActions}>
          <button
            type="button"
            onClick={() => {
              if (!stageRef.current) return
              const dataURL = stageRef.current.toDataURL({
                x: RULER_SIZE,
                y: RULER_SIZE,
                width: canvasWidth,
                height: canvasHeight,
                pixelRatio: 1
              })
              const link = document.createElement('a')
              link.href = dataURL
              link.download = `layout-${paquete.nombre.toLowerCase().replace(/ /g, '-')}.png`
              link.click()
            }}
            disabled={obrasEnCanvas.length === 0}
            className={styles.btnExportarPDF}
          >
            Exportar PDF
          </button>
          <button
            type="button"
            onClick={handleSaveAndContinueLayout}
            disabled={isSaving || obrasEnCanvas.length === 0}
            className={styles.btnGuardarContinuar}
          >
            {isSaving ? 'Guardando...' : 'Guardar y Continuar Registro'}
          </button>
        </div>

        {/* Canvas wrapper */}
        <div
          className={styles.canvasWrapper}
          style={{
            width: '100%',
            maxWidth: `${canvasWidth + RULER_SIZE}px`,
            overflow: 'auto',
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}
          onDragOver={handleCanvasDragOver}
          onDrop={handleCanvasDrop}
          onDragLeave={handleCanvasDragLeave}
        >
          <Stage ref={stageRef} width={canvasWidth + RULER_SIZE} height={canvasHeight + RULER_SIZE}>
            {/* Layer de reglas */}
            <Layer>
              <Rect
                x={0}
                y={0}
                width={RULER_SIZE}
                height={RULER_SIZE}
                fill={RULER_BG_COLOR}
              />
              <Group x={RULER_SIZE} y={0}>
                <HorizontalRuler width={canvasWidth} />
              </Group>
              <Group x={0} y={RULER_SIZE}>
                <VerticalRuler height={canvasHeight} />
              </Group>
            </Layer>

            {/* Layer del canvas y obras */}
            <Layer x={RULER_SIZE} y={RULER_SIZE}>
              <MuralBackground plantillaURL={plantillaURL} width={canvasWidth} height={canvasHeight} />
              <PaqueteDelimiter paquete={paquete} freeArea={freeArea} canvasHeight={canvasHeight} />

              {/* Obras en el canvas */}
              {obrasEnCanvas.map((obra, index) => {
                const ObraComponent = es3D ? Obra3D : Obra2D
                return (
                  <ObraComponent
                    key={obra.id}
                    obra={obra}
                    onDragEnd={handleDragEnd}
                    onDragMove={handleDragMove}
                    isSelected={selectedObraId === obra.id}
                    onSelect={setSelectedObraId}
                    onDelete={handleRemoveFromCanvas}
                    otrasObras={obrasEnCanvas}
                    areaDelimitada={areaDelimitada}
                    freeArea={freeArea}
                    obraIndex={index}
                  />
                )
              })}

              {/* Líneas guía durante arrastre */}
              <GuideLines
                x={dragGuide.x}
                y={dragGuide.y}
                width={dragGuide.width}
                height={dragGuide.height}
                canvasWidth={canvasWidth}
                canvasHeight={canvasHeight}
                areaDelimitada={areaDelimitada}
                isColliding={dragGuide.isColliding}
              />

              {/* Preview durante drop desde galería */}
              {dropPreview && (
                <GuideLines
                  x={dropPreview.x}
                  y={dropPreview.y}
                  width={dropPreview.width}
                  height={dropPreview.height}
                  canvasWidth={canvasWidth}
                  canvasHeight={canvasHeight}
                  areaDelimitada={areaDelimitada}
                  isColliding={dropPreview.isColliding}
                />
              )}
            </Layer>
          </Stage>
        </div>

        {/* Errores de validación */}
        {validationErrors.length > 0 && (
          <div className={styles.erroresContainer}>
            {validationErrors.map((error, index) => (
              <div key={index} className={styles.error}>
                {error}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de metadata */}
      {showMetadataForm && editingObra && (
        <ObraMetadataModal
          obra={editingObra}
          es3D={es3D}
          onUpdateMetadata={updateObraMetadata}
          onClose={closeMetadataForm}
        />
      )}
    </div>
  )
}
