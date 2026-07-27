'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FONTS, COLORS, container } from './theme';

gsap.registerPlugin(ScrollTrigger);

/**
 * Componente de bloque fullscreen con imagen de fondo y overlay animado
 * La imagen persiste entre bloques, solo el overlay y contenido cambian
 * @param {Object} props
 * @param {string} props.backgroundImage - URL de la imagen de fondo
 * @param {React.ReactNode} props.children - Contenido del bloque
 * @param {boolean} props.hasOverlay - Si muestra overlay gris
 * @param {number} props.overlayOpacity - Opacidad del overlay (0-1)
 * @param {boolean} props.fadeOverlay - Animar fade del overlay con scroll
 */
export default function ImageBackgroundBlock({
  backgroundImage,
  children,
  hasOverlay = true,
  overlayOpacity = 0.6,
  fadeOverlay = false,
}) {
  const blockRef = useRef(null);
  const overlayRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    // Animación de fade del overlay si está habilitada
    if (fadeOverlay && overlayRef.current) {
      gsap.fromTo(
        overlayRef.current,
        { opacity: overlayOpacity },
        {
          scrollTrigger: {
            trigger: blockRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
          opacity: 0,
          ease: 'none',
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.trigger === blockRef.current || trigger.vars.trigger === overlayRef.current) {
          trigger.kill();
        }
      });
    };
  }, [fadeOverlay, overlayOpacity]);

  return (
    <div
      ref={blockRef}
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        overflow: 'hidden',
      }}
    >
      {hasOverlay && (
        <div
          ref={overlayRef}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: `rgba(20, 18, 16, ${overlayOpacity})`,
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
          maxWidth: 1000,
          padding: '0 24px',
          color: COLORS.cream,
        }}
      >
        {children}
      </div>
    </div>
  );
}
