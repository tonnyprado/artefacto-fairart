import { create } from 'zustand'
import { postulacionesApi } from '@/lib/api'

/**
 * Store de Postulaciones
 * Gestión de postulaciones de artistas
 */

export const usePostulacionesStore = create((set, get) => ({
  postulaciones: [],
  postulacionActual: null,
  postulacionesParaVotar: [],
  isLoading: false,
  error: null,

  /**
   * Obtener todas las postulaciones con filtros
   */
  fetchPostulaciones: async (params = {}) => {
    set({ isLoading: true, error: null })
    try {
      const response = await postulacionesApi.getAll(params)
      set({
        postulaciones: response.data,
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
   * Obtener postulación específica
   */
  fetchPostulacion: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response = await postulacionesApi.getById(id)
      set({
        postulacionActual: response.data,
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
   * Obtener postulaciones para votación (orden aleatorio por curador)
   */
  fetchPostulacionesParaVotar: async (faseId, rondaId) => {
    set({ isLoading: true, error: null })
    try {
      const response = await postulacionesApi.getParaVotacion(faseId, rondaId)
      set({
        postulacionesParaVotar: response.data,
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
   * Crear nueva postulación (Admin)
   */
  createPostulacion: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const response = await postulacionesApi.create(data)

      // Agregar al estado local
      set(state => ({
        postulaciones: [...state.postulaciones, response.data],
        isLoading: false
      }))

      return { success: true, postulacion: response.data }
    } catch (error) {
      set({
        error: error.message,
        isLoading: false
      })
      return { success: false, error: error.message }
    }
  },

  /**
   * Actualizar postulación (Admin)
   */
  updatePostulacion: async (id, data) => {
    set({ isLoading: true, error: null })
    try {
      const response = await postulacionesApi.update(id, data)

      // Actualizar en el estado local
      set(state => ({
        postulaciones: state.postulaciones.map(p =>
          p.id === id ? response.data : p
        ),
        postulacionActual: state.postulacionActual?.id === id
          ? response.data
          : state.postulacionActual,
        isLoading: false
      }))

      return { success: true, postulacion: response.data }
    } catch (error) {
      set({
        error: error.message,
        isLoading: false
      })
      return { success: false, error: error.message }
    }
  },

  /**
   * Mover postulación de reserva a shortlist (Admin)
   */
  moverAShortlist: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response = await postulacionesApi.moverAShortlist(id)

      // Actualizar en el estado local
      set(state => ({
        postulaciones: state.postulaciones.map(p =>
          p.id === id ? response.data : p
        ),
        postulacionActual: state.postulacionActual?.id === id
          ? response.data
          : state.postulacionActual,
        isLoading: false
      }))

      return { success: true, postulacion: response.data }
    } catch (error) {
      set({
        error: error.message,
        isLoading: false
      })
      return { success: false, error: error.message }
    }
  },

  /**
   * Eliminar postulación (Admin)
   */
  deletePostulacion: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await postulacionesApi.delete(id)

      // Eliminar del estado local
      set(state => ({
        postulaciones: state.postulaciones.filter(p => p.id !== id),
        postulacionActual: state.postulacionActual?.id === id
          ? null
          : state.postulacionActual,
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
   * Obtener estadísticas locales por estado
   */
  getEstadisticasLocales: () => {
    const postulaciones = get().postulaciones

    const stats = {
      total: postulaciones.length,
      admitida: postulaciones.filter(p => p.estado === 'admitida').length,
      shortlist: postulaciones.filter(p => p.estado === 'shortlist').length,
      reserva: postulaciones.filter(p => p.estado === 'reserva').length,
      deliberacion: postulaciones.filter(p => p.estado === 'deliberacion').length,
      seleccionada: postulaciones.filter(p => p.estado === 'seleccionada').length,
      cortesia: postulaciones.filter(p => p.estado === 'cortesia').length,
      no_continua: postulaciones.filter(p => p.estado === 'no_continua').length,
      tipo_2d: postulaciones.filter(p => p.tipo === '2d').length,
      tipo_3d: postulaciones.filter(p => p.tipo === '3d').length
    }

    return stats
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
      postulaciones: [],
      postulacionActual: null,
      postulacionesParaVotar: [],
      error: null
    })
  }
}))
