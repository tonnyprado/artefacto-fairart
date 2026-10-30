/**
 * Analytics Store
 * Estado global para tracking de eventos y analytics
 *
 * Características:
 * - Queue client-side con batch processing
 * - Persist de session_id en localStorage
 * - Auto-flush cada 10 eventos o al cambiar página
 * - Retry automático si falla el envío
 * - Integración con Meta Pixel
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import { trackFromAnalytics } from '@/lib/metaPixel'
import { trackGA4FromInternal } from '@/components/analytics/GoogleAnalytics'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

/**
 * Extraer parámetros UTM de la URL
 * Estos parámetros son CRÍTICOS para atribución de campañas de marketing
 */
function getUTMParams() {
  if (typeof window === 'undefined') return {}

  const params = new URLSearchParams(window.location.search)

  return {
    utm_source: params.get('utm_source') || null,
    utm_medium: params.get('utm_medium') || null,
    utm_campaign: params.get('utm_campaign') || null,
    utm_content: params.get('utm_content') || null,
    utm_term: params.get('utm_term') || null,
  }
}

/**
 * Detectar dispositivo y navegador
 * Útil para optimización mobile vs desktop
 */
function getDeviceInfo() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return {}

  const ua = navigator.userAgent

  // Detectar dispositivo
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
  const isTablet = /iPad|Android(?!.*Mobile)/i.test(ua)
  const isDesktop = !isMobile && !isTablet

  // Detectar OS
  let os = 'Unknown'
  if (/Windows/i.test(ua)) os = 'Windows'
  else if (/Mac/i.test(ua)) os = 'macOS'
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS'
  else if (/Android/i.test(ua)) os = 'Android'
  else if (/Linux/i.test(ua)) os = 'Linux'

  // Detectar navegador
  let browser = 'Unknown'
  if (/Chrome/i.test(ua) && !/Edge|Edg/i.test(ua)) browser = 'Chrome'
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari'
  else if (/Firefox/i.test(ua)) browser = 'Firefox'
  else if (/Edge|Edg/i.test(ua)) browser = 'Edge'
  else if (/MSIE|Trident/i.test(ua)) browser = 'Internet Explorer'

  return {
    device: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
    os,
    browser,
    screen_width: window.screen.width,
    screen_height: window.screen.height,
  }
}

