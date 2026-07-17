'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import useAuthStore from '@/stores/authStore'

/**
 * Hook de Autenticación
 *
 * Provee funcionalidades de autenticación a los componentes
 *
 * Uso:
 * const { user, login, logout, isAuthenticated, isLoading } = useAuth()
 */

export function useAuth() {
  const router = useRouter()
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login: loginStore,
    logout: logoutStore,
    setLoading,
    setError,
    clearError,
    hasRole,
    hasAnyRole
  } = useAuthStore()

  /**
   * Login de usuario
   * @param {string} email
   * @param {string} password
   * @param {string} redirectTo - Ruta a la que redirigir después del login
   */
  const login = async (email, password, redirectTo = null) => {
    // Call the store's login method which handles the API call
    const result = await loginStore(email, password)

    if (result.success) {
      // Get the user from the store after successful login
      const currentUser = useAuthStore.getState().user

      // Redirigir según el rol
      if (redirectTo) {
        router.push(redirectTo)
      } else {
        // Redirigir automáticamente según rol
        if (currentUser?.role === 'admin') {
          router.push('/admin')
        } else if (currentUser?.role === 'curador') {
          router.push('/curador')
        }
      }
    }

    return result
  }

  /**
   * Logout de usuario
   */
  const logout = async () => {
    logoutStore()
    router.push('/')
  }

  /**
   * Verificar autenticación al cargar
   */
  useEffect(() => {
    // Auto-verify token on mount if exists
    if (token && !isAuthenticated) {
      // Try to verify the token
      const verifyToken = async () => {
        const result = await useAuthStore.getState().verifyToken()
        if (!result.success) {
          logoutStore()
        }
      }
      verifyToken()
    }
  }, [token, isAuthenticated, logoutStore])

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    clearError,
    hasRole,
    hasAnyRole
  }
}
