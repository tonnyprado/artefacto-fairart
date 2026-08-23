'use client';

import { INTRO } from './content';
import { cls, CSS, NAVBAR_HEIGHT } from './classes';

/**
 * PinnedIntro - Copia fija del manifiesto
 * Se muestra cuando el párrafo en flujo alcanza lo alto de la pantalla
 * El contenido posterior desaparece por detrás
 *
 * NOTA: El left y width se asignan dinámicamente via JavaScript en index.jsx
 * La línea roja inferior debe alinearse con la línea del sticky label
 *
 * IMPORTANTE: No usar height fija - usar paddingBottom para que el borde
 * quede alineado sin importar la altura del texto
 */
export default function PinnedIntro({ pinRef, navbarHeight = NAVBAR_HEIGHT }) {
  // Posición donde termina el sticky label (donde está su línea roja)
  const stickyLabelTop = CSS.stickyLabelTop(navbarHeight);

  return (
    <div
      ref={pinRef}
      className={`fixed z-[10] hidden bg-crema ${cls.rule}`}
      style={{
        top: 0,
        // NO usar height - dejar que el contenido defina la altura
        // El borde se alinea con paddingBottom calculado
        paddingTop: `max(${navbarHeight}px, 10vh)`,
        // Padding bottom = distancia desde el final del texto hasta la línea del sticky label
        // Usamos la posición del sticky label + altura del label como referencia
        paddingBottom: `calc(${stickyLabelTop} - max(${navbarHeight}px, 10vh) - 4em + clamp(28px, 2vw, 40px))`,
        paddingLeft: 'max(16px, 1.2vw)',
        paddingRight: '16px',
      }}
    >
      <p className={`m-0 ${cls.body}`}>{INTRO}</p>
    </div>
  );
}
