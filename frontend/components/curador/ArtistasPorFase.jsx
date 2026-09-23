'use client'

import { useState, useEffect } from 'react'
import { useArtistasStore } from '@/stores/artistasStore'
import { useFasesStore } from '@/stores/fasesStore'
import { useFavoritosStore } from '@/stores/favoritosStore'
import Badge from '@/components/ui/Badge'
import ArtistaPerfilModal from './ArtistaPerfilModal'

/**
 * ArtistasPorFase - Vista de artistas organizados por fase
 *
 * Muestra los artistas inscritos en cada fase en formato arbol/lista
 * Permite marcar favoritos aunque las votaciones no esten abiertas
 * Vista de solo lectura para explorar artistas antes de votar
 *
 * Features:
 * - Vista de todas las fases con artistas
 * - Formato arbol: Fase 1 > Artista 1, Artista 2...
 * - Boton de favorito (corazon) por artista
 * - Modal de perfil al hacer click
 */

const CATEGORIAS = [
  { value: 'pintura', label: 'Pintura' },
  { value: 'escultura', label: 'Escultura' },
  { value: 'fotografia', label: 'Fotografia' },
  { value: 'ilustracion', label: 'Ilustracion' },
  { value: 'arte_digital', label: 'Arte Digital' },
  { value: 'instalacion', label: 'Instalacion' },
  { value: 'video_arte', label: 'Video Arte' },
  { value: 'performance', label: 'Performance' },
  { value: 'arte_textil', label: 'Arte Textil' },
  { value: 'grabado', label: 'Grabado' },
  { value: 'ceramica', label: 'Ceramica' },
  { value: 'arte_objeto', label: 'Arte Objeto' },
  { value: 'otro', label: 'Otro' }
]

