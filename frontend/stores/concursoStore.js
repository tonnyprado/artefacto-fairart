import { create } from 'zustand'

/**
 * Store de Concurso
 *
 * Gestiona el estado de concursos, artistas elegibles y obras seleccionadas
 *
 * Conectado al backend API:
 * GET /api/concurso/artistas-elegibles - Obtener artistas elegibles
 * GET /api/concurso/artistas/:id/obras - Obtener obras de un artista
 * POST /api/concurso/:fase_id/seleccionar-obra - Seleccionar obra
 * DELETE /api/concurso/:fase_id/deseleccionar-obra/:obra_id - Deseleccionar obra
 * GET /api/concurso/:fase_id/obras-seleccionadas - Obtener obras seleccionadas
 * GET /api/concurso/:fase_id/estadisticas - Obtener estadísticas
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

export const useConcursoStore = create((set, get) => ({
  // Estado
  artistasElegibles: [],
  obrasArtista: {}, // { [artistaId]: [obras] }
  obrasSeleccionadas: {}, // { [faseId]: [obras] }
  estadisticas: {}, // { [faseId]: stats }
  isLoading: false,
  error: null,

  /**
   * Obtener artistas elegibles para concurso
   */
  fetchArtistasElegibles: async (filtros = {}) => {
    set({ isLoading: true, error: null })
    try {
      const params = new URLSearchParams(filtros)
      const token = localStorage.getItem('token')

      const response = await fetch(
        `${API_URL}/concurso/artistas-elegibles?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al obtener artistas')
      }

      const data = await response.json()
      set({ artistasElegibles: data.data, isLoading: false })
      return { success: true, data: data.data }
    } catch (error) {
      set({ error: error.message, isLoading: false })
      return { success: false, error: error.message }
    }
  },

  /**
   * Obtener obras de un artista
   */
  fetchObrasArtista: async (artistaId) => {
    set({ isLoading: true, error: null })
    try {
      const token = localStorage.getItem('token')

      const response = await fetch(
        `${API_URL}/concurso/artistas/${artistaId}/obras`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al obtener obras')
      }

      const data = await response.json()
      set(state => ({
        obrasArtista: { ...state.obrasArtista, [artistaId]: data.data },
        isLoading: false
      }))
      return { success: true, data: data.data }
    } catch (error) {
      set({ error: error.message, isLoading: false })
      return { success: false, error: error.message }
    }
  },

  /**
   * Seleccionar obra para concurso
   */
  seleccionarObra: async (faseId, obraId, notas = null) => {
    set({ isLoading: true, error: null })
    try {
      const token = localStorage.getItem('token')

      const response = await fetch(
        `${API_URL}/concurso/${faseId}/seleccionar-obra`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ obra_id: obraId, notas })
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al seleccionar obra')
      }

      const data = await response.json()

      // Refresh obras seleccionadas y obras del artista
      await get().fetchObrasSeleccionadas(faseId)

      set({ isLoading: false })
      return { success: true, data: data.data }
    } catch (error) {
      set({ error: error.message, isLoading: false })
      return { success: false, error: error.message }
    }
  },

  /**
   * Deseleccionar obra de concurso
   */
  deseleccionarObra: async (faseId, obraId) => {
    set({ isLoading: true, error: null })
    try {
      const token = localStorage.getItem('token')

      const response = await fetch(
        `${API_URL}/concurso/${faseId}/deseleccionar-obra/${obraId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al deseleccionar obra')
      }

      // Refresh obras seleccionadas
      await get().fetchObrasSeleccionadas(faseId)

      set({ isLoading: false })
      return { success: true }
    } catch (error) {
      set({ error: error.message, isLoading: false })
      return { success: false, error: error.message }
    }
  },

  /**
   * Obtener obras seleccionadas de un concurso
   */
  fetchObrasSeleccionadas: async (faseId, filtros = {}) => {
    set({ isLoading: true, error: null })
    try {
      const params = new URLSearchParams(filtros)
      const token = localStorage.getItem('token')

      const response = await fetch(
        `${API_URL}/concurso/${faseId}/obras-seleccionadas?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al obtener obras seleccionadas')
      }

      const data = await response.json()
      set(state => ({
        obrasSeleccionadas: { ...state.obrasSeleccionadas, [faseId]: data.data },
        isLoading: false
      }))
      return { success: true, data: data.data }
    } catch (error) {
      set({ error: error.message, isLoading: false })
      return { success: false, error: error.message }
    }
  },

  /**
   * Obtener estadísticas de un concurso
   */
  fetchEstadisticas: async (faseId) => {
    set({ isLoading: true, error: null })
    try {
      const token = localStorage.getItem('token')

      const response = await fetch(
        `${API_URL}/concurso/${faseId}/estadisticas`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al obtener estadísticas')
      }

      const data = await response.json()
      set(state => ({
        estadisticas: { ...state.estadisticas, [faseId]: data.data },
        isLoading: false
      }))
      return { success: true, data: data.data }
    } catch (error) {
      set({ error: error.message, isLoading: false })
      return { success: false, error: error.message }
    }
  },

  /**
   * Limpiar error
   */
  clearError: () => set({ error: null })
}))
