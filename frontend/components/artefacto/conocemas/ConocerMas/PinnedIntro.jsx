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
 * IMPORTANTE: Usa height fija basada en la posición del sticky label
 * para garantizar alineación perfecta en todos los dispositivos
 */
export default function PinnedIntro({ pinRef, navbarHeight = NAVBAR_HEIGHT }) {
  // Posición donde está el borde inferior del sticky label
  const stickyLabelBottom = CSS.stickyLabelBottom(navbarHeight);

  return (
    <div
      ref={pinRef}
      className={`fixed z-[10] hidden bg-crema ${cls.rule}`}
      style={{
        top: 0,
        // Usar height fija para garantizar que el borde inferior
        // se alinee perfectamente con la línea del sticky label
        height: stickyLabelBottom,
        // Box-sizing border-box para que padding no afecte height
        boxSizing: 'border-box',
        // Padding para posicionar el texto
        paddingTop: `max(${navbarHeight}px, 10vh)`,
        paddingLeft: 'max(16px, 1.2vw)',
        paddingRight: '16px',
        // El texto se posiciona dentro del contenedor y el borde
        // queda exactamente donde debe estar
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        // Overflow hidden para evitar que el texto se desborde
        overflow: 'hidden',
      }}
    >
      <p className={`m-0 ${cls.body}`}>{INTRO}</p>
    </div>
  );
}
