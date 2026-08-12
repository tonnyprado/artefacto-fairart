'use client'

import { useState, useRef, useEffect } from 'react'
import { Stage, Layer, Image as KonvaImage, Rect, Text, Group, Line } from 'react-konva'
import useImage from 'use-image'
import jsPDF from 'jspdf'
import { layoutsApi } from '@/lib/api'
import { compressImage } from '@/lib/imageCompression'

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

// Factor de conversión: metros a píxeles en el canvas
// Asumimos que el FREE_AREA completo representa aproximadamente 10m lineales × 2.4m altura
// Esto nos da un factor de escala para convertir las medidas reales del paquete a píxeles
const METROS_A_PIXELES = FREE_AREA.width / 10 // Aproximadamente 155 px por metro

// Configuración de reglas
const RULER_SIZE = 30 // Tamaño de las reglas en píxeles
const RULER_BG_COLOR = '#2C2C2C' // Color de fondo de las reglas
const RULER_TEXT_COLOR = '#E8E8E8' // Color del texto
const RULER_LINE_COLOR = '#E8E8E8' // Color de las líneas
const GUIDE_LINE_COLOR = '#00BFFF' // Color cian para las líneas guía

// Configuración de colisiones
const SCALE_FACTOR = 2 // Factor de escala para convertir cm a píxeles
const COLLISION_MARGIN_CM = 2.5 // Separación mínima entre obras en cm
const COLLISION_MARGIN = COLLISION_MARGIN_CM * SCALE_FACTOR // Separación en píxeles

/**
 * Componente de regla horizontal
 */
function HorizontalRuler({ width }) {
  const marks = []
  const step = 50 // Marca cada 50 píxeles
  const largeStep = 100 // Marcas grandes cada 100 píxeles

  for (let i = 0; i <= width; i += step) {
    const isLarge = i % largeStep === 0
    marks.push(
      <Line
        key={`hline-${i}`}
        points={[i, RULER_SIZE, i, isLarge ? RULER_SIZE - 10 : RULER_SIZE - 5]}
        stroke={RULER_LINE_COLOR}
        strokeWidth={1}
      />
    )
    if (isLarge) {
      marks.push(
        <Text
          key={`htext-${i}`}
          x={i - 15}
          y={5}
          text={i.toString()}
          fontSize={10}
          fill={RULER_TEXT_COLOR}
          width={30}
          align="center"
        />
      )
    }
  }

  return (
    <Group>
      <Rect
        x={0}
        y={0}
        width={width}
        height={RULER_SIZE}
        fill={RULER_BG_COLOR}
      />
      {marks}
    </Group>
  )
}

/**
 * Componente de regla vertical
 */
function VerticalRuler({ height }) {
  const marks = []
  const step = 50 // Marca cada 50 píxeles
  const largeStep = 100 // Marcas grandes cada 100 píxeles

  for (let i = 0; i <= height; i += step) {
    const isLarge = i % largeStep === 0
    marks.push(
      <Line
        key={`vline-${i}`}
        points={[RULER_SIZE, i, isLarge ? RULER_SIZE - 10 : RULER_SIZE - 5, i]}
        stroke={RULER_LINE_COLOR}
        strokeWidth={1}
      />
    )
    if (isLarge && i > 0) {
      marks.push(
        <Text
          key={`vtext-${i}`}
          x={3}
          y={i - 6}
          text={i.toString()}
          fontSize={10}
          fill={RULER_TEXT_COLOR}
        />
      )
    }
  }

  return (
    <Group>
      <Rect
        x={0}
        y={0}
        width={RULER_SIZE}
        height={height}
        fill={RULER_BG_COLOR}
      />
      {marks}
    </Group>
  )
}

/**
 * Componente de líneas guía que se muestran durante el arrastre
 */
