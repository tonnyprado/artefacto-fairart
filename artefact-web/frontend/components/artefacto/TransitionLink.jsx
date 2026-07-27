'use client';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';

/*
  TransitionLink - Link con transición de página usando curved wipe

  Ejecuta una animación curved wipe antes de navegar a otra página.

  Props:
    href: URL de destino
    children: Contenido del link
    style: Estilos inline
    className: Clases CSS
    onClick: Callback adicional
    ...rest: Props adicionales para el elemento <a>
*/

export default function TransitionLink({ href, children, style, className, onClick, ...rest }) {
  const router = useRouter();
  const overlayRef = useRef(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleClick = (e) => {
    e.preventDefault();

    // Si ya está en transición, ignorar
    if (isTransitioning) return;

    // Ejecutar callback adicional si existe
    if (onClick) {
      onClick(e);
    }

    setIsTransitioning(true);

    // Mostrar overlay
    if (overlayRef.current) {
      overlayRef.current.style.display = 'block';
    }

    // Animación curved wipe de entrada
    const tl = gsap.timeline({
      onComplete: () => {
        // Navegar después de la transición
        router.push(href);
      }
    });

    // Curved wipe entrance
    tl.fromTo(
      overlayRef.current,
      {
        clipPath: 'polygon(-10% 0%, -10% 0%, -10% 100%, -10% 100%)',
      },
      {
        clipPath: 'polygon(-10% 0%, 60% 0%, 50% 50%, 60% 100%, -10% 100%)',
        duration: 0.3,
        ease: 'power2.in',
      }
    )
    .to(overlayRef.current, {
      clipPath: 'polygon(-10% 0%, 110% 0%, 105% 50%, 110% 100%, -10% 100%)',
      duration: 0.5,
      ease: 'power2.out',
    });
  };

  return (
    <>
      <a
        href={href}
        onClick={handleClick}
        style={style}
        className={className}
        {...rest}
      >
        {children}
      </a>

      {/* Overlay de transición */}
      <div
        ref={overlayRef}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          pointerEvents: 'none',
          display: 'none',
          backgroundColor: '#B83030', // COLORS.red
          willChange: 'clip-path',
          transform: 'translateZ(0)',
        }}
      />
    </>
  );
}

/*
  usePageTransition Hook - Para usar en componentes que navegan programáticamente

  Ejemplo de uso:
  const transition = usePageTransition();

  const handleNavigate = () => {
    transition.navigateTo('/registro');
  }
*/
export function usePageTransition() {
  const router = useRouter();
  const overlayRef = useRef(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const navigateTo = (href, options = {}) => {
    const { color = '#B83030', onStart, onComplete } = options;

    if (isTransitioning) return;

    setIsTransitioning(true);

    // Crear overlay si no existe
    if (!overlayRef.current) {
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed;
        inset: 0;
        z-index: 9999;
        pointer-events: none;
        background-color: ${color};
        will-change: clip-path;
        transform: translateZ(0);
      `;
      document.body.appendChild(overlay);
      overlayRef.current = overlay;
    }

    if (onStart) onStart();

    // Animación curved wipe
    const tl = gsap.timeline({
      onComplete: () => {
        router.push(href);
        if (onComplete) onComplete();

        // Limpiar después de navegar
        setTimeout(() => {
          if (overlayRef.current) {
            overlayRef.current.remove();
            overlayRef.current = null;
          }
          setIsTransitioning(false);
        }, 100);
      }
    });

    tl.fromTo(
      overlayRef.current,
      {
        clipPath: 'polygon(-10% 0%, -10% 0%, -10% 100%, -10% 100%)',
      },
      {
        clipPath: 'polygon(-10% 0%, 60% 0%, 50% 50%, 60% 100%, -10% 100%)',
        duration: 0.3,
        ease: 'power2.in',
      }
    )
    .to(overlayRef.current, {
      clipPath: 'polygon(-10% 0%, 110% 0%, 105% 50%, 110% 100%, -10% 100%)',
      duration: 0.5,
      ease: 'power2.out',
    });
  };

  return { navigateTo, isTransitioning };
}
