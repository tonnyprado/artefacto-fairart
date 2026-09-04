'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useVotacionesStore } from '@/stores/votacionesStore'
import { useFavoritosStore } from '@/stores/favoritosStore'
import { useArtistasStore } from '@/stores/artistasStore'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { Download, X } from 'lucide-react'

/**
 * ArtistaPerfilModal - Modal de perfil de artista con votacion
 *
 * Muestra informacion completa del artista:
 * - Foto y datos personales
 * - Biografia completa
 * - Redes sociales (links)
 * - Documentos (CV, portfolio, ID)
 * - Boton de favorito
 * - Interfaz de votacion (A Favor / En Contra) - solo si votaciones abiertas
 * - Textarea para comentarios
 * - Si ya voto, permite editar
 *
 * Props:
 * - modoLectura: boolean - Si true, oculta la seccion de votacion
 */

const CATEGORIAS = {
  pintura: 'Pintura',
  escultura: 'Escultura',
  fotografia: 'Fotografía',
  ilustracion: 'Ilustración',
  arte_digital: 'Arte Digital',
  instalacion: 'Instalación',
  video_arte: 'Video Arte',
  performance: 'Performance',
  arte_textil: 'Arte Textil',
  grabado: 'Grabado',
  ceramica: 'Cerámica',
  arte_objeto: 'Arte Objeto',
  otro: 'Otro'
}

