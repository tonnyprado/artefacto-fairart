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
  const { fetchArtistasByFase, isLoading: isLoadingArtistas } = useArtistasStore()
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

  const handleVerPerfil = (artista, fase) => {
    setSelectedArtista(artista)
    setSelectedFase(fase)
    setShowModal(true)
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
