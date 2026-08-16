'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { COLORS } from './theme';

/*
  SectionWaveTransition — Transición de onda curva con nombre de sección

  Dos fases:
  1. 'preview': Bloque aparece desde el borde con el nombre + instrucción "desliza"
  2. 'fullscreen': El bloque se expande empujando toda la pantalla

  Props:
    phase: 'preview' | 'fullscreen' | null
    direction: 'up' | 'down' - dirección del scroll
    targetSection: string - nombre de la sección destino
    targetColor: string - color de la sección destino
    onFullscreenComplete: callback cuando termina la expansión a fullscreen
*/

export default function SectionWaveTransition({
  phase,
  direction = 'down',
  targetSection,
  targetColor,
  onFullscreenComplete,
}) {
  const containerRef = useRef(null);
  const waveRef = useRef(null);
  const contentRef = useRef(null);
  const hintRef = useRef(null);
  const lastPhase = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !waveRef.current || !contentRef.current) return;

    const container = containerRef.current;
    const wave = waveRef.current;
    const content = contentRef.current;
    const hint = hintRef.current;
    const isDown = direction === 'down';

    // Evitar re-animaciones innecesarias
    if (phase === lastPhase.current) return;
    lastPhase.current = phase;

    if (phase === 'preview') {
      // Kill any existing animations
      gsap.killTweensOf([container, wave, content, hint]);

      // Setup inicial
      gsap.set(container, {
        display: 'block',
        opacity: 1,
      });

      gsap.set(wave, {
        backgroundColor: targetColor || COLORS.cream,
        [isDown ? 'bottom' : 'top']: 0,
        [isDown ? 'top' : 'bottom']: 'auto',
        height: '0px',
      });

      gsap.set(content, {
        opacity: 0,
        y: isDown ? 30 : -30,
      });

      if (hint) {
        gsap.set(hint, {
          opacity: 0,
          y: isDown ? 20 : -20,
        });
      }

      // Animación de entrada del preview
      const tl = gsap.timeline();

      tl.to(wave, {
        height: '180px',
        duration: 0.5,
        ease: 'power3.out',
      })
      .to(content, {
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: 'power2.out',
      }, '-=0.3')
      .to(hint, {
        opacity: 1,
        y: 0,
        duration: 0.3,
        ease: 'power2.out',
      }, '-=0.2');

    } else if (phase === 'fullscreen') {
      // Kill any existing animations
      gsap.killTweensOf([container, wave, content, hint]);

      // Ocultar hint y expandir
      const tl = gsap.timeline({
        onComplete: () => {
          onFullscreenComplete?.();
        }
      });

      // Ocultar instrucción
      tl.to(hint, {
        opacity: 0,
        duration: 0.15,
        ease: 'power2.in',
      })
      // Expandir wave a pantalla completa
      .to(wave, {
        height: '100vh',
        duration: 0.6,
        ease: 'power2.inOut',
      }, '-=0.1')
      // Escalar y centrar el título
      .to(content, {
        scale: 1.2,
        duration: 0.4,
        ease: 'power2.out',
      }, '-=0.4');

    } else if (phase === null && container.style.display !== 'none') {
      // Ocultar
      gsap.killTweensOf([container, wave, content, hint]);

      const tl = gsap.timeline();

      tl.to([content, hint], {
        opacity: 0,
        duration: 0.15,
        ease: 'power2.in',
      })
      .to(wave, {
        height: '0px',
        duration: 0.25,
        ease: 'power3.in',
        onComplete: () => {
          gsap.set(container, { display: 'none' });
          gsap.set(content, { scale: 1 }); // Reset scale
        },
      }, '-=0.1');
    }
  }, [phase, direction, targetSection, targetColor, onFullscreenComplete]);

  // Determinar colores según la sección destino
  const textColor = targetColor === COLORS.red ? COLORS.cream : COLORS.black;
  const hintColor = targetColor === COLORS.red ? 'rgba(244,237,228,0.7)' : 'rgba(20,18,16,0.6)';
  const isDown = direction === 'down';

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        pointerEvents: 'none',
        display: 'none',
        overflow: 'hidden',
      }}
    >
      {/* Bloque de wave */}
      <div
        ref={waveRef}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          willChange: 'height',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
        }}
      >
        {/* Borde curvo SVG */}
        <svg
          viewBox="0 0 1440 60"
          preserveAspectRatio="none"
          style={{
            position: 'absolute',
            [isDown ? 'top' : 'bottom']: '-1px',
            left: 0,
            width: '100%',
            height: '60px',
            transform: isDown ? 'rotate(180deg)' : 'none',
          }}
        >
          <path
            d="M0,30 Q360,60 720,30 T1440,30 L1440,60 L0,60 Z"
            fill={targetColor || COLORS.cream}
          />
        </svg>

        {/* Contenido: Nombre de la sección */}
        <div
          ref={contentRef}
          style={{
            position: 'relative',
            zIndex: 1,
            textAlign: 'center',
            color: textColor,
            fontFamily: "'Inter Tight', sans-serif",
            fontWeight: 900,
            fontSize: 'clamp(1.8rem, 6vw, 3.5rem)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            willChange: 'transform, opacity',
          }}
        >
          {targetSection}
        </div>

        {/* Instrucción: Desliza para continuar */}
        <div
          ref={hintRef}
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: hintColor,
            fontFamily: "'Inter Tight', sans-serif",
            fontWeight: 500,
            fontSize: 'clamp(0.75rem, 2vw, 0.9rem)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          <span>Desliza para continuar</span>
          {/* Flecha animada */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transform: isDown ? 'rotate(90deg)' : 'rotate(-90deg)',
              animation: 'bounceArrow 1.2s ease-in-out infinite',
            }}
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* Animación CSS para la flecha */}
      <style jsx>{`
        @keyframes bounceArrow {
          0%, 100% {
            transform: ${isDown ? 'rotate(90deg) translateX(0)' : 'rotate(-90deg) translateX(0)'};
          }
          50% {
            transform: ${isDown ? 'rotate(90deg) translateX(5px)' : 'rotate(-90deg) translateX(5px)'};
          }
        }
      `}</style>
    </div>
  );
}