function GuideLines({ x, y, width, height, canvasWidth, canvasHeight }) {
  if (x === null || y === null) return null

  return (
    <Group>
      {/* Línea vertical en X */}
      <Line
        points={[x, 0, x, canvasHeight]}
        stroke={GUIDE_LINE_COLOR}
        strokeWidth={1}
        dash={[5, 5]}
        opacity={0.8}
      />
      {/* Línea vertical en X + width (borde derecho) */}
      <Line
        points={[x + width, 0, x + width, canvasHeight]}
        stroke={GUIDE_LINE_COLOR}
        strokeWidth={1}
        dash={[5, 5]}
        opacity={0.8}
      />
      {/* Línea horizontal en Y */}
      <Line
        points={[0, y, canvasWidth, y]}
        stroke={GUIDE_LINE_COLOR}
        strokeWidth={1}
        dash={[5, 5]}
        opacity={0.8}
      />
      {/* Línea horizontal en Y + height (borde inferior) */}
      <Line
        points={[0, y + height, canvasWidth, y + height]}
        stroke={GUIDE_LINE_COLOR}
        strokeWidth={1}
        dash={[5, 5]}
        opacity={0.8}
      />
      {/* Etiqueta de posición X */}
      <Group>
        <Rect
          x={x + 5}
          y={5}
          width={60}
          height={20}
          fill={GUIDE_LINE_COLOR}
          cornerRadius={4}
        />
        <Text
          x={x + 5}
          y={9}
          text={`X: ${Math.round(x)}`}
          fontSize={12}
          fill="#000"
          width={60}
          align="center"
          fontStyle="bold"
        />
      </Group>
      {/* Etiqueta de posición Y */}
      <Group>
        <Rect
          x={5}
          y={y + 5}
          width={60}
          height={20}
          fill={GUIDE_LINE_COLOR}
          cornerRadius={4}
        />
        <Text
          x={5}
          y={y + 9}
          text={`Y: ${Math.round(y)}`}
          fontSize={12}
          fill="#000"
          width={60}
          align="center"
          fontStyle="bold"
        />
      </Group>
    </Group>
  )
}

/**
 * Verifica si dos obras colisionan considerando el margen de separación
 */
function checkCollision(obra1, obra2, margin = COLLISION_MARGIN) {
  return (
    obra1.x - margin < obra2.x + obra2.width &&
    obra1.x + obra1.width + margin > obra2.x &&
    obra1.y - margin < obra2.y + obra2.height &&
    obra1.y + obra1.height + margin > obra2.y
  )
}

/**
 * Componente de obra individual con cursor y botón de eliminar
 */
