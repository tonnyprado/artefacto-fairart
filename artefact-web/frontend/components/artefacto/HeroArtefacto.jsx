'use client'; // (Next.js App Router; inofensivo en Vite/CRA)
import { useMemo } from 'react';
import { LETTERS } from './letters';
import { COLORS, FONTS } from './theme';

/*
  HeroArtefacto — hero full-screen con:
  - Fondo de letras ARTEFACTO (SVG individuales) en filas, hover que las desvanece
  - Animación de entrada tipo flip clock (onda diagonal)
  Props:
    links: [{ label, href, pos }] pos ∈ 'top-left'|'top-right'|'bottom-left'|'bottom-right'
    rows, cols: densidad del patrón (default 26 x 64)
*/

const DEFAULT_LINKS = [
  { label: 'Conoce Más', href: '#about', pos: 'top-left' },
  { label: 'Calendario', href: '#calendario', pos: 'top-right' },
  { label: 'Convocatoria', href: '#convocatoria', pos: 'bottom-left' },
  { label: 'Contacto', href: '#contacto', pos: 'bottom-right' },
];

// Alineadas a la cuadrícula de letras: fila 2 (top) y fila 23 (bottom) de 26.
// rowTop(r) = 0.8vh + r * 3.812vh  (padding + fila*(alto 3.1vh + gap 0.712vh))
const POS_STYLE = {
  'top-left':     { top: '8.42vh', left: 36 },
  'top-right':    { top: '8.42vh', right: 36 },
  'bottom-left':  { top: '88.48vh', left: 36 },
  'bottom-right': { top: '88.48vh', right: 36 },
};

export default function HeroArtefacto({ links = DEFAULT_LINKS, rows = 26, cols = 64, startAnimation = true, exitAnimation = false }) {

  // Data URIs de las 16 letras (una sola vez)
  const letterUrls = useMemo(
    () => Object.values(LETTERS).map((svg) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`),
    []
  );

  // Filas con letra + delay pseudo-aleatorio determinista (misma composición en cada render)
  const bgRows = useMemo(() => {
    let seed = 7;
    const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
    return Array.from({ length: rows }, (_, r) => ({
      offset: -Math.floor(rnd() * 60),
      letters: Array.from({ length: cols }, (_, i) => ({
        src: letterUrls[Math.floor(rnd() * letterUrls.length)],
        delay: +(0.2 + (r + i * 0.35) * 0.045 + rnd() * 0.5).toFixed(2),
      })),
    }));
  }, [letterUrls, rows, cols]);


  const getAnimation = (baseDelay) => {
    if (exitAnimation) return `flipOut 0.4s cubic-bezier(0.6,0.2,0.8,0.4) both`;
    if (startAnimation) return `flipIn 0.7s cubic-bezier(0.3,0.8,0.4,1) ${baseDelay}s both`;
    return 'none';
  };

  const navStyle = (pos) => ({
    position: 'absolute',
    zIndex: 2,
    color: COLORS.cream,
    fontFamily: FONTS.subtitle,
    fontWeight: FONTS.subtitleWeight,
    fontStyle: FONTS.subtitleStyle,
    fontSize: '3.1vh',
    height: '3.1vh',
    display: 'flex',
    alignItems: 'center',
    lineHeight: 1,
    textTransform: 'uppercase',
    letterSpacing: '0.01em',
    whiteSpace: 'nowrap',
    textDecoration: 'none',
    transformOrigin: 'center bottom',
    opacity: (!startAnimation && !exitAnimation) ? 0 : undefined,
    animation: getAnimation(2.4),
    backgroundColor: COLORS.red,
    padding: '8px 16px',
    borderRadius: '4px',
    ...POS_STYLE[pos],
  });

  return (
    <header id="hero" className="artefacto-hero"
      style={{ position: 'relative', height: '100vh', minHeight: 640, backgroundColor: COLORS.red, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '0.8vh 0', overflow: 'hidden', opacity: (!startAnimation && !exitAnimation) ? 0 : undefined }}>
        {bgRows.map((row, r) => (
          <div key={r} style={{ display: 'flex', gap: '0.35vh', height: '3.1vh', flex: 'none', marginLeft: row.offset, perspective: 600 }}>
            {row.letters.map((l, i) => {
              let letterAnim = 'none';
              if (exitAnimation) {
                letterAnim = `flipOut 0.4s cubic-bezier(0.6,0.2,0.8,0.4) ${l.delay * 0.3}s both`;
              } else if (startAnimation) {
                letterAnim = `flipIn 0.6s cubic-bezier(0.3,0.8,0.4,1) ${l.delay}s both`;
              }
              return (
                <img key={i} src={l.src} alt="" draggable={false} className="artefacto-letter"
                  style={{ height: '100%', width: 'auto', flex: 'none', transition: 'opacity 0.25s', userSelect: 'none', transformOrigin: 'center bottom', animation: letterAnim }} />
              );
            })}
          </div>
        ))}
      </div>

      {links.map((lnk, i) => (
        <a key={i} href={lnk.href} className="artefacto-navword" style={navStyle(lnk.pos)}>
          {lnk.label}
        </a>
      ))}

      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 2, display: 'flex', alignItems: 'center', gap: 'clamp(32px, 4vw, 64px)' }}>
        <div style={{
          color: COLORS.cream,
          fontFamily: FONTS.subtitle,
          fontWeight: FONTS.subtitleWeight,
          fontStyle: FONTS.subtitleStyle,
          fontSize: 'clamp(16px, 1.8vw, 24px)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          textAlign: 'right',
          lineHeight: 1.4,
          maxWidth: '200px',
          opacity: (!startAnimation && !exitAnimation) ? 0 : undefined,
          animation: getAnimation(3.2),
          transformOrigin: 'center bottom'
        }}>
          Convocatoria abierta<br />Agosto - Noviembre 2026
        </div>

        <div style={{ width: 'min(420px,42vw)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.4vh', opacity: (!startAnimation && !exitAnimation) ? 0 : undefined, animation: getAnimation(2.9), transformOrigin: 'center bottom' }}>
          <img src="/assets/wordmark-cream.svg" alt="ARTEFACTO" style={{ width: '100%', display: 'block' }} />
          <div style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            color: COLORS.cream,
            fontFamily: FONTS.subtitle,
            fontWeight: FONTS.subtitleWeight,
            fontStyle: FONTS.subtitleStyle,
            fontSize: 'clamp(14px,1.6vw,22px)',
            letterSpacing: '0.28em',
            textTransform: 'uppercase'
          }}>
            <span>Éticas</span><span>Creativas</span>
          </div>
        </div>
      </div>
    </header>
  );
}
