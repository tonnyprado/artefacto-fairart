import { create } from 'zustand'
import { favoritosApi } from '@/lib/api'

/**
 * Store de Favoritos
 *
 * Conectado al backend API
 * POST /api/favoritos - Agregar favorito
 * POST /api/favoritos/toggle - Toggle favorito
 * GET /api/favoritos/mis-favoritos - Obtener favoritos del curador
 * GET /api/favoritos/fase/:fase_id - Obtener favoritos por fase
 * GET /api/favoritos/check/:artista_id/:fase_id - Verificar favorito
 * PUT /api/favoritos/:id - Actualizar notas
 * DELETE /api/favoritos/:id - Eliminar favorito
 *
 * DB: favoritos table
 */

export const useFavoritosStore = create((set, get) => ({
  favoritos: [],
  isLoading: false,
  error: null,

  /**
   * Obtener todos los favoritos del curador actual
   */
  fetchMisFavoritos: async (faseId = null) => {
    set({ isLoading: true, error: null })
    try {
      const response = await favoritosApi.getMisFavoritos(faseId)
      set({
        favoritos: response.data,
        isLoading: false
      })
      return response.data
    } catch (error) {
      set({
        error: error.message,
        isLoading: false
      })
      return []
    }
  },

  /**
   * Verificar si un artista es favorito (local)
   */
  isFavorito: (artistaId, faseId) => {
    return get().favoritos.some(
      f => f.artista_id === artistaId && f.fase_id === faseId
    )
  },

  /**
   * Obtener favorito especifico del estado local
   */
  getFavorito: (artistaId, faseId) => {
    return get().favoritos.find(
      f => f.artista_id === artistaId && f.fase_id === faseId
    )
  },

  /**
   * Obtener favoritos por fase (local)
   */
  getFavoritosByFase: (faseId) => {
    return get().favoritos.filter(f => f.fase_id === faseId)
  },

  /**
   * Verificar favorito desde la API
   */
  checkFavorito: async (artistaId, faseId) => {
    set({ isLoading: true, error: null })
    try {
      const response = await favoritosApi.check(artistaId, faseId)
      set({ isLoading: false })
      return response.data
    } catch (error) {
      set({
        error: error.message,
        isLoading: false
      })
      return { is_favorito: false, favorito: null }
    }
  },

  /**
   * Toggle favorito (agregar/quitar)
   */
  toggleFavorito: async (artistaId, faseId, notas = null) => {
    set({ isLoading: true, error: null })
    try {
      const response = await favoritosApi.toggle(artistaId, faseId, notas)

      if (response.data.is_favorito) {
        // Se agrego, actualizar estado local
        set(state => ({
          favoritos: [...state.favoritos, response.data.favorito],
          isLoading: false
        }))
      } else {
        // Se elimino, quitar del estado local
        set(state => ({
          favoritos: state.favoritos.filter(
            f => !(f.artista_id === artistaId && f.fase_id === faseId)
          ),
          isLoading: false
        }))
      }

      return { success: true, is_favorito: response.data.is_favorito }
    } catch (error) {
      set({
        error: error.message,
        isLoading: false
      })
      return { success: false, error: error.message }
    }
  },

  /**
   * Agregar favorito
   */
  addFavorito: async (artistaId, faseId, notas = null) => {
    set({ isLoading: true, error: null })
    try {
      const response = await favoritosApi.create({
        artista_id: artistaId,
        fase_id: faseId,
        notas
      })

      // Agregar al estado local
      set(state => ({
        favoritos: [...state.favoritos, response.data],
        isLoading: false
      }))

      return { success: true, favorito: response.data }
    } catch (error) {
      set({
        error: error.message,
        isLoading: false
      })
      return { success: false, error: error.message }
    }
  },

  /**
   * Eliminar favorito
   */
  removeFavorito: async (favoritoId) => {
    set({ isLoading: true, error: null })
    try {
      await favoritosApi.delete(favoritoId)

      // Eliminar del estado local
      set(state => ({
        favoritos: state.favoritos.filter(f => f.id !== favoritoId),
        isLoading: false
      }))

      return { success: true }
    } catch (error) {
      set({
        error: error.message,
        isLoading: false
      })
      return { success: false, error: error.message }
    }
  },

  /**
   * Actualizar notas de favorito
   */
  updateFavorito: async (favoritoId, notas) => {
    set({ isLoading: true, error: null })
    try {
      const response = await favoritosApi.update(favoritoId, notas)

      // Actualizar en el estado local
      set(state => ({
        favoritos: state.favoritos.map(f =>
          f.id === favoritoId ? { ...f, notas } : f
        ),
        isLoading: false
      }))

      return { success: true, favorito: response.data }
    } catch (error) {
      set({
        error: error.message,
        isLoading: false
      })
      return { success: false, error: error.message }
    }
  },

  /**
   * Estadisticas locales
   */
  getEstadisticas: (faseId = null) => {
    let favs = get().favoritos

    if (faseId) {
      favs = favs.filter(f => f.fase_id === faseId)
    }

    return {
      total_favoritos: favs.length,
      por_fase: faseId ? favs.length : [...new Set(favs.map(f => f.fase_id))].length
    }
  },

  /**
   * Limpiar error
   */
  clearError: () => {
    set({ error: null })
  },

  /**
   * Limpiar favoritos (logout)
   */
  clearFavoritos: () => {
    set({ favoritos: [], error: null })
  }
}))
