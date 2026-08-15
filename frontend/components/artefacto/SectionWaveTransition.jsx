'use client';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { COLORS } from './theme';

/*
  SectionWaveTransition — Transición con onda curva y nombre de sección

  Muestra una onda curva que aparece al llegar al límite de una sección,
  con el nombre de la siguiente sección visible. Si el usuario continúa
  haciendo scroll, la onda se expande y completa la transición.

  Fases:
  1. 'preview': Wave aparece desde el borde con nombre de sección (0.4s)
  2. 'pause': Se mantiene visible mostrando el nombre (1.5s)
  3. 'expand': Wave se expande cubriendo toda la pantalla (0.6s)
  4. 'complete': Transición finalizada

  Props:
    isActive: boolean - si mostrar la transición
    direction: 'up' | 'down' - dirección del scroll
    targetSection: string - nombre de la sección destino
    targetColor: string - color de la sección destino
    onTransitionComplete: callback cuando termina la transición completa
    onPreviewEnd: callback cuando termina el preview (para cancelar si deja de hacer scroll)
*/

export default function SectionWaveTransition({
  isActive,
  direction = 'down',
  targetSection,
  targetColor,
  onTransitionComplete,
  onPreviewEnd,
}) {
  const containerRef = useRef(null);
  const waveRef = useRef(null);
  const textRef = useRef(null);
  const timelineRef = useRef(null);
  const [phase, setPhase] = useState(null); // 'preview' | 'pause' | 'expand' | 'complete' | null

  useEffect(() => {
    if (!containerRef.current || !waveRef.current) return;

    // Limpiar timeline anterior
    if (timelineRef.current) {
      timelineRef.current.kill();
      timelineRef.current = null;
    }

    if (isActive && targetSection) {
      setPhase('preview');
      gsap.set(containerRef.current, { display: 'flex' });

      const isDown = direction === 'down';
      const startY = isDown ? '100%' : '-100%';
      const waveHeight = '120px'; // Altura inicial de la onda

      // Configurar posición inicial
      gsap.set(waveRef.current, {
        backgroundColor: targetColor || COLORS.cream,
        y: startY,
        height: waveHeight,
        opacity: 1,
      });

      gsap.set(textRef.current, {
        opacity: 0,
        y: isDown ? 20 : -20,
      });

      const tl = gsap.timeline();
      timelineRef.current = tl;

      // Fase 1: Preview - Wave aparece (0.4s)
      tl.to(waveRef.current, {
        y: isDown ? 'calc(100% - 120px)' : 'calc(-100% + 120px)',
        duration: 0.4,
        ease: 'power2.out',
      })
      .to(textRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.3,
        ease: 'power2.out',
      }, '-=0.2')
      // Fase 2: Pausa (1.5s)
      .call(() => setPhase('pause'))
      .to({}, { duration: 1.5 })
      .call(() => {
        onPreviewEnd?.();
      })
      // Fase 3: Expand - Wave cubre toda la pantalla (0.6s)
      .call(() => setPhase('expand'))
      .to(waveRef.current, {
        y: '0%',
        height: '100%',
        duration: 0.6,
        ease: 'power2.inOut',
      })
      .to(textRef.current, {
        scale: 1.1,
        duration: 0.3,
      }, '-=0.3')
      // Fase 4: Complete
      .call(() => {
        setPhase('complete');
        onTransitionComplete?.();
      })
      // Fade out
      .to(containerRef.current, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
          gsap.set(containerRef.current, { display: 'none', opacity: 1 });
          setPhase(null);
        },
      });

    } else if (!isActive && phase !== null) {
      // Cancelar transición si se desactiva
      if (timelineRef.current) {
        timelineRef.current.kill();
      }

      // Animar salida suave
      gsap.to(waveRef.current, {
        y: direction === 'down' ? '100%' : '-100%',
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          gsap.set(containerRef.current, { display: 'none' });
          setPhase(null);
        },
      });
    }

    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, [isActive, direction, targetSection, targetColor, onTransitionComplete, onPreviewEnd, phase]);

  // Determinar posición del texto según dirección
  const textPosition = direction === 'down' ? { bottom: '40px' } : { top: '40px' };
  const textColor = targetColor === COLORS.red ? COLORS.cream : COLORS.black;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 96,
        pointerEvents: 'none',
        display: 'none',
        alignItems: direction === 'down' ? 'flex-end' : 'flex-start',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Onda curva con SVG para el borde */}
      <div
        ref={waveRef}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          willChange: 'transform, height',
          transform: 'translateZ(0)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: direction === 'down' ? 'flex-start' : 'flex-end',
        }}
      >
        {/* Borde curvo SVG */}
        <svg
          viewBox="0 0 1440 60"
          preserveAspectRatio="none"
          style={{
            position: 'absolute',
            [direction === 'down' ? 'top' : 'bottom']: '-1px',
            left: 0,
            width: '100%',
            height: '60px',
            transform: direction === 'down' ? 'rotate(180deg)' : 'none',
          }}
        >
          <path
            d="M0,30 Q360,60 720,30 T1440,30 L1440,60 L0,60 Z"
            fill={targetColor || COLORS.cream}
          />
        </svg>

        {/* Nombre de la sección */}
        <div
          ref={textRef}
          style={{
            position: 'absolute',
            ...textPosition,
            textAlign: 'center',
            color: textColor,
            fontFamily: "'Inter Tight', sans-serif",
            fontWeight: 900,
            fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            willChange: 'transform, opacity',
          }}
        >
          {targetSection}
        </div>
      </div>
    </div>
  );
}
