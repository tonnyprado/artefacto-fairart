import { create } from 'zustand'
import { votacionesApi } from '@/lib/api'

/**
 * Store de Votaciones - Sistema de Rondas
 *
 * Conectado al backend API
 * POST /api/votaciones - Crear/actualizar votación en una ronda
 * GET /api/votaciones/mis-votaciones - Obtener votaciones del curador (con filtros)
 * GET /api/votaciones/progreso/:ronda_id - Obtener progreso en ronda
 * GET /api/votaciones/resultados/:ronda_id - Obtener resultados de ronda (admin o cerrada)
 * GET /api/votaciones/estadisticas - Obtener estadísticas del curador
 * DELETE /api/votaciones/:id - Eliminar votación
 *
 * DB: votaciones, postulaciones, rondas tables
 */

export const useVotacionesStore = create((set, get) => ({
  votaciones: [],
  isLoading: false,
  error: null,

  /**
   * Obtener todas las votaciones del curador actual
   * @param {number} faseId - Filtrar por fase (opcional)
   * @param {number} rondaId - Filtrar por ronda (opcional)
   */
  getMisVotaciones: async (faseId = null, rondaId = null) => {
    set({ isLoading: true, error: null })
    try {
      const response = await votacionesApi.getMisVotaciones(faseId, rondaId)
      set({
        votaciones: response.data,
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
   * Crear o actualizar votación
   * Si ya existe una votación para esta postulación en esta ronda, se actualiza
   * @param {object} data - { postulacion_id, ronda_id, valor, comentario, conoce_artista }
   */
  createVotacion: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const response = await votacionesApi.create(data)

      if (response.success) {
        // Actualizar estado local
        set(state => {
          const existingIndex = state.votaciones.findIndex(
            v => v.postulacion_id === data.postulacion_id && v.ronda_id === data.ronda_id
          )

          if (existingIndex >= 0) {
            // Actualizar existente
            const updatedVotaciones = [...state.votaciones]
            updatedVotaciones[existingIndex] = response.data
            return { votaciones: updatedVotaciones, isLoading: false }
          } else {
            // Agregar nueva
            return {
              votaciones: [...state.votaciones, response.data],
              isLoading: false
            }
          }
        })

        return { success: true, votacion: response.data }
      } else {
        set({ isLoading: false, error: response.error })
        return { success: false, error: response.error }
      }
    } catch (error) {
      set({
        error: error.message,
        isLoading: false
      })
      return { success: false, error: error.message }
    }
  },

  /**
   * Eliminar votación
   */
  deleteVotacion: async (votacionId) => {
    set({ isLoading: true, error: null })
    try {
      const response = await votacionesApi.delete(votacionId)

      if (response.success) {
        set(state => ({
          votaciones: state.votaciones.filter(v => v.id !== votacionId),
          isLoading: false
        }))
        return { success: true }
      } else {
        set({ isLoading: false, error: response.error })
        return { success: false, error: response.error }
      }
    } catch (error) {
      set({
        error: error.message,
        isLoading: false
      })
      return { success: false, error: error.message }
    }
  },

  /**
   * Obtener progreso del curador en una ronda
   * Incluye: total_postulaciones, votadas, votos_restantes_r2, etc.
   */
  getProgreso: async (rondaId) => {
    try {
      const response = await votacionesApi.getProgreso(rondaId)

      if (response.success) {
        return { success: true, data: response.data }
      } else {
        return { success: false, error: response.error }
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  /**
   * Obtener resultados de una ronda
   * Solo disponible para admin o cuando la ronda está cerrada (voto ciego)
   */
  getResultadosRonda: async (rondaId) => {
    try {
      const response = await votacionesApi.getResultadosRonda(rondaId)

      if (response.success) {
        return { success: true, data: response.data }
      } else {
        return { success: false, error: response.error }
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  /**
   * Obtener estadísticas generales del curador
   */
  getEstadisticasCurador: async (faseId = null) => {
    try {
      const response = await votacionesApi.getEstadisticas(faseId)

      if (response.success) {
        return response.data
      } else {
        return {
          total_votos: 0,
          votos_favor: 0,
          votos_contra: 0,
          porcentaje_favor: 0
        }
      }
    } catch (error) {
      return {
        total_votos: 0,
        votos_favor: 0,
        votos_contra: 0,
        porcentaje_favor: 0
      }
    }
  },

  /**
   * Verificar si ya votó por una postulación en una ronda (local)
   */
  hasVotado: (postulacionId, rondaId) => {
    return get().votaciones.some(
      v => v.postulacion_id === postulacionId && v.ronda_id === rondaId
    )
  },

  /**
   * Obtener votación específica (local)
   */
  getVotacion: (postulacionId, rondaId) => {
    return get().votaciones.find(
      v => v.postulacion_id === postulacionId && v.ronda_id === rondaId
    )
  },

  /**
   * Estadísticas locales por ronda (desde el estado)
   */
  getEstadisticasRonda: (rondaId) => {
    const votacionesRonda = get().votaciones.filter(v => v.ronda_id === rondaId)
    const totalVotos = votacionesRonda.length

    // Contar valores según tipo de ronda
    const distribucion = votacionesRonda.reduce((acc, v) => {
      acc[v.valor] = (acc[v.valor] || 0) + 1
      return acc
    }, {})

    return {
      total_votos: totalVotos,
      distribucion,
      votaciones: votacionesRonda
    }
  },

  /**
   * Limpiar error
   */
  clearError: () => {
    set({ error: null })
  },

  /**
   * Limpiar todas las votaciones del estado
   */
  clearVotaciones: () => {
    set({ votaciones: [] })
  }
}))
