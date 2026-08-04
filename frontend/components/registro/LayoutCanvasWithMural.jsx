'use client'

import { useState, useRef, useEffect } from 'react'
import { Stage, Layer, Image as KonvaImage, Rect, Text, Group } from 'react-konva'
import useImage from 'use-image'
import jsPDF from 'jspdf'
import { layoutsApi } from '@/lib/api'

/**
 * LayoutCanvasWithMural - Canvas con SVG del mural como fondo
 */

// Plantilla única del mural
const PLANTILLA_URL = '/plantilla-mural.svg'

// Dimensiones del canvas basadas en el SVG (1854 x 567)
const CANVAS_WIDTH = 1854
const CANVAS_HEIGHT = 567

// Área libre del mural (rectángulo central sin rayado)
// Basado en el análisis del SVG, el área libre está aproximadamente:
const FREE_AREA = {
  x: 130,        // Después de la regla izquierda
  y: 110,        // Después del área rayada superior
  width: 1550,   // Ancho del área libre
  height: 350    // Altura del área libre (hasta el área rayada inferior)
}

/**
 * Componente de obra individual con cursor y botón de eliminar
 */
function ObraImage({ obra, onDragEnd, isSelected, onSelect, onDelete }) {
  const [image, status] = useImage(obra.preview, 'anonymous')
  const stageRef = useRef()

  if (!image || status === 'loading') {
    return (
      <>
        <Rect
          x={obra.x}
          y={obra.y}
          width={obra.width}
          height={obra.height}
          fill="#E5E7EB"
          stroke="#9CA3AF"
          strokeWidth={2}
          cornerRadius={4}
        />
        <Text
          x={obra.x}
          y={obra.y + obra.height / 2 - 10}
          text="Cargando..."
          fontSize={12}
          fill="#6B7280"
          width={obra.width}
          align="center"
        />
      </>
    )
  }

  if (status === 'failed') {
    return (
      <Rect
        x={obra.x}
        y={obra.y}
        width={obra.width}
        height={obra.height}
        fill="#FEE2E2"
        stroke="#EF4444"
        strokeWidth={2}
        cornerRadius={4}
      />
    )
  }

  return (
    <Group>
      <KonvaImage
        id={obra.id}
        image={image}
        x={obra.x}
        y={obra.y}
        width={obra.width}
        height={obra.height}
        draggable
        onDragEnd={(e) => onDragEnd(obra.id, e.target.x(), e.target.y())}
        onClick={() => onSelect(obra.id)}
        onTap={() => onSelect(obra.id)}
        onMouseEnter={(e) => {
          const container = e.target.getStage().container()
          container.style.cursor = 'move'
        }}
        onMouseLeave={(e) => {
          const container = e.target.getStage().container()
          container.style.cursor = 'default'
        }}
        shadowBlur={isSelected ? 15 : 8}
        shadowColor="black"
        shadowOpacity={0.7}
        stroke={isSelected ? '#ffffff' : 'transparent'}
        strokeWidth={isSelected ? 4 : 0}
      />

      {/* Botón de eliminar cuando está seleccionada */}
      {isSelected && (
        <Group>
          <Rect
            x={obra.x + obra.width - 30}
            y={obra.y - 10}
            width={30}
            height={30}
            fill="#B83030"
            cornerRadius={15}
            onClick={(e) => {
              e.cancelBubble = true
              onDelete(obra.id)
            }}
            onMouseEnter={(e) => {
              const container = e.target.getStage().container()
              container.style.cursor = 'pointer'
            }}
            onMouseLeave={(e) => {
              const container = e.target.getStage().container()
              container.style.cursor = 'default'
            }}
          />
          <Text
            x={obra.x + obra.width - 30}
            y={obra.y - 10}
            width={30}
            height={30}
            text="×"
            fontSize={22}
            fill="white"
            align="center"
            verticalAlign="middle"
            onClick={(e) => {
              e.cancelBubble = true
              onDelete(obra.id)
            }}
            onMouseEnter={(e) => {
              const container = e.target.getStage().container()
              container.style.cursor = 'pointer'
            }}
            onMouseLeave={(e) => {
              const container = e.target.getStage().container()
              container.style.cursor = 'default'
            }}
          />
        </Group>
      )}
    </Group>
  )
}

/**
 * Componente del fondo del mural (SVG)
 */
