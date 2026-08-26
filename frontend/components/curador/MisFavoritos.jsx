'use client'

import { useState, useEffect } from 'react'
import { useFasesStore } from '@/stores/fasesStore'
import { useFavoritosStore } from '@/stores/favoritosStore'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import ArtistaPerfilModal from './ArtistaPerfilModal'

/**
 * MisFavoritos - Lista de artistas marcados como favoritos
 *
 * Muestra los artistas que el curador ha marcado como favoritos
 * Permite filtrar por fase y eliminar favoritos
 *
 * Features:
 * - Lista de todos los favoritos
 * - Filtro por fase
 * - Quitar de favoritos
 * - Ver perfil del artista
 */

const CATEGORIAS = [
  { value: 'pintura', label: 'Pintura' },
  { value: 'escultura', label: 'Escultura' },
  { value: 'fotografia', label: 'Fotografia' },
  { value: 'ilustracion', label: 'Ilustracion' },
  { value: 'arte_digital', label: 'Arte Digital' },
  { value: 'instalacion', label: 'Instalacion' },
  { value: 'video_arte', label: 'Video Arte' },
  { value: 'performance', label: 'Performance' },
  { value: 'arte_textil', label: 'Arte Textil' },
  { value: 'grabado', label: 'Grabado' },
  { value: 'ceramica', label: 'Ceramica' },
  { value: 'arte_objeto', label: 'Arte Objeto' },
  { value: 'otro', label: 'Otro' }
]

export default function MisFavoritos() {
  const { fases, fetchFases } = useFasesStore()
  const { favoritos, fetchMisFavoritos, removeFavorito, isLoading } = useFavoritosStore()

  const [faseFilter, setFaseFilter] = useState('all')
  const [selectedArtista, setSelectedArtista] = useState(null)
  const [selectedFase, setSelectedFase] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [removingId, setRemovingId] = useState(null)

  // Cargar datos al montar
  useEffect(() => {
    fetchFases()
    fetchMisFavoritos()
  }, [fetchFases, fetchMisFavoritos])

  const getCategoriaLabel = (categoria) => {
    return CATEGORIAS.find(c => c.value === categoria)?.label || categoria
  }

  const handleRemoveFavorito = async (e, favoritoId) => {
    e.stopPropagation()
    setRemovingId(favoritoId)
    await removeFavorito(favoritoId)
    setRemovingId(null)
  }

  const handleVerPerfil = (favorito) => {
    // Construir objeto artista desde los datos del favorito
    const artista = {
      id: favorito.artista_id,
      nombre: favorito.artista_nombre,
      apellido: favorito.artista_apellido,
      foto: favorito.artista_foto,
      categoria: favorito.artista_categoria,
      ciudad: favorito.artista_ciudad,
      pais: favorito.artista_pais,
      bio: favorito.artista_bio
    }

    // Buscar la fase correspondiente
    const fase = fases.find(f => f.id === favorito.fase_id)

    setSelectedArtista(artista)
    setSelectedFase(fase)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedArtista(null)
    setSelectedFase(null)
  }

  // Filtrar favoritos por fase
  const favoritosFiltrados = faseFilter === 'all'
    ? favoritos
    : favoritos.filter(f => f.fase_id === parseInt(faseFilter))

  // Agrupar favoritos por fase para estadisticas
  const favoritosPorFase = favoritos.reduce((acc, fav) => {
    acc[fav.fase_id] = (acc[fav.fase_id] || 0) + 1
    return acc
  }, {})

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
        <p className="text-gray-600">Cargando favoritos...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header simple */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Mis Favoritos</h2>
          <p className="text-sm text-gray-500 mt-1">
            {favoritos.length} artistas marcados
          </p>
        </div>
      </div>

      {/* Filtro por fase */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filtrar por fase:</label>
          <select
            value={faseFilter}
            onChange={(e) => setFaseFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="all">Todas las fases ({favoritos.length})</option>
            {fases.filter(f => f.tipo === 'fase').map(fase => (
              <option key={fase.id} value={fase.id}>
                {fase.nombre} ({favoritosPorFase[fase.id] || 0})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de favoritos */}
      {favoritosFiltrados.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No tienes favoritos
          </h3>
          <p className="text-gray-600">
            {faseFilter === 'all'
              ? 'Explora los artistas por fase y marca tus favoritos para tenerlos destacados.'
              : 'No tienes favoritos en esta fase.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoritosFiltrados.map(favorito => (
            <div
              key={favorito.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-all overflow-hidden cursor-pointer group"
              onClick={() => handleVerPerfil(favorito)}
            >
              {/* Foto */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={favorito.artista_foto || '/placeholder-avatar.png'}
                  alt={favorito.artista_nombre}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Badge de fase */}
                <div className="absolute top-3 left-3">
                  <Badge variant="purple">
                    {favorito.fase_nombre}
                  </Badge>
                </div>
                {/* Corazon */}
                <div className="absolute top-3 right-3">
                  <button
                    onClick={(e) => handleRemoveFavorito(e, favorito.id)}
                    disabled={removingId === favorito.id}
                    className="p-2 bg-white rounded-full shadow-lg text-red-500 hover:bg-red-50 transition-colors"
                  >
                    {removingId === favorito.id ? (
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-900 mb-1">
                  {favorito.artista_nombre} {favorito.artista_apellido}
                </h3>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="info" size="sm">
                    {getCategoriaLabel(favorito.artista_categoria)}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {favorito.artista_ciudad}, {favorito.artista_pais}
                </p>

                {/* Notas */}
                {favorito.notas && (
                  <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                    <strong>Nota:</strong> {favorito.notas}
                  </div>
                )}

                {/* Fecha */}
                <p className="text-xs text-gray-400 mt-3">
                  Agregado: {new Date(favorito.created_at).toLocaleDateString('es-MX', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de perfil */}
      {showModal && selectedArtista && selectedFase && (
        <ArtistaPerfilModal
          artista={selectedArtista}
          faseActiva={selectedFase}
          onClose={handleCloseModal}
          modoLectura={!selectedFase.votaciones_abiertas}
        />
      )}
    </div>
  )
}
