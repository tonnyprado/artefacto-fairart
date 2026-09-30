// Tokens de marca ARTE FACTO usados por la feature. Si tu plataforma ya tiene
// tema (styled-components, Tailwind, CSS vars), mapea estos valores ahí.

export const color = {
  rojo: '#B93232',
  rojoOscuro: '#8E2525',
  vino: '#730000',
  crema: '#E8DED0',
  cremaPapel: '#F6F1E9',
  negro: '#000000',
  blanco: '#FFFFFF',
  tinta: '#111111',
  linea: 'rgba(0,0,0,0.12)',
  texto2: 'rgba(0,0,0,0.65)',
  whatsapp: '#25D366',
};

export const fuente = {
  sans: "'Inter Tight', sans-serif",
  serif: "'EB Garamond', serif",
  mono: 'ui-monospace, Menlo, monospace',
};

// Google Fonts (agregar al <head> de tu index.html):
// https://fonts.googleapis.com/css2?family=Inter+Tight:ital,wght@0,400;0,600;0,700;0,800;0,900;1,700;1,800;1,900&family=EB+Garamond:ital@1&display=swap

export const titularGrande = {
  margin: 0, fontFamily: fuente.sans, fontWeight: 900, fontStyle: 'italic', textTransform: 'uppercase',
  fontSize: 'clamp(24px,4.5vw,36px)', letterSpacing: '-0.03em', lineHeight: 0.95,
};

export const numeroPaso = {
  fontWeight: 900, fontStyle: 'italic', fontSize: 'clamp(54px,9vw,84px)', lineHeight: 0.9,
  letterSpacing: '-0.05em', color: color.rojo, opacity: 0.35,
};

export const tarjeta = {
  background: color.blanco, border: `1px solid ${color.linea}`, borderRadius: 10,
};

/**
 * @param {boolean} [deshabilitado=false]
 * @returns {Object}
 */
export function botonPrimario(deshabilitado = false) {
  return {
    background: deshabilitado ? 'rgba(0,0,0,0.25)' : color.rojo, color: color.crema, border: 'none',
    borderRadius: 10, padding: '13px 28px', fontWeight: 800, fontStyle: 'italic', textTransform: 'uppercase',
    fontSize: 15, letterSpacing: '-0.02em', cursor: deshabilitado ? 'not-allowed' : 'pointer', fontFamily: fuente.sans,
  };
}

export const botonSecundario = {
  background: 'transparent', color: color.negro, border: `1.5px solid ${color.negro}`, borderRadius: 10,
  padding: '13px 24px', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: fuente.sans,
};

export const degradadoMarca = `linear-gradient(90deg, ${color.negro} 0%, ${color.rojo} 55%, ${color.rojo} 100%)`;
export const degradadoHero = `linear-gradient(160deg, ${color.negro} 0%, ${color.rojo} 55%, ${color.crema} 115%)`;
