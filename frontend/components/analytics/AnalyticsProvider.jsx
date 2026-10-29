/**
 * Analytics Provider
 * Provider global para tracking automático de navegación y eventos
 *
 * Características:
 * - Auto-tracking de page views al cambiar de ruta
 * - Auto-tracking de scroll en páginas importantes
 * - Auto-tracking de tiempo en página
 * - Global error handler
 */

'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useAnalytics, useScrollTracking, useTimeTracking } from '@/hooks/useAnalytics'

export default function AnalyticsProvider({ children }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { trackPageView, trackError } = useAnalytics()

  // =====================================================
  // AUTO-TRACKING DE PAGE VIEWS
  // =====================================================

  useEffect(() => {
    const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '')
    const title = document.title

    trackPageView(url, title)
  }, [pathname, searchParams, trackPageView])

  // =====================================================
  // AUTO-TRACKING DE SCROLL Y TIEMPO
  // Solo en páginas importantes para reducir carga
  // =====================================================

  const shouldTrackBehavior =
    pathname === '/' || // Home
    pathname.includes('/registro') || // Registro
    pathname.includes('/artista') || // Páginas de artistas
    pathname.includes('/convocatoria') // Convocatoria

  // Hooks condicionales (seguros porque la condición no cambia en runtime)
  if (shouldTrackBehavior) {
    useScrollTracking()
    useTimeTracking()
  }

  // =====================================================
  // GLOBAL ERROR HANDLER
  // Captura errores JavaScript no manejados
  // =====================================================

  useEffect(() => {
    const handleError = (event) => {
      trackError(event.message || 'Unknown error', 'javascript_error', {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
      })
    }

    const handleUnhandledRejection = (event) => {
      trackError(
        event.reason?.message || 'Unhandled promise rejection',
        'unhandled_rejection',
        {
          reason: event.reason,
        }
      )
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [trackError])

  // =====================================================
  // PERFORMANCE MONITORING (Opcional)
  // =====================================================

  useEffect(() => {
    // Usar Performance API si está disponible
    if (typeof window !== 'undefined' && window.performance) {
      // Esperar a que la página cargue completamente
      if (document.readyState === 'complete') {
        logPerformanceMetrics()
      } else {
        window.addEventListener('load', logPerformanceMetrics)
        return () => window.removeEventListener('load', logPerformanceMetrics)
      }
    }

    function logPerformanceMetrics() {
      try {
        const perfData = window.performance.timing
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart
        const domContentLoaded = perfData.domContentLoadedEventEnd - perfData.navigationStart

        // Solo log en desarrollo para evitar spam
        if (process.env.NODE_ENV === 'development') {
          console.log('📊 Performance:', {
            pageLoadTime: `${pageLoadTime}ms`,
            domContentLoaded: `${domContentLoaded}ms`,
          })
        }

        // Opcional: Trackear performance si es muy lenta
        if (pageLoadTime > 3000) {
          trackError('Slow page load', 'performance_warning', {
            pageLoadTime,
            url: window.location.href,
          })
        }
      } catch (error) {
        console.warn('Error logging performance metrics:', error)
      }
    }
  }, [trackError])

  return <>{children}</>
}
