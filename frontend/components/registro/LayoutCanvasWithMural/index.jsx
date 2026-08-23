'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Stage, Layer, Group, Rect } from 'react-konva'
import { layoutsApi } from '@/lib/api'

// Helper para detectar dispositivos y optimizar rendimiento
const getDeviceConfig = () => {
  if (typeof window === 'undefined') return { isTablet: false, isMobile: false, pixelRatio: 1 }

  const ua = navigator.userAgent
  const isTablet = /iPad|Android(?!.*Mobile)/i.test(ua) ||
                  (navigator.maxTouchPoints > 1 && window.innerWidth >= 768 && window.innerWidth <= 1366)
  const isMobile = /iPhone|iPod|Android.*Mobile/i.test(ua) || window.innerWidth < 768

  // Reducir pixelRatio agresivamente en tablets/móviles para mejor rendimiento
  // iPad tiene pixelRatio de 2, pero renderizar a 2x es MUY pesado para Konva
  let pixelRatio = 1 // Siempre 1x en tablets y móviles para máximo rendimiento
  if (!isTablet && !isMobile) {
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2) // Desktop máximo 2x
  }

  return { isTablet, isMobile, pixelRatio }
}

// Hooks
import { useCanvasDimensions } from './hooks/useCanvasDimensions'
import { useCanvasExport } from './hooks/useCanvasExport'
import { useObraMetadata } from './hooks/useObraMetadata'
import { useLayoutValidation } from './hooks/useLayoutValidation'
import { useTouchDrag } from './hooks/useTouchDrag'

// Componentes
import { HorizontalRuler } from './components/rulers/HorizontalRuler'
import { VerticalRuler } from './components/rulers/VerticalRuler'
import { GuideLines } from './components/guides/GuideLines'
import { MuralBackground } from './components/canvas/MuralBackground'
import { PaqueteDelimiter } from './components/canvas/PaqueteDelimiter'
import { NotaAreaConsideracion } from './components/canvas/NotaAreaConsideracion'
import { Obra2D } from './components/obras/Obra2D'
import { Obra3D } from './components/obras/Obra3D'
import { ObrasGallery } from './components/gallery/ObrasGallery'
import { ObraMetadataModal } from './components/modal/ObraMetadataModal'

// Utilidades
import { calcularDimensionesObra, centrarObraEnArea } from './utils/scaling.utils'
import { checkPositionCollision } from './utils/collision.utils'

// Constantes
import { RULER_SIZE, RULER_BG_COLOR, CURSOR_DRAG, CURSOR_DRAGGING } from './constants/canvas.constants'

// Estilos
import styles from './styles/LayoutCanvas.module.css'

/**
 * LayoutCanvasWithMural - Canvas principal con gestión de obras
 * Refactorizado aplicando principios SOLID
 *
 * @param {boolean} hideGallery - Oculta la galería de obras (para manejo externo)
 * @param {boolean} hideActions - Oculta los botones de exportar/guardar (para manejo externo)
 * @param {Function} onCanvasReady - Callback con funciones de exportar/guardar cuando el canvas está listo
 */
