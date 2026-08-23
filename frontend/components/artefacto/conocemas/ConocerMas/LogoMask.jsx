'use client';

import { LOGO } from './content';
import { cls } from './classes';

/**
 * LogoMask - Bloque crema superior-izquierdo
 * Contiene el logo + "CONOCE MÁS"
 * Los subtemas pasan POR DETRÁS de este bloque al salir (z-10 vs z-2 del main)
 *
 * IMPORTANTE: maskRef debe estar en el contenedor principal porque el código
 * usa getBoundingClientRect().bottom para calcular posiciones de los sticky labels
 */
export default function LogoMask({ maskRef, ghostRef, navbarHeight = 80 }) {
  return (
    <>
      {/* Extensor de fondo - cubre el gap entre el LogoMask y los sticky labels */}
      <div
        className="fixed left-0 z-[9] bg-crema pointer-events-none"
        style={{
          top: 0,
          width: '25vw',
          minWidth: '250px',
          // Altura extendida para cubrir hasta donde empiezan los sticky labels
          height: `calc(${navbarHeight}px + min(24px, 1.2vw) + min(130px, 9.8vw) + 60px)`,
        }}
      />

      {/* Contenedor principal con maskRef - usado para calcular posiciones */}
      <div
        ref={maskRef}
        className="fixed left-0 z-10 w-[25vw] bg-crema pointer-events-none"
        style={{
          top: 0,
          paddingTop: `${navbarHeight}px`,
          // Altura que cubre logo + espacio para el label ghost
          height: `calc(${navbarHeight}px + min(24px, 1.2vw) + min(130px, 9.8vw))`,
          // Ancho mínimo para pantallas pequeñas
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
        {/* Label "CONOCE MÁS" - ghost que se desvanece */}
        <div
          ref={ghostRef}
          className={`absolute left-[max(24px,3.75vw)] w-[min(232px,17.5vw)] transition-opacity duration-300 ${cls.labelRow}`}
          style={{ top: `calc(${navbarHeight}px + min(24px, 1.2vw) + min(130px, 9.8vw))` }}
        >
          <span>CONOCE</span>
          <span>MÁS</span>
        </div>
      </div>
    </>
  );
}
