'use client'; // (Next.js App Router; inofensivo en Vite/CRA)
import { useMemo, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { LETTERS_ARTEFACTO } from './letters';
import { COLORS, FONTS } from './theme';
import { useTextScrambleMultiple } from './useTextScramble';

/*
  HeroArtefacto — hero full-screen optimizado con:
  - Fondo de letras formando "ARTEFACTO" repetido en cada fila horizontal
  - Cada fila muestra las 9 letras en orden: A-R-T-E-F-A-C-T-O (repetido)
  - Letras de 5.5vh sin gap, completamente pegadas y compactas
  - Efecto de proximidad al mouse con spatial partitioning para mejor performance
  - Animación de entrada tipo flip clock (onda diagonal)
  - Logo y botones de navegación centrados juntos en medio de la pantalla
  - Texto de convocatoria "CONVOCATORIA ABIERTA AGO - NOV 2026" abajo centrado
  - OPTIMIZADO: Grid adaptativo (~540+ elementos) vs ~1600 original = 66% reducción
  Props:
    startAnimation: controla si se muestra la animación de entrada
    exitAnimation: controla si se muestra la animación de salida
    onOpenMenu: función callback (no se usa actualmente)
*/

export default function HeroArtefacto({ startAnimation = true, exitAnimation = false, onOpenMenu }) {
  const heroRef = useRef(null);

  // Calcular rows y cols dinámicamente basándose en el viewport
  // OPTIMIZADO: Letras medianas que forman "ARTEFACTO" en cada fila, adaptadas al viewport
  const calculateGridSize = () => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Altura de cada letra: 5.5vh sin gap = 5.5vh por fila
    const letterHeight = vh * 0.055; // 5.5vh en pixels
    const rows = Math.ceil(vh / letterHeight) + 2; // Filas necesarias con overflow

    // Calcular cuántas letras "ARTEFACTO" completas caben + algunas extras
    const letterWidth = letterHeight * 1.0; // Aspect ratio 1:1 aproximado
    const artefactoRepetitions = Math.ceil(vw / (letterWidth * 9)) + 2; // Repeticiones de ARTEFACTO
    const cols = 9 * artefactoRepetitions; // Total de letras (múltiplos de 9)

    return { rows, cols };
  };

  const [gridSize, setGridSize] = useState({ rows: 18, cols: 27 });

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

  // Botones de navegación
  const navButtons = [
    { label: 'Conoce Más', href: '#about' },
    { label: 'Calendario', href: '#calendario' },
    { label: 'Convocatoria', href: '#convocatoria' },
    { label: 'Contacto', href: '#contacto' },
  ];

  // Text scramble para botones de navegación
  const navScrambleRefs = useTextScrambleMultiple(navButtons.map(b => b.label), {
    duration: 600,
    staggerDelay: 100,
    initialDelay: 3200,
    trigger: startAnimation && !exitAnimation,
  });

  // Text scramble para el texto de convocatoria superior
  // Texto flipIn: delay 2.0s + duration 0.7s = termina a los 2.7s
  const convocatoriaScrambleRef = useTextScrambleMultiple(['Convocatoria abierta AGO - NOV 2O26'], {
    duration: 700,
    staggerDelay: 150,
    initialDelay: 2800, // Empezar después de que termine flipIn
    trigger: startAnimation && !exitAnimation,
  });

  // Text scramble para FEB y 2027
  // Logo flipIn: delay 2.9s + duration 0.7s = termina a los 3.6s
  const logoTextScrambleRefs = useTextScrambleMultiple(['FEB', '2027'], {
    duration: 600,
    staggerDelay: 120,
    initialDelay: 3700, // Empezar después de que termine flipIn (3.6s + 0.1s)
    trigger: startAnimation && !exitAnimation,
  });

  // Data URIs de ARTEFACTO (9 letras en orden)
  const letterUrls = useMemo(
    () => LETTERS_ARTEFACTO.map((svg) =>
      `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
    ),
    []
  );

  // Filas con letras en orden ARTEFACTO repetido
  const bgRows = useMemo(() => {
    let seed = 7;
    const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
    return Array.from({ length: rows }, (_, r) => ({
      offset: 0, // Sin offset para que queden alineadas
      letters: Array.from({ length: cols }, (_, i) => ({
        // Usar índice módulo 9 para repetir ARTEFACTO
        src: letterUrls[i % 9],
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
      const throttleMs = 50; // ~20fps para mejor rendimiento

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

  return (
    <>
      <style>{`
        .hero-center-container {
          position: fixed;
          top: 50vh;
          left: 50vw;
          transform: translate(-50%, -50%);
          z-index: 2;
          max-width: 90vw;
        }
        .hero-logo-container {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: clamp(12px, 1.5vh, 20px);
          width: clamp(280px, 30vw, 420px);
          flex-shrink: 0;
        }
        .hero-convocatoria-bottom {
          position: absolute;
          bottom: clamp(32px, 4vh, 56px);
          left: 50%;
          transform: translateX(-50%);
          z-index: 2;
        }
        .hero-nav-buttons {
          display: flex;
          flex-direction: column;
          gap: clamp(12px, 1.5vh, 20px);
          flex-shrink: 0;
          min-width: 200px;
        }
        .hero-nav-button {
          color: #F5F1E8;
          font-family: Agrandir, sans-serif;
          font-weight: 500;
          font-style: italic;
          font-size: clamp(16px, 1.8vw, 24px);
          text-transform: uppercase;
          letter-spacing: 0.01em;
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: none;
          display: block;
          white-space: nowrap;
        }
        .hero-nav-button:hover {
          font-style: normal;
          font-weight: 700;
          transform: translateX(8px);
          letter-spacing: 0.02em;
        }
        .hero-center-wrapper {
          display: flex;
          align-items: center;
          gap: clamp(40px, 5vw, 80px);
        }
        .hero-mobile-menu-button {
          display: none;
        }
        @media (max-width: 1024px) {
          .hero-center-wrapper {
            flex-direction: column;
            gap: clamp(20px, 3vh, 30px);
          }
          .hero-logo-container {
            width: min(280px, 75vw) !important;
          }
          .hero-nav-buttons {
            display: none !important;
          }
          .hero-mobile-menu-button {
            display: flex !important;
            margin-top: 20px;
            justify-content: center;
            align-items: center;
          }
          .hero-convocatoria-bottom {
            bottom: 20px !important;
            font-size: clamp(10px, 2.5vw, 14px) !important;
          }
        }
      `}</style>
      <header id="hero" className="artefacto-hero" ref={heroRef}
        style={{ position: 'relative', height: '100vh', minHeight: 640, backgroundColor: COLORS.red, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '0.1vh 0', overflow: 'hidden', opacity: (!startAnimation && !exitAnimation) ? 0 : undefined }}>
          {bgRows.map((row, r) => (
            <div key={r} style={{ display: 'flex', gap: '-1.2vh', height: '5.5vh', flex: 'none', marginLeft: row.offset, perspective: 600 }}>
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
                    style={{ height: '100%', width: 'auto', flex: 'none', userSelect: 'none', transformOrigin: 'center bottom', animation: letterAnim, willChange: 'transform' }}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* Texto de convocatoria en la parte inferior */}
        <div className="hero-convocatoria-bottom">
          <div style={{
            color: COLORS.cream,
            fontFamily: FONTS.subtitle,
            fontWeight: FONTS.subtitleWeight,
            fontStyle: FONTS.subtitleStyle,
            fontSize: 'clamp(14px, 1.6vw, 20px)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            textAlign: 'center',
            opacity: (!startAnimation && !exitAnimation) ? 0 : undefined,
            animation: getAnimation(2.0),
            transformOrigin: 'center'
          }}>
            <span ref={convocatoriaScrambleRef[0]?.ref}>Convocatoria abierta AGO - NOV 2O26</span>
          </div>
        </div>

        {/* Logo y botones centrados juntos en el medio de la pantalla */}
        <div className="hero-center-container">
          <div className="hero-center-wrapper" style={{
            opacity: (!startAnimation && !exitAnimation) ? 0 : undefined,
            animation: getAnimation(2.9),
            transformOrigin: 'center'
          }}>
            {/* Logo */}
            <div className="hero-logo-container">
              <img src="/assets/wordmark-cream.svg" alt="ARTEFACTO" style={{ width: '100%', display: 'block' }} />
              <div style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                color: COLORS.cream,
                fontFamily: FONTS.subtitle,
                fontWeight: FONTS.subtitleWeight,
                fontStyle: FONTS.subtitleStyle,
                fontSize: 'clamp(18px, 2vw, 28px)',
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                paddingLeft: '4px',
                paddingRight: '4px'
              }}>
                <span ref={logoTextScrambleRefs[0]?.ref}>FEB</span>
                <span ref={logoTextScrambleRefs[1]?.ref}>2027</span>
              </div>

              {/* Botón de menú móvil - solo visible en móvil */}
              <div className="hero-mobile-menu-button">
                <button
                  onClick={onOpenMenu}
                  aria-label="Menú"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'none',
                    padding: 0,
                    transition: 'transform 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <img src="/assets/star-cream.svg" alt="Menú" style={{ width: 50, height: 50, display: 'block' }} />
                </button>
              </div>
            </div>

            {/* Botones de navegación */}
            <div className="hero-nav-buttons">
              {navButtons.map((btn, i) => (
                <a
                  key={i}
                  href={btn.href}
                  className="hero-nav-button"
                >
                  <span ref={navScrambleRefs[i]?.ref}>{btn.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
