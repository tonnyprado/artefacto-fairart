'use client'

import { useState, useEffect } from 'react'
import { useFasesStore } from '@/stores/fasesStore'
import Badge from '@/components/ui/Badge'
import { artistasApi } from '@/lib/api'

/**
 * ArtistasInscritos - Lista de artistas ACEPTADOS para la Feria
 *
 * Muestra solo los artistas que han pasado las votaciones
 * y están oficialmente aceptados para participar en la feria.
 *
 * Criterio: estado_fase === 'aprobado' o seleccionado === true
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

export default function ArtistasInscritos({ onVerDetalles }) {
  const { fases, fetchFases } = useFasesStore()
  const [artistasAceptados, setArtistasAceptados] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filtroFase, setFiltroFase] = useState('all')

  // Cargar fases
  useEffect(() => {
    fetchFases()
  }, [fetchFases])

  // Cargar artistas aceptados
  useEffect(() => {
    const loadAceptados = async () => {
      setIsLoading(true)
      try {
        const response = await artistasApi.getAll()
        const artistas = response.data || []

        // Filtrar SOLO artistas que pasaron votaciones:
        // - estado_fase === 'aprobado' (pasaron la votacion de la fase)
        // - O seleccionado === true (marcados como seleccionados)
        const aceptados = artistas.filter(a =>
          a.estado_fase === 'aprobado' || a.seleccionado === true
        )

        setArtistasAceptados(aceptados)
      } catch (error) {
        console.error('Error cargando artistas aceptados:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadAceptados()
  }, [])

  const getCategoriaLabel = (categoria) => {
    return CATEGORIAS.find(c => c.value === categoria)?.label || categoria || 'Sin categoria'
  }

  // Filtrar por fase
  const artistasFiltrados = filtroFase === 'all'
    ? artistasAceptados
    : artistasAceptados.filter(a => a.fase_inscripcion?.id === parseInt(filtroFase))

  // Agrupar por paquete para estadisticas
  const porPaquete = artistasFiltrados.reduce((acc, a) => {
    const tipo = a.paquete?.tipo || 'Sin paquete'
    acc[tipo] = (acc[tipo] || 0) + 1
    return acc
  }, {})

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
        <p className="text-gray-600">Cargando artistas aceptados...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con estadisticas */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-600 p-6 rounded-r-2xl">
        <div className="flex items-center gap-3 mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="font-semibold text-green-900 text-xl">
            Artistas Aceptados
          </h3>
        </div>
        <p className="text-sm text-green-800 mb-4">
          Artistas que han pasado el proceso de votacion y estan oficialmente aceptados para participar en la feria.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-green-600">{artistasAceptados.length}</p>
            <p className="text-xs text-green-700">Total Aceptados</p>
          </div>
          <div className="bg-white/50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-blue-600">{porPaquete['2D'] || 0}</p>
            <p className="text-xs text-blue-700">Paquetes 2D</p>
          </div>
          <div className="bg-white/50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-purple-600">{porPaquete['3D'] || 0}</p>
            <p className="text-xs text-purple-700">Paquetes 3D</p>
          </div>
          <div className="bg-white/50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-gray-600">{porPaquete['Sin paquete'] || 0}</p>
            <p className="text-xs text-gray-700">Sin paquete</p>
          </div>
        </div>
      </div>

      {/* Filtro por fase */}
      {artistasAceptados.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Filtrar por fase de origen:</label>
            <select
              value={filtroFase}
              onChange={(e) => setFiltroFase(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">Todas las fases ({artistasAceptados.length})</option>
              {fases.filter(f => f.tipo === 'fase').map(fase => (
                <option key={fase.id} value={fase.id}>
                  {fase.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Lista de artistas o mensaje vacio */}
      {artistasFiltrados.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No hay artistas aceptados aun
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Los artistas apareceran aqui una vez que pasen el proceso de votacion.
            Cuando las votaciones de una fase se cierren y se determinen los resultados,
            los artistas aprobados se mostraran en esta seccion.
          </p>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg text-left max-w-md mx-auto">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Flujo de aceptacion:</h4>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>Artista se inscribe en una fase</li>
              <li>Curadores votan durante la fase de votacion</li>
              <li>Se cierran votaciones y se calculan resultados</li>
              <li>Artistas con votos suficientes son <strong>aceptados</strong></li>
            </ol>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="divide-y divide-gray-100">
            {artistasFiltrados.map((artista, index) => (
              <div
                key={artista.id}
                className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 cursor-pointer transition-colors"
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
                  className="w-12 h-12 rounded-full object-cover border-2 border-green-200"
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h5 className="font-medium text-gray-900 truncate">
                      {artista.nombre} {artista.apellido}
                    </h5>
                    {artista.nombre_artistico && (
                      <span className="text-sm text-gray-500">
                        ({artista.nombre_artistico})
                      </span>
                    )}
                    <Badge variant="info" size="sm">
                      {getCategoriaLabel(artista.categoria)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {artista.ciudad}, {artista.pais} | {artista.email}
                  </p>
                </div>

                {/* Paquete */}
                {artista.paquete && (
                  <div className="text-right">
                    <p className="font-medium text-gray-900 text-sm">
                      {artista.paquete.nombre}
                    </p>
                    <p className="text-xs text-gray-500">
                      {artista.paquete.tipo === '3D'
                        ? `${artista.paquete.metros_cuadrados}m²`
                        : `${artista.paquete.metros_lineales}m × ${artista.paquete.altura_pared}m`
                      }
                    </p>
                  </div>
                )}

                {/* Fase de origen */}
                {artista.fase_inscripcion && (
                  <Badge variant="purple" size="sm">
                    {artista.fase_inscripcion.nombre}
                  </Badge>
                )}

                {/* Check de aceptado */}
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>

                {/* Flecha */}
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
