'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useVotacionesStore } from '@/stores/votacionesStore'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

/**
 * ArtistaPerfilModal - Modal de perfil de artista con votación
 *
 * Muestra información completa del artista:
 * - Foto y datos personales
 * - Biografía completa
 * - Redes sociales (links)
 * - Documentos (CV, portfolio, ID)
 * - Interfaz de votación (A Favor / En Contra)
 * - Textarea para comentarios
 * - Si ya votó, permite editar
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

export default function ArtistaPerfilModal({ artista, faseActiva, onClose }) {
  const { user } = useAuth()
  const { hasVotado, getVotacion, createVotacion, updateVotacion } = useVotacionesStore()

  const [votoSeleccionado, setVotoSeleccionado] = useState(null) // true = favor, false = contra, null = no seleccionado
  const [comentario, setComentario] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  // Verificar si ya votó
  const yaVoto = hasVotado(user?.id, artista.id, faseActiva.id)
  const votacionExistente = yaVoto ? getVotacion(user?.id, artista.id, faseActiva.id) : null

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
          <div>
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
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

        {/* Documentos */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Documentos</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {artista.documentos && Object.entries(artista.documentos).map(([key, value]) => (
              <a
                key={key}
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {key === 'cv' && 'Currículum Vitae'}
                    {key === 'portfolio' && 'Portfolio'}
                    {key === 'identificacion' && 'Identificación'}
                  </p>
                  <p className="text-xs text-gray-500">Ver documento</p>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            ))}
          </div>
        </div>

        {/* Separador */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {yaVoto ? 'Editar tu votación' : 'Emite tu voto'}
          </h3>

          {/* Botones de votación */}
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
                <span className="text-xs text-gray-600">Apoyo la participación de este artista</span>
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
                <span className="text-xs text-gray-600">No apoyo la participación</span>
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
      </div>
    </Modal>
  )
}
