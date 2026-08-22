'use client';

import { LOGO } from './content';
import { cls } from './classes';

/**
 * LogoMask - Bloque crema superior-izquierdo
 * Contiene el logo + "CONOCE MÁS"
 * Los subtemas pasan POR DETRÁS de este bloque al salir (z-10 vs z-2 del main)
 */
export default function LogoMask({ maskRef, ghostRef, navbarHeight = 80 }) {
  return (
    <div
      ref={maskRef}
      className="fixed left-0 z-10 w-[25vw] bg-crema pointer-events-none"
      style={{
        top: 0,
        paddingTop: `${navbarHeight}px`,
        height: `calc(${navbarHeight}px + min(24px, 1.2vw) + min(130px, 9.8vw) + 4px + 40px)`,
      }}
    >
      <img
        src={LOGO}
        alt="ARTE FACTO"
        className="absolute left-[max(24px,3.75vw)] w-[min(232px,17.5vw)]"
        style={{ top: `calc(${navbarHeight}px + min(24px, 1.2vw))` }}
      />
      <div
        ref={ghostRef}
        className={`absolute left-[max(24px,3.75vw)] w-[min(232px,17.5vw)] transition-opacity duration-300 ${cls.labelRow}`}
        style={{ top: `calc(${navbarHeight}px + min(24px, 1.2vw) + min(130px, 9.8vw) + 4px)` }}
      >
        <span>CONOCE</span>
        <span>MÁS</span>
      </div>
    </div>
  );
}
