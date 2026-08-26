'use client'

import { useState, useEffect } from 'react'
import { useFasesStore } from '@/stores/fasesStore'
import Badge from '@/components/ui/Badge'
import { artistasApi } from '@/lib/api'

/**
 * ArtistasInscritos - Lista de artistas seleccionados para la Feria
 *
 * Muestra los artistas que han sido aprobados/seleccionados
 * para participar en la feria (pasaron las votaciones)
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
  const [artistasSeleccionados, setArtistasSeleccionados] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filtroFase, setFiltroFase] = useState('all')

  // Cargar fases
  useEffect(() => {
    fetchFases()
  }, [fetchFases])

  // Cargar artistas seleccionados
  useEffect(() => {
    const loadSeleccionados = async () => {
      setIsLoading(true)
      try {
        // Obtener todos los artistas y filtrar los seleccionados/aprobados
        const response = await artistasApi.getAll()
        const artistas = response.data || []

        // Filtrar artistas que tengan seleccionado=true o estado_fase='aprobado'
        // Por ahora mostramos todos los que tienen paquete (significa que completaron registro)
        const seleccionados = artistas.filter(a =>
          a.seleccionado === true ||
          a.estado_fase === 'aprobado' ||
          (a.paquete && a.estado !== 'rechazado')
        )

        setArtistasSeleccionados(seleccionados)
      } catch (error) {
        console.error('Error cargando artistas seleccionados:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSeleccionados()
  }, [])

  const getCategoriaLabel = (categoria) => {
    return CATEGORIAS.find(c => c.value === categoria)?.label || categoria || 'Sin categoria'
  }

  // Filtrar por fase
  const artistasFiltrados = filtroFase === 'all'
    ? artistasSeleccionados
    : artistasSeleccionados.filter(a => a.fase_inscripcion?.id === parseInt(filtroFase))

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
        <p className="text-gray-600">Cargando artistas inscritos a la feria...</p>
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
            Artistas Inscritos a la Feria
          </h3>
        </div>
        <p className="text-sm text-green-800 mb-4">
          Artistas que han completado su registro y estan confirmados para participar.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-green-600">{artistasSeleccionados.length}</p>
            <p className="text-xs text-green-700">Total Inscritos</p>
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
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filtrar por fase:</label>
          <select
            value={filtroFase}
            onChange={(e) => setFiltroFase(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">Todas las fases ({artistasSeleccionados.length})</option>
            {fases.filter(f => f.tipo === 'fase').map(fase => (
              <option key={fase.id} value={fase.id}>
                {fase.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de artistas */}
      {artistasFiltrados.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No hay artistas inscritos
          </h3>
          <p className="text-gray-600">
            {filtroFase === 'all'
              ? 'Aun no hay artistas confirmados para la feria.'
              : 'No hay artistas de esta fase inscritos a la feria.'}
          </p>
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

                {/* Fase de inscripcion */}
                {artista.fase_inscripcion && (
                  <Badge variant="purple" size="sm">
                    {artista.fase_inscripcion.nombre}
                  </Badge>
                )}

                {/* Check de confirmado */}
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
