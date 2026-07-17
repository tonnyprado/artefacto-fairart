'use client'

import { useState } from 'react'
import { useCuradoresStore } from '@/stores/curadoresStore'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'

/**
 * CuradoresTable - Tabla de gestión de curadores
 *
 * Features:
 * - Listado de curadores
 * - Crear nuevo curador
 * - Editar curador
 * - Activar/desactivar curador
 * - Eliminar curador
 * - Ver estadísticas de votación
 *
 * DB: usuarios table (role='curador')
 * API:
 * - GET /api/curadores
 * - POST /api/curadores
 * - PUT /api/curadores/:id
 * - DELETE /api/curadores/:id
 */

export default function CuradoresTable() {
  const {
    curadores,
    createCurador,
    updateCurador,
    deleteCurador,
    toggleActivo
  } = useCuradoresStore()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedCurador, setSelectedCurador] = useState(null)
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    especialidad: '',
    bio: ''
  })

  const resetForm = () => {
    setFormData({
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      especialidad: '',
      bio: ''
    })
  }

  const handleCreate = () => {
    resetForm()
    setShowCreateModal(true)
  }

  const handleEdit = (curador) => {
    setSelectedCurador(curador)
    setFormData({
      nombre: curador.nombre,
      apellido: curador.apellido,
      email: curador.email,
      telefono: curador.telefono || '',
      especialidad: curador.especialidad || '',
      bio: curador.bio || ''
    })
    setShowEditModal(true)
  }

  const handleSubmitCreate = async (e) => {
    e.preventDefault()
    const result = await createCurador(formData)
    if (result.success) {
      setShowCreateModal(false)
      resetForm()
    }
  }

  const handleSubmitEdit = async (e) => {
    e.preventDefault()
    const result = await updateCurador(selectedCurador.id, formData)
    if (result.success) {
      setShowEditModal(false)
      setSelectedCurador(null)
      resetForm()
    }
  }

  const handleDelete = async (curador) => {
    if (window.confirm(`¿Estás seguro de eliminar a ${curador.nombre} ${curador.apellido}?`)) {
      await deleteCurador(curador.id)
    }
  }

  const handleToggleActivo = async (curador) => {
    const accion = curador.activo ? 'desactivar' : 'activar'
    if (window.confirm(`¿Estás seguro de ${accion} a ${curador.nombre} ${curador.apellido}?`)) {
      await toggleActivo(curador.id, !curador.activo)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="space-y-4">
      {/* Header con botón crear */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Curadores</h2>
          <p className="text-gray-600 mt-1">
            {curadores.length} curadores registrados
          </p>
        </div>
        <Button onClick={handleCreate}>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Curador
        </Button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Curador</TableHeader>
              <TableHeader>Email</TableHeader>
              <TableHeader>Especialidad</TableHeader>
              <TableHeader>Votaciones</TableHeader>
              <TableHeader>Estado</TableHeader>
              <TableHeader>Acciones</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {curadores.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                  No hay curadores registrados
                </TableCell>
              </TableRow>
            ) : (
              curadores.map(curador => (
                <TableRow key={curador.id}>
                  {/* Curador */}
                  <TableCell>
                    <div className="flex items-center">
                      {curador.foto ? (
                        <img
                          src={curador.foto}
                          alt={curador.nombre}
                          className="w-10 h-10 rounded-full object-cover mr-3"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                          <span className="text-purple-600 font-semibold">
                            {curador.nombre.charAt(0)}{curador.apellido.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900">
                          {curador.nombre} {curador.apellido}
                        </div>
                        {curador.telefono && (
                          <div className="text-gray-500 text-xs">
                            {curador.telefono}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Email */}
                  <TableCell className="text-gray-600">
                    {curador.email}
                  </TableCell>

                  {/* Especialidad */}
                  <TableCell>
                    {curador.especialidad ? (
                      <Badge variant="purple">{curador.especialidad}</Badge>
                    ) : (
                      <span className="text-gray-400 text-sm">Sin especialidad</span>
                    )}
                  </TableCell>

                  {/* Votaciones */}
                  <TableCell>
                    <span className="font-semibold text-gray-900">
                      {curador.total_votaciones}
                    </span>
                    <span className="text-gray-500 text-sm ml-1">votos</span>
                  </TableCell>

                  {/* Estado */}
                  <TableCell>
                    <Badge variant={curador.activo ? 'success' : 'gray'}>
                      {curador.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>

                  {/* Acciones */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(curador)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="Editar"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>

                      <button
                        onClick={() => handleToggleActivo(curador)}
                        className={`transition-colors ${
                          curador.activo ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'
                        }`}
                        title={curador.activo ? 'Desactivar' : 'Activar'}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {curador.activo ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          )}
                        </svg>
                      </button>

                      <button
                        onClick={() => handleDelete(curador)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Eliminar"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal Crear Curador */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Nuevo Curador"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmitCreate}>
              Crear Curador
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmitCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
            <Input
              label="Apellido"
              name="apellido"
              value={formData.apellido}
              onChange={handleChange}
              required
            />
          </div>

          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <Input
            label="Teléfono"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            placeholder="+52 555 1234567"
          />

          <Input
            label="Especialidad"
            name="especialidad"
            value={formData.especialidad}
            onChange={handleChange}
            placeholder="Ej: Arte Contemporáneo"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Biografía
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              placeholder="Breve descripción del curador y su experiencia..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <p className="text-sm text-blue-700">
              Se generará una contraseña temporal y se enviará un email al curador con instrucciones para cambiarla.
            </p>
          </div>
        </form>
      </Modal>

      {/* Modal Editar Curador */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Editar Curador"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmitEdit}>
              Guardar Cambios
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmitEdit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
            <Input
              label="Apellido"
              name="apellido"
              value={formData.apellido}
              onChange={handleChange}
              required
            />
          </div>

          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <Input
            label="Teléfono"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            placeholder="+52 555 1234567"
          />

          <Input
            label="Especialidad"
            name="especialidad"
            value={formData.especialidad}
            onChange={handleChange}
            placeholder="Ej: Arte Contemporáneo"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Biografía
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              placeholder="Breve descripción del curador y su experiencia..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </form>
      </Modal>
    </div>
  )
}
