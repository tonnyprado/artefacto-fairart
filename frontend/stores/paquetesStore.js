import { create } from 'zustand'

/**
 * Store de Paquetes
 *
 * MOCK DATA para demostración
 * TODO: Conectar con backend cuando esté disponible
 */

// Datos mock de paquetes para demostración
const MOCK_PAQUETES = [
  {
    id: 1,
    nombre: 'Paquete Básico',
    descripcion: 'Ideal para artistas emergentes con pocas piezas',
    precio: 8500,
    metros_lineales: 2.5,
    altura_pared: 2.4,
    obras_maximas: 5,
    beneficios: [
      '2.5 metros lineales de pared',
      'Iluminación LED profesional',
      'Cédula informativa',
      'Mención en catálogo digital',
      'Kit de bienvenida'
    ],
    activo: true,
    created_at: '2025-01-10T10:00:00Z',
    updated_at: '2025-01-10T10:00:00Z'
  },
  {
    id: 2,
    nombre: 'Paquete Profesional',
    descripcion: 'Para artistas establecidos con colección mediana',
    precio: 15000,
    metros_lineales: 4.5,
    altura_pared: 2.8,
    obras_maximas: 12,
    beneficios: [
      '4.5 metros lineales de pared',
      'Iluminación LED profesional ajustable',
      'Cédula informativa premium',
      'Página destacada en catálogo',
      'Video promocional 30 segundos',
      'Espacio para tarjetas de presentación',
      'Invitaciones VIP (10 pases)'
    ],
    activo: true,
    created_at: '2025-01-10T10:00:00Z',
    updated_at: '2025-01-10T10:00:00Z'
  },
  {
    id: 3,
    nombre: 'Paquete Premium',
    descripcion: 'Exhibición de alto impacto para colecciones extensas',
    precio: 25000,
    metros_lineales: 7.0,
    altura_pared: 3.0,
    obras_maximas: 20,
    beneficios: [
      '7 metros lineales de pared',
      'Sistema de iluminación personalizado',
      'Cédula informativa de lujo',
      'Portada del catálogo digital',
      'Video promocional 1 minuto',
      'Entrevista en redes sociales',
      'Stand personalizado con branding',
      'Invitaciones VIP (25 pases)',
      'Asistencia de curador durante montaje',
      'Prioridad en ubicación del espacio'
    ],
    activo: true,
    created_at: '2025-01-10T10:00:00Z',
    updated_at: '2025-01-10T10:00:00Z'
  }
]

export const usePaquetesStore = create((set, get) => ({
  paquetes: [],
  isLoading: false,
  error: null,

  /**
   * Obtener todos los paquetes activos (usando mock data)
   */
  fetchPaquetes: async () => {
    set({ isLoading: true, error: null })

    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 300))

    try {
      // Usar datos mock
      const paquetesActivos = MOCK_PAQUETES.filter(p => p.activo)

      set({
        paquetes: paquetesActivos,
        isLoading: false
      })

      return { success: true, data: paquetesActivos }
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