export default function ArtistaPerfilModal({ artista: artistaProp, faseActiva, onClose, modoLectura = false }) {
  const { user } = useAuth()
  const { hasVotado, getVotacion, createVotacion, updateVotacion } = useVotacionesStore()
  const { isFavorito, toggleFavorito } = useFavoritosStore()
  const { fetchArtistaById } = useArtistasStore()

  // Estado para el artista con datos completos (incluyendo obras con URLs)
  const [artista, setArtista] = useState(artistaProp)
  const [loadingArtista, setLoadingArtista] = useState(false)

  // Cargar datos completos del artista al montar
  useEffect(() => {
    const cargarDatosCompletos = async () => {
      if (artistaProp?.id) {
        setLoadingArtista(true)
        const result = await fetchArtistaById(artistaProp.id)
        if (result.success) {
          setArtista(result.data)
        }
        setLoadingArtista(false)
      }
    }
    cargarDatosCompletos()
  }, [artistaProp?.id, fetchArtistaById])

  const [votoSeleccionado, setVotoSeleccionado] = useState(null) // true = favor, false = contra, null = no seleccionado
  const [comentario, setComentario] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [loadingFavorito, setLoadingFavorito] = useState(false)

  // Estados para visualización de documentos/obras
  const [viewerModal, setViewerModal] = useState({ open: false, url: '', type: '', title: '' })
  const [obraModal, setObraModal] = useState({ open: false, obra: null })

  // Verificar si ya voto
  const yaVoto = hasVotado(user?.id, artista.id, faseActiva?.id)
  const votacionExistente = yaVoto ? getVotacion(user?.id, artista.id, faseActiva?.id) : null

  // Verificar si es favorito
  const esFavorito = isFavorito(artista.id, faseActiva?.id)

  // Handler para toggle favorito
  const handleToggleFavorito = async () => {
    if (!faseActiva) return
    setLoadingFavorito(true)
    await toggleFavorito(artista.id, faseActiva.id)
    setLoadingFavorito(false)
  }

  // Determinar tipo de archivo
  const getFileType = (url) => {
    if (!url) return 'unknown'
    const lowerUrl = url.toLowerCase()
    if (lowerUrl.includes('.pdf') || lowerUrl.includes('application/pdf')) {
      return 'pdf'
    }
    if (lowerUrl.match(/\.(jpg|jpeg|png|webp|gif)/i)) {
      return 'image'
    }
    return 'unknown'
  }

  // Abrir visor de documentos
  const handleOpenViewer = (url, type, title) => {
    setViewerModal({ open: true, url, type, title })
  }

  // Cargar voto existente
  useEffect(() => {
    if (votacionExistente) {
      setVotoSeleccionado(votacionExistente.voto)
      setComentario(votacionExistente.comentario || '')
    }
  }, [votacionExistente])

  const handleVotar = async () => {
    if (votoSeleccionado === null) {
      setError('Por favor selecciona tu voto (A Favor o En Contra)')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      let result

      if (yaVoto) {
        // Actualizar voto existente
        result = await updateVotacion(votacionExistente.id, votoSeleccionado, comentario)
      } else {
        // Crear nuevo voto
        result = await createVotacion(user.id, artista.id, faseActiva.id, votoSeleccionado, comentario)
      }

      if (result.success) {
        // Cerrar modal después de un breve delay
        setTimeout(() => {
          onClose()
        }, 500)
      } else {
        setError(result.error || 'Error al guardar voto')
      }
    } catch (err) {
      setError('Error al guardar voto')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`${artista.nombre} ${artista.apellido}`}
      size="xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            {/* Boton favorito */}
            <button
              onClick={handleToggleFavorito}
              disabled={loadingFavorito}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                esFavorito
                  ? 'bg-red-50 border-red-300 text-red-600 hover:bg-red-100'
                  : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {loadingFavorito ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill={esFavorito ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              )}
              {esFavorito ? 'En favoritos' : 'Agregar a favoritos'}
            </button>
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
              {modoLectura ? 'Cerrar' : 'Cancelar'}
            </Button>
            {!modoLectura && (
              <Button onClick={handleVotar} disabled={isSubmitting || votoSeleccionado === null}>
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </>
                ) : yaVoto ? (
                  'Actualizar Voto'
                ) : (
                  'Guardar Voto'
                )}
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
        {/* Header con foto y datos básicos */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Foto */}
          <div className="flex-shrink-0">
            <img
              src={artista.foto}
              alt={artista.nombre}
              className="w-48 h-48 rounded-lg object-cover shadow-lg"
            />
          </div>

          {/* Datos básicos */}
          <div className="flex-1 space-y-3">
            <div>
              <Badge variant="info" className="mb-2">
                {CATEGORIAS[artista.categoria]}
              </Badge>
              <h2 className="text-2xl font-bold text-gray-900">
                {artista.nombre} {artista.apellido}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500">Email:</span>
                <p className="font-medium text-gray-900">{artista.email}</p>
              </div>
              <div>
                <span className="text-gray-500">Teléfono:</span>
                <p className="font-medium text-gray-900">{artista.telefono}</p>
              </div>
              <div>
                <span className="text-gray-500">Ubicación:</span>
                <p className="font-medium text-gray-900">{artista.ciudad}, {artista.pais}</p>
              </div>
              <div>
                <span className="text-gray-500">Fecha de nacimiento:</span>
                <p className="font-medium text-gray-900">
                  {new Date(artista.fecha_nacimiento).toLocaleDateString('es-MX')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Biografía */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Biografía Artística</h3>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {artista.bio}
          </p>
        </div>

        {/* Redes sociales */}
        {artista.redes_sociales && Object.keys(artista.redes_sociales).length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Redes Sociales</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(artista.redes_sociales).map(([key, value]) => (
                <a
                  key={key}
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm hover:bg-blue-100 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                  </svg>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Paquete seleccionado */}
        {artista.paquete && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Paquete Seleccionado</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-xs text-gray-500">Paquete</span>
                <p className="font-medium text-gray-900">{artista.paquete.nombre}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Tipo</span>
                <p className="font-medium text-gray-900">{artista.paquete.tipo}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Dimensiones</span>
                <p className="font-medium text-gray-900">
                  {artista.paquete.tipo === '3D' ? (
                    `${artista.paquete.metros_cuadrados}m² (base)`
                  ) : (
                    `${artista.paquete.metros_lineales}m × ${artista.paquete.altura_pared}m`
                  )}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Precio</span>
                <p className="font-medium text-gray-900">${artista.paquete.precio_mxn?.toLocaleString('es-MX')} MXN</p>
              </div>
            </div>
          </div>
        )}

        {/* Lienzo de Diseño */}
        {(artista.layout_canvas_pdf || artista.layout_canvas_url) && (
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Lienzo de Diseño</h3>

            {/* Si hay PDF, mostrarlo como principal */}
            {artista.layout_canvas_pdf ? (
              <div className="space-y-3">
                {/* Preview thumbnail si existe */}
                {artista.layout_canvas_url && (
                  <div className="bg-white p-2 rounded-lg border border-gray-200">
                    <img
                      src={artista.layout_canvas_url}
                      alt="Preview del lienzo"
                      className="w-full rounded-lg"
                      style={{ maxHeight: '200px', objectFit: 'contain' }}
                    />
                  </div>
                )}

                {/* Botón para ver PDF */}
                <button
                  onClick={() => handleOpenViewer(artista.layout_canvas_pdf, 'pdf', 'Lienzo del Artista (PDF)')}
                  className="w-full flex items-center justify-center gap-3 p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span className="font-medium">Ver Lienzo PDF</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </button>
              </div>
            ) : (
              /* Si solo hay imagen */
              <div
                className="cursor-pointer group"
                onClick={() => handleOpenViewer(artista.layout_canvas_url, 'image', 'Lienzo del Artista')}
              >
                <img
                  src={artista.layout_canvas_url}
                  alt="Layout del lienzo"
                  className="w-full rounded-lg border-2 border-gray-200 group-hover:border-purple-400 transition-colors"
                  style={{ maxHeight: '300px', objectFit: 'contain' }}
                />
                <p className="text-xs text-gray-500 text-center mt-1">Click para ampliar</p>
              </div>
            )}
          </div>
        )}

        {/* Obras para Exhibición */}
        {(() => {
          // Mostrar indicador de carga mientras se obtienen las obras
          if (loadingArtista) {
            return (
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Obras para Exhibición</h3>
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                  <span className="ml-2 text-sm text-gray-500">Cargando obras...</span>
                </div>
              </div>
            )
          }

          // Combinar datos: metadata de layout_canvas_data + URLs de documentos.portfolio_images
          const obrasCanvas = artista.layout_canvas_data?.obras || []
          const obrasDB = artista.documentos?.portfolio_images || artista.obras || []

          // Enriquecer obras del canvas con URLs de la DB
          const obrasEnriquecidas = obrasCanvas.map((obraCanvas, index) => {
            // Buscar la obra correspondiente en la DB por título o por índice
            const obraDB = obrasDB.find(o => o.titulo === obraCanvas.titulo) || obrasDB[index]
            return {
              ...obraCanvas,
              preview: obraCanvas.preview || obraDB?.imagen_url || null,
              imagen_url: obraDB?.imagen_url || null
            }
          })

          if (obrasEnriquecidas.length === 0) return null

          return (
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Obras para Exhibición ({obrasEnriquecidas.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {obrasEnriquecidas.map((obra, index) => {
                  const imagenUrl = obra.preview || obra.imagen_url
                  return (
                    <div
                      key={index}
                      onClick={() => setObraModal({ open: true, obra: { ...obra, preview: imagenUrl } })}
                      className="bg-white p-3 rounded-lg border border-gray-200 hover:border-green-400 hover:shadow-md transition-all cursor-pointer group"
                    >
                      {imagenUrl ? (
                        <div className="aspect-square rounded-lg overflow-hidden mb-2 bg-gray-100 relative">
                          <img
                            src={imagenUrl}
                            alt={obra.titulo}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          {obra.tipo_obra && (
                            <span className={`absolute top-1 right-1 px-1.5 py-0.5 text-[10px] font-semibold rounded ${
                              obra.tipo_obra === '3D' ? 'bg-purple-600 text-white' : 'bg-blue-600 text-white'
                            }`}>
                              {obra.tipo_obra}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="aspect-square rounded-lg overflow-hidden mb-2 bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-xs">Sin imagen</span>
                        </div>
                      )}
                      <p className="font-medium text-gray-900 text-sm truncate">{obra.titulo || `Obra ${index + 1}`}</p>
                      <p className="text-xs text-gray-500">
                        {obra.ancho_cm} × {obra.alto_cm}{obra.largo_cm ? ` × ${obra.largo_cm}` : ''} cm
                      </p>
                      <p className="text-xs text-green-600 font-medium mt-1">${obra.precio_mxn?.toLocaleString('es-MX')} MXN</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })()}

        {/* Documentos */}
        {artista.documentos && Object.keys(artista.documentos).filter(k => k !== 'portfolio_images' && artista.documentos[k]).length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Documentos</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {Object.entries(artista.documentos).filter(([key, value]) => value && key !== 'portfolio_images').map(([key, value]) => {
                const fileType = key.includes('cv') || key.includes('portfolio') || key.includes('identificacion') ? 'pdf' : getFileType(value)
                const displayName = key === 'cv' ? 'Currículum Vitae' :
                                    key === 'portfolio' ? 'Portfolio' :
                                    key === 'identificacion' ? 'Identificación' :
                                    key.replace(/_url$/i, '').replace(/_/g, ' ')

                return (
                  <button
                    key={key}
                    onClick={() => handleOpenViewer(value, fileType, displayName)}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group text-left"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
                      <p className="text-xs text-gray-500">Click para ver</p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Seccion de votacion - solo si NO es modo lectura */}
        {!modoLectura && (
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {yaVoto ? 'Editar tu votacion' : 'Emite tu voto'}
            </h3>

            {/* Botones de votacion */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <button
                onClick={() => setVotoSeleccionado(true)}
                className={`
                  p-6 rounded-lg border-2 transition-all
                  ${votoSeleccionado === true
                    ? 'border-green-600 bg-green-50 shadow-lg'
                    : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                  }
                `}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center
                    ${votoSeleccionado === true ? 'bg-green-600' : 'bg-gray-200'}
                  `}>
                    <svg className={`w-7 h-7 ${votoSeleccionado === true ? 'text-white' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className={`font-semibold ${votoSeleccionado === true ? 'text-green-700' : 'text-gray-700'}`}>
                    A Favor
                  </span>
                  <span className="text-xs text-gray-600">Apoyo la participacion de este artista</span>
                </div>
              </button>

              <button
                onClick={() => setVotoSeleccionado(false)}
                className={`
                  p-6 rounded-lg border-2 transition-all
                  ${votoSeleccionado === false
                    ? 'border-red-600 bg-red-50 shadow-lg'
                    : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
                  }
                `}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center
                    ${votoSeleccionado === false ? 'bg-red-600' : 'bg-gray-200'}
                  `}>
                    <svg className={`w-7 h-7 ${votoSeleccionado === false ? 'text-white' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <span className={`font-semibold ${votoSeleccionado === false ? 'text-red-700' : 'text-gray-700'}`}>
                    En Contra
                  </span>
                  <span className="text-xs text-gray-600">No apoyo la participacion</span>
                </div>
              </button>
            </div>

            {/* Comentarios */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comentarios (opcional)
              </label>
              <textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                rows={4}
                placeholder="Escribe tus observaciones sobre el trabajo de este artista..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Tus comentarios son privados y solo visibles para los administradores
              </p>
            </div>
          </div>
        )}

        {/* Mensaje en modo lectura */}
        {modoLectura && (
          <div className="border-t border-gray-200 pt-6">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm text-blue-700">
                    <strong>Votaciones cerradas</strong>
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    Las votaciones para esta fase aun no estan abiertas. Puedes marcar este artista como favorito para tenerlo destacado cuando se abran las votaciones.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de visualización de documentos/imágenes */}
      {viewerModal.open && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setViewerModal({ open: false, url: '', type: '', title: '' })}
        >
          <div
            className="relative max-w-[95vw] max-h-[95vh] bg-white rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">{viewerModal.title}</h3>
              <div className="flex items-center gap-2">
                <a
                  href={viewerModal.url}
                  download
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                  title="Descargar"
                >
                  <Download size={20} />
                </a>
                <a
                  href={viewerModal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                  title="Abrir en nueva pestaña"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                <button
                  onClick={() => setViewerModal({ open: false, url: '', type: '', title: '' })}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-auto" style={{ maxHeight: 'calc(95vh - 80px)' }}>
              {viewerModal.type === 'pdf' ? (
                <iframe
                  src={viewerModal.url}
                  className="w-full"
                  style={{ height: 'calc(95vh - 80px)', minWidth: '800px' }}
                  title={viewerModal.title}
                />
              ) : (
                <div className="flex items-center justify-center p-4 bg-gray-100">
                  <img
                    src={viewerModal.url}
                    alt={viewerModal.title}
                    className="max-w-full max-h-[calc(95vh-120px)] object-contain"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Obra Individual */}
      {obraModal.open && obraModal.obra && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setObraModal({ open: false, obra: null })}
        >
          <div
            className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón cerrar */}
            <button
              onClick={() => setObraModal({ open: false, obra: null })}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col md:flex-row">
              {/* Imagen grande */}
              <div className="md:w-2/3 bg-gray-900 flex items-center justify-center p-4 relative">
                {obraModal.obra.preview && (
                  <>
                    <img
                      src={obraModal.obra.preview}
                      alt={obraModal.obra.titulo}
                      className="max-w-full max-h-[70vh] object-contain"
                    />
                    <a
                      href={obraModal.obra.preview}
                      download={`obra-${(obraModal.obra.titulo || 'sin-titulo').replace(/\s+/g, '-').toLowerCase()}.jpg`}
                      className="absolute bottom-6 left-1/2 -translate-x-1/2 inline-flex items-center gap-2 px-4 py-2 bg-white/90 hover:bg-white text-gray-900 rounded-lg shadow-lg transition-all text-sm font-medium"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Download size={16} />
                      Descargar imagen
                    </a>
                  </>
                )}
              </div>

              {/* Ficha técnica */}
              <div className="md:w-1/3 p-6 bg-white">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    {obraModal.obra.titulo || 'Sin título'}
                  </h3>
                  {obraModal.obra.tipo_obra && (
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${
                      obraModal.obra.tipo_obra === '3D'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {obraModal.obra.tipo_obra}
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Dimensiones</span>
                      <p className="font-medium text-gray-900">
                        {obraModal.obra.ancho_cm} × {obraModal.obra.alto_cm}
                        {obraModal.obra.largo_cm ? ` × ${obraModal.obra.largo_cm}` : ''} cm
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Año</span>
                      <p className="font-medium text-gray-900">{obraModal.obra.anio || '-'}</p>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Técnica</span>
                    <p className="font-medium text-gray-900">{obraModal.obra.tecnica || '-'}</p>
                  </div>

                  <div className="pt-4 border-t">
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Precio</span>
                    <p className="text-2xl font-bold text-green-600">
                      ${obraModal.obra.precio_mxn?.toLocaleString('es-MX')} MXN
                    </p>
                  </div>

                  {obraModal.obra.notas_montaje && (
                    <div className="pt-4 border-t">
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Notas de montaje</span>
                      <p className="text-sm text-gray-700 mt-1 italic">{obraModal.obra.notas_montaje}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}
