import { create } from 'zustand'
import { rondasApi } from '@/lib/api'

/**
 * Store de Rondas
 * Gestión de rondas de votación
 */

export const useRondasStore = create((set, get) => ({
  rondas: [],
  rondaActual: null,
  estadisticas: null,
  isLoading: false,
  error: null,

  /**
   * Obtener todas las rondas de una fase
   */
  fetchRondasPorFase: async (faseId) => {
    set({ isLoading: true, error: null })
    try {
      const response = await rondasApi.getByFase(faseId)
      set({
        rondas: response.data,
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
   * Obtener ronda específica
   */
  fetchRonda: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response = await rondasApi.getById(id)
      set({
        rondaActual: response.data,
        isLoading: false
      })
      return response.data
    } catch (error) {
      set({
        error: error.message,
        isLoading: false
      })
      return null
    }
  },

  /**
   * Obtener ronda abierta de una fase
   */
  getRondaAbierta: (faseId) => {
    const rondasFase = get().rondas.filter(r => r.fase_id === faseId)
    return rondasFase.find(r => r.estado === 'abierta') || null
  },

  /**
   * Obtener estadísticas de una ronda
   */
  fetchEstadisticas: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response = await rondasApi.getEstadisticas(id)
      set({
        estadisticas: response.data,
        isLoading: false
      })
      return response.data
    } catch (error) {
      set({
        error: error.message,
        isLoading: false
      })
      return null
    }
  },

  /**
   * Crear nueva ronda (Admin)
   */
  createRonda: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const response = await rondasApi.create(data)

      // Agregar al estado local
      set(state => ({
        rondas: [...state.rondas, response.data],
        isLoading: false
      }))

      return { success: true, ronda: response.data }
    } catch (error) {
      set({
        error: error.message,
        isLoading: false
      })
      return { success: false, error: error.message }
    }
  },

  /**
   * Abrir ronda (Admin)
   */
  abrirRonda: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response = await rondasApi.abrir(id)

      // Actualizar en el estado local
      set(state => ({
        rondas: state.rondas.map(r =>
          r.id === id ? response.data : r
        ),
        rondaActual: state.rondaActual?.id === id ? response.data : state.rondaActual,
        isLoading: false
      }))

      return { success: true, ronda: response.data }
    } catch (error) {
      set({
        error: error.message,
        isLoading: false
      })
      return { success: false, error: error.message }
    }
  },

  /**
   * Cerrar ronda y calcular resultados (Admin)
   */
  cerrarRonda: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response = await rondasApi.cerrar(id)

      // Actualizar en el estado local
      set(state => ({
        rondas: state.rondas.map(r =>
          r.id === id ? { ...r, estado: 'cerrada' } : r
        ),
        rondaActual: state.rondaActual?.id === id
          ? { ...state.rondaActual, estado: 'cerrada' }
          : state.rondaActual,
        isLoading: false
      }))

      return { success: true, message: response.message, data: response.data }
    } catch (error) {
      set({
        error: error.message,
        isLoading: false
      })
      return { success: false, error: error.message }
    }
  },

  /**
   * Eliminar ronda (Admin)
   */
  deleteRonda: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await rondasApi.delete(id)

      // Eliminar del estado local
      set(state => ({
        rondas: state.rondas.filter(r => r.id !== id),
        rondaActual: state.rondaActual?.id === id ? null : state.rondaActual,
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
   * Limpiar error
   */
  clearError: () => {
    set({ error: null })
  },

  /**
   * Limpiar datos
   */
  clear: () => {
    set({
      rondas: [],
      rondaActual: null,
      estadisticas: null,
      error: null
    })
  }
}))
