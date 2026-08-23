'use client';

import { LOGO } from './content';
import { cls } from './classes';

/**
 * LogoMask - Bloque crema que cubre SOLO el logo
 * El ghost label "CONOCE MÁS" está separado para no bloquear los sticky labels
 * Los sticky labels deben poder "unirse" visualmente con el logo
 */
export default function LogoMask({ maskRef, ghostRef, navbarHeight = 80 }) {
  // Solo la altura del logo (sin incluir el área del label)
  const logoOnlyHeight = `calc(${navbarHeight}px + min(24px, 1.2vw) + min(130px, 9.8vw))`;

  return (
    <>
      {/* Máscara que cubre SOLO el logo - altura reducida */}
      <div
        ref={maskRef}
        className="fixed left-0 z-10 w-[25vw] bg-crema pointer-events-none"
        style={{
          top: 0,
          height: logoOnlyHeight,
          minWidth: '250px',
        }}
      >
        {/* Logo */}
        <img
          src={LOGO}
          alt="ARTE FACTO"
          className="absolute left-[max(24px,3.75vw)] w-[min(232px,17.5vw)]"
          style={{ top: `calc(${navbarHeight}px + min(24px, 1.2vw))` }}
        />
      </div>

      {/* Ghost label "CONOCE MÁS" - separado, justo debajo del logo mask */}
      <div
        ref={ghostRef}
        className={`fixed left-[max(24px,3.75vw)] z-[10] w-[min(232px,17.5vw)] pointer-events-none transition-opacity duration-300 ${cls.labelRow}`}
        style={{ top: logoOnlyHeight }}
      >
        <span>CONOCE</span>
        <span>MÁS</span>
      </div>
    </>
  );
}
