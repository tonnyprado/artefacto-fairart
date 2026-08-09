import { create } from 'zustand'

/**
 * Store de Paquetes
 *
 * MOCK DATA para demostración
 * TODO: Conectar con backend cuando esté disponible
 */

// Datos mock de paquetes para demostración
// Precios según Convocatoria ARTE FACTO 2027
const MOCK_PAQUETES = [
  // PAQUETES OBRA BIDIMENSIONAL (2D)
  {
    id: 1,
    nombre: 'Básico 2D',
    tipo: '2D',
    descripcion: 'Paquete básico para obra bidimensional',
    precio: 9500,
    precio_fase1: 7600,
    precio_fase2: 8550,
    precio_fase3: 9500,
    metros_lineales: 2,
    altura_pared: 2.4,
    beneficios: [
      '2 metros lineales de pared',
      'Bootcamp de cerámica con material incluido',
      '5 boletos dobles de cortesía',
      'Asesores de venta durante la feria',
      'Acceso a 1-2 talleres en Estudio ARTE FACTO',
      'Difusión masiva en redes',
      'Playeras y totebags con serigrafías de tu arte',
      'Publicaciones y entrevistas previas al evento'
    ],
    activo: true,
    created_at: '2026-08-10T10:00:00Z',
    updated_at: '2026-08-10T10:00:00Z'
  },
  {
    id: 2,
    nombre: 'Estándar 2D',
    tipo: '2D',
    descripcion: 'Paquete estándar para obra bidimensional',
    precio: 13000,
    precio_fase1: 10400,
    precio_fase2: 11700,
    precio_fase3: 13000,
    metros_lineales: 3,
    altura_pared: 2.4,
    beneficios: [
      '3 metros lineales de pared',
      'Bootcamp de cerámica con material incluido',
      '5 boletos dobles de cortesía',
      'Asesores de venta durante la feria',
      'Acceso a 1-2 talleres en Estudio ARTE FACTO',
      'Difusión masiva en redes',
      'Playeras y totebags con serigrafías de tu arte',
      'Publicaciones y entrevistas previas al evento'
    ],
    activo: true,
    created_at: '2026-08-10T10:00:00Z',
    updated_at: '2026-08-10T10:00:00Z'
  },
  {
    id: 3,
    nombre: 'Medio 2D',
    tipo: '2D',
    descripcion: 'Paquete medio para obra bidimensional',
    precio: 19500,
    precio_fase1: 15600,
    precio_fase2: 17550,
    precio_fase3: 19500,
    metros_lineales: 5,
    altura_pared: 2.4,
    beneficios: [
      '5 metros lineales de pared',
      'Bootcamp de cerámica con material incluido',
      '5 boletos dobles de cortesía',
      'Asesores de venta durante la feria',
      'Acceso a 1-2 talleres en Estudio ARTE FACTO',
      'Difusión masiva en redes',
      'Playeras y totebags con serigrafías de tu arte',
      'Publicaciones y entrevistas previas al evento'
    ],
    activo: true,
    created_at: '2026-08-10T10:00:00Z',
    updated_at: '2026-08-10T10:00:00Z'
  },
  {
    id: 4,
    nombre: 'Amplio 2D',
    tipo: '2D',
    descripcion: 'Paquete amplio para obra bidimensional',
    precio: 24500,
    precio_fase1: 19600,
    precio_fase2: 22050,
    precio_fase3: 24500,
    metros_lineales: 7,
    altura_pared: 2.4,
    beneficios: [
      '7 metros lineales de pared',
      'Bootcamp de cerámica con material incluido',
      '5 boletos dobles de cortesía',
      'Asesores de venta durante la feria',
      'Acceso a 1-2 talleres en Estudio ARTE FACTO',
      'Difusión masiva en redes',
      'Playeras y totebags con serigrafías de tu arte',
      'Publicaciones y entrevistas previas al evento'
    ],
    activo: true,
    created_at: '2026-08-10T10:00:00Z',
    updated_at: '2026-08-10T10:00:00Z'
  },
  {
    id: 5,
    nombre: 'Completo 2D',
    tipo: '2D',
    descripcion: 'Paquete completo para obra bidimensional',
    precio: 33500,
    precio_fase1: 26800,
    precio_fase2: 30150,
    precio_fase3: 33500,
    metros_lineales: 10,
    altura_pared: 2.4,
    beneficios: [
      '10 metros lineales de pared',
      'Bootcamp de cerámica con material incluido',
      '5 boletos dobles de cortesía',
      'Asesores de venta durante la feria',
      'Acceso a 1-2 talleres en Estudio ARTE FACTO',
      'Difusión masiva en redes',
      'Playeras y totebags con serigrafías de tu arte',
      'Publicaciones y entrevistas previas al evento'
    ],
    activo: true,
    created_at: '2026-08-10T10:00:00Z',
    updated_at: '2026-08-10T10:00:00Z'
  },
  // PAQUETES OBRA TRIDIMENSIONAL (3D)
  {
    id: 6,
    nombre: 'Básico 3D',
    tipo: '3D',
    descripcion: 'Paquete básico para obra tridimensional',
    precio: 9500,
    precio_fase1: 7600,
    precio_fase2: 8550,
    precio_fase3: 9500,
    metros_cuadrados: 1,
    beneficios: [
      '1 metro cuadrado de espacio',
      'Bootcamp de cerámica con material incluido',
      '5 boletos dobles de cortesía',
      'Asesores de venta durante la feria',
      'Acceso a 1-2 talleres en Estudio ARTE FACTO',
      'Difusión masiva en redes',
      'Playeras y totebags con serigrafías de tu arte',
      'Publicaciones y entrevistas previas al evento'
    ],
    activo: true,
    created_at: '2026-08-10T10:00:00Z',
    updated_at: '2026-08-10T10:00:00Z'
  },
  {
    id: 7,
    nombre: 'Estándar 3D',
    tipo: '3D',
    descripcion: 'Paquete estándar para obra tridimensional',
    precio: 15500,
    precio_fase1: 12400,
    precio_fase2: 13950,
    precio_fase3: 15500,
    metros_cuadrados: 2,
    beneficios: [
      '2 metros cuadrados de espacio',
      'Bootcamp de cerámica con material incluido',
      '5 boletos dobles de cortesía',
      'Asesores de venta durante la feria',
      'Acceso a 1-2 talleres en Estudio ARTE FACTO',
      'Difusión masiva en redes',
      'Playeras y totebags con serigrafías de tu arte',
      'Publicaciones y entrevistas previas al evento'
    ],
    activo: true,
    created_at: '2026-08-10T10:00:00Z',
    updated_at: '2026-08-10T10:00:00Z'
  },
  {
    id: 8,
    nombre: 'Medio 3D',
    tipo: '3D',
    descripcion: 'Paquete medio para obra tridimensional',
    precio: 20000,
    precio_fase1: 16000,
    precio_fase2: 18000,
    precio_fase3: 20000,
    metros_cuadrados: 3,
    beneficios: [
      '3 metros cuadrados de espacio',
      'Bootcamp de cerámica con material incluido',
      '5 boletos dobles de cortesía',
      'Asesores de venta durante la feria',
      'Acceso a 1-2 talleres en Estudio ARTE FACTO',
      'Difusión masiva en redes',
      'Playeras y totebags con serigrafías de tu arte',
      'Publicaciones y entrevistas previas al evento'
    ],
    activo: true,
    created_at: '2026-08-10T10:00:00Z',
    updated_at: '2026-08-10T10:00:00Z'
  },
  {
    id: 9,
    nombre: 'Amplio 3D',
    tipo: '3D',
    descripcion: 'Paquete amplio para obra tridimensional',
    precio: 24000,
    precio_fase1: 19200,
    precio_fase2: 21600,
    precio_fase3: 24000,
    metros_cuadrados: 4,
    beneficios: [
      '4 metros cuadrados de espacio',
      'Bootcamp de cerámica con material incluido',
      '5 boletos dobles de cortesía',
      'Asesores de venta durante la feria',
      'Acceso a 1-2 talleres en Estudio ARTE FACTO',
      'Difusión masiva en redes',
      'Playeras y totebags con serigrafías de tu arte',
      'Publicaciones y entrevistas previas al evento'
    ],
    activo: true,
    created_at: '2026-08-10T10:00:00Z',
    updated_at: '2026-08-10T10:00:00Z'
  },
  {
    id: 10,
    nombre: 'Completo 3D',
    tipo: '3D',
    descripcion: 'Paquete completo para obra tridimensional',
    precio: 45000,
    precio_fase1: 36000,
    precio_fase2: 40500,
    precio_fase3: 45000,
    metros_cuadrados: 9,
    beneficios: [
      '9 metros cuadrados de espacio',
      'Bootcamp de cerámica con material incluido',
      '5 boletos dobles de cortesía',
      'Asesores de venta durante la feria',
      'Acceso a 1-2 talleres en Estudio ARTE FACTO',
      'Difusión masiva en redes',
      'Playeras y totebags con serigrafías de tu arte',
      'Publicaciones y entrevistas previas al evento'
    ],
    activo: true,
    created_at: '2026-08-10T10:00:00Z',
    updated_at: '2026-08-10T10:00:00Z'
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
