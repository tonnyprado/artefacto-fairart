/*
  transitions.js — Utilidades para manejar diferentes tipos de transiciones entre secciones

  Tipos de transición:
  - "flip-clock": Transición con overlay de letras animadas (usado para hero)
  - "scroll": Transición suave scroll-to-next-page (usado entre otras secciones)
  - "curved-wipe": Transición tipo OSMO con barrido curvo (usado entre secciones intermedias)
*/

export const TRANSITION_TYPES = {
  FLIP_CLOCK: 'flip-clock',
  SCROLL: 'scroll',
  CURVED_WIPE: 'curved-wipe',
};

export const TRANSITION_TIMINGS = {
  'flip-clock': {
    out: 700,      // Tiempo antes de cambiar de sección (reducido de 950ms)
    in: 900,       // Tiempo después de cambiar de sección (reducido de 1200ms)
    total: 1600,   // Tiempo total de la transición (reducido de 2150ms)
  },
  'scroll': {
    out: 550,      // Tiempo de preview peek (400ms + 150ms pausa)
    in: 700,       // Tiempo de subida completa
    total: 1250,   // Tiempo total de la transición
  },
  'curved-wipe': {
    out: 800,      // Tiempo del barrido curvo entrante
    in: 700,       // Tiempo del barrido curvo saliente
    total: 1500,   // Tiempo total de la transición
  },
};

/**
 * Determina qué tipo de transición usar según origen y destino
 * @param {string} from - Sección actual
 * @param {string} to - Sección destino
 * @returns {string} - Tipo de transición a usar
 */
export function getTransitionType(from, to) {
  // Si viene desde o va hacia hero, usar flip-clock
  if (from === 'hero' || to === 'hero') {
    return TRANSITION_TYPES.FLIP_CLOCK;
  }

  // Para transiciones entre secciones intermedias (X → X), usar curved-wipe
  return TRANSITION_TYPES.CURVED_WIPE;
}

/**
 * Obtiene los timings para un tipo de transición
 * @param {string} type - Tipo de transición
 * @returns {object} - Objeto con timings { out, in, total }
 */
export function getTransitionTimings(type) {
  return TRANSITION_TIMINGS[type] || TRANSITION_TIMINGS['flip-clock'];
}
