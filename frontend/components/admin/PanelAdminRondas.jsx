'use client'

import { useState, useEffect } from 'react'
import { useRondasStore } from '@/stores/rondasStore'
import { useFasesStore } from '@/stores/fasesStore'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/Table'
import Modal from '@/components/ui/Modal'
import EstadisticasRonda from './EstadisticasRonda'

export default function PanelAdminRondas({ faseId }) {
  const { fetchRondasPorFase, rondas, createRonda, abrirRonda, cerrarRonda, deleteRonda } = useRondasStore()
  const { fetchFaseById } = useFasesStore()

  const [fase, setFase] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEstadisticas, setShowEstadisticas] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadData()
  }, [faseId])

  const loadData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await fetchFaseById(faseId)
      if (result.success) {
        setFase(result.data)
      } else {
        setError(result.error)
      }
      await fetchRondasPorFase(faseId)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAbrirRonda = async (rondaId) => {
    if (!confirm('¿Estás seguro de abrir esta ronda? Se cerrarán las demás rondas abiertas.')) {
      return
    }

    setError(null)
    const result = await abrirRonda(rondaId)
    if (result.success) {
      loadData()
    } else {
      setError(result.error)
    }
  }

  const handleCerrarRonda = async (rondaId) => {
    if (!confirm('¿Estás seguro de cerrar esta ronda? Se calcularán los resultados automáticamente y NO se podrá reabrir.')) {
      return
    }

    setError(null)
    const result = await cerrarRonda(rondaId)
    if (result.success) {
      alert(`Ronda cerrada exitosamente.\n\nTotal votantes: ${result.data.total_votantes}\nQuórum requerido: ${result.data.quorum_requerido}`)
      loadData()
    } else {
      setError(result.error)
    }
  }

  const handleEliminarRonda = async (rondaId) => {
    if (!confirm('¿Estás seguro de eliminar esta ronda? Solo se pueden eliminar rondas sin votos.')) {
      return
    }

    setError(null)
    const result = await deleteRonda(rondaId)
    if (result.success) {
      loadData()
    } else {
      setError(result.error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando rondas...</p>
        </div>
      </div>
    )
  }

  const rondasFase = rondas.filter(r => r.fase_id === parseInt(faseId))
  const config = fase?.config_json || {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Gestión de Rondas
          </h2>
          <p className="text-gray-600 mt-1">
            {fase?.nombre}
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          Crear Ronda
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Configuración de fase */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Fase</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Curadores</p>
              <p className="text-lg font-bold text-gray-900">{config.curadores || 6}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Quórum</p>
              <p className="text-lg font-bold text-gray-900">{config.quorum || 5}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Cupo 2D</p>
              <p className="text-lg font-bold text-gray-900">{config.cupo_2d || 8}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Cupo 3D</p>
              <p className="text-lg font-bold text-gray-900">{config.cupo_3d || 'Libre'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Umbral R1</p>
              <p className="text-lg font-bold text-gray-900">{(config.umbral_r1 * 100) || 60}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Votos R2</p>
              <p className="text-lg font-bold text-gray-900">{config.votos_r2 || 10}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Umbral Consenso</p>
              <p className="text-lg font-bold text-gray-900">{(config.umbral_consenso * 100) || 80}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Cortesía Max</p>
              <p className="text-lg font-bold text-gray-900">{config.cortesia_max || 4}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de rondas */}
      <Card>
        <CardHeader>
          <CardTitle>Rondas de Votación</CardTitle>
        </CardHeader>
        <CardContent>
          {rondasFase.length === 0 ? (
            <p className="text-center text-gray-600 py-8">
              No hay rondas creadas. Click en "Crear Ronda" para comenzar.
            </p>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Ronda</TableHeader>
                  <TableHeader>Estado</TableHeader>
                  <TableHeader>Votos Asignados (R2)</TableHeader>
                  <TableHeader>Fecha Apertura</TableHeader>
                  <TableHeader>Fecha Cierre</TableHeader>
                  <TableHeader>Acciones</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {rondasFase.sort((a, b) => a.numero - b.numero).map(ronda => (
                  <TableRow key={ronda.id}>
                    <TableCell>
                      <span className="font-medium">
                        Ronda {ronda.numero}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={ronda.estado === 'abierta' ? 'success' : 'secondary'}>
                        {ronda.estado === 'abierta' ? 'Abierta' : 'Cerrada'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {ronda.votos_asignados || 'Sin límite'}
                    </TableCell>
                    <TableCell>
                      {ronda.fecha_apertura
                        ? new Date(ronda.fecha_apertura).toLocaleString('es-MX', {
                            dateStyle: 'short',
                            timeStyle: 'short'
                          })
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {ronda.fecha_cierre
                        ? new Date(ronda.fecha_cierre).toLocaleString('es-MX', {
                            dateStyle: 'short',
                            timeStyle: 'short'
                          })
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {ronda.estado === 'cerrada' ? (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setShowEstadisticas(ronda)}
                            >
                              Ver Estadísticas
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleEliminarRonda(ronda.id)}
                            >
                              Eliminar
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleCerrarRonda(ronda.id)}
                            >
                              Cerrar Ronda
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setShowEstadisticas(ronda)}
                            >
                              Ver Estadísticas
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal crear ronda */}
      {showCreateModal && (
        <ModalCrearRonda
          faseId={faseId}
          onClose={() => setShowCreateModal(false)}
          onCreate={async (data) => {
            const result = await createRonda(data)
            if (result.success) {
              setShowCreateModal(false)
              loadData()

              // Preguntar si quiere abrir la ronda inmediatamente
              if (confirm('Ronda creada. ¿Deseas abrirla ahora?')) {
                await handleAbrirRonda(result.ronda.id)
              }
            } else {
              alert(result.error)
            }
          }}
        />
      )}

      {/* Modal estadísticas */}
      {showEstadisticas && (
        <Modal onClose={() => setShowEstadisticas(null)} maxWidth="6xl">
          <EstadisticasRonda ronda={showEstadisticas} />
        </Modal>
      )}
    </div>
  )
}

function ModalCrearRonda({ faseId, onClose, onCreate }) {
  const [numero, setNumero] = useState(1)
  const [votosAsignados, setVotosAsignados] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onCreate({
      fase_id: parseInt(faseId),
      numero: parseInt(numero),
      votos_asignados: votosAsignados ? parseInt(votosAsignados) : null
    })
  }

  return (
    <Modal onClose={onClose} maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Crear Nueva Ronda
          </h3>
          <p className="text-gray-600">
            Define los parámetros de la ronda de votación
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Número de Ronda
          </label>
          <select
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          >
            <option value={1}>Ronda 1 - Cribado</option>
            <option value={2}>Ronda 2 - Votos Limitados</option>
            <option value={3}>Ronda 3 - Deliberación</option>
          </select>
        </div>

        {numero === 2 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Votos Asignados por Curador
            </label>
            <input
              type="number"
              value={votosAsignados}
              onChange={(e) => setVotosAsignados(e.target.value)}
              placeholder="10"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
              min="1"
            />
            <p className="text-sm text-gray-500 mt-1">
              Número máximo de votos que puede emitir cada curador (ej: 10)
            </p>
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">
            Crear Ronda
          </Button>
        </div>
      </form>
    </Modal>
  )
}
