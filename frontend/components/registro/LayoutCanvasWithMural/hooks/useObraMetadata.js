/**
 * Hook para gestión de metadata de obras
 */

import { useState, useCallback } from 'react'
import { compressImage } from '@/lib/imageCompression'
import { IMAGE_COMPRESSION_CONFIG, MAX_FILE_SIZE } from '../constants/canvas.constants'
import { filterValidFiles } from '../utils/validation.utils'
import { calcularDimensionesObra } from '../utils/scaling.utils'

/**
 * Hook que maneja la gestión de obras y su metadata
 * @param {Array} initialPortfolioImages - Imágenes iniciales del portfolio
 * @param {boolean} es3D - Si el paquete es 3D
 * @returns {Object} - Estado y funciones para manejar obras
 */
export function useObraMetadata(initialPortfolioImages = [], es3D = false) {
  const [todasLasObras, setTodasLasObras] = useState(initialPortfolioImages)
  const [editingObra, setEditingObra] = useState(null)
  const [showMetadataForm, setShowMetadataForm] = useState(false)

  /**
   * Agrega nuevas obras desde archivos
   */
  const handleAddNewObra = useCallback(async (files) => {
    const filesArray = Array.from(files)

    // Validar archivos
    const { validFiles, errors } = filterValidFiles(filesArray, MAX_FILE_SIZE)

    if (errors.length > 0) {
      errors.forEach(error => alert(error))
    }

    if (validFiles.length === 0) return

    // Comprimir imágenes
    const compressedObras = []
    for (const file of validFiles) {
      try {
        console.log(`Comprimiendo obra: ${file.name}...`)
        const compressedFile = await compressImage(file, IMAGE_COMPRESSION_CONFIG)

        compressedObras.push({
          id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          file: compressedFile,
          preview: URL.createObjectURL(compressedFile),
          titulo: '',
          alto_cm: '',
          ancho_cm: '',
          largo_cm: '', // Para 3D
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

    setTodasLasObras(prev => [...prev, ...compressedObras])

    // Si solo se agregó una obra, abrir modal de metadata
    if (compressedObras.length === 1) {
      setEditingObra(compressedObras[0])
      setShowMetadataForm(true)
    }

    return compressedObras
  }, [])

  /**
   * Actualiza un campo de metadata de una obra
   */
  const updateObraMetadata = useCallback((obraId, field, value) => {
    setTodasLasObras(prev =>
      prev.map(obra =>
        obra.id === obraId ? { ...obra, [field]: value } : obra
      )
    )

    setEditingObra(prev => {
      if (prev?.id === obraId) {
        return { ...prev, [field]: value }
      }
      return prev
    })
  }, [])

  /**
   * Elimina una obra
   */
  const deleteObra = useCallback((obraId) => {
    setTodasLasObras(prev => {
      const obra = prev.find(o => o.id === obraId)
      if (obra?.preview?.startsWith('blob:')) {
        URL.revokeObjectURL(obra.preview)
      }
      return prev.filter(o => o.id !== obraId)
    })

    setEditingObra(prev => {
      if (prev?.id === obraId) {
        setShowMetadataForm(false)
        return null
      }
      return prev
    })
  }, [])

  /**
   * Abre el modal de edición de metadata
   */
  const openMetadataForm = useCallback((obra) => {
    setEditingObra(obra)
    setShowMetadataForm(true)
  }, [])

  /**
   * Cierra el modal de metadata
   */
  const closeMetadataForm = useCallback(() => {
    setShowMetadataForm(false)
    setEditingObra(null)
  }, [])

  /**
   * Verifica si una obra tiene metadata completa
   */
  const hasCompleteMetadata = useCallback((obra) => {
    if (es3D) {
      return !!(
        obra.titulo &&
        obra.largo_cm &&
        obra.ancho_cm &&
        obra.alto_cm &&
        obra.tecnica &&
        obra.anio &&
        obra.precio_mxn
      )
    } else {
      return !!(
        obra.titulo &&
        obra.alto_cm &&
        obra.ancho_cm &&
        obra.tecnica &&
        obra.anio &&
        obra.precio_mxn
      )
    }
  }, [es3D])

  /**
   * Calcula las dimensiones en píxeles de una obra
   */
  const getObraDimensions = useCallback((obra) => {
    return calcularDimensionesObra(obra, es3D)
  }, [es3D])

  return {
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
  }
}
