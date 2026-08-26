'use client'

import { useState, useEffect } from 'react'
import { useArtistasStore } from '@/stores/artistasStore'
import { useFasesStore } from '@/stores/fasesStore'
import Badge from '@/components/ui/Badge'

/**
 * AdminArtistasPorFase - Vista de artistas organizados por fase (Admin)
 *
 * Muestra los artistas inscritos en cada fase en formato arbol/lista
 * Similar al componente de curadores pero con acciones de admin
 */

const CATEGORIAS = [
  { value: 'pintura', label: 'Pintura' },
  { value: 'escultura', label: 'Escultura' },
  { value: 'fotografia', label: 'Fotografia' },
  { value: 'ilustracion', label: 'Ilustracion' },
  { value: 'arte_digital', label: 'Arte Digital' },
  { value: 'dibujo', label: 'Dibujo' },
  { value: 'grafica', label: 'Grafica' },
  { value: 'collage_mixta', label: 'Collage & Mixta' },
  { value: 'textil', label: 'Textil' },
  { value: 'ceramica', label: 'Ceramica' },
  { value: 'otro', label: 'Otro' }
]

export default function AdminArtistasPorFase({ onVerDetalles }) {
  const { fetchArtistasByFase } = useArtistasStore()
  const { fases, fetchFases, isLoading: isLoadingFases } = useFasesStore()

  const [artistasPorFase, setArtistasPorFase] = useState({})
  const [expandedFases, setExpandedFases] = useState({})
  const [isLoading, setIsLoading] = useState(true)

  // Cargar fases al montar
  useEffect(() => {
    fetchFases()
  }, [fetchFases])

  // Cargar artistas de cada fase
  useEffect(() => {
    const loadArtistas = async () => {
      setIsLoading(true)
      const fasesConArtistas = fases.filter(f => f.tipo === 'fase')
      const artistasData = {}

      for (const fase of fasesConArtistas) {
        try {
          const result = await fetchArtistasByFase(fase.id)
          artistasData[fase.id] = result?.data || []
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
      setIsLoading(false)
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

  const getEstadoFase = (fase) => {
    if (fase.finalizada) return { label: 'Finalizada', variant: 'gray' }
    if (fase.votaciones_abiertas) return { label: 'Votaciones Abiertas', variant: 'success' }
    if (fase.inscripciones_abiertas) return { label: 'Inscripciones Abiertas', variant: 'info' }
    return { label: 'Pendiente', variant: 'warning' }
  }

  const getCategoriaLabel = (categoria) => {
    return CATEGORIAS.find(c => c.value === categoria)?.label || categoria || 'Sin categoria'
  }

  const getEstadoArtista = (artista) => {
    // Estado en la fase (si existe artistas_fases.estado)
    if (artista.estado_fase) {
      const estados = {
        'inscrito': { label: 'Inscrito', variant: 'info' },
        'votando': { label: 'En votacion', variant: 'warning' },
        'aprobado': { label: 'Aprobado', variant: 'success' },
        'rechazado': { label: 'Rechazado', variant: 'error' },
        'en_espera': { label: 'En espera', variant: 'purple' }
      }
      return estados[artista.estado_fase] || { label: artista.estado_fase, variant: 'gray' }
    }
    return { label: 'Inscrito', variant: 'info' }
  }

  if (isLoading || isLoadingFases) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
        <p className="text-gray-600">Cargando artistas por fase...</p>
      </div>
    )
  }

  const fasesOrdenadas = fases
    .filter(f => f.tipo === 'fase')
    .sort((a, b) => (a.numero_fase || 0) - (b.numero_fase || 0))

  // Calcular totales
  const totalArtistas = Object.values(artistasPorFase).reduce((acc, arr) => acc + arr.length, 0)

  return (
    <div className="space-y-6">
      {/* Header con estadisticas */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-600 p-6 rounded-r-2xl">
        <h3 className="font-semibold text-blue-900 mb-2">
          Artistas por Fase
        </h3>
        <p className="text-sm text-blue-800 mb-3">
          Vista de todos los artistas organizados por fase de inscripcion.
        </p>
        <div className="flex gap-4 text-sm text-blue-700">
          <span className="flex items-center gap-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {totalArtistas} artistas en total
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            {fasesOrdenadas.length} fases
          </span>
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
                          const estadoArtista = getEstadoArtista(artista)
                          const esRescatado = artista.es_rescatado
                          const faseOrigen = artista.fase_origen_id && artista.fase_origen_id !== fase.id

                          return (
                            <div
                              key={artista.id}
                              className={`px-6 py-4 flex items-center gap-4 hover:bg-gray-50 cursor-pointer transition-colors ${esRescatado ? 'bg-yellow-50' : ''}`}
                              onClick={() => onVerDetalles && onVerDetalles(artista)}
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
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h5 className="font-medium text-gray-900 truncate">
                                    {artista.nombre} {artista.apellido}
                                  </h5>
                                  <Badge variant="info" size="sm">
                                    {getCategoriaLabel(artista.categoria)}
                                  </Badge>
                                  {esRescatado && (
                                    <Badge variant="warning" size="sm">
                                      Rescatado
                                    </Badge>
                                  )}
                                  {faseOrigen && (
                                    <span className="text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded">
                                      Inscrito Fase {artista.fase_origen_nombre || artista.fase_origen_id}
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-500 truncate">
                                  {artista.ciudad}, {artista.pais} | {artista.email}
                                </p>
                              </div>

                              {/* Estado */}
                              <Badge variant={estadoArtista.variant} size="sm">
                                {estadoArtista.label}
                              </Badge>

                              {/* Votos si existen */}
                              {(artista.total_votos_favor > 0 || artista.total_votos_contra > 0) && (
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="text-green-600 font-medium">
                                    +{artista.total_votos_favor || 0}
                                  </span>
                                  <span className="text-gray-400">/</span>
                                  <span className="text-red-600 font-medium">
                                    -{artista.total_votos_contra || 0}
                                  </span>
                                </div>
                              )}

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
    </div>
  )
}
