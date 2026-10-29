/**
 * Catálogo de Eventos de Analytics
 * Documentación completa de todos los eventos trackeados en la aplicación
 * Para uso del equipo de marketing y análisis de datos
 */

export const EVENT_CATEGORIES = {
  CONVERSION: 'Conversión',
  NAVIGATION: 'Navegación',
  INTERACTION: 'Interacción',
  FORM: 'Formularios',
  ERROR: 'Errores',
  ENGAGEMENT: 'Engagement',
  PERFORMANCE: 'Performance'
}

export const EVENTS_CATALOG = {
  // ==========================================
  // CONVERSIONES - Eventos críticos para Meta Pixel
  // ==========================================
  'registro_complete': {
    name: 'Registro Completado',
    category: EVENT_CATEGORIES.CONVERSION,
    description: 'Usuario completó el formulario de registro de artista exitosamente',
    meta_pixel: 'SubmitApplication',
    value: 'Alto - Conversión principal',
    marketing_use: 'Optimización de campañas de conversión, creación de Custom Audiences de artistas registrados',
    example_metadata: {
      paquete_tipo: 'premium',
      paquete_precio: 850,
      categoria: 'pintura',
      folio: 'ART-2024-001'
    }
  },

  'contact_submit': {
    name: 'Contacto Enviado',
    category: EVENT_CATEGORIES.CONVERSION,
    description: 'Usuario envió el formulario de contacto',
    meta_pixel: 'Contact',
    value: 'Medio - Lead generado',
    marketing_use: 'Remarketing a usuarios interesados, medición de interés en la convocatoria',
    example_metadata: {
      nombre: 'Juan Pérez',
      email: 'juan@example.com',
      asunto: 'Consulta sobre fechas'
    }
  },

  'paquete_selected': {
    name: 'Paquete Seleccionado',
    category: EVENT_CATEGORIES.CONVERSION,
    description: 'Usuario seleccionó un paquete en el paso 5 del registro',
    meta_pixel: 'AddToCart',
    value: 'Alto - Intención de compra',
    marketing_use: 'Remarketing a usuarios que no completaron, análisis de preferencias de paquetes',
    example_metadata: {
      paquete_id: 3,
      paquete_tipo: 'premium',
      precio: 850,
      espacio: '3x3 metros'
    }
  },

  // ==========================================
  // FORMULARIOS - Análisis del funnel
  // ==========================================
  'form_start': {
    name: 'Formulario Iniciado',
    category: EVENT_CATEGORIES.FORM,
    description: 'Usuario comenzó a llenar un formulario',
    meta_pixel: 'FormStarted',
    value: 'Medio - Intención inicial',
    marketing_use: 'Identificar abandono de formularios, optimizar remarketing',
    example_metadata: {
      form_name: 'registro_artista',
      page: '/registro'
    }
  },

  'form_abandon': {
    name: 'Formulario Abandonado',
    category: EVENT_CATEGORIES.FORM,
    description: 'Usuario abandonó el formulario antes de completarlo',
    meta_pixel: 'Lead',
    value: 'Alto - Oportunidad de remarketing',
    marketing_use: 'Remarketing urgente, análisis de puntos de fricción, A/B testing',
    example_metadata: {
      form_name: 'registro_artista',
      step: 3,
      last_field: 'telefono'
    }
  },

  'registro_start': {
    name: 'Registro Iniciado',
    category: EVENT_CATEGORIES.FORM,
    description: 'Usuario llegó a la página de registro',
    meta_pixel: 'InitiateCheckout',
    value: 'Alto - Entrada al funnel',
    marketing_use: 'Tasa de inicio de registro, efectividad de landing page',
    example_metadata: {
      referrer: 'instagram',
      utm_source: 'ig_story'
    }
  },

  'registro_step_completed': {
    name: 'Paso de Registro Completado',
    category: EVENT_CATEGORIES.FORM,
    description: 'Usuario completó un paso del formulario de registro',
    meta_pixel: null, // Solo paso 5 mapea a CompleteRegistration
    value: 'Medio - Progreso en funnel',
    marketing_use: 'Análisis de abandono por paso, optimización de UX',
    example_metadata: {
      step_number: 2,
      step_name: 'Información de Contacto',
      fields_filled: 5
    }
  },

  // ==========================================
  // NAVEGACIÓN - Comportamiento del usuario
  // ==========================================
  'page_view': {
    name: 'Vista de Página',
    category: EVENT_CATEGORIES.NAVIGATION,
    description: 'Usuario visitó una página del sitio',
    meta_pixel: 'PageView (automático)',
    value: 'Bajo - Tráfico general',
    marketing_use: 'Análisis de páginas populares, rutas de navegación, tiempo en sitio',
    example_metadata: {
      page_url: '/convocatoria',
      page_title: 'Convocatoria ARTEFACTO 2024',
      referrer: 'https://instagram.com'
    }
  },

  'scroll_depth': {
    name: 'Profundidad de Scroll',
    category: EVENT_CATEGORIES.ENGAGEMENT,
    description: 'Usuario hizo scroll en la página (25%, 50%, 75%, 100%)',
    meta_pixel: null,
    value: 'Bajo - Engagement con contenido',
    marketing_use: 'Medir engagement, identificar contenido relevante',
    example_metadata: {
      depth: 75,
      page_url: '/convocatoria'
    }
  },

  'time_on_page': {
    name: 'Tiempo en Página',
    category: EVENT_CATEGORIES.ENGAGEMENT,
    description: 'Tiempo que el usuario permaneció en una página',
    meta_pixel: null,
    value: 'Bajo - Engagement con contenido',
    marketing_use: 'Identificar páginas que retienen atención, optimizar contenido',
    example_metadata: {
      seconds: 45,
      page_url: '/registro'
    }
  },

  'session_start': {
    name: 'Sesión Iniciada',
    category: EVENT_CATEGORIES.NAVIGATION,
    description: 'Usuario inició una nueva sesión en el sitio',
    meta_pixel: null,
    value: 'Bajo - Tracking interno',
    marketing_use: 'Análisis de tráfico, fuentes de referencia, páginas de entrada',
    example_metadata: {
      referrer: 'https://google.com',
      landing_page: '/',
      utm_source: 'facebook'
    }
  },

  // ==========================================
  // INTERACCIONES - Clicks importantes
  // ==========================================
  'click': {
    name: 'Click',
    category: EVENT_CATEGORIES.INTERACTION,
    description: 'Usuario hizo click en un elemento rastreado',
    meta_pixel: 'ButtonClick (solo clicks importantes)',
    value: 'Variable - Según importancia',
    marketing_use: 'Análisis de CTR, efectividad de CTAs, mapas de calor',
    example_metadata: {
      element_id: 'btn_inscribirse',
      element_text: 'Inscríbete Ahora',
      important: true,
      location: 'hero_section'
    }
  },

  // ==========================================
  // ERRORES - Para optimización técnica
  // ==========================================
  'error': {
    name: 'Error',
    category: EVENT_CATEGORIES.ERROR,
    description: 'Ocurrió un error en la aplicación',
    meta_pixel: null,
    value: 'Crítico - Requiere atención',
    marketing_use: 'Identificar problemas que afectan conversión, priorizar fixes',
    example_metadata: {
      error_message: 'Network request failed',
      error_type: 'api_error',
      page: '/registro'
    }
  },

  'javascript_error': {
    name: 'Error de JavaScript',
    category: EVENT_CATEGORIES.ERROR,
    description: 'Error no capturado de JavaScript',
    meta_pixel: null,
    value: 'Alto - Bug crítico',
    marketing_use: 'Identificar bugs que afectan UX y conversión',
    example_metadata: {
      message: 'Cannot read property of undefined',
      filename: 'registro.js',
      lineno: 142
    }
  },

  'unhandled_rejection': {
    name: 'Promesa Rechazada',
    category: EVENT_CATEGORIES.ERROR,
    description: 'Promise rechazada no manejada',
    meta_pixel: null,
    value: 'Alto - Bug crítico',
    marketing_use: 'Identificar fallos asincrónicos que afectan UX',
    example_metadata: {
      reason: 'Request timeout',
      stack: '...'
    }
  },

  'performance_warning': {
    name: 'Advertencia de Performance',
    category: EVENT_CATEGORIES.PERFORMANCE,
    description: 'Página cargó lentamente (>3 segundos)',
    meta_pixel: null,
    value: 'Medio - Afecta UX',
    marketing_use: 'Optimizar páginas lentas para mejorar conversión',
    example_metadata: {
      pageLoadTime: 3500,
      url: '/registro'
    }
  }
}

