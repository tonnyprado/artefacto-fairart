/**
 * API Utility Functions
 * Centralized API configuration and helper functions
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

/**
 * Get auth token from localStorage
 */
const getToken = () => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

/**
 * Get auth headers
 */
const getAuthHeaders = () => {
  const token = getToken()
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  }
}

/**
 * Handle API response
 */
const handleResponse = async (response) => {
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || data.message || 'Error en la petición')
  }

  return data
}

/**
 * API request wrapper
 */
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`

  const config = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers
    }
  }

  try {
    const response = await fetch(url, config)
    return await handleResponse(response)
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error)
    throw error
  }
}

/**
 * API Methods
 */
export const api = {
  // GET request
  get: (endpoint, options = {}) => {
    return apiRequest(endpoint, {
      method: 'GET',
      ...options
    })
  },

  // POST request
  post: (endpoint, data, options = {}) => {
    return apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options
    })
  },

  // PUT request
  put: (endpoint, data, options = {}) => {
    return apiRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options
    })
  },

  // DELETE request
  delete: (endpoint, options = {}) => {
    return apiRequest(endpoint, {
      method: 'DELETE',
      ...options
    })
  }
}

/**
 * Auth API
 */
export const authApi = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }),

  register: (data) =>
    api.post('/auth/register', data),

  verifyToken: () =>
    api.get('/auth/verify'),

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }
}

/**
 * Artistas API
 */
export const artistasApi = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return api.get(`/artistas${queryString ? `?${queryString}` : ''}`)
  },

  getById: (id) =>
    api.get(`/artistas/${id}`),

  getByFase: (faseId) =>
    api.get(`/artistas/fase/${faseId}`),

  create: (data) =>
    api.post('/artistas', data),

  update: (id, data) =>
    api.put(`/artistas/${id}`, data),

  aprobar: (id) =>
    api.put(`/artistas/${id}/aprobar`),

  rechazar: (id) =>
    api.put(`/artistas/${id}/rechazar`),

  delete: (id) =>
    api.delete(`/artistas/${id}`)
}

/**
 * Ediciones API
 */
export const edicionesApi = {
  getAll: () =>
    api.get('/ediciones'),

  getById: (id) =>
    api.get(`/ediciones/${id}`),

  getActiva: () =>
    api.get('/ediciones/activa'),

  getFases: (id) =>
    api.get(`/ediciones/${id}/fases`),

  create: (data) =>
    api.post('/ediciones', data),

  update: (id, data) =>
    api.put(`/ediciones/${id}`, data),

  delete: (id, force = false) =>
    api.delete(`/ediciones/${id}${force ? '?force=true' : ''}`)
}

/**
 * Fases API
 */
export const fasesApi = {
  getAll: () =>
    api.get('/fases'),

  getById: (id) =>
    api.get(`/fases/${id}`),

  getArtistas: (id) =>
    api.get(`/fases/${id}/artistas`),

  create: (data) =>
    api.post('/fases', data),

  update: (id, data) =>
    api.put(`/fases/${id}`, data),

  abrirVotaciones: (id) =>
    api.put(`/fases/${id}/abrir-votaciones`),

  cerrarVotaciones: (id) =>
    api.put(`/fases/${id}/cerrar-votaciones`),

  finalizar: (id) =>
    api.put(`/fases/${id}/finalizar`),

  inscribirArtistas: (id, artistaIds) =>
    api.post(`/fases/${id}/artistas`, { artista_ids: artistaIds }),

  toggleInscripciones: (id, abrir) =>
    api.put(`/fases/${id}/inscripciones`, { abiertas: abrir }),

  toggleVotaciones: (id, abrir) =>
    api.put(`/fases/${id}/votaciones`, { abiertas: abrir }),

  delete: (id) =>
    api.delete(`/fases/${id}`)
}

/**
 * Curadores API
 */
export const curadoresApi = {
  getAll: () =>
    api.get('/curadores'),

  getById: (id) =>
    api.get(`/curadores/${id}`),

  getVotaciones: (id) =>
    api.get(`/curadores/${id}/votaciones`),

  create: (data) =>
    api.post('/curadores', data),

  update: (id, data) =>
    api.put(`/curadores/${id}`, data),

  activar: (id) =>
    api.put(`/curadores/${id}/activar`),

  desactivar: (id) =>
    api.put(`/curadores/${id}/desactivar`),

  resetPassword: (id, password) =>
    api.put(`/curadores/${id}/reset-password`, { password }),

  delete: (id) =>
    api.delete(`/curadores/${id}`)
}

/**
 * Rondas API
 */
export const rondasApi = {
  // Obtener rondas de una fase
  getByFase: (faseId) =>
    api.get(`/rondas/fase/${faseId}`),

  // Obtener ronda específica
  getById: (id) =>
    api.get(`/rondas/${id}`),

  // Obtener estadísticas de una ronda
  getEstadisticas: (id) =>
    api.get(`/rondas/${id}/estadisticas`),

  // Crear ronda (admin)
  create: (data) =>
    api.post('/rondas', data),

  // Abrir ronda (admin)
  abrir: (id) =>
    api.post(`/rondas/${id}/abrir`),

  // Cerrar ronda (admin)
  cerrar: (id) =>
    api.post(`/rondas/${id}/cerrar`),

  // Eliminar ronda (admin)
  delete: (id) =>
    api.delete(`/rondas/${id}`)
}

/**
 * Postulaciones API
 */
export const postulacionesApi = {
  // Obtener postulaciones con filtros
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return api.get(`/postulaciones${queryString ? `?${queryString}` : ''}`)
  },

  // Obtener postulación específica
  getById: (id) =>
    api.get(`/postulaciones/${id}`),

  // Obtener postulaciones para votación (curador)
  getParaVotacion: (faseId, rondaId) =>
    api.get(`/postulaciones/fase/${faseId}/para-votacion?ronda_id=${rondaId}`),

  // Crear postulación (admin)
  create: (data) =>
    api.post('/postulaciones', data),

  // Actualizar postulación (admin)
  update: (id, data) =>
    api.put(`/postulaciones/${id}`, data),

  // Mover de reserva a shortlist (admin)
  moverAShortlist: (id) =>
    api.post(`/postulaciones/${id}/mover-a-shortlist`),

  // Eliminar postulación (admin)
  delete: (id) =>
    api.delete(`/postulaciones/${id}`)
}

/**
 * Votaciones API - Sistema de Rondas
 */
export const votacionesApi = {
  // Crear o actualizar votación
  create: (data) =>
    api.post('/votaciones', data),

  update: (id, data) =>
    api.put(`/votaciones/${id}`, data),

  // Obtener mis votos
  getMisVotos: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return api.get(`/votaciones/mis-votos${queryString ? `?${queryString}` : ''}`)
  },

  // Obtener mis estadísticas
  getEstadisticas: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return api.get(`/votaciones/estadisticas${queryString ? `?${queryString}` : ''}`)
  },

  // Obtener progreso en una ronda
  getProgreso: (rondaId) =>
    api.get(`/votaciones/ronda/${rondaId}/progreso`),

  // Obtener resultados de una ronda (solo cerrada o admin)
  getResultadosRonda: (rondaId) =>
    api.get(`/votaciones/ronda/${rondaId}/resultados`),

  // Obtener resultados de una fase
  getResultados: (faseId) =>
    api.get(`/votaciones/resultados/${faseId}`),

  // Verificar si votó por un artista
  verificarVoto: (faseId, artistaId, rondaId = null) => {
    const params = rondaId ? `?ronda_id=${rondaId}` : ''
    return api.get(`/votaciones/fase/${faseId}/artista/${artistaId}${params}`)
  },

  // Eliminar votación
  delete: (id) =>
    api.delete(`/votaciones/${id}`)
}

/**
 * Paquetes API
 */
export const paquetesApi = {
  getAll: () =>
    api.get('/paquetes?activo=true'),

  getById: (id) =>
    api.get(`/paquetes/${id}`)
}

/**
 * Layouts API
 * MOCK DATA para demostración - no hace upload real
 */
export const layoutsApi = {
  uploadCanvas: async (imageBlob) => {
    // Simular delay de upload
    await new Promise(resolve => setTimeout(resolve, 500))

    // Retornar URL mock de Cloudinary
    const mockUrl = `https://res.cloudinary.com/demo/image/upload/layouts/layout_${Date.now()}.png`

    return {
      success: true,
      data: {
        url: mockUrl,
        public_id: `layouts/layout_${Date.now()}`
      }
    }
  }
}

