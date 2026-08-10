'use client'

import { useState, useEffect } from 'react'
import { useEdicionesStore } from '@/stores/edicionesStore'
import { useFasesStore } from '@/stores/fasesStore'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

/**
 * EdicionesControl - Panel de control de ediciones y sus fases
 *
 * Features:
 * - Ver todas las ediciones
 * - Crear nueva edición
 * - Marcar edición como activa
 * - Ver y gestionar fases de cada edición
 * - Crear fases dentro de una edición
 * - Toggle inscripciones/votaciones
 *
 * DB: ediciones table, fases table
 */

export default function EdicionesControl() {
  const {
    ediciones,
    fetchEdiciones,
    createEdicion,
    updateEdicion,
    deleteEdicion
  } = useEdicionesStore()

  const {
    fases,
    fetchFases,
    createFase,
    toggleInscripciones,
    toggleVotaciones,
    finalizarFase
  } = useFasesStore()

  const [showForm, setShowForm] = useState(false)
  const [expandedEdicion, setExpandedEdicion] = useState(null)
  const [showFaseForm, setShowFaseForm] = useState(null)

  const [edicionFormData, setEdicionFormData] = useState({
    nombre: '',
    anio: new Date().getFullYear(),
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    activa: false
  })

  const [faseFormData, setFaseFormData] = useState({
    nombre: '',
    descripcion: '',
    tipo: 'fase',
    numero_fase: 1,
    fecha_inicio_inscripciones: '',
    fecha_fin_inscripciones: '',
    fecha_inicio_votaciones: '',
    fecha_fin_votaciones: '',
    porcentaje_seleccion: 20,
    max_artistas_seleccionados: null
  })

  useEffect(() => {
    fetchEdiciones()
    fetchFases()
  }, [fetchEdiciones, fetchFases])

  const handleSubmitEdicion = async (e) => {
    e.preventDefault()
    const result = await createEdicion(edicionFormData)
    if (result.success) {
      setShowForm(false)
      setEdicionFormData({
        nombre: '',
        anio: new Date().getFullYear(),
        descripcion: '',
        fecha_inicio: '',
        fecha_fin: '',
        activa: false
      })
      fetchEdiciones()
    }
  }

  const handleSubmitFase = async (e, edicionId) => {
    e.preventDefault()
    const faseData = {
      ...faseFormData,
      edicion_id: edicionId
    }
    const result = await createFase(faseData)
    if (result.success) {
      setShowFaseForm(null)
      setFaseFormData({
        nombre: '',
        descripcion: '',
        tipo: 'fase',
        numero_fase: 1,
        fecha_inicio_inscripciones: '',
        fecha_fin_inscripciones: '',
        fecha_inicio_votaciones: '',
        fecha_fin_votaciones: '',
        porcentaje_seleccion: 20,
        max_artistas_seleccionados: null
      })
      fetchFases()
    }
  }

  const handleMarcarActiva = async (edicionId) => {
    if (window.confirm('¿Estás seguro de marcar esta edición como activa? Esto desactivará las demás ediciones.')) {
      await updateEdicion(edicionId, { activa: true })
      fetchEdiciones()
    }
  }

  const handleEliminar = async (edicionId, edicionNombre, totalFases) => {
    let confirmed = false
    let force = false

    if (totalFases > 0) {
      confirmed = window.confirm(
        `⚠️ ADVERTENCIA ⚠️\n\n` +
        `"${edicionNombre}" tiene ${totalFases} fase(s) asociada(s).\n\n` +
        `Si eliminas esta edición, también se eliminarán TODAS sus fases y datos asociados.\n\n` +
        `Esta acción NO se puede deshacer.\n\n` +
        `¿Estás COMPLETAMENTE seguro de continuar?`
      )
      force = true
    } else {
      confirmed = window.confirm(
        `¿Estás seguro de eliminar "${edicionNombre}"?\n\n` +
        `Esta acción no se puede deshacer.`
      )
    }

    if (confirmed) {
      const result = await deleteEdicion(edicionId, force)
      if (result.success) {
        fetchEdiciones()
        fetchFases()
      } else if (result.error) {
        alert(`Error al eliminar: ${result.error}`)
      }
    }
  }

  const handleToggleInscripciones = async (faseId, currentState) => {
    const accion = currentState ? 'cerrar' : 'abrir'
    if (window.confirm(`¿Estás seguro de ${accion} las inscripciones?`)) {
      await toggleInscripciones(faseId, !currentState)
      fetchFases()
    }
  }

  const handleToggleVotaciones = async (faseId, currentState) => {
    const accion = currentState ? 'cerrar' : 'abrir'
    if (window.confirm(`¿Estás seguro de ${accion} las votaciones?`)) {
      await toggleVotaciones(faseId, !currentState)
      fetchFases()
    }
  }

  const handleFinalizarFase = async (faseId, faseNombre) => {
    if (window.confirm(`¿Estás seguro de finalizar ${faseNombre}? Esta acción no se puede deshacer.`)) {
      await finalizarFase(faseId)
      fetchFases()
    }
  }

  const getFasesDeEdicion = (edicionId) => {
    return fases.filter(f => f.edicion_id === edicionId)
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
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Ediciones y Fases</h2>
          <p className="text-gray-600 mt-1">
            Administra las ediciones de ARTEFACT y sus fases de selección
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : '+ Nueva Edición'}
        </Button>
      </div>

      {/* Formulario de creación de edición */}
      {showForm && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Crear Nueva Edición
            </h3>
            <form onSubmit={handleSubmitEdicion} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={edicionFormData.nombre}
                    onChange={(e) => setEdicionFormData({ ...edicionFormData, nombre: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="ARTEFACT 2027"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Año
                  </label>
                  <input
                    type="number"
                    value={edicionFormData.anio}
                    onChange={(e) => setEdicionFormData({ ...edicionFormData, anio: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={edicionFormData.descripcion}
                    onChange={(e) => setEdicionFormData({ ...edicionFormData, descripcion: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha Inicio
                  </label>
                  <input
                    type="date"
                    value={edicionFormData.fecha_inicio}
                    onChange={(e) => setEdicionFormData({ ...edicionFormData, fecha_inicio: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha Fin
                  </label>
                  <input
                    type="date"
                    value={edicionFormData.fecha_fin}
                    onChange={(e) => setEdicionFormData({ ...edicionFormData, fecha_fin: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>

                <div className="md:col-span-2 flex items-center">
                  <input
                    type="checkbox"
                    id="activa"
                    checked={edicionFormData.activa}
                    onChange={(e) => setEdicionFormData({ ...edicionFormData, activa: e.target.checked })}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label htmlFor="activa" className="ml-2 block text-sm text-gray-900">
                    Marcar como edición activa
                  </label>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit">
                  Crear Edición
                </Button>
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </Card>
      )}

      {/* Lista de ediciones */}
      <div className="space-y-4">
        {ediciones.map((edicion) => {
          const fasesEdicion = getFasesDeEdicion(edicion.id)
          const isExpanded = expandedEdicion === edicion.id

          return (
            <Card key={edicion.id}>
              <div className="p-6">
                {/* Header de la edición */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center font-bold text-white">
                        {edicion.anio}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {edicion.nombre}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {edicion.descripcion}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Badge variant={edicion.activa ? 'success' : 'gray'}>
                    {edicion.activa ? 'Activa' : 'Inactiva'}
                  </Badge>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-gray-50 p-3 rounded-2xl">
                    <p className="text-xs text-gray-500 mb-1">Total Fases</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {fasesEdicion.length}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-2xl">
                    <p className="text-xs text-gray-500 mb-1">Fases Activas</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {fasesEdicion.filter(f => !f.finalizada && (f.inscripciones_abiertas || f.votaciones_abiertas)).length}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-2xl">
                    <p className="text-xs text-gray-500 mb-1">Fases Finalizadas</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {fasesEdicion.filter(f => f.finalizada).length}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-2xl">
                    <p className="text-xs text-gray-500 mb-1">Periodo</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(edicion.fecha_inicio)} - {formatDate(edicion.fecha_fin)}
                    </p>
                  </div>
                </div>

                {/* Acciones principales */}
                <div className="flex flex-wrap gap-2 pb-4 border-b border-gray-200">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setExpandedEdicion(isExpanded ? null : edicion.id)}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    {isExpanded ? 'Ocultar Fases' : `Ver Fases (${fasesEdicion.length})`}
                  </Button>

                  {!edicion.activa && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleMarcarActiva(edicion.id)}
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Marcar como Activa
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEliminar(edicion.id, edicion.nombre, fasesEdicion.length)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Eliminar {fasesEdicion.length > 0 && `(${fasesEdicion.length} fases)`}
                  </Button>
                </div>

                {/* Sección de fases (expandible) */}
                {isExpanded && (
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-md font-semibold text-gray-900">
                        Fases de {edicion.nombre}
                      </h4>
                      <Button
                        size="sm"
                        onClick={() => setShowFaseForm(showFaseForm === edicion.id ? null : edicion.id)}
                      >
                        {showFaseForm === edicion.id ? 'Cancelar' : '+ Nueva Fase'}
                      </Button>
                    </div>

                    {/* Formulario de nueva fase */}
                    {showFaseForm === edicion.id && (
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h5 className="text-sm font-semibold text-gray-900 mb-3">
                          Crear Nueva Fase
                        </h5>
                        <form onSubmit={(e) => handleSubmitFase(e, edicion.id)} className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Nombre de la Fase
                              </label>
                              <input
                                type="text"
                                value={faseFormData.nombre}
                                onChange={(e) => setFaseFormData({ ...faseFormData, nombre: e.target.value })}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="Fase 1 - Selección Inicial"
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Tipo
                              </label>
                              <select
                                value={faseFormData.tipo}
                                onChange={(e) => setFaseFormData({ ...faseFormData, tipo: e.target.value })}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                              >
                                <option value="fase">Fase</option>
                                <option value="concurso">Concurso</option>
                              </select>
                            </div>

                            <div className="md:col-span-2">
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Descripción
                              </label>
                              <textarea
                                value={faseFormData.descripcion}
                                onChange={(e) => setFaseFormData({ ...faseFormData, descripcion: e.target.value })}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                rows={2}
                              />
                            </div>

                            {faseFormData.tipo === 'fase' && (
                              <>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Número de Fase
                                  </label>
                                  <input
                                    type="number"
                                    value={faseFormData.numero_fase}
                                    onChange={(e) => setFaseFormData({ ...faseFormData, numero_fase: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                    min="1"
                                    required
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    % Selección
                                  </label>
                                  <input
                                    type="number"
                                    value={faseFormData.porcentaje_seleccion}
                                    onChange={(e) => setFaseFormData({ ...faseFormData, porcentaje_seleccion: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                    min="1"
                                    max="100"
                                    required
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Inicio Inscripciones
                                  </label>
                                  <input
                                    type="date"
                                    value={faseFormData.fecha_inicio_inscripciones}
                                    onChange={(e) => setFaseFormData({ ...faseFormData, fecha_inicio_inscripciones: e.target.value })}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Fin Inscripciones
                                  </label>
                                  <input
                                    type="date"
                                    value={faseFormData.fecha_fin_inscripciones}
                                    onChange={(e) => setFaseFormData({ ...faseFormData, fecha_fin_inscripciones: e.target.value })}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                  />
                                </div>
                              </>
                            )}

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Inicio Votaciones
                              </label>
                              <input
                                type="date"
                                value={faseFormData.fecha_inicio_votaciones}
                                onChange={(e) => setFaseFormData({ ...faseFormData, fecha_inicio_votaciones: e.target.value })}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Fin Votaciones
                              </label>
                              <input
                                type="date"
                                value={faseFormData.fecha_fin_votaciones}
                                onChange={(e) => setFaseFormData({ ...faseFormData, fecha_fin_votaciones: e.target.value })}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                required
                              />
                            </div>

                            {faseFormData.tipo === 'concurso' && (
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Máx. Artistas Seleccionados
                                </label>
                                <input
                                  type="number"
                                  value={faseFormData.max_artistas_seleccionados || ''}
                                  onChange={(e) => setFaseFormData({ ...faseFormData, max_artistas_seleccionados: parseInt(e.target.value) })}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                  min="1"
                                />
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2 pt-2">
                            <Button type="submit" size="sm">
                              Crear Fase
                            </Button>
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={() => setShowFaseForm(null)}
                            >
                              Cancelar
                            </Button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* Lista de fases */}
                    {fasesEdicion.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-gray-500">
                          No hay fases en esta edición. Crea la primera fase.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {fasesEdicion.map((fase) => {
                          const estado = getEstadoFase(fase)
                          return (
                            <div key={fase.id} className="bg-white border border-gray-200 rounded-lg p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm ${
                                      fase.tipo === 'concurso' ? 'bg-purple-600' : 'bg-red-600'
                                    }`}>
                                      {fase.tipo === 'concurso' ? '🏆' : fase.numero_fase}
                                    </div>
                                    <h5 className="text-sm font-semibold text-gray-900">
                                      {fase.nombre}
                                    </h5>
                                  </div>
                                  <p className="text-xs text-gray-600 ml-10">
                                    {fase.descripcion}
                                  </p>
                                </div>
                                <Badge variant={estado.variant} className="text-xs">
                                  {estado.label}
                                </Badge>
                              </div>

                              <div className="grid grid-cols-4 gap-2 mb-3 ml-10">
                                <div className="bg-gray-50 p-2 rounded">
                                  <p className="text-xs text-gray-500">Inscritos</p>
                                  <p className="text-lg font-bold text-gray-900">{fase.total_inscritos || 0}</p>
                                </div>
                                <div className="bg-gray-50 p-2 rounded">
                                  <p className="text-xs text-gray-500">Seleccionados</p>
                                  <p className="text-lg font-bold text-gray-900">{fase.total_seleccionados || 0}</p>
                                </div>
                                <div className="bg-gray-50 p-2 rounded">
                                  <p className="text-xs text-gray-500">Curadores</p>
                                  <p className="text-lg font-bold text-gray-900">{fase.total_curadores || 0}</p>
                                </div>
                                <div className="bg-gray-50 p-2 rounded">
                                  <p className="text-xs text-gray-500">{fase.tipo === 'concurso' ? 'Ganadores' : '% Sel.'}</p>
                                  <p className="text-lg font-bold text-gray-900">
                                    {fase.tipo === 'concurso' ? fase.max_artistas_seleccionados : `${fase.porcentaje_seleccion}%`}
                                  </p>
                                </div>
                              </div>

                              {!fase.finalizada && (
                                <div className="flex flex-wrap gap-2 ml-10">
                                  {fase.tipo === 'fase' && fase.numero_fase === 1 && (
                                    <Button
                                      variant={fase.inscripciones_abiertas ? 'secondary' : 'primary'}
                                      size="sm"
                                      onClick={() => handleToggleInscripciones(fase.id, fase.inscripciones_abiertas)}
                                    >
                                      {fase.inscripciones_abiertas ? 'Cerrar Inscripciones' : 'Abrir Inscripciones'}
                                    </Button>
                                  )}

                                  <Button
                                    variant={fase.votaciones_abiertas ? 'secondary' : 'primary'}
                                    size="sm"
                                    onClick={() => handleToggleVotaciones(fase.id, fase.votaciones_abiertas)}
                                  >
                                    {fase.votaciones_abiertas ? 'Cerrar Votaciones' : 'Abrir Votaciones'}
                                  </Button>

                                  {!fase.inscripciones_abiertas && !fase.votaciones_abiertas && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleFinalizarFase(fase.id, fase.nombre)}
                                      className="text-green-600 hover:bg-green-50"
                                    >
                                      Finalizar Fase
                                    </Button>
                                  )}
                                </div>
                              )}

                              {fase.finalizada && (
                                <div className="ml-10 flex items-center text-xs text-gray-600">
                                  <svg className="w-4 h-4 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  Fase finalizada
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
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