function MuralBackground({ plantillaURL, width, height }) {
  const [image] = useImage(plantillaURL)

  if (!image) return null

  return <KonvaImage image={image} x={0} y={0} width={width} height={height} />
}

export default function LayoutCanvasWithMural({
  paquete,
  portfolioImages = [],
  initialLayout,
  onSave,
  onSaveAndContinue,
  errors
}) {
  const stageRef = useRef()
  const fileInputRef = useRef()

  // Estado
  const [todasLasObras, setTodasLasObras] = useState(portfolioImages)
  const [obrasEnCanvas, setObrasEnCanvas] = useState(initialLayout?.obras || [])
  const [selectedObraId, setSelectedObraId] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [validationErrors, setValidationErrors] = useState([])
  const [editingObra, setEditingObra] = useState(null)
  const [showMetadataForm, setShowMetadataForm] = useState(false)

  const obrasDisponibles = todasLasObras.filter(
    (img) => !obrasEnCanvas.some((o) => o.id === img.id)
  )

  useEffect(() => {
    setTodasLasObras(portfolioImages)
  }, [portfolioImages])

  const handleAddNewObra = (e) => {
    const files = Array.from(e.target.files)
    const MAX_SIZE = 5 * 1024 * 1024

    const validFiles = files.filter(file => {
      if (file.size > MAX_SIZE) {
        alert(`${file.name} excede el límite de 5MB`)
        return false
      }
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} no es una imagen válida`)
        return false
      }
      return true
    })

    const newObras = validFiles.map(file => ({
      id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      preview: URL.createObjectURL(file),
      titulo: '',
      alto_cm: '',
      ancho_cm: ''
    }))

    setTodasLasObras([...todasLasObras, ...newObras])

    if (newObras.length === 1) {
      setEditingObra(newObras[0])
      setShowMetadataForm(true)
    }
  }

  const handleUpdateMetadata = (obraId, field, value) => {
    setTodasLasObras(todasLasObras.map(obra =>
      obra.id === obraId ? { ...obra, [field]: value } : obra
    ))
    if (editingObra?.id === obraId) {
      setEditingObra({ ...editingObra, [field]: value })
    }
  }

  const handleDeleteObra = (obraId) => {
    const obra = todasLasObras.find(o => o.id === obraId)
    if (obra?.preview && obra.preview.startsWith('blob:')) {
      URL.revokeObjectURL(obra.preview)
    }
    setTodasLasObras(todasLasObras.filter(o => o.id !== obraId))
    setObrasEnCanvas(obrasEnCanvas.filter(o => o.id !== obraId))
    if (editingObra?.id === obraId) {
      setEditingObra(null)
      setShowMetadataForm(false)
    }
  }

  const handleAddToCanvas = (portfolioImage) => {
    if (!portfolioImage.titulo || !portfolioImage.alto_cm || !portfolioImage.ancho_cm) {
      alert('Por favor completa el título y las dimensiones de la obra')
      setEditingObra(portfolioImage)
      setShowMetadataForm(true)
      return
    }

    if (obrasEnCanvas.length >= paquete.obras_maximas) {
      alert(`El paquete ${paquete.nombre} permite máximo ${paquete.obras_maximas} obras`)
      return
    }

    // Escala para convertir cm a píxeles en el canvas
    const scaleFactor = 2

    const newObra = {
      id: portfolioImage.id,
      titulo: portfolioImage.titulo,
      preview: portfolioImage.preview,
      alto_cm: parseFloat(portfolioImage.alto_cm),
      ancho_cm: parseFloat(portfolioImage.ancho_cm),
      // Posición inicial en el centro del área libre
      x: FREE_AREA.x + (FREE_AREA.width / 2) - (parseFloat(portfolioImage.ancho_cm) * scaleFactor / 2),
      y: FREE_AREA.y + (FREE_AREA.height / 2) - (parseFloat(portfolioImage.alto_cm) * scaleFactor / 2),
      width: parseFloat(portfolioImage.ancho_cm) * scaleFactor,
      height: parseFloat(portfolioImage.alto_cm) * scaleFactor
    }

    setObrasEnCanvas([...obrasEnCanvas, newObra])
  }

  const handleRemoveFromCanvas = (obraId) => {
    setObrasEnCanvas(obrasEnCanvas.filter((o) => o.id !== obraId))
    if (selectedObraId === obraId) setSelectedObraId(null)
  }

  const handleDragEnd = (obraId, newX, newY) => {
    const obra = obrasEnCanvas.find((o) => o.id === obraId)
    if (!obra) return

    // Limitar la obra al área libre del mural
    const boundedX = Math.max(
      FREE_AREA.x,
      Math.min(newX, FREE_AREA.x + FREE_AREA.width - obra.width)
    )
    const boundedY = Math.max(
      FREE_AREA.y,
      Math.min(newY, FREE_AREA.y + FREE_AREA.height - obra.height)
    )

    setObrasEnCanvas(
      obrasEnCanvas.map((o) =>
        o.id === obraId ? { ...o, x: boundedX, y: boundedY } : o
      )
    )
  }

  const validateLayout = () => {
    const errors = []
    if (obrasEnCanvas.length === 0) {
      errors.push('Debes agregar al menos una obra al lienzo')
    }
    setValidationErrors(errors)
    return errors.length === 0
  }

  const exportAsImage = async () => {
    if (!stageRef.current) return null

    const dataURL = stageRef.current.toDataURL({ pixelRatio: 2 })
    const response = await fetch(dataURL)
    const blob = await response.blob()

    return blob
  }

  const generatePDF = () => {
    if (!stageRef.current) return

    const dataURL = stageRef.current.toDataURL()

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [CANVAS_WIDTH, CANVAS_HEIGHT]
    })

    pdf.addImage(dataURL, 'PNG', 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    pdf.save(`layout-${paquete.nombre.toLowerCase().replace(/ /g, '-')}.pdf`)
  }

  const handleSaveLayout = async () => {
    if (!validateLayout()) {
      alert('Por favor agrega al menos una obra al lienzo')
      return
    }

    setIsSaving(true)

    try {
      const imageBlob = await exportAsImage()
      const uploadResponse = await layoutsApi.uploadCanvas(imageBlob)

      const layoutData = {
        paquete_id: paquete.id,
        canvas_width: CANVAS_WIDTH,
        canvas_height: CANVAS_HEIGHT,
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

      onSave(layoutData, uploadResponse.data.url)
      alert('Layout guardado exitosamente')
    } catch (error) {
      console.error('Error al guardar layout:', error)
      alert('Error al guardar el layout.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveAndContinueLayout = async () => {
    if (!validateLayout()) {
      alert('Por favor agrega al menos una obra al lienzo')
      return
    }

    setIsSaving(true)

    try {
      console.log('Exportando canvas...')
      // Exportar canvas como imagen
      const imageBlob = await exportAsImage()
      console.log('Canvas exportado, blob size:', imageBlob.size)

      // Convertir blob a data URL para vista previa
      const reader = new FileReader()
      const imageDataURL = await new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result)
        reader.readAsDataURL(imageBlob)
      })
      console.log('Data URL generado')

      // Preparar datos del layout con las obras completas
      const layoutData = {
        paquete_id: paquete.id,
        paquete_nombre: paquete.nombre,
        metros_lineales: paquete.metros_lineales,
        canvas_width: CANVAS_WIDTH,
        canvas_height: CANVAS_HEIGHT,
        canvas_image_blob: imageBlob,
        canvas_image_url: imageDataURL, // Para vista previa inmediata
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

      // Guardar también las obras completas de todas las obras (no solo las del canvas)
      const obrasCompletas = todasLasObras.filter(obra =>
        layoutData.obras.some(obraCanvas => obraCanvas.id === obra.id)
      )

      console.log('Layout data preparado, obras:', obrasCompletas.length)

      if (onSaveAndContinue) {
        // Pasar el layout con la imagen y las obras
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
      // Siempre resetear el estado de guardando
      setIsSaving(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {/* Tus Obras - Horizontal arriba */}
      <div style={{
        background: '#F4EDE4',
        padding: '20px 24px',
        borderRadius: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#141210',
            margin: 0
          }}>
            Tus Obras ({todasLasObras.length})
          </h3>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {obrasEnCanvas.length > 0 && (
              <span style={{
                fontSize: '14px',
                color: '#6B6B6B',
                background: 'white',
                padding: '8px 16px',
                borderRadius: '12px'
              }}>
                En Lienzo: {obrasEnCanvas.length}/{paquete.obras_maximas}
              </span>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: '10px 20px',
                borderRadius: '12px',
                background: '#141210',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>+</span> Agregar obra
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleAddNewObra}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        {/* Lista horizontal de obras */}
        <div style={{
          display: 'flex',
          gap: '16px',
          overflowX: 'auto',
          paddingBottom: '8px'
        }}>
          {todasLasObras.map((img) => {
            const isInCanvas = obrasEnCanvas.some(o => o.id === img.id)
            const hasMetadata = img.titulo && img.alto_cm && img.ancho_cm

            return (
              <div
                key={img.id}
                style={{
                  minWidth: '200px',
                  background: 'white',
                  padding: '12px',
                  borderRadius: '16px',
                  position: 'relative'
                }}
              >
                <img
                  src={img.preview}
                  alt={img.titulo || 'Sin título'}
                  style={{
                    width: '200px',
                    height: '150px',
                    objectFit: 'cover',
                    borderRadius: '12px',
                    marginBottom: '8px'
                  }}
                />

                {!hasMetadata && (
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: '#EAB308',
                    color: 'white',
                    fontSize: '10px',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontWeight: '600'
                  }}>
                    Sin metadata
                  </div>
                )}

                {isInCanvas && (
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    background: '#10B981',
                    color: 'white',
                    fontSize: '10px',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontWeight: '600'
                  }}>
                    En lienzo
                  </div>
                )}

                <p style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#141210',
                  marginBottom: '4px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {img.titulo || 'Sin título'}
                </p>
                <p style={{
                  fontSize: '11px',
                  color: '#6B6B6B',
                  marginBottom: '8px'
                }}>
                  {img.alto_cm && img.ancho_cm ? `${img.alto_cm} x ${img.ancho_cm} cm` : 'Sin dimensiones'}
                </p>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingObra(img)
                      setShowMetadataForm(true)
                    }}
                    style={{
                      flex: 1,
                      fontSize: '11px',
                      padding: '6px 12px',
                      background: '#E8DED1',
                      color: '#141210',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    Editar
                  </button>
                  {!isInCanvas && hasMetadata && (
                    <button
                      type="button"
                      onClick={() => handleAddToCanvas(img)}
                      style={{
                        flex: 1,
                        fontSize: '11px',
                        padding: '6px 12px',
                        background: '#141210',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      + Lienzo
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteObra(img.id)}
                    style={{
                      fontSize: '16px',
                      padding: '6px 12px',
                      background: '#B83030',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '700',
                      lineHeight: 1
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>
            )
          })}

          {todasLasObras.length === 0 && (
            <div style={{
              flex: 1,
              textAlign: 'center',
              padding: '40px',
              background: 'white',
              borderRadius: '16px',
              border: '2px dashed #E8DED1'
            }}>
              <p style={{ fontSize: '14px', color: '#6B6B6B', marginBottom: '12px' }}>
                No has agregado obras. Haz clic en "+ Agregar obra" para comenzar
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Canvas del Mural - Sin card, directo */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        alignItems: 'center',
        width: '100%'
      }}>
        {/* Botones de acción arriba del canvas */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={generatePDF}
            disabled={obrasEnCanvas.length === 0}
            style={{
              padding: '12px 24px',
              background: obrasEnCanvas.length === 0 ? '#E8DED1' : '#F4EDE4',
              color: '#141210',
              border: 'none',
              borderRadius: '16px',
              cursor: obrasEnCanvas.length === 0 ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              opacity: obrasEnCanvas.length === 0 ? 0.5 : 1
            }}
          >
            Exportar PDF
          </button>
          <button
            type="button"
            onClick={handleSaveAndContinueLayout}
            disabled={isSaving || obrasEnCanvas.length === 0}
            style={{
              padding: '14px 40px',
              background: obrasEnCanvas.length === 0 ? '#6B6B6B' : '#141210',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              cursor: obrasEnCanvas.length === 0 || isSaving ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '700',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              opacity: obrasEnCanvas.length === 0 ? 0.5 : 1
            }}
          >
            {isSaving ? 'Guardando...' : 'Guardar y Continuar Registro'}
          </button>
        </div>

        {/* Canvas sin wrapper card */}
        <div style={{
          width: '100%',
          maxWidth: `${CANVAS_WIDTH}px`,
          overflow: 'auto',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <Stage ref={stageRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT}>
            <Layer>
              <MuralBackground
                plantillaURL={PLANTILLA_URL}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
              />
              {obrasEnCanvas.map((obra) => (
                <ObraImage
                  key={obra.id}
                  obra={obra}
                  onDragEnd={handleDragEnd}
                  isSelected={selectedObraId === obra.id}
                  onSelect={setSelectedObraId}
                  onDelete={handleRemoveFromCanvas}
                />
              ))}
            </Layer>
          </Stage>
        </div>

        {validationErrors.length > 0 && (
          <div style={{
            background: '#FEE2E2',
            padding: '12px 20px',
            borderRadius: '16px',
            maxWidth: '600px'
          }}>
            <p style={{
              fontSize: '13px',
              fontWeight: '600',
              color: '#DC2626',
              margin: '0 0 8px 0'
            }}>
              Errores:
            </p>
            <ul style={{
              listStyle: 'disc',
              paddingLeft: '20px',
              margin: 0,
              fontSize: '13px',
              color: '#DC2626'
            }}>
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Error de validación del formulario principal */}
        {(errors?.layout || errors?.paquete_id) && (
          <div style={{
            background: '#FEE2E2',
            padding: '12px 20px',
            borderRadius: '16px',
            maxWidth: '600px',
            marginTop: '16px'
          }}>
            <p style={{
              fontSize: '13px',
              fontWeight: '600',
              color: '#DC2626',
              margin: 0
            }}>
              {errors.layout || errors.paquete_id}
            </p>
          </div>
        )}
      </div>

      {/* Instrucciones */}
      <div style={{
        background: '#DBEAFE',
        padding: '20px 32px',
        borderRadius: '24px',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <p style={{
          fontSize: '14px',
          fontWeight: '600',
          color: '#1E40AF',
          marginBottom: '12px'
        }}>
          Instrucciones:
        </p>
        <ul style={{
          listStyle: 'disc',
          paddingLeft: '20px',
          margin: 0,
          fontSize: '13px',
          color: '#1E3A8A',
          lineHeight: '1.7'
        }}>
          <li>Agrega obras con el botón "+ Agregar obra" y completa su metadata (título y dimensiones)</li>
          <li>Haz clic en "+ Lienzo" para agregar la obra al mural</li>
          <li>Arrastra las obras dentro del área libre (rectángulo central) para posicionarlas</li>
          <li>Las áreas rayadas (arriba y abajo) son zonas de consideración del comité curatorial</li>
          <li>Haz clic en una obra para seleccionarla y poder eliminarla con el botón rojo</li>
          <li>Guarda el layout antes de continuar al siguiente paso</li>
        </ul>
      </div>

      {/* Modal de metadata */}
      {showMetadataForm && editingObra && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '500px',
            width: '100%'
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#141210',
              marginBottom: '24px'
            }}>
              Metadata de la obra
            </h3>

            <div style={{ marginBottom: '24px' }}>
              <img
                src={editingObra.preview}
                alt="Preview"
                style={{
                  width: '100%',
                  height: '200px',
                  objectFit: 'cover',
                  borderRadius: '16px'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#141210',
                  marginBottom: '8px'
                }}>
                  Título *
                </label>
                <input
                  type="text"
                  value={editingObra.titulo}
                  onChange={(e) => handleUpdateMetadata(editingObra.id, 'titulo', e.target.value)}
                  placeholder="Título de la obra"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: '#F4EDE4',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#141210',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#141210',
                    marginBottom: '8px'
                  }}>
                    Alto (cm) *
                  </label>
                  <input
                    type="number"
                    value={editingObra.alto_cm}
                    onChange={(e) => handleUpdateMetadata(editingObra.id, 'alto_cm', e.target.value)}
                    placeholder="Alto"
                    min="1"
                    step="0.1"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: '#F4EDE4',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#141210',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#141210',
                    marginBottom: '8px'
                  }}>
                    Ancho (cm) *
                  </label>
                  <input
                    type="number"
                    value={editingObra.ancho_cm}
                    onChange={(e) => handleUpdateMetadata(editingObra.id, 'ancho_cm', e.target.value)}
                    placeholder="Ancho"
                    min="1"
                    step="0.1"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: '#F4EDE4',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#141210',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
              <button
                type="button"
                onClick={() => {
                  setShowMetadataForm(false)
                  setEditingObra(null)
                }}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  background: '#E8DED1',
                  color: '#141210',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (editingObra.titulo && editingObra.alto_cm && editingObra.ancho_cm) {
                    setShowMetadataForm(false)
                    setEditingObra(null)
                  } else {
                    alert('Por favor completa todos los campos')
                  }
                }}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  background: '#141210',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
