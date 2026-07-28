'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useVotacionesStore } from '@/stores/votacionesStore'
import { useArtistasStore } from '@/stores/artistasStore'
import { useFasesStore } from '@/stores/fasesStore'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'

/**
 * MisVotaciones - Historial de votaciones del curador
 *
 * Muestra todas las votaciones emitidas por el curador
 * Con filtros por fase
 * Permite ver el artista votado, el voto emitido y comentarios
 */

const CATEGORIAS = {
  pintura: 'Pintura',
  escultura: 'Escultura',
  fotografia: 'Fotografía',
  ilustracion: 'Ilustración',
  arte_digital: 'Arte Digital',
  instalacion: 'Instalación',
  video_arte: 'Video Arte',
  performance: 'Performance',
  arte_textil: 'Arte Textil',
  grabado: 'Grabado',
  ceramica: 'Cerámica',
  arte_objeto: 'Arte Objeto',
  otro: 'Otro'
}

export default function MisVotaciones() {
  const { user } = useAuth()
  const { fetchMisVotaciones } = useVotacionesStore()
  const artistas = useArtistasStore(state => state.artistas)
  const fases = useFasesStore(state => state.fases)

  const [votaciones, setVotaciones] = useState([])
  const [faseFilter, setFaseFilter] = useState('all')
  const [votoFilter, setVotoFilter] = useState('all') // 'all' | 'favor' | 'contra'
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadVotaciones()
  }, [user])

  const loadVotaciones = async () => {
    if (!user) return
    setIsLoading(true)
    // fetchMisVotaciones gets curator from token, no need to pass user.id
    const data = await fetchMisVotaciones()
    setVotaciones(data || [])
    setIsLoading(false)
  }

  // Enriquecer votaciones con datos de artistas y fases
  const votacionesEnriquecidas = votaciones.map(v => {
    const artista = artistas.find(a => a.id === v.artista_id)
    const fase = fases.find(f => f.id === v.fase_id)
    return {
      ...v,
      artista,
      fase
    }
  })

  // Aplicar filtros
  const votacionesFiltradas = votacionesEnriquecidas.filter(v => {
    const matchesFase = faseFilter === 'all' || v.fase_id === parseInt(faseFilter)
    const matchesVoto =
      votoFilter === 'all' ||
      (votoFilter === 'favor' && v.voto === true) ||
      (votoFilter === 'contra' && v.voto === false)

    return matchesFase && matchesVoto
  })

  // Estadísticas
  const totalVotos = votaciones.length
  const votosFavor = votaciones.filter(v => v.voto === true).length
  const votosContra = votaciones.filter(v => v.voto === false).length
  const porcentajeFavor = totalVotos > 0 ? ((votosFavor / totalVotos) * 100).toFixed(1) : 0

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Cargando votaciones...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">Total Votaciones</p>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalVotos}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">Votos a Favor</p>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{votosFavor}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">Votos en Contra</p>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{votosContra}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">% A Favor</p>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{porcentajeFavor}%</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Filtro por fase */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por fase
            </label>
            <select
              value={faseFilter}
              onChange={(e) => setFaseFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">Todas las fases</option>
              {fases.map(fase => (
                <option key={fase.id} value={fase.id}>{fase.nombre}</option>
              ))}
            </select>
          </div>

          {/* Filtro por tipo de voto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por voto
            </label>
            <select
              value={votoFilter}
              onChange={(e) => setVotoFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">Todos los votos</option>
              <option value="favor">A Favor</option>
              <option value="contra">En Contra</option>
            </select>
          </div>
        </div>

        <div className="text-sm text-gray-600 mt-3">
          Mostrando {votacionesFiltradas.length} de {totalVotos} votaciones
        </div>
      </div>

      {/* Tabla de votaciones */}
      {votacionesFiltradas.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No hay votaciones
          </h3>
          <p className="text-gray-600">
            {totalVotos === 0
              ? 'Aún no has emitido ninguna votación'
              : 'No hay votaciones que coincidan con los filtros seleccionados'
            }
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Artista</TableHeader>
                <TableHeader>Categoría</TableHeader>
                <TableHeader>Voto</TableHeader>
                <TableHeader>Fase</TableHeader>
                <TableHeader>Fecha</TableHeader>
                <TableHeader>Comentario</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {votacionesFiltradas.map(votacion => (
                <TableRow key={votacion.id}>
                  {/* Artista */}
                  <TableCell>
                    {votacion.artista ? (
                      <div className="flex items-center">
                        <img
                          src={votacion.artista.foto}
                          alt={votacion.artista.nombre}
                          className="w-10 h-10 rounded-full object-cover mr-3"
                        />
                        <div>
                          <div className="font-medium text-gray-900">
                            {votacion.artista.nombre} {votacion.artista.apellido}
                          </div>
                          <div className="text-xs text-gray-500">
                            {votacion.artista.ciudad}, {votacion.artista.pais}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">Artista no encontrado</span>
                    )}
                  </TableCell>

                  {/* Categoría */}
                  <TableCell>
                    {votacion.artista && (
                      <Badge variant="info">
                        {CATEGORIAS[votacion.artista.categoria]}
                      </Badge>
                    )}
                  </TableCell>

                  {/* Voto */}
                  <TableCell>
                    <Badge variant={votacion.voto ? 'success' : 'error'}>
                      {votacion.voto ? (
                        <>
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          A Favor
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          En Contra
                        </>
                      )}
                    </Badge>
                  </TableCell>

                  {/* Fase */}
                  <TableCell>
                    {votacion.fase ? (
                      <span className="text-sm text-gray-700">
                        {votacion.fase.nombre}
                      </span>
                    ) : (
                      <span className="text-gray-400">Fase no encontrada</span>
                    )}
                  </TableCell>

                  {/* Fecha */}
                  <TableCell className="text-sm text-gray-600">
                    {new Date(votacion.fecha).toLocaleDateString('es-MX', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </TableCell>

                  {/* Comentario */}
                  <TableCell>
                    {votacion.comentario ? (
                      <div className="max-w-xs">
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {votacion.comentario}
                        </p>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm italic">Sin comentarios</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
