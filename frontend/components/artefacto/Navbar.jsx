'use client';
import { useEffect, useRef, useState } from 'react';
import { COLORS } from './theme';
import { useTextScrambleMultiple } from './useTextScramble';

/*
  Navbar transparente (no se muestra en el hero).
  Desktop: iconos-letra a los lados, logo al centro (→ hero), labels se revelan en hover.
  Móvil (<760px): botón estrella arriba-izquierda (abre el menú fullscreen del SPA).
  Props: screen (sección actual), onOpenMenu.
  La navegación real la maneja el click delegado de LandingArtefacto (anchors #...).
*/
export default function Navbar({ screen, onOpenMenu }) {
  const rojo = screen === 'convocatoria' || screen === 'contacto';
  const suf = rojo ? 'white' : 'red';
  const labelCol = rojo ? COLORS.cream : COLORS.black;
  const logoRef = useRef(null);
  const [logoVisible, setLogoVisible] = useState(false);

  const left = [
    { src: `/assets/glyph-a-${suf}.svg`, label: 'Conoce Más', href: '#about' },
    { src: `/assets/glyph-r-${suf}.svg`, label: 'Convocatoria', href: '#convocatoria' },
  ];
  const right = [
    { src: `/assets/glyph-c-${suf}.svg`, label: 'Calendario', href: '#calendario' },
    { src: `/assets/glyph-o-${suf}.svg`, label: 'Contacto', href: '#contacto' },
  ];

  // Aplicar scramble a todos los labels
  const allLabels = [...left.map(n => n.label), ...right.map(n => n.label)];
  const scrambleRefs = useTextScrambleMultiple(allLabels, {
    duration: 600,
    staggerDelay: 80,
    initialDelay: 300,
  });

  // Animación de entrada del logo
  useEffect(() => {
    if (logoRef.current) {
      setTimeout(() => {
        setLogoVisible(true);
      }, 200);
    }
  }, []);

  const item = (n, index) => (
    <a key={n.href} className="arte-navitem" href={n.href}
      style={{ pointerEvents: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
      <img src={n.src} alt="" style={{ height: 32, display: 'block' }} />
      <span
        ref={scrambleRefs[index]?.ref}
        style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: labelCol }}
      >
        {n.label}
      </span>
    </a>
  );
  return (
    <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 60, pointerEvents: 'none' }}>
      <div className="arte-nav-desk" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'start', padding: '16px 28px' }}>
        <div style={{ display: 'flex', gap: 26, justifyContent: 'flex-start' }}>{left.map((n, i) => item(n, i))}</div>
        <a
          ref={logoRef}
          href="#hero"
          className="arte-navlogo"
          style={{
            pointerEvents: 'auto',
            display: 'block',
            opacity: logoVisible ? 1 : 0,
            transform: logoVisible ? 'scale(1)' : 'scale(0.8)',
            transition: 'opacity 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <img src={rojo ? '/assets/wordmark-cream.svg' : '/assets/wordmark-black.svg'} alt="ARTEFACTO" style={{ height: 46, display: 'block' }} />
        </a>
        <div style={{ display: 'flex', gap: 26, justifyContent: 'flex-end' }}>{right.map((n, i) => item(n, i + left.length))}</div>
      </div>
      <button className="arte-nav-mob" onClick={onOpenMenu} aria-label="Menú"
        style={{ pointerEvents: 'auto', position: 'absolute', top: 16, left: 16, background: 'none', border: 'none', cursor: 'pointer', padding: 8, display: 'none' }}>
        <img src={rojo ? '/assets/star-cream.svg' : '/assets/star-black.svg'} alt="" style={{ width: 30, height: 30, display: 'block' }} />
      </button>
    </nav>
  );
}
