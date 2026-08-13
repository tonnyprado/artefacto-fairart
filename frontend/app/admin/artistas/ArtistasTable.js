'use client'

import { useState, useEffect } from 'react'
import {
  RefreshCw,
  Camera,
  FileText,
  FolderOpen,
  CreditCard,
  Palette,
  Check,
  X,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react'

export default function ArtistasTable() {
  const [artistas, setArtistas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    search: '',
    categoria: '',
    estado_registro: ''
  })

  // Fetch artistas al montar y cuando cambien filtros
  useEffect(() => {
    fetchArtistas()
  }, [filters])

  const fetchArtistas = async () => {
    try {
      setLoading(true)
      setError(null)

      // Construir query params
      const params = new URLSearchParams()
      if (filters.search) params.append('search', filters.search)
      if (filters.categoria) params.append('categoria', filters.categoria)
      if (filters.estado_registro) params.append('estado_registro', filters.estado_registro)

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
      const response = await fetch(`${apiUrl}/api/artistas?${params}`)

      if (!response.ok) {
        throw new Error('Error al cargar artistas')
      }

      const data = await response.json()
      console.log('Artistas cargados:', data)
      setArtistas(data.data || [])
    } catch (err) {
      console.error('Error fetching artistas:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAprobar = async (artistaId) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
      const response = await fetch(`${apiUrl}/api/artistas/${artistaId}/aprobar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Error al aprobar artista')
      }

      // Recargar lista
      fetchArtistas()
      alert('Artista aprobado exitosamente')
    } catch (err) {
      console.error('Error:', err)
      alert('Error al aprobar artista: ' + err.message)
    }
  }

  const handleRechazar = async (artistaId) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
      const response = await fetch(`${apiUrl}/api/artistas/${artistaId}/rechazar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Error al rechazar artista')
      }

      // Recargar lista
      fetchArtistas()
      alert('Artista rechazado')
    } catch (err) {
      console.error('Error:', err)
      alert('Error al rechazar artista: ' + err.message)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando artistas...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <p className="text-red-600">❌ Error: {error}</p>
        <button
          onClick={fetchArtistas}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded-2xl hover:bg-red-700"
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="admin-panel">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Artistas Registrados</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            Total: {artistas.length} artistas
          </div>
          <button
            onClick={fetchArtistas}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-2xl hover:bg-blue-700 disabled:bg-gray-400 transition flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Actualizando...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Actualizar
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Buscar por nombre, email..."
            className="border rounded-2xl px-4 py-2"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <select
            className="border rounded-2xl px-4 py-2"
            value={filters.estado_registro}
            onChange={(e) => setFilters({ ...filters, estado_registro: e.target.value })}
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="aprobado">Aprobado</option>
            <option value="rechazado">Rechazado</option>
          </select>
          <select
            className="border rounded-2xl px-4 py-2"
            value={filters.categoria}
            onChange={(e) => setFilters({ ...filters, categoria: e.target.value })}
          >
            <option value="">Todas las categorías</option>
            <option value="Pintura">Pintura</option>
            <option value="Escultura">Escultura</option>
            <option value="Fotografía">Fotografía</option>
            <option value="Arte Digital">Arte Digital</option>
            <option value="Instalación">Instalación</option>
            <option value="Performance">Performance</option>
          </select>
        </div>
      </div>

      {/* Tabla de artistas */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Folio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Artista
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Categoría
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Archivos
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {artistas.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                  No hay artistas registrados
                </td>
              </tr>
            ) : (
              artistas.map((artista) => (
                <tr key={artista.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-mono text-sm font-semibold text-blue-600">
                      {artista.folio || `ART-${artista.id}`}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={artista.foto || '/placeholder-avatar.png'}
                        alt={artista.nombre}
                        className="w-12 h-12 rounded-full object-cover"
                        onError={(e) => {
                          e.target.src = '/placeholder-avatar.png'
                        }}
                      />
                      <div>
                        <div className="font-semibold">
                          {artista.nombre} {artista.apellido}
                        </div>
                        {artista.nombre_artistico && (
                          <div className="text-xs text-purple-600 italic">
                            "{artista.nombre_artistico}"
                          </div>
                        )}
                        <div className="text-sm text-gray-500">
                          {artista.ciudad}, {artista.pais}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {artista.email}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {artista.categoria || 'Sin categoría'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {artista.estado_registro === 'pendiente' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Clock className="h-3 w-3" /> Pendiente
                      </span>
                    )}
                    {artista.estado_registro === 'aprobado' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3" /> Aprobado
                      </span>
                    )}
                    {artista.estado_registro === 'rechazado' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <XCircle className="h-3 w-3" /> Rechazado
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2" title="Archivos subidos">
                      {artista.foto && (
                        <Camera className="h-4 w-4 text-green-600" title="Foto" />
                      )}
                      {artista.cv_url && (
                        <FileText className="h-4 w-4 text-green-600" title="CV" />
                      )}
                      {artista.portfolio_url && (
                        <FolderOpen className="h-4 w-4 text-green-600" title="Portfolio" />
                      )}
                      {artista.identificacion_url && (
                        <CreditCard className="h-4 w-4 text-green-600" title="Identificacion" />
                      )}
                      {artista.layout_canvas_url && (
                        <Palette className="h-4 w-4 text-green-600" title="Canvas/Lienzo" />
                      )}
                      {!artista.foto && !artista.cv_url && !artista.portfolio_url && !artista.identificacion_url && (
                        <span className="text-gray-400 text-xs">Sin archivos</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {artista.estado_registro === 'pendiente' && (
                        <>
                          <button
                            onClick={() => handleAprobar(artista.id)}
                            className="flex items-center gap-1 text-green-600 hover:text-green-800 text-sm font-medium"
                          >
                            <Check className="h-4 w-4" /> Aprobar
                          </button>
                          <button
                            onClick={() => handleRechazar(artista.id)}
                            className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            <X className="h-4 w-4" /> Rechazar
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => window.open(`/admin/artistas/${artista.id}`, '_blank')}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        <Eye className="h-4 w-4" /> Ver detalles
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
