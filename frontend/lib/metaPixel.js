/**
 * Utilidad para disparar eventos del Meta Pixel (Facebook Pixel)
 *
 * Documentación de eventos estándar:
 * https://developers.facebook.com/documentation/meta-pixel/reference#standard-events
 */

/**
 * Disparar evento de aplicación enviada
 * Se usa cuando un usuario completa el formulario de registro
 *
 * @param {Object} data - Datos opcionales del evento
 * @param {string} data.content_name - Nombre del contenido (ej: "Registro Artista")
 * @param {string} data.status - Estado de la aplicación (ej: "completed")
 */
export function trackSubmitApplication(data = {}) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'SubmitApplication', {
      content_name: data.content_name || 'Registro Artista ARTEFACTO',
      status: data.status || 'completed',
      ...data
    })
    console.log('📊 Meta Pixel: SubmitApplication tracked', data)
  } else {
    console.warn('Meta Pixel (fbq) no está disponible')
  }
}

/**
 * Disparar evento de contacto
 * Se usa cuando un usuario envía el formulario de contacto
 *
 * @param {Object} data - Datos opcionales del evento
 * @param {string} data.content_name - Nombre del contenido (ej: "Formulario Contacto")
 */
export function trackContact(data = {}) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Contact', {
      content_name: data.content_name || 'Formulario de Contacto ARTEFACTO',
      ...data
    })
    console.log('📊 Meta Pixel: Contact tracked', data)
  } else {
    console.warn('Meta Pixel (fbq) no está disponible')
  }
}

/**
 * Disparar evento personalizado
 *
 * @param {string} eventName - Nombre del evento
 * @param {Object} data - Datos del evento
 */
export function trackCustomEvent(eventName, data = {}) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('trackCustom', eventName, data)
    console.log(`📊 Meta Pixel: ${eventName} tracked`, data)
  } else {
    console.warn('Meta Pixel (fbq) no está disponible')
  }
}

/**
 * Disparar evento de vista de página (ya se dispara automáticamente)
 * Esta función es para casos especiales donde se necesita disparar manualmente
 */
export function trackPageView() {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'PageView')
    console.log('📊 Meta Pixel: PageView tracked')
  }
}

/**
 * Mapeo automático de eventos internos de analytics a eventos de Meta Pixel
 * Esto permite que los eventos rastreados internamente se envíen automáticamente a Meta Pixel
 */
const META_PIXEL_MAPPING = {
  // Conversiones
  'registro_complete': { event: 'SubmitApplication', type: 'standard' },
  'contact_submit': { event: 'Contact', type: 'standard' },

  // Interacciones importantes (custom events)
  'form_start': { event: 'FormStarted', type: 'custom' },
  'form_abandon': { event: 'Lead', type: 'standard' }, // Para remarketing
  'click': (metadata) => {
    // Solo trackear clicks importantes
    if (metadata?.important) {
      return { event: 'ButtonClick', type: 'custom' }
    }
    return null // No trackear clicks no importantes
  },

  // Engagement
  'registro_step_completed': (metadata) => {
    // Trackear solo ciertos pasos importantes
    if (metadata?.step_number === 5) {
      return { event: 'CompleteRegistration', type: 'standard' }
    }
    return null
  },

  // Eventos que NO se envían a Meta Pixel
  'page_view': null, // Ya se trackea automáticamente con el pixel
  'scroll_depth': null,
  'time_on_page': null,
  'error': null,
  'performance_warning': null,
}

/**
 * Trackear evento de analytics en Meta Pixel automáticamente
 * Usa el mapeo definido arriba para convertir eventos internos a eventos de Meta Pixel
 *
 * @param {Object} analyticsEvent - Evento del sistema de analytics interno
 */
export function trackFromAnalytics(analyticsEvent) {
  if (typeof window === 'undefined' || !window.fbq) {
    return // Meta Pixel no disponible
  }

  const eventType = analyticsEvent.event_type
  const mapping = META_PIXEL_MAPPING[eventType]

  // Si no hay mapeo, no hacer nada
  if (mapping === undefined) {
    return
  }

  // Si el mapeo es null, significa que no queremos trackear este evento
  if (mapping === null) {
    return
  }

  // Si el mapeo es una función, ejecutarla para obtener la configuración
  let config = mapping
  if (typeof mapping === 'function') {
    config = mapping(analyticsEvent.metadata)
    // Si la función retorna null, no trackear
    if (config === null) {
      return
    }
  }

  const { event, type } = config

  // Preparar datos para Meta Pixel
  const pixelData = {
    ...analyticsEvent.metadata,
    // Agregar datos estándar
    content_name: analyticsEvent.event_name || eventType,
    value: analyticsEvent.value,
  }

  // Remover datos internos que no queremos enviar a Meta
  delete pixelData.element_id
  delete pixelData.element_text

  // Trackear según el tipo
  if (type === 'standard') {
    window.fbq('track', event, pixelData)
    console.log(`📊 Meta Pixel: ${event} tracked (from analytics)`, pixelData)
  } else if (type === 'custom') {
    window.fbq('trackCustom', event, pixelData)
    console.log(`📊 Meta Pixel: ${event} custom tracked (from analytics)`, pixelData)
  }
}
