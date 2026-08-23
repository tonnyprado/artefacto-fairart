// Clases compartidas del sistema CONOCE MÁS (Tailwind)
// Mantener sincronizadas entre componentes
// IMPORTANTE: Usar estas constantes en TODOS los componentes para consistencia

// ============ CONSTANTES RESPONSIVE ============
// Altura del navbar
export const NAVBAR_HEIGHT = 80;

// Fórmulas CSS responsive - USAR ESTAS EN TODOS LOS COMPONENTES
export const CSS = {
  // Margen superior del logo (desde navbar)
  logoMarginTop: 'min(24px, 1.2vw)',
  // Altura del logo
  logoHeight: 'min(130px, 9.8vw)',
  // Posición donde empieza el sticky label (top del label)
  stickyLabelTop: (navH = NAVBAR_HEIGHT) =>
    `calc(${navH}px + min(24px, 1.2vw) + min(130px, 9.8vw))`,
  // Altura del texto del label (font-size * line-height aprox)
  labelTextHeight: 'clamp(20px, 1.6vw, 32px)',
  // Padding bottom del label
  labelPaddingBottom: '8px',
  // Posición del borde inferior del sticky label
  stickyLabelBottom: (navH = NAVBAR_HEIGHT) =>
    `calc(${navH}px + min(24px, 1.2vw) + min(130px, 9.8vw) + clamp(20px, 1.6vw, 32px) + 8px)`,
};

export const cls = {
  // Subtemas / palabras etimológicas / numerales — Inter Tight Black Italic
  display: 'italic font-black tracking-[-0.02em] text-[clamp(16px,1.35vw,26px)]',
  displayInk: 'italic font-black tracking-[-0.02em] text-[clamp(16px,1.35vw,26px)] text-tinta',
  displayRed: 'italic font-black tracking-[-0.02em] text-[clamp(16px,1.35vw,26px)] text-rojo',
  labelRow: 'flex justify-between italic font-black tracking-[-0.02em] text-[clamp(16px,1.35vw,26px)] text-rojo',

  // Encabezados grandes (FORJAR CULTURA / ESTACIÓN INDIANILLA)
  h2: 'font-bold tracking-[-0.05em] leading-[1.02] text-[clamp(26px,2.4vw,46px)] text-tinta',

  // Cuerpo
  body: 'text-[clamp(13.5px,0.92vw,17.5px)] leading-[1.55] text-tinta [text-wrap:pretty]',
  caption: 'text-[clamp(11.5px,0.79vw,15px)] leading-[1.47] text-tinta/75',

  // Geometría del bloque del logo (ajustada para navbar)
  maskH: 'h-[calc(min(44px,2.3vw)+min(130px,9.8vw)+2px)]',
  pinTop: `top-[calc(80px+min(44px,2.3vw)+min(130px,9.8vw)+6px)]`,
  labelW: 'w-[calc(max(24px,3.75vw)+min(232px,17.5vw)+14px)]',
  labelPad: 'pb-2 pr-3.5 pl-[max(24px,3.75vw)]',
  rule: 'border-b-[1.33px] border-rojo',
};
