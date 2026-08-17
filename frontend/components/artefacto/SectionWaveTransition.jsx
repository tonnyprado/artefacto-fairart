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
  const contentWrapperRef = useRef(null);
  const lastPhase = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !waveRef.current || !contentWrapperRef.current) return;

    const container = containerRef.current;
    const wave = waveRef.current;
    const contentWrapper = contentWrapperRef.current;
    const isDown = direction === 'down';

    // Evitar re-animaciones innecesarias
    if (phase === lastPhase.current) return;
    lastPhase.current = phase;

    if (phase === 'preview') {
      // Kill any existing animations
      gsap.killTweensOf([container, wave, contentWrapper]);

      // Setup inicial
      gsap.set(container, {
        display: 'block',
        opacity: 1,
      });

      gsap.set(wave, {
        backgroundColor: targetColor || COLORS.cream,
        height: '0px',
      });

      gsap.set(contentWrapper, {
        opacity: 0,
        y: isDown ? 40 : -40,
      });

      // Animación de entrada del preview
      const tl = gsap.timeline();

      tl.to(wave, {
        height: '200px',
        duration: 0.45,
        ease: 'power2.out',
      })
      .to(contentWrapper, {
        opacity: 1,
        y: 0,
        duration: 0.35,
        ease: 'power2.out',
      }, '-=0.25');

    } else if (phase === 'fullscreen') {
      // Kill any existing animations
      gsap.killTweensOf([container, wave, contentWrapper]);

      // Expandir a fullscreen y centrar el título
      const tl = gsap.timeline({
        onComplete: () => {
          onFullscreenComplete?.();
        }
      });

      // Ocultar hint y expandir wave mientras movemos el contenido al centro
      tl.to(contentWrapper.querySelector('.hint'), {
        opacity: 0,
        duration: 0.12,
        ease: 'power2.in',
      })
      .to(wave, {
        height: '100vh',
        duration: 0.5,
        ease: 'power2.inOut',
      }, '-=0.08')
      // Mover el contenido al centro de la pantalla
      .to(contentWrapper, {
        top: '50%',
        bottom: 'auto',
        y: '-50%',
        height: 'auto',
        duration: 0.4,
        ease: 'power2.out',
      }, '-=0.4')
      // Escalar el título
      .to(contentWrapper.querySelector('.title'), {
        scale: 1.2,
        duration: 0.3,
        ease: 'power2.out',
      }, '-=0.25');

    } else if (phase === null && container.style.display !== 'none') {
      // Ocultar
      gsap.killTweensOf([container, wave, contentWrapper]);

      const tl = gsap.timeline();

      tl.to(contentWrapper, {
        opacity: 0,
        duration: 0.1,
        ease: 'power2.in',
      })
      .to(wave, {
        height: '0px',
        duration: 0.15,
        ease: 'power3.in',
        onComplete: () => {
          gsap.set(container, { display: 'none' });
          // Reset posición y escala
          const title = contentWrapper.querySelector('.title');
          if (title) gsap.set(title, { scale: 1 });
          gsap.set(contentWrapper, {
            top: 'auto',
            bottom: 0,
            y: 0,
            height: '200px',
            opacity: 1
          });
        },
      }, '-=0.05');
    }
  }, [phase, direction, targetSection, targetColor, onFullscreenComplete]);

  // Determinar colores según la sección destino
  const textColor = targetColor === COLORS.red ? COLORS.cream : COLORS.black;
  const hintColor = targetColor === COLORS.red ? 'rgba(244,237,228,0.7)' : 'rgba(20,18,16,0.5)';
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
      {/* Bloque de wave - posicionado arriba o abajo según dirección */}
      <div
        ref={waveRef}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          [isDown ? 'bottom' : 'top']: 0,
          willChange: 'height',
          overflow: 'hidden',
        }}
      >
        {/* Borde curvo SVG */}
        <svg
          viewBox="0 0 1440 50"
          preserveAspectRatio="none"
          style={{
            position: 'absolute',
            [isDown ? 'top' : 'bottom']: '-1px',
            left: 0,
            width: '100%',
            height: '50px',
            transform: isDown ? 'rotate(180deg)' : 'none',
          }}
        >
          <path
            d="M0,25 Q360,50 720,25 T1440,25 L1440,50 L0,50 Z"
            fill={targetColor || COLORS.cream}
          />
        </svg>

        {/* Contenedor del contenido - posicionado dentro del wave */}
        <div
          ref={contentWrapperRef}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            [isDown ? 'bottom' : 'top']: 0,
            height: '200px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            padding: '20px',
            boxSizing: 'border-box',
          }}
        >
          {/* Nombre de la sección */}
          <div
            className="title"
            style={{
              color: textColor,
              fontFamily: "'Inter Tight', sans-serif",
              fontWeight: 900,
              fontSize: 'clamp(1.4rem, 5vw, 2.5rem)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              textAlign: 'center',
              lineHeight: 1.1,
              willChange: 'transform',
              maxWidth: '90%',
            }}
          >
            {targetSection}
          </div>

          {/* Instrucción: Desliza para continuar */}
          <div
            className="hint"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: hintColor,
              fontFamily: "'Inter Tight', sans-serif",
              fontWeight: 500,
              fontSize: 'clamp(0.7rem, 2.5vw, 0.85rem)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            <span>Desliza para continuar</span>
            {/* Flecha animada */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="arrow-icon"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Animación CSS para la flecha */}
      <style jsx>{`
        .arrow-icon {
          transform: ${isDown ? 'rotate(90deg)' : 'rotate(-90deg)'};
          animation: bounceArrow 1s ease-in-out infinite;
        }
        @keyframes bounceArrow {
          0%, 100% {
            transform: ${isDown ? 'rotate(90deg) translateX(0)' : 'rotate(-90deg) translateX(0)'};
          }
          50% {
            transform: ${isDown ? 'rotate(90deg) translateX(6px)' : 'rotate(-90deg) translateX(6px)'};
          }
        }
      `}</style>
    </div>
  );
}
