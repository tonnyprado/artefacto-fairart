'use client'

import { useState, useEffect } from 'react'
import { useArtistasStore } from '@/stores/artistasStore'
import { useFasesStore } from '@/stores/fasesStore'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import ExcelJS from 'exceljs'
import { Download, Mail, MessageCircle, Phone, X, UserPlus, Plus } from 'lucide-react'
import AdminArtistasPorFase from './AdminArtistasPorFase'
import ArtistasInscritos from './ArtistasInscritos'

// Sub-tabs para diferentes vistas
const SUB_TABS = [
  { id: 'lista', label: 'Lista Completa', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
  { id: 'por-fase', label: 'Por Fase', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  { id: 'aceptados', label: 'Aceptados', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' }
]

/**
 * ArtistasTable - Tabla de gestión de artistas
 *
 * Features:
 * - Listado de artistas con información clave
 * - Filtros por estado y categoría
 * - Búsqueda por nombre/email
 * - Ver detalles
 * - Cambiar estado (aprobar/rechazar)
 * - Eliminar artista
 *
 * DB: artistas table
 * API: GET /api/artistas
 */

const ESTADO_COLORS = {
  pendiente: 'warning',
  aprobado: 'success',
  rechazado: 'error'
}

// Formatos de trabajo reales (sincronizados con Step5Paquetes)
const FORMATOS_2D = [
  { value: 'pintura', label: 'Pintura (técnicas húmedas)' },
  { value: 'dibujo', label: 'Dibujo (técnicas secas)' },
  { value: 'grafica', label: 'Gráfica' },
  { value: 'fotografia', label: 'Fotografía' },
  { value: 'collage_mixta', label: 'Collage & Mixta' },
  { value: 'textil', label: 'Textil' },
  { value: 'otro_2d', label: 'Otro (2D)' },
]

const FORMATOS_3D = [
  { value: 'escultura', label: 'Escultura' },
  { value: 'ceramica', label: 'Cerámica' },
  { value: 'textil_3d', label: 'Textil (3D)' },
  { value: 'otro_3d', label: 'Otro (3D)' },
]

// Todas las categorías combinadas para búsquedas de labels
const CATEGORIAS = [
  ...FORMATOS_2D,
  ...FORMATOS_3D,
  { value: 'otro', label: 'Otro' },
  { value: 'otro_general', label: 'Otro' },
]

// Helper para mostrar el formato/categoría del artista
const getFormatoDisplay = (artista) => {
  // Si eligió tipo OTRO o tiene formato_otro_texto
  if (artista.formato_tipo === 'OTRO' && artista.formato_otro_texto) {
    return artista.formato_otro_texto
  }

  // Si tiene array de formatos, mostrar los labels
  if (artista.formatos && Array.isArray(artista.formatos) && artista.formatos.length > 0) {
    const labels = artista.formatos.map(f => {
      // Si es "otro_2d" o "otro_3d" y hay texto personalizado, usar ese
      if ((f === 'otro_2d' || f === 'otro_3d' || f === 'otro_general') && artista.formato_otro_texto) {
        return artista.formato_otro_texto
      }
      const found = CATEGORIAS.find(c => c.value === f)
      return found ? found.label : f.replace(/_/g, ' ')
    })
    // Eliminar duplicados
    return [...new Set(labels)].join(', ')
  }

  // Si tiene formato_otro_texto sin formatos array (caso legacy o directo)
  if (artista.formato_otro_texto) {
    return artista.formato_otro_texto
  }

  // Fallback a categoria legacy
  if (artista.categoria) {
    // Si categoria es "otro" y hay texto personalizado
    if ((artista.categoria === 'otro' || artista.categoria === 'otro_general') && artista.formato_otro_texto) {
      return artista.formato_otro_texto
    }
    const found = CATEGORIAS.find(c => c.value === artista.categoria)
    return found ? found.label : artista.categoria.replace(/_/g, ' ')
  }

  return 'Sin categoría'
}

export default function ArtistasTable() {
  const { artistas, fetchArtistas, deleteArtista, cambiarEstadoArtista } = useArtistasStore()
  const { fases, fetchFases, inscribirArtistas } = useFasesStore()

  // Estado para sub-tabs
  const [activeView, setActiveView] = useState('lista')

  const [searchTerm, setSearchTerm] = useState('')
  const [estadoFilter, setEstadoFilter] = useState('all')
  const [categoriaFilter, setCategoriaFilter] = useState('all')
  const [faseFilter, setFaseFilter] = useState('all')
  const [selectedArtista, setSelectedArtista] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showEstadoModal, setShowEstadoModal] = useState(false)
  const [nuevoEstado, setNuevoEstado] = useState('')
  const [notasEstado, setNotasEstado] = useState('')
  // Estado para modal de visualización de documentos/imágenes
  const [viewerModal, setViewerModal] = useState({ open: false, url: '', type: '', title: '' })
  // Estado para modal de obra individual
  const [obraModal, setObraModal] = useState({ open: false, obra: null })
  // Estado para modal de mensaje
  const [mensajeModal, setMensajeModal] = useState({ open: false, artista: null })
  const [mensajeForm, setMensajeForm] = useState({ asunto: '', mensaje: '' })
  // Estado para modal de foto de perfil ampliada
  const [fotoPerfilModal, setFotoPerfilModal] = useState({ open: false, url: '', nombre: '' })
  // Estado para modal de inscripción a fase
  const [inscripcionModal, setInscripcionModal] = useState({ open: false, artista: null })
  const [selectedFaseId, setSelectedFaseId] = useState('')
  const [inscribiendoArtista, setInscribiendoArtista] = useState(false)
  // Estado para modal de añadir artista
  const [showAddModal, setShowAddModal] = useState(false)
  // Estado para modal de exportación
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportFaseSeleccionada, setExportFaseSeleccionada] = useState('all')
  const [creandoArtista, setCreandoArtista] = useState(false)
  const [nuevoArtistaForm, setNuevoArtistaForm] = useState({
    nombre: '',
    apellido: '',
    nombre_artistico: '',
    email: '',
    telefono: '',
    fecha_nacimiento: '',
    ciudad: '',
    pais: 'MX',
    categoria: '',
    formato_tipo: '2D',
    bio: '',
    instagram: '',
    website: '',
    notas_admin: ''
  })

  // Cargar artistas y fases al montar
  useEffect(() => {
    fetchArtistas()
    fetchFases()
  }, [])

  // Filtrar artistas
  const artistasFiltrados = artistas.filter(artista => {
    const matchesSearch =
      artista.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artista.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artista.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesEstado = estadoFilter === 'all' || artista.estado === estadoFilter
    const matchesCategoria = categoriaFilter === 'all' || artista.categoria === categoriaFilter
    const matchesFase = faseFilter === 'all' ||
      (artista.fase_inscripcion?.id?.toString() === faseFilter) ||
      (artista.fase_inscripcion_id?.toString() === faseFilter)

    return matchesSearch && matchesEstado && matchesCategoria && matchesFase
  })

  const handleVerDetalles = (artista) => {
    setSelectedArtista(artista)
    setShowDetailModal(true)
  }

  // Función para abrir el visor de documentos/imágenes
  const handleOpenViewer = (url, type, title) => {
    setViewerModal({ open: true, url, type, title })
  }

  // Determinar si una URL es una imagen o un PDF
  const getFileType = (url) => {
    if (!url) return 'unknown'
    const lowerUrl = url.toLowerCase()
    if (lowerUrl.includes('.pdf') || lowerUrl.includes('application/pdf')) {
      return 'pdf'
    }
    if (lowerUrl.match(/\.(jpg|jpeg|png|webp|gif)/i)) {
      return 'image'
    }
    return 'unknown'
  }

  // Auto-armar URLs de redes sociales cuando solo ponen username
  const formatSocialUrl = (key, value) => {
    if (!value) return null
    // Si ya es una URL completa, devolverla
    if (value.startsWith('http://') || value.startsWith('https://')) {
      return value
    }
    // Limpiar @ al inicio si existe
    const cleanValue = value.replace(/^@/, '')
    // Armar URL según la red social
    switch (key.toLowerCase()) {
      case 'instagram':
        return `https://instagram.com/${cleanValue}`
      case 'twitter':
      case 'x':
        return `https://x.com/${cleanValue}`
      case 'tiktok':
        return `https://tiktok.com/@${cleanValue}`
      case 'behance':
        return `https://behance.net/${cleanValue}`
      case 'linkedin':
        return `https://linkedin.com/in/${cleanValue}`
      default:
        // Para website/sitio_web, agregar https si no tiene protocolo
        if (key.includes('web') || key.includes('sitio')) {
          return value.includes('.') ? `https://${cleanValue}` : value
        }
        return value
    }
  }

  // Filtrar y normalizar redes sociales (quitar duplicados y Facebook)
  const getFilteredSocialNetworks = (redes) => {
    if (!redes) return []
    const filtered = {}
    const seen = new Set()

    Object.entries(redes).forEach(([key, value]) => {
      if (!value) return
      // Ignorar Facebook (no se pide)
      if (key.toLowerCase() === 'facebook') return
      // Normalizar website/sitio_web para evitar duplicados
      const normalizedKey = key.toLowerCase().includes('sitio') || key.toLowerCase().includes('website')
        ? 'website'
        : key.toLowerCase()
      // Solo agregar si no hemos visto esta red
      if (!seen.has(normalizedKey)) {
        seen.add(normalizedKey)
        filtered[normalizedKey] = formatSocialUrl(normalizedKey, value)
      }
    })

    return Object.entries(filtered)
  }

  // Abrir WhatsApp
  const handleWhatsApp = (telefono, nombre) => {
    if (!telefono) return
    const cleanPhone = telefono.replace(/\D/g, '')
    const message = encodeURIComponent(`Hola ${nombre}, te contactamos desde ARTEFACTO 2027.`)
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank')
  }

  // Abrir modal de mensaje
  const handleOpenMensaje = (artista) => {
    setMensajeModal({ open: true, artista })
    setMensajeForm({ asunto: `ARTEFACTO 2027 - ${artista.nombre} ${artista.apellido}`, mensaje: '' })
  }

  // Enviar email (abre cliente de correo)
  const handleEnviarEmail = () => {
    if (!mensajeModal.artista) return
    const mailto = `mailto:${mensajeModal.artista.email}?subject=${encodeURIComponent(mensajeForm.asunto)}&body=${encodeURIComponent(mensajeForm.mensaje)}`
    window.open(mailto)
    setMensajeModal({ open: false, artista: null })
  }

  // Abrir modal de inscripción a fase
  const handleOpenInscripcion = (artista) => {
    setInscripcionModal({ open: true, artista })
    setSelectedFaseId('')
  }

  // Inscribir artista a fase
  const handleInscribirAFase = async () => {
    if (!inscripcionModal.artista || !selectedFaseId) return

    setInscribiendoArtista(true)
    try {
      const result = await inscribirArtistas(parseInt(selectedFaseId), [inscripcionModal.artista.id])

      if (result.success) {
        alert(`Artista inscrito exitosamente a la fase seleccionada`)
        setInscripcionModal({ open: false, artista: null })
        setSelectedFaseId('')
        // Refrescar lista de artistas para ver el cambio
        fetchArtistas()
      } else {
        alert('Error al inscribir: ' + (result.error || 'Error desconocido'))
      }
    } catch (error) {
      console.error('Error al inscribir artista:', error)
      alert('Error al inscribir artista: ' + error.message)
    } finally {
      setInscribiendoArtista(false)
    }
  }

  // Manejar cambios en el formulario de nuevo artista
  const handleNuevoArtistaChange = (e) => {
    const { name, value } = e.target
    setNuevoArtistaForm(prev => ({ ...prev, [name]: value }))
  }

  // Crear nuevo artista
  const handleCrearArtista = async () => {
    // Validar campos requeridos
    if (!nuevoArtistaForm.nombre || !nuevoArtistaForm.apellido || !nuevoArtistaForm.email ||
        !nuevoArtistaForm.fecha_nacimiento || !nuevoArtistaForm.ciudad || !nuevoArtistaForm.pais) {
      alert('Por favor completa todos los campos requeridos: nombre, apellido, email, fecha de nacimiento, ciudad y país')
      return
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(nuevoArtistaForm.email)) {
      alert('Por favor ingresa un email válido')
      return
    }

    setCreandoArtista(true)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api'
      const token = localStorage.getItem('token')

      const response = await fetch(`${API_URL}/artistas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nombre: nuevoArtistaForm.nombre,
          apellido: nuevoArtistaForm.apellido,
          nombre_artistico: nuevoArtistaForm.nombre_artistico || null,
          email: nuevoArtistaForm.email,
          telefono: nuevoArtistaForm.telefono || null,
          fecha_nacimiento: nuevoArtistaForm.fecha_nacimiento,
          ciudad: nuevoArtistaForm.ciudad,
          pais: nuevoArtistaForm.pais,
          categoria: nuevoArtistaForm.categoria || nuevoArtistaForm.formato_tipo?.toLowerCase() || '2d',
          formato_tipo: nuevoArtistaForm.formato_tipo || '2D',
          bio: nuevoArtistaForm.bio || null,
          redes_sociales: {
            instagram: nuevoArtistaForm.instagram || null,
            website: nuevoArtistaForm.website || null
          },
          notas_admin: nuevoArtistaForm.notas_admin || null
        })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        alert('Artista creado exitosamente')
        setShowAddModal(false)
        // Limpiar formulario
        setNuevoArtistaForm({
          nombre: '',
          apellido: '',
          nombre_artistico: '',
          email: '',
          telefono: '',
          fecha_nacimiento: '',
          ciudad: '',
          pais: 'MX',
          categoria: '',
          formato_tipo: '2D',
          bio: '',
          instagram: '',
          website: '',
          notas_admin: ''
        })
        // Refrescar lista
        fetchArtistas()
      } else {
        alert('Error al crear artista: ' + (result.error || 'Error desconocido'))
      }
    } catch (error) {
      console.error('Error al crear artista:', error)
      alert('Error al crear artista: ' + error.message)
    } finally {
      setCreandoArtista(false)
    }
  }

  const handleCambiarEstado = (artista) => {
    setSelectedArtista(artista)
    setNuevoEstado(artista.estado)
    setNotasEstado(artista.notas_admin || '')
    setShowEstadoModal(true)
  }

  const handleGuardarEstado = async () => {
    if (!selectedArtista) return

    await cambiarEstadoArtista(selectedArtista.id, nuevoEstado, notasEstado)
    setShowEstadoModal(false)
    setSelectedArtista(null)
    setNotasEstado('')
  }

  const handleEliminar = async (artista) => {
    if (window.confirm(`¿Estás seguro de eliminar a ${artista.nombre} ${artista.apellido}?`)) {
      await deleteArtista(artista.id)
    }
  }

  const [exportando, setExportando] = useState(false)

  // Función para abrir modal de exportación
  const handleAbrirExportModal = () => {
    setExportFaseSeleccionada('all')
    setShowExportModal(true)
  }

  const handleExportarExcel = async () => {
    setExportando(true)
    setShowExportModal(false)

    try {
      // Llamar al endpoint de exportación con filtro de fase seleccionada en el modal
      const token = localStorage.getItem('token')
      const params = new URLSearchParams()
      if (exportFaseSeleccionada !== 'all') {
        params.append('fase_id', exportFaseSeleccionada)
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/artistas/export?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Error al obtener datos para exportación')
      }

      const { data: artistasCompletos } = await response.json()

      // Crear workbook con ExcelJS
      const workbook = new ExcelJS.Workbook()
      workbook.creator = 'ARTEFACTO'
      workbook.created = new Date()

      const faseInfo = exportFaseSeleccionada !== 'all'
        ? fases.find(f => f.id.toString() === exportFaseSeleccionada)
        : null

      // Estilos comunes
      const headerStyle = {
        font: { bold: true, size: 12, color: { argb: 'FFFFFFFF' } },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1a1a1a' } },
        alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        }
      }

      const cellStyle = {
        font: { size: 11 },
        alignment: { vertical: 'middle', wrapText: true },
        border: {
          top: { style: 'thin', color: { argb: 'FFcccccc' } },
          bottom: { style: 'thin', color: { argb: 'FFcccccc' } },
          left: { style: 'thin', color: { argb: 'FFcccccc' } },
          right: { style: 'thin', color: { argb: 'FFcccccc' } }
        }
      }

      // ========== HOJA 1: RESUMEN ==========
      const wsResumen = workbook.addWorksheet('Resumen', {
        properties: { tabColor: { argb: 'FF1a1a1a' } }
      })

      // Título principal
      wsResumen.mergeCells('A1:D1')
      const titleCell = wsResumen.getCell('A1')
      titleCell.value = 'ARTEFACTO - REPORTE DE ARTISTAS'
      titleCell.font = { bold: true, size: 24, color: { argb: 'FF1a1a1a' } }
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
      wsResumen.getRow(1).height = 40

      // Fecha y hora
      wsResumen.getCell('A3').value = 'Fecha de exportación:'
      wsResumen.getCell('B3').value = new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      wsResumen.getCell('A4').value = 'Hora:'
      wsResumen.getCell('B4').value = new Date().toLocaleTimeString('es-MX')

      // Sección Filtros
      wsResumen.mergeCells('A6:B6')
      const filtrosCell = wsResumen.getCell('A6')
      filtrosCell.value = 'FILTROS APLICADOS'
      filtrosCell.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } }
      filtrosCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF666666' } }
      filtrosCell.alignment = { horizontal: 'center' }

      wsResumen.getCell('A7').value = 'Fase:'
      wsResumen.getCell('B7').value = faseInfo ? faseInfo.nombre : 'Todas las fases'
      wsResumen.getCell('B7').font = { bold: true }

      // Sección Resumen
      wsResumen.mergeCells('A9:B9')
      const resumenCell = wsResumen.getCell('A9')
      resumenCell.value = 'RESUMEN DE DATOS'
      resumenCell.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } }
      resumenCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1a1a1a' } }
      resumenCell.alignment = { horizontal: 'center' }

      const stats = [
        ['Total de artistas:', artistasCompletos.length],
        ['Pendientes:', artistasCompletos.filter(a => a.estado === 'pendiente').length],
        ['Aprobados:', artistasCompletos.filter(a => a.estado === 'aprobado').length],
        ['Rechazados:', artistasCompletos.filter(a => a.estado === 'rechazado').length],
        ['Total de obras:', artistasCompletos.reduce((sum, a) => sum + (a.obras?.length || 0), 0)],
      ]

      stats.forEach((stat, idx) => {
        wsResumen.getCell(`A${10 + idx}`).value = stat[0]
        wsResumen.getCell(`B${10 + idx}`).value = stat[1]
        wsResumen.getCell(`B${10 + idx}`).font = { bold: true, size: 14 }
      })

      wsResumen.getColumn('A').width = 25
      wsResumen.getColumn('B').width = 40

      // ========== HOJA 2: ARTISTAS ==========
      const wsArtistas = workbook.addWorksheet('Artistas', {
        properties: { tabColor: { argb: 'FF2563eb' } }
      })

      // Headers de artistas (sin Dirección y Estado)
      const artistasHeaders = [
        '#', 'Folio', 'Nombre Completo', 'Nombre Artístico', 'Email', 'Teléfono',
        'Fecha Nac.', 'País', 'Ciudad', 'Categoría', 'Paquete', 'Tipo',
        'Dimensiones', 'Precio Base', 'Precio Fase I', 'Precio Fase II', 'Precio Fase III',
        'Máx. Obras', 'Fase Inscripción', 'Votos +', 'Votos -', 'Balance',
        'Fecha Registro', 'Instagram', 'Sitio Web', 'Cant. Obras', 'Notas Admin'
      ]

      const headerRow = wsArtistas.addRow(artistasHeaders)
      headerRow.height = 30
      headerRow.eachCell(cell => {
        cell.font = headerStyle.font
        cell.fill = headerStyle.fill
        cell.alignment = headerStyle.alignment
        cell.border = headerStyle.border
      })

      // Datos de artistas
      artistasCompletos.forEach((artista, idx) => {
        const row = wsArtistas.addRow([
          idx + 1,
          artista.folio || '',
          `${artista.nombre} ${artista.apellido}`,
          artista.nombre_artistico || '',
          artista.email,
          artista.telefono || '',
          artista.fecha_nacimiento ? new Date(artista.fecha_nacimiento).toLocaleDateString('es-MX') : '',
          artista.pais || '',
          artista.ciudad || '',
          getFormatoDisplay(artista),
          artista.paquete?.nombre || '',
          artista.paquete?.tipo || '',
          artista.paquete ? (artista.paquete.tipo === '3D' ? `${artista.paquete.metros_cuadrados} m²` : `${artista.paquete.metros_lineales}m × ${artista.paquete.altura_pared}m`) : '',
          artista.paquete?.precio ? `$${Number(artista.paquete.precio).toLocaleString('es-MX')}` : '',
          artista.paquete?.precio_fase1 ? `$${Number(artista.paquete.precio_fase1).toLocaleString('es-MX')}` : '',
          artista.paquete?.precio_fase2 ? `$${Number(artista.paquete.precio_fase2).toLocaleString('es-MX')}` : '',
          artista.paquete?.precio_fase3 ? `$${Number(artista.paquete.precio_fase3).toLocaleString('es-MX')}` : '',
          artista.paquete?.obras_maximas || '',
          artista.fase_inscripcion?.nombre || artista.fase_nombre || '',
          artista.total_votos_favor || artista.votos_favor || 0,
          artista.total_votos_contra || artista.votos_contra || 0,
          (artista.total_votos_favor || artista.votos_favor || 0) - (artista.total_votos_contra || artista.votos_contra || 0),
          artista.created_at ? new Date(artista.created_at).toLocaleDateString('es-MX') : '',
          artista.instagram || artista.redes_sociales?.instagram || '',
          artista.website || artista.redes_sociales?.sitio_web || '',
          artista.obras?.length || 0,
          artista.notas_admin || ''
        ])

        // Alternar colores de fila
        const bgColor = idx % 2 === 0 ? 'FFFFFFFF' : 'FFF8F8F8'
        row.eachCell(cell => {
          cell.font = cellStyle.font
          cell.alignment = cellStyle.alignment
          cell.border = cellStyle.border
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } }
        })
        row.height = 22
      })

      // Anchos de columnas para artistas
      const artistasWidths = [5, 14, 28, 20, 30, 14, 12, 12, 14, 22, 22, 8, 16, 14, 14, 14, 14, 10, 18, 10, 10, 10, 14, 22, 28, 12, 35]
      artistasWidths.forEach((width, idx) => {
        wsArtistas.getColumn(idx + 1).width = width
      })

      // Congelar primera fila
      wsArtistas.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }]

      // ========== HOJA 3: OBRAS ==========
      const wsObras = workbook.addWorksheet('Obras', {
        properties: { tabColor: { argb: 'FF16a34a' } }
      })

      const obrasHeaders = [
        'Folio Artista', 'Artista', 'Email', 'No.', 'Título de la Obra',
        'Precio MXN', 'Alto (cm)', 'Ancho (cm)', 'Largo (cm)', 'Tipo',
        'Técnica', 'Año', 'Notas de Montaje'
      ]

      const obrasHeaderRow = wsObras.addRow(obrasHeaders)
      obrasHeaderRow.height = 30
      obrasHeaderRow.eachCell(cell => {
        cell.font = headerStyle.font
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF16a34a' } }
        cell.alignment = headerStyle.alignment
        cell.border = headerStyle.border
      })

      let obraIdx = 0
      artistasCompletos.forEach(artista => {
        if (artista.obras && artista.obras.length > 0) {
          artista.obras.forEach((obra, index) => {
            const row = wsObras.addRow([
              artista.folio || '',
              `${artista.nombre} ${artista.apellido}`,
              artista.email,
              index + 1,
              obra.titulo || 'Sin título',
              obra.precio_mxn || obra.precio ? `$${Number(obra.precio_mxn || obra.precio).toLocaleString('es-MX')}` : '',
              obra.alto_cm || '',
              obra.ancho_cm || '',
              obra.largo_cm || '',
              obra.tipo_obra || '2D',
              obra.tecnica || '',
              obra.anio || '',
              obra.notas_montaje || ''
            ])

            const bgColor = obraIdx % 2 === 0 ? 'FFFFFFFF' : 'FFF0FDF4'
            row.eachCell(cell => {
              cell.font = cellStyle.font
              cell.alignment = cellStyle.alignment
              cell.border = cellStyle.border
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } }
            })
            row.height = 22
            obraIdx++
          })
        }
      })

      // Anchos de columnas para obras
      const obrasWidths = [14, 28, 28, 6, 35, 14, 10, 10, 10, 8, 20, 8, 35]
      obrasWidths.forEach((width, idx) => {
        wsObras.getColumn(idx + 1).width = width
      })

      wsObras.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }]

      // Generar nombre de archivo con fecha
      const fecha = new Date().toISOString().split('T')[0]
      const faseNombre = exportFaseSeleccionada !== 'all'
        ? fases.find(f => f.id.toString() === exportFaseSeleccionada)?.nombre?.replace(/\s+/g, '-')
        : 'todas-fases'
      const nombreArchivo = `ARTEFACTO-Artistas-${faseNombre}-${fecha}.xlsx`

      // Descargar archivo
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = nombreArchivo
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error al exportar:', error)
      alert('Error al exportar datos. Por favor intenta de nuevo.')
    } finally {
      setExportando(false)
    }
  }

  // Handler para ver detalles desde otros componentes
  const handleVerDetallesFromChild = (artista) => {
    setSelectedArtista(artista)
    setShowDetailModal(true)
  }

  return (
    <div className="space-y-4">
      {/* Sub-tabs de navegacion */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="flex border-b border-gray-200">
          {SUB_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2 ${
                activeView === tab.id
                  ? 'border-red-600 text-red-600 bg-red-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
              </svg>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Vista: Por Fase */}
      {activeView === 'por-fase' && (
        <AdminArtistasPorFase onVerDetalles={handleVerDetallesFromChild} />
      )}

      {/* Vista: Aceptados (pasaron votaciones) */}
      {activeView === 'aceptados' && (
        <ArtistasInscritos onVerDetalles={handleVerDetallesFromChild} />
      )}

      {/* Vista: Lista Completa (default) */}
      {activeView === 'lista' && (
        <>
      {/* Filtros y búsqueda */}
      <div className="bg-white p-4 rounded-2xl shadow space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Búsqueda */}
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* Filtro por estado */}
          <div>
            <select
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">Todos los estados</option>
              <option value="pendiente">Pendientes</option>
              <option value="aprobado">Aprobados</option>
              <option value="rechazado">Rechazados</option>
            </select>
          </div>

          {/* Filtro por categoría */}
          <div>
            <select
              value={categoriaFilter}
              onChange={(e) => setCategoriaFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">Todas las categorías</option>
              <optgroup label="2D">
                {FORMATOS_2D.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </optgroup>
              <optgroup label="3D">
                {FORMATOS_3D.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </optgroup>
              <option value="otro">Otro</option>
            </select>
          </div>

          {/* Filtro por fase */}
          <div>
            <select
              value={faseFilter}
              onChange={(e) => setFaseFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">Todas las fases</option>
              {fases.map(fase => (
                <option key={fase.id} value={fase.id.toString()}>
                  {fase.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Resumen y Botones */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Mostrando {artistasFiltrados.length} de {artistas.length} artistas</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              <Plus size={18} />
              Añadir Artista
            </button>
            <button
              onClick={handleAbrirExportModal}
              disabled={artistas.length === 0 || exportando}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
            >
              {exportando ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Exportando...
                </>
              ) : (
                <>
                  <Download size={18} />
                  Exportar a Excel
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Artista</TableHeader>
              <TableHeader>Email</TableHeader>
              <TableHeader>Categoría</TableHeader>
              <TableHeader>Paquete</TableHeader>
              <TableHeader>Fase Registro</TableHeader>
              <TableHeader>Estado</TableHeader>
              <TableHeader>Votos</TableHeader>
              <TableHeader>Fecha</TableHeader>
              <TableHeader>Acciones</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {artistasFiltrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-gray-500 py-8">
                  No se encontraron artistas
                </TableCell>
              </TableRow>
            ) : (
              artistasFiltrados.map(artista => (
                <TableRow key={artista.id}>
                  {/* Artista */}
                  <TableCell>
                    <div className="flex items-center">
                      <img
                        src={artista.foto}
                        alt={artista.nombre}
                        className="w-10 h-10 rounded-full object-cover mr-3"
                      />
                      <div>
                        <div className="font-medium text-gray-900">
                          {artista.nombre} {artista.apellido}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {artista.ciudad}, {artista.pais}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Email */}
                  <TableCell className="text-gray-600">
                    {artista.email}
                  </TableCell>

                  {/* Categoría/Formato */}
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {artista.formato_tipo && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          artista.formato_tipo === '3D' ? 'bg-purple-100 text-purple-700' :
                          artista.formato_tipo === '2D' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {artista.formato_tipo}
                        </span>
                      )}
                      <Badge variant="info">
                        {getFormatoDisplay(artista)}
                      </Badge>
                    </div>
                  </TableCell>

                  {/* Paquete */}
                  <TableCell>
                    {artista.paquete ? (
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {artista.paquete.nombre}
                        </div>
                        <div className="text-xs text-gray-500">
                          {artista.paquete.tipo === '3D' ? (
                            `${artista.paquete.metros_cuadrados}m² (3D)`
                          ) : (
                            `${artista.paquete.metros_lineales}m × ${artista.paquete.altura_pared}m (2D)`
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">Sin paquete</span>
                    )}
                  </TableCell>

                  {/* Fase Registro */}
                  <TableCell>
                    {artista.fase_inscripcion ? (
                      <Badge variant="purple">
                        {artista.fase_inscripcion.nombre}
                      </Badge>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </TableCell>

                  {/* Estado */}
                  <TableCell>
                    <Badge variant={ESTADO_COLORS[artista.estado]}>
                      {artista.estado}
                    </Badge>
                  </TableCell>

                  {/* Votos */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-green-600 font-medium">
                        {artista.total_votos_favor}
                      </span>
                      <span className="text-gray-400">/</span>
                      <span className="text-red-600 font-medium">
                        {artista.total_votos_contra}
                      </span>
                    </div>
                  </TableCell>

                  {/* Fecha */}
                  <TableCell className="text-gray-600 text-xs">
                    {new Date(artista.created_at).toLocaleDateString('es-MX')}
                  </TableCell>

                  {/* Acciones */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleVerDetalles(artista)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="Ver detalles"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>

                      <button
                        onClick={() => handleOpenInscripcion(artista)}
                        className="text-purple-600 hover:text-purple-800 transition-colors"
                        title="Inscribir a Fase"
                      >
                        <UserPlus size={20} />
                      </button>

                      <button
                        onClick={() => handleCambiarEstado(artista)}
                        className="text-yellow-600 hover:text-yellow-800 transition-colors"
                        title="Cambiar estado"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>

                      <button
                        onClick={() => handleEliminar(artista)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Eliminar"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
        </>
      )}

      {/* Modal de detalles */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={selectedArtista ? `${selectedArtista.nombre} ${selectedArtista.apellido}` : ''}
        size="lg"
      >
        {selectedArtista && (
          <div className="space-y-6">
            {/* Foto, datos básicos, biografía y redes sociales */}
            <div className="flex items-start gap-6">
              {/* Columna izquierda: Foto */}
              <div
                className="relative group cursor-pointer flex-shrink-0"
                onClick={() => setFotoPerfilModal({
                  open: true,
                  url: selectedArtista.foto,
                  nombre: `${selectedArtista.nombre} ${selectedArtista.apellido}`
                })}
              >
                <img
                  src={selectedArtista.foto}
                  alt={selectedArtista.nombre}
                  className="w-32 h-32 rounded-lg object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
                <p className="text-[10px] text-gray-400 text-center mt-1">Click para ampliar</p>
              </div>

              {/* Columna derecha: Datos básicos */}
              <div className="flex-1 space-y-2">
                {selectedArtista.nombre_artistico && (
                  <div>
                    <span className="text-sm text-gray-500">Nombre Artístico:</span>
                    <p className="font-medium">{selectedArtista.nombre_artistico}</p>
                  </div>
                )}
                <div>
                  <span className="text-sm text-gray-500">Email:</span>
                  <p className="font-medium">{selectedArtista.email}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Teléfono:</span>
                  <p className="font-medium">{selectedArtista.telefono}</p>
                </div>
                {selectedArtista.fecha_nacimiento && (
                  <div>
                    <span className="text-sm text-gray-500">Fecha de Nacimiento:</span>
                    <p className="font-medium">
                      {new Date(selectedArtista.fecha_nacimiento).toLocaleDateString('es-MX', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}
                <div>
                  <span className="text-sm text-gray-500">Ubicación:</span>
                  <p className="font-medium">{selectedArtista.ciudad}, {selectedArtista.pais}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Formato de trabajo:</span>
                  <div className="flex items-center gap-2 mt-1">
                    {selectedArtista.formato_tipo && (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        selectedArtista.formato_tipo === '3D' ? 'bg-purple-100 text-purple-700' :
                        selectedArtista.formato_tipo === '2D' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {selectedArtista.formato_tipo}
                      </span>
                    )}
                    <p className="font-medium">{getFormatoDisplay(selectedArtista)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Semblanza */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Semblanza</h4>
              <p className="text-gray-700 text-sm">{selectedArtista.bio}</p>
            </div>

            {/* Redes sociales */}
            {selectedArtista.redes_sociales && Object.keys(selectedArtista.redes_sociales).length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Redes Sociales</h4>
                <div className="flex flex-wrap gap-3">
                  {getFilteredSocialNetworks(selectedArtista.redes_sociales).map(([key, url]) => (
                    <a
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 hover:text-gray-900 transition-colors"
                    >
                      {key === 'instagram' && <span className="text-pink-500">@</span>}
                      {key === 'website' && <span className="text-blue-500">~</span>}
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Botones de contacto */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => handleOpenMensaje(selectedArtista)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <Mail size={16} />
                Enviar Mensaje
              </button>
              {selectedArtista.telefono && (
                <button
                  onClick={() => handleWhatsApp(selectedArtista.telefono, selectedArtista.nombre)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  <MessageCircle size={16} />
                  WhatsApp
                </button>
              )}
            </div>

            {/* Documentos */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Documentos</h4>
              <div className="grid grid-cols-2 gap-2">
                {selectedArtista.documentos && Object.entries(selectedArtista.documentos).filter(([key, value]) => value && key !== 'portfolio_images').map(([key, value]) => {
                  const fileType = key.includes('cv') || key.includes('portfolio') || key.includes('identificacion') ? 'pdf' : getFileType(value)
                  const displayName = key.replace(/_url$/i, '').replace(/_/g, ' ').toUpperCase()

                  return (
                    <div key={key} className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenViewer(value, fileType, displayName)}
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Ver {displayName}
                      </button>
                      <a
                        href={value}
                        download
                        className="text-gray-500 hover:text-gray-700"
                        title="Descargar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </a>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Paquete y Lienzo */}
            {selectedArtista.paquete && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Paquete Seleccionado</h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-500">Paquete:</span>
                    <p className="font-medium">{selectedArtista.paquete.nombre}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Tipo:</span>
                    <p className="font-medium">{selectedArtista.paquete.tipo}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Dimensiones:</span>
                    <p className="font-medium">
                      {selectedArtista.paquete.tipo === '3D' ? (
                        `${selectedArtista.paquete.metros_cuadrados}m² (base)`
                      ) : (
                        `${selectedArtista.paquete.metros_lineales}m × ${selectedArtista.paquete.altura_pared}m (pared)`
                      )}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Precio:</span>
                    <p className="font-medium">${selectedArtista.paquete.precio_mxn.toLocaleString('es-MX')} MXN</p>
                  </div>
                </div>
              </div>
            )}

            {/* Lienzo del Artista */}
            {selectedArtista.layout_canvas_url && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Lienzo de Diseño</h4>
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-4">
                    {/* Botón ver imagen */}
                    <button
                      onClick={() => handleOpenViewer(selectedArtista.layout_canvas_url, 'image', 'Lienzo del Artista')}
                      className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Ver Imagen
                    </button>

                    {/* Botón ver PDF (si está disponible) */}
                    {selectedArtista.layout_canvas_data?.pdf_url && (
                      <button
                        onClick={() => handleOpenViewer(selectedArtista.layout_canvas_data.pdf_url, 'pdf', 'Lienzo PDF')}
                        className="inline-flex items-center gap-2 text-sm text-purple-600 hover:underline"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        Ver PDF Completo
                      </button>
                    )}

                    {/* Botón descargar */}
                    <a
                      href={selectedArtista.layout_canvas_data?.pdf_url || selectedArtista.layout_canvas_url}
                      download
                      className="inline-flex items-center gap-2 text-sm text-gray-600 hover:underline"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Descargar
                    </a>
                  </div>

                  {/* Preview de la imagen del lienzo */}
                  <div
                    className="mt-2 cursor-pointer"
                    onClick={() => handleOpenViewer(selectedArtista.layout_canvas_url, 'image', 'Lienzo del Artista')}
                  >
                    <img
                      src={selectedArtista.layout_canvas_url}
                      alt="Layout del lienzo"
                      className="w-full rounded-lg border-2 border-gray-200 hover:border-purple-400 transition-colors"
                      style={{ maxHeight: '300px', objectFit: 'contain' }}
                    />
                    <p className="text-xs text-gray-500 text-center mt-1">Click para ampliar</p>
                  </div>
                </div>
              </div>
            )}

            {/* Obras del Lienzo - Clickeables */}
            {selectedArtista.layout_canvas_data && selectedArtista.layout_canvas_data.obras && selectedArtista.layout_canvas_data.obras.length > 0 && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                  Obras para Exhibición ({selectedArtista.layout_canvas_data.obras.length})
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {selectedArtista.layout_canvas_data.obras.map((obra, index) => (
                    <div
                      key={index}
                      onClick={() => setObraModal({ open: true, obra })}
                      className="bg-white p-3 rounded-lg border border-gray-200 hover:border-green-400 hover:shadow-md transition-all cursor-pointer group"
                    >
                      {obra.preview && (
                        <div className="aspect-square rounded-lg overflow-hidden mb-2 bg-gray-100 relative">
                          <img
                            src={obra.preview}
                            alt={obra.titulo}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          {obra.tipo_obra && (
                            <span className={`absolute top-1 right-1 px-1.5 py-0.5 text-[10px] font-semibold rounded ${
                              obra.tipo_obra === '3D' ? 'bg-purple-600 text-white' : 'bg-blue-600 text-white'
                            }`}>
                              {obra.tipo_obra}
                            </span>
                          )}
                          {/* Botón de descarga rápida */}
                          <a
                            href={obra.preview}
                            download={`obra-${(obra.titulo || `obra-${index + 1}`).replace(/\s+/g, '-').toLowerCase()}.jpg`}
                            onClick={(e) => e.stopPropagation()}
                            className="absolute bottom-1 right-1 p-1.5 bg-black/60 hover:bg-black/80 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Descargar imagen"
                          >
                            <Download size={14} />
                          </a>
                        </div>
                      )}
                      <p className="font-medium text-gray-900 text-sm truncate">{obra.titulo || `Obra ${index + 1}`}</p>
                      <p className="text-xs text-gray-500">
                        {obra.ancho_cm} × {obra.alto_cm}{obra.largo_cm ? ` × ${obra.largo_cm}` : ''} cm
                      </p>
                      {obra.tecnica && (
                        <p className="text-xs text-gray-400 truncate">{obra.tecnica}</p>
                      )}
                      <p className="text-xs text-green-600 font-medium mt-1">${obra.precio_mxn?.toLocaleString('es-MX')} MXN</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fase de Inscripción */}
            {selectedArtista.fase_inscripcion && (
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Fase de Inscripción</h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-500">Fase:</span>
                    <p className="font-medium">{selectedArtista.fase_inscripcion.nombre}</p>
                  </div>
                  {selectedArtista.fase_inscripcion.descripcion && (
                    <div>
                      <span className="text-sm text-gray-500">Descripción:</span>
                      <p className="text-sm text-gray-700">{selectedArtista.fase_inscripcion.descripcion}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div>
                      <span className="text-gray-500">Inscripciones:</span> {selectedArtista.fase_inscripcion.inscripciones_abiertas ? 'Abiertas' : 'Cerradas'}
                    </div>
                    <div>
                      <span className="text-gray-500">Votaciones:</span> {selectedArtista.fase_inscripcion.votacion_abierta ? 'Abiertas' : 'Cerradas'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Estado y notas */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Estado:</span>
                <Badge variant={ESTADO_COLORS[selectedArtista.estado]}>
                  {selectedArtista.estado}
                </Badge>
              </div>
              <div className="mt-2">
                <span className="text-sm text-gray-500">Fecha de Registro:</span>
                <p className="text-sm text-gray-700 mt-1">
                  {new Date(selectedArtista.created_at).toLocaleString('es-MX', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              {selectedArtista.folio && (
                <div className="mt-2">
                  <span className="text-sm text-gray-500">Folio:</span>
                  <p className="font-mono font-medium text-sm text-gray-900 mt-1">{selectedArtista.folio}</p>
                </div>
              )}
              {selectedArtista.notas_admin && (
                <div className="mt-2">
                  <span className="text-sm text-gray-500">Notas Admin:</span>
                  <p className="text-sm text-gray-700 mt-1">{selectedArtista.notas_admin}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de cambio de estado */}
      <Modal
        isOpen={showEstadoModal}
        onClose={() => setShowEstadoModal(false)}
        title="Cambiar Estado"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowEstadoModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleGuardarEstado}>
              Guardar
            </Button>
          </>
        }
      >
        {selectedArtista && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={nuevoEstado}
                onChange={(e) => setNuevoEstado(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="pendiente">Pendiente</option>
                <option value="aprobado">Aprobado</option>
                <option value="rechazado">Rechazado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas (opcional)
              </label>
              <textarea
                value={notasEstado}
                onChange={(e) => setNotasEstado(e.target.value)}
                rows={4}
                placeholder="Escribe notas sobre la decisión..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de visualización de documentos/imágenes */}
      {viewerModal.open && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setViewerModal({ open: false, url: '', type: '', title: '' })}
        >
          <div
            className="relative max-w-[95vw] max-h-[95vh] bg-white rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">{viewerModal.title}</h3>
              <div className="flex items-center gap-2">
                <a
                  href={viewerModal.url}
                  download
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                  title="Descargar"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </a>
                <a
                  href={viewerModal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                  title="Abrir en nueva pestaña"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                <button
                  onClick={() => setViewerModal({ open: false, url: '', type: '', title: '' })}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-auto" style={{ maxHeight: 'calc(95vh - 80px)' }}>
              {viewerModal.type === 'pdf' ? (
                <iframe
                  src={viewerModal.url}
                  className="w-full"
                  style={{ height: 'calc(95vh - 80px)', minWidth: '800px' }}
                  title={viewerModal.title}
                />
              ) : (
                <div className="flex items-center justify-center p-4 bg-gray-100">
                  <img
                    src={viewerModal.url}
                    alt={viewerModal.title}
                    className="max-w-full max-h-[calc(95vh-120px)] object-contain"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Obra Individual - Foto grande + Ficha técnica */}
      {obraModal.open && obraModal.obra && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setObraModal({ open: false, obra: null })}
        >
          <div
            className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón cerrar */}
            <button
              onClick={() => setObraModal({ open: false, obra: null })}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col md:flex-row">
              {/* Imagen grande */}
              <div className="md:w-2/3 bg-gray-900 flex items-center justify-center p-4 relative">
                {obraModal.obra.preview && (
                  <>
                    <img
                      src={obraModal.obra.preview}
                      alt={obraModal.obra.titulo}
                      className="max-w-full max-h-[70vh] object-contain"
                    />
                    {/* Botón de descarga sobre la imagen */}
                    <a
                      href={obraModal.obra.preview}
                      download={`obra-${(obraModal.obra.titulo || 'sin-titulo').replace(/\s+/g, '-').toLowerCase()}.jpg`}
                      className="absolute bottom-6 left-1/2 -translate-x-1/2 inline-flex items-center gap-2 px-4 py-2 bg-white/90 hover:bg-white text-gray-900 rounded-lg shadow-lg transition-all text-sm font-medium"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Download size={16} />
                      Descargar imagen
                    </a>
                  </>
                )}
              </div>

              {/* Ficha técnica */}
              <div className="md:w-1/3 p-6 bg-white">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    {obraModal.obra.titulo || 'Sin título'}
                  </h3>
                  {obraModal.obra.tipo_obra && (
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${
                      obraModal.obra.tipo_obra === '3D'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {obraModal.obra.tipo_obra}
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Dimensiones</span>
                      <p className="font-medium text-gray-900">
                        {obraModal.obra.ancho_cm} × {obraModal.obra.alto_cm}
                        {obraModal.obra.largo_cm ? ` × ${obraModal.obra.largo_cm}` : ''} cm
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Año</span>
                      <p className="font-medium text-gray-900">{obraModal.obra.anio || '-'}</p>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Técnica</span>
                    <p className="font-medium text-gray-900">{obraModal.obra.tecnica || '-'}</p>
                  </div>

                  <div className="pt-4 border-t">
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Precio</span>
                    <p className="text-2xl font-bold text-green-600">
                      ${obraModal.obra.precio_mxn?.toLocaleString('es-MX')} MXN
                    </p>
                  </div>

                  {obraModal.obra.notas_montaje && (
                    <div className="pt-4 border-t">
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Notas de montaje</span>
                      <p className="text-sm text-gray-700 mt-1 italic">{obraModal.obra.notas_montaje}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Mensaje al Artista */}
      {mensajeModal.open && mensajeModal.artista && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setMensajeModal({ open: false, artista: null })}
        >
          <div
            className="relative max-w-lg w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <div>
                <h3 className="font-semibold text-gray-900">Enviar mensaje</h3>
                <p className="text-sm text-gray-500">a {mensajeModal.artista.nombre} {mensajeModal.artista.apellido}</p>
              </div>
              <button
                onClick={() => setMensajeModal({ open: false, artista: null })}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Contenido */}
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asunto</label>
                <input
                  type="text"
                  value={mensajeForm.asunto}
                  onChange={(e) => setMensajeForm(prev => ({ ...prev, asunto: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
                <textarea
                  value={mensajeForm.mensaje}
                  onChange={(e) => setMensajeForm(prev => ({ ...prev, mensaje: e.target.value }))}
                  rows={6}
                  placeholder="Escribe tu mensaje aquí..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t bg-gray-50">
              <button
                onClick={() => handleWhatsApp(mensajeModal.artista.telefono, mensajeModal.artista.nombre)}
                disabled={!mensajeModal.artista.telefono}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <MessageCircle size={18} />
                WhatsApp
              </button>
              <button
                onClick={handleEnviarEmail}
                className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Mail size={18} />
                Enviar Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Foto de Perfil Ampliada */}
      {fotoPerfilModal.open && fotoPerfilModal.url && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setFotoPerfilModal({ open: false, url: '', nombre: '' })}
        >
          <div
            className="relative max-w-3xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <h3 className="font-semibold text-gray-900">
                Foto de perfil - {fotoPerfilModal.nombre}
              </h3>
              <div className="flex items-center gap-2">
                <a
                  href={fotoPerfilModal.url}
                  download={`foto-${fotoPerfilModal.nombre.replace(/\s+/g, '-').toLowerCase()}.jpg`}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Download size={16} />
                  Descargar
                </a>
                <button
                  onClick={() => setFotoPerfilModal({ open: false, url: '', nombre: '' })}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Imagen */}
            <div className="flex items-center justify-center p-6 bg-gray-100">
              <img
                src={fotoPerfilModal.url}
                alt={fotoPerfilModal.nombre}
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal de Añadir Artista */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 overflow-y-auto"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="relative w-full max-w-2xl bg-white rounded-2xl overflow-hidden shadow-2xl my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-purple-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Plus size={20} className="text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Añadir Artista</h3>
                  <p className="text-sm text-gray-500">Crear un nuevo artista manualmente</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Formulario */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Datos básicos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={nuevoArtistaForm.nombre}
                    onChange={handleNuevoArtistaChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Nombre"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Apellido <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="apellido"
                    value={nuevoArtistaForm.apellido}
                    onChange={handleNuevoArtistaChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Apellido"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Artístico
                </label>
                <input
                  type="text"
                  name="nombre_artistico"
                  value={nuevoArtistaForm.nombre_artistico}
                  onChange={handleNuevoArtistaChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Nombre artístico (opcional)"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={nuevoArtistaForm.email}
                    onChange={handleNuevoArtistaChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="correo@ejemplo.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    value={nuevoArtistaForm.telefono}
                    onChange={handleNuevoArtistaChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="55 1234 5678"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Nacimiento <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="fecha_nacimiento"
                    value={nuevoArtistaForm.fecha_nacimiento}
                    onChange={handleNuevoArtistaChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    País <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="pais"
                    value={nuevoArtistaForm.pais}
                    onChange={handleNuevoArtistaChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="MX">México</option>
                    <option value="US">Estados Unidos</option>
                    <option value="AR">Argentina</option>
                    <option value="CO">Colombia</option>
                    <option value="ES">España</option>
                    <option value="CL">Chile</option>
                    <option value="PE">Perú</option>
                    <option value="BR">Brasil</option>
                    <option value="OTHER">Otro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ciudad <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="ciudad"
                  value={nuevoArtistaForm.ciudad}
                  onChange={handleNuevoArtistaChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ciudad de México"
                />
              </div>

              {/* Formato de trabajo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Formato de Trabajo
                  </label>
                  <select
                    name="formato_tipo"
                    value={nuevoArtistaForm.formato_tipo}
                    onChange={handleNuevoArtistaChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="2D">2D (Pintura, Dibujo, etc.)</option>
                    <option value="3D">3D (Escultura, Cerámica, etc.)</option>
                    <option value="OTRO">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría/Disciplina
                  </label>
                  <select
                    name="categoria"
                    value={nuevoArtistaForm.categoria}
                    onChange={handleNuevoArtistaChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar...</option>
                    <optgroup label="2D">
                      {FORMATOS_2D.map(f => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))}
                    </optgroup>
                    <optgroup label="3D">
                      {FORMATOS_3D.map(f => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))}
                    </optgroup>
                    <option value="otro">Otro</option>
                  </select>
                </div>
              </div>

              {/* Redes sociales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instagram
                  </label>
                  <input
                    type="text"
                    name="instagram"
                    value={nuevoArtistaForm.instagram}
                    onChange={handleNuevoArtistaChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="@usuario"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sitio Web
                  </label>
                  <input
                    type="text"
                    name="website"
                    value={nuevoArtistaForm.website}
                    onChange={handleNuevoArtistaChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="www.miportafolio.com"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Semblanza / Biografía
                </label>
                <textarea
                  name="bio"
                  value={nuevoArtistaForm.bio}
                  onChange={handleNuevoArtistaChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Breve descripción del artista..."
                />
              </div>

              {/* Notas admin */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas del Admin
                </label>
                <textarea
                  name="notas_admin"
                  value={nuevoArtistaForm.notas_admin}
                  onChange={handleNuevoArtistaChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Notas internas (no visibles para el artista)"
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-700">
                  <strong>Nota:</strong> El artista se creará sin archivos (foto, CV, portfolio).
                  Podrás agregarlos después editando el registro.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t bg-gray-50">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleCrearArtista}
                disabled={creandoArtista}
                className="inline-flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {creandoArtista ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creando...
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    Crear Artista
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Inscripción a Fase */}
      {inscripcionModal.open && inscripcionModal.artista && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setInscripcionModal({ open: false, artista: null })}
        >
          <div
            className="relative max-w-md w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-purple-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <UserPlus size={20} className="text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Inscribir a Fase</h3>
                  <p className="text-sm text-gray-500">
                    {inscripcionModal.artista.nombre} {inscripcionModal.artista.apellido}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInscripcionModal({ open: false, artista: null })}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Contenido */}
            <div className="p-6 space-y-4">
              {/* Info del artista actual */}
              {inscripcionModal.artista.fase_inscripcion && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-700">
                    <span className="font-medium">Fase actual:</span>{' '}
                    {inscripcionModal.artista.fase_inscripcion.nombre}
                  </p>
                </div>
              )}

              {/* Selector de fase */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selecciona la fase a inscribir
                </label>
                <select
                  value={selectedFaseId}
                  onChange={(e) => setSelectedFaseId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                >
                  <option value="">-- Selecciona una fase --</option>
                  {fases.filter(f => !f.finalizada).map(fase => (
                    <option key={fase.id} value={fase.id}>
                      {fase.nombre} {fase.inscripciones_abiertas ? '(Inscripciones Abiertas)' : ''} {fase.votaciones_abiertas ? '(Votaciones Abiertas)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fases finalizadas (opcionales) */}
              {fases.some(f => f.finalizada) && (
                <details className="text-sm">
                  <summary className="text-gray-500 cursor-pointer hover:text-gray-700">
                    Ver fases finalizadas ({fases.filter(f => f.finalizada).length})
                  </summary>
                  <div className="mt-2 space-y-1">
                    {fases.filter(f => f.finalizada).map(fase => (
                      <button
                        key={fase.id}
                        onClick={() => setSelectedFaseId(fase.id.toString())}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          selectedFaseId === fase.id.toString()
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {fase.nombre} (Finalizada)
                      </button>
                    ))}
                  </div>
                </details>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t bg-gray-50">
              <button
                onClick={() => setInscripcionModal({ open: false, artista: null })}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleInscribirAFase}
                disabled={!selectedFaseId || inscribiendoArtista}
                className="inline-flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {inscribiendoArtista ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Inscribiendo...
                  </>
                ) : (
                  <>
                    <UserPlus size={18} />
                    Inscribir
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Exportación a Excel */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Download size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Exportar a Excel</h3>
                    <p className="text-green-100 text-sm">Selecciona qué datos exportar</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Selecciona la fase a exportar:
                </label>
                <select
                  value={exportFaseSeleccionada}
                  onChange={(e) => setExportFaseSeleccionada(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-gray-50"
                >
                  <option value="all">Todas las fases</option>
                  {fases.map(fase => (
                    <option key={fase.id} value={fase.id.toString()}>
                      {fase.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Info de lo que se exportará */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <p className="text-sm font-medium text-gray-700">El archivo incluirá:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Hoja de Resumen con estadísticas
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Datos completos de artistas
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Obras con precios y medidas
                  </li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-5 py-2.5 text-gray-700 hover:bg-gray-200 rounded-xl transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleExportarExcel}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold shadow-lg shadow-green-600/30"
              >
                <Download size={18} />
                Exportar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
