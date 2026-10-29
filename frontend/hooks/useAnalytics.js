/**
 * useAnalytics Hook
 * Hook principal para tracking de eventos de analytics
 *
 * Características:
 * - Wrapper para todos los tipos de eventos
 * - Integración automática con Meta Pixel
 * - Flush automático al salir
 * - Hooks auxiliares para scroll y time tracking
 */

'use client'

import { useEffect, useCallback, useRef } from 'react'
import useAnalyticsStore from '@/stores/analyticsStore'
import { trackCustomEvent as trackMetaPixel } from '@/lib/metaPixel'

/**
 * Hook principal de analytics
 * @returns {Object} Funciones de tracking
 */
export function useAnalytics() {
  const { track, flush, initSession, session_id } = useAnalyticsStore()
  const sessionInitialized = useRef(false)

  // Inicializar sesión al montar
  useEffect(() => {
    if (!sessionInitialized.current) {
      initSession()
      sessionInitialized.current = true
    }
  }, [initSession])

  // Flush al salir de la página
  useEffect(() => {
    const handleBeforeUnload = () => {
      flush()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [flush])

  // Flush periódico (cada 30 segundos)
  useEffect(() => {
    const interval = setInterval(() => {
      flush()
    }, 30000)

    return () => clearInterval(interval)
  }, [flush])

  // =====================================================
  // TRACKING DE NAVEGACIÓN
  // =====================================================

  /**
   * Track page view
   * @param {string} url - URL de la página (opcional, usa window.location.href por defecto)
   * @param {string} title - Título de la página (opcional, usa document.title por defecto)
   */
  const trackPageView = useCallback(
    (url, title) => {
      track({
        event_type: 'page_view',
        page_url: url || window.location.href,
        page_title: title || document.title,
      })
    },
    [track]
  )

  // =====================================================
  // TRACKING DE INTERACCIONES
  // =====================================================

  /**
   * Track click en elemento
   * @param {string} elementId - ID del elemento clickeado
   * @param {string} elementText - Texto del elemento
   * @param {Object} metadata - Datos adicionales
   */
  const trackClick = useCallback(
    (elementId, elementText, metadata = {}) => {
      track({
        event_type: 'click',
        element_id: elementId,
        element_text: elementText,
        metadata,
      })

      // Track en Meta Pixel si es un botón importante
      if (metadata.important && window.fbq) {
        trackMetaPixel('ButtonClick', { element_id: elementId })
      }
    },
    [track]
  )

  /**
   * Track conversión
   * @param {string} conversionType - Tipo de conversión
   * @param {number} value - Valor de la conversión
   * @param {Object} metadata - Datos adicionales
   */
  const trackConversion = useCallback(
    (conversionType, value, metadata = {}) => {
      track({
        event_type: 'conversion',
        event_name: conversionType,
        value,
        metadata: {
          ...metadata,
          conversion_type: conversionType,
        },
      })

      // Track en Meta Pixel
      if (window.fbq) {
        window.fbq('track', 'Lead', { value, currency: 'MXN' })
      }
    },
    [track]
  )

  // =====================================================
  // TRACKING DE COMPORTAMIENTO
  // =====================================================

  /**
   * Track scroll depth
   * @param {number} depth - Profundidad del scroll (0-100)
   */
  const trackScrollDepth = useCallback(
    (depth) => {
      track({
        event_type: 'scroll_depth',
        value: depth,
        metadata: { depth_percentage: depth },
      })
    },
    [track]
  )

  /**
   * Track tiempo en página
   * @param {number} seconds - Segundos en la página
   */
  const trackTimeOnPage = useCallback(
    (seconds) => {
      track({
        event_type: 'time_on_page',
        value: seconds,
      })
    },
    [track]
  )

  // =====================================================
  // TRACKING DE FORMULARIOS
  // =====================================================

  /**
   * Track inicio de formulario
   * @param {string} formName - Nombre del formulario
   */
  const trackFormStart = useCallback(
    (formName) => {
      track({
        event_type: 'form_start',
        event_name: formName,
        metadata: { form_name: formName },
      })
    },
    [track]
  )

  /**
   * Track envío de formulario
   * @param {string} formName - Nombre del formulario
   * @param {Object} metadata - Datos adicionales
   */
  const trackFormSubmit = useCallback(
    (formName, metadata = {}) => {
      track({
        event_type: 'form_submit',
        event_name: formName,
        metadata: { ...metadata, form_name: formName },
      })
    },
    [track]
  )

  /**
   * Track abandono de formulario
   * @param {string} formName - Nombre del formulario
   * @param {number|string} stepCompleted - Paso en el que abandonó
   */
  const trackFormAbandon = useCallback(
    (formName, stepCompleted) => {
      track({
        event_type: 'form_abandon',
        event_name: formName,
        metadata: {
          form_name: formName,
          step_completed: stepCompleted,
        },
      })

      // Track en Meta Pixel para remarketing
      if (window.fbq) {
        window.fbq('track', 'Lead', {
          content_name: `Abandoned Form: ${formName}`,
          status: 'abandoned',
        })
      }
    },
    [track]
  )

  // =====================================================
  // TRACKING DE ERRORES
  // =====================================================

  /**
   * Track error
   * @param {string} errorMessage - Mensaje de error
   * @param {string} errorType - Tipo de error
   * @param {Object} metadata - Datos adicionales
   */
  const trackError = useCallback(
    (errorMessage, errorType, metadata = {}) => {
      track({
        event_type: 'error',
        event_name: errorType,
        metadata: {
          ...metadata,
          error_message: errorMessage,
          error_type: errorType,
        },
      })
    },
    [track]
  )

  // =====================================================
  // TRACKING GENÉRICO
  // =====================================================

  /**
   * Track evento custom
   * @param {string} eventType - Tipo de evento
   * @param {string} eventName - Nombre del evento
   * @param {number} value - Valor del evento
   * @param {Object} metadata - Datos adicionales
   */
  const trackEvent = useCallback(
    (eventType, eventName, value, metadata = {}) => {
      track({
        event_type: eventType,
        event_name: eventName,
        value,
        metadata,
      })
    },
    [track]
  )

  return {
    session_id,
    trackPageView,
    trackClick,
    trackConversion,
    trackScrollDepth,
    trackTimeOnPage,
    trackFormStart,
    trackFormSubmit,
    trackFormAbandon,
    trackError,
    trackEvent,
  }
}

// =====================================================
// HOOKS AUXILIARES
// =====================================================

/**
 * Hook para tracking automático de scroll depth
 * Trackea en hitos: 25%, 50%, 75%, 100%
 */
export function useScrollTracking() {
  const { trackScrollDepth } = useAnalytics()
  const milestones = useRef(new Set())

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.scrollY || document.documentElement.scrollTop

      const scrollPercent = Math.round((scrollTop / (documentHeight - windowHeight)) * 100)

      // Track en hitos específicos
      const checkpoints = [25, 50, 75, 100]
      checkpoints.forEach((checkpoint) => {
        if (scrollPercent >= checkpoint && !milestones.current.has(checkpoint)) {
          milestones.current.add(checkpoint)
          trackScrollDepth(checkpoint)
        }
      })
    }

    // Debounce del scroll
    let timeoutId
    const debouncedScroll = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(handleScroll, 500)
    }

    window.addEventListener('scroll', debouncedScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', debouncedScroll)
      clearTimeout(timeoutId)
    }
  }, [trackScrollDepth])
}

/**
 * Hook para tracking automático de tiempo en página
 * Trackea al desmontar el componente
 */
export function useTimeTracking() {
  const { trackTimeOnPage } = useAnalytics()
  const startTime = useRef(Date.now())

  useEffect(() => {
    return () => {
      const seconds = Math.round((Date.now() - startTime.current) / 1000)
      if (seconds > 0) {
        trackTimeOnPage(seconds)
      }
    }
  }, [trackTimeOnPage])
}

/**
 * Hook para tracking de visibilidad de página
 * Pausa el contador cuando la pestaña no está visible
 */
export function usePageVisibility() {
  const activeTime = useRef(0)
  const lastVisibleTime = useRef(Date.now())
  const isVisible = useRef(true)

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Página ocultada
        if (isVisible.current) {
          activeTime.current += Date.now() - lastVisibleTime.current
          isVisible.current = false
        }
      } else {
        // Página visible
        if (!isVisible.current) {
          lastVisibleTime.current = Date.now()
          isVisible.current = true
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return {
    getActiveTime: () => {
      if (isVisible.current) {
        return activeTime.current + (Date.now() - lastVisibleTime.current)
      }
      return activeTime.current
    },
  }
}