/**
 * Opiniones API
 * Sistema de opiniones públicas "¿Qué es arte para ti?"
 */
export const opinionesApi = {
  // Crear nueva opinión (público)
  create: (data) =>
    api.post('/opiniones', data),

  // Obtener opinión aleatoria (público)
  getRandom: () =>
    api.get('/opiniones/random'),

  // Obtener todas las opiniones (admin)
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return api.get(`/opiniones${queryString ? `?${queryString}` : ''}`)
  },

  // Eliminar opinión (admin)
  delete: (id) =>
    api.delete(`/opiniones/${id}`),

  // Cambiar estado de aprobación (admin)
  toggle: (id) =>
    api.put(`/opiniones/${id}/toggle`)
}

/**
 * Favoritos API
 * Sistema de favoritos para curadores
 */
export const favoritosApi = {
  // Agregar favorito
  create: (data) =>
    api.post('/favoritos', data),

  // Eliminar favorito
  delete: (id) =>
    api.delete(`/favoritos/${id}`),

  // Toggle favorito (agregar/quitar)
  toggle: (artistaId, faseId, notas = null) =>
    api.post('/favoritos/toggle', { artista_id: artistaId, fase_id: faseId, notas }),

  // Obtener mis favoritos
  getMisFavoritos: (faseId = null) => {
    const params = faseId ? `?fase_id=${faseId}` : ''
    return api.get(`/favoritos/mis-favoritos${params}`)
  },

  // Obtener favoritos por fase
  getByFase: (faseId) =>
    api.get(`/favoritos/fase/${faseId}`),

  // Verificar si es favorito
  check: (artistaId, faseId) =>
    api.get(`/favoritos/check/${artistaId}/${faseId}`),

  // Actualizar notas de favorito
  update: (id, notas) =>
    api.put(`/favoritos/${id}`, { notas }),

  // Admin: Obtener estadisticas
  getEstadisticasAdmin: () =>
    api.get('/favoritos/admin/estadisticas'),

  // Admin: Obtener favoritos de un curador
  getByCuradorAdmin: (curadorId, faseId = null) => {
    const params = faseId ? `?fase_id=${faseId}` : ''
    return api.get(`/favoritos/admin/curador/${curadorId}${params}`)
  }
}

export default api
