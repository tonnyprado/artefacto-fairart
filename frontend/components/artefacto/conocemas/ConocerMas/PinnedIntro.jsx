'use client';

import { INTRO } from './content';
import { cls, CSS, NAVBAR_HEIGHT } from './classes';

/**
 * PinnedIntro - Copia fija del manifiesto
 * Se muestra cuando el párrafo en flujo alcanza lo alto de la pantalla
 * El contenido posterior desaparece por detrás
 *
 * NOTA: El left y width se asignan dinámicamente via JavaScript en index.jsx
 * La línea roja inferior debe alinearse EXACTAMENTE con la línea del sticky label
 * Usa las constantes CSS compartidas para garantizar alineación en todas las pantallas
 */
export default function PinnedIntro({ pinRef, navbarHeight = NAVBAR_HEIGHT }) {
  return (
    <div
      ref={pinRef}
      className={`fixed z-[10] hidden bg-crema ${cls.rule}`}
      style={{
        top: 0,
        // Altura total = posición del borde del sticky label
        // Esto garantiza que ambas líneas rojas estén alineadas
        height: CSS.stickyLabelBottom(navbarHeight),
        // El texto se posiciona con padding para quedar arriba del borde
        paddingTop: `calc(${CSS.stickyLabelTop(navbarHeight)} - 90px)`,
        paddingLeft: 'max(16px, 1.2vw)',
        // Flexbox para empujar el contenido hacia arriba
        display: 'none', // Se cambia a flex via JS
        flexDirection: 'column',
        justifyContent: 'flex-start',
      }}
    >
      <p className={`m-0 ${cls.body}`}>{INTRO}</p>
    </div>
  );
}
