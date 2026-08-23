'use client';

import { INTRO } from './content';
import { cls, NAVBAR_HEIGHT } from './classes';

/**
 * PinnedIntro - Copia fija del manifiesto
 * Se muestra cuando el párrafo en flujo alcanza lo alto de la pantalla
 * El contenido posterior desaparece por detrás
 *
 * NOTA: El left, width, height y paddingTop se asignan dinámicamente via JavaScript
 * para que coincida exactamente con la posición del texto en flow
 */
export default function PinnedIntro({ pinRef, navbarHeight = NAVBAR_HEIGHT }) {
  return (
    <div
      ref={pinRef}
      className={`fixed z-[10] hidden bg-crema ${cls.rule}`}
      style={{
        top: 0,
        // Height y paddingTop se asignan dinámicamente en JS
        boxSizing: 'border-box',
        paddingLeft: 'max(16px, 1.2vw)',
        paddingRight: '16px',
        overflow: 'hidden',
      }}
    >
      <p className={`m-0 ${cls.body}`}>{INTRO}</p>
    </div>
  );
}
