/**
 * Analytics Tracker
 * Componente que maneja el tracking automático de navegación y eventos
 * Se carga dinámicamente sin SSR para evitar errores de pre-rendering
 */

'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useAnalytics, useScrollTracking, useTimeTracking } from '@/hooks/useAnalytics'
import { trackGA4PageView } from './GoogleAnalytics'

export default function AnalyticsTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { trackPageView, trackError } = useAnalytics()

  // =====================================================
  // AUTO-TRACKING DE PAGE VIEWS
  // =====================================================

  useEffect(() => {
    const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '')
    const title = document.title

    // Trackear en nuestro sistema interno
    trackPageView(url, title)

    // Trackear en Google Analytics 4
    trackGA4PageView(url, title)
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
        const dnsTime = perfData.domainLookupEnd - perfData.domainLookupStart
        const tcpTime = perfData.connectEnd - perfData.connectStart
        const requestTime = perfData.responseEnd - perfData.requestStart
        const renderTime = perfData.loadEventEnd - perfData.responseEnd

        // Solo log en desarrollo para evitar spam
        if (process.env.NODE_ENV === 'development') {
          console.log('📊 Performance:', {
            pageLoadTime: `${pageLoadTime}ms`,
            domContentLoaded: `${domContentLoaded}ms`,
            dnsTime: `${dnsTime}ms`,
            tcpTime: `${tcpTime}ms`,
            requestTime: `${requestTime}ms`,
            renderTime: `${renderTime}ms`,
          })
        }

        // Trackear performance si es muy lenta (>5 segundos)
        // IMPORTANTE: Cambiado de 3000ms a 5000ms para reducir falsos positivos
        if (pageLoadTime > 5000) {
          const urlObj = new URL(window.location.href)
          const cleanUrl = `${urlObj.origin}${urlObj.pathname}` // Sin query params para mejor agrupación

          trackError(
            `Página tardó ${Math.round(pageLoadTime / 1000)}s en cargar`,
            'performance_warning',
            {
              page_load_time_ms: pageLoadTime,
              dom_content_loaded_ms: domContentLoaded,
              dns_time_ms: dnsTime,
              tcp_time_ms: tcpTime,
              request_time_ms: requestTime,
              render_time_ms: renderTime,
              url_path: urlObj.pathname,
              has_utm_params: urlObj.searchParams.has('utm_source'),
              has_fbclid: urlObj.searchParams.has('fbclid'),
              performance_breakdown: {
                dns: `${Math.round((dnsTime / pageLoadTime) * 100)}%`,
                tcp: `${Math.round((tcpTime / pageLoadTime) * 100)}%`,
                request: `${Math.round((requestTime / pageLoadTime) * 100)}%`,
                render: `${Math.round((renderTime / pageLoadTime) * 100)}%`,
              },
            }
          )
        }
      } catch (error) {
        console.warn('Error logging performance metrics:', error)
      }
    }
  }, [trackError])

  return null // Solo trackea, no renderiza nada
}