function ObraImage({ obra, onDragEnd, onDragMove, isSelected, onSelect, onDelete, otrasObras, tipoPaquete, areaDelimitada }) {
  const [image, status] = useImage(obra.preview, 'anonymous')
  const stageRef = useRef()
  const [lastValidPos, setLastValidPos] = useState({ x: obra.x, y: obra.y })
  const [isColliding, setIsColliding] = useState(false)

  // Para paquetes 3D, mostramos cuadrados (la "base" de la escultura)
  const esPaquete3D = tipoPaquete === '3D'

  // Usar área delimitada o FREE_AREA por defecto
  const areaRestriccion = areaDelimitada || FREE_AREA

  // Actualizar última posición válida cuando cambia la obra
  useEffect(() => {
    setLastValidPos({ x: obra.x, y: obra.y })
  }, [obra.x, obra.y])

  // Función para limitar el movimiento y evitar colisiones
  const dragBoundFunc = (pos) => {
    // Verificar colisiones con otras obras
    const testObra = {
      ...obra,
      x: pos.x,
      y: pos.y
    }

    // Verificar si colisiona con alguna otra obra
    let hasCollision = false
    for (const otraObra of otrasObras) {
      if (otraObra.id !== obra.id && checkCollision(testObra, otraObra)) {
        hasCollision = true
        break
      }
    }

    if (hasCollision) {
      // Si hay colisión, indicar visualmente y retornar la última posición válida
      setIsColliding(true)
      return lastValidPos
    }

    // Limitar al área delimitada del paquete (no al FREE_AREA completo)
    const boundedX = Math.max(
      areaRestriccion.x,
      Math.min(pos.x, areaRestriccion.x + areaRestriccion.width - obra.width)
    )
    const boundedY = Math.max(
      areaRestriccion.y,
      Math.min(pos.y, areaRestriccion.y + areaRestriccion.height - obra.height)
    )

    const newPos = { x: boundedX, y: boundedY }

    // Guardar como última posición válida y limpiar estado de colisión
    setLastValidPos(newPos)
    setIsColliding(false)

    return newPos
  }

  // Si es paquete 3D, renderizar cuadrado de base (no mostrar imagen)
  if (esPaquete3D) {
    return (
      <Group>
        <Rect
          id={obra.id}
          x={obra.x}
          y={obra.y}
          width={obra.width}
          height={obra.height}
          fill="#D4C4B0"
          stroke={isColliding ? '#FF4444' : isSelected ? '#141210' : '#8B7355'}
          strokeWidth={isColliding ? 3 : isSelected ? 4 : 2}
          cornerRadius={4}
          draggable
          dragBoundFunc={dragBoundFunc}
          onDragStart={() => {
            setIsColliding(false)
            onDragMove && onDragMove(obra.id, obra.x, obra.y, obra.width, obra.height)
          }}
          onDragMove={(e) => onDragMove && onDragMove(obra.id, e.target.x(), e.target.y(), obra.width, obra.height)}
          onDragEnd={(e) => {
            setIsColliding(false)
            onDragMove && onDragMove(null, null, null, null, null)
            onDragEnd(obra.id, e.target.x(), e.target.y())
          }}
          onClick={() => onSelect(obra.id)}
          onTap={() => onSelect(obra.id)}
          shadowBlur={isSelected ? 10 : 5}
          shadowColor="black"
          shadowOpacity={0.4}
        />

        {/* Texto centrado indicando que es una base */}
        <Text
          x={obra.x}
          y={obra.y + obra.height / 2 - 20}
          text={obra.titulo || 'Base Escultura'}
          fontSize={14}
          fontStyle="bold"
          fill="#141210"
          width={obra.width}
          align="center"
          listening={false}
        />
        <Text
          x={obra.x}
          y={obra.y + obra.height / 2}
          text={`${obra.ancho_cm} × ${obra.alto_cm} cm`}
          fontSize={11}
          fill="#6B6B6B"
          width={obra.width}
          align="center"
          listening={false}
        />
        <Text
          x={obra.x}
          y={obra.y + obra.height / 2 + 16}
          text="(Base 3D)"
          fontSize={10}
          fontStyle="italic"
          fill="#8B7355"
          width={obra.width}
          align="center"
          listening={false}
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
            />
          </Group>
        )}
      </Group>
    )
  }

  // Para paquetes 2D, mostrar la imagen como antes
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
        dragBoundFunc={dragBoundFunc}
        onDragStart={() => {
          setIsColliding(false)
          onDragMove && onDragMove(obra.id, obra.x, obra.y, obra.width, obra.height)
        }}
        onDragMove={(e) => onDragMove && onDragMove(obra.id, e.target.x(), e.target.y(), obra.width, obra.height)}
        onDragEnd={(e) => {
          setIsColliding(false) // Limpiar estado de colisión
          onDragMove && onDragMove(null, null, null, null, null) // Limpiar guías
          onDragEnd(obra.id, e.target.x(), e.target.y())
        }}
        onClick={() => onSelect(obra.id)}
        onTap={() => onSelect(obra.id)}
        shadowBlur={isSelected ? 15 : 8}
        shadowColor="black"
        shadowOpacity={0.7}
        stroke={isColliding ? '#FF4444' : isSelected ? '#ffffff' : 'transparent'}
        strokeWidth={isColliding ? 3 : isSelected ? 4 : 0}
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

  return <KonvaImage image={image} x={0} y={0} width={width} height={height} listening={false} />
}

/**
 * Calcular área delimitada basada en el paquete
 */
function calcularAreaDelimitada(paquete) {
  if (!paquete) return FREE_AREA

  let delimiterWidth, delimiterHeight

  if (paquete.tipo === '3D') {
    // Para paquetes 3D: usar metros_cuadrados
    const metrosCuadrados = paquete.metros_cuadrados || 1
    const lado = Math.sqrt(metrosCuadrados)
    delimiterWidth = lado * METROS_A_PIXELES
    delimiterHeight = lado * METROS_A_PIXELES
  } else {
    // Para paquetes 2D: usar metros_lineales × altura_pared
    delimiterWidth = (paquete.metros_lineales || 3) * METROS_A_PIXELES
    delimiterHeight = (paquete.altura_pared || 2.4) * (FREE_AREA.height / 2.4)
  }

  // Centrar el delimitador en el área libre
  const delimiterX = FREE_AREA.x + (FREE_AREA.width - delimiterWidth) / 2
  const delimiterY = FREE_AREA.y + (FREE_AREA.height - delimiterHeight) / 2

  return {
    x: delimiterX,
    y: delimiterY,
    width: delimiterWidth,
    height: delimiterHeight
  }
}

