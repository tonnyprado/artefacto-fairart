'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ArtistaDetalle() {
  const params = useParams()
  const router = useRouter()
  const [artista, setArtista] = useState(null)
  const [obras, setObras] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [imageModal, setImageModal] = useState(null)

  useEffect(() => {
    if (params.id) {
      fetchArtista()
    }
  }, [params.id])

  const fetchArtista = async () => {
    try {
      setLoading(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
      const response = await fetch(`${apiUrl}/api/artistas/${params.id}`)

      if (!response.ok) {
        throw new Error('Artista no encontrado')
      }

      const data = await response.json()
      setArtista(data.data)
      setObras(data.data?.documentos?.portfolio_images || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAprobar = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
      const response = await fetch(`${apiUrl}/api/artistas/${params.id}/aprobar`, {
        method: 'PUT'
      })
      if (response.ok) {
        fetchArtista()
      }
    } catch (err) {
      console.error('Error al aprobar:', err)
    }
  }

  const handleRechazar = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
      const response = await fetch(`${apiUrl}/api/artistas/${params.id}/rechazar`, {
        method: 'PUT'
      })
      if (response.ok) {
        fetchArtista()
      }
    } catch (err) {
      console.error('Error al rechazar:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando artista...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Volver
          </button>
        </div>
      </div>
    )
  }

  if (!artista) return null

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Modal de imagen */}
      {imageModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4"
          onClick={() => setImageModal(null)}
        >
          <img
            src={imageModal}
            alt="Vista ampliada"
            className="max-w-full max-h-full object-contain"
          />
          <button
            className="absolute top-4 right-4 text-white text-3xl"
            onClick={() => setImageModal(null)}
          >
            &times;
          </button>
        </div>
      )}

      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-800"
          >
            &larr; Volver
          </button>
          <h1 className="text-3xl font-bold">Detalle del Artista</h1>
        </div>

        {/* Estado y acciones */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <span className="text-2xl font-mono font-bold text-blue-600">
                {artista.folio || `ART-${artista.id}`}
              </span>
              {artista.estado_registro === 'pendiente' && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                  Pendiente
                </span>
              )}
              {artista.estado_registro === 'aprobado' && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Aprobado
                </span>
              )}
              {artista.estado_registro === 'rechazado' && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  Rechazado
                </span>
              )}
            </div>
            <div className="flex gap-2">
              {artista.estado_registro === 'pendiente' && (
                <>
                  <button
                    onClick={handleAprobar}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Aprobar
                  </button>
                  <button
                    onClick={handleRechazar}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    Rechazar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna izquierda - Foto y datos básicos */}
          <div className="lg:col-span-1">
            {/* Foto */}
            <div className="bg-white rounded-2xl shadow p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Foto de Perfil</h2>
              {artista.foto ? (
                <img
                  src={artista.foto}
                  alt={artista.nombre}
                  className="w-full aspect-square object-cover rounded-xl cursor-pointer hover:opacity-90"
                  onClick={() => setImageModal(artista.foto)}
                />
              ) : (
                <div className="w-full aspect-square bg-gray-200 rounded-xl flex items-center justify-center">
                  <span className="text-gray-400 text-6xl">👤</span>
                </div>
              )}
            </div>

            {/* Documentos */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Documentos</h2>
              <div className="space-y-3">
                {artista.cv_url ? (
                  <a
                    href={artista.cv_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:underline"
                  >
                    <span>📄</span> Ver CV
                  </a>
                ) : (
                  <p className="text-gray-400 flex items-center gap-2">
                    <span>📄</span> CV no subido
                  </p>
                )}

                {artista.portfolio_url ? (
                  <a
                    href={artista.portfolio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:underline"
                  >
                    <span>📋</span> Ver Portfolio PDF
                  </a>
                ) : (
                  <p className="text-gray-400 flex items-center gap-2">
                    <span>📋</span> Portfolio no subido
                  </p>
                )}

                {artista.identificacion_url ? (
                  <a
                    href={artista.identificacion_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:underline"
                  >
                    <span>🪪</span> Ver Identificación
                  </a>
                ) : (
                  <p className="text-gray-400 flex items-center gap-2">
                    <span>🪪</span> Identificación no subida
                  </p>
                )}

                {artista.layout_canvas_url && (
                  <a
                    href={artista.layout_canvas_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:underline"
                  >
                    <span>🎨</span> Ver Canvas/Lienzo
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Columna derecha - Información */}
          <div className="lg:col-span-2">
            {/* Datos personales */}
            <div className="bg-white rounded-2xl shadow p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Información Personal</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Nombre completo</label>
                  <p className="font-medium">{artista.nombre} {artista.apellido}</p>
                </div>
                {artista.nombre_artistico && (
                  <div>
                    <label className="text-sm text-gray-500">Nombre artístico</label>
                    <p className="font-medium italic text-purple-600">"{artista.nombre_artistico}"</p>
                  </div>
                )}
                <div>
                  <label className="text-sm text-gray-500">Email</label>
                  <p className="font-medium">{artista.email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Teléfono</label>
                  <p className="font-medium">{artista.telefono || 'No especificado'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Fecha de nacimiento</label>
                  <p className="font-medium">
                    {artista.fecha_nacimiento
                      ? new Date(artista.fecha_nacimiento).toLocaleDateString('es-MX')
                      : 'No especificada'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Ubicación</label>
                  <p className="font-medium">{artista.ciudad}, {artista.pais}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Categoría</label>
                  <p className="font-medium">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {artista.categoria || 'Sin categoría'}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Fecha de registro</label>
                  <p className="font-medium">
                    {artista.created_at
                      ? new Date(artista.created_at).toLocaleDateString('es-MX', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'No disponible'}
                  </p>
                </div>
              </div>
            </div>

            {/* Bio */}
            {artista.bio && (
              <div className="bg-white rounded-2xl shadow p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Biografía</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{artista.bio}</p>
              </div>
            )}

            {/* Redes sociales */}
            {(artista.instagram || artista.facebook || artista.website ||
              artista.redes_sociales?.instagram || artista.redes_sociales?.facebook || artista.redes_sociales?.website) && (
              <div className="bg-white rounded-2xl shadow p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Redes Sociales</h2>
                <div className="flex flex-wrap gap-4">
                  {(artista.instagram || artista.redes_sociales?.instagram) && (
                    <a
                      href={`https://instagram.com/${(artista.instagram || artista.redes_sociales?.instagram).replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-pink-600 hover:underline"
                    >
                      📷 {artista.instagram || artista.redes_sociales?.instagram}
                    </a>
                  )}
                  {(artista.facebook || artista.redes_sociales?.facebook) && (
                    <a
                      href={artista.facebook || artista.redes_sociales?.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:underline"
                    >
                      👤 Facebook
                    </a>
                  )}
                  {(artista.website || artista.redes_sociales?.website) && (
                    <a
                      href={artista.website || artista.redes_sociales?.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-gray-600 hover:underline"
                    >
                      🌐 Sitio web
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Obras */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-semibold mb-4">
                Obras ({obras.length})
              </h2>
              {obras.length === 0 ? (
                <p className="text-gray-400">No hay obras registradas</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {obras.map((obra, index) => (
                    <div key={obra.id || index} className="border rounded-xl overflow-hidden">
                      {obra.imagen_url ? (
                        <img
                          src={obra.imagen_url}
                          alt={obra.titulo || `Obra ${index + 1}`}
                          className="w-full aspect-square object-cover cursor-pointer hover:opacity-90"
                          onClick={() => setImageModal(obra.imagen_url)}
                        />
                      ) : (
                        <div className="w-full aspect-square bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400">🖼️</span>
                        </div>
                      )}
                      <div className="p-2">
                        <p className="font-medium text-sm truncate">{obra.titulo || `Obra ${index + 1}`}</p>
                        {(obra.alto_cm || obra.ancho_cm) && (
                          <p className="text-xs text-gray-500">
                            {obra.alto_cm} × {obra.ancho_cm} cm
                          </p>
                        )}
                        {obra.tecnica && (
                          <p className="text-xs text-gray-500">{obra.tecnica}</p>
                        )}
                        {obra.precio_mxn && (
                          <p className="text-xs font-medium text-green-600">
                            ${Number(obra.precio_mxn).toLocaleString('es-MX')} MXN
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