const useAnalyticsStore = create(
  persist(
    (set, get) => ({
      // =====================================================
      // ESTADO
      // =====================================================
      session_id: null,
      isEnabled: true,
      eventQueue: [],
      isTracking: false,
      lastActivityTime: null,

      // =====================================================
      // INICIALIZACIÓN DE SESIÓN
      // =====================================================

      /**
       * Inicializar sesión de analytics
       * Reutiliza sesión existente si la última actividad fue hace menos de 30 minutos
       * @returns {string} UUID de la sesión
       */
      initSession: () => {
        const state = get()
        const existingSessionId = state.session_id
        const lastActivity = state.lastActivityTime
        const now = Date.now()

        // Reutilizar sesión si existe y está activa (< 30 min)
        if (existingSessionId && lastActivity && now - lastActivity < 30 * 60 * 1000) {
          console.log('📊 Analytics: Sesión existente reutilizada', existingSessionId)
          set({ lastActivityTime: now })
          return existingSessionId
        }

        // Crear nueva sesión
        const newSessionId = uuidv4()
        set({
          session_id: newSessionId,
          lastActivityTime: now,
        })

        // Capturar UTM params y device info
        const utmParams = getUTMParams()
        const deviceInfo = getDeviceInfo()

        // Track session start con datos completos
        get().track({
          event_type: 'session_start',
          metadata: {
            referrer: typeof document !== 'undefined' ? document.referrer : '',
            landing_page: typeof window !== 'undefined' ? window.location.href : '',
            // UTM Parameters (CRÍTICO para marketing)
            ...utmParams,
            // Device & Browser info
            ...deviceInfo,
          },
        })

        console.log('📊 Analytics: Sesión iniciada con UTMs:', utmParams)

        console.log('📊 Analytics: Nueva sesión creada', newSessionId)
        return newSessionId
      },

      // =====================================================
      // TRACKING DE EVENTOS
      // =====================================================

      /**
       * Trackear evento
       * Agrega el evento a la queue para envío en batch
       * @param {Object} eventData - Datos del evento
       */
      track: (eventData) => {
        const state = get()

        if (!state.isEnabled) {
          console.log('⚠️ Analytics deshabilitado, evento no rastreado')
          return
        }

        const session_id = state.session_id || get().initSession()

        const event = {
          session_id,
          ...eventData,
          page_url: eventData.page_url || (typeof window !== 'undefined' ? window.location.href : ''),
          page_title: eventData.page_title || (typeof document !== 'undefined' ? document.title : ''),
          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
          timestamp: new Date().toISOString(),
        }

        // Agregar a queue
        set((state) => ({
          eventQueue: [...state.eventQueue, event],
          lastActivityTime: Date.now(),
        }))

        console.log(
          `📊 Evento agregado a queue: ${eventData.event_type} (${get().eventQueue.length} en queue)`
        )

        // Flush si hay 10+ eventos
        if (get().eventQueue.length >= 10) {
          console.log('📊 Queue llena, iniciando flush...')
          get().flush()
        }
      },

      // =====================================================
      // FLUSH DE EVENTOS AL BACKEND
      // =====================================================

      /**
       * Enviar eventos en batch al backend
       * Usa transacción para asegurar que todos los eventos se envían
       */
      flush: async () => {
        const state = get()
        const queue = state.eventQueue

        if (queue.length === 0) {
          return
        }

        if (state.isTracking) {
          console.log('⚠️ Ya hay un flush en progreso, esperando...')
          return
        }

        // Limpiar queue y marcar como tracking
        set({ eventQueue: [], isTracking: true })

        try {
          const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null

          console.log(`📊 Enviando ${queue.length} eventos al backend...`)

          // Enviar cada evento
          const promises = queue.map((event) =>
            fetch(`${API_URL}/analytics/track`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
              },
              body: JSON.stringify(event),
            })
          )

          await Promise.all(promises)

          console.log(`✅ Analytics: ${queue.length} eventos enviados exitosamente`)

          // Enviar eventos a Meta Pixel y Google Analytics 4 automáticamente
          queue.forEach((event) => {
            try {
              // Meta Pixel
              trackFromAnalytics(event)
            } catch (error) {
              console.warn('⚠️ Error enviando evento a Meta Pixel:', error)
              // No re-lanzar el error, solo logear
            }

            try {
              // Google Analytics 4
              trackGA4FromInternal(event)
            } catch (error) {
              console.warn('⚠️ Error enviando evento a GA4:', error)
              // No re-lanzar el error, solo logear
            }
          })
        } catch (error) {
          console.error('❌ Error enviando eventos:', error)

          // Re-agregar a la queue para retry
          set((state) => ({
            eventQueue: [...queue, ...state.eventQueue],
          }))

          console.log(`⚠️ ${queue.length} eventos re-agregados a queue para retry`)
        } finally {
          set({
            isTracking: false,
            lastActivityTime: Date.now(),
          })
        }
      },

      // =====================================================
      // CONFIGURACIÓN
      // =====================================================

      /**
       * Habilitar o deshabilitar tracking
       * @param {boolean} enabled - true para habilitar, false para deshabilitar
       */
      setEnabled: (enabled) => {
        set({ isEnabled: enabled })
        console.log(`📊 Analytics ${enabled ? 'habilitado' : 'deshabilitado'}`)

        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('analytics_disabled', enabled ? 'false' : 'true')
        }
      },

      /**
       * Limpiar queue de eventos
       */
      clearQueue: () => {
        set({ eventQueue: [] })
        console.log('📊 Queue de eventos limpiada')
      },

      /**
       * Obtener estado actual
       * @returns {Object} Estado completo
       */
      getState: () => {
        const state = get()
        return {
          session_id: state.session_id,
          isEnabled: state.isEnabled,
          queueLength: state.eventQueue.length,
          isTracking: state.isTracking,
          lastActivity: state.lastActivityTime,
        }
      },
    }),
    {
      name: 'analytics-storage',
      // Solo persistir estos campos
      partialize: (state) => ({
        session_id: state.session_id,
        isEnabled: state.isEnabled,
        lastActivityTime: state.lastActivityTime,
      }),
    }
  )
)

export default useAnalyticsStore
