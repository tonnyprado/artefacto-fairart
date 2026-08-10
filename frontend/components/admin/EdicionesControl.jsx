'use client'

import { useState, useEffect } from 'react'
import { useEdicionesStore } from '@/stores/edicionesStore'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

/**
 * EdicionesControl - Panel de control de ediciones
 *
 * Features:
 * - Ver todas las ediciones
 * - Crear nueva edición
 * - Marcar edición como activa
 * - Ver estadísticas de cada edición
 * - Eliminar edición
 *
 * DB: ediciones table
 * API:
 * - GET /api/ediciones
 * - POST /api/ediciones
 * - PUT /api/ediciones/:id
 * - DELETE /api/ediciones/:id
 */

export default function EdicionesControl() {
  const {
    ediciones,
    fetchEdiciones,
    createEdicion,
    updateEdicion,
    deleteEdicion
  } = useEdicionesStore()

  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    anio: new Date().getFullYear(),
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    activa: false
  })

  useEffect(() => {
    fetchEdiciones()
  }, [fetchEdiciones])

  const handleSubmit = async (e) => {
    e.preventDefault()

    const result = await createEdicion(formData)
    if (result.success) {
      setShowForm(false)
      setFormData({
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

  const handleMarcarActiva = async (edicionId) => {
    if (window.confirm('¿Estás seguro de marcar esta edición como activa? Esto desactivará las demás ediciones.')) {
      await updateEdicion(edicionId, { activa: true })
      fetchEdiciones()
    }
  }

  const handleEliminar = async (edicionId, edicionNombre) => {
    if (window.confirm(`¿Estás seguro de eliminar ${edicionNombre}? Esta acción no se puede deshacer.`)) {
      const result = await deleteEdicion(edicionId)
      if (result.success) {
        fetchEdiciones()
      }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Ediciones</h2>
          <p className="text-gray-600 mt-1">
            Administra las ediciones de ARTEFACT
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : '+ Nueva Edición'}
        </Button>
      </div>

      {/* Formulario de creación */}
      {showForm && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Crear Nueva Edición
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Año
                  </label>
                  <input
                    type="number"
                    value={formData.anio}
                    onChange={(e) => setFormData({ ...formData, anio: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
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
                    value={formData.fecha_inicio}
                    onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
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
                    value={formData.fecha_fin}
                    onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>

                <div className="md:col-span-2 flex items-center">
                  <input
                    type="checkbox"
                    id="activa"
                    checked={formData.activa}
                    onChange={(e) => setFormData({ ...formData, activa: e.target.checked })}
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
        {ediciones.map((edicion) => (
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
                    {edicion.total_fases || 0}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-2xl">
                  <p className="text-xs text-gray-500 mb-1">Fases Activas</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {edicion.fases_activas || 0}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-2xl">
                  <p className="text-xs text-gray-500 mb-1">Fases Finalizadas</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {edicion.fases_finalizadas || 0}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-2xl">
                  <p className="text-xs text-gray-500 mb-1">Año</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {edicion.anio}
                  </p>
                </div>
              </div>

              {/* Fechas */}
              <div className="mb-4 text-sm">
                <span className="text-gray-500">Periodo:</span>
                <p className="font-medium text-gray-900">
                  {formatDate(edicion.fecha_inicio)} - {formatDate(edicion.fecha_fin)}
                </p>
              </div>

              {/* Acciones */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                {!edicion.activa && (
                  <Button
                    variant="primary"
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
                  onClick={() => handleEliminar(edicion.id, edicion.nombre)}
                  className="text-red-600 hover:bg-red-50"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Eliminar
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
