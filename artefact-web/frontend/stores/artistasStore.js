import { create } from 'zustand'
import { artistasApi } from '@/lib/api'

/**
 * Store de Artistas
 *
 * Conectado al backend API
 * GET /api/artistas - Obtener todos los artistas
 * GET /api/artistas/:id - Obtener artista por ID
 * GET /api/artistas/fase/:fase_id - Obtener artistas por fase
 * POST /api/artistas - Crear artista
 * PUT /api/artistas/:id - Actualizar artista
 * PUT /api/artistas/:id/aprobar - Aprobar artista
 * PUT /api/artistas/:id/rechazar - Rechazar artista
 * DELETE /api/artistas/:id - Eliminar artista
 *
 * DB: artistas table
 */

export const useArtistasStore = create((set, get) => ({
  artistas: [],
  isLoading: false,
  error: null,

  /**
   * Obtener todos los artistas con filtros opcionales
   */
  fetchArtistas: async (params = {}) => {
    set({ isLoading: true, error: null })
    try {
      const response = await artistasApi.getAll(params)
      set({
        artistas: response.data,
        isLoading: false
      })
      return { success: true, data: response.data }
    } catch (error) {
      set({
        error: error.message,
        isLoading: false
      })
      return { success: false, error: error.message }
    }
  },

  /**
   * Obtener artistas por fase
   */
  fetchArtistasByFase: async (faseId) => {
    set({ isLoading: true, error: null })
    try {
      const response = await artistasApi.getByFase(faseId)
      set({
        artistas: response.data,
        isLoading: false
      })
      return { success: true, data: response.data }
    } catch (error) {
      set({
        error: error.message,
        isLoading: false
      })
      return { success: false, error: error.message }
    }
  },

  /**
   * Obtener artista por ID del estado local
   */
  getArtistaById: (id) => {
    return get().artistas.find(a => a.id === id)
  },

  /**
   * Fetch artista por ID desde la API
   */
  fetchArtistaById: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response = await artistasApi.getById(id)

      // Actualizar en el estado local si existe
      set(state => ({
        artistas: state.artistas.map(a =>
          a.id === id ? response.data : a
        ),
        isLoading: false
      }))

      return { success: true, data: response.data }
    } catch (error) {
      set({
        error: error.message,
        isLoading: false
      })
      return { success: false, error: error.message }
    }
  },

  /**
   * Crear artista (registro público)
   */
  createArtista: async (artistaData) => {
    set({ isLoading: true, error: null })
    try {
      const response = await artistasApi.create(artistaData)

      // Agregar al estado local
      set(state => ({
        artistas: [...state.artistas, response.data],
        isLoading: false
      }))

      return { success: true, data: response.data }
    } catch (error) {
      set({
        error: error.message,
        isLoading: false
      })
      return { success: false, error: error.message }
    }
  },

  /**
   * Actualizar artista (admin only)
   */
  updateArtista: async (id, updates) => {
    set({ isLoading: true, error: null })
    try {
      const response = await artistasApi.update(id, updates)

      // Actualizar en el estado local
      set(state => ({
        artistas: state.artistas.map(a =>
          a.id === id ? response.data : a
        ),
        isLoading: false
      }))

      return { success: true, data: response.data }
    } catch (error) {
      set({
        error: error.message,
        isLoading: false
      })
      return { success: false, error: error.message }
    }
  },

  /**
   * Aprobar artista (admin only)
   */
  aprobarArtista: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response = await artistasApi.aprobar(id)

      // Actualizar en el estado local
      set(state => ({
        artistas: state.artistas.map(a =>
          a.id === id ? response.data : a
        ),
        isLoading: false
      }))

      return { success: true, data: response.data }
    } catch (error) {
      set({
        error: error.message,
        isLoading: false
      })
      return { success: false, error: error.message }
    }
  },

  /**
   * Rechazar artista (admin only)
   */
  rechazarArtista: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response = await artistasApi.rechazar(id)

      // Actualizar en el estado local
      set(state => ({
        artistas: state.artistas.map(a =>
          a.id === id ? response.data : a
        ),
        isLoading: false
      }))

      return { success: true, data: response.data }
    } catch (error) {
      set({
        error: error.message,
        isLoading: false
      })
      return { success: false, error: error.message }
    }
  },

  /**
   * Eliminar artista (admin only)
   */
  deleteArtista: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await artistasApi.delete(id)

      // Eliminar del estado local
      set(state => ({
        artistas: state.artistas.filter(a => a.id !== id),
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
   * Filtrar artistas localmente
   */
  getArtistasByEstado: (estado) => {
    return get().artistas.filter(a => a.estado_registro === estado)
  },

  getArtistasByCategoria: (categoria) => {
    return get().artistas.filter(a => a.categoria === categoria)
  },

  getArtistasAprobados: () => {
    return get().artistas.filter(a => a.aprobado === true)
  },

  /**
   * Estadísticas locales
   */
  getEstadisticas: () => {
    const artistas = get().artistas
    return {
      total: artistas.length,
      aprobados: artistas.filter(a => a.aprobado === true).length,
      pendientes: artistas.filter(a => a.estado_registro === 'pendiente').length,
      rechazados: artistas.filter(a => a.estado_registro === 'rechazado').length
    }
  },

  /**
   * Limpiar error
   */
  clearError: () => {
    set({ error: null })
  }
}))
