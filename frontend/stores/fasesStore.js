import { create } from 'zustand'
import { fasesApi } from '@/lib/api'

/**
 * Store de Fases
 *
 * Conectado al backend API
 * GET /api/fases - Obtener todas las fases
 * GET /api/fases/:id - Obtener fase por ID
 * POST /api/fases - Crear fase
 * PUT /api/fases/:id - Actualizar fase
 * PUT /api/fases/:id/abrir-votaciones - Abrir votaciones
 * PUT /api/fases/:id/cerrar-votaciones - Cerrar votaciones
 * PUT /api/fases/:id/finalizar - Finalizar fase
 * POST /api/fases/:id/artistas - Inscribir artistas
 * DELETE /api/fases/:id - Eliminar fase
 *
 * DB: fases table
 */

export const useFasesStore = create((set, get) => ({
  fases: [],
  isLoading: false,
  error: null,

  /**
   * Obtener todas las fases
   */
  fetchFases: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await fasesApi.getAll()
      set({
        fases: response.data,
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
   * Obtener fase por ID del estado local
   */
  getFaseById: (id) => {
    return get().fases.find(f => f.id === id)
  },

  /**
   * Fetch fase por ID desde la API
   */
  fetchFaseById: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fasesApi.getById(id)

      // Actualizar en el estado local si existe
      set(state => ({
        fases: state.fases.map(f =>
          f.id === id ? response.data : f
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
   * Obtener fase activa (votaciones abiertas)
   */
  getFaseActiva: () => {
    return get().fases.find(f => f.votaciones_abiertas && !f.finalizada)
  },

  /**
   * Obtener fases finalizadas
   */
  getFasesFinalizadas: () => {
    return get().fases.filter(f => f.finalizada)
  },

  /**
   * Crear nueva fase (admin only)
   */
  createFase: async (faseData) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fasesApi.create(faseData)

      // Agregar al estado local
      set(state => ({
        fases: [...state.fases, response.data],
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
   * Actualizar fase (admin only)
   */
  updateFase: async (id, updates) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fasesApi.update(id, updates)

      // Actualizar en el estado local
      set(state => ({
        fases: state.fases.map(f =>
          f.id === id ? response.data : f
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
   * Abrir votaciones (admin only)
   */
  abrirVotaciones: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fasesApi.abrirVotaciones(id)

      // Actualizar en el estado local
      set(state => ({
        fases: state.fases.map(f =>
          f.id === id ? response.data : f
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
   * Cerrar votaciones (admin only)
   */
  cerrarVotaciones: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fasesApi.cerrarVotaciones(id)

      // Actualizar en el estado local
      set(state => ({
        fases: state.fases.map(f =>
          f.id === id ? response.data : f
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
   * Finalizar fase (admin only)
   */
  finalizarFase: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fasesApi.finalizar(id)

      // Actualizar en el estado local
      set(state => ({
        fases: state.fases.map(f =>
          f.id === id ? response.data : f
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
   * Inscribir artistas en fase (admin only)
   */
  inscribirArtistas: async (faseId, artistaIds) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fasesApi.inscribirArtistas(faseId, artistaIds)

      // Refetch la fase para obtener datos actualizados
      await get().fetchFaseById(faseId)

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
   * Obtener artistas de una fase
   */
  getArtistasFase: async (faseId) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fasesApi.getArtistas(faseId)
      set({ isLoading: false })
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
   * Eliminar fase (admin only)
   */
  deleteFase: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await fasesApi.delete(id)

      // Eliminar del estado local
      set(state => ({
        fases: state.fases.filter(f => f.id !== id),
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
   * Obtener estadísticas locales
   */
  getEstadisticas: () => {
    const fases = get().fases
    return {
      total: fases.length,
      activas: fases.filter(f => f.votaciones_abiertas && !f.finalizada).length,
      finalizadas: fases.filter(f => f.finalizada).length
    }
  },

  /**
   * Limpiar error
   */
  clearError: () => {
    set({ error: null })
  }
}))
