'use client';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { COLORS } from './theme';

/*
  LogoRevealLoader — Loader inicial que aparece solo la primera vez que se carga la página.
  Muestra el glyph-a-red.svg con una animación de reveal elegante usando GSAP.

  Animación:
  - Logo escala desde pequeño con clip-path reveal
  - Fade out suave del loader completo
  - Notifica cuando termina para que el Hero inicie su animación
  - Se guarda en sessionStorage para no mostrarlo en subsecuentes navegaciones

  Props:
    onComplete: callback cuando termina la animación
*/

export default function LogoRevealLoader({ onComplete }) {
  const [isLoading, setIsLoading] = useState(true);
  const loaderRef = useRef(null);
  const logoRef = useRef(null);

  useEffect(() => {
    // Siempre mostrar el loader (sin sessionStorage)
    // Animación del loader
    const tl = gsap.timeline({
      onComplete: () => {
        // Fade out del loader
        gsap.to(loaderRef.current, {
          opacity: 0,
          duration: 0.8,
          ease: 'power2.inOut',
          onComplete: () => {
            setIsLoading(false);
            onComplete?.(); // Notificar que terminó para que Hero inicie animación
          },
        });
      },
    });

    // Esperar a que el DOM esté listo
    gsap.set(logoRef.current, {
      scale: 0.5,
      opacity: 0,
      clipPath: 'inset(50% 50% 50% 50%)',
    });

    // Secuencia de animación
    tl.to(logoRef.current, {
      scale: 1,
      opacity: 1,
      clipPath: 'inset(0% 0% 0% 0%)',
      duration: 1.2,
      ease: 'expo.out',
      delay: 0.3,
    })
    .to(logoRef.current, {
      scale: 0.95,
      duration: 0.4,
      ease: 'power2.inOut',
    })
    .to({}, { duration: 0.3 }); // Pausa breve antes de cerrar

    return () => {
      tl.kill();
    };
  }, [onComplete]);

  if (!isLoading) return null;

  return (
    <div
      ref={loaderRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: COLORS.cream,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 48,
      }}
    >
      {/* Logo SVG */}
      <div
        ref={logoRef}
        style={{
          width: 'min(200px, 40vw)',
          height: 'min(220px, 44vw)',
          position: 'relative',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="46.3 44.6 206.7 221.7"
          style={{ width: '100%', height: '100%', display: 'block' }}
        >
          <path
            fill={COLORS.red}
            d="M252.37,259.81V51.71c0-5.32-6.52-7.88-10.14-3.98L49.21,255.83c-3.47,3.74-.82,9.83,4.29,9.83h91.95c3.23,0,5.85-2.62,5.85-5.85v-97.77c0-3.23,2.62-5.85,5.85-5.85h71.75c3.85,0,6.65,3.65,5.65,7.37l-25.5,94.72c-1,3.72,1.8,7.37,5.65,7.37h31.82c3.23,0,5.85-2.62,5.85-5.85Z"
          />
        </svg>
      </div>
    </div>
  );
}
