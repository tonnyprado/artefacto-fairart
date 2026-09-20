'use client'

import { useState, useEffect, useRef, useLayoutEffect, forwardRef } from 'react'
import { createPortal } from 'react-dom'
import dynamic from 'next/dynamic'
import { usePaquetesStore } from '@/stores/paquetesStore'
import { ChevronDown, ChevronUp, Check, Plus, Edit2, Trash2, GripVertical, AlertCircle, Palette, Box, Download, ArrowRight, X, MousePointer2, Move, Save, FileText, ExternalLink, Info, Loader2, Layers, Frame, Boxes } from 'lucide-react'
import gsap from 'gsap'
import { compressImage } from '@/lib/imageCompression'
import CompressingOverlay from '@/components/ui/CompressingOverlay'

const LayoutCanvas = dynamic(() => import('./LayoutCanvasWithMural'), {
  ssr: false,
  loading: () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '600px' }}>
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
    </div>
  )
})

const COLORS = {
  red: '#B83030',
  black: '#141210',
  cream: '#F4EDE4',
  creamDark: '#E8DED1',
  gray: '#6B6B6B',
}

const FONTS = {
  display: 'ivypresto-display, Georgia, serif',
  body: 'acumin-pro, sans-serif',
}

// Formatos de trabajo organizados por tipo
const FORMATOS_2D = [
  { value: 'pintura', label: 'Pintura (técnicas húmedas)' },
  { value: 'dibujo', label: 'Dibujo (técnicas secas)' },
  { value: 'grafica', label: 'Gráfica' },
  { value: 'fotografia', label: 'Fotografía' },
  { value: 'collage_mixta', label: 'Collage & Mixta' },
  { value: 'textil', label: 'Textil' },
  { value: 'otro_2d', label: 'Otro' },
]

const FORMATOS_3D = [
  { value: 'escultura', label: 'Escultura' },
  { value: 'ceramica', label: 'Cerámica' },
  { value: 'textil_3d', label: 'Textil' },
  { value: 'otro_3d', label: 'Otro' },
]

// Para compatibilidad con código existente
const CATEGORIAS = [
  ...FORMATOS_2D.map(f => ({ ...f, tipo: '2D' })),
  ...FORMATOS_3D.map(f => ({ ...f, tipo: '3D' })),
  { value: 'otro_general', label: 'Otro', tipo: 'TODOS' },
]

