import { create } from 'zustand'

/**
 * Store de Paquetes
 *
 * Conectado al backend API
 * GET /api/paquetes - Obtener todos los paquetes
 * GET /api/paquetes?activo=true - Obtener solo paquetes activos
 * GET /api/paquetes/:id - Obtener paquete por ID
 *
 * DB: paquetes table
 */

export const usePaquetesStore = create((set, get) => ({
  paquetes: [],
  isLoading: false,
  error: null,

  /**
   * Obtener todos los paquetes activos
   */
  fetchPaquetes: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch('http://localhost:4000/api/paquetes?activo=true')
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Error al obtener paquetes')
      }

      set({
        paquetes: data.data || [],
        isLoading: false
      })
      return { success: true, data: data.data }
    } catch (error) {
      set({
        error: error.message,
        isLoading: false
      })
      return { success: false, error: error.message }
    }
  },

  /**
   * Obtener paquete por ID
   */
  getPaqueteById: (id) => {
    return get().paquetes.find(p => p.id === id)
  },

  /**
   * Limpiar error
   */
  clearError: () => {
    set({ error: null })
  }
}))
