'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRondasStore } from '@/stores/rondasStore'
import { usePostulacionesStore } from '@/stores/postulacionesStore'
import { useVotacionesStore } from '@/stores/votacionesStore'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import FichaPostulacion from './FichaPostulacion'

export default function PanelVotacionRondas({ faseId }) {
  const { user } = useAuth()
  const { fetchRondasPorFase, getRondaAbierta } = useRondasStore()
  const { fetchPostulacionesParaVotar, postulacionesParaVotar } = usePostulacionesStore()
  const { getProgreso } = useVotacionesStore()

  const [rondaActual, setRondaActual] = useState(null)
  const [postulacionSeleccionada, setPostulacionSeleccionada] = useState(null)
  const [progreso, setProgreso] = useState(null)
  const [filtros, setFiltros] = useState({
    estado: 'all', // all | sin_votar | votadas
    tipo: 'all', // all | 2d | 3d
    disciplina: 'all'
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (faseId) {
      loadRondaActual()
    }
  }, [faseId])

  useEffect(() => {
    if (rondaActual) {
      loadPostulaciones()
      loadProgreso()
    }
  }, [rondaActual])

  const loadRondaActual = async () => {
    setIsLoading(true)
    await fetchRondasPorFase(faseId)
    const ronda = getRondaAbierta(faseId)
    setRondaActual(ronda)
    setIsLoading(false)
  }

  const loadPostulaciones = async () => {
    if (!rondaActual) return
    await fetchPostulacionesParaVotar(faseId, rondaActual.id)
  }

  const loadProgreso = async () => {
    if (!rondaActual) return
    const result = await getProgreso(rondaActual.id)
    if (result.success) {
      setProgreso(result.data)
    }
  }

  const handleVotoGuardado = () => {
    loadPostulaciones()
    loadProgreso()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando votaciones...</p>
        </div>
      </div>
    )
  }

  if (!rondaActual) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle>No hay rondas activas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Actualmente no hay rondas de votación abiertas para esta fase.
              Por favor, espera a que el administrador abra una ronda.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const postulacionesFiltradas = postulacionesParaVotar.filter(p => {
    if (filtros.estado === 'sin_votar' && p.ya_votado) return false
    if (filtros.estado === 'votadas' && !p.ya_votado) return false
    if (filtros.tipo !== 'all' && p.tipo !== filtros.tipo) return false
    if (filtros.disciplina !== 'all' && p.disciplina !== filtros.disciplina) return false
    return true
  })

  const totalRevisadas = postulacionesParaVotar.filter(p => p.ya_votado).length
  const totalPostulaciones = postulacionesParaVotar.length

  const disciplinas = [...new Set(postulacionesParaVotar.map(p => p.disciplina))]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Header con info de ronda */}
      <div className="max-w-7xl mx-auto px-4 mb-6">
        <Card>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  Ronda {rondaActual.numero} - {getRondaNombre(rondaActual.numero)}
                </h1>
                <Badge variant="success">Abierta</Badge>
              </div>
              <p className="text-gray-600">
                {getRondaDescripcion(rondaActual.numero)}
              </p>
            </div>

            <div className="flex flex-col gap-2 text-right">
              <div className="text-sm text-gray-500">
                Progreso
              </div>
              <div className="text-2xl font-bold text-red-600">
                {totalRevisadas} / {totalPostulaciones}
              </div>
              {progreso && rondaActual.numero === 2 && progreso.max_votos_r2 && (
                <div className="text-sm text-gray-600">
                  Te quedan {progreso.votos_restantes_r2 || 0} votos
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <div className="max-w-7xl mx-auto px-4 mb-6">
        <Card>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex gap-2 items-center">
              <span className="text-sm font-medium text-gray-700">Estado:</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setFiltros(f => ({ ...f, estado: 'all' }))}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    filtros.estado === 'all'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setFiltros(f => ({ ...f, estado: 'sin_votar' }))}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    filtros.estado === 'sin_votar'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Sin votar
                </button>
                <button
                  onClick={() => setFiltros(f => ({ ...f, estado: 'votadas' }))}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    filtros.estado === 'votadas'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Votadas
                </button>
              </div>
            </div>

            <div className="flex gap-2 items-center">
              <span className="text-sm font-medium text-gray-700">Tipo:</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setFiltros(f => ({ ...f, tipo: 'all' }))}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    filtros.tipo === 'all'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setFiltros(f => ({ ...f, tipo: '2d' }))}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    filtros.tipo === '2d'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  2D
                </button>
                <button
                  onClick={() => setFiltros(f => ({ ...f, tipo: '3d' }))}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    filtros.tipo === '3d'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  3D
                </button>
              </div>
            </div>

            <div className="flex gap-2 items-center">
              <span className="text-sm font-medium text-gray-700">Disciplina:</span>
              <select
                value={filtros.disciplina}
                onChange={(e) => setFiltros(f => ({ ...f, disciplina: e.target.value }))}
                className="px-3 py-1 rounded-lg text-sm border border-gray-300 bg-white"
              >
                <option value="all">Todas</option>
                {disciplinas.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>
      </div>

      {/* Grid de postulaciones */}
      <div className="max-w-7xl mx-auto px-4">
        {postulacionesFiltradas.length === 0 ? (
          <Card>
            <CardContent>
              <p className="text-center text-gray-600 py-8">
                No hay postulaciones que coincidan con los filtros seleccionados.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {postulacionesFiltradas.map(postulacion => (
              <PostulacionCard
                key={postulacion.id}
                postulacion={postulacion}
                onClick={() => setPostulacionSeleccionada(postulacion)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal de ficha de postulación */}
      {postulacionSeleccionada && (
        <FichaPostulacion
          postulacion={postulacionSeleccionada}
          ronda={rondaActual}
          onClose={() => setPostulacionSeleccionada(null)}
          onVotoGuardado={handleVotoGuardado}
        />
      )}
    </div>
  )
}

function PostulacionCard({ postulacion, onClick }) {
  return (
    <Card hover className="cursor-pointer" onClick={onClick}>
      <div className="relative">
        {/* Imagen principal */}
        <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 mb-4">
          {postulacion.artista_foto ? (
            <img
              src={postulacion.artista_foto}
              alt={`${postulacion.nombre} ${postulacion.apellido}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="absolute top-2 right-2 flex gap-2">
          {postulacion.ya_votado && (
            <Badge variant="success">Votado</Badge>
          )}
          {postulacion.es_carryover && (
            <Badge variant="warning">Carryover</Badge>
          )}
        </div>
      </div>

      {/* Info */}
      <div>
        <h3 className="font-bold text-lg text-gray-900 mb-1">
          {postulacion.nombre} {postulacion.apellido}
        </h3>
        <p className="text-sm text-gray-600 mb-2">{postulacion.disciplina}</p>
        <div className="flex gap-2">
          <Badge variant={postulacion.tipo === '2d' ? 'primary' : 'secondary'}>
            {postulacion.tipo.toUpperCase()}
          </Badge>
          {postulacion.total_obras > 0 && (
            <span className="text-xs text-gray-500">
              {postulacion.total_obras} obra{postulacion.total_obras !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </Card>
  )
}

function getRondaNombre(numero) {
  switch (numero) {
    case 1: return 'Cribado'
    case 2: return 'Votos Limitados'
    case 3: return 'Deliberación'
    default: return `Ronda ${numero}`
  }
}

function getRondaDescripcion(numero) {
  switch (numero) {
    case 1: return 'Vota Sí, Tal vez o No en cada postulación. Se evalúa la obra, no la calidad de la fotografía.'
    case 2: return 'Tienes un número limitado de votos. Elige estratégicamente tus favoritos.'
    case 3: return 'Votación de mayoría simple sobre las postulaciones en deliberación.'
    default: return ''
  }
}
