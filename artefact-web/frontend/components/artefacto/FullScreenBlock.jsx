'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Componente base para bloques fullscreen con animaciones de scroll
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenido del bloque
 * @param {string} props.backgroundColor - Color de fondo
 * @param {string} props.backgroundImage - URL de imagen de fondo opcional
 * @param {boolean} props.hasOverlay - Si tiene overlay oscuro
 * @param {number} props.overlayOpacity - Opacidad del overlay (0-1)
 * @param {string} props.id - ID único del bloque
 * @param {boolean} props.animate - Habilitar animación de entrada
 */
export default function FullScreenBlock({
  children,
  backgroundColor = 'transparent',
  backgroundImage,
  hasOverlay = false,
  overlayOpacity = 0.5,
  id,
  animate = true,
  minHeight = '100vh',
}) {
  const blockRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (!animate || !contentRef.current) return;

    gsap.fromTo(
      contentRef.current,
      { opacity: 0, y: 60 },
      {
        scrollTrigger: {
          trigger: blockRef.current,
          start: 'top bottom-=100',
          end: 'top center',
          scrub: true,
        },
        opacity: 1,
        y: 0,
        ease: 'power2.out',
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.trigger === blockRef.current) {
          trigger.kill();
        }
      });
    };
  }, [animate]);

  return (
    <div
      id={id}
      ref={blockRef}
      style={{
        position: 'relative',
        minHeight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor,
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        overflow: 'hidden',
      }}
    >
      {hasOverlay && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})`,
            pointerEvents: 'none',
          }}
        />
      )}
      <div
        ref={contentRef}
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          padding: '0 24px',
        }}
      >
        {children}
      </div>
    </div>
  );
}
