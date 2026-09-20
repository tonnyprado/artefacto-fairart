'use client'

import { useState, useEffect } from 'react'
import { useVotacionesStore } from '@/stores/votacionesStore'
import Button from '@/components/ui/Button'

export default function ControlVotoRondas({ postulacion, ronda, onVotoGuardado }) {
  const { createVotacion, getMisVotaciones } = useVotacionesStore()

  const [valor, setValor] = useState(null)
  const [comentario, setComentario] = useState('')
  const [conoceArtista, setConoceArtista] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [votoExistente, setVotoExistente] = useState(null)

  useEffect(() => {
    // Cargar voto existente si ya votó
    if (postulacion.ya_votado && postulacion.mi_voto !== undefined) {
      setVotoExistente({
        valor: postulacion.mi_voto,
        comentario: postulacion.mi_comentario || '',
        conoce_artista: postulacion.mi_conoce_artista || false
      })
      setValor(postulacion.mi_voto)
      setComentario(postulacion.mi_comentario || '')
      setConoceArtista(postulacion.mi_conoce_artista || false)
    }
  }, [postulacion])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (valor === null) {
      setError('Por favor selecciona una opción de voto')
      return
    }

    setIsLoading(true)

    try {
      const result = await createVotacion({
        postulacion_id: postulacion.id,
        ronda_id: ronda.id,
        valor,
        comentario: comentario.trim() || null,
        conoce_artista: conoceArtista
      })

      if (result.success) {
        onVotoGuardado()
      } else {
        setError(result.error || 'Error al guardar el voto')
      }
    } catch (err) {
      setError(err.message || 'Error al guardar el voto')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Título */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          Tu Votación
        </h3>
        {votoExistente && (
          <p className="text-sm text-gray-600">
            Ya votaste por esta postulación. Puedes actualizar tu voto.
          </p>
        )}
      </div>

      {/* Controles según ronda */}
      {ronda.numero === 1 && (
        <ControlRonda1 valor={valor} setValor={setValor} />
      )}

      {ronda.numero === 2 && (
        <ControlRonda2 valor={valor} setValor={setValor} />
      )}

      {ronda.numero === 3 && (
        <ControlRonda3 valor={valor} setValor={setValor} />
      )}

      {/* Checkbox "Conozco al artista" */}
      <div>
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={conoceArtista}
            onChange={(e) => setConoceArtista(e.target.checked)}
            className="mt-1 w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
          />
          <div>
            <span className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
              Conozco a este artista
            </span>
            <p className="text-xs text-gray-500 mt-1">
              Lo conozco personalmente, lo represento o tengo un vínculo profesional
            </p>
          </div>
        </label>
      </div>

      {/* Campo de comentario */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Comentario (opcional)
        </label>
        <textarea
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
          placeholder="Agrega un comentario sobre esta postulación..."
        />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Botón de envío */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        disabled={isLoading || valor === null}
      >
        {isLoading ? 'Guardando...' : votoExistente ? 'Actualizar Voto' : 'Guardar Voto'}
      </Button>
    </form>
  )
}

function ControlRonda1({ valor, setValor }) {
  const opciones = [
    { valor: 0, label: 'No', color: 'red', description: 'No cumple con los criterios' },
    { valor: 1, label: 'Tal vez', color: 'yellow', description: 'Tiene potencial, pero hay dudas' },
    { valor: 2, label: 'Sí', color: 'green', description: 'Cumple con los criterios' }
  ]

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Selecciona tu voto
      </label>
      <div className="grid grid-cols-3 gap-3">
        {opciones.map(opcion => (
          <button
            key={opcion.valor}
            type="button"
            onClick={() => setValor(opcion.valor)}
            className={`relative p-4 rounded-xl border-2 transition-all ${
              valor === opcion.valor
                ? opcion.color === 'red'
                  ? 'border-red-600 bg-red-50 ring-2 ring-red-600 ring-offset-2'
                  : opcion.color === 'yellow'
                  ? 'border-yellow-600 bg-yellow-50 ring-2 ring-yellow-600 ring-offset-2'
                  : 'border-green-600 bg-green-50 ring-2 ring-green-600 ring-offset-2'
                : 'border-gray-200 hover:border-gray-400'
            }`}
          >
            <div className="text-center">
              <div className={`text-2xl font-bold mb-1 ${
                valor === opcion.valor
                  ? opcion.color === 'red'
                    ? 'text-red-700'
                    : opcion.color === 'yellow'
                    ? 'text-yellow-700'
                    : 'text-green-700'
                  : 'text-gray-900'
              }`}>
                {opcion.label}
              </div>
              <div className="text-xs text-gray-600">
                {opcion.description}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function ControlRonda2({ valor, setValor }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Voto de apoyo
      </label>
      <button
        type="button"
        onClick={() => setValor(valor === 1 ? null : 1)}
        className={`w-full p-6 rounded-xl border-2 transition-all ${
          valor === 1
            ? 'border-red-600 bg-red-50 ring-2 ring-red-600 ring-offset-2'
            : 'border-gray-200 hover:border-gray-400'
        }`}
      >
        <div className="text-center">
          <div className={`text-3xl font-bold mb-2 ${
            valor === 1 ? 'text-red-700' : 'text-gray-900'
          }`}>
            {valor === 1 ? 'Votado' : 'Votar por este artista'}
          </div>
          <div className="text-sm text-gray-600">
            {valor === 1
              ? 'Click para quitar el voto'
              : 'Click para dar tu voto a esta postulación'}
          </div>
        </div>
      </button>
      <p className="text-xs text-gray-500 mt-2 text-center">
        Recuerda que tienes un número limitado de votos en esta ronda
      </p>
    </div>
  )
}

function ControlRonda3({ valor, setValor }) {
  const opciones = [
    { valor: 0, label: 'No', color: 'red', description: 'No debe ser seleccionado' },
    { valor: 1, label: 'Sí', color: 'green', description: 'Debe ser seleccionado' }
  ]

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Selecciona tu voto
      </label>
      <div className="grid grid-cols-2 gap-4">
        {opciones.map(opcion => (
          <button
            key={opcion.valor}
            type="button"
            onClick={() => setValor(opcion.valor)}
            className={`relative p-6 rounded-xl border-2 transition-all ${
              valor === opcion.valor
                ? opcion.color === 'red'
                  ? 'border-red-600 bg-red-50 ring-2 ring-red-600 ring-offset-2'
                  : 'border-green-600 bg-green-50 ring-2 ring-green-600 ring-offset-2'
                : 'border-gray-200 hover:border-gray-400'
            }`}
          >
            <div className="text-center">
              <div className={`text-3xl font-bold mb-2 ${
                valor === opcion.valor
                  ? opcion.color === 'red' ? 'text-red-700' : 'text-green-700'
                  : 'text-gray-900'
              }`}>
                {opcion.label}
              </div>
              <div className="text-sm text-gray-600">
                {opcion.description}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