export default function Step5Paquetes({ formData, updateFormData, errors, onContinue }) {
  // Formatos traducidos
  const FORMATOS_2D_I18N = [
    { value: 'pintura', label: 'Pintura (técnicas húmedas)' },
    { value: 'dibujo', label: 'Dibujo (técnicas secas)' },
    { value: 'grafica', label: 'Gráfica' },
    { value: 'fotografia', label: 'Fotografía' },
    { value: 'collage_mixta', label: 'Collage & Mixta' },
    { value: 'textil', label: 'Textil' },
    { value: 'otro_2d', label: 'Otro' },
  ]

  const FORMATOS_3D_I18N = [
    { value: 'escultura', label: 'Escultura' },
    { value: 'ceramica', label: 'Cerámica' },
    { value: 'textil_3d', label: 'Textil' },
    { value: 'otro_3d', label: 'Otro' },
  ]

  const [confirmedPaquete, setConfirmedPaquete] = useState(
    formData.paquete_id ? { id: formData.paquete_id } : null
  )
  const [leftPanelOpen, setLeftPanelOpen] = useState(false)
  const [rightPanelOpen, setRightPanelOpen] = useState(true)
  const [expandedPaqueteId, setExpandedPaqueteId] = useState(null)

  // Referencias para animaciones GSAP
  const leftPanelRef = useRef(null)
  const rightPanelRef = useRef(null)
  const paqueteIndicatorRef = useRef(null)
  const canvasContainerRef = useRef(null)

  // Referencia a funciones del canvas
  const canvasFunctionsRef = useRef(null)
  const [canvasState, setCanvasState] = useState({ obrasCount: 0, isSaving: false })

  const { paquetes, fetchPaquetes, isLoading } = usePaquetesStore()

  // Obras
  const [todasLasObras, setTodasLasObras] = useState([])
  const [editingObra, setEditingObra] = useState(null)
  const [isProcessingImages, setIsProcessingImages] = useState(false)
  const [compressionProgress, setCompressionProgress] = useState({ current: 0, total: 0 })

  // Modal de instrucciones
  const [showInstructions, setShowInstructions] = useState(true)
  const instructionsRef = useRef(null)

  // Formato de trabajo seleccionado
  const [tipoFormato, setTipoFormato] = useState(() => {
    // Inicializar desde formData si existe
    if (formData.formato_tipo) return formData.formato_tipo
    if (formData.categoria) {
      const cat = CATEGORIAS.find(c => c.value === formData.categoria)
      if (cat?.tipo === '2D' || cat?.tipo === '3D') return cat.tipo
      if (cat?.tipo === 'TODOS') return 'OTRO'
    }
    return null
  })
  const [selectedFormatos, setSelectedFormatos] = useState(() => {
    if (formData.formatos && Array.isArray(formData.formatos)) return formData.formatos
    if (formData.categoria) return [formData.categoria]
    return []
  })
  const [formatoOtroTexto, setFormatoOtroTexto] = useState(formData.formato_otro_texto || '')

  // Compatibilidad con código existente
  const selectedCategoria = selectedFormatos[0] || ''
  const categoriaSeleccionada = CATEGORIAS.find(c => c.value === selectedCategoria)
  const esArtista3D = tipoFormato === '3D'
  const mostrarTodosPaquetes = tipoFormato === 'OTRO' || (selectedFormatos.some(f => f.includes('otro')))

  useEffect(() => { fetchPaquetes() }, [])

  useEffect(() => {
    if (formData.paquete_id && paquetes.length > 0 && !confirmedPaquete?.nombre) {
      const paquete = paquetes.find(p => p.id === formData.paquete_id)
      if (paquete) setConfirmedPaquete(paquete)
    }
  }, [paquetes, formData.paquete_id])

  // Convierte Data URL a File object
  const dataURLtoFile = (dataURL, baseFilename) => {
    try {
      // Validar que el Data URL esté bien formado
      if (!dataURL || !dataURL.startsWith('data:')) {
        console.error('❌ Data URL inválido:', dataURL?.substring(0, 50))
        return null
      }

      const arr = dataURL.split(',')
      if (arr.length !== 2) {
        console.error('❌ Data URL mal formado (no tiene coma):', dataURL?.substring(0, 50))
        return null
      }

      // Extraer MIME type
      const mimeMatch = arr[0].match(/:(.*?);/)
      if (!mimeMatch) {
        console.error('❌ No se pudo extraer MIME type de Data URL:', arr[0])
        return null
      }
      const mime = mimeMatch[1]

      // Determinar extensión correcta según MIME type
      const extension = mime.includes('png') ? '.png' : mime.includes('jpeg') || mime.includes('jpg') ? '.jpg' : '.jpg'

      // Asegurar que el filename tenga la extensión correcta
      const filename = baseFilename.replace(/\.(jpg|jpeg|png)$/i, '') + extension

      // Decodificar base64
      const bstr = atob(arr[1])
      let n = bstr.length
      const u8arr = new Uint8Array(n)
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
      }

      const file = new File([u8arr], filename, { type: mime })
      console.log(`✅ File reconstruido: ${filename} (${mime}, ${Math.round(file.size / 1024)}KB)`)
      return file
    } catch (error) {
      console.error('❌ Error reconstruyendo File desde Data URL:', error)
      return null
    }
  }

  // Inicializar todasLasObras desde formData.portfolio_obras al montar
  useEffect(() => {
    if (formData.portfolio_obras && formData.portfolio_obras.length > 0 && todasLasObras.length === 0) {
      console.log('Inicializando obras desde formData.portfolio_obras:', formData.portfolio_obras.length)

      // CRÍTICO: Recrear File objects desde Data URLs si no existen
      const obrasReconstruidas = formData.portfolio_obras.map((obra, index) => {
        if (!obra.file && obra.preview && obra.preview.startsWith('data:')) {
          // Recrear File desde Data URL
          const baseFileName = obra.titulo ? `${obra.titulo}` : `obra-${obra.id || index}`
          const file = dataURLtoFile(obra.preview, baseFileName)

          if (!file) {
            console.error(`❌ No se pudo recrear File para obra: ${obra.titulo || obra.id}`)
            // Retornar obra sin file - el usuario verá el preview pero deberá re-subir
            return obra
          }

          console.log(`✅ File reconstruido para obra: ${obra.titulo || obra.id}`)
          return { ...obra, file }
        }
        return obra
      })

      setTodasLasObras(obrasReconstruidas)

      // Actualizar formData con los files reconstruidos
      if (obrasReconstruidas.some(o => o.file !== formData.portfolio_obras.find(fo => fo.id === o.id)?.file)) {
        updateFormData({ portfolio_obras: obrasReconstruidas })
      }
    }
  }, [])

  // Animación de paneles
  useLayoutEffect(() => {
    if (leftPanelRef.current) {
      if (leftPanelOpen) {
        gsap.fromTo(leftPanelRef.current,
          { opacity: 0, y: -20, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: 'power2.out' }
        )
      }
    }
  }, [leftPanelOpen])

  useLayoutEffect(() => {
    if (rightPanelRef.current) {
      if (rightPanelOpen) {
        gsap.fromTo(rightPanelRef.current,
          { opacity: 0, y: -20, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: 'power2.out' }
        )
      }
    }
  }, [rightPanelOpen])

  // Animación del indicador de paquete
  useLayoutEffect(() => {
    if (paqueteIndicatorRef.current && confirmedPaquete) {
      gsap.fromTo(paqueteIndicatorRef.current,
        { opacity: 0, scale: 0.8, y: -10 },
        { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'back.out(1.7)' }
      )
    }
  }, [confirmedPaquete?.id])

  // Animación del canvas cuando cambia el paquete
  useLayoutEffect(() => {
    if (canvasContainerRef.current && confirmedPaquete) {
      gsap.fromTo(canvasContainerRef.current,
        { opacity: 0.5 },
        { opacity: 1, duration: 0.5, ease: 'power2.out' }
      )
    }
  }, [confirmedPaquete?.id])

  const paquetesFiltrados = mostrarTodosPaquetes
    ? paquetes
    : paquetes.filter(p => esArtista3D ? p.tipo === '3D' : p.tipo === '2D')

  // Manejar selección de tipo (2D, 3D, OTRO)
  const handleTipoChange = (tipo) => {
    if (tipoFormato === tipo) return // Ya está seleccionado
    setTipoFormato(tipo)
    setSelectedFormatos([]) // Limpiar formatos al cambiar tipo
    setFormatoOtroTexto('')
    // Reset paquete
    if (confirmedPaquete) {
      setConfirmedPaquete(null)
      updateFormData({ paquete_id: null })
    }
    updateFormData({
      formato_tipo: tipo,
      formatos: [],
      categoria: '', // Compatibilidad
      formato_otro_texto: ''
    })
  }

  // Manejar selección/deselección de formato (multiselect)
  const handleFormatoToggle = (value) => {
    const newFormatos = selectedFormatos.includes(value)
      ? selectedFormatos.filter(f => f !== value)
      : [...selectedFormatos, value]

    setSelectedFormatos(newFormatos)
    updateFormData({
      formatos: newFormatos,
      categoria: newFormatos[0] || '', // Compatibilidad: usar el primero
      formato_tipo: tipoFormato,
    })

    // Reset paquete si cambia
    if (confirmedPaquete && !newFormatos.includes(selectedFormatos[0])) {
      setConfirmedPaquete(null)
      updateFormData({ paquete_id: null })
    }
  }

  // Manejar texto de "Otro"
  const handleOtroTextoChange = (texto) => {
    setFormatoOtroTexto(texto)
    updateFormData({ formato_otro_texto: texto })
  }

  // Compatibilidad con código existente
  const handleCategoriaChange = (value) => {
    handleFormatoToggle(value)
  }

  const handleConfirmPaquete = (paquete) => {
    // Animación de salida del panel
    if (rightPanelRef.current) {
      gsap.to(rightPanelRef.current, {
        opacity: 0,
        y: -10,
        scale: 0.95,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => {
          setConfirmedPaquete(paquete)
          updateFormData({ paquete_id: paquete.id })
          setExpandedPaqueteId(null)
          setRightPanelOpen(false)
        }
      })
    } else {
      setConfirmedPaquete(paquete)
      updateFormData({ paquete_id: paquete.id })
      setExpandedPaqueteId(null)
      setRightPanelOpen(false)
    }
  }

  const handleClosePanel = (panel) => {
    const ref = panel === 'left' ? leftPanelRef : rightPanelRef
    const setter = panel === 'left' ? setLeftPanelOpen : setRightPanelOpen

    if (ref.current) {
      gsap.to(ref.current, {
        opacity: 0,
        y: -10,
        scale: 0.95,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => setter(false)
      })
    } else {
      setter(false)
    }
  }

  const handleSaveAndContinue = (layoutData, layoutUrl, obrasCompletas) => {
    // Validar que haya seleccionado un paquete
    if (!confirmedPaquete) {
      alert('⚠️ Debes seleccionar un paquete antes de continuar')
      return
    }

    // Validar que haya agregado al menos una obra al canvas
    if (!obrasCompletas || obrasCompletas.length === 0) {
      alert('⚠️ Debes agregar al menos una obra al lienzo antes de continuar.\n\nPor favor:\n1. Agrega obras usando el botón "Agregar Obra"\n2. Completa la información de cada obra (clic en editar)\n3. Arrastra las obras al lienzo')
      return
    }

    // CRÍTICO: Reconstruir obras con archivos desde portfolio_obras (formData.portfolio_obras)
    // obrasCompletas viene sin archivos porque se filtra desde layoutData que solo tiene metadata
    // Necesitamos obtener los archivos originales de portfolio_obras
    const portfolioObras = formData.portfolio_obras || todasLasObras
    const obrasConArchivos = obrasCompletas.map(obraCanvas => {
      // Buscar la obra original que tiene el archivo
      const obraOriginal = portfolioObras.find(o => o.id === obraCanvas.id)
      return {
        ...obraCanvas,
        file: obraOriginal?.file, // Preservar el archivo original
        preview: obraOriginal?.preview // Preservar el preview original
      }
    })

    console.log('Obras guardadas en lienzo con archivos:', obrasConArchivos.length)

    // Guardar datos del canvas y continuar
    // La validación de tamaño total se hace en Step3Documentos (paso 4)
    // porque los documentos se suben después del lienzo
    updateFormData({
      layout_canvas_data: layoutData,
      layout_canvas_url: layoutUrl,
      layout_canvas_blob: layoutData.canvas_image_blob,
      layout_canvas_pdf_blob: layoutData.canvas_pdf_blob,
      layout_canvas_preview_url: layoutData.canvas_preview_url,
      obras_lienzo: obrasConArchivos
    })
    if (onContinue) setTimeout(() => onContinue(true), 150)
  }

  const handleCanvasReady = (functions) => {
    canvasFunctionsRef.current = functions
    const obrasEnCanvas = functions.getObrasEnCanvas?.() || []
    setCanvasState({
      obrasCount: obrasEnCanvas.length,
      obrasEnCanvas: obrasEnCanvas,
      isSaving: functions.isSaving
    })
  }

  // Convierte un archivo a base64 data URL (persistente entre navegaciones)
  const fileToDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleAddNewObra = async (files) => {
    const filesArray = Array.from(files)
    setIsProcessingImages(true)
    setCompressionProgress({ current: 0, total: filesArray.length })

    try {
      const processedObras = []

      // Procesar archivos secuencialmente para mostrar progreso
      for (let index = 0; index < filesArray.length; index++) {
        const file = filesArray[index]
        setCompressionProgress({ current: index + 1, total: filesArray.length })

        const fileSizeMB = file.size / (1024 * 1024)
        let processedFile = file

        // Comprimir automáticamente archivos grandes (>5MB)
        // Acepta hasta 100MB, comprime a ~8-10MB preservando alta calidad
        if (fileSizeMB > 5) {
          console.log(`🖼️ Comprimiendo obra ${index + 1}: ${fileSizeMB.toFixed(2)}MB...`)
          try {
            processedFile = await compressImage(file, {
              maxWidth: 3500,     // Alta resolución para obras de arte
              maxHeight: 3500,
              quality: 0.94,      // Calidad 94% - preserva detalles
              maxSizeKB: 10240    // ~10MB target (excelente calidad)
            })
            const newSizeMB = processedFile.size / (1024 * 1024)
            console.log(`✅ Obra ${index + 1} comprimida: ${fileSizeMB.toFixed(2)}MB → ${newSizeMB.toFixed(2)}MB`)
          } catch (error) {
            console.error('Error comprimiendo imagen:', error)
            // Si falla la compresión, usar archivo original
          }
        }

        // CRÍTICO: Usar Data URL en lugar de Blob URL para que persista entre navegaciones
        const previewDataURL = await fileToDataURL(processedFile)

        // Advertir si el Data URL es muy grande (podría causar problemas con localStorage)
        const sizeKB = Math.round(previewDataURL.length / 1024)
        if (sizeKB > 1024) {
          console.warn(`⚠️ Data URL muy grande para obra ${index + 1}: ${sizeKB}KB`)
          console.warn('   Esto podría causar problemas al guardar en localStorage')
          console.warn('   Considera comprimir más la imagen o usar un formato diferente')
        }

        processedObras.push({
          id: `obra-${Date.now()}-${index}`,
          file: processedFile,
          preview: previewDataURL, // ✅ Data URL persistente (no Blob URL temporal)
          titulo: '', ancho_cm: '', alto_cm: '', tecnica: '',
          anio: new Date().getFullYear(), precio_mxn: '', notas_montaje: ''
        })
      }

      setTodasLasObras(prev => {
        const updated = [...prev, ...processedObras]
        // CRÍTICO: Actualizar formData.portfolio_obras (TODAS las obras del usuario)
        // Esto preserva los archivos incluso si se recarga la página
        // obras_lienzo se actualizará solo con las obras que están en el canvas
        updateFormData({ portfolio_obras: updated })
        return updated
      })
      if (processedObras.length > 0) setEditingObra(processedObras[0])
    } catch (error) {
      console.error('Error procesando imágenes:', error)
      alert('Error al procesar las imágenes. Por favor, intenta de nuevo.')
    } finally {
      setIsProcessingImages(false)
      setCompressionProgress({ current: 0, total: 0 })
    }
  }

  const hasCompleteMetadata = (obra) => {
    const baseFields = obra.titulo && obra.ancho_cm && obra.alto_cm && obra.tecnica && obra.precio_mxn
    const es3DActual = mostrarTodosPaquetes ? confirmedPaquete?.tipo === '3D' : esArtista3D
    if (es3DActual) {
      return baseFields && obra.largo_cm
    }
    return baseFields
  }

  const handleObraDragStart = (e, obra) => {
    if (canvasFunctionsRef.current?.handleRowDragStart) {
      canvasFunctionsRef.current.handleRowDragStart(e, obra)
    }
  }

  return (
    <div style={{ position: 'relative', minHeight: '75vh' }}>
      {/* Overlay de compresión */}
      <CompressingOverlay
        isCompressing={isProcessingImages}
        filesCount={compressionProgress.total}
        currentFile={compressionProgress.current}
        message="Comprimiendo obras de arte..."
      />

      {/* Botones de Instrucciones y Referencias */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '16px',
      }}>
        <button
          type="button"
          onClick={() => setShowInstructions(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            background: COLORS.cream,
            border: 'none',
            borderRadius: '10px',
            fontFamily: FONTS.body,
            fontWeight: 600,
            fontSize: '13px',
            color: COLORS.black,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <FileText size={16} />
          Ver Instrucciones
        </button>
        <button
          type="button"
          onClick={() => window.open('/referencias-paquetes.pdf', '_blank')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            background: COLORS.cream,
            border: 'none',
            borderRadius: '10px',
            fontFamily: FONTS.body,
            fontWeight: 600,
            fontSize: '13px',
            color: COLORS.black,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <ExternalLink size={16} />
          Ver Referencias de Paquetes
        </button>
      </div>

      {/* SELECTOR DE FORMATO DE TRABAJO */}
      <div style={{
        background: COLORS.cream,
        borderRadius: '16px',
        padding: '20px 24px',
        marginBottom: '20px',
      }}>
        {/* Título */}
        <div style={{ marginBottom: '16px' }}>
          <span style={{
            fontFamily: FONTS.display,
            fontWeight: 600,
            fontStyle: 'italic',
            fontSize: '16px',
            color: COLORS.black,
          }}>
            Elige tu formato de trabajo:
          </span>
        </div>

        {/* Botones principales: 2D, 3D, OTRO */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: tipoFormato ? '16px' : 0 }}>
          <button
            onClick={() => handleTipoChange('2D')}
            style={{
              padding: '12px 24px',
              background: tipoFormato === '2D' ? COLORS.red : 'white',
              color: tipoFormato === '2D' ? COLORS.cream : COLORS.black,
              border: `2px solid ${tipoFormato === '2D' ? COLORS.red : COLORS.creamDark}`,
              borderRadius: '12px',
              fontFamily: FONTS.body,
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            2D — Bidimensional
          </button>
          <button
            onClick={() => handleTipoChange('3D')}
            style={{
              padding: '12px 24px',
              background: tipoFormato === '3D' ? COLORS.red : 'white',
              color: tipoFormato === '3D' ? COLORS.cream : COLORS.black,
              border: `2px solid ${tipoFormato === '3D' ? COLORS.red : COLORS.creamDark}`,
              borderRadius: '12px',
              fontFamily: FONTS.body,
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            3D — Tridimensional
          </button>
          <button
            onClick={() => handleTipoChange('OTRO')}
            style={{
              padding: '12px 24px',
              background: tipoFormato === 'OTRO' ? COLORS.red : 'white',
              color: tipoFormato === 'OTRO' ? COLORS.cream : COLORS.black,
              border: `2px solid ${tipoFormato === 'OTRO' ? COLORS.red : COLORS.creamDark}`,
              borderRadius: '12px',
              fontFamily: FONTS.body,
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            Otro
          </button>
        </div>

        {/* Tags de formatos según el tipo seleccionado */}
        {tipoFormato === '2D' && (
          <div style={{
            background: 'rgba(184,48,48,0.05)',
            borderRadius: '12px',
            padding: '16px',
          }}>
            <p style={{
              fontFamily: FONTS.body,
              fontSize: '12px',
              color: COLORS.gray,
              margin: '0 0 10px',
            }}>
              Selecciona uno o más formatos
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {FORMATOS_2D_I18N.map((formato) => (
                <button
                  key={formato.value}
                  onClick={() => handleFormatoToggle(formato.value)}
                  style={{
                    padding: '8px 14px',
                    background: selectedFormatos.includes(formato.value) ? COLORS.red : 'white',
                    color: selectedFormatos.includes(formato.value) ? COLORS.cream : COLORS.black,
                    border: `2px solid ${selectedFormatos.includes(formato.value) ? COLORS.red : COLORS.creamDark}`,
                    borderRadius: '20px',
                    fontFamily: FONTS.body,
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {selectedFormatos.includes(formato.value) && <Check size={14} />}
                  {formato.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {tipoFormato === '3D' && (
          <div style={{
            background: 'rgba(184,48,48,0.05)',
            borderRadius: '12px',
            padding: '16px',
          }}>
            <p style={{
              fontFamily: FONTS.body,
              fontSize: '12px',
              color: COLORS.gray,
              margin: '0 0 10px',
            }}>
              Selecciona uno o más formatos
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {FORMATOS_3D_I18N.map((formato) => (
                <button
                  key={formato.value}
                  onClick={() => handleFormatoToggle(formato.value)}
                  style={{
                    padding: '8px 14px',
                    background: selectedFormatos.includes(formato.value) ? COLORS.red : 'white',
                    color: selectedFormatos.includes(formato.value) ? COLORS.cream : COLORS.black,
                    border: `2px solid ${selectedFormatos.includes(formato.value) ? COLORS.red : COLORS.creamDark}`,
                    borderRadius: '20px',
                    fontFamily: FONTS.body,
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {selectedFormatos.includes(formato.value) && <Check size={14} />}
                  {formato.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input para "Otro" - aparece si seleccionan OTRO principal o cualquier otro_* */}
        {(tipoFormato === 'OTRO' || selectedFormatos.some(f => f.includes('otro'))) && (
          <div style={{
            background: 'rgba(184,48,48,0.05)',
            borderRadius: '12px',
            padding: '16px',
            marginTop: tipoFormato === 'OTRO' ? 0 : '12px',
          }}>
            <label style={{
              fontFamily: FONTS.body,
              fontSize: '12px',
              color: errors?.formato_otro ? COLORS.red : COLORS.gray,
              display: 'block',
              marginBottom: '8px',
            }}>
              Describe tu formato de trabajo *
            </label>
            <input
              type="text"
              value={formatoOtroTexto}
              onChange={(e) => handleOtroTextoChange(e.target.value)}
              placeholder="Ej: Instalación, Arte digital, Pintura expandida..."
              style={{
                width: '100%',
                padding: '12px 16px',
                border: `2px solid ${errors?.formato_otro ? COLORS.red : COLORS.creamDark}`,
                borderRadius: '10px',
                fontFamily: FONTS.body,
                fontSize: '14px',
                color: COLORS.black,
                background: 'white',
                outline: 'none',
              }}
            />
            {errors?.formato_otro && (
              <p style={{
                fontFamily: FONTS.body,
                fontSize: '12px',
                color: COLORS.red,
                marginTop: '6px',
                marginBottom: 0,
              }}>
                {errors.formato_otro}
              </p>
            )}
          </div>
        )}

        {/* Resumen de selección */}
        {selectedFormatos.length > 0 && (
          <div style={{
            marginTop: '12px',
            padding: '10px 14px',
            background: 'rgba(184,48,48,0.1)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <Check size={16} color={COLORS.red} />
            <span style={{
              fontFamily: FONTS.body,
              fontSize: '13px',
              color: COLORS.black,
            }}>
              <strong>{selectedFormatos.length}</strong> formato(s) seleccionado(s)
              {tipoFormato && ` (${tipoFormato})`}
            </span>
          </div>
        )}

        {/* Mensaje de error de formato */}
        {errors?.formato && (
          <div style={{
            marginTop: '12px',
            padding: '10px 14px',
            background: 'rgba(184,48,48,0.15)',
            border: `1px solid ${COLORS.red}`,
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <AlertCircle size={16} color={COLORS.red} />
            <span style={{
              fontFamily: FONTS.body,
              fontSize: '13px',
              color: COLORS.red,
              fontWeight: 500,
            }}>
              {errors.formato}
            </span>
          </div>
        )}
      </div>

      {/* Mensaje si no hay formato seleccionado */}
      {(selectedFormatos.length === 0 && tipoFormato !== 'OTRO') && (
        <div style={{
          background: 'rgba(184,48,48,0.05)',
          border: `2px dashed ${COLORS.red}`,
          borderRadius: '16px',
          padding: '48px',
          textAlign: 'center',
          marginBottom: '20px',
        }}>
          <AlertCircle size={48} color={COLORS.red} style={{ marginBottom: '16px' }} />
          <h3 style={{
            fontFamily: FONTS.display,
            fontWeight: 600,
            fontStyle: 'italic',
            fontSize: '22px',
            color: COLORS.black,
            margin: '0 0 8px',
          }}>
            Selecciona tu formato de trabajo
          </h3>
          <p style={{
            fontFamily: FONTS.body,
            fontSize: '15px',
            color: COLORS.gray,
            margin: 0,
          }}>
            Por favor, elige si trabajas con formatos 2D, 3D u otros para continuar
          </p>
        </div>
      )}

      {/* BARRA SUPERIOR - Solo visible si hay formato seleccionado */}
      {(selectedFormatos.length > 0 || tipoFormato === 'OTRO') && (
      <>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '12px',
        marginBottom: '16px',
        position: 'relative',
        zIndex: 200,
      }}>
        {/* Botones de paneles - IZQUIERDA */}
        <div style={{ display: 'flex', gap: '8px', position: 'relative' }}>
          {/* Botón Mis Obras */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => {
                if (leftPanelOpen) {
                  handleClosePanel('left')
                } else {
                  setLeftPanelOpen(true)
                  if (rightPanelOpen) handleClosePanel('right')
                }
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 16px',
                background: leftPanelOpen ? COLORS.red : COLORS.black,
                border: 'none',
                color: COLORS.cream,
                borderRadius: leftPanelOpen ? '10px 10px 0 0' : '10px',
                fontFamily: FONTS.body,
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'background 0.2s ease',
              }}
            >
              <Palette size={16} />
              Mis Obras
              {leftPanelOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {/* Panel Mis Obras - Dropdown */}
            {leftPanelOpen && (
              <div
                ref={leftPanelRef}
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  width: '320px',
                  maxHeight: '500px',
                  background: COLORS.cream,
                  borderRadius: '0 12px 12px 12px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
                  overflow: 'hidden',
                  zIndex: 300,
                }}
              >
                <div style={{ padding: '12px 16px', borderBottom: `1px solid ${COLORS.creamDark}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: FONTS.body, fontSize: '12px', color: COLORS.gray }}>
                    {isProcessingImages ? 'Procesando...' : `${todasLasObras.length} ${todasLasObras.length !== 1 ? 'obras' : 'obra'}`}
                  </span>
                  <label style={{
                    display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px',
                    background: isProcessingImages ? COLORS.gray : COLORS.black,
                    color: COLORS.cream, borderRadius: '6px',
                    fontFamily: FONTS.body, fontSize: '11px', fontWeight: 600,
                    cursor: isProcessingImages ? 'wait' : 'pointer',
                    opacity: isProcessingImages ? 0.7 : 1,
                  }}>
                    {isProcessingImages ? (
                      <>
                        <Loader2 size={12} className="animate-spin" /> Comprimiendo...
                      </>
                    ) : (
                      <>
                        <Plus size={12} /> Agregar Obra
                      </>
                    )}
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleAddNewObra(e.target.files)}
                      style={{ display: 'none' }}
                      disabled={isProcessingImages}
                    />
                  </label>
                </div>

                <div style={{ maxHeight: '400px', overflow: 'auto', padding: '12px' }}>
                  {!confirmedPaquete && todasLasObras.length > 0 && (
                    <div style={{ background: 'rgba(184,48,48,0.08)', borderRadius: '8px', padding: '8px 10px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertCircle size={14} color={COLORS.red} />
                      <span style={{ fontFamily: FONTS.body, fontSize: '11px', color: COLORS.black }}>
                        Selecciona un paquete primero para agregar obras al lienzo
                      </span>
                    </div>
                  )}

                  {todasLasObras.map((obra) => {
                    const isInCanvas = canvasState.obrasEnCanvas?.some(o => o.id === obra.id) || (formData.obras_lienzo || []).some(o => o.id === obra.id)
                    const hasMetadata = hasCompleteMetadata(obra)
                    const canDrag = confirmedPaquete && hasMetadata && !isInCanvas

                    return (
                      <div
                        key={obra.id}
                        draggable={canDrag}
                        onDragStart={(e) => canDrag && handleObraDragStart(e, obra)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '8px', padding: '8px',
                          background: isInCanvas ? 'rgba(184,48,48,0.08)' : 'white',
                          border: `1px solid ${isInCanvas ? COLORS.red : COLORS.creamDark}`,
                          borderRadius: '8px', marginBottom: '6px',
                          cursor: canDrag ? 'grab' : 'default', opacity: isInCanvas ? 0.6 : 1,
                        }}
                      >
                        {canDrag && <GripVertical size={14} color={COLORS.gray} />}
                        <div style={{ width: '36px', height: '36px', borderRadius: '4px', overflow: 'hidden', background: COLORS.creamDark, flexShrink: 0 }}>
                          {obra.preview && <img src={obra.preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: FONTS.body, fontSize: '12px', fontWeight: 600, color: COLORS.black, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {obra.titulo || 'Sin título'}
                          </div>
                          <div style={{ fontFamily: FONTS.body, fontSize: '10px', color: COLORS.gray }}>
                            {obra.ancho_cm && obra.alto_cm ? `${obra.ancho_cm} × ${obra.alto_cm} cm` : 'Sin medidas'}
                          </div>
                        </div>
                        {isInCanvas && <Check size={14} color={COLORS.red} />}
                        {!hasMetadata && !isInCanvas && <AlertCircle size={14} color={COLORS.red} />}
                        <button onClick={() => setEditingObra(obra)} style={{ padding: '4px', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                          <Edit2 size={12} color={COLORS.gray} />
                        </button>
                        {!isInCanvas && (
                          <button onClick={() => setTodasLasObras(prev => {
                            const updated = prev.filter(o => o.id !== obra.id)
                            updateFormData({ portfolio_obras: updated })
                            return updated
                          })} style={{ padding: '4px', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                            <Trash2 size={12} color={COLORS.red} />
                          </button>
                        )}
                      </div>
                    )
                  })}

                  {todasLasObras.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '24px 12px', background: 'white', borderRadius: '8px', border: `2px dashed ${COLORS.creamDark}` }}>
                      <p style={{ fontFamily: FONTS.body, fontSize: '12px', color: COLORS.gray, margin: 0 }}>
                        No tienes obras agregadas<br />Haz clic en "Agregar Obra" para comenzar
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Botón Paquetes */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => {
                if (rightPanelOpen) {
                  handleClosePanel('right')
                } else {
                  setRightPanelOpen(true)
                  if (leftPanelOpen) handleClosePanel('left')
                }
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 16px',
                background: rightPanelOpen ? COLORS.red : COLORS.black,
                border: 'none',
                color: COLORS.cream,
                borderRadius: rightPanelOpen ? '10px 10px 0 0' : '10px',
                fontFamily: FONTS.body,
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'background 0.2s ease',
              }}
            >
              <Box size={16} />
              Paquetes
              {rightPanelOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {/* Panel Paquetes - Dropdown */}
            {rightPanelOpen && (
              <div
                ref={rightPanelRef}
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  width: '340px',
                  maxHeight: '500px',
                  background: COLORS.cream,
                  borderRadius: '0 12px 12px 12px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
                  overflow: 'hidden',
                  zIndex: 300,
                }}
              >
                <div style={{ padding: '10px 16px', background: 'rgba(184,48,48,0.05)', borderBottom: `1px solid ${COLORS.creamDark}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {mostrarTodosPaquetes ? <Box size={14} color={COLORS.red} /> : (esArtista3D ? <Box size={14} color={COLORS.red} /> : <Palette size={14} color={COLORS.red} />)}
                  <span style={{ fontFamily: FONTS.body, fontSize: '11px', color: COLORS.black, fontWeight: 600 }}>
                    {mostrarTodosPaquetes ? 'Todos los Paquetes' : (esArtista3D ? 'Paquetes 3D' : 'Paquetes 2D')}
                  </span>
                </div>
                <div style={{ padding: '8px 16px', background: 'rgba(34, 197, 94, 0.15)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Info size={12} color="rgba(34, 197, 94, 0.9)" />
                  <span style={{ fontFamily: FONTS.body, fontSize: '10px', color: 'rgba(34, 197, 94, 0.95)', fontWeight: 600 }}>
                    REGISTRO GRATUITO. SE PAGA SOLO AL SER SELECCIONADO
                  </span>
                </div>
                <div style={{ padding: '6px 16px', background: 'rgba(107, 107, 107, 0.1)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Info size={12} color={COLORS.gray} />
                  <span style={{ fontFamily: FONTS.body, fontSize: '10px', color: COLORS.gray, fontWeight: 500 }}>
                    Todos los precios incluyen IVA
                  </span>
                </div>

                <div style={{ maxHeight: '420px', overflow: 'auto', padding: '12px' }}>
                  {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '24px' }}>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto" />
                    </div>
                  ) : (
                    paquetesFiltrados.map((paquete) => {
                      const isExpanded = expandedPaqueteId === paquete.id
                      const isConfirmed = confirmedPaquete?.id === paquete.id

                      return (
                        <div key={paquete.id} style={{
                          background: isConfirmed ? 'rgba(184,48,48,0.1)' : 'white',
                          border: isConfirmed ? `2px solid ${COLORS.red}` : `1px solid ${COLORS.creamDark}`,
                          borderRadius: '10px', marginBottom: '8px', overflow: 'hidden',
                        }}>
                          <button
                            onClick={() => setExpandedPaqueteId(isExpanded ? null : paquete.id)}
                            style={{
                              width: '100%', padding: '12px 14px', background: 'transparent', border: 'none',
                              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {isConfirmed && <Check size={16} color={COLORS.red} />}
                              <span style={{ fontFamily: FONTS.display, fontWeight: 600, fontStyle: 'italic', fontSize: '14px', color: COLORS.black }}>
                                {paquete.nombre}
                              </span>
                            </div>
                            {isExpanded ? <ChevronUp size={18} color={COLORS.gray} /> : <ChevronDown size={18} color={COLORS.gray} />}
                          </button>

                          {isExpanded && (
                            <div style={{ padding: '0 14px 14px', borderTop: `1px solid ${COLORS.creamDark}` }}>
                              <p style={{ fontFamily: FONTS.body, fontSize: '12px', color: COLORS.gray, lineHeight: 1.5, margin: '10px 0' }}>
                                {paquete.descripcion}
                              </p>
                              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                                <span style={{ background: 'rgba(184,48,48,0.1)', padding: '4px 8px', borderRadius: '6px', fontFamily: FONTS.body, fontSize: '11px', color: COLORS.black }}>
                                  {paquete.tipo === '3D' ? `${paquete.metros_cuadrados}m²` : `${paquete.metros_lineales}m`}
                                </span>
                                {mostrarTodosPaquetes && (
                                  <span style={{ background: paquete.tipo === '3D' ? 'rgba(184,48,48,0.15)' : 'rgba(107,107,107,0.1)', padding: '4px 8px', borderRadius: '6px', fontFamily: FONTS.body, fontSize: '10px', color: paquete.tipo === '3D' ? COLORS.red : COLORS.gray, fontWeight: 600 }}>
                                    {paquete.tipo}
                                  </span>
                                )}
                                <span style={{ background: 'rgba(184,48,48,0.1)', padding: '4px 8px', borderRadius: '6px', fontFamily: FONTS.body, fontSize: '11px', color: COLORS.black }}>
                                  ${(paquete.precio_fase1 || paquete.precio).toLocaleString('es-MX')} MXN
                                </span>
                                <span style={{ background: 'rgba(34, 197, 94, 0.2)', padding: '4px 8px', borderRadius: '6px', fontFamily: FONTS.body, fontSize: '9px', color: 'rgba(34, 197, 94, 0.95)', fontWeight: 700, textTransform: 'uppercase' }}>
                                  −20% ya aplicado
                                </span>
                              </div>
                              {!isConfirmed ? (
                                <button
                                  onClick={() => handleConfirmPaquete(paquete)}
                                  style={{
                                    width: '100%', padding: '10px', background: COLORS.black, color: COLORS.cream,
                                    border: 'none', borderRadius: '8px', fontFamily: FONTS.body, fontWeight: 600,
                                    fontSize: '12px', textTransform: 'uppercase', cursor: 'pointer',
                                  }}
                                >
                                  Seleccionar Paquete
                                </button>
                              ) : (
                                <div style={{
                                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                  padding: '10px', background: COLORS.red, color: COLORS.cream, borderRadius: '8px',
                                  fontFamily: FONTS.body, fontWeight: 600, fontSize: '12px',
                                }}>
                                  <Check size={14} /> Paquete Seleccionado
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Indicador de paquete seleccionado */}
          {confirmedPaquete && (
            <div
              ref={paqueteIndicatorRef}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 16px',
                background: COLORS.red,
                color: COLORS.cream,
                borderRadius: '10px',
                fontFamily: FONTS.body,
                fontSize: '13px',
                fontWeight: 600,
                marginLeft: '8px',
              }}
            >
              <Check size={16} />
              {confirmedPaquete.nombre}
              <button
                onClick={() => {
                  gsap.to(paqueteIndicatorRef.current, {
                    opacity: 0, scale: 0.8, duration: 0.2,
                    onComplete: () => {
                      setConfirmedPaquete(null)
                      updateFormData({ paquete_id: null })
                      setRightPanelOpen(true)
                    }
                  })
                }}
                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.cream }}
              >
                <X size={12} />
              </button>
            </div>
          )}

          {/* Indicador de límite de tamaño */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              background: 'rgba(244, 237, 228, 0.1)',
              borderRadius: '8px',
              marginLeft: '8px',
            }}
            title="Las imágenes mayores a 5MB serán comprimidas automáticamente"
          >
            <Info size={14} color={COLORS.cream} style={{ opacity: 0.7 }} />
            <span style={{
              fontFamily: FONTS.body,
              fontSize: '11px',
              color: COLORS.cream,
              opacity: 0.7,
            }}>
              Máx. 5MB por imagen
            </span>
          </div>
        </div>

        {/* Botones de acción - DERECHA */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            onClick={() => canvasFunctionsRef.current?.exportPDF?.()}
            disabled={canvasState.obrasCount === 0}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 16px',
              background: 'transparent',
              border: `2px solid ${COLORS.cream}`,
              color: COLORS.cream,
              borderRadius: '10px',
              fontFamily: FONTS.body,
              fontWeight: 600,
              fontSize: '13px',
              cursor: canvasState.obrasCount === 0 ? 'not-allowed' : 'pointer',
              opacity: canvasState.obrasCount === 0 ? 0.5 : 1,
              transition: 'all 0.2s ease',
            }}
          >
            <Download size={16} />
            Exportar PDF
          </button>
          <button
            type="button"
            onClick={() => canvasFunctionsRef.current?.saveAndContinue?.()}
            disabled={canvasState.isSaving || canvasState.obrasCount === 0}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 20px',
              background: COLORS.black,
              border: 'none',
              color: COLORS.cream,
              borderRadius: '10px',
              fontFamily: FONTS.body,
              fontWeight: 600,
              fontSize: '13px',
              cursor: (canvasState.isSaving || canvasState.obrasCount === 0) ? 'not-allowed' : 'pointer',
              opacity: (canvasState.isSaving || canvasState.obrasCount === 0) ? 0.5 : 1,
              transition: 'all 0.2s ease',
            }}
          >
            {canvasState.isSaving ? 'Guardando...' : 'Guardar y Continuar'}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* CANVAS */}
      <div
        ref={canvasContainerRef}
        style={{
          position: 'relative',
          width: '100%',
          minHeight: '70vh',
        }}
      >
        {confirmedPaquete ? (
          <LayoutCanvas
            paquete={confirmedPaquete}
            portfolioImages={todasLasObras}
            initialLayout={formData.layout_canvas_data}
            onSave={(data, url) => updateFormData({ layout_canvas_data: data, layout_canvas_url: url })}
            onSaveAndContinue={handleSaveAndContinue}
            errors={errors}
            hideGallery={true}
            hideActions={true}
            onCanvasReady={handleCanvasReady}
          />
        ) : (
          <CanvasPlaceholder />
        )}
      </div>
      </>
      )}

      {/* Modal edición obra */}
      {editingObra && (
        <ObraModal
          obra={editingObra}
          es3D={mostrarTodosPaquetes ? confirmedPaquete?.tipo === '3D' : esArtista3D}
          onSave={(updated) => {
            setTodasLasObras(prev => {
              const updatedObras = prev.map(o => o.id === updated.id ? updated : o)
              updateFormData({ portfolio_obras: updatedObras })
              return updatedObras
            })
            setEditingObra(null)
          }}
          onClose={() => setEditingObra(null)}
        />
      )}

      {errors?.paquete_id && (
        <p style={{ color: COLORS.cream, fontFamily: FONTS.body, fontSize: '14px', textAlign: 'center', marginTop: '16px' }}>
          {errors.paquete_id}
        </p>
      )}

      {/* Modal de instrucciones */}
      {showInstructions && (
        <InstructionsModal
          ref={instructionsRef}
          onClose={() => {
            if (instructionsRef.current) {
              gsap.to(instructionsRef.current, {
                opacity: 0, scale: 0.9, duration: 0.3,
                onComplete: () => setShowInstructions(false)
              })
            } else {
              setShowInstructions(false)
            }
          }}
        />
      )}
    </div>
  )
}

function CanvasPlaceholder() {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      minHeight: '70vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundImage: 'url(/plantilla-base2.svg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.95)',
        padding: '32px 48px',
        borderRadius: '20px',
        textAlign: 'center',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      }}>
        <h3 style={{ fontFamily: FONTS.display, fontWeight: 600, fontStyle: 'italic', fontSize: '24px', color: COLORS.black, marginBottom: '12px' }}>
          Selecciona un Paquete
        </h3>
        <p style={{ fontFamily: FONTS.body, fontSize: '15px', color: COLORS.gray, maxWidth: '300px', lineHeight: 1.6, margin: 0 }}>
          Haz clic en "Paquetes" arriba para ver las opciones disponibles y empezar a diseñar tu lienzo
        </p>
      </div>
    </div>
  )
}

const MAX_FOTOS_DETALLE = 10 // Aumentado de 5 a 10 para dar más flexibilidad a los artistas

function ObraModal({ obra, es3D, onSave, onClose }) {
  const modalRef = useRef(null)
  const contentRef = useRef(null)
  const fotosInputRef = useRef(null)
  const [mounted, setMounted] = useState(false)
  const [isCompressing, setIsCompressing] = useState(false)
  const [compressionProgress, setCompressionProgress] = useState({ current: 0, total: 0 })

  const [form, setForm] = useState({
    titulo: obra.titulo || '',
    ancho_cm: obra.ancho_cm || '',
    alto_cm: obra.alto_cm || '',
    largo_cm: obra.largo_cm || '',
    tecnica: obra.tecnica || '',
    anio: obra.anio || new Date().getFullYear(),
    precio_mxn: obra.precio_mxn || '',
    notas_montaje: obra.notas_montaje || '',
    fotos_detalle: obra.fotos_detalle || [],
  })

  // Manejar selección de fotos de detalle
  const handleFotosChange = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const espacioDisponible = MAX_FOTOS_DETALLE - form.fotos_detalle.length
    if (espacioDisponible <= 0) {
      alert(`Ya tienes ${MAX_FOTOS_DETALLE} fotos. Elimina alguna para agregar más.`)
      return
    }

    const fotosAAgregar = files.slice(0, espacioDisponible)
    setIsCompressing(true)
    setCompressionProgress({ current: 0, total: fotosAAgregar.length })

    try {
      const { compressImage } = await import('@/lib/imageCompression')
      const fotosComprimidas = []

      // Procesar secuencialmente para mostrar progreso
      for (let i = 0; i < fotosAAgregar.length; i++) {
        const file = fotosAAgregar[i]
        setCompressionProgress({ current: i + 1, total: fotosAAgregar.length })

        const compressed = await compressImage(file, {
          maxWidth: 1400,      // Suficiente resolución para zoom en detalles
          maxHeight: 1400,
          quality: 0.88,       // Calidad 88% para ver detalles de cerca
          maxSizeKB: 1536      // ~1.5MB por foto detalle
        })

        fotosComprimidas.push({
          id: `detalle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          file: compressed,
          preview: URL.createObjectURL(compressed),
          name: compressed.name,
          size: compressed.size
        })
      }

      setForm(p => ({ ...p, fotos_detalle: [...p.fotos_detalle, ...fotosComprimidas] }))
    } catch (error) {
      console.error('Error comprimiendo fotos:', error)
      alert('Error al procesar las imágenes.')
    } finally {
      setIsCompressing(false)
      setCompressionProgress({ current: 0, total: 0 })
      if (fotosInputRef.current) fotosInputRef.current.value = ''
    }
  }

  const handleRemoveFoto = (fotoId) => {
    const foto = form.fotos_detalle.find(f => f.id === fotoId)
    if (foto?.preview) URL.revokeObjectURL(foto.preview)
    setForm(p => ({ ...p, fotos_detalle: p.fotos_detalle.filter(f => f.id !== fotoId) }))
  }

  useEffect(() => {
    setMounted(true)
    // Bloquear scroll del body
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  useLayoutEffect(() => {
    if (contentRef.current) {
      gsap.fromTo(contentRef.current,
        { opacity: 0, scale: 0.9, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: 'back.out(1.7)' }
      )
    }
  }, [mounted])

  const handleClose = () => {
    gsap.to(contentRef.current, {
      opacity: 0, scale: 0.9, y: 20, duration: 0.2,
      onComplete: () => {
        document.body.style.overflow = ''
        onClose()
      }
    })
  }

  if (!mounted) return null

  const modalContent = (
    <>
      {/* Overlay de compresión */}
      <CompressingOverlay
        isCompressing={isCompressing}
        filesCount={compressionProgress.total}
        currentFile={compressionProgress.current}
        message="Comprimiendo fotos de detalle..."
      />

      {/* Overlay fijo que cubre toda la pantalla */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(20, 18, 16, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          zIndex: 99998,
        }}
      />
      {/* Contenedor del modal que puede scrollear */}
      <div
        ref={modalRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '24px',
          overflowY: 'auto',
        }}
        onClick={handleClose}
      >
      <div
        ref={contentRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: COLORS.cream,
          borderRadius: '24px',
          maxWidth: '520px',
          width: '100%',
          maxHeight: 'calc(100vh - 48px)',
          overflow: 'auto',
          boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{
          padding: '24px 28px',
          borderBottom: `1px solid ${COLORS.creamDark}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}>
          <div>
            <h3 style={{
              fontFamily: FONTS.display,
              fontWeight: 600,
              fontStyle: 'italic',
              fontSize: '20px',
              color: COLORS.black,
              margin: 0,
              letterSpacing: '0.02em',
            }}>
              Ficha técnica
            </h3>
            {es3D && (
              <span style={{
                fontFamily: FONTS.body,
                fontSize: '11px',
                color: COLORS.red,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginTop: '4px',
                display: 'inline-block',
              }}>
                Obra 3D
              </span>
            )}
          </div>
          <button
            onClick={handleClose}
            style={{
              background: 'transparent',
              border: `2px solid ${COLORS.black}`,
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              fontSize: '20px',
              cursor: 'pointer',
              color: COLORS.black,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = COLORS.black
              e.currentTarget.style.color = COLORS.cream
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = COLORS.black
            }}
          >
            ×
          </button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave({ ...obra, ...form }) }} style={{ padding: '24px' }}>
          {obra.preview && (
            <div style={{ width: '100%', height: '160px', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>
              <img src={obra.preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Field label="Título de la Obra *" value={form.titulo} onChange={(e) => setForm(p => ({ ...p, titulo: e.target.value }))} required />

            {/* Dimensiones */}
            <div style={{ display: 'grid', gridTemplateColumns: es3D ? '1fr 1fr 1fr' : '1fr 1fr', gap: '12px' }}>
              <Field label="Ancho (cm) *" type="number" value={form.ancho_cm} onChange={(e) => setForm(p => ({ ...p, ancho_cm: e.target.value }))} required />
              <Field label="Alto (cm) *" type="number" value={form.alto_cm} onChange={(e) => setForm(p => ({ ...p, alto_cm: e.target.value }))} required />
              {es3D && (
                <Field label="Profundidad (cm) *" type="number" value={form.largo_cm} onChange={(e) => setForm(p => ({ ...p, largo_cm: e.target.value }))} required />
              )}
            </div>
            <p style={{
              fontFamily: FONTS.body,
              fontSize: '11px',
              color: COLORS.gray,
              margin: '-6px 0 0 0',
              fontStyle: 'italic',
            }}>
              *Incluye el marco o base en las medidas si tu obra lo requiere
            </p>

            <Field label="Técnica *" value={form.tecnica} onChange={(e) => setForm(p => ({ ...p, tecnica: e.target.value }))} required />

            <Field label="Año de Creación" type="number" value={form.anio} onChange={(e) => setForm(p => ({ ...p, anio: e.target.value }))} />

            {/* Campo de precio con calculadora */}
            <PrecioCalculadora
              value={form.precio_mxn}
              onChange={(value) => setForm(p => ({ ...p, precio_mxn: value }))}
            />

            {/* Fotos de detalle (opcional) */}
            <div>
              <label style={{ display: 'block', fontFamily: FONTS.body, fontSize: '13px', fontWeight: 600, color: COLORS.black, marginBottom: '6px' }}>
                Fotos de detalle (opcional)
              </label>
              <p style={{ fontFamily: FONTS.body, fontSize: '11px', color: COLORS.gray, margin: '0 0 12px 0', lineHeight: '1.5' }}>
                Agrega hasta {MAX_FOTOS_DETALLE} fotos de close-ups, texturas o acabados de tu obra.
              </p>

              <input
                ref={fotosInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFotosChange}
                style={{ display: 'none' }}
              />

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {form.fotos_detalle.map((foto) => (
                  <div key={foto.id} style={{ position: 'relative', width: '64px', height: '64px' }}>
                    <img
                      src={foto.preview}
                      alt="Detalle"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: `1px solid ${COLORS.creamDark}` }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveFoto(foto.id)}
                      style={{
                        position: 'absolute', top: '-6px', right: '-6px',
                        width: '20px', height: '20px', borderRadius: '50%',
                        background: COLORS.red, border: 'none', color: 'white',
                        fontSize: '14px', cursor: 'pointer', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', lineHeight: 1
                      }}
                    >×</button>
                  </div>
                ))}

                {form.fotos_detalle.length < MAX_FOTOS_DETALLE && (
                  <button
                    type="button"
                    onClick={() => fotosInputRef.current?.click()}
                    disabled={isCompressing}
                    style={{
                      width: '64px', height: '64px', borderRadius: '8px',
                      border: `2px dashed ${COLORS.creamDark}`, background: 'transparent',
                      cursor: isCompressing ? 'wait' : 'pointer', display: 'flex',
                      flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      color: COLORS.gray, fontSize: '11px', fontFamily: FONTS.body,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {isCompressing ? (
                      <span style={{ fontSize: '10px' }}>...</span>
                    ) : (
                      <>
                        <span style={{ fontSize: '20px', lineHeight: 1 }}>+</span>
                        <span>Añadir</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              <p style={{ fontFamily: FONTS.body, fontSize: '10px', color: COLORS.gray, margin: '8px 0 0 0', textAlign: 'right' }}>
                {form.fotos_detalle.length} / {MAX_FOTOS_DETALLE}
              </p>
            </div>

            {/* Notas complementarias */}
            <div>
              <label style={{ display: 'block', fontFamily: FONTS.body, fontSize: '13px', fontWeight: 600, color: COLORS.black, marginBottom: '6px' }}>Notas Complementarias</label>
              <textarea
                value={form.notas_montaje}
                onChange={(e) => setForm(p => ({ ...p, notas_montaje: e.target.value }))}
                placeholder="Ej: Requiere colgadores especiales, debe estar en vitrina, necesita base de mármol, etc."
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: `1px solid ${COLORS.creamDark}`,
                  borderRadius: '10px',
                  fontFamily: FONTS.body,
                  fontSize: '14px',
                  background: 'white',
                  color: COLORS.black,
                  outline: 'none',
                  resize: 'vertical',
                  minHeight: '80px',
                }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button type="button" onClick={handleClose} style={{ flex: 1, padding: '14px', background: 'transparent', border: `2px solid ${COLORS.gray}`, borderRadius: '12px', fontFamily: FONTS.body, fontWeight: 600, color: COLORS.gray, cursor: 'pointer' }}>Cancelar</button>
            <button type="submit" style={{ flex: 1, padding: '14px', background: COLORS.red, border: 'none', borderRadius: '12px', fontFamily: FONTS.body, fontWeight: 600, color: COLORS.cream, cursor: 'pointer' }}>Guardar</button>
          </div>
        </form>
      </div>
      </div>
    </>
  )

  return createPortal(modalContent, document.body)
}

// Componente de precio con calculadora de comisiones
function PrecioCalculadora({ value, onChange }) {

  // Formatear número con comas (sin decimales para el input)
  const formatInputNumber = (num) => {
    if (!num) return ''
    return Number(num).toLocaleString('es-MX', { maximumFractionDigits: 0 })
  }

  // Formatear número con decimales (para los cálculos)
  const formatNumber = (num) => {
    if (!num) return ''
    return Number(num).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  // Parsear número quitando todo excepto dígitos
  const parseNumber = (str) => {
    if (!str) return ''
    return str.replace(/[^0-9]/g, '')
  }

  // Calcular desglose (75% artista, 25% comisión)
  const gananciaArtista = Number(value) || 0
  const precioPublico = gananciaArtista > 0 ? gananciaArtista / 0.75 : 0
  const comisionArtefacto = precioPublico - gananciaArtista
  const precioSugerido = Math.ceil(precioPublico / 500) * 500

  return (
    <div>
      <label style={{
        display: 'block',
        fontFamily: FONTS.body,
        fontSize: '13px',
        fontWeight: 600,
        color: COLORS.black,
        marginBottom: '6px'
      }}>
        Tu Precio (lo que recibirás) *
      </label>
      <div style={{ position: 'relative' }}>
        <span style={{
          position: 'absolute',
          left: '14px',
          top: '50%',
          transform: 'translateY(-50%)',
          fontFamily: FONTS.body,
          fontSize: '14px',
          color: COLORS.gray
        }}>$</span>
        <input
          type="text"
          inputMode="numeric"
          value={value ? formatInputNumber(value) : ''}
          onChange={(e) => {
            const rawValue = parseNumber(e.target.value)
            onChange(rawValue)
          }}
          placeholder="10,000"
          required
          style={{
            width: '100%',
            padding: '12px 14px 12px 28px',
            border: `1px solid ${COLORS.creamDark}`,
            borderRadius: '10px',
            fontFamily: FONTS.body,
            fontSize: '14px',
            background: 'white',
            color: COLORS.black,
            outline: 'none',
          }}
        />
      </div>

      {/* Mini calculadora - solo visible si hay precio */}
      {gananciaArtista > 0 && (
        <div style={{ marginTop: '14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${COLORS.creamDark}` }}>
              <span style={{ fontFamily: FONTS.body, fontSize: '12px', color: COLORS.gray }}>
                Tu ganancia (75%)
              </span>
              <span style={{ fontFamily: FONTS.body, fontSize: '12px', fontWeight: 600, color: COLORS.black }}>
                ${formatNumber(gananciaArtista)}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${COLORS.creamDark}` }}>
              <span style={{ fontFamily: FONTS.body, fontSize: '12px', color: COLORS.gray }}>
                Comisión Artefacto (25%)
              </span>
              <span style={{ fontFamily: FONTS.body, fontSize: '12px', color: COLORS.black }}>
                ${formatNumber(comisionArtefacto)}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${COLORS.creamDark}` }}>
              <span style={{ fontFamily: FONTS.body, fontSize: '12px', color: COLORS.gray }}>
                Precio al público
              </span>
              <span style={{ fontFamily: FONTS.body, fontSize: '12px', color: COLORS.black }}>
                ${formatNumber(precioPublico)}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
              <span style={{ fontFamily: FONTS.body, fontSize: '13px', fontWeight: 600, color: COLORS.black, display: 'flex', alignItems: 'center', gap: '6px' }}>
                Precio sugerido (redondeado)
                <TooltipIcon text="El precio sugerido redondea el precio público a la centena más cercana para mayor claridad" />
              </span>
              <span style={{ fontFamily: FONTS.body, fontSize: '15px', fontWeight: 700, color: COLORS.red }}>
                ${formatNumber(precioSugerido)}
              </span>
            </div>
          </div>

          {/* Notas al pie */}
          <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: `1px solid ${COLORS.creamDark}` }}>
            <p style={{ fontFamily: FONTS.body, fontSize: '10px', color: COLORS.gray, margin: 0, lineHeight: 1.4 }}>
              *Montos sin IVA
            </p>
            <p style={{ fontFamily: FONTS.body, fontSize: '10px', color: COLORS.gray, margin: '2px 0 0', lineHeight: 1.4 }}>
              *Otras comisiones pueden aplicarse dependiendo del método de pago del comprador.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function TooltipIcon({ text }) {
  const [show, setShow] = useState(false)

  return (
    <span
      style={{ position: 'relative', display: 'inline-flex', cursor: 'help' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <Info size={14} color={COLORS.gray} />
      {show && (
        <span style={{
          position: 'absolute',
          top: '50%',
          left: '100%',
          transform: 'translateY(-50%)',
          marginLeft: '8px',
          padding: '10px 14px',
          background: COLORS.black,
          color: COLORS.cream,
          fontFamily: FONTS.body,
          fontSize: '11px',
          fontWeight: 400,
          borderRadius: '8px',
          width: '200px',
          lineHeight: 1.4,
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        }}>
          {text}
          {/* Flecha apuntando a la izquierda */}
          <span style={{
            position: 'absolute',
            top: '50%',
            right: '100%',
            transform: 'translateY(-50%)',
            borderWidth: '5px',
            borderStyle: 'solid',
            borderColor: `transparent ${COLORS.black} transparent transparent`,
          }} />
        </span>
      )}
    </span>
  )
}

function Field({ label, value, onChange, type = 'text', required }) {
  return (
    <div>
      <label style={{ display: 'block', fontFamily: FONTS.body, fontSize: '13px', fontWeight: 600, color: COLORS.black, marginBottom: '6px' }}>{label}</label>
      <input type={type} value={value} onChange={onChange} required={required} style={{
        width: '100%', padding: '12px 14px', border: `1px solid ${COLORS.creamDark}`, borderRadius: '10px',
        fontFamily: FONTS.body, fontSize: '14px', background: 'white', color: COLORS.black, outline: 'none',
      }} />
    </div>
  )
}

const InstructionsModal = forwardRef(function InstructionsModal({ onClose }, ref) {
  const contentRef = useRef(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  useLayoutEffect(() => {
    if (contentRef.current && mounted) {
      gsap.fromTo(contentRef.current,
        { opacity: 0, scale: 0.85, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'back.out(1.4)' }
      )
    }
  }, [mounted])

  const steps = [
    {
      icon: Layers,
      title: 'Elige tu Formato',
      description: 'Selecciona si trabajas con formatos 2D (pintura, fotografía), 3D (escultura, cerámica) u otros'
    },
    {
      icon: Box,
      title: 'Selecciona un Paquete',
      description: 'Elige el paquete que mejor se adapte al tamaño de tu obra. Cada paquete tiene metros lineales o cuadrados específicos'
    },
    {
      icon: Plus,
      title: 'Agrega tus Obras',
      description: 'Haz clic en "Mis Obras" para subir imágenes (hasta 100MB cada una). Se comprimen automáticamente preservando alta calidad. PNG con transparencia → PNG, otros formatos → JPEG'
    },
    {
      icon: Edit2,
      title: 'Completa la Ficha Técnica',
      description: 'Para cada obra, ingresa título, medidas, técnica, año y precio. Esta información es obligatoria'
    },
    {
      icon: Move,
      title: 'Diseña tu Lienzo',
      description: 'Arrastra tus obras desde "Mis Obras" al canvas. Organízalas como quieras que se vean en el mural'
    },
    {
      icon: Save,
      title: 'Guarda tu Diseño',
      description: 'Una vez que estés satisfecho con tu lienzo, haz clic en "Guardar y Continuar"'
    },
    {
      icon: Frame,
      title: 'Dimensiones Importantes',
      description: 'Asegúrate de incluir el marco o base en las medidas si tu obra lo requiere'
    },
    {
      icon: Boxes,
      title: 'Múltiples Obras',
      description: 'Puedes incluir varias obras en un mismo paquete si el espacio lo permite. El sistema te avisará si excedes el límite'
    }
  ]

  if (!mounted) return null

  const handleClose = () => {
    gsap.to(contentRef.current, {
      opacity: 0, scale: 0.9, duration: 0.2,
      onComplete: () => {
        document.body.style.overflow = ''
        onClose()
      }
    })
  }

  const modalContent = (
    <>
      {/* Overlay fijo que cubre toda la pantalla */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(20, 18, 16, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          zIndex: 99998,
        }}
      />
      {/* Contenedor del modal */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '24px',
          overflowY: 'auto',
        }}
      >
        <div
          ref={(el) => {
            contentRef.current = el
            if (ref) ref.current = el
          }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: COLORS.cream,
            borderRadius: '24px',
            maxWidth: '520px',
            width: '100%',
            maxHeight: 'calc(100vh - 48px)',
            overflow: 'auto',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
          }}
        >
        {/* Header */}
        <div style={{
          padding: '32px 32px 24px',
          textAlign: 'center',
          borderBottom: `1px solid ${COLORS.creamDark}`,
        }}>
          <h2 style={{
            fontFamily: FONTS.display,
            fontWeight: 600,
            fontStyle: 'italic',
            fontSize: '26px',
            color: COLORS.black,
            margin: '0 0 8px',
            letterSpacing: '0.02em',
          }}>
            Tu Lienzo Digital
          </h2>
          <p style={{
            fontFamily: FONTS.body,
            fontSize: '14px',
            color: COLORS.gray,
            margin: 0,
            lineHeight: 1.5,
          }}>
            Sigue estos pasos para crear tu espacio en el mural de Artefacto
          </p>
        </div>

        {/* Steps */}
        <div style={{ padding: '24px 32px' }}>
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  gap: '14px',
                  alignItems: 'flex-start',
                  padding: '14px 0',
                  borderBottom: index < steps.length - 1 ? `1px solid ${COLORS.creamDark}` : 'none',
                }}
              >
                <Icon size={20} color={COLORS.red} style={{ flexShrink: 0, marginTop: 2 }} />
                <div style={{ flex: 1 }}>
                  <h4 style={{
                    fontFamily: FONTS.body,
                    fontWeight: 700,
                    fontSize: '14px',
                    color: COLORS.black,
                    margin: '0 0 4px',
                  }}>
                    {step.title}
                  </h4>
                  <p style={{
                    fontFamily: FONTS.body,
                    fontSize: '13px',
                    color: COLORS.gray,
                    margin: 0,
                    lineHeight: 1.5,
                    whiteSpace: 'pre-line',
                  }}>
                    {step.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div style={{
          padding: '20px 32px 28px',
          borderTop: `1px solid ${COLORS.creamDark}`,
        }}>
          <button
            onClick={handleClose}
            style={{
              width: '100%',
              padding: '16px 24px',
              background: COLORS.black,
              border: 'none',
              borderRadius: '14px',
              color: COLORS.cream,
              fontFamily: FONTS.body,
              fontWeight: 700,
              fontSize: '15px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.25)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <MousePointer2 size={18} />
            ¡Entendido!
          </button>
        </div>
        </div>
      </div>
    </>
  )

  return createPortal(modalContent, document.body)
})
