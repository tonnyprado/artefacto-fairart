import { COLORS, container } from './theme';

const NAV = [
  { label: 'Inicio', href: '#hero' }, { label: 'Acerca de', href: '#about' },
  { label: 'Convocatoria', href: '#convocatoria' }, { label: 'Calendario', href: '#calendario' },
  { label: 'Contacto', href: '#contacto' },
];
const LEGAL = ['Términos y Condiciones', 'Política de Privacidad', 'Aviso de Privacidad'];

const colTitle = { margin: '0 0 18px', fontSize: 12, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: COLORS.red };
const link = { color: 'rgba(244,237,228,0.75)', textDecoration: 'none' };
const col = { display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 };

export default function Footer() {
  return (
    <footer style={{ background: COLORS.black, color: COLORS.cream, padding: '72px 24px 0' }}>
      <div style={container}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1.2fr', gap: 48, paddingBottom: 56 }}>
          <div>
            <img src="/assets/logo-lockup-cream.svg" alt="ARTEFACTO" style={{ width: 180, display: 'block', marginBottom: 20 }} />
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: 'rgba(244,237,228,0.65)', maxWidth: 280 }}>
              Feria de Arte Contemporáneo. Impulsando el talento de artistas emergentes.
            </p>
          </div>
          <div>
            <h4 style={colTitle}>Navegación</h4>
            <div style={col}>{NAV.map((n) => <a key={n.label} href={n.href} style={link}>{n.label}</a>)}</div>
          </div>
          <div>
            <h4 style={colTitle}>Legal</h4>
            <div style={col}>{LEGAL.map((l) => <a key={l} href="#" style={link}>{l}</a>)}</div>
          </div>
          <div>
            <h4 style={colTitle}>Contacto</h4>
            <div style={col}>
              <a href="mailto:info@artefact.com.mx" style={link}>info@artefact.com.mx</a>
              <a href="tel:+525512345678" style={link}>+52 55 1234 5678</a>
              <span style={link}>Av. Reforma 123, Cuauhtémoc, CDMX</span>
              <div style={{ display: 'flex', gap: 14, marginTop: 8, fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {[['IG', 'https://instagram.com/artefact'], ['FB', 'https://facebook.com/artefact'], ['X', 'https://twitter.com/artefact'], ['IN', 'https://linkedin.com/company/artefact']].map(([t, h]) => (
                  <a key={t} href={h} target="_blank" rel="noopener noreferrer" style={{ color: COLORS.cream, textDecoration: 'none' }}>{t}</a>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(244,237,228,0.2)', padding: '24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', fontSize: 13, color: 'rgba(244,237,228,0.55)' }}>
          <span>© 2026 ARTEFACTO. Todos los derechos reservados.</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>Hecho en México <img src="/assets/star-red.svg" alt="" style={{ width: 12, height: 12 }} /></span>
        </div>
      </div>
      <div style={{ marginTop: 8, overflow: 'hidden', lineHeight: 0 }}>
        <img src="/assets/pattern-b-red.svg" alt="" style={{ width: '100%', display: 'block', opacity: 0.5 }} />
      </div>
    </footer>
  );
}
