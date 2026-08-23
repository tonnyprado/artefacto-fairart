'use client';

import { LOGO } from './content';
import { cls } from './classes';

/**
 * LogoMask - Bloque crema superior-izquierdo
 * Contiene el logo + "CONOCE MÁS"
 * Los subtemas pasan POR DETRÁS de este bloque al salir (z-10 vs z-2 del main)
 *
 * IMPORTANTE: Este bloque debe cubrir completamente el área del logo + labels
 * para evitar que el contenido scrolleado se vea detrás (problema de "fondo negro")
 */
export default function LogoMask({ maskRef, ghostRef, navbarHeight = 80 }) {
  // Altura base del logo
  const logoHeight = 'min(130px, 9.8vw)';
  // Padding superior del logo
  const logoPadding = 'min(24px, 1.2vw)';
  // Altura adicional para cubrir el gap y el label
  const labelHeight = 'min(50px, 3vw)';

  return (
    <>
      {/* Máscara principal que cubre logo + área de labels */}
      <div
        ref={maskRef}
        className="fixed left-0 z-10 bg-crema pointer-events-none"
        style={{
          top: 0,
          // Ancho suficiente para cubrir todo el área izquierda
          width: 'max(25vw, 280px)',
          // Altura extendida para cubrir logo + label + gap de seguridad
          height: `calc(${navbarHeight}px + ${logoPadding} + ${logoHeight} + ${labelHeight} + 10px)`,
        }}
      />

      {/* Logo */}
      <img
        src={LOGO}
        alt="ARTE FACTO"
        className="fixed left-[max(24px,3.75vw)] z-[12] pointer-events-none"
        style={{
          top: `calc(${navbarHeight}px + ${logoPadding})`,
          width: 'min(232px, 17.5vw)',
        }}
      />

      {/* Label "CONOCE MÁS" (ghost - se desvanece cuando aparecen los sticky) */}
      <div
        ref={ghostRef}
        className={`fixed left-[max(24px,3.75vw)] z-[12] pointer-events-none transition-opacity duration-300 ${cls.labelRow}`}
        style={{
          top: `calc(${navbarHeight}px + ${logoPadding} + ${logoHeight})`,
          width: 'min(232px, 17.5vw)',
        }}
      >
        <span>CONOCE</span>
        <span>MÁS</span>
      </div>
    </>
  );
}
