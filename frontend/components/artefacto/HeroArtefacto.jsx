'use client'; // (Next.js App Router; inofensivo en Vite/CRA)
import { useMemo, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { LETTERS } from './letters';
import { COLORS, FONTS } from './theme';
import { useTextScrambleMultiple } from './useTextScramble';

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

export default function HeroArtefacto({ links = DEFAULT_LINKS, startAnimation = true, exitAnimation = false }) {
  const heroRef = useRef(null);

  // Calcular rows y cols dinámicamente basándose en el viewport
  const calculateGridSize = () => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Altura de cada letra: 3.1vh, gap: 0.35vh = 3.45vh por fila
    const letterHeight = vh * 0.0345; // 3.45vh en pixels
    const rows = Math.ceil(vh / letterHeight) + 2; // +2 para overflow

    // Ancho aproximado de cada letra basado en aspect ratio del SVG
    const letterWidth = letterHeight * 0.8; // Aspect ratio aproximado
    const cols = Math.ceil(vw / letterWidth) + 10; // +10 para offset negativo

    return { rows, cols };
  };

  const [gridSize, setGridSize] = useState({ rows: 26, cols: 64 });

  useEffect(() => {
    // Calcular tamaño inicial
    setGridSize(calculateGridSize());

    // Recalcular en resize con debounce
    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        setGridSize(calculateGridSize());
      }, 200);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  const { rows, cols } = gridSize;

  // Text scramble para los botones de navegación
  // Botones flipIn: delay 2.4s + duration 0.7s = terminan a los 3.1s
  const navLabels = links.map(link => link.label);
  const navScrambleRefs = useTextScrambleMultiple(navLabels, {
    duration: 600,
    staggerDelay: 100,
    initialDelay: 3200, // Empezar después de que termine flipIn (3.1s + 0.1s)
    trigger: startAnimation && !exitAnimation,
  });

  // Text scramble para el texto de convocatoria
  // Texto flipIn: delay 3.2s + duration 0.7s = termina a los 3.9s
  const convocatoriaScrambleRefs = useTextScrambleMultiple(['Convocatoria abierta', 'Agosto - Noviembre 2026'], {
    duration: 700,
    staggerDelay: 150,
    initialDelay: 4000, // Empezar después de que termine flipIn (3.9s + 0.1s)
    trigger: startAnimation && !exitAnimation,
  });

  // Text scramble para Éticas y Creativas
  // Logo flipIn: delay 2.9s + duration 0.7s = termina a los 3.6s
  const logoTextScrambleRefs = useTextScrambleMultiple(['Éticas', 'Creativas'], {
    duration: 600,
    staggerDelay: 120,
    initialDelay: 3700, // Empezar después de que termine flipIn (3.6s + 0.1s)
    trigger: startAnimation && !exitAnimation,
  });

  // Data URIs solo de A, R, T, E (letras 53, 54, 55, 56)
  const letterUrls = useMemo(
    () => [53, 54, 55, 56].map((id) =>
      `data:image/svg+xml;utf8,${encodeURIComponent(LETTERS[id])}`
    ),
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

  // Efecto de proximidad con el mouse (SPATIAL PARTITIONING)
  useEffect(() => {
    if (!heroRef.current || exitAnimation) return;

    // Esperar a que terminen las animaciones de entrada
    const delay = startAnimation ? 2500 : 0;

    const timeoutId = setTimeout(() => {
      const letters = gsap.utils.toArray('.artefacto-letter');

      // IMPORTANTE: Limpiar las animaciones CSS y resetear transforms
      letters.forEach((letter) => {
        letter.style.animation = 'none';
        gsap.set(letter, { clearProps: 'all' });
      });

      // Spatial partitioning: dividir la pantalla en grid
      const cellSize = 200; // Tamaño de cada celda
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const gridCols = Math.ceil(vw / cellSize);
      const gridRows = Math.ceil(vh / cellSize);
      const spatialGrid = {};

      // Cachear posiciones y asignar a celdas del spatial grid
      const letterData = letters.map((letter) => {
        const r = letter.getBoundingClientRect();
        const x = r.left + r.width / 2;
        const y = r.top + r.height / 2;

        // Calcular celda del grid
        const gridX = Math.floor(x / cellSize);
        const gridY = Math.floor(y / cellSize);
        const cellKey = `${gridX},${gridY}`;

        // Agregar a spatial grid
        if (!spatialGrid[cellKey]) spatialGrid[cellKey] = [];
        const data = { element: letter, x, y };
        spatialGrid[cellKey].push(data);

        return data;
      });

      const radius = 150;
      const maxScale = 2.5;
      const dur = 0.35;
      let rafId = null;
      const affectedLetters = new Set();
      let lastTime = 0;
      const throttleMs = 32; // ~30fps

      const handleMouseMove = (e) => {
        const now = performance.now();
        if (rafId || (now - lastTime) < throttleMs) return;

        lastTime = now;
        rafId = requestAnimationFrame(() => {
          const mx = e.clientX;
          const my = e.clientY;
          const currentAffected = new Set();

          // Calcular qué celdas del grid están cerca del cursor
          const mouseCellX = Math.floor(mx / cellSize);
          const mouseCellY = Math.floor(my / cellSize);
          const radiusSquared = radius * radius;

          // Solo checkear celdas vecinas (3x3 grid alrededor del cursor)
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const cellKey = `${mouseCellX + dx},${mouseCellY + dy}`;
              const cellLetters = spatialGrid[cellKey];

              if (!cellLetters) continue;

              cellLetters.forEach(({ element, x, y }) => {
                const deltaX = mx - x;
                const deltaY = my - y;
                const dSquared = deltaX * deltaX + deltaY * deltaY;

                if (dSquared < radiusSquared) {
                  const d = Math.sqrt(dSquared);
                  const p = gsap.utils.clamp(0, 1, gsap.utils.mapRange(0, radius, 1, 0, d));
                  gsap.to(element, {
                    scale: 1 + (maxScale - 1) * p,
                    overwrite: 'auto',
                    ease: 'power2.out',
                    duration: 0.15
                  });
                  currentAffected.add(element);
                }
              });
            }
          }

          // Resetear letras que ya no están afectadas
          affectedLetters.forEach((letter) => {
            if (!currentAffected.has(letter)) {
              gsap.to(letter, {
                scale: 1,
                duration: 0.25,
                overwrite: 'auto',
                ease: 'power2.out'
              });
            }
          });

          affectedLetters.clear();
          currentAffected.forEach((letter) => affectedLetters.add(letter));

          rafId = null;
        });
      };

      const handleMouseLeave = () => {
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }

        affectedLetters.forEach((letter) => {
          gsap.to(letter, {
            scale: 1,
            duration: dur * 2,
            overwrite: 'auto',
            ease: 'power2.out'
          });
        });
        affectedLetters.clear();
      };

      const hero = heroRef.current;
      if (hero) {
        hero.addEventListener('mousemove', handleMouseMove, { passive: true });
        hero.addEventListener('mouseleave', handleMouseLeave);
      }

      return () => {
        if (rafId) cancelAnimationFrame(rafId);
        if (hero) {
          hero.removeEventListener('mousemove', handleMouseMove);
          hero.removeEventListener('mouseleave', handleMouseLeave);
        }
      };
    }, delay);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [exitAnimation, startAnimation, rows, cols]);

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
    <>
      <style>{`
        .artefacto-navword {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .artefacto-navword:hover {
          font-style: normal !important;
          font-weight: 700 !important;
          transform: translateY(-2px);
          letter-spacing: 0.02em;
        }
      `}</style>
      <header id="hero" className="artefacto-hero" ref={heroRef}
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
                  <img
                    key={i}
                    src={l.src}
                    alt=""
                    draggable={false}
                    className="artefacto-letter"
                    style={{ height: '100%', width: 'auto', flex: 'none', userSelect: 'none', transformOrigin: 'center bottom', animation: letterAnim }}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {links.map((lnk, i) => (
          <a key={i} href={lnk.href} className="artefacto-navword" style={navStyle(lnk.pos)}>
            <span ref={navScrambleRefs[i]?.ref}>{lnk.label}</span>
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
          <span ref={convocatoriaScrambleRefs[0]?.ref}>Convocatoria abierta</span><br />
          <span ref={convocatoriaScrambleRefs[1]?.ref}>Agosto - Noviembre 2026</span>
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
            <span ref={logoTextScrambleRefs[0]?.ref}>Éticas</span>
            <span ref={logoTextScrambleRefs[1]?.ref}>Creativas</span>
          </div>
        </div>
      </div>
      </header>
    </>
  );
}