/**
 * Componente de líneas delimitadoras basadas en las medidas del paquete
 */
function PaqueteDelimiter({ paquete }) {
  if (!paquete) return null

  const areaDelimitada = calcularAreaDelimitada(paquete)
  const { x: delimiterX, y: delimiterY, width: delimiterWidth, height: delimiterHeight } = areaDelimitada

  return (
    <Group>
      {/* Rectángulo delimitador con borde punteado */}
      <Rect
        x={delimiterX}
        y={delimiterY}
        width={delimiterWidth}
        height={delimiterHeight}
        stroke="#FF6B6B"
        strokeWidth={3}
        dash={[15, 10]}
        listening={false}
      />

      {/* Etiqueta con las medidas */}
      <Group>
        <Rect
          x={delimiterX + 10}
          y={delimiterY - 35}
          width={paquete.tipo === '3D' ? 180 : 200}
          height={28}
          fill="rgba(255, 107, 107, 0.95)"
          cornerRadius={6}
          listening={false}
        />
        <Text
          x={delimiterX + 10}
          y={delimiterY - 35}
          width={paquete.tipo === '3D' ? 180 : 200}
          height={28}
          text={paquete.tipo === '3D'
            ? `Área: ${paquete.metros_cuadrados}m² (base)`
            : `Área: ${paquete.metros_lineales}m × ${paquete.altura_pared}m`}
          fontSize={13}
          fontStyle="bold"
          fill="white"
          align="center"
          verticalAlign="middle"
          listening={false}
        />
      </Group>

      {/* Etiquetas de esquinas para referencia */}
      <Text
        x={delimiterX - 30}
        y={delimiterY - 5}
        text="┌"
        fontSize={24}
        fill="#FF6B6B"
        listening={false}
      />
      <Text
        x={delimiterX + delimiterWidth + 5}
        y={delimiterY - 5}
        text="┐"
        fontSize={24}
        fill="#FF6B6B"
        listening={false}
      />
      <Text
        x={delimiterX - 30}
        y={delimiterY + delimiterHeight - 20}
        text="└"
        fontSize={24}
        fill="#FF6B6B"
        listening={false}
      />
      <Text
        x={delimiterX + delimiterWidth + 5}
        y={delimiterY + delimiterHeight - 20}
        text="┘"
        fontSize={24}
        fill="#FF6B6B"
        listening={false}
      />
    </Group>
  )
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
  // Estado para las líneas guía durante el arrastre
  const [dragGuide, setDragGuide] = useState({ x: null, y: null, width: null, height: null })

  const obrasDisponibles = todasLasObras.filter(
    (img) => !obrasEnCanvas.some((o) => o.id === img.id)
  )

  // Calcular área delimitada del paquete para restringir el movimiento de las obras
  const areaDelimitada = calcularAreaDelimitada(paquete)

  useEffect(() => {
    setTodasLasObras(portfolioImages)
  }, [portfolioImages])

  // Validar que el paquete existe (después de todos los hooks)
  if (!paquete) {
    return (
      <div style={{
        background: '#F4EDE4',
        padding: '40px',
        borderRadius: '16px',
        textAlign: 'center'
      }}>
        <p style={{ fontSize: '16px', color: '#6B6B6B' }}>
          Cargando información del paquete...
        </p>
      </div>
    )
  }

  const handleAddNewObra = async (e) => {
    const files = Array.from(e.target.files)
    const MAX_SIZE = 5 * 1024 * 1024

    // Filtrar archivos válidos
    const validFiles = []
    for (const file of files) {
      if (file.size > MAX_SIZE) {
        alert(`${file.name} excede el límite de 5MB`)
        continue
      }
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} no es una imagen válida`)
        continue
      }
      validFiles.push(file)
    }

    if (validFiles.length === 0) return

    // Comprimir imágenes automáticamente
    const compressedObras = []
    for (const file of validFiles) {
      try {
        console.log(`Comprimiendo obra: ${file.name}...`)
        const compressedFile = await compressImage(file, {
          maxWidth: 1920,
          maxHeight: 1920,
          quality: 0.85,
          maxSizeKB: 400 // Máximo 400KB por obra
        })

        compressedObras.push({
          id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          file: compressedFile,
          preview: URL.createObjectURL(compressedFile),
          titulo: '',
          alto_cm: '',
          ancho_cm: '',
          tecnica: '',
          anio: '',
          precio_mxn: '',
          notas_montaje: ''
        })
      } catch (error) {
        console.error(`Error al comprimir ${file.name}:`, error)
        alert(`Error al procesar ${file.name}. Por favor, intenta con otra imagen.`)
      }
    }

    if (compressedObras.length === 0) return

    setTodasLasObras([...todasLasObras, ...compressedObras])

    if (compressedObras.length === 1) {
      setEditingObra(compressedObras[0])
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
    if (!portfolioImage.titulo || !portfolioImage.alto_cm || !portfolioImage.ancho_cm || !portfolioImage.tecnica || !portfolioImage.anio || !portfolioImage.precio_mxn) {
      alert('Por favor completa todos los campos requeridos: título, dimensiones, técnica, año y precio')
      setEditingObra(portfolioImage)
      setShowMetadataForm(true)
      return
    }

    if (obrasEnCanvas.length >= paquete.obras_maximas) {
      alert(`El paquete ${paquete.nombre} permite máximo ${paquete.obras_maximas} obras`)
      return
    }

    const newObra = {
      id: portfolioImage.id,
      titulo: portfolioImage.titulo,
      preview: portfolioImage.preview,
      alto_cm: parseFloat(portfolioImage.alto_cm),
      ancho_cm: parseFloat(portfolioImage.ancho_cm),
      tecnica: portfolioImage.tecnica,
      anio: parseInt(portfolioImage.anio),
      precio_mxn: parseFloat(portfolioImage.precio_mxn),
      notas_montaje: portfolioImage.notas_montaje || '',
      // Posición inicial en el centro del área delimitada del paquete
      x: areaDelimitada.x + (areaDelimitada.width / 2) - (parseFloat(portfolioImage.ancho_cm) * SCALE_FACTOR / 2),
      y: areaDelimitada.y + (areaDelimitada.height / 2) - (parseFloat(portfolioImage.alto_cm) * SCALE_FACTOR / 2),
      width: parseFloat(portfolioImage.ancho_cm) * SCALE_FACTOR,
      height: parseFloat(portfolioImage.alto_cm) * SCALE_FACTOR
    }

    // Verificar si la nueva obra colisiona con obras existentes
    let hasCollision = false
    for (const obraExistente of obrasEnCanvas) {
      if (checkCollision(newObra, obraExistente)) {
        hasCollision = true
        break
      }
    }

    if (hasCollision) {
      alert('No hay espacio disponible en el centro del lienzo. Por favor, mueve las obras existentes para hacer espacio.')
      return
    }

    setObrasEnCanvas([...obrasEnCanvas, newObra])
  }

  const handleRemoveFromCanvas = (obraId) => {
    setObrasEnCanvas(obrasEnCanvas.filter((o) => o.id !== obraId))
    if (selectedObraId === obraId) setSelectedObraId(null)
  }

  const handleDragMove = (obraId, x, y, width, height) => {
    if (obraId === null) {
      // Limpiar guías cuando termina el drag
      setDragGuide({ x: null, y: null, width: null, height: null })
    } else {
      // Actualizar guías durante el drag
      setDragGuide({ x, y, width, height })
    }
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

    // Exportar solo el área del canvas sin las reglas
    // Usar JPEG con compresión agresiva para reducir tamaño del archivo (evitar error 413)
    const dataURL = stageRef.current.toDataURL({
      x: RULER_SIZE,
      y: RULER_SIZE,
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      pixelRatio: 0.5, // Reducido a 0.5 para menor tamaño (resolución más baja)
      mimeType: 'image/jpeg',
      quality: 0.6 // Compresión JPEG al 60% (más agresiva)
    })
    const response = await fetch(dataURL)
    const blob = await response.blob()

    console.log('Canvas exportado - Tamaño ultra-optimizado:', Math.round(blob.size / 1024), 'KB')
    return blob
  }

  const generatePDF = () => {
    if (!stageRef.current) return

    // Exportar solo el área del canvas sin las reglas
    const dataURL = stageRef.current.toDataURL({
      x: RULER_SIZE,
      y: RULER_SIZE,
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      pixelRatio: 1
    })

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
            const hasMetadata = img.titulo && img.alto_cm && img.ancho_cm && img.tecnica && img.anio && img.precio_mxn

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
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: 'rgba(244, 237, 228, 0.5)',
                    border: '1px solid #E8DED1'
                  }} />
                )}

                {isInCanvas && (
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#141210'
                  }} />
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
                  marginBottom: '4px'
                }}>
                  {img.alto_cm && img.ancho_cm ? `${img.alto_cm} x ${img.ancho_cm} cm` : 'Sin dimensiones'}
                </p>
                {img.precio_mxn && (
                  <p style={{
                    fontSize: '12px',
                    color: '#B83030',
                    fontWeight: '700',
                    marginBottom: '8px'
                  }}>
                    ${parseFloat(img.precio_mxn).toLocaleString('es-MX')} MXN
                  </p>
                )}
                {!img.precio_mxn && (
                  <p style={{
                    fontSize: '11px',
                    color: '#EAB308',
                    marginBottom: '8px'
                  }}>
                    Sin precio
                  </p>
                )}

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
          maxWidth: `${CANVAS_WIDTH + RULER_SIZE}px`,
          overflow: 'auto',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <Stage ref={stageRef} width={CANVAS_WIDTH + RULER_SIZE} height={CANVAS_HEIGHT + RULER_SIZE}>
            {/* Layer de reglas */}
            <Layer>
              {/* Esquina superior izquierda (vacía) */}
              <Rect
                x={0}
                y={0}
                width={RULER_SIZE}
                height={RULER_SIZE}
                fill={RULER_BG_COLOR}
              />
              {/* Regla horizontal */}
              <Group x={RULER_SIZE} y={0}>
                <HorizontalRuler width={CANVAS_WIDTH} />
              </Group>
              {/* Regla vertical */}
              <Group x={0} y={RULER_SIZE}>
                <VerticalRuler height={CANVAS_HEIGHT} />
              </Group>
            </Layer>

            {/* Layer del canvas y obras */}
            <Layer x={RULER_SIZE} y={RULER_SIZE}>
              <MuralBackground
                plantillaURL={PLANTILLA_URL}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
              />

              {/* Delimitador del paquete */}
              <PaqueteDelimiter paquete={paquete} />

              {obrasEnCanvas.map((obra) => (
                <ObraImage
                  key={obra.id}
                  obra={obra}
                  onDragEnd={handleDragEnd}
                  onDragMove={handleDragMove}
                  isSelected={selectedObraId === obra.id}
                  onSelect={setSelectedObraId}
                  onDelete={handleRemoveFromCanvas}
                  otrasObras={obrasEnCanvas.filter(o => o.id !== obra.id)}
                  tipoPaquete={paquete?.tipo}
                  areaDelimitada={areaDelimitada}
                />
              ))}
              {/* Líneas guía durante el arrastre */}
              <GuideLines
                x={dragGuide.x}
                y={dragGuide.y}
                width={dragGuide.width}
                height={dragGuide.height}
                canvasWidth={CANVAS_WIDTH}
                canvasHeight={CANVAS_HEIGHT}
              />
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
        maxWidth: '700px',
        margin: '0 auto',
        background: '#F4EDE4',
        borderRadius: '16px',
        padding: '16px 24px',
        display: 'flex',
        gap: '16px',
        alignItems: 'flex-start'
      }}>
        <svg
          style={{ width: '24px', height: '24px', flexShrink: 0, marginTop: '2px' }}
          fill="none"
          stroke="#6B6B6B"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10" strokeWidth="2" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16v-4M12 8h.01" />
        </svg>
        <p style={{
          fontSize: '13px',
          color: '#6B6B6B',
          lineHeight: '1.8',
          margin: 0,
          flex: 1
        }}>
          Agrega obras con el botón "+ Agregar obra" y completa su metadata (título, dimensiones y precio). Haz clic en "+ Lienzo" para agregar la obra al mural. Arrastra las obras dentro del área delimitada (rectángulo con bordes punteados rojos) que representa el espacio disponible según tu paquete seleccionado{paquete?.tipo === '3D' ? '. Para paquetes 3D, las obras se muestran como cuadrados de base donde colocarás tu escultura' : ''}. Haz clic en una obra para seleccionarla y poder eliminarla con el botón rojo. Guarda el layout antes de continuar al siguiente paso.
        </p>
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

              {/* Campo de Técnica */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#141210',
                  marginBottom: '8px'
                }}>
                  Técnica *
                </label>
                <input
                  type="text"
                  value={editingObra.tecnica || ''}
                  onChange={(e) => handleUpdateMetadata(editingObra.id, 'tecnica', e.target.value)}
                  placeholder="Ej: Óleo sobre lienzo, Acrílico, Acuarela, Técnica mixta..."
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

              {/* Campo de Año */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#141210',
                  marginBottom: '8px'
                }}>
                  Año de creación *
                </label>
                <input
                  type="number"
                  value={editingObra.anio || ''}
                  onChange={(e) => handleUpdateMetadata(editingObra.id, 'anio', e.target.value)}
                  placeholder="Ej: 2024"
                  min="1900"
                  max={new Date().getFullYear()}
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

              {/* Campo de Precio */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#141210',
                  marginBottom: '8px'
                }}>
                  Precio de venta (MXN) *
                </label>
                <input
                  type="number"
                  value={editingObra.precio_mxn || ''}
                  onChange={(e) => handleUpdateMetadata(editingObra.id, 'precio_mxn', e.target.value)}
                  placeholder="10000"
                  min="1"
                  step="1"
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
                <div style={{
                  background: '#FEF3C7',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  marginTop: '8px',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start'
                }}>
                  <svg
                    style={{ width: '20px', height: '20px', flexShrink: 0, marginTop: '1px' }}
                    fill="none"
                    stroke="#78350F"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="10" strokeWidth="2" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16v-4M12 8h.01" />
                  </svg>
                  <p style={{
                    fontSize: '12px',
                    color: '#78350F',
                    lineHeight: '1.5',
                    margin: 0,
                    flex: 1
                  }}>
                    El precio debe incluir ya calculada la comisión del 30% de ARTE FACTO + IVA 16%. Este es el precio final de venta al público.
                  </p>
                </div>
              </div>

              {/* Campo de Notas de Montaje (Opcional) */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#141210',
                  marginBottom: '8px'
                }}>
                  Notas de montaje
                  <span style={{ fontSize: '12px', color: '#6B6B6B', fontWeight: '400', marginLeft: '8px' }}>
                    (Opcional)
                  </span>
                </label>
                <textarea
                  value={editingObra.notas_montaje || ''}
                  onChange={(e) => handleUpdateMetadata(editingObra.id, 'notas_montaje', e.target.value)}
                  placeholder="Ej: Requiere base de madera de 50x50cm, Obra con sistema de iluminación LED integrado..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: '#F4EDE4',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#141210',
                    fontSize: '14px',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'acumin-pro, sans-serif'
                  }}
                />
                <div style={{
                  background: '#FEF3C7',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  marginTop: '8px',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start'
                }}>
                  <svg
                    style={{ width: '20px', height: '20px', flexShrink: 0, marginTop: '1px' }}
                    fill="none"
                    stroke="#78350F"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p style={{
                    fontSize: '12px',
                    color: '#78350F',
                    lineHeight: '1.5',
                    margin: 0,
                    flex: 1
                  }}>
                    Si la obra requiere especificaciones técnicas de montaje, bases, o instalación especial, descríbelas aquí.
                  </p>
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
                  if (editingObra.titulo && editingObra.alto_cm && editingObra.ancho_cm && editingObra.tecnica && editingObra.anio && editingObra.precio_mxn) {
                    setShowMetadataForm(false)
                    setEditingObra(null)
                  } else {
                    alert('Por favor completa todos los campos obligatorios (título, dimensiones, técnica, año y precio)')
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
