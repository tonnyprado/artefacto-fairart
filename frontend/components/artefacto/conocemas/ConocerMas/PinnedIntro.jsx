'use client';

import { INTRO } from './content';
import { cls } from './classes';

/**
 * PinnedIntro - Copia fija del manifiesto
 * Se muestra cuando el párrafo en flujo alcanza lo alto de la pantalla
 * El contenido posterior desaparece por detrás
 *
 * NOTA: El left y width se asignan dinámicamente via JavaScript en index.jsx
 * La línea roja inferior debe alinearse con la línea del sticky label
 */
export default function PinnedIntro({ pinRef, navbarHeight = 80 }) {
  // Posición donde empieza el sticky label (justo debajo del logo)
  const stickyLabelTop = `calc(${navbarHeight}px + min(24px, 1.2vw) + min(130px, 9.8vw))`;

  return (
    <div
      ref={pinRef}
      className="fixed z-[10] hidden bg-crema border-b-[1.33px] border-rojo"
      style={{
        top: 0,
        // El texto empieza más arriba
        paddingTop: `calc(${stickyLabelTop} - 100px)`,
        // Padding bottom para que el borde se alinee con el sticky label
        // El sticky label tiene altura aprox de ~30px (texto + padding pb-2)
        paddingBottom: `calc(8px + 30px)`,
        paddingLeft: '17.59px',
      }}
    >
      <p className={`m-0 ${cls.body}`}>{INTRO}</p>
    </div>
  );
}
