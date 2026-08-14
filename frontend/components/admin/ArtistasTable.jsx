'use client'

import { useState, useEffect } from 'react'
import { useArtistasStore } from '@/stores/artistasStore'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import * as XLSX from 'xlsx'
import { Download } from 'lucide-react'

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

const CATEGORIAS = [
  { value: 'pintura', label: 'Pintura' },
  { value: 'escultura', label: 'Escultura' },
  { value: 'fotografia', label: 'Fotografía' },
  { value: 'ilustracion', label: 'Ilustración' },
  { value: 'arte_digital', label: 'Arte Digital' },
  { value: 'instalacion', label: 'Instalación' },
  { value: 'video_arte', label: 'Video Arte' },
  { value: 'performance', label: 'Performance' },
  { value: 'arte_textil', label: 'Arte Textil' },
  { value: 'grabado', label: 'Grabado' },
  { value: 'ceramica', label: 'Cerámica' },
  { value: 'arte_objeto', label: 'Arte Objeto' },
  { value: 'otro', label: 'Otro' }
]

export default function ArtistasTable() {
  const { artistas, fetchArtistas, deleteArtista, cambiarEstadoArtista } = useArtistasStore()

  const [searchTerm, setSearchTerm] = useState('')
  const [estadoFilter, setEstadoFilter] = useState('all')
  const [categoriaFilter, setCategoriaFilter] = useState('all')
  const [selectedArtista, setSelectedArtista] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showEstadoModal, setShowEstadoModal] = useState(false)
  const [nuevoEstado, setNuevoEstado] = useState('')
  const [notasEstado, setNotasEstado] = useState('')
  // Estado para modal de visualización de documentos/imágenes
  const [viewerModal, setViewerModal] = useState({ open: false, url: '', type: '', title: '' })

  // Cargar artistas al montar
  useEffect(() => {
    fetchArtistas()
  }, [])

  // Filtrar artistas
  const artistasFiltrados = artistas.filter(artista => {
    const matchesSearch =
      artista.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artista.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artista.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesEstado = estadoFilter === 'all' || artista.estado === estadoFilter
    const matchesCategoria = categoriaFilter === 'all' || artista.categoria === categoriaFilter

    return matchesSearch && matchesEstado && matchesCategoria
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
    // Si no tiene extensión clara, intentar adivinar por el nombre del campo
    return 'unknown'
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

  const handleExportarExcel = () => {
    // Preparar datos para exportar
    const datosExportar = artistasFiltrados.map(artista => ({
      'ID': artista.id,
      'Folio': artista.folio || '',
      'Nombre': artista.nombre,
      'Apellido': artista.apellido,
      'Nombre Artístico': artista.nombre_artistico || '',
      'Email': artista.email,
      'Teléfono': artista.telefono || '',
      'Fecha Nacimiento': artista.fecha_nacimiento ? new Date(artista.fecha_nacimiento).toLocaleDateString('es-MX') : '',
      'País': artista.pais || '',
      'Ciudad': artista.ciudad || '',
      'Categoría': artista.categoria?.replace('_', ' ') || '',
      'Estado': artista.estado,
      'Paquete': artista.paquete?.nombre || '',
      'Tipo Paquete': artista.paquete?.tipo || '',
      'Dimensiones Paquete': artista.paquete ? (artista.paquete.tipo === '3D' ? `${artista.paquete.metros_cuadrados}m²` : `${artista.paquete.metros_lineales}m × ${artista.paquete.altura_pared}m`) : '',
      'Precio Paquete': artista.paquete?.precio_mxn || '',
      'Fase Registro': artista.fase_inscripcion?.nombre || '',
      'Votos Favor': artista.total_votos_favor || 0,
      'Votos Contra': artista.total_votos_contra || 0,
      'Fecha Registro': artista.created_at ? new Date(artista.created_at).toLocaleDateString('es-MX') : '',
      'Bio': artista.bio || '',
      'Instagram': artista.redes_sociales?.instagram || '',
      'Sitio Web': artista.redes_sociales?.sitio_web || '',
      'Lienzo URL': artista.layout_canvas_url || '',
      'Cantidad Obras': artista.layout_canvas_data?.obras?.length || 0,
      'Notas Admin': artista.notas_admin || ''
    }))

    // Crear hoja de cálculo
    const worksheet = XLSX.utils.json_to_sheet(datosExportar)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Artistas')

    // Ajustar ancho de columnas
    const columnWidths = [
      { wch: 8 },  // ID
      { wch: 15 }, // Folio
      { wch: 20 }, // Nombre
      { wch: 20 }, // Apellido
      { wch: 20 }, // Nombre Artístico
      { wch: 30 }, // Email
      { wch: 15 }, // Teléfono
      { wch: 15 }, // Fecha Nacimiento
      { wch: 15 }, // País
      { wch: 20 }, // Ciudad
      { wch: 20 }, // Categoría
      { wch: 12 }, // Estado
      { wch: 20 }, // Paquete
      { wch: 10 }, // Tipo Paquete
      { wch: 20 }, // Dimensiones Paquete
      { wch: 15 }, // Precio Paquete
      { wch: 15 }, // Fase Registro
      { wch: 10 }, // Votos Favor
      { wch: 10 }, // Votos Contra
      { wch: 15 }, // Fecha Registro
      { wch: 50 }, // Bio
      { wch: 20 }, // Instagram
      { wch: 30 }, // Sitio Web
      { wch: 50 }, // Lienzo URL
      { wch: 12 }, // Cantidad Obras
      { wch: 40 }  // Notas Admin
    ]
    worksheet['!cols'] = columnWidths

    // Generar nombre de archivo con fecha
    const fecha = new Date().toISOString().split('T')[0]
    const nombreArchivo = `artistas-artefact-${fecha}.xlsx`

    // Descargar archivo
    XLSX.writeFile(workbook, nombreArchivo)
  }

  return (
    <div className="space-y-4">
      {/* Filtros y búsqueda */}
      <div className="bg-white p-4 rounded-2xl shadow space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              {CATEGORIAS.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Resumen y Exportar */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Mostrando {artistasFiltrados.length} de {artistas.length} artistas</span>
          <button
            onClick={handleExportarExcel}
            disabled={artistasFiltrados.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
          >
            <Download size={18} />
            Exportar a Excel
          </button>
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

                  {/* Categoría */}
                  <TableCell>
                    <Badge variant="info">
                      {CATEGORIAS.find(c => c.value === artista.categoria)?.label || artista.categoria}
                    </Badge>
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

      {/* Modal de detalles */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={selectedArtista ? `${selectedArtista.nombre} ${selectedArtista.apellido}` : ''}
        size="lg"
      >
        {selectedArtista && (
          <div className="space-y-6">
            {/* Foto y datos básicos */}
            <div className="flex items-start gap-6">
              <img
                src={selectedArtista.foto}
                alt={selectedArtista.nombre}
                className="w-32 h-32 rounded-lg object-cover"
              />
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
                  <span className="text-sm text-gray-500">Categoría:</span>
                  <p className="font-medium">
                    {CATEGORIAS.find(c => c.value === selectedArtista.categoria)?.label}
                  </p>
                </div>
              </div>
            </div>

            {/* Biografía */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Biografía</h4>
              <p className="text-gray-700 text-sm">{selectedArtista.bio}</p>
            </div>

            {/* Redes sociales */}
            {selectedArtista.redes_sociales && Object.keys(selectedArtista.redes_sociales).length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Redes Sociales</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(selectedArtista.redes_sociales).map(([key, value]) => (
                    <a
                      key={key}
                      href={value}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </a>
                  ))}
                </div>
              </div>
            )}

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

            {/* Obras del Lienzo */}
            {selectedArtista.layout_canvas_data && selectedArtista.layout_canvas_data.obras && selectedArtista.layout_canvas_data.obras.length > 0 && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                  Obras para Exhibición ({selectedArtista.layout_canvas_data.obras.length})
                </h4>
                <div className="space-y-3">
                  {selectedArtista.layout_canvas_data.obras.map((obra, index) => (
                    <div key={index} className="bg-white p-3 rounded-lg border border-gray-200">
                      <div className="flex items-start gap-3">
                        {obra.preview && (
                          <img
                            src={obra.preview}
                            alt={obra.titulo}
                            className="w-16 h-16 rounded object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{obra.titulo || `Obra ${index + 1}`}</p>
                          <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-gray-600">
                            <div>
                              <span className="text-gray-500">Dimensiones:</span> {obra.ancho_cm} × {obra.alto_cm} cm
                            </div>
                            <div>
                              <span className="text-gray-500">Técnica:</span> {obra.tecnica}
                            </div>
                            <div>
                              <span className="text-gray-500">Año:</span> {obra.anio}
                            </div>
                            <div>
                              <span className="text-gray-500">Precio:</span> ${obra.precio_mxn?.toLocaleString('es-MX')} MXN
                            </div>
                          </div>
                          {obra.notas_montaje && (
                            <div className="mt-2 text-xs">
                              <span className="text-gray-500">Notas de montaje:</span>
                              <p className="text-gray-700 italic">{obra.notas_montaje}</p>
                            </div>
                          )}
                        </div>
                      </div>
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
    </div>
  )
}
