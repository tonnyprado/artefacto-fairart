'use client'

import { useState, useCallback, useEffect } from 'react'
import { useCuradoresStore } from '@/stores/curadoresStore'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import { favoritosApi } from '@/lib/api'

// Generador de contraseña temporal
const generateTempPassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let password = ''
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

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
    fetchCuradores,
    createCurador,
    updateCurador,
    deleteCurador,
    toggleActivo,
    resetPassword,
    isLoading
  } = useCuradoresStore()

  // Cargar curadores al montar el componente
  useEffect(() => {
    fetchCuradores()
  }, [fetchCuradores])

  // Cargar estadísticas de favoritos
  useEffect(() => {
    const loadFavoritosStats = async () => {
      try {
        const stats = await favoritosApi.getEstadisticasAdmin()
        // Convertir array a objeto indexado por curador_id
        const statsMap = {}
        if (stats.por_curador) {
          stats.por_curador.forEach(item => {
            statsMap[item.curador_id] = item.total_favoritos
          })
        }
        setFavoritosStats(statsMap)
      } catch (error) {
        console.error('Error cargando stats de favoritos:', error)
      }
    }

    if (curadores.length > 0) {
      loadFavoritosStats()
    }
  }, [curadores])

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showFavoritosModal, setShowFavoritosModal] = useState(false)
  const [selectedCurador, setSelectedCurador] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [favoritosStats, setFavoritosStats] = useState({})
  const [curadorFavoritos, setCuradorFavoritos] = useState([])
  const [loadingFavoritos, setLoadingFavoritos] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    especialidad: '',
    bio: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)

  const resetForm = () => {
    setFormData({
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      especialidad: '',
      bio: '',
      password: ''
    })
    setShowPassword(false)
  }

  const handleCreate = () => {
    // Generar contraseña temporal automáticamente
    const tempPassword = generateTempPassword()
    setFormData({
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      especialidad: '',
      bio: '',
      password: tempPassword
    })
    setShowPassword(false)
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

  const handleShowPasswordModal = (curador) => {
    setSelectedCurador(curador)
    setNewPassword(generateTempPassword())
    setShowPasswordModal(true)
  }

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      alert('La contraseña debe tener al menos 8 caracteres')
      return
    }
    const result = await resetPassword(selectedCurador.id, newPassword)
    if (result.success) {
      alert(`Contraseña actualizada.\n\nNueva contraseña: ${newPassword}\n\nCópiala y entrégala al curador de forma segura.`)
      setShowPasswordModal(false)
      setSelectedCurador(null)
      setNewPassword('')
    } else {
      alert('Error: ' + result.error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleViewFavoritos = async (curador) => {
    setSelectedCurador(curador)
    setLoadingFavoritos(true)
    setShowFavoritosModal(true)

    try {
      const favoritos = await favoritosApi.getFavoritosByCuradorAdmin(curador.id)
      setCuradorFavoritos(favoritos)
    } catch (error) {
      console.error('Error cargando favoritos del curador:', error)
      setCuradorFavoritos([])
    } finally {
      setLoadingFavoritos(false)
    }
  }

  const handleCloseFavoritosModal = () => {
    setShowFavoritosModal(false)
    setSelectedCurador(null)
    setCuradorFavoritos([])
  }

  // Agrupar favoritos por fase
  const favoritosPorFase = curadorFavoritos.reduce((acc, fav) => {
    const faseId = fav.fase_id
    if (!acc[faseId]) {
      acc[faseId] = {
        fase_nombre: fav.fase_nombre,
        artistas: []
      }
    }
    acc[faseId].artistas.push(fav)
    return acc
  }, {})

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
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Curador</TableHeader>
              <TableHeader>Email</TableHeader>
              <TableHeader>Especialidad</TableHeader>
              <TableHeader>Votaciones</TableHeader>
              <TableHeader>Favoritos</TableHeader>
              <TableHeader>Estado</TableHeader>
              <TableHeader>Acciones</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                    Cargando curadores...
                  </div>
                </TableCell>
              </TableRow>
            ) : curadores.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500 py-8">
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

                  {/* Favoritos */}
                  <TableCell>
                    <button
                      onClick={() => handleViewFavoritos(curador)}
                      className="flex items-center gap-1 text-red-600 hover:text-red-800 transition-colors group"
                      title="Ver favoritos"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                      <span className="font-semibold">{favoritosStats[curador.id] || 0}</span>
                      <svg className="w-3 h-3 text-gray-400 group-hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
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
                        onClick={() => handleShowPasswordModal(curador)}
                        className="text-purple-600 hover:text-purple-800 transition-colors"
                        title="Cambiar contraseña"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
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

          {/* Campo de contraseña generada */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Contraseña Temporal
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 pr-24 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono"
                required
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800 bg-gray-100 rounded"
                >
                  {showPassword ? 'Ocultar' : 'Ver'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(formData.password)
                    alert('Contraseña copiada al portapapeles')
                  }}
                  className="px-2 py-1 text-xs text-blue-600 hover:text-blue-800 bg-blue-50 rounded"
                >
                  Copiar
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, password: generateTempPassword() }))}
              className="text-sm text-red-600 hover:text-red-800 underline"
            >
              Regenerar contraseña
            </button>
          </div>

          <div className="bg-amber-50 border-l-4 border-amber-400 p-4">
            <p className="text-sm text-amber-700">
              <strong>Importante:</strong> Copia esta contraseña y entrégala al curador de forma segura.
              El curador la necesitará para acceder al sistema por primera vez.
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

      {/* Modal Cambiar Contraseña */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Cambiar Contraseña"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowPasswordModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleResetPassword}>
              Cambiar Contraseña
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {selectedCurador && (
            <p className="text-gray-600">
              Cambiar contraseña para: <strong>{selectedCurador.nombre} {selectedCurador.apellido}</strong>
            </p>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Nueva Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 pr-24 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
                placeholder="Mínimo 8 caracteres"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800 bg-gray-100 rounded"
                >
                  {showPassword ? 'Ocultar' : 'Ver'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(newPassword)
                    alert('Contraseña copiada al portapapeles')
                  }}
                  className="px-2 py-1 text-xs text-blue-600 hover:text-blue-800 bg-blue-50 rounded"
                >
                  Copiar
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setNewPassword(generateTempPassword())}
              className="text-sm text-purple-600 hover:text-purple-800 underline"
            >
              Generar nueva contraseña
            </button>
          </div>

          <div className="bg-amber-50 border-l-4 border-amber-400 p-4">
            <p className="text-sm text-amber-700">
              <strong>Importante:</strong> Copia esta contraseña y entrégala al curador de forma segura.
            </p>
          </div>
        </div>
      </Modal>

      {/* Modal Ver Favoritos del Curador */}
      <Modal
        isOpen={showFavoritosModal}
        onClose={handleCloseFavoritosModal}
        title={selectedCurador ? `Favoritos de ${selectedCurador.nombre} ${selectedCurador.apellido}` : 'Favoritos'}
        size="lg"
      >
        <div className="space-y-4">
          {loadingFavoritos ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mb-3"></div>
              <p className="text-gray-600">Cargando favoritos...</p>
            </div>
          ) : curadorFavoritos.length === 0 ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <p className="text-gray-500">Este curador no tiene favoritos marcados</p>
            </div>
          ) : (
            <>
              {/* Estadística general */}
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                <p className="text-red-800">
                  <strong>{curadorFavoritos.length}</strong> artistas favoritos en{' '}
                  <strong>{Object.keys(favoritosPorFase).length}</strong> fase(s)
                </p>
              </div>

              {/* Lista por fase */}
              <div className="space-y-4">
                {Object.entries(favoritosPorFase).map(([faseId, data]) => (
                  <div key={faseId} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Header de fase */}
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <h4 className="font-semibold text-gray-900">
                        {data.fase_nombre}
                        <span className="ml-2 text-sm font-normal text-gray-500">
                          ({data.artistas.length} favoritos)
                        </span>
                      </h4>
                    </div>

                    {/* Lista de artistas */}
                    <div className="divide-y divide-gray-100">
                      {data.artistas.map(fav => (
                        <div key={fav.id} className="px-4 py-3 flex items-center gap-3">
                          <img
                            src={fav.artista_foto || '/placeholder-avatar.png'}
                            alt={fav.artista_nombre}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {fav.artista_nombre} {fav.artista_apellido}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {fav.artista_categoria} - {fav.artista_ciudad}, {fav.artista_pais}
                            </p>
                          </div>
                          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                          </svg>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  )
}
