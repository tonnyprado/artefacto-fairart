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
