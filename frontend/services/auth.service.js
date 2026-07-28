import { authApi } from '@/lib/api'

/**
 * Servicio de Autenticación
 *
 * Maneja las peticiones relacionadas con autenticación
 * Conectado al backend API en http://localhost:4000/api
 *
 * API ENDPOINTS:
 * - POST /api/auth/login
 *   Body: { email, password }
 *   Response: { message, token, user: { id, email, nombre, role, curadorId? } }
 *
 * - POST /api/auth/logout
 *   Headers: { Authorization: Bearer <token> }
 *   Response: { message }
 *
 * - GET /api/auth/verify
 *   Headers: { Authorization: Bearer <token> }
 *   Response: { user: { id, email, nombre, role, curadorId? } }
 */

export const authService = {
  /**
   * Login de usuario (admin o curador)
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{success: boolean, token: string, user: object}>}
   */
  async login(email, password) {
    try {
      const response = await authApi.login(email, password)

      return {
        success: true,
        token: response.token,
        user: response.user
      }
    } catch (error) {
      throw new Error(error.message || 'Error al iniciar sesión')
    }
  },

  /**
   * Logout de usuario
   * @returns {Promise<{success: boolean}>}
   */
  async logout() {
    try {
      await authApi.logout()
      return { success: true }
    } catch (error) {
      // Ignorar errores de logout del servidor
      console.warn('Error al hacer logout en el servidor:', error.message)
      return { success: true }
    }
  },

  /**
   * Obtener información del usuario actual
   * @returns {Promise<{user: object}>}
   */
  async getCurrentUser() {
    try {
      const response = await authApi.verifyToken()
      return response
    } catch (error) {
      throw new Error('Error al obtener usuario')
    }
  },

  /**
   * Verificar token actual
   * @returns {Promise<{user: object}>}
   */
  async verifyToken() {
    try {
      const response = await authApi.verifyToken()
      return response
    } catch (error) {
      throw new Error('Token inválido o expirado')
    }
  },

  /**
   * Verificar si el token es válido
   * @param {string} token
   * @returns {boolean}
   */
  isTokenValid(token) {
    if (!token) return false

    try {
      // Decodificar token JWT (simplificado)
      const parts = token.split('.')
      if (parts.length !== 3) return false

      const payload = JSON.parse(atob(parts[1]))

      // Verificar expiración (si existe)
      if (payload.exp) {
        const now = Math.floor(Date.now() / 1000)
        return payload.exp > now
      }

      return true
    } catch {
      return false
    }
  }
}
