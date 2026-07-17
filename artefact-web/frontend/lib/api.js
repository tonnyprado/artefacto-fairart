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

  delete: (id) =>
    api.delete(`/curadores/${id}`)
}

/**
 * Votaciones API
 */
export const votacionesApi = {
  create: (data) =>
    api.post('/votaciones', data),

  update: (id, data) =>
    api.put(`/votaciones/${id}`, data),

  getMisVotos: (faseId = null) => {
    const params = faseId ? `?fase_id=${faseId}` : ''
    return api.get(`/votaciones/mis-votos${params}`)
  },

  getEstadisticas: (faseId = null) => {
    const params = faseId ? `?fase_id=${faseId}` : ''
    return api.get(`/votaciones/estadisticas${params}`)
  },

  getResultados: (faseId) =>
    api.get(`/votaciones/resultados/${faseId}`),

  verificarVoto: (faseId, artistaId) =>
    api.get(`/votaciones/fase/${faseId}/artista/${artistaId}`),

  delete: (id) =>
    api.delete(`/votaciones/${id}`)
}

export default api
