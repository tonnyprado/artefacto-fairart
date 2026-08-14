import { create } from 'zustand';
import { opinionesApi } from '@/lib/api';

/**
 * Store de Zustand para el sistema de opiniones
 * Maneja el estado de opiniones públicas "¿Qué es arte para ti?"
 */
export const useOpinionesStore = create((set, get) => ({
  // Estado
  opinion: null,           // Opinión actual mostrada
  isLoading: false,
  error: null,
  successMessage: null,

  // Obtener una opinión aleatoria
  fetchRandomOpinion: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await opinionesApi.getRandom();
      set({
        opinion: response.data,
        isLoading: false
      });
      return { success: true, data: response.data };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  // Enviar una nueva opinión
  submitOpinion: async (data) => {
    set({ isLoading: true, error: null, successMessage: null });
    try {
      const response = await opinionesApi.create(data);
      set({
        isLoading: false,
        successMessage: '¡Gracias! Tu opinión ha sido guardada.'
      });
      return { success: true, data: response.data };
    } catch (error) {
      set({
        error: error.message,
        isLoading: false
      });
      return { success: false, error: error.message };
    }
  },

  // Limpiar mensajes
  clearMessages: () => set({ error: null, successMessage: null }),

  // Limpiar error
  clearError: () => set({ error: null }),

  // Limpiar mensaje de éxito
  clearSuccess: () => set({ successMessage: null })
}));

export default useOpinionesStore;
