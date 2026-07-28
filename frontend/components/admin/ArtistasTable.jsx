'use client'

import { useState } from 'react'
import { useArtistasStore } from '@/stores/artistasStore'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'

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
  const { artistas, deleteArtista, cambiarEstadoArtista } = useArtistasStore()

  const [searchTerm, setSearchTerm] = useState('')
  const [estadoFilter, setEstadoFilter] = useState('all')
  const [categoriaFilter, setCategoriaFilter] = useState('all')
  const [selectedArtista, setSelectedArtista] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showEstadoModal, setShowEstadoModal] = useState(false)
  const [nuevoEstado, setNuevoEstado] = useState('')
  const [notasEstado, setNotasEstado] = useState('')

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

  return (
    <div className="space-y-4">
      {/* Filtros y búsqueda */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
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

        {/* Resumen */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Mostrando {artistasFiltrados.length} de {artistas.length} artistas</span>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Artista</TableHeader>
              <TableHeader>Email</TableHeader>
              <TableHeader>Categoría</TableHeader>
              <TableHeader>Estado</TableHeader>
              <TableHeader>Votos</TableHeader>
              <TableHeader>Fecha</TableHeader>
              <TableHeader>Acciones</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {artistasFiltrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500 py-8">
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
                <div>
                  <span className="text-sm text-gray-500">Email:</span>
                  <p className="font-medium">{selectedArtista.email}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Teléfono:</span>
                  <p className="font-medium">{selectedArtista.telefono}</p>
                </div>
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
                {selectedArtista.documentos && Object.entries(selectedArtista.documentos).map(([key, value]) => (
                  <a
                    key={key}
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    {key.toUpperCase()}
                  </a>
                ))}
              </div>
            </div>

            {/* Estado y notas */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Estado:</span>
                <Badge variant={ESTADO_COLORS[selectedArtista.estado]}>
                  {selectedArtista.estado}
                </Badge>
              </div>
              {selectedArtista.notas_admin && (
                <div>
                  <span className="text-sm text-gray-500">Notas:</span>
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
    </div>
  )
}
