import { create } from 'zustand'
import { edicionesApi } from '@/lib/api'

/**
 * Store de Ediciones
 *
 * Conectado al backend API
 * GET /api/ediciones - Obtener todas las ediciones
 * GET /api/ediciones/:id - Obtener edición por ID
 * GET /api/ediciones/activa - Obtener edición activa
 * GET /api/ediciones/:id/fases - Obtener fases de una edición
 * POST /api/ediciones - Crear edición
 * PUT /api/ediciones/:id - Actualizar edición
 * DELETE /api/ediciones/:id - Eliminar edición
 *
 * DB: ediciones table
 */

export const useEdicionesStore = create((set, get) => ({
  ediciones: [],
  edicionActiva: null,
  isLoading: false,
  error: null,

  /**
   * Obtener todas las ediciones
   */
  fetchEdiciones: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await edicionesApi.getAll()
      set({
        ediciones: response.data,
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
   * Obtener edición por ID del estado local
   */
  getEdicionById: (id) => {
    return get().ediciones.find(e => e.id === id)
  },

  /**
   * Fetch edición por ID desde la API
   */
  fetchEdicionById: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response = await edicionesApi.getById(id)

      // Actualizar en el estado local si existe
      set(state => ({
        ediciones: state.ediciones.map(e =>
          e.id === id ? response.data : e
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
   * Obtener edición activa
   */
  fetchEdicionActiva: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await edicionesApi.getActiva()
      set({
        edicionActiva: response.data,
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
   * Obtener edición activa del estado local
   */
  getEdicionActiva: () => {
    return get().ediciones.find(e => e.activa)
  },

  /**
   * Obtener fases de una edición
   */
  getFasesEdicion: async (edicionId) => {
    set({ isLoading: true, error: null })
    try {
      const response = await edicionesApi.getFases(edicionId)
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
   * Crear nueva edición (admin only)
   */
  createEdicion: async (edicionData) => {
    set({ isLoading: true, error: null })
    try {
      const response = await edicionesApi.create(edicionData)

      // Agregar al estado local
      set(state => ({
        ediciones: [...state.ediciones, response.data],
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
   * Actualizar edición (admin only)
   */
  updateEdicion: async (id, updates) => {
    set({ isLoading: true, error: null })
    try {
      const response = await edicionesApi.update(id, updates)

      // Actualizar en el estado local
      set(state => ({
        ediciones: state.ediciones.map(e =>
          e.id === id ? response.data : e
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
   * Eliminar edición (admin only)
   */
  deleteEdicion: async (id, force = false) => {
    set({ isLoading: true, error: null })
    try {
      await edicionesApi.delete(id, force)

      // Eliminar del estado local
      set(state => ({
        ediciones: state.ediciones.filter(e => e.id !== id),
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
    const ediciones = get().ediciones
    return {
      total: ediciones.length,
      activas: ediciones.filter(e => e.activa).length,
      total_fases: ediciones.reduce((sum, e) => sum + (e.total_fases || 0), 0)
    }
  },

  /**
   * Limpiar error
   */
  clearError: () => {
    set({ error: null })
  }
}))
