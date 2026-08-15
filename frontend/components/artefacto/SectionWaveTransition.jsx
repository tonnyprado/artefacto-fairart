'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { COLORS } from './theme';

/*
  SectionWaveTransition — Preview de onda curva con nombre de sección

  Muestra una onda curva que aparece al llegar al límite de una sección,
  con el nombre de la siguiente sección visible. Este es solo el PREVIEW,
  la transición real se maneja por ScrollTransition o CurvedWipeTransition.

  Props:
    isActive: boolean - si mostrar el preview
    direction: 'up' | 'down' - dirección del scroll
    targetSection: string - nombre de la sección destino
    targetColor: string - color de la sección destino
*/

export default function SectionWaveTransition({
  isActive,
  direction = 'down',
  targetSection,
  targetColor,
}) {
  const containerRef = useRef(null);
  const waveRef = useRef(null);
  const textRef = useRef(null);
  const isAnimating = useRef(false);

  useEffect(() => {
    if (!containerRef.current || !waveRef.current || !textRef.current) return;

    const container = containerRef.current;
    const wave = waveRef.current;
    const text = textRef.current;

    if (isActive && targetSection && !isAnimating.current) {
      isAnimating.current = true;

      // Kill any existing animations
      gsap.killTweensOf([container, wave, text]);

      const isDown = direction === 'down';

      // Setup inicial
      gsap.set(container, {
        display: 'flex',
        opacity: 1,
      });

      gsap.set(wave, {
        backgroundColor: targetColor || COLORS.cream,
        y: isDown ? '100%' : '-100%',
        opacity: 1,
      });

      gsap.set(text, {
        opacity: 0,
        scale: 0.9,
      });

      // Animación de entrada
      const tl = gsap.timeline({
        onComplete: () => {
          isAnimating.current = false;
        }
      });

      tl.to(wave, {
        y: isDown ? 'calc(100vh - 140px)' : 'calc(-100vh + 140px)',
        duration: 0.5,
        ease: 'power3.out',
      })
      .to(text, {
        opacity: 1,
        scale: 1,
        duration: 0.4,
        ease: 'power2.out',
      }, '-=0.3');

    } else if (!isActive && container.style.display !== 'none') {
      isAnimating.current = true;

      // Kill any existing animations
      gsap.killTweensOf([container, wave, text]);

      const isDown = direction === 'down';

      // Animación de salida
      gsap.to(text, {
        opacity: 0,
        scale: 0.9,
        duration: 0.2,
        ease: 'power2.in',
      });

      gsap.to(wave, {
        y: isDown ? '100%' : '-100%',
        duration: 0.4,
        ease: 'power3.in',
        onComplete: () => {
          gsap.set(container, { display: 'none' });
          isAnimating.current = false;
        },
      });
    }
  }, [isActive, direction, targetSection, targetColor]);

  // Determinar colores según la sección destino
  const textColor = targetColor === COLORS.red ? COLORS.cream : COLORS.black;
  const isDown = direction === 'down';

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 94, // Debajo de las transiciones reales (95-96)
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
          height: '140px',
          [isDown ? 'bottom' : 'top']: 0,
          willChange: 'transform',
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
            fontSize: 'clamp(1.2rem, 3vw, 2rem)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            paddingTop: isDown ? '20px' : '0',
            paddingBottom: isDown ? '0' : '20px',
          }}
        >
          {targetSection}
        </div>
      </div>
    </div>
  );
}
