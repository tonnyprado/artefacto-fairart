'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

/*
  ScrollTransition — Transición suave tipo "scroll to next page" para navegación entre secciones
  (excepto desde/hacia hero, que usa flip-clock)

  Esta transición estilo OSMO:
  1. Primero muestra un preview/barra de la siguiente sección desde abajo (peek)
  2. La sección actual se desliza hacia arriba con la siguiente empujándola
  3. La siguiente sección termina ocupando toda la pantalla

  Props:
    phase: 'out' | 'in' | null
    color: color de fondo de la siguiente sección
    onComplete: callback cuando termina la animación
*/

export default function ScrollTransition({ phase, color, onComplete }) {
  const containerRef = useRef(null);
  const previewBarRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !phase) return;

    if (phase === 'out') {
      // Fase 1: Mostrar preview/barra de la siguiente sección desde abajo
      const tl = gsap.timeline({
        onComplete: () => onComplete?.(),
      });

      gsap.set(containerRef.current, { display: 'block' });
      gsap.set(previewBarRef.current, {
        y: '100%',
        backgroundColor: color,
      });

      // Primero sube un peek de la siguiente sección (barra inferior)
      tl.to(previewBarRef.current, {
        y: 'calc(100% - 120px)', // Muestra 120px de preview
        duration: 0.4,
        ease: 'power2.out',
      })
      // Pequeña pausa para que se vea el preview
      .to({}, { duration: 0.15 });

    } else if (phase === 'in') {
      // Fase 2: Completar la transición - la siguiente sección sube completamente
      const tl = gsap.timeline({
        onComplete: () => {
          onComplete?.();
          // Limpiar después de la animación
          if (containerRef.current) {
            containerRef.current.style.display = 'none';
          }
        },
      });

      // La barra preview completa su subida
      tl.to(previewBarRef.current, {
        y: '0%',
        duration: 0.7,
        ease: 'expo.out',
      });
    }
  }, [phase, color, onComplete]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 95,
        pointerEvents: 'none',
        display: 'none',
      }}
    >
      {/* Barra de preview de la siguiente sección */}
      <div
        ref={previewBarRef}
        style={{
          position: 'absolute',
          inset: 0,
          transform: 'translateY(100%)',
        }}
      />
    </div>
  );
}
