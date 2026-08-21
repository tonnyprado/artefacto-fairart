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
      className="fixed z-[10] hidden bg-crema pb-[22px] border-b border-rojo/35"
      style={{
        top: 0,
        paddingTop: `${navbarHeight}px`,
        paddingLeft: '17.59px',
      }}
    >
      <p className={`m-0 pt-4 ${cls.body}`}>{INTRO}</p>
    </div>
  );
}
