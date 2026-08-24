// Clases Tailwind compartidas — SOLO estilos estáticos.
// Toda la geometría medida (posiciones, font de subtemas, alturas del bloque
// del logo) la fija useConocerMasScroll a partir del rect real del logo.
export const cls = {
  // Etimologías y numerales — Inter Tight Bold Italic, rojo, minúsculas
  etim: 'italic font-bold lowercase tracking-[-0.052em] text-[clamp(16px,1.35vw,26px)] text-rojo',
  // Kicker que conserva mayúsculas de marca
  kicker: 'italic font-medium tracking-[-0.052em] text-[clamp(16px,1.35vw,26px)] text-tinta',
  // Encabezados grandes (FORJAR CULTURA / ESTACIÓN INDIANILLA)
  h2: 'italic font-semibold tracking-[-0.05em] leading-[1.02] text-[clamp(26px,2.4vw,46px)] text-tinta',
  // Cuerpo: justificado ambos lados
  body: 'text-[clamp(13px,0.89vw,17px)] leading-[1.55] text-tinta text-justify [text-wrap:pretty]',
  caption: 'text-[clamp(11.5px,0.79vw,15px)] leading-[1.47] text-tinta/75',
  // Subtema (label fijo): el resto (left/width/fontSize/padding) lo pone el hook
  label: 'fixed top-0 left-0 z-[3] invisible cursor-pointer will-change-transform box-border flex justify-between italic font-black tracking-[-0.02em] leading-none text-rojo',
  // Línea de subrayado: sale del borde izquierdo de la pantalla
  line: 'absolute bottom-0 right-0 left-[-100vw] h-[1.33px] bg-rojo not-italic',
};
