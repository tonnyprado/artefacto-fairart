import { COLORS, container } from './theme';

const NAV = [
  { label: 'Inicio', href: '#hero' },
  { label: 'Conoce Más', href: '#about' },
  { label: 'Convocatoria', href: '#convocatoria' },
  { label: 'Calendario', href: '#calendario' },
  { label: 'Contacto', href: '#contacto' },
];

const colTitle = { margin: '0 0 12px', fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: COLORS.red };
const link = { color: 'rgba(244,237,228,0.75)', textDecoration: 'none', fontSize: 13 };
const col = { display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 };

export default function Footer() {
  return (
    <footer style={{ background: COLORS.black, color: COLORS.cream, padding: '40px 24px 0' }}>
      <div style={container}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1.4fr', gap: 40, paddingBottom: 32 }}>
          <div>
            <img src="/assets/logo-lockup-cream.svg" alt="ARTEFACTO" style={{ width: 160, display: 'block', marginBottom: 16 }} />
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: 'rgba(244,237,228,0.6)', maxWidth: 260 }}>
              Feria de Arte Contemporáneo. Impulsando el talento de artistas emergentes.
            </p>
          </div>
          <div>
            <h4 style={colTitle}>Navegación</h4>
            <div style={col}>{NAV.map((n) => <a key={n.label} href={n.href} style={link}>{n.label}</a>)}</div>
          </div>
          <div>
            <h4 style={colTitle}>Contacto</h4>
            <div style={col}>
              <a href="mailto:convocatoria@artefacto.mx" style={link}>convocatoria@artefacto.mx</a>
              <a href="mailto:artefacto.curatorial@gmail.com" style={link}>artefacto.curatorial@gmail.com</a>
              <span style={{ ...link, fontSize: 12, lineHeight: 1.5, display: 'block', marginTop: 4 }}>
                Centro Cultural Estación Indianilla<br />
                Claudio Bernard 111, Col. Doctores<br />
                Cuauhtémoc, 06720 CDMX
              </span>
              <div style={{ display: 'flex', gap: 12, marginTop: 12, fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {[['IG', 'https://instagram.com/artefacto'], ['FB', 'https://facebook.com/artefacto']].map(([t, h]) => (
                  <a key={t} href={h} target="_blank" rel="noopener noreferrer" style={{ color: COLORS.cream, textDecoration: 'none' }}>{t}</a>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(244,237,228,0.15)', padding: '20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', fontSize: 12, color: 'rgba(244,237,228,0.5)' }}>
          <span>© 2027 ARTE FACTO. Todos los derechos reservados.</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>Hecho en México <img src="/assets/star-red.svg" alt="" style={{ width: 10, height: 10 }} /></span>
        </div>
      </div>
    </footer>
  );
}
