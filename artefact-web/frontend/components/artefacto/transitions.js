/*
  transitions.js — Utilidades para manejar diferentes tipos de transiciones entre secciones

  Tipos de transición:
  - "flip-clock": Transición con overlay de letras animadas (usado para hero)
  - "scroll": Transición suave scroll-to-next-page (usado entre otras secciones)
*/

export const TRANSITION_TYPES = {
  FLIP_CLOCK: 'flip-clock',
  SCROLL: 'scroll',
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

  // Para todas las demás transiciones, usar scroll
  return TRANSITION_TYPES.SCROLL;
}

/**
 * Obtiene los timings para un tipo de transición
 * @param {string} type - Tipo de transición
 * @returns {object} - Objeto con timings { out, in, total }
 */
export function getTransitionTimings(type) {
  return TRANSITION_TIMINGS[type] || TRANSITION_TIMINGS['flip-clock'];
}
