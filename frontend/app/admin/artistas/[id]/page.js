'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Check,
  X as XIcon,
  Clock,
  CheckCircle,
  XCircle,
  User,
  FileText,
  FolderOpen,
  CreditCard,
  Palette,
  Share2,
  Globe,
  Loader2,
  Download,
  Eye,
  Upload,
  Edit
} from 'lucide-react'
import { FlipGallery } from '@/components/gallery'

// Componente para el modal de formulario de obra
function ObraFormModal({ obra, onSave, onClose, saving }) {
  const [formData, setFormData] = useState({
    titulo: obra?.titulo || '',
    alto_cm: obra?.alto_cm || '',
    ancho_cm: obra?.ancho_cm || '',
    precio_mxn: obra?.precio_mxn || '',
    imagen_url: obra?.imagen_url || ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      ...obra,
      ...formData,
      alto_cm: formData.alto_cm ? parseFloat(formData.alto_cm) : null,
      ancho_cm: formData.ancho_cm ? parseFloat(formData.ancho_cm) : null,
      precio_mxn: formData.precio_mxn ? parseFloat(formData.precio_mxn) : null
    })
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={() => !saving && onClose()}
    >
      <div
        className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-semibold mb-4">
          {obra ? 'Editar Obra' : 'Crear Nueva Obra'}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título
              </label>
              <input
                type="text"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Título de la obra"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alto (cm)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.alto_cm}
                  onChange={(e) => setFormData({ ...formData, alto_cm: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ancho (cm)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.ancho_cm}
                  onChange={(e) => setFormData({ ...formData, ancho_cm: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio (MXN)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.precio_mxn}
                onChange={(e) => setFormData({ ...formData, precio_mxn: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            {!obra && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL de la imagen (opcional)
                </label>
                <input
                  type="text"
                  value={formData.imagen_url}
                  onChange={(e) => setFormData({ ...formData, imagen_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Puedes subir la foto después de crear la obra
                </p>
              </div>
            )}

            {obra?.fotos_detalle_urls && obra.fotos_detalle_urls.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fotos de detalle ({obra.fotos_detalle_urls.length})
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {obra.fotos_detalle_urls.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt={`Detalle ${idx + 1}`}
                      className="w-full h-20 object-cover rounded-lg cursor-pointer hover:opacity-75"
                      onClick={() => window.open(url, '_blank')}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  {obra ? 'Actualizar' : 'Crear'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ArtistaDetalle() {
  const params = useParams()
  const router = useRouter()
  const [artista, setArtista] = useState(null)
  const [obras, setObras] = useState([])
  const [obrasCompletas, setObrasCompletas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [imageModal, setImageModal] = useState(null)
  const [editFotoModal, setEditFotoModal] = useState(null)
  const [editObraModal, setEditObraModal] = useState(null)
  const [createObraModal, setCreateObraModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

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

      // Cargar obras completas con IDs desde la API
      const obrasResponse = await fetch(`${apiUrl}/api/obras/artista/${params.id}`)
      if (obrasResponse.ok) {
        const obrasData = await obrasResponse.json()
        setObrasCompletas(obrasData.obras || [])
      }
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

  const handleUploadFoto = async (file, obraId) => {
    if (!file || !obraId) return

    // Validar que el ID sea numérico (de la base de datos)
    const isValidId = typeof obraId === 'number' || (typeof obraId === 'string' && !isNaN(parseInt(obraId)) && !obraId.includes('-'))

    if (!isValidId) {
      alert('Esta obra no está guardada en la base de datos aún. No se puede actualizar la foto.')
      console.error('ID de obra inválido:', obraId)
      return
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

      const formData = new FormData()
      formData.append('foto', file)

      const token = localStorage.getItem('token')
      const response = await fetch(`${apiUrl}/api/obras/${obraId}/foto`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Foto actualizada:', data)

        // Recargar obras
        await fetchArtista()
        alert('Foto actualizada exitosamente')
      } else {
        const error = await response.json()
        alert('Error al subir foto: ' + (error.error || 'Error desconocido'))
        throw new Error(error.error)
      }
    } catch (err) {
      console.error('Error al subir foto:', err)
      alert('Error al subir foto: ' + err.message)
      throw err
    }
  }

  const handleUploadFotoModal = async (e, obraId) => {
    try {
      const file = e.target.files?.[0]
      if (!file) return

      setUploading(true)
      await handleUploadFoto(file, obraId)
      setEditFotoModal(null)
    } finally {
      setUploading(false)
    }
  }

  const handleUpdateObra = async (obraData) => {
    try {
      setSaving(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
      const token = localStorage.getItem('token')

      const response = await fetch(`${apiUrl}/api/obras/${obraData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(obraData)
      })

      if (response.ok) {
        await fetchArtista()
        alert('Obra actualizada exitosamente')
        setEditObraModal(null)
      } else {
        const error = await response.json()
        alert('Error al actualizar obra: ' + (error.error || 'Error desconocido'))
      }
    } catch (err) {
      console.error('Error al actualizar obra:', err)
      alert('Error al actualizar obra: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleCreateObra = async (obraData) => {
    try {
      setSaving(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
      const token = localStorage.getItem('token')

      const response = await fetch(`${apiUrl}/api/obras`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...obraData,
          artista_id: params.id
        })
      })

      if (response.ok) {
        await fetchArtista()
        alert('Obra creada exitosamente')
        setCreateObraModal(false)
      } else {
        const error = await response.json()
        alert('Error al crear obra: ' + (error.error || 'Error desconocido'))
      }
    } catch (err) {
      console.error('Error al crear obra:', err)
      alert('Error al crear obra: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
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

      {/* Modal de edición de foto */}
      {editFotoModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => !uploading && setEditFotoModal(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold mb-4">
              Editar foto de obra
            </h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                {editFotoModal.titulo || 'Sin título'}
              </p>
              {editFotoModal.imagen_url && (
                <img
                  src={editFotoModal.imagen_url}
                  alt={editFotoModal.titulo}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              <label className="block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleUploadFotoModal(e, editFotoModal.id)}
                  disabled={uploading}
                  className="hidden"
                  id="foto-upload"
                />
                <div className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 cursor-pointer">
                  {uploading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5" />
                      Seleccionar nueva foto
                    </>
                  )}
                </div>
              </label>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditFotoModal(null)}
                disabled={uploading}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de edición de obra */}
      {editObraModal && <ObraFormModal obra={editObraModal} onSave={handleUpdateObra} onClose={() => setEditObraModal(null)} saving={saving} />}

      {/* Modal de creación de obra */}
      {createObraModal && <ObraFormModal onSave={handleCreateObra} onClose={() => setCreateObraModal(false)} saving={saving} />}

      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-5 w-5" /> Volver
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
                <span className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                  <Clock className="h-4 w-4" /> Pendiente
                </span>
              )}
              {artista.estado_registro === 'aprobado' && (
                <span className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <CheckCircle className="h-4 w-4" /> Aprobado
                </span>
              )}
              {artista.estado_registro === 'rechazado' && (
                <span className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  <XCircle className="h-4 w-4" /> Rechazado
                </span>
              )}
            </div>
            <div className="flex gap-2">
              {artista.estado_registro === 'pendiente' && (
                <>
                  <button
                    onClick={handleAprobar}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    <Check className="h-4 w-4" /> Aprobar
                  </button>
                  <button
                    onClick={handleRechazar}
                    className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    <XIcon className="h-4 w-4" /> Rechazar
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
                <>
                  <img
                    src={artista.foto}
                    alt={artista.nombre}
                    className="w-full aspect-square object-cover rounded-xl cursor-pointer hover:opacity-90"
                    onClick={() => setImageModal(artista.foto)}
                  />
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => setImageModal(artista.foto)}
                      className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 text-sm"
                    >
                      <Eye className="h-4 w-4" /> Ver
                    </button>
                    <a
                      href={artista.foto}
                      download={`foto-${artista.nombre}-${artista.apellido}.jpg`}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 text-sm"
                    >
                      <Download className="h-4 w-4" /> Descargar
                    </a>
                  </div>
                </>
              ) : (
                <div className="w-full aspect-square bg-gray-200 rounded-xl flex items-center justify-center">
                  <User className="h-24 w-24 text-gray-400" />
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
                    <FileText className="h-4 w-4" /> Ver CV
                  </a>
                ) : (
                  <p className="text-gray-400 flex items-center gap-2">
                    <FileText className="h-4 w-4" /> CV no subido
                  </p>
                )}

                {artista.portfolio_url ? (
                  <a
                    href={artista.portfolio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:underline"
                  >
                    <FolderOpen className="h-4 w-4" /> Ver Portfolio PDF
                  </a>
                ) : (
                  <p className="text-gray-400 flex items-center gap-2">
                    <FolderOpen className="h-4 w-4" /> Portfolio no subido
                  </p>
                )}

                {artista.identificacion_url ? (
                  <a
                    href={artista.identificacion_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:underline"
                  >
                    <CreditCard className="h-4 w-4" /> Ver Identificacion
                  </a>
                ) : (
                  <p className="text-gray-400 flex items-center gap-2">
                    <CreditCard className="h-4 w-4" /> Identificacion no subida
                  </p>
                )}

                {artista.layout_canvas_url && (
                  <a
                    href={artista.layout_canvas_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:underline"
                  >
                    <Palette className="h-4 w-4" /> Ver Canvas/Lienzo
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
                      <Share2 className="h-4 w-4" /> {artista.instagram || artista.redes_sociales?.instagram}
                    </a>
                  )}
                  {(artista.facebook || artista.redes_sociales?.facebook) && (
                    <a
                      href={artista.facebook || artista.redes_sociales?.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:underline"
                    >
                      <Share2 className="h-4 w-4" /> Facebook
                    </a>
                  )}
                  {(artista.website || artista.redes_sociales?.website) && (
                    <a
                      href={artista.website || artista.redes_sociales?.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-gray-600 hover:underline"
                    >
                      <Globe className="h-4 w-4" /> Sitio web
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Obras con galería animada */}
            <div className="bg-white rounded-2xl shadow p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  Obras ({obrasCompletas.length > 0 ? obrasCompletas.length : obras.length})
                </h2>
                <button
                  onClick={() => setCreateObraModal(true)}
                  className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 text-sm"
                >
                  <Upload className="h-4 w-4" />
                  Nueva Obra
                </button>
              </div>
              <FlipGallery
                obras={obrasCompletas.length > 0 ? obrasCompletas : obras}
                columns={3}
                gap={16}
                isAdmin={true}
                onUploadFoto={handleUploadFoto}
                onEdit={(obra) => setEditObraModal(obra)}
              />
            </div>

            {/* Administración de Obras (solo admin) */}
            <div className="bg-white rounded-2xl shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  Administración de Obras ({obrasCompletas.length})
                </h2>
                <button
                  onClick={() => setCreateObraModal(true)}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
                >
                  <Upload className="h-4 w-4" />
                  Agregar Obra
                </button>
              </div>
              {obrasCompletas.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {obrasCompletas.map((obra) => (
                    <div key={obra.id} className="border rounded-lg p-4">
                      <div className="aspect-square bg-gray-100 rounded-lg mb-3 relative overflow-hidden">
                        {obra.imagen_url ? (
                          <img
                            src={obra.imagen_url}
                            alt={obra.titulo || 'Obra sin título'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400">
                            <Palette className="h-12 w-12" />
                          </div>
                        )}
                      </div>
                      <h3 className="font-medium text-sm mb-1">
                        {obra.titulo || 'Sin título'}
                      </h3>
                      <p className="text-xs text-gray-500 mb-2">
                        {obra.alto_cm && obra.ancho_cm
                          ? `${obra.alto_cm} x ${obra.ancho_cm} cm`
                          : 'Dimensiones no especificadas'}
                      </p>
                      {obra.precio_mxn && (
                        <p className="text-xs text-green-600 mb-2 font-medium">
                          ${parseFloat(obra.precio_mxn).toLocaleString('es-MX')} MXN
                        </p>
                      )}
                      {obra.fotos_detalle_urls && obra.fotos_detalle_urls.length > 0 && (
                        <p className="text-xs text-blue-600 mb-3">
                          {obra.fotos_detalle_urls.length} foto{obra.fotos_detalle_urls.length !== 1 ? 's' : ''} de detalle
                        </p>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditObraModal(obra)}
                          className="flex-1 flex items-center justify-center gap-1 bg-gray-600 text-white py-2 px-2 rounded-lg hover:bg-gray-700 text-xs"
                        >
                          <Edit className="h-3 w-3" />
                          Editar
                        </button>
                        <button
                          onClick={() => setEditFotoModal(obra)}
                          className="flex-1 flex items-center justify-center gap-1 bg-blue-600 text-white py-2 px-2 rounded-lg hover:bg-blue-700 text-xs"
                        >
                          <Upload className="h-3 w-3" />
                          Foto
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No hay obras registradas. Haz clic en "Agregar Obra" para comenzar.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
