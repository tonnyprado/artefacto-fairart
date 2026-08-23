'use client';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { COLORS, FONTS } from './theme';
import { useTextScrambleMultiple } from './useTextScramble';

// Helper para detectar dispositivos táctiles
const isTouchDevice = () => {
  if (typeof window === 'undefined') return false;
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    /iPad|iPhone|iPod|Android/i.test(navigator.userAgent)
  );
};

// Helper para detectar tablets específicamente
const isTabletDevice = () => {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent;
  return /iPad|Android(?!.*Mobile)/i.test(ua) ||
         (navigator.maxTouchPoints > 1 && window.innerWidth >= 768 && window.innerWidth <= 1366);
};

export default function HeroArtefacto({ startAnimation = true, exitAnimation = false, onOpenMenu }) {
  const heroRef = useRef(null);
  const svgContainerRef = useRef(null);
  const [svgData, setSvgData] = useState(null);
  const [isTouch, setIsTouch] = useState(false);

  // Detectar si es dispositivo táctil
  useEffect(() => {
    setIsTouch(isTouchDevice());
  }, []);

  // Cargar SVG - optimizado para tablets
  useEffect(() => {
    const isTablet = isTabletDevice();

    fetch('/assets/fondohero1.svg')
      .then(res => res.text())
      .then(text => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'image/svg+xml');
        const svg = doc.querySelector('svg');
        if (svg) {
          // Seed para random determinístico
          let seed = 7;
          const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;

          // Extraer coordenadas iniciales de cada path
          let pathsData = Array.from(svg.querySelectorAll('path')).map((p) => {
            const d = p.getAttribute('d');
            const match = d.match(/M([\d.]+)[,\s]([\d.]+)/);
            const x = match ? parseFloat(match[1]) : 0;
            const y = match ? parseFloat(match[2]) : 0;
            return { d, x, y };
          });

          // Encontrar bounds para normalizar
          const minX = Math.min(...pathsData.map(p => p.x));
          const maxX = Math.max(...pathsData.map(p => p.x));
          const minY = Math.min(...pathsData.map(p => p.y));
          const maxY = Math.max(...pathsData.map(p => p.y));

          // Calcular delays basados en posición (onda diagonal)
          const paths = pathsData.map(({ d, x, y }) => {
            const normX = maxX > minX ? (x - minX) / (maxX - minX) : 0;
            const normY = maxY > minY ? (y - minY) / (maxY - minY) : 0;
            const delay = +(0.2 + (normY * 20 + normX * 7) * 0.045 + rnd() * 0.5).toFixed(2);
            return { d, delay };
          });

          setSvgData({
            viewBox: svg.getAttribute('viewBox'),
            paths
          });
        }
      });
  }, []);

  // Efecto de proximidad con el mouse - OPTIMIZADO con spatial partitioning
  // DESACTIVADO en dispositivos táctiles para mejor rendimiento
  useEffect(() => {
    // En tablets/móviles, no ejecutar este efecto - mejora significativa de rendimiento
    if (isTouch || !svgContainerRef.current || !svgData || exitAnimation) return;

    const delay = startAnimation ? 2500 : 0;
    let cleanup = () => {};

    const timeoutId = setTimeout(() => {
      const paths = Array.from(document.querySelectorAll('.artefacto-path'));
      if (paths.length === 0) return;

      // Limpiar animaciones CSS
      paths.forEach((path) => {
        path.style.animation = 'none';
      });

      // Spatial partitioning: dividir pantalla en celdas para búsqueda O(1)
      const cellSize = 200;
      const spatialGrid = {};

      // Cachear posiciones una sola vez
      const pathData = paths.map((path) => {
        const rect = path.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        // Agregar a grid espacial
        const cellX = Math.floor(x / cellSize);
        const cellY = Math.floor(y / cellSize);
        const key = `${cellX},${cellY}`;
        if (!spatialGrid[key]) spatialGrid[key] = [];

        const data = { path, x, y };
        spatialGrid[key].push(data);
        return data;
      });

      const radius = 150;
      const maxScale = 2.5;
      const radiusSq = radius * radius;
      let rafId = null;
      let lastTime = 0;
      const throttleMs = 40; // ~25fps
      const scaledPaths = new Set();

      const handleMouseMove = (e) => {
        const now = performance.now();
        if (rafId || (now - lastTime) < throttleMs) return;
        lastTime = now;

        rafId = requestAnimationFrame(() => {
          const mx = e.clientX;
          const my = e.clientY;
          const currentScaled = new Set();

          // Solo revisar celdas cercanas al mouse (3x3)
          const cellX = Math.floor(mx / cellSize);
          const cellY = Math.floor(my / cellSize);

          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const key = `${cellX + dx},${cellY + dy}`;
              const cell = spatialGrid[key];
              if (!cell) continue;

              cell.forEach(({ path, x, y }) => {
                const distSq = (mx - x) ** 2 + (my - y) ** 2;
                if (distSq < radiusSq) {
                  const dist = Math.sqrt(distSq);
                  const scale = 1 + (maxScale - 1) * (1 - dist / radius);
                  path.style.transform = `scale(${scale})`;
                  currentScaled.add(path);
                }
              });
            }
          }

          // Resetear paths que ya no están cerca
          scaledPaths.forEach((path) => {
            if (!currentScaled.has(path)) {
              path.style.transform = 'scale(1)';
            }
          });

          scaledPaths.clear();
          currentScaled.forEach(p => scaledPaths.add(p));
          rafId = null;
        });
      };

      const handleMouseLeave = () => {
        if (rafId) cancelAnimationFrame(rafId);
        scaledPaths.forEach((path) => {
          path.style.transform = 'scale(1)';
        });
        scaledPaths.clear();
      };

      const hero = heroRef.current;
      if (hero) {
        hero.addEventListener('mousemove', handleMouseMove, { passive: true });
        hero.addEventListener('mouseleave', handleMouseLeave);
      }

      cleanup = () => {
        if (rafId) cancelAnimationFrame(rafId);
        if (hero) {
          hero.removeEventListener('mousemove', handleMouseMove);
          hero.removeEventListener('mouseleave', handleMouseLeave);
        }
      };
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      cleanup();
    };
  }, [svgData, exitAnimation, startAnimation, isTouch]);

  // Botones de navegación
  const navButtons = [
    { label: 'Conoce Más', href: '#about' },
    { label: 'Calendario', href: '#calendario' },
    { label: 'Convocatoria', href: '#convocatoria' },
    { label: 'Contacto', href: '#contacto' },
  ];

  const navScrambleRefs = useTextScrambleMultiple(navButtons.map(b => b.label), {
    duration: 600,
    staggerDelay: 100,
    initialDelay: 3200,
    trigger: startAnimation && !exitAnimation,
  });

  const convocatoriaScrambleRef = useTextScrambleMultiple(['Convocatoria abierta AGO - NOV 2O26'], {
    duration: 700,
    staggerDelay: 150,
    initialDelay: 2800,
    trigger: startAnimation && !exitAnimation,
  });

  const logoTextScrambleRefs = useTextScrambleMultiple(['FEB', '2027'], {
    duration: 600,
    staggerDelay: 120,
    initialDelay: 3700,
    trigger: startAnimation && !exitAnimation,
  });

  const getAnimation = (baseDelay) => {
    if (exitAnimation) return `flipOut 0.4s cubic-bezier(0.6,0.2,0.8,0.4) both`;
    if (startAnimation) return `flipIn 0.7s cubic-bezier(0.3,0.8,0.4,1) ${baseDelay}s both`;
    return 'none';
  };

  const getPathAnimation = (delay) => {
    if (exitAnimation) return `flipOut 0.4s cubic-bezier(0.6,0.2,0.8,0.4) ${delay * 0.3}s both`;
    if (startAnimation) return `flipIn 0.6s cubic-bezier(0.3,0.8,0.4,1) ${delay}s both`;
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
          cursor: inherit;
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
        .hero-svg-container {
          position: absolute;
          inset: 0;
          overflow: hidden;
          perspective: 600px;
        }
        .hero-svg-container svg {
          width: 150%;
          height: 150%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
        .artefacto-path {
          fill: #7a2020;
          transform-box: fill-box;
          transform-origin: center bottom;
          will-change: transform;
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
            width: 100%;
          }
          .hero-convocatoria-bottom {
            bottom: 20px !important;
            font-size: clamp(10px, 2.5vw, 14px) !important;
          }
        }
      `}</style>
      <header id="hero" className="artefacto-hero" ref={heroRef}
        style={{
          position: 'relative',
          height: '100vh',
          minHeight: 640,
          backgroundColor: COLORS.red,
          overflow: 'hidden'
        }}>

        {/* SVG Background con paths individuales */}
        <div
          ref={svgContainerRef}
          className="hero-svg-container"
          style={{ opacity: (!startAnimation && !exitAnimation) ? 0 : undefined }}
        >
          {svgData && (
            <svg viewBox={svgData.viewBox} preserveAspectRatio="xMidYMid slice">
              {svgData.paths.map((p, i) => (
                <path
                  key={i}
                  d={p.d}
                  className="artefacto-path"
                  style={{ animation: getPathAnimation(p.delay) }}
                />
              ))}
            </svg>
          )}
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

          <div style={{
            marginTop: '12px',
            color: COLORS.cream,
            fontFamily: FONTS.subtitle,
            fontWeight: 300,
            fontSize: 'clamp(10px, 1.2vw, 14px)',
            letterSpacing: '0.15em',
            textTransform: 'lowercase',
            textAlign: 'center',
            opacity: (!startAnimation && !exitAnimation) ? 0 : undefined,
            animation: getAnimation(2.0),
            transformOrigin: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px'
          }}>
            <span>scroll</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 2L6 10M6 10L3 7M6 10L9 7" stroke={COLORS.cream} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Logo y botones centrados */}
        <div className="hero-center-container">
          <div className="hero-center-wrapper" style={{
            opacity: (!startAnimation && !exitAnimation) ? 0 : undefined,
            animation: getAnimation(2.9),
            transformOrigin: 'center'
          }}>
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

              <div className="hero-mobile-menu-button">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onOpenMenu();
                  }}
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
                  <img src="/assets/x-blanca.svg" alt="Menú" style={{ width: 70, height: 70, display: 'block' }} />
                </button>
              </div>
            </div>

            <div className="hero-nav-buttons">
              {navButtons.map((btn, i) => (
                <a key={i} href={btn.href} className="hero-nav-button">
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
