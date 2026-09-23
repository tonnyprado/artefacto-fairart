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
 * ArtistaPerfilModal - Modal de perfil de artista (solo lectura)
 *
 * Muestra informacion completa del artista:
 * - Foto y datos personales
 * - Biografia completa
 * - Redes sociales (links)
 * - Documentos (CV, portfolio, ID)
 * - Boton de favorito
 *
 * NOTA: La votación se realiza ahora a través del sistema de rondas.
 * Este modal es solo para explorar información del artista.
 *
 * Props:
 * - modoLectura: boolean - Por defecto true, oculta la seccion de votacion
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

export default function ArtistaPerfilModal({ artista: artistaProp, faseActiva, onClose, modoLectura = true }) {
  const { user } = useAuth()
  const { hasVotado, getVotacion, createVotacion, updateVotacion } = useVotacionesStore()
  const { isFavorito, toggleFavorito } = useFavoritosStore()

  // Estado para el artista con datos completos (incluyendo obras con URLs)
  const [artista, setArtista] = useState(artistaProp)
  const [loadingArtista, setLoadingArtista] = useState(false)

  // Actualizar estado local cuando cambia artistaProp
  useEffect(() => {
    setArtista(artistaProp)
  }, [artistaProp])

  // Auto-armar URLs de redes sociales cuando solo ponen username
  const formatSocialUrl = (key, value) => {
    if (!value) return null
    // Si ya es una URL completa, devolverla
    if (value.startsWith('http://') || value.startsWith('https://')) {
      return value
    }
    // Limpiar @ al inicio si existe
    const cleanValue = value.replace(/^@/, '')
    // Armar URL según la red social
    switch (key.toLowerCase()) {
      case 'instagram':
        return `https://instagram.com/${cleanValue}`
      case 'twitter':
      case 'x':
        return `https://x.com/${cleanValue}`
      case 'tiktok':
        return `https://tiktok.com/@${cleanValue}`
      case 'behance':
        return `https://behance.net/${cleanValue}`
      case 'linkedin':
        return `https://linkedin.com/in/${cleanValue}`
      default:
        // Para website/sitio_web, agregar https si no tiene protocolo
        if (key.includes('web') || key.includes('sitio')) {
          return value.includes('.') ? `https://${cleanValue}` : value
        }
        return value
    }
  }

  // Obtener todas las redes sociales del artista (desde redes_sociales o campos directos)
  const getRedesSociales = () => {
    const redes = []

    // Agregar desde redes_sociales JSON
    if (artista.redes_sociales && typeof artista.redes_sociales === 'object') {
      Object.entries(artista.redes_sociales).forEach(([key, value]) => {
        if (value && key.toLowerCase() !== 'facebook') { // Ignorar Facebook
          const normalizedKey = key.toLowerCase().includes('sitio') || key.toLowerCase().includes('website')
            ? 'website'
            : key.toLowerCase()
          redes.push({ key: normalizedKey, value })
        }
      })
    }

    // Agregar Instagram si existe como campo directo
    if (artista.instagram && !redes.find(r => r.key === 'instagram')) {
      redes.push({ key: 'instagram', value: artista.instagram })
    }

    // Agregar Website si existe como campo directo
    if (artista.website && !redes.find(r => r.key === 'website')) {
      redes.push({ key: 'website', value: artista.website })
    }

    return redes
  }

  // Obtener ícono según la red social
  const getSocialIcon = (key) => {
    switch (key.toLowerCase()) {
      case 'instagram':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        )
      case 'website':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
        )
      case 'whatsapp':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        )
      default:
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
            <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
          </svg>
        )
    }
  }

  // Obtener color según la red social
  const getSocialColor = (key) => {
    switch (key.toLowerCase()) {
      case 'instagram':
        return 'bg-pink-50 text-pink-700 hover:bg-pink-100'
      case 'website':
        return 'bg-blue-50 text-blue-700 hover:bg-blue-100'
      case 'whatsapp':
        return 'bg-green-50 text-green-700 hover:bg-green-100'
      case 'twitter':
      case 'x':
        return 'bg-sky-50 text-sky-700 hover:bg-sky-100'
      default:
        return 'bg-gray-50 text-gray-700 hover:bg-gray-100'
    }
  }

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
              loading="eager"
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
        {getRedesSociales().length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Redes Sociales</h3>
            <div className="flex flex-wrap gap-3">
              {getRedesSociales().map(({ key, value }) => (
                <a
                  key={key}
                  href={formatSocialUrl(key, value)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${getSocialColor(key)}`}
                  title={formatSocialUrl(key, value)}
                >
                  {getSocialIcon(key)}
                  <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                  <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* WhatsApp (si tiene teléfono) */}
        {artista.telefono && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Contacto</h3>
            <a
              href={`https://wa.me/${artista.telefono.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${artista.nombre}, te contactamos desde ARTEFACTO 2027.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span>WhatsApp</span>
              <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
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
                      loading="lazy"
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
                  loading="lazy"
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

          let obrasEnriquecidas = []

          if (obrasCanvas.length > 0) {
            // Si hay obras en el canvas, enriquecerlas con URLs de la DB
            obrasEnriquecidas = obrasCanvas.map((obraCanvas, index) => {
              // Buscar la obra correspondiente en la DB por título (normalizado) o por índice
              const tituloNormalizado = obraCanvas.titulo?.trim().toLowerCase()
              const obraDB = obrasDB.find(o => o.titulo?.trim().toLowerCase() === tituloNormalizado) || obrasDB[index]
              return {
                ...obraCanvas,
                preview: obraCanvas.preview || obraDB?.imagen_url || null,
                imagen_url: obraDB?.imagen_url || null,
                // Agregar campos que puedan faltar en el canvas
                id: obraDB?.id || null,
                artista_id: obraDB?.artista_id || null
              }
            })
          } else if (obrasDB.length > 0) {
            // Si no hay obras en canvas pero sí en la BD, mostrar todas las obras de la BD
            obrasEnriquecidas = obrasDB.map(obra => ({
              ...obra,
              preview: obra.imagen_url,
              // Asegurar que los campos necesarios existan
              alto_cm: obra.alto_cm || 0,
              ancho_cm: obra.ancho_cm || 0,
              precio_mxn: obra.precio_mxn || 0
            }))
          }

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
                            loading="lazy"
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
                      {/* Desglose de precio */}
                      {obra.precio_mxn && (
                        <div className="mt-2 pt-2 border-t border-gray-100 space-y-0.5">
                          <div className="flex justify-between text-[10px]">
                            <span className="text-gray-500">Ganancia artista (75%):</span>
                            <span className="font-medium text-gray-700">${obra.precio_mxn?.toLocaleString('es-MX')}</span>
                          </div>
                          {obra.comision_artefacto && (
                            <div className="flex justify-between text-[10px]">
                              <span className="text-gray-500">Comisión (25%):</span>
                              <span className="text-gray-700">${obra.comision_artefacto?.toLocaleString('es-MX')}</span>
                            </div>
                          )}
                          {obra.precio_publico && (
                            <div className="flex justify-between text-[10px]">
                              <span className="text-gray-500">Precio público:</span>
                              <span className="text-gray-700">${obra.precio_publico?.toLocaleString('es-MX')}</span>
                            </div>
                          )}
                          {obra.precio_sugerido && (
                            <div className="flex justify-between text-[10px] pt-1 border-t border-gray-100">
                              <span className="font-semibold text-gray-700">Precio sugerido:</span>
                              <span className="font-bold text-green-600">${obra.precio_sugerido?.toLocaleString('es-MX')}</span>
                            </div>
                          )}
                        </div>
                      )}
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

                  {/* Desglose de precios con calculadora */}
                  {obraModal.obra.precio_mxn && (
                    <div className="pt-4 border-t">
                      <span className="text-xs text-gray-500 uppercase tracking-wide block mb-3">Desglose de Precio</span>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                          <span className="text-sm text-gray-600">Ganancia artista (75%)</span>
                          <span className="text-base font-semibold text-gray-900">${obraModal.obra.precio_mxn?.toLocaleString('es-MX')}</span>
                        </div>
                        {obraModal.obra.comision_artefacto && (
                          <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                            <span className="text-sm text-gray-600">Comisión Artefacto (25%)</span>
                            <span className="text-base text-gray-900">${obraModal.obra.comision_artefacto?.toLocaleString('es-MX')}</span>
                          </div>
                        )}
                        {obraModal.obra.precio_publico && (
                          <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                            <span className="text-sm text-gray-600">Precio al público</span>
                            <span className="text-base text-gray-900">${obraModal.obra.precio_publico?.toLocaleString('es-MX')}</span>
                          </div>
                        )}
                        {obraModal.obra.precio_sugerido && (
                          <div className="flex justify-between items-center pt-2">
                            <span className="text-sm font-semibold text-gray-900">Precio sugerido (redondeado)</span>
                            <span className="text-xl font-bold text-green-600">${obraModal.obra.precio_sugerido?.toLocaleString('es-MX')}</span>
                          </div>
                        )}
                        <p className="text-xs text-gray-500 pt-2 border-t border-gray-200 italic">
                          *Montos sin IVA. Otras comisiones pueden aplicarse dependiendo del método de pago del comprador.
                        </p>
                      </div>
                    </div>
                  )}

                  {obraModal.obra.notas_montaje && (
                    <div className="pt-4 border-t">
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Notas de montaje</span>
                      <p className="text-sm text-gray-700 mt-1 italic">{obraModal.obra.notas_montaje}</p>
                    </div>
                  )}

                  {/* Fotos de detalle */}
                  {obraModal.obra.fotos_detalle_urls && obraModal.obra.fotos_detalle_urls.length > 0 && (
                    <div className="pt-4 border-t">
                      <span className="text-xs text-gray-500 uppercase tracking-wide block mb-3">
                        Fotos de detalle ({obraModal.obra.fotos_detalle_urls.length})
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {obraModal.obra.fotos_detalle_urls.map((fotoUrl, idx) => (
                          <div
                            key={idx}
                            className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity group"
                            onClick={() => window.open(fotoUrl, '_blank')}
                          >
                            <img
                              src={fotoUrl}
                              alt={`Detalle ${idx + 1}`}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                              <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        ))}
                      </div>
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
