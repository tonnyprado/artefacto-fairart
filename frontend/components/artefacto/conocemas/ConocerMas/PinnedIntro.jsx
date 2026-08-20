'use client';

import { INTRO } from './content';
import { cls } from './classes';

/**
 * PinnedIntro - Copia fija del manifiesto
 * Se muestra cuando el párrafo en flujo alcanza lo alto de la pantalla
 * El contenido posterior desaparece por detrás
 *
 * NOTA: El left y width se asignan dinámicamente via JavaScript en index.jsx
 */
export default function PinnedIntro({ pinRef, navbarHeight = 80 }) {
  return (
    <div
      ref={pinRef}
      className="fixed z-[9] hidden bg-crema pt-4 pb-[22px] border-b border-rojo/35"
      style={{
        top: `${navbarHeight}px`,
        paddingLeft: '17.59px',
      }}
    >
      <p className={`m-0 ${cls.body}`}>{INTRO}</p>
    </div>
  );
}
