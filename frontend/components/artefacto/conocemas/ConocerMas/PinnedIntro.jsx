'use client';

import { INTRO } from './content';
import { cls, CSS, NAVBAR_HEIGHT } from './classes';

/**
 * PinnedIntro - Copia fija del manifiesto
 * Se muestra cuando el párrafo en flujo alcanza lo alto de la pantalla
 * El contenido posterior desaparece por detrás
 *
 * NOTA: El left, width y height se asignan dinámicamente via JavaScript en index.jsx
 * La línea roja inferior se alinea midiendo la posición real del sticky label
 */
export default function PinnedIntro({ pinRef, navbarHeight = NAVBAR_HEIGHT }) {
  return (
    <div
      ref={pinRef}
      className={`fixed z-[10] hidden bg-crema ${cls.rule}`}
      style={{
        top: 0,
        // Height se asigna dinámicamente en JS midiendo el sticky label real
        boxSizing: 'border-box',
        // Alinear con el inicio del logo
        paddingTop: `calc(${navbarHeight}px + ${CSS.logoMarginTop})`,
        paddingLeft: 'max(16px, 1.2vw)',
        paddingRight: '16px',
        overflow: 'hidden',
      }}
    >
      <p className={`m-0 ${cls.body}`}>{INTRO}</p>
    </div>
  );
}
