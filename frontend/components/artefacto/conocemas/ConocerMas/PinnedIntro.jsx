'use client';

import { INTRO } from './content';
import { cls } from './classes';

/**
 * PinnedIntro - Copia fija del manifiesto
 * Se muestra cuando el párrafo en flujo alcanza lo alto de la pantalla
 * El contenido posterior desaparece por detrás
 *
 * NOTA: El left y width se asignan dinámicamente via JavaScript en index.jsx
 * El bloque se extiende desde top:0 para cubrir completamente el área del navbar
 */
export default function PinnedIntro({ pinRef, navbarHeight = 80 }) {
  return (
    <div
      ref={pinRef}
      className="fixed z-[10] hidden bg-crema pb-2 border-b border-rojo/35"
      style={{
        top: 0,
        // Alinear el borde inferior con el sticky label (label top + 35px altura - ~108px para contenido)
        paddingTop: `calc(${navbarHeight}px + min(24px, 1.2vw) + min(130px, 9.8vw) + 18px + 35px - 108px)`,
        paddingLeft: '17.59px',
      }}
    >
      <p className={`m-0 ${cls.body}`}>{INTRO}</p>
    </div>
  );
}
