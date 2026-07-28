import { create } from 'zustand'
import { curadoresApi } from '@/lib/api'

/**
 * Store de Curadores
 *
 * Conectado al backend API
 * GET /api/curadores - Obtener todos los curadores
 * GET /api/curadores/:id - Obtener curador por ID
 * POST /api/curadores - Crear curador
 * PUT /api/curadores/:id - Actualizar curador
 * PUT /api/curadores/:id/activar - Activar curador
 * PUT /api/curadores/:id/desactivar - Desactivar curador
 * DELETE /api/curadores/:id - Eliminar curador
 * GET /api/curadores/:id/votaciones - Obtener votaciones del curador
 *
 * DB: usuarios table (role='curador') + curadores table
 */

export const useCuradoresStore = create((set, get) => ({
  curadores: [],
  isLoading: false,
  error: null,

  /**
   * Obtener todos los curadores
   */
  fetchCuradores: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await curadoresApi.getAll()
      set({
        curadores: response.data,
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
   * Obtener curador por ID del estado local
   */
  getCuradorById: (id) => {
    return get().curadores.find(c => c.id === id)
  },

  /**
   * Fetch curador por ID desde la API
   */
  fetchCuradorById: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response = await curadoresApi.getById(id)

      // Actualizar en el estado local si existe
      set(state => ({
        curadores: state.curadores.map(c =>
          c.id === id ? response.data : c
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
   * Crear curador (admin only)
   */
  createCurador: async (curadorData) => {
    set({ isLoading: true, error: null })
    try {
      const response = await curadoresApi.create(curadorData)

      // Agregar al estado local
      set(state => ({
        curadores: [...state.curadores, response.data.curador],
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
   * Actualizar curador (admin only)
   */
  updateCurador: async (id, updates) => {
    set({ isLoading: true, error: null })
    try {
      const response = await curadoresApi.update(id, updates)

      // Actualizar en el estado local
      set(state => ({
        curadores: state.curadores.map(c =>
          c.id === id ? response.data : c
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
   * Activar curador (admin only)
   */
  activarCurador: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response = await curadoresApi.activar(id)

      // Actualizar en el estado local
      set(state => ({
        curadores: state.curadores.map(c =>
          c.id === id ? response.data : c
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
   * Desactivar curador (admin only)
   */
  desactivarCurador: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response = await curadoresApi.desactivar(id)

      // Actualizar en el estado local
      set(state => ({
        curadores: state.curadores.map(c =>
          c.id === id ? response.data : c
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
   * Eliminar curador (admin only)
   */
  deleteCurador: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await curadoresApi.delete(id)

      // Eliminar del estado local
      set(state => ({
        curadores: state.curadores.filter(c => c.id !== id),
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
   * Obtener votaciones de un curador
   */
  getVotacionesCurador: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response = await curadoresApi.getVotaciones(id)
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
   * Obtener solo curadores activos (filtro local)
   */
  getCuradoresActivos: () => {
    return get().curadores.filter(c => c.activo)
  },

  /**
   * Estadísticas locales
   */
  getEstadisticas: () => {
    const curadores = get().curadores
    return {
      total: curadores.length,
      activos: curadores.filter(c => c.activo).length,
      inactivos: curadores.filter(c => !c.activo).length
    }
  },

  /**
   * Limpiar error
   */
  clearError: () => {
    set({ error: null })
  }
}))
