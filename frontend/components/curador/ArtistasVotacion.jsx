'use client'

import { useState, useEffect } from 'react'
import { useArtistasStore } from '@/stores/artistasStore'
import { useFasesStore } from '@/stores/fasesStore'
import { useVotacionesStore } from '@/stores/votacionesStore'
import { useAuth } from '@/hooks/useAuth'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import ArtistaPerfilModal from './ArtistaPerfilModal'

/**
 * ArtistasVotacion - Vista de artistas para votar
 *
 * Muestra los artistas de la fase activa con votaciones abiertas
 * Permite filtrar por estado de votación y categoría
 * Abre modal para ver perfil completo y votar
 *
 * Features:
 * - Lista de artistas de fase activa
 * - Filtros: Todos / Votados / Sin votar
 * - Filtro por categoría
 * - Búsqueda por nombre
 * - Badge indicando si ya votó
 * - Modal de perfil y votación
 */

const CATEGORIAS = [
  { value: 'all', label: 'Todas las categorías' },
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

export default function ArtistasVotacion() {
  const { user } = useAuth()
  const { artistas, fetchArtistasByFase, isLoading: isLoadingArtistas } = useArtistasStore()
  const { getFaseActiva } = useFasesStore()
  const { hasVotado, getVotacion, fetchMisVotaciones, votaciones } = useVotacionesStore()

  const faseActiva = getFaseActiva()

  const [filtroVotacion, setFiltroVotacion] = useState('all') // 'all' | 'votados' | 'sin_votar'
  const [categoriaFilter, setCategoriaFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedArtista, setSelectedArtista] = useState(null)
  const [showModal, setShowModal] = useState(false)

  // Fetch artistas and votaciones when fase activa changes
  useEffect(() => {
    const loadData = async () => {
      if (faseActiva) {
        await fetchArtistasByFase(faseActiva.id)
        await fetchMisVotaciones(faseActiva.id)
      }
    }
    loadData()
  }, [faseActiva, fetchArtistasByFase, fetchMisVotaciones])

  // Artistas are already filtered by fase from the API
  // fetchArtistasByFase returns only artistas for that specific fase
  const artistasFaseActiva = artistas.filter(a => a.aprobado === true)

  // Aplicar filtros
  const artistasFiltrados = artistasFaseActiva.filter(artista => {
    // Filtro de búsqueda
    const matchesSearch =
      artista.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artista.apellido.toLowerCase().includes(searchTerm.toLowerCase())

    // Filtro de categoría
    const matchesCategoria =
      categoriaFilter === 'all' || artista.categoria === categoriaFilter

    // Filtro de votación
    const yaVoto = hasVotado(user?.curadorId, artista.id, faseActiva?.id)
    const matchesVotacion =
      filtroVotacion === 'all' ||
      (filtroVotacion === 'votados' && yaVoto) ||
      (filtroVotacion === 'sin_votar' && !yaVoto)

    return matchesSearch && matchesCategoria && matchesVotacion
  })

  const handleVerPerfil = (artista) => {
    setSelectedArtista(artista)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedArtista(null)
  }

  // Calcular estadísticas
  const totalArtistas = artistasFaseActiva.length
  const artistasVotados = artistasFaseActiva.filter(a =>
    hasVotado(user?.curadorId, a.id, faseActiva?.id)
  ).length
  const artistasSinVotar = totalArtistas - artistasVotados
  const porcentajeProgreso = totalArtistas > 0
    ? ((artistasVotados / totalArtistas) * 100).toFixed(0)
    : 0

  if (isLoadingArtistas) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
        <p className="text-gray-600">Cargando artistas...</p>
      </div>
    )
  }

  if (!faseActiva || !faseActiva.votaciones_abiertas) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No hay votaciones abiertas
        </h3>
        <p className="text-gray-600">
          En este momento no hay ninguna fase con votaciones activas.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con progreso */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-600 p-6 rounded-r-lg">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-purple-900 mb-2">
              {faseActiva.nombre} - Votaciones Abiertas
            </h3>
            <p className="text-sm text-purple-800 mb-3">
              Fecha límite: {new Date(faseActiva.fecha_fin_votaciones).toLocaleDateString('es-MX', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>

            {/* Barra de progreso */}
            <div className="mb-2">
              <div className="flex items-center justify-between text-sm text-purple-700 mb-1">
                <span>Tu progreso de votación</span>
                <span className="font-semibold">{artistasVotados} / {totalArtistas} ({porcentajeProgreso}%)</span>
              </div>
              <div className="w-full bg-purple-200 rounded-full h-3">
                <div
                  className="bg-purple-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${porcentajeProgreso}%` }}
                />
              </div>
            </div>

            <div className="flex gap-4 text-sm text-purple-700 mt-2">
              <span>✓ {artistasVotados} votados</span>
              <span>⏳ {artistasSinVotar} sin votar</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Búsqueda */}
          <div>
            <input
              type="text"
              placeholder="Buscar artista..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Filtro de votación */}
          <div>
            <select
              value={filtroVotacion}
              onChange={(e) => setFiltroVotacion(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">Todos ({totalArtistas})</option>
              <option value="sin_votar">Sin votar ({artistasSinVotar})</option>
              <option value="votados">Votados ({artistasVotados})</option>
            </select>
          </div>

          {/* Filtro de categoría */}
          <div>
            <select
              value={categoriaFilter}
              onChange={(e) => setCategoriaFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {CATEGORIAS.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Resumen */}
        <div className="text-sm text-gray-600">
          Mostrando {artistasFiltrados.length} de {totalArtistas} artistas
        </div>
      </div>

      {/* Grid de artistas */}
      {artistasFiltrados.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">No se encontraron artistas con los filtros aplicados</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artistasFiltrados.map(artista => {
            const yaVoto = hasVotado(user?.curadorId, artista.id, faseActiva?.id)
            const votacion = yaVoto ? getVotacion(user?.curadorId, artista.id, faseActiva?.id) : null

            return (
              <div
                key={artista.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-all overflow-hidden group"
              >
                {/* Foto */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={artista.foto}
                    alt={artista.nombre}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {yaVoto && (
                    <div className="absolute top-3 right-3">
                      <Badge variant={votacion?.voto ? 'success' : 'error'}>
                        {votacion?.voto ? 'A Favor ✓' : 'En Contra'}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="mb-3">
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">
                      {artista.nombre} {artista.apellido}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="info">
                        {CATEGORIAS.find(c => c.value === artista.categoria)?.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {artista.ciudad}, {artista.pais}
                    </p>
                  </div>

                  {/* Biografía preview */}
                  <p className="text-sm text-gray-700 line-clamp-3 mb-4">
                    {artista.bio}
                  </p>

                  {/* Botón */}
                  <Button
                    onClick={() => handleVerPerfil(artista)}
                    variant={yaVoto ? 'secondary' : 'primary'}
                    className="w-full"
                  >
                    {yaVoto ? (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Ver Perfil y Editar Voto
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Ver Perfil y Votar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal de perfil */}
      {showModal && selectedArtista && (
        <ArtistaPerfilModal
          artista={selectedArtista}
          faseActiva={faseActiva}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}
