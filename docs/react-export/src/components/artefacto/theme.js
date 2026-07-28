// Tokens de marca ARTEFACTO — edita aquí y se propaga a todos los componentes
export const COLORS = {
  red: '#b83030',
  cream: '#f4ede4',
  creamDark: '#efe7d8',
  black: '#141210',
  gray: '#3d3a36',
};

export const FONTS = {
  display: "'Anton', sans-serif",
  body: "'Archivo', sans-serif",
};

// Encabezado numerado de sección (01, 02, ...)
export const sectionHeaderStyle = (dark = false) => ({
  display: 'flex', alignItems: 'baseline', gap: 20,
  borderBottom: `3px solid ${dark ? COLORS.cream : COLORS.black}`, paddingBottom: 20,
});

export const h2Style = {
  margin: 0, fontFamily: FONTS.display, fontSize: 'clamp(40px,5vw,64px)',
  letterSpacing: '0.02em', textTransform: 'uppercase',
};

export const container = { maxWidth: 1240, margin: '0 auto' };
