// Clases compartidas del sistema CONOCE MÁS (Tailwind)
// Mantener sincronizadas entre componentes

// Altura del navbar para offset
export const NAVBAR_HEIGHT = 80;

export const cls = {
  // Subtemas / palabras etimológicas / numerales — Inter Tight Black Italic
  display: 'italic font-black tracking-[-0.02em] text-[clamp(16px,1.35vw,26px)]',
  displayInk: 'italic font-black tracking-[-0.02em] text-[clamp(16px,1.35vw,26px)] text-tinta',
  labelRow: 'flex justify-between italic font-black tracking-[-0.02em] text-[clamp(16px,1.35vw,26px)] text-rojo',

  // Encabezados grandes (FORJAR CULTURA / ESTACIÓN INDIANILLA)
  h2: 'italic font-semibold tracking-[-0.05em] leading-[1.02] text-[clamp(26px,2.4vw,46px)] text-tinta',

  // Cuerpo
  body: 'text-[clamp(13.5px,0.92vw,17.5px)] leading-[1.55] text-tinta [text-wrap:pretty]',
  caption: 'text-[clamp(11.5px,0.79vw,15px)] leading-[1.47] text-tinta/75',

  // Geometría del bloque del logo (ajustada para navbar)
  // El pinTop ahora incluye el offset del navbar
  maskH: 'h-[calc(min(44px,2.3vw)+min(130px,9.8vw)+2px)]',
  pinTop: `top-[calc(80px+min(44px,2.3vw)+min(130px,9.8vw)+6px)]`,
  labelW: 'w-[calc(max(24px,3.75vw)+min(232px,17.5vw)+14px)]',
  labelPad: 'pb-2 pr-3.5 pl-[max(24px,3.75vw)]',
  rule: 'border-b-[1.33px] border-rojo',
};
