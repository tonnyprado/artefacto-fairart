import { create } from 'zustand'
import { votacionesApi } from '@/lib/api'

/**
 * Store de Votaciones
 *
 * Conectado al backend API
 * POST /api/votaciones - Crear nueva votación
 * PUT /api/votaciones/:id - Actualizar votación
 * GET /api/votaciones/mis-votos - Obtener votaciones del curador actual
 * GET /api/votaciones/estadisticas - Obtener estadísticas del curador
 * GET /api/votaciones/resultados/:fase_id - Obtener resultados de una fase
 * GET /api/votaciones/fase/:fase_id/artista/:artista_id - Verificar voto
 * DELETE /api/votaciones/:id - Eliminar votación
 *
 * DB: votaciones table
 */

export const useVotacionesStore = create((set, get) => ({
  votaciones: [],
  isLoading: false,
  error: null,

  /**
   * Obtener todas las votaciones del curador actual
   */
  fetchMisVotaciones: async (faseId = null) => {
    set({ isLoading: true, error: null })
    try {
      const response = await votacionesApi.getMisVotos(faseId)
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
   * Verificar si el curador ya votó por un artista en una fase (local)
   */
  hasVotado: (curadorId, artistaId, faseId) => {
    return get().votaciones.some(
      v => v.curador_id === curadorId &&
           v.artista_id === artistaId &&
           v.fase_id === faseId
    )
  },

  /**
   * Verificar voto desde la API
   */
  verificarVoto: async (faseId, artistaId) => {
    set({ isLoading: true, error: null })
    try {
      const response = await votacionesApi.verificarVoto(faseId, artistaId)
      set({ isLoading: false })
      return response.data
    } catch (error) {
      set({
        error: error.message,
        isLoading: false
      })
      return { has_votado: false, votacion: null }
    }
  },

  /**
   * Obtener votación específica del estado local
   */
  getVotacion: (curadorId, artistaId, faseId) => {
    return get().votaciones.find(
      v => v.curador_id === curadorId &&
           v.artista_id === artistaId &&
           v.fase_id === faseId
    )
  },

  /**
   * Crear nueva votación
   */
  createVotacion: async (curadorId, artistaId, faseId, voto, comentario = '') => {
    set({ isLoading: true, error: null })
    try {
      const response = await votacionesApi.create({
        artista_id: artistaId,
        fase_id: faseId,
        voto,
        comentario
      })

      // Agregar al estado local
      set(state => ({
        votaciones: [...state.votaciones, response.data],
        isLoading: false
      }))

      return { success: true, votacion: response.data }
    } catch (error) {
      set({
        error: error.message,
        isLoading: false
      })
      return { success: false, error: error.message }
    }
  },

  /**
   * Actualizar votación existente
   */
  updateVotacion: async (votacionId, voto, comentario) => {
    set({ isLoading: true, error: null })
    try {
      const response = await votacionesApi.update(votacionId, { voto, comentario })

      // Actualizar en el estado local
      set(state => ({
        votaciones: state.votaciones.map(v =>
          v.id === votacionId ? response.data : v
        ),
        isLoading: false
      }))

      return { success: true, votacion: response.data }
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
      await votacionesApi.delete(votacionId)

      // Eliminar del estado local
      set(state => ({
        votaciones: state.votaciones.filter(v => v.id !== votacionId),
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
   * Obtener resultados de una fase
   */
  getResultadosFase: async (faseId) => {
    set({ isLoading: true, error: null })
    try {
      const response = await votacionesApi.getResultados(faseId)
      set({ isLoading: false })
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
   * Obtener estadísticas del curador
   */
  getEstadisticasCurador: async (faseId = null) => {
    set({ isLoading: true, error: null })
    try {
      const response = await votacionesApi.getEstadisticas(faseId)
      set({ isLoading: false })
      return response.data
    } catch (error) {
      set({
        error: error.message,
        isLoading: false
      })
      return {
        total_votos: 0,
        votos_favor: 0,
        votos_contra: 0,
        porcentaje_favor: 0
      }
    }
  },

  /**
   * Estadísticas locales (desde el estado)
   */
  getEstadisticasLocal: (curadorId, faseId = null) => {
    let votaciones = get().votaciones.filter(v => v.curador_id === curadorId)

    if (faseId) {
      votaciones = votaciones.filter(v => v.fase_id === faseId)
    }

    const totalVotos = votaciones.length
    const votosFavor = votaciones.filter(v => v.voto === true).length
    const votosContra = votaciones.filter(v => v.voto === false).length

    return {
      total_votos: totalVotos,
      votos_favor: votosFavor,
      votos_contra: votosContra,
      porcentaje_favor: totalVotos > 0 ? parseFloat(((votosFavor / totalVotos) * 100).toFixed(1)) : 0
    }
  },

  /**
   * Limpiar error
   */
  clearError: () => {
    set({ error: null })
  }
}))
