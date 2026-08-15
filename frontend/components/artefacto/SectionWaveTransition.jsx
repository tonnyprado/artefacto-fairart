'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { COLORS } from './theme';

/*
  SectionWaveTransition — Transición de onda curva con nombre de sección

  Dos fases:
  1. 'preview': Bloque pequeño aparece desde el borde con el nombre
  2. 'fullscreen': El bloque se expande a toda la pantalla

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
  const textRef = useRef(null);
  const lastPhase = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !waveRef.current || !textRef.current) return;

    const container = containerRef.current;
    const wave = waveRef.current;
    const text = textRef.current;
    const isDown = direction === 'down';

    // Evitar re-animaciones innecesarias
    if (phase === lastPhase.current) return;
    lastPhase.current = phase;

    if (phase === 'preview') {
      // Kill any existing animations
      gsap.killTweensOf([container, wave, text]);

      // Setup inicial
      gsap.set(container, {
        display: 'flex',
        opacity: 1,
      });

      gsap.set(wave, {
        backgroundColor: targetColor || COLORS.cream,
        [isDown ? 'bottom' : 'top']: 0,
        [isDown ? 'top' : 'bottom']: 'auto',
        height: '0px',
      });

      gsap.set(text, {
        opacity: 0,
        scale: 0.8,
      });

      // Animación de entrada del preview
      gsap.to(wave, {
        height: '160px',
        duration: 0.4,
        ease: 'power3.out',
      });

      gsap.to(text, {
        opacity: 1,
        scale: 1,
        duration: 0.35,
        delay: 0.15,
        ease: 'power2.out',
      });

    } else if (phase === 'fullscreen') {
      // Kill any existing animations
      gsap.killTweensOf([container, wave, text]);

      // Expandir a pantalla completa
      const tl = gsap.timeline({
        onComplete: () => {
          onFullscreenComplete?.();
        }
      });

      tl.to(wave, {
        height: '100vh',
        duration: 0.5,
        ease: 'power2.inOut',
      })
      .to(text, {
        scale: 1.15,
        duration: 0.3,
      }, '-=0.3');

    } else if (phase === null && container.style.display !== 'none') {
      // Ocultar
      gsap.killTweensOf([container, wave, text]);

      gsap.to(text, {
        opacity: 0,
        scale: 0.8,
        duration: 0.2,
        ease: 'power2.in',
      });

      gsap.to(wave, {
        height: '0px',
        duration: 0.3,
        ease: 'power3.in',
        onComplete: () => {
          gsap.set(container, { display: 'none' });
        },
      });
    }
  }, [phase, direction, targetSection, targetColor, onFullscreenComplete]);

  // Determinar colores según la sección destino
  const textColor = targetColor === COLORS.red ? COLORS.cream : COLORS.black;
  const isDown = direction === 'down';

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100, // Por encima de todo
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
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Borde curvo SVG */}
        <svg
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          style={{
            position: 'absolute',
            [isDown ? 'top' : 'bottom']: '-1px',
            left: 0,
            width: '100%',
            height: '80px',
            transform: isDown ? 'rotate(180deg)' : 'none',
          }}
        >
          <path
            d="M0,40 Q360,80 720,40 T1440,40 L1440,80 L0,80 Z"
            fill={targetColor || COLORS.cream}
          />
        </svg>

        {/* Nombre de la sección */}
        <div
          ref={textRef}
          style={{
            position: 'relative',
            zIndex: 1,
            textAlign: 'center',
            color: textColor,
            fontFamily: "'Inter Tight', sans-serif",
            fontWeight: 900,
            fontSize: 'clamp(1.5rem, 5vw, 3rem)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}
        >
          {targetSection}
        </div>
      </div>
    </div>
  );
}
