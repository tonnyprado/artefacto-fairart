'use client';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { COLORS } from './theme';

/*
  MobileMenu — Menú móvil fullscreen con animaciones elegantes tipo "Bold Full Screen Navigation"

  Props:
    isOpen: boolean - estado del menú
    onClose: función para cerrar el menú
*/

const menuItems = [
  { label: 'Conoce Más', href: '#about' },
  { label: 'Calendario', href: '#calendario' },
  { label: 'Convocatoria', href: '#convocatoria' },
  { label: 'Contacto', href: '#contacto' },
];

export default function MobileMenu({ isOpen, onClose }) {
  const menuRef = useRef(null);
  const bgRef = useRef(null);
  const logoRef = useRef(null);
  const itemsRef = useRef([]);
  const closeRef = useRef(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!menuRef.current || !shouldRender) return;

    if (isOpen) {
      // Mostrar el menú inmediatamente
      menuRef.current.style.display = 'flex';

      // Animación de entrada
      const tl = gsap.timeline();

      // Fondo entrando
      gsap.set(bgRef.current, { scaleY: 0, transformOrigin: 'top center' });
      tl.to(bgRef.current, {
        scaleY: 1,
        duration: 0.6,
        ease: 'expo.inOut',
      });

      // Logo con fade y scale
      gsap.set(logoRef.current, { opacity: 0, scale: 0.8, y: -20 });
      tl.to(logoRef.current, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.5,
        ease: 'back.out(1.4)',
      }, '-=0.3');

      // Items con stagger elegante
      gsap.set(itemsRef.current, { opacity: 0, y: 40, rotateX: -30 });
      tl.to(itemsRef.current, {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power3.out',
      }, '-=0.4');

      // Botón cerrar
      gsap.set(closeRef.current, { opacity: 0, rotate: -90, scale: 0.5 });
      tl.to(closeRef.current, {
        opacity: 1,
        rotate: 0,
        scale: 1,
        duration: 0.4,
        ease: 'back.out(2)',
      }, '-=0.5');

    } else {
      // Animación de salida
      const tl = gsap.timeline({
        onComplete: () => {
          if (menuRef.current) {
            menuRef.current.style.display = 'none';
            setShouldRender(false);
          }
        },
      });

      tl.to(itemsRef.current, {
        opacity: 0,
        y: -30,
        duration: 0.3,
        stagger: 0.04,
        ease: 'power2.in',
      });

      tl.to([logoRef.current, closeRef.current], {
        opacity: 0,
        scale: 0.8,
        duration: 0.3,
        ease: 'power2.in',
      }, '-=0.2');

      tl.to(bgRef.current, {
        scaleY: 0,
        transformOrigin: 'bottom center',
        duration: 0.5,
        ease: 'expo.inOut',
      }, '-=0.2');
    }
  }, [isOpen, shouldRender]);

  if (!shouldRender) return null;

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 80,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        perspective: 1000,
      }}
    >
      {/* Fondo */}
      <div
        ref={bgRef}
        style={{
          position: 'absolute',
          inset: 0,
          background: COLORS.black,
        }}
      />

      {/* Contenido */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3.5vh',
          padding: 24,
          width: '100%',
        }}
      >
        {/* Logo */}
        <a
          ref={logoRef}
          href="#hero"
          style={{
            display: 'block',
            marginBottom: '2vh',
          }}
        >
          <img
            src="/assets/wordmark-cream.svg"
            alt="ARTEFACTO"
            style={{
              width: 'min(280px, 70vw)',
              display: 'block',
            }}
          />
        </a>

        {/* Items del menú */}
        {menuItems.map(({ label, href }, index) => (
          <a
            key={href}
            ref={(el) => (itemsRef.current[index] = el)}
            href={href}
            style={{
              color: COLORS.cream,
              fontWeight: 700,
              fontStyle: 'italic',
              fontSize: 'clamp(32px, 5vh, 52px)',
              textTransform: 'uppercase',
              lineHeight: 1,
              textDecoration: 'none',
              transition: 'transform 0.3s ease, color 0.3s ease',
              transformStyle: 'preserve-3d',
            }}
            onMouseEnter={(e) => {
              gsap.to(e.target, {
                x: 10,
                duration: 0.3,
                ease: 'power2.out',
              });
            }}
            onMouseLeave={(e) => {
              gsap.to(e.target, {
                x: 0,
                duration: 0.3,
                ease: 'power2.out',
              });
            }}
          >
            {label}
          </a>
        ))}
      </div>

      {/* Botón cerrar */}
      <button
        ref={closeRef}
        onClick={onClose}
        aria-label="Cerrar"
        style={{
          position: 'absolute',
          top: 20,
          right: 24,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: COLORS.cream,
          fontSize: 42,
          width: 50,
          height: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.3s ease',
          zIndex: 2,
        }}
        onMouseEnter={(e) => {
          gsap.to(e.target, {
            rotate: 90,
            duration: 0.3,
            ease: 'back.out(2)',
          });
        }}
        onMouseLeave={(e) => {
          gsap.to(e.target, {
            rotate: 0,
            duration: 0.3,
            ease: 'back.out(2)',
          });
        }}
      >
        ✕
      </button>
    </div>
  );
}
