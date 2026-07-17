'use client'

import { useState, useEffect } from 'react'
import { useVotacionesStore } from '@/stores/votacionesStore'
import { useArtistasStore } from '@/stores/artistasStore'
import { useFasesStore } from '@/stores/fasesStore'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'

/**
 * ResultadosFases - Resultados de fases finalizadas
 *
 * Muestra el ranking de artistas de fases finalizadas
 * Con estadísticas de votación y estado de selección
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

export default function ResultadosFases() {
  const { getResultadosFase } = useVotacionesStore()
  const artistas = useArtistasStore(state => state.artistas)
  const fases = useFasesStore(state => state.fases)

  const [selectedFaseId, setSelectedFaseId] = useState(null)
  const [resultados, setResultados] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Obtener solo fases finalizadas
  const fasesFinalizadas = fases.filter(f => f.finalizada)

  // Seleccionar primera fase finalizada por defecto
  useEffect(() => {
    if (fasesFinalizadas.length > 0 && !selectedFaseId) {
      setSelectedFaseId(fasesFinalizadas[0].id)
    }
  }, [fasesFinalizadas])

  // Cargar resultados cuando cambia la fase seleccionada
  useEffect(() => {
    if (selectedFaseId) {
      loadResultados()
    }
  }, [selectedFaseId])

  const loadResultados = async () => {
    setIsLoading(true)
    const data = await getResultadosFase(selectedFaseId)
    setResultados(data)
    setIsLoading(false)
  }

  // Enriquecer resultados con datos de artistas
  const resultadosEnriquecidos = resultados.map(r => {
    const artista = artistas.find(a => a.id === r.artista_id)
    return {
      ...r,
      artista
    }
  })

  const faseSeleccionada = fases.find(f => f.id === selectedFaseId)

  // Calcular cuántos fueron seleccionados (top 20%)
  const totalParticipantes = resultados.length
  const cantidadSeleccionados = Math.ceil(totalParticipantes * 0.20)

  if (fasesFinalizadas.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No hay fases finalizadas
        </h3>
        <p className="text-gray-600">
          Los resultados aparecerán aquí una vez que se finalicen las fases
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Selector de fase */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Resultados de Fases</h2>
          <div className="w-64">
            <select
              value={selectedFaseId || ''}
              onChange={(e) => setSelectedFaseId(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {fasesFinalizadas.map(fase => (
                <option key={fase.id} value={fase.id}>
                  {fase.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {faseSeleccionada && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Total Participantes</p>
              <p className="text-2xl font-bold text-gray-900">{totalParticipantes}</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Seleccionados (Top 20%)</p>
              <p className="text-2xl font-bold text-green-700">{cantidadSeleccionados}</p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Curadores Votantes</p>
              <p className="text-2xl font-bold text-blue-700">{faseSeleccionada.total_curadores}</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">% Selección</p>
              <p className="text-2xl font-bold text-purple-700">{faseSeleccionada.porcentaje_seleccion}%</p>
            </div>
          </div>
        )}
      </div>

      {/* Tabla de resultados */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12 bg-white rounded-lg shadow">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600">Cargando resultados...</p>
          </div>
        </div>
      ) : resultados.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">No hay resultados para esta fase</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader className="w-20">Posición</TableHeader>
                  <TableHeader>Artista</TableHeader>
                  <TableHeader>Categoría</TableHeader>
                  <TableHeader>Votos a Favor</TableHeader>
                  <TableHeader>Votos en Contra</TableHeader>
                  <TableHeader>Total Votos</TableHeader>
                  <TableHeader>% Aprobación</TableHeader>
                  <TableHeader>Estado</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {resultadosEnriquecidos.map((resultado, index) => {
                  const esSeleccionado = index < cantidadSeleccionados
                  const totalVotos = resultado.total_votos_favor + resultado.total_votos_contra

                  return (
                    <TableRow
                      key={resultado.artista_id}
                      className={esSeleccionado ? 'bg-green-50' : ''}
                    >
                      {/* Posición */}
                      <TableCell>
                        <div className="flex items-center justify-center">
                          {index === 0 && (
                            <span className="text-2xl">🥇</span>
                          )}
                          {index === 1 && (
                            <span className="text-2xl">🥈</span>
                          )}
                          {index === 2 && (
                            <span className="text-2xl">🥉</span>
                          )}
                          {index > 2 && (
                            <span className="text-lg font-bold text-gray-700">
                              {resultado.posicion}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Artista */}
                      <TableCell>
                        {resultado.artista ? (
                          <div className="flex items-center">
                            <img
                              src={resultado.artista.foto}
                              alt={resultado.artista.nombre}
                              className="w-12 h-12 rounded-full object-cover mr-3"
                            />
                            <div>
                              <div className="font-medium text-gray-900">
                                {resultado.artista.nombre} {resultado.artista.apellido}
                              </div>
                              <div className="text-xs text-gray-500">
                                {resultado.artista.ciudad}, {resultado.artista.pais}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">Artista no encontrado</span>
                        )}
                      </TableCell>

                      {/* Categoría */}
                      <TableCell>
                        {resultado.artista && (
                          <Badge variant="info">
                            {CATEGORIAS[resultado.artista.categoria]}
                          </Badge>
                        )}
                      </TableCell>

                      {/* Votos a favor */}
                      <TableCell>
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-green-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="font-semibold text-green-700">
                            {resultado.total_votos_favor}
                          </span>
                        </div>
                      </TableCell>

                      {/* Votos en contra */}
                      <TableCell>
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-red-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <span className="font-semibold text-red-700">
                            {resultado.total_votos_contra}
                          </span>
                        </div>
                      </TableCell>

                      {/* Total votos */}
                      <TableCell>
                        <span className="font-medium text-gray-900">{totalVotos}</span>
                      </TableCell>

                      {/* Porcentaje aprobación */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                            <div
                              className={`h-2 rounded-full ${
                                parseFloat(resultado.porcentaje_aprobacion) >= 50
                                  ? 'bg-green-600'
                                  : 'bg-red-600'
                              }`}
                              style={{ width: `${resultado.porcentaje_aprobacion}%` }}
                            />
                          </div>
                          <span className="font-semibold text-gray-900">
                            {resultado.porcentaje_aprobacion}%
                          </span>
                        </div>
                      </TableCell>

                      {/* Estado */}
                      <TableCell>
                        {esSeleccionado ? (
                          <Badge variant="success">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Seleccionado
                          </Badge>
                        ) : (
                          <Badge variant="gray">
                            No seleccionado
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {/* Leyenda */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-100 rounded mr-2"></div>
                <span>Fila verde = Artista seleccionado (Top 20%)</span>
              </div>
              <div className="flex items-center">
                <span className="text-lg mr-2">🥇🥈🥉</span>
                <span>Top 3 posiciones</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
