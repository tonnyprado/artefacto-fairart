'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

/**
 * AuthGuard - Componente de protección de rutas
 *
 * Verifica que el usuario esté autenticado
 * Si no está autenticado, redirige a /loginpage
 *
 * Uso:
 * <AuthGuard>
 *   <ComponenteProtegido />
 * </AuthGuard>
 */

export default function AuthGuard({ children }) {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/loginpage')
    }
  }, [isAuthenticated, isLoading, router])

  // Mostrar loading mientras verifica autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          <p className="mt-4 text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  // Si no está autenticado, no mostrar nada (está redirigiendo)
  if (!isAuthenticated) {
    return null
  }

  // Usuario autenticado, mostrar contenido
  return <>{children}</>
}
