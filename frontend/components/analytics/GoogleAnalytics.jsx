'use client'

import Script from 'next/script'
import { useEffect } from 'react'
import useAnalyticsStore from '@/stores/analyticsStore'

/**
 * Google Analytics 4 Integration
 *
 * Características:
 * - Carga el script de GA4
 * - Sincroniza eventos con nuestro sistema interno
 * - Trackea pageviews automáticamente
 * - Mapea conversiones a eventos de GA4
 *
 * Configuración:
 * 1. Crear una propiedad GA4 en https://analytics.google.com
 * 2. Obtener el Measurement ID (formato: G-XXXXXXXXXX)
 * 3. Agregar el ID a las variables de entorno: NEXT_PUBLIC_GA_MEASUREMENT_ID
 */

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

/**
 * Mapeo de eventos internos a eventos de GA4
 *
 * Eventos estándar de GA4:
 * - page_view (automático)
 * - generate_lead (formularios, contacto)
 * - begin_checkout (selección de paquete)
 * - purchase (registro completado)
 * - view_item (ver página específica)
 * - select_content (clicks importantes)
 */
const EVENT_MAPPING = {
  // Conversiones
  'registro_complete': {
    ga4_event: 'purchase',
    params: (metadata) => ({
      currency: 'MXN',
      value: metadata?.paquete_precio || 0,
      transaction_id: metadata?.folio || `reg_${Date.now()}`,
      items: [{
        item_id: metadata?.paquete_id || 'unknown',
        item_name: metadata?.paquete_tipo || 'Paquete',
        price: metadata?.paquete_precio || 0,
        quantity: 1
      }]
    })
  },
  'contact_submit': {
    ga4_event: 'generate_lead',
    params: (metadata) => ({
      currency: 'MXN',
      value: 0
    })
  },
  'paquete_selected': {
    ga4_event: 'begin_checkout',
    params: (metadata) => ({
      currency: 'MXN',
      value: metadata?.precio || 0,
      items: [{
        item_id: metadata?.paquete_id || 'unknown',
        item_name: metadata?.tipo || 'Paquete',
        price: metadata?.precio || 0,
        quantity: 1
      }]
    })
  },

  // Formularios
  'form_start': {
    ga4_event: 'generate_lead',
    params: (metadata) => ({
      form_name: metadata?.form_name || 'unknown',
      lead_type: 'form_start'
    })
  },
  'form_abandon': {
    ga4_event: 'generate_lead',
    params: (metadata) => ({
      form_name: metadata?.form_name || 'unknown',
      step: metadata?.step || 0,
      lead_type: 'form_abandon'
    })
  },

  // Interacciones importantes
  'click': {
    ga4_event: 'select_content',
    params: (metadata) => ({
      content_type: 'button',
      item_id: metadata?.element_id || 'unknown'
    })
  },

  // Engagement
  'scroll_depth': {
    ga4_event: 'scroll',
    params: (metadata) => ({
      percent_scrolled: metadata?.depth || 0
    })
  }
}

/**
 * Enviar evento a Google Analytics 4
 * @param {string} eventName - Nombre del evento GA4
 * @param {object} params - Parámetros del evento
 */
export function trackGA4Event(eventName, params = {}) {
  if (typeof window === 'undefined' || !window.gtag) {
    return
  }

  if (!GA_MEASUREMENT_ID) {
    console.warn('⚠️ GA4: Measurement ID no configurado')
    return
  }

  window.gtag('event', eventName, params)
  console.log(`📊 GA4: ${eventName}`, params)
}

/**
 * Enviar pageview a GA4
 * @param {string} url - URL de la página
 * @param {string} title - Título de la página
 */
export function trackGA4PageView(url, title) {
  trackGA4Event('page_view', {
    page_location: url,
    page_title: title
  })
}

/**
 * Convertir evento interno a evento GA4
 * @param {object} event - Evento del sistema interno
 */
export function trackGA4FromInternal(event) {
  const mapping = EVENT_MAPPING[event.event_type]

  if (!mapping) {
    // No hay mapeo para este tipo de evento
    return
  }

  const params = mapping.params(event.metadata || {})
  trackGA4Event(mapping.ga4_event, params)
}

export default function GoogleAnalytics() {
  // Si no hay Measurement ID, no renderizar nada
  if (!GA_MEASUREMENT_ID) {
    console.warn('⚠️ Google Analytics 4 no configurado. Agrega NEXT_PUBLIC_GA_MEASUREMENT_ID a .env.local')
    return null
  }

  useEffect(() => {
    // Inicializar GA4
    if (window.gtag) {
      window.gtag('js', new Date())
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: window.location.pathname,
        send_page_view: true
      })
      console.log('📊 GA4 inicializado:', GA_MEASUREMENT_ID)
    }
  }, [])

  return (
    <>
      {/* Google Analytics Script */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />

      {/* Google Analytics Config */}
      <Script
        id="google-analytics-config"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
              send_page_view: true
            });
          `,
        }}
      />
    </>
  )
}
