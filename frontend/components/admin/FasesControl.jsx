'use client'

import { useFasesStore } from '@/stores/fasesStore'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

/**
 * FasesControl - Panel de control de fases
 *
 * Features:
 * - Ver todas las fases (3 fases + concurso)
 * - Abrir/cerrar inscripciones
 * - Abrir/cerrar votaciones
 * - Ver estadísticas de cada fase
 * - Finalizar fase
 *
 * DB: fases table
 * API:
 * - GET /api/fases
 * - PUT /api/fases/:id/inscripciones
 * - PUT /api/fases/:id/votaciones
 * - POST /api/fases/:id/finalizar
 */

export default function FasesControl() {
  const {
    fases,
    toggleInscripciones,
    toggleVotaciones,
    finalizarFase
  } = useFasesStore()

  const handleToggleInscripciones = async (faseId, currentState) => {
    const accion = currentState ? 'cerrar' : 'abrir'
    if (window.confirm(`¿Estás seguro de ${accion} las inscripciones?`)) {
      await toggleInscripciones(faseId, !currentState)
    }
  }

  const handleToggleVotaciones = async (faseId, currentState) => {
    const accion = currentState ? 'cerrar' : 'abrir'
    if (window.confirm(`¿Estás seguro de ${accion} las votaciones?`)) {
      await toggleVotaciones(faseId, !currentState)
    }
  }

  const handleFinalizarFase = async (faseId, faseNombre) => {
    if (window.confirm(`¿Estás seguro de finalizar ${faseNombre}? Esta acción no se puede deshacer.`)) {
      await finalizarFase(faseId)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getEstadoFase = (fase) => {
    if (fase.finalizada) return { label: 'Finalizada', variant: 'gray' }
    if (fase.votaciones_abiertas) return { label: 'Votaciones Abiertas', variant: 'success' }
    if (fase.inscripciones_abiertas) return { label: 'Inscripciones Abiertas', variant: 'info' }
    return { label: 'Inactiva', variant: 'gray' }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Control de Fases</h2>
          <p className="text-gray-600 mt-1">
            Gestiona las inscripciones y votaciones de cada fase
          </p>
        </div>
      </div>

      {/* Advertencia de control */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <svg
            className="h-5 w-5 text-yellow-400 mr-3"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <p className="text-sm text-yellow-700 font-medium">
              Importante: Solo una fase puede tener inscripciones o votaciones abiertas a la vez
            </p>
          </div>
        </div>
      </div>

      {/* Timeline de fases */}
      <div className="space-y-4">
        {fases.map((fase, index) => {
          const estado = getEstadoFase(fase)
          const porcentajeProgreso = fase.finalizada ? 100 :
            fase.votaciones_abiertas ? 75 :
            fase.inscripciones_abiertas ? 50 : 25

          return (
            <Card key={fase.id}>
              <div className="p-6">
                {/* Header de la fase */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center font-bold text-white
                        ${fase.tipo === 'concurso' ? 'bg-purple-600' : 'bg-red-600'}
                      `}>
                        {fase.tipo === 'concurso' ? '🏆' : fase.numero_fase}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {fase.nombre}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {fase.descripcion}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Badge variant={estado.variant}>
                    {estado.label}
                  </Badge>
                </div>

                {/* Barra de progreso */}
                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        fase.finalizada ? 'bg-gray-400' :
                        fase.votaciones_abiertas ? 'bg-green-500' :
                        fase.inscripciones_abiertas ? 'bg-blue-500' :
                        'bg-gray-300'
                      }`}
                      style={{ width: `${porcentajeProgreso}%` }}
                    />
                  </div>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Inscritos</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {fase.total_inscritos}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Seleccionados</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {fase.total_seleccionados}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Curadores</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {fase.total_curadores}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">
                      {fase.tipo === 'concurso' ? 'Ganadores' : '% Selección'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {fase.tipo === 'concurso' ? fase.max_artistas_seleccionados : `${fase.porcentaje_seleccion}%`}
                    </p>
                  </div>
                </div>

                {/* Fechas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                  {fase.fecha_inicio_inscripciones && (
                    <div>
                      <span className="text-gray-500">Inscripciones:</span>
                      <p className="font-medium text-gray-900">
                        {formatDate(fase.fecha_inicio_inscripciones)} - {formatDate(fase.fecha_fin_inscripciones)}
                      </p>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500">Votaciones:</span>
                    <p className="font-medium text-gray-900">
                      {formatDate(fase.fecha_inicio_votaciones)} - {formatDate(fase.fecha_fin_votaciones)}
                    </p>
                  </div>
                </div>

                {/* Acciones */}
                {!fase.finalizada && (
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                    {/* Control de inscripciones (solo fases, no concurso) */}
                    {fase.tipo === 'fase' && fase.numero_fase === 1 && (
                      <Button
                        variant={fase.inscripciones_abiertas ? 'secondary' : 'primary'}
                        size="sm"
                        onClick={() => handleToggleInscripciones(fase.id, fase.inscripciones_abiertas)}
                      >
                        {fase.inscripciones_abiertas ? (
                          <>
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Cerrar Inscripciones
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Abrir Inscripciones
                          </>
                        )}
                      </Button>
                    )}

                    {/* Control de votaciones */}
                    <Button
                      variant={fase.votaciones_abiertas ? 'secondary' : 'primary'}
                      size="sm"
                      onClick={() => handleToggleVotaciones(fase.id, fase.votaciones_abiertas)}
                    >
                      {fase.votaciones_abiertas ? (
                        <>
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Cerrar Votaciones
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Abrir Votaciones
                        </>
                      )}
                    </Button>

                    {/* Finalizar fase */}
                    {!fase.inscripciones_abiertas && !fase.votaciones_abiertas && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFinalizarFase(fase.id, fase.nombre)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Finalizar Fase
                      </Button>
                    )}
                  </div>
                )}

                {fase.finalizada && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Fase finalizada. Los artistas seleccionados han sido notificados.
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
