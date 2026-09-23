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
                                src={artista.foto || '/placeholder-avatar.svg'}
                                alt={artista.nombre}
                                className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = '/placeholder-avatar.svg';
                                }}
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
