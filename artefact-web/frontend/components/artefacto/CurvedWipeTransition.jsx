'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

/*
  CurvedWipeTransition — Transición tipo "curved wipe" estilo OSMO para navegación entre secciones

  Esta transición crea un efecto de "barrido curvo" donde una forma curva barre la pantalla
  revelando la siguiente sección de manera fluida y elegante.

  Fases:
  1. 'out': La forma curva entra desde la izquierda cubriendo la pantalla actual
  2. 'in': La forma curva sale por la derecha revelando completamente la nueva sección

  Props:
    phase: 'out' | 'in' | null
    color: color de fondo de la siguiente sección
    onComplete: callback cuando termina la animación
*/

export default function CurvedWipeTransition({ phase, color, onComplete }) {
  const containerRef = useRef(null);
  const wipeRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !wipeRef.current || !phase) return;

    if (phase === 'out') {
      // Fase 1: El wipe curvo entra desde la izquierda cubriendo la pantalla
      gsap.set(containerRef.current, { display: 'block' });
      gsap.set(wipeRef.current, {
        backgroundColor: color,
        // Curva más pronunciada estilo OSMO: forma de S invertida
        clipPath: 'polygon(-10% 0%, -10% 0%, -10% 100%, -10% 100%)',
      });

      const tl = gsap.timeline({
        onComplete: () => onComplete?.(),
      });

      // Animar el clip-path con una curva más orgánica y pronunciada
      // El efecto crea una onda que barre la pantalla
      tl.to(wipeRef.current, {
        clipPath: 'polygon(-10% 0%, 60% 0%, 50% 50%, 60% 100%, -10% 100%)',
        duration: 0.3,
        ease: 'power2.in',
      })
      .to(wipeRef.current, {
        clipPath: 'polygon(-10% 0%, 110% 0%, 105% 50%, 110% 100%, -10% 100%)',
        duration: 0.5,
        ease: 'power2.out',
      });

    } else if (phase === 'in') {
      // Fase 2: El wipe curvo sale por la derecha revelando la nueva sección
      const tl = gsap.timeline({
        onComplete: () => {
          onComplete?.();
          // Limpiar después de la animación
          if (containerRef.current) {
            containerRef.current.style.display = 'none';
          }
        },
      });

      // Completar el barrido con la misma curva orgánica
      tl.to(wipeRef.current, {
        clipPath: 'polygon(50% 0%, 110% 0%, 110% 100%, 40% 100%, 50% 50%)',
        duration: 0.35,
        ease: 'power2.in',
      })
      .to(wipeRef.current, {
        clipPath: 'polygon(110% 0%, 110% 0%, 110% 100%, 110% 100%)',
        duration: 0.35,
        ease: 'power2.out',
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
      {/* Elemento con forma curva que barre la pantalla */}
      <div
        ref={wipeRef}
        style={{
          position: 'absolute',
          inset: 0,
          willChange: 'clip-path',
          transform: 'translateZ(0)',
        }}
      />
    </div>
  );
}