export default function ArtistasPorFase() {
  const { fetchArtistasByFase, fetchArtistaById, isLoading: isLoadingArtistas } = useArtistasStore()
  const { fases, fetchFases, isLoading: isLoadingFases } = useFasesStore()
  const { favoritos, fetchMisFavoritos, toggleFavorito, isFavorito, isLoading: isLoadingFavoritos } = useFavoritosStore()

  const [artistasPorFase, setArtistasPorFase] = useState({})
  const [expandedFases, setExpandedFases] = useState({})
  const [selectedArtista, setSelectedArtista] = useState(null)
  const [selectedFase, setSelectedFase] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [loadingFavorito, setLoadingFavorito] = useState(null)

  // Cargar fases y favoritos al montar
  useEffect(() => {
    fetchFases()
    fetchMisFavoritos()
  }, [fetchFases, fetchMisFavoritos])

  // Cargar artistas de cada fase
  useEffect(() => {
    const loadArtistas = async () => {
      const fasesConArtistas = fases.filter(f => f.tipo === 'fase')
      const artistasData = {}

      for (const fase of fasesConArtistas) {
        try {
          const result = await fetchArtistasByFase(fase.id)
          const artistas = result?.data || []
          // Mostrar todos los artistas inscritos (ya no filtramos por aprobado)
          artistasData[fase.id] = artistas
        } catch (error) {
          console.error(`Error cargando artistas de fase ${fase.id}:`, error)
          artistasData[fase.id] = []
        }
      }

      setArtistasPorFase(artistasData)

      // Expandir todas las fases por defecto
      const expanded = {}
      fasesConArtistas.forEach(f => {
        expanded[f.id] = true
      })
      setExpandedFases(expanded)
    }

    if (fases.length > 0) {
      loadArtistas()
    }
  }, [fases, fetchArtistasByFase])

  const toggleFase = (faseId) => {
    setExpandedFases(prev => ({
      ...prev,
      [faseId]: !prev[faseId]
    }))
  }

  const handleToggleFavorito = async (e, artistaId, faseId) => {
    e.stopPropagation()
    setLoadingFavorito(`${artistaId}-${faseId}`)
    await toggleFavorito(artistaId, faseId)
    setLoadingFavorito(null)
  }

  const handleVerPerfil = async (artista, fase) => {
    // Cargar datos completos del artista antes de abrir modal
    setLoadingFavorito(`loading-${artista.id}`)
    const result = await fetchArtistaById(artista.id)
    setLoadingFavorito(null)

    if (result.success) {
      setSelectedArtista(result.data)
      setSelectedFase(fase)
      setShowModal(true)
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedArtista(null)
    setSelectedFase(null)
  }

  const getEstadoFase = (fase) => {
    if (fase.finalizada) return { label: 'Finalizada', variant: 'gray' }
    if (fase.votaciones_abiertas) return { label: 'Votaciones Abiertas', variant: 'success' }
    if (fase.inscripciones_abiertas) return { label: 'Inscripciones Abiertas', variant: 'info' }
    return { label: 'Pendiente', variant: 'warning' }
  }

  const getCategoriaLabel = (categoria) => {
    return CATEGORIAS.find(c => c.value === categoria)?.label || categoria
  }

  const isLoading = isLoadingArtistas || isLoadingFases

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
        <p className="text-gray-600">Cargando artistas por fase...</p>
      </div>
    )
  }

  const fasesOrdenadas = fases
    .filter(f => f.tipo === 'fase')
    .sort((a, b) => (a.numero_fase || 0) - (b.numero_fase || 0))

  const totalFavoritos = favoritos.length

  return (
    <div className="space-y-6">
      {/* Header simple */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Artistas por Fase</h2>
          <p className="text-sm text-gray-500 mt-1">
            {totalFavoritos} favoritos marcados
          </p>
        </div>
      </div>

      {/* Arbol de fases */}
      <div className="space-y-4">
        {fasesOrdenadas.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">No hay fases disponibles</p>
          </div>
        ) : (
          fasesOrdenadas.map(fase => {
            const artistas = artistasPorFase[fase.id] || []
            const isExpanded = expandedFases[fase.id]
            const estado = getEstadoFase(fase)
            const favoritosEnFase = favoritos.filter(f => f.fase_id === fase.id).length

            return (
              <div key={fase.id} className="bg-white rounded-lg shadow overflow-hidden">
                {/* Header de fase - clickeable */}
                <button
                  onClick={() => toggleFase(fase.id)}
                  className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {/* Icono expandir/colapsar */}
                    <svg
                      className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>

                    {/* Info de fase */}
                    <div className="text-left">
                      <h4 className="font-semibold text-gray-900">
                        {fase.nombre}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {artistas.length} artistas inscritos
                        {favoritosEnFase > 0 && (
                          <span className="ml-2 text-red-500">
                            ({favoritosEnFase} favoritos)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <Badge variant={estado.variant}>
                    {estado.label}
                  </Badge>
                </button>

                {/* Lista de artistas */}
                {isExpanded && (
                  <div className="border-t border-gray-100">
                    {artistas.length === 0 ? (
                      <div className="px-6 py-8 text-center text-gray-500">
                        No hay artistas inscritos en esta fase
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {artistas.map((artista, index) => {
                          const esFavorito = isFavorito(artista.id, fase.id)
                          const loadingThis = loadingFavorito === `${artista.id}-${fase.id}`

                          return (
                            <div
                              key={artista.id}
                              className={`px-6 py-4 flex items-center gap-4 hover:bg-gray-50 cursor-pointer transition-colors ${esFavorito ? 'bg-red-50' : ''}`}
                              onClick={() => handleVerPerfil(artista, fase)}
                            >
                              {/* Numero */}
                              <span className="text-sm font-medium text-gray-400 w-8">
                                {index + 1}.
                              </span>

                              {/* Foto */}
                              <img
                                src={artista.foto || '/placeholder-avatar.png'}
                                alt={artista.nombre}
                                className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                              />

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h5 className="font-medium text-gray-900 truncate">
                                    {artista.nombre} {artista.apellido}
                                  </h5>
                                  <Badge variant="info" size="sm">
                                    {getCategoriaLabel(artista.categoria)}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-500 truncate">
                                  {artista.ciudad}, {artista.pais}
                                </p>
                                {/* Links sociales */}
                                <div className="flex gap-2 mt-1">
                                  {(artista.instagram || artista.redes_sociales?.instagram) && (
                                    <a
                                      href={
                                        (artista.instagram || artista.redes_sociales?.instagram).startsWith('http')
                                          ? artista.instagram || artista.redes_sociales?.instagram
                                          : `https://instagram.com/${(artista.instagram || artista.redes_sociales?.instagram).replace(/^@/, '')}`
                                      }
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="text-xs text-pink-600 hover:text-pink-700 hover:underline flex items-center gap-1"
                                      title="Instagram"
                                    >
                                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                      </svg>
                                      Instagram
                                    </a>
                                  )}
                                  {(artista.website || artista.redes_sociales?.sitio_web || artista.redes_sociales?.website) && (
                                    <a
                                      href={
                                        (artista.website || artista.redes_sociales?.sitio_web || artista.redes_sociales?.website).startsWith('http')
                                          ? artista.website || artista.redes_sociales?.sitio_web || artista.redes_sociales?.website
                                          : `https://${artista.website || artista.redes_sociales?.sitio_web || artista.redes_sociales?.website}`
                                      }
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="text-xs text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                                      title="Website"
                                    >
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                      </svg>
                                      Website
                                    </a>
                                  )}
                                  {artista.telefono && (
                                    <a
                                      href={`https://wa.me/${artista.telefono.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${artista.nombre}, te contactamos desde ARTEFACTO 2027.`)}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="text-xs text-green-600 hover:text-green-700 hover:underline flex items-center gap-1"
                                      title="WhatsApp"
                                    >
                                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                      </svg>
                                      WhatsApp
                                    </a>
                                  )}
                                </div>
                              </div>

                              {/* Boton favorito */}
                              <button
                                onClick={(e) => handleToggleFavorito(e, artista.id, fase.id)}
                                disabled={loadingThis}
                                className={`p-2 rounded-full transition-all ${
                                  esFavorito
                                    ? 'text-red-500 hover:bg-red-100'
                                    : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                                } ${loadingThis ? 'opacity-50' : ''}`}
                                title={esFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                              >
                                {loadingThis ? (
                                  <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                ) : (
                                  <svg
                                    className="w-6 h-6"
                                    fill={esFavorito ? 'currentColor' : 'none'}
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                    />
                                  </svg>
                                )}
                              </button>

                              {/* Flecha para ver mas */}
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Modal de perfil */}
      {showModal && selectedArtista && selectedFase && (
        <ArtistaPerfilModal
          artista={selectedArtista}
          faseActiva={selectedFase}
          onClose={handleCloseModal}
          modoLectura={!selectedFase.votaciones_abiertas}
        />
      )}
    </div>
  )
}
