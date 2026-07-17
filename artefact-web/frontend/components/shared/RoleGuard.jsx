'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

/**
 * RoleGuard - Componente de protección por rol
 *
 * Verifica que el usuario tenga el rol requerido
 * Si no tiene el rol, redirige a la página apropiada
 *
 * Uso:
 * <RoleGuard allowedRoles={['admin']}>
 *   <ComponenteAdmin />
 * </RoleGuard>
 *
 * <RoleGuard allowedRoles={['admin', 'curador']}>
 *   <ComponenteParaAmbos />
 * </RoleGuard>
 */

export default function RoleGuard({ children, allowedRoles = [] }) {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, hasAnyRole } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      // Si no está autenticado, redirigir a login
      if (!isAuthenticated) {
        router.push('/loginpage')
        return
      }

      // Si no tiene el rol permitido, redirigir
      if (!hasAnyRole(allowedRoles)) {
        // Redirigir según el rol que tenga
        if (user?.role === 'admin') {
          router.push('/admin')
        } else if (user?.role === 'curador') {
          router.push('/curador')
        } else {
          router.push('/')
        }
      }
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, hasAnyRole, router])

  // Mostrar loading mientras verifica
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          <p className="mt-4 text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    )
  }

  // Si no está autenticado o no tiene el rol, no mostrar nada
  if (!isAuthenticated || !hasAnyRole(allowedRoles)) {
    return null
  }

  // Usuario tiene el rol correcto, mostrar contenido
  return <>{children}</>
}
