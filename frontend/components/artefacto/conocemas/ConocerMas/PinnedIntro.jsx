'use client';

import { INTRO } from './content';
import { cls, CSS, NAVBAR_HEIGHT } from './classes';

/**
 * PinnedIntro - Copia fija del manifiesto
 * Se muestra cuando el párrafo en flujo alcanza lo alto de la pantalla
 * El contenido posterior desaparece por detrás
 *
 * ALTURA: Usa CSS.stickyLabelBottom para que la línea roja coincida
 * exactamente con la línea del sticky label en cualquier pantalla
 *
 * NOTA: El left y width se asignan dinámicamente via JavaScript
 * para que coincida exactamente con la posición del texto en flow
 */
export default function PinnedIntro({ pinRef, navbarHeight = NAVBAR_HEIGHT }) {
  // Altura = posición del borde inferior del sticky label
  const pinHeight = CSS.stickyLabelBottom(navbarHeight);

  return (
    <div
      ref={pinRef}
      className={`fixed z-[10] hidden bg-crema ${cls.rule}`}
      style={{
        top: 0,
        height: pinHeight,
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <p className={`m-0 ${cls.body}`}>{INTRO}</p>
    </div>
  );
}