export default function LayoutCanvasWithMural({
  paquete,
  portfolioImages = [],
  initialLayout,
  onSave,
  onSaveAndContinue,
  errors,
  hideGallery = false,
  hideActions = false,
  onCanvasReady
}) {
  // Referencias
  const stageRef = useRef()
  const canvasWrapperRef = useRef()

  // Configuración de dispositivo para optimización de rendimiento
  const deviceConfig = useMemo(() => getDeviceConfig(), [])

  // Estado local - DEBE IR PRIMERO antes de los hooks que lo usan
  const [obrasEnCanvas, setObrasEnCanvas] = useState(initialLayout?.obras || [])
  const [selectedObraId, setSelectedObraId] = useState(null)
  const [dragGuide, setDragGuide] = useState({ x: null, y: null, width: null, height: null, isColliding: false })
  const [draggedFromRow, setDraggedFromRow] = useState(null)
  const [dropPreview, setDropPreview] = useState(null)
  const [isDraggingObra, setIsDraggingObra] = useState(false) // Para cursor grab/grabbing
  const [isHoveringObra, setIsHoveringObra] = useState(false) // Para cursor grab al hover

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

  const { validationErrors, isSaving, setIsSaving, validate } = useLayoutValidation(
    obrasEnCanvas,
    areaDelimitada,
    paquete?.obras_maximas
  )

  // Handler para touch drop
  const handleTouchDrop = useCallback((obra, relativeX, relativeY) => {
    if (!obra || !areaDelimitada) return

    const dimensions = getObraDimensions(obra)

    // Ajustar posición considerando el ruler (RULER_SIZE)
    const adjustedX = relativeX - RULER_SIZE
    const adjustedY = relativeY - RULER_SIZE

    // Limitar a los bounds del área delimitada
    const boundedX = Math.max(
      areaDelimitada.x,
      Math.min(adjustedX - dimensions.width / 2, areaDelimitada.x + areaDelimitada.width - dimensions.width)
    )
    const boundedY = Math.max(
      areaDelimitada.y,
      Math.min(adjustedY - dimensions.height / 2, areaDelimitada.y + areaDelimitada.height - dimensions.height)
    )

    // Verificar colisión
    const hasCollision = checkPositionCollision(
      { id: 'preview', x: boundedX, y: boundedY, ...dimensions },
      obrasEnCanvas
    )

    if (hasCollision) {
      alert('⚠️ No puedes soltar la obra aquí porque colisiona con otra.')
      return
    }

    // Agregar obra al canvas
    const newObra = {
      id: obra.id,
      x: boundedX,
      y: boundedY,
      width: dimensions.width,
      height: dimensions.height,
      preview: obra.preview,
      titulo: obra.titulo,
      ancho_cm: parseFloat(obra.ancho_cm),
      alto_cm: parseFloat(obra.alto_cm),
      largo_cm: es3D ? parseFloat(obra.largo_cm) : null,
      tecnica: obra.tecnica,
      anio: parseInt(obra.anio),
      precio_mxn: parseFloat(obra.precio_mxn),
      notas_montaje: obra.notas_montaje || '',
      tipo_obra: es3D ? '3D' : '2D'
    }

    setObrasEnCanvas([...obrasEnCanvas, newObra])
  }, [areaDelimitada, obrasEnCanvas, es3D, getObraDimensions])

  // Hook para touch drag
  const {
    isDragging: isTouchDragging,
    draggedObra: touchDraggedObra,
    touchPosition,
    previewSize,
    handleTouchStart: onTouchDragStart,
    handleTouchMove,
    handleTouchEnd,
    cancelDrag
  } = useTouchDrag(handleTouchDrop, canvasWrapperRef)

  // Actualizar obras cuando cambian las imágenes del portfolio
  useEffect(() => {
    setTodasLasObras(portfolioImages)
  }, [portfolioImages, setTodasLasObras])

  // ========== MANEJADORES DE DRAG & DROP ==========

  const handleDragMove = (obraId, x, y, width, height, isColliding) => {
    setDragGuide({ x, y, width, height, isColliding })
  }

  // Handlers para cursor de obras
  const handleObraDragStart = () => {
    setIsDraggingObra(true)
  }

  const handleObraDragEnd = () => {
    setIsDraggingObra(false)
  }

  const handleObraMouseEnter = () => {
    setIsHoveringObra(true)
  }

  const handleObraMouseLeave = () => {
    setIsHoveringObra(false)
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

      const { pdfBlob, previewDataUrl, obrasConBase64 } = pdfResult
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
        obras: obrasConBase64.map((obra) => ({
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

  // ========== EXPONER FUNCIONES AL PADRE ==========

  useEffect(() => {
    if (onCanvasReady && stageRef.current) {
      onCanvasReady({
        exportPDF: async () => {
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
          link.download = `layout-${paquete?.nombre?.toLowerCase().replace(/ /g, '-') || 'lienzo'}.png`
          link.click()
        },
        saveAndContinue: handleSaveAndContinueLayout,
        getObrasEnCanvas: () => obrasEnCanvas,
        isSaving,
        // Exponer funciones de drag para uso externo
        handleRowDragStart,
        getObraDimensions,
      })
    }
  }, [onCanvasReady, stageRef.current, obrasEnCanvas.length, isSaving])

  // ========== RENDERIZADO ==========

  if (!paquete) {
    return (
      <div className={styles.loading}>
        <p>Cargando información del paquete...</p>
      </div>
    )
  }

  return (
    <div
      className={styles.container}
      onTouchMove={isTouchDragging ? handleTouchMove : undefined}
      onTouchEnd={isTouchDragging ? handleTouchEnd : undefined}
      style={{
        touchAction: isTouchDragging ? 'none' : 'auto',
      }}
    >
      {/* Galería de obras - opcional */}
      {!hideGallery && (
        <ObrasGallery
          obras={todasLasObras}
          obrasEnCanvas={obrasEnCanvas}
          obrasMaximas={paquete.obras_maximas}
          onAddNewObra={(e) => handleAddNewObra(e.target.files)}
          onEditObra={openMetadataForm}
          onDeleteObra={deleteObra}
          onDragStart={handleRowDragStart}
          onTouchDragStart={onTouchDragStart}
          hasCompleteMetadata={hasCompleteMetadata}
        />
      )}

      {/* Canvas */}
      <div className={styles.canvasSection}>
        {/* Botones de acción - opcional */}
        {!hideActions && (
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
        )}

        {/* Canvas wrapper */}
        <div
          ref={canvasWrapperRef}
          className={styles.canvasWrapper}
          style={{
            width: '100%',
            maxWidth: `${canvasWidth + RULER_SIZE}px`,
            overflow: 'auto',
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            // Cursor dinámico: icono personalizado mientras arrastra/hover
            cursor: isDraggingObra ? CURSOR_DRAGGING : (isHoveringObra ? CURSOR_DRAG : 'default')
          }}
          onDragOver={handleCanvasDragOver}
          onDrop={handleCanvasDrop}
          onDragLeave={handleCanvasDragLeave}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <Stage
            ref={stageRef}
            width={canvasWidth + RULER_SIZE}
            height={canvasHeight + RULER_SIZE}
            // Optimización: usar pixelRatio reducido en tablets/móviles
            pixelRatio={deviceConfig.pixelRatio}
          >
            {/* Layer de reglas - listening:false para mejor rendimiento */}
            <Layer listening={false}>
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
              <PaqueteDelimiter paquete={paquete} areaDelimitada={areaDelimitada} canvasWidth={canvasWidth} canvasHeight={canvasHeight} />

              {/* Nota de área de consideración solo en canvas 2D */}
              {!es3D && <NotaAreaConsideracion canvasWidth={canvasWidth} canvasHeight={canvasHeight} />}

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
                    onCursorDragStart={handleObraDragStart}
                    onCursorDragEnd={handleObraDragEnd}
                    onCursorMouseEnter={handleObraMouseEnter}
                    onCursorMouseLeave={handleObraMouseLeave}
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

      {/* Preview flotante para touch drag */}
      {isTouchDragging && touchDraggedObra && (
        <div
          style={{
            position: 'fixed',
            left: touchPosition.x - previewSize.width / 2,
            top: touchPosition.y - previewSize.height / 2,
            width: previewSize.width,
            height: previewSize.height,
            pointerEvents: 'none',
            zIndex: 99999,
            opacity: 0.85,
            transform: 'scale(1.05)',
            transition: 'transform 0.1s ease',
          }}
        >
          <img
            src={touchDraggedObra.preview}
            alt="Arrastrando"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '8px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              border: '2px solid #B83030',
            }}
          />
        </div>
      )}
    </div>
  )
}
