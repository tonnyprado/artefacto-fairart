'use client'

import { useState, useEffect } from 'react'
import { useVotacionesStore } from '@/stores/votacionesStore'
import { useCuradoresStore } from '@/stores/curadoresStore'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/Table'

export default function EstadisticasRonda({ ronda }) {
  const { getResultadosRonda } = useVotacionesStore()
  const { curadores, fetchCuradores } = useCuradoresStore()

  const [resultados, setResultados] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadData()
  }, [ronda.id])

  const loadData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await fetchCuradores()
      const result = await getResultadosRonda(ronda.id)
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando estadísticas...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
        {error}
      </div>
    )
  }

  if (!resultados) {
    return (
      <div className="text-center text-gray-600 py-8">
        No hay resultados disponibles.
      </div>
    )
  }

  const votacionesPorCurador = resultados.votaciones_por_curador || []
  const totalCuradores = curadores.length
  const curadoresQueVotaron = votacionesPorCurador.length
  const participacion = totalCuradores > 0 ? (curadoresQueVotaron / totalCuradores) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-2xl font-bold text-gray-900">
            Estadísticas Ronda {ronda.numero}
          </h2>
          <Badge variant={ronda.estado === 'abierta' ? 'success' : 'secondary'}>
            {ronda.estado === 'abierta' ? 'Abierta' : 'Cerrada'}
          </Badge>
        </div>
        <p className="text-gray-600">
          {getRondaNombre(ronda.numero)}
        </p>
      </div>

      {/* Métricas generales */}
      <Card>
        <CardHeader>
          <CardTitle>Participación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Curadores</p>
              <p className="text-3xl font-bold text-gray-900">{totalCuradores}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Han Votado</p>
              <p className="text-3xl font-bold text-red-600">{curadoresQueVotaron}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Participación</p>
              <p className="text-3xl font-bold text-gray-900">{participacion.toFixed(0)}%</p>
            </div>
            {ronda.numero === 2 && ronda.votos_asignados && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Votos Asignados</p>
                <p className="text-3xl font-bold text-gray-900">{ronda.votos_asignados}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detalle por curador */}
      <Card>
        <CardHeader>
          <CardTitle>Detalle por Curador</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Curador</TableHeader>
                <TableHeader>Estado</TableHeader>
                <TableHeader>Votos Emitidos</TableHeader>
                {ronda.numero === 1 && (
                  <>
                    <TableHeader>Sí (2)</TableHeader>
                    <TableHeader>Tal vez (1)</TableHeader>
                    <TableHeader>No (0)</TableHeader>
                  </>
                )}
                {ronda.numero === 3 && (
                  <>
                    <TableHeader>Sí (1)</TableHeader>
                    <TableHeader>No (0)</TableHeader>
                  </>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {curadores.map(curador => {
                const votacion = votacionesPorCurador.find(v => v.curador_id === curador.id)
                const haVotado = !!votacion

                return (
                  <TableRow key={curador.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">
                          {curador.nombre} {curador.apellido}
                        </p>
                        <p className="text-sm text-gray-500">{curador.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={haVotado ? 'success' : 'secondary'}>
                        {haVotado ? 'Completado' : 'Pendiente'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-gray-900">
                        {votacion?.total_votos || 0}
                      </span>
                    </TableCell>
                    {ronda.numero === 1 && (
                      <>
                        <TableCell>{votacion?.votos_si || 0}</TableCell>
                        <TableCell>{votacion?.votos_talvez || 0}</TableCell>
                        <TableCell>{votacion?.votos_no || 0}</TableCell>
                      </>
                    )}
                    {ronda.numero === 3 && (
                      <>
                        <TableCell>{votacion?.votos_si || 0}</TableCell>
                        <TableCell>{votacion?.votos_no || 0}</TableCell>
                      </>
                    )}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Resultados por postulación (solo ronda cerrada) */}
      {ronda.estado === 'cerrada' && resultados.postulaciones && resultados.postulaciones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados por Postulación</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Artista</TableHeader>
                  <TableHeader>Tipo</TableHeader>
                  {ronda.numero === 1 && <TableHeader>Índice R1</TableHeader>}
                  {ronda.numero === 2 && <TableHeader>Respaldo R2</TableHeader>}
                  {ronda.numero === 3 && <TableHeader>Aprobación R3</TableHeader>}
                  <TableHeader>Votos Totales</TableHeader>
                  <TableHeader>Estado Resultante</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {resultados.postulaciones.map(p => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">
                          {p.nombre} {p.apellido}
                        </p>
                        <p className="text-sm text-gray-500">{p.disciplina}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={p.tipo === '2d' ? 'primary' : 'secondary'}>
                        {p.tipo.toUpperCase()}
                      </Badge>
                    </TableCell>
                    {ronda.numero === 1 && (
                      <TableCell>
                        <span className="font-medium text-gray-900">
                          {p.indice_r1 !== null ? (p.indice_r1 * 100).toFixed(1) + '%' : '-'}
                        </span>
                      </TableCell>
                    )}
                    {ronda.numero === 2 && (
                      <TableCell>
                        <span className="font-medium text-gray-900">
                          {p.respaldo_r2 !== null ? (p.respaldo_r2 * 100).toFixed(1) + '%' : '-'}
                        </span>
                      </TableCell>
                    )}
                    {ronda.numero === 3 && (
                      <TableCell>
                        <span className="font-medium text-gray-900">
                          {p.aprobacion_r3 !== null ? (p.aprobacion_r3 * 100).toFixed(1) + '%' : '-'}
                        </span>
                      </TableCell>
                    )}
                    <TableCell>{p.total_votos || 0}</TableCell>
                    <TableCell>
                      <Badge variant={getEstadoBadgeVariant(p.estado)}>
                        {getEstadoLabel(p.estado)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Nota para ronda abierta */}
      {ronda.estado === 'abierta' && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl">
          <p className="text-sm">
            Los resultados detallados por postulación estarán disponibles cuando se cierre la ronda.
            Sistema de voto ciego activo.
          </p>
        </div>
      )}
    </div>
  )
}

function getRondaNombre(numero) {
  switch (numero) {
    case 1: return 'Cribado'
    case 2: return 'Votos Limitados'
    case 3: return 'Deliberación'
    default: return `Ronda ${numero}`
  }
}

function getEstadoLabel(estado) {
  const labels = {
    'admitida': 'Admitida',
    'shortlist': 'Shortlist',
    'reserva': 'Reserva',
    'deliberacion': 'Deliberación',
    'seleccionada': 'Seleccionada',
    'no_continua': 'No Continúa'
  }
  return labels[estado] || estado
}

function getEstadoBadgeVariant(estado) {
  switch (estado) {
    case 'seleccionada':
      return 'success'
    case 'shortlist':
    case 'deliberacion':
      return 'warning'
    case 'reserva':
      return 'secondary'
    case 'no_continua':
      return 'default'
    default:
      return 'default'
  }
}
