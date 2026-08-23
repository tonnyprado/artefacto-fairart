'use client';

import { LOGO } from './content';
import { cls, CSS, NAVBAR_HEIGHT } from './classes';

/**
 * LogoMask - Bloque crema que cubre SOLO el logo
 * El ghost label "CONOCE MÁS" está separado para no bloquear los sticky labels
 * Los sticky labels deben poder "unirse" visualmente con el logo
 * Usa constantes CSS compartidas para consistencia en todas las pantallas
 */
export default function LogoMask({ maskRef, ghostRef, navbarHeight = NAVBAR_HEIGHT }) {
  // Altura del logo mask = posición donde empieza el sticky label
  const logoMaskHeight = CSS.stickyLabelTop(navbarHeight);

  return (
    <>
      {/* Máscara que cubre SOLO el logo - z-index mayor para ocultar el ghost */}
      <div
        ref={maskRef}
        className="fixed left-0 z-[12] w-[25vw] bg-crema pointer-events-none"
        style={{
          top: 0,
          height: logoMaskHeight,
          minWidth: '250px',
        }}
      >
        {/* Logo */}
        <img
          src={LOGO}
          alt="ARTE FACTO"
          className="absolute left-[max(24px,3.75vw)] w-[min(232px,17.5vw)]"
          style={{ top: `calc(${navbarHeight}px + ${CSS.logoMarginTop})` }}
        />
      </div>

      {/* Ghost label "CONOCE MÁS" - separado, justo debajo del logo mask */}
      <div
        ref={ghostRef}
        className={`fixed left-[max(24px,3.75vw)] z-[10] w-[min(232px,17.5vw)] pointer-events-none transition-opacity duration-300 ${cls.labelRow}`}
        style={{ top: logoMaskHeight }}
      >
        <span>CONOCE</span>
        <span>MÁS</span>
      </div>
    </>
  );
}
