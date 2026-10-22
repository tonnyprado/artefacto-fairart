'use client'

import { useState, useEffect } from 'react'
import { useVotacionesStore } from '@/stores/votacionesStore'
import { useRondasStore } from '@/stores/rondasStore'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'

/**
 * ResultadosFases - Resultados de rondas cerradas
 *
 * Muestra los resultados de rondas que ya han sido cerradas
 * Con estadísticas de votación por ronda
 */

export default function ResultadosFases() {
  const { getResultadosRonda } = useVotacionesStore()
  const { rondas, fetchRondas } = useRondasStore()

  const [selectedRondaId, setSelectedRondaId] = useState(null)
  const [resultados, setResultados] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Obtener rondas cerradas
  const rondasCerradas = rondas.filter(r => r.estado === 'cerrada')

  // Cargar rondas al montar
  useEffect(() => {
    fetchRondas()
  }, [])

  // Seleccionar primera ronda cerrada por defecto
  useEffect(() => {
    if (rondasCerradas.length > 0 && !selectedRondaId) {
      setSelectedRondaId(rondasCerradas[0].id)
    }
  }, [rondasCerradas])

  // Cargar resultados cuando cambia la ronda seleccionada
  useEffect(() => {
    if (selectedRondaId) {
      loadResultados()
    }
  }, [selectedRondaId])

  const loadResultados = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await getResultadosRonda(selectedRondaId)
      if (result.success) {
        setResultados(result.data)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const rondaSeleccionada = rondas.find(r => r.id === selectedRondaId)

  if (rondasCerradas.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No hay rondas cerradas
        </h3>
        <p className="text-gray-600">
          Los resultados aparecerán aquí una vez que se cierren las rondas
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Selector de ronda */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Historial de Resultados</h2>
          <div className="w-64">
            <select
              value={selectedRondaId || ''}
              onChange={(e) => setSelectedRondaId(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {rondasCerradas.map(ronda => (
                <option key={ronda.id} value={ronda.id}>
                  Ronda {ronda.numero} - {ronda.fase_nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {rondaSeleccionada && resultados && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Ronda</p>
              <p className="text-2xl font-bold text-gray-900">Ronda {rondaSeleccionada.numero}</p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Total Artistas Votados</p>
              <p className="text-2xl font-bold text-blue-700">{resultados.postulaciones?.length || 0}</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Curadores Participantes</p>
              <p className="text-2xl font-bold text-green-700">{resultados.votaciones_por_curador?.length || 0}</p>
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
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      ) : !resultados || !resultados.postulaciones || resultados.postulaciones.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">No hay resultados para esta ronda</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Posición</TableHeader>
                  <TableHeader>Artista</TableHeader>
                  <TableHeader>Disciplina</TableHeader>
                  <TableHeader>Tipo</TableHeader>

                  {rondaSeleccionada.numero === 1 && (
                    <>
                      <TableHeader>Sí (2)</TableHeader>
                      <TableHeader>Tal vez (1)</TableHeader>
                      <TableHeader>No (0)</TableHeader>
                      <TableHeader>Índice</TableHeader>
                    </>
                  )}

                  {rondaSeleccionada.numero === 2 && (
                    <>
                      <TableHeader>Votos a Favor</TableHeader>
                      <TableHeader>Respaldo</TableHeader>
                    </>
                  )}

                  {rondaSeleccionada.numero === 3 && (
                    <>
                      <TableHeader>Sí</TableHeader>
                      <TableHeader>No</TableHeader>
                      <TableHeader>Aprobación</TableHeader>
                    </>
                  )}

                  <TableHeader>Estado</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {resultados.postulaciones.map((resultado, index) => (
                  <TableRow key={resultado.postulacion_id}>
                    {/* Posición */}
                    <TableCell>
                      <div className="flex items-center justify-center">
                        {index === 0 && <span className="text-2xl">🥇</span>}
                        {index === 1 && <span className="text-2xl">🥈</span>}
                        {index === 2 && <span className="text-2xl">🥉</span>}
                        {index > 2 && (
                          <span className="text-lg font-bold text-gray-700">
                            {index + 1}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Artista */}
                    <TableCell>
                      <div className="flex items-center">
                        {resultado.artista_foto && (
                          <img
                            src={resultado.artista_foto}
                            alt={resultado.nombre}
                            className="w-12 h-12 rounded-full object-cover mr-3"
                          />
                        )}
                        <div>
                          <div className="font-medium text-gray-900">
                            {resultado.nombre} {resultado.apellido}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Disciplina */}
                    <TableCell>
                      <span className="text-sm text-gray-600">{resultado.disciplina}</span>
                    </TableCell>

                    {/* Tipo */}
                    <TableCell>
                      <Badge variant={resultado.tipo === '2d' ? 'primary' : 'secondary'}>
                        {resultado.tipo?.toUpperCase()}
                      </Badge>
                    </TableCell>

                    {/* Columnas específicas según ronda */}
                    {rondaSeleccionada.numero === 1 && (
                      <>
                        <TableCell>{resultado.votos_si || 0}</TableCell>
                        <TableCell>{resultado.votos_tal_vez || 0}</TableCell>
                        <TableCell>{resultado.votos_no || 0}</TableCell>
                        <TableCell>
                          <span className="font-medium">
                            {resultado.indice_calculado !== null && resultado.indice_calculado !== undefined
                              ? (resultado.indice_calculado * 100).toFixed(1) + '%'
                              : '-'}
                          </span>
                        </TableCell>
                      </>
                    )}

                    {rondaSeleccionada.numero === 2 && (
                      <>
                        <TableCell>{resultado.votos_favor || 0}</TableCell>
                        <TableCell>
                          <span className="font-medium">
                            {resultado.respaldo_r2 !== null && resultado.respaldo_r2 !== undefined
                              ? (resultado.respaldo_r2 * 100).toFixed(1) + '%'
                              : '-'}
                          </span>
                        </TableCell>
                      </>
                    )}

                    {rondaSeleccionada.numero === 3 && (
                      <>
                        <TableCell>{resultado.votos_si || 0}</TableCell>
                        <TableCell>{resultado.votos_no || 0}</TableCell>
                        <TableCell>
                          <span className="font-medium">
                            {resultado.aprobacion_calculada !== null && resultado.aprobacion_calculada !== undefined
                              ? (resultado.aprobacion_calculada * 100).toFixed(1) + '%'
                              : '-'}
                          </span>
                        </TableCell>
                      </>
                    )}

                    {/* Estado */}
                    <TableCell>
                      <Badge variant={getEstadoBadgeVariant(resultado.estado)}>
                        {getEstadoLabel(resultado.estado)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  )
}

function getEstadoBadgeVariant(estado) {
  switch (estado) {
    case 'seleccionada':
    case 'shortlist':
      return 'success'
    case 'reserva':
    case 'deliberacion':
      return 'warning'
    case 'no_continua':
      return 'secondary'
    default:
      return 'info'
  }
}

function getEstadoLabel(estado) {
  const labels = {
    'admitida': 'Admitida',
    'shortlist': 'Shortlist',
    'reserva': 'Reserva',
    'deliberacion': 'Deliberación',
    'seleccionada': 'Seleccionada',
    'no_continua': 'No Continúa',
    'ronda_1': 'Ronda 1',
    'ronda_2': 'Ronda 2',
    'ronda_3': 'Ronda 3'
  }
  return labels[estado] || estado
}
