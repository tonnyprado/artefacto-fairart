import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '@/lib/api'

/**
 * Store de Autenticación con Zustand
 *
 * Maneja el estado de autenticación del usuario en toda la app
 * Conectado al backend API
 *
 * DATOS QUE SE GUARDAN:
 * - user: Objeto con info del usuario (viene de API /api/auth/login)
 * - token: JWT token (se guarda en localStorage automáticamente)
 * - isAuthenticated: boolean
 *
 * BASE DE DATOS:
 * - Tabla: usuarios
 *   - id
 *   - email
 *   - nombre
 *   - role ('admin' | 'curador' | 'artista')
 *   - curadorId (si role === 'curador')
 */

const useAuthStore = create(
  persist(
    (set, get) => ({
      // Estado inicial
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      /**
       * Login con email y password
       * Llama al backend API y guarda el token
       */
      login: async (email, password) => {
        set({ isLoading: true, error: null })

        try {
          const response = await authApi.login(email, password)

          // Guardar token en localStorage para las peticiones API
          if (typeof window !== 'undefined') {
            localStorage.setItem('token', response.token)
          }

          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })

          return { success: true }
        } catch (error) {
          set({
            error: error.message || 'Error al iniciar sesión',
            isLoading: false
          })
          return { success: false, error: error.message }
        }
      },

      /**
       * Set user and token directly (for useAuth hook)
       * DEPRECATED: Use login(email, password) instead
       */
      setUserAndToken: (user, token) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token)
        }

        set({
          user,
          token,
          isAuthenticated: true,
          error: null
        })
      },

      /**
       * Logout
       * Limpia el estado y el localStorage
       */
      logout: () => {
        authApi.logout()
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null
        })
        // Limpiar localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-storage')
        }
      },

      /**
       * Verificar token actual
       * Útil para verificar si el usuario sigue autenticado
       */
      verifyToken: async () => {
        const { token } = get()

        if (!token) {
          return { success: false, error: 'No hay token' }
        }

        set({ isLoading: true })

        try {
          const response = await authApi.verifyToken()

          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })

          return { success: true }
        } catch (error) {
          // Token inválido o expirado
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          })

          if (typeof window !== 'undefined') {
            localStorage.removeItem('token')
            localStorage.removeItem('auth-storage')
          }

          return { success: false, error: error.message }
        }
      },

      /**
       * Actualizar datos del usuario
       */
      setUser: (userData) => {
        set({ user: userData })
      },

      /**
       * Establecer error
       */
      setError: (error) => {
        set({ error })
      },

      /**
       * Establecer loading
       */
      setLoading: (isLoading) => {
        set({ isLoading })
      },

      /**
       * Verificar si el usuario tiene un rol específico
       */
      hasRole: (role) => {
        const { user } = get()
        return user?.role === role
      },

      /**
       * Verificar si el usuario tiene alguno de los roles
       */
      hasAnyRole: (roles) => {
        const { user } = get()
        return roles.includes(user?.role)
      },

      /**
       * Actualizar token
       */
      updateToken: (newToken) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', newToken)
        }
        set({ token: newToken })
      },

      /**
       * Limpiar error
       */
      clearError: () => {
        set({ error: null })
      }
    }),
    {
      name: 'auth-storage', // nombre en localStorage
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)

export default useAuthStore
