import { COLORS, FONTS, sectionHeaderStyle, h2Style } from './theme';

// <SectionHeader num="01" title="Acerca de ARTEFACTO" dark={false}>...extra derecha...</SectionHeader>
export default function SectionHeader({ num, title, dark = false, children }) {
  return (
    <div style={sectionHeaderStyle(dark)}>
      <span style={{ fontFamily: FONTS.display, fontSize: 22, color: COLORS.red }}>{num}</span>
      <h2 style={h2Style}>{title}</h2>
      {children}
    </div>
  );
}
