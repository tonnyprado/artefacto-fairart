'use client'

import { useState, useEffect } from 'react'
import { useVotacionesStore } from '@/stores/votacionesStore'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

export default function FichaPostulacion({ postulacion, ronda, onClose, onVotoGuardado }) {
  const { createVotacion, updateVotacion } = useVotacionesStore()

  const [voto, setVoto] = useState(postulacion.mi_voto || null)
  const [comentario, setComentario] = useState(postulacion.mi_comentario || '')
  const [conoceArtista, setConoceArtista] = useState(postulacion.mi_conoce_artista || false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleGuardarVoto = async () => {
    if (voto === null) {
      alert('Por favor selecciona un voto')
      return
    }

    setIsSubmitting(true)

    const data = {
      postulacion_id: postulacion.id,
      ronda_id: ronda.id,
      valor: voto,
      comentario: comentario.trim() || null,
      conoce_artista: conoceArtista
    }

    let result
    if (postulacion.ya_votado) {
      result = await updateVotacion(postulacion.id, data)
    } else {
      result = await createVotacion(data)
    }

    setIsSubmitting(false)

    if (result.success) {
      onVotoGuardado()
      onClose()
    } else {
      alert('Error al guardar voto: ' + result.error)
    }
  }

  // Determinar opciones de voto según la ronda
  const getOpcionesVoto = () => {
    if (ronda.numero === 1) {
      return [
        { valor: 2, label: 'Sí', color: 'bg-green-600 hover:bg-green-700', descripcion: 'Recomiendo que continúe' },
        { valor: 1, label: 'Tal vez', color: 'bg-yellow-600 hover:bg-yellow-700', descripcion: 'Indeciso, puede continuar' },
        { valor: 0, label: 'No', color: 'bg-red-600 hover:bg-red-700', descripcion: 'No recomiendo que continúe' }
      ]
    } else if (ronda.numero === 2) {
      return [
        { valor: 1, label: 'Sí, voto por este artista', color: 'bg-green-600 hover:bg-green-700', descripcion: 'Usar uno de mis votos limitados' }
      ]
    } else if (ronda.numero === 3) {
      return [
        { valor: 1, label: 'Sí', color: 'bg-green-600 hover:bg-green-700', descripcion: 'Apruebo esta selección' },
        { valor: 0, label: 'No', color: 'bg-red-600 hover:bg-red-700', descripcion: 'No apruebo esta selección' }
      ]
    }
    return []
  }

  const opcionesVoto = getOpcionesVoto()

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      maxWidth="4xl"
      title={
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {postulacion.nombre} {postulacion.apellido}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {postulacion.disciplina} • {postulacion.tipo.toUpperCase()}
            </p>
          </div>
          {postulacion.ya_votado && (
            <Badge variant="success">Ya votado</Badge>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* Información del artista */}
        <div className="flex gap-6">
          {postulacion.artista_foto && (
            <img
              src={postulacion.artista_foto}
              alt={`${postulacion.nombre} ${postulacion.apellido}`}
              className="w-32 h-32 rounded-xl object-cover"
            />
          )}
          <div className="flex-1">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{postulacion.artista_email || 'No disponible'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Obras presentadas</p>
                <p className="font-medium text-gray-900">{postulacion.total_obras || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Estado</p>
                <Badge variant="primary">{postulacion.estado}</Badge>
              </div>
              {postulacion.es_carryover && (
                <div>
                  <Badge variant="warning">Carryover</Badge>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Descripción o biografía si existe */}
        {postulacion.descripcion && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Descripción</h3>
            <p className="text-gray-700">{postulacion.descripcion}</p>
          </div>
        )}

        {/* Opciones de voto */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Tu voto</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {opcionesVoto.map((opcion) => (
              <button
                key={opcion.valor}
                onClick={() => setVoto(opcion.valor)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  voto === opcion.valor
                    ? `${opcion.color} text-white border-transparent shadow-lg scale-105`
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="font-bold text-lg mb-1">{opcion.label}</div>
                <div className={`text-sm ${voto === opcion.valor ? 'text-white/90' : 'text-gray-500'}`}>
                  {opcion.descripcion}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Checkbox: ¿Conoces al artista? */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="conoce_artista"
            checked={conoceArtista}
            onChange={(e) => setConoceArtista(e.target.checked)}
            className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
          />
          <label htmlFor="conoce_artista" className="text-sm text-gray-700">
            Conozco personalmente a este artista
          </label>
        </div>

        {/* Comentario */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comentario (opcional)
          </label>
          <textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            rows={3}
            placeholder="Agrega tus observaciones sobre esta postulación..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        {/* Botones */}
        <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleGuardarVoto}
            disabled={isSubmitting || voto === null}
          >
            {isSubmitting ? 'Guardando...' : postulacion.ya_votado ? 'Actualizar Voto' : 'Guardar Voto'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