/**
 * Obtener información de un evento
 * @param {string} eventType - Tipo de evento
 * @returns {Object|null} Información del evento o null si no existe
 */
export function getEventInfo(eventType) {
  return EVENTS_CATALOG[eventType] || null
}

/**
 * Obtener eventos por categoría
 * @param {string} category - Categoría de eventos
 * @returns {Array} Array de eventos en esa categoría
 */
export function getEventsByCategory(category) {
  return Object.entries(EVENTS_CATALOG)
    .filter(([_, info]) => info.category === category)
    .map(([type, info]) => ({ type, ...info }))
}

/**
 * Obtener eventos que se envían a Meta Pixel
 * @returns {Array} Array de eventos mapeados a Meta Pixel
 */
export function getMetaPixelEvents() {
  return Object.entries(EVENTS_CATALOG)
    .filter(([_, info]) => info.meta_pixel)
    .map(([type, info]) => ({ type, ...info }))
}

/**
 * Obtener todos los tipos de eventos
 * @returns {Array} Array con todos los tipos de eventos
 */
export function getAllEventTypes() {
  return Object.keys(EVENTS_CATALOG)
}

/**
 * Validar si un tipo de evento existe
 * @param {string} eventType - Tipo de evento
 * @returns {boolean} true si el evento existe
 */
export function isValidEventType(eventType) {
  return eventType in EVENTS_CATALOG
}
