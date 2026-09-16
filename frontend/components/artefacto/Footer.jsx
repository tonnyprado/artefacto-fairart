'use client';
import { useState, useEffect } from 'react';
import { COLORS, container } from './theme';

const colTitle = { margin: '0 0 12px', fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: COLORS.red };
const link = { color: 'rgba(244,237,228,0.75)', textDecoration: 'none', fontSize: 13 };
const col = { display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 };

export default function Footer() {
  const [isMobile, setIsMobile] = useState(false);

  const NAV = [
    { label: 'Inicio', href: '#hero' },
    { label: 'Conoce más', href: '#about' },
    { label: 'Convocatoria', href: '#convocatoria' },
    { label: 'Calendario', href: '#calendario' },
    { label: 'Contacto', href: '#contacto' },
  ];

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Estilos responsive
  const gridStyle = isMobile
    ? { display: 'flex', flexDirection: 'column', gap: 32, paddingBottom: 32 }
    : { display: 'grid', gridTemplateColumns: '1.6fr 1fr 1.4fr', gap: 40, paddingBottom: 32 };

  const logoSectionStyle = isMobile
    ? { textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }
    : {};

  const footerBarStyle = isMobile
    ? { borderTop: '1px solid rgba(244,237,228,0.15)', padding: '20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, fontSize: 11, color: 'rgba(244,237,228,0.5)', textAlign: 'center' }
    : { borderTop: '1px solid rgba(244,237,228,0.15)', padding: '20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', fontSize: 12, color: 'rgba(244,237,228,0.5)' };

  return (
    <footer style={{ background: COLORS.black, color: COLORS.cream, padding: isMobile ? '32px 16px 0' : '40px 24px 0' }}>
      <div style={container}>
        <div style={gridStyle}>
          <div style={logoSectionStyle}>
            <img src="/assets/footer-logo.svg" alt="ARTEFACTO" style={{ width: isMobile ? 140 : 160, display: 'block', marginBottom: 16 }} />
            <p style={{ margin: 0, fontSize: isMobile ? 12 : 13, lineHeight: 1.6, color: 'rgba(244,237,228,0.6)', maxWidth: 260 }}>
              Plataforma de artistas emergentes y espacios independientes.
            </p>
          </div>
          <div style={isMobile ? { textAlign: 'center' } : {}}>
            <h4 style={colTitle}>Navegación</h4>
            <div style={{ ...col, alignItems: isMobile ? 'center' : 'flex-start' }}>
              {NAV.map((n) => <a key={n.label} href={n.href} style={link}>{n.label}</a>)}
            </div>
          </div>
          <div style={isMobile ? { textAlign: 'center' } : {}}>
            <h4 style={colTitle}>Contacto</h4>
            <div style={{ ...col, alignItems: isMobile ? 'center' : 'flex-start' }}>
              <a href="mailto:convocatoria@arte-facto.mx" style={{ ...link, fontSize: isMobile ? 12 : 13 }}>convocatoria@arte-facto.mx</a>
              <span style={{ ...link, fontSize: isMobile ? 11 : 12, lineHeight: 1.5, display: 'block', marginTop: 4, whiteSpace: 'pre-line' }}>
                CDMX, México
              </span>
              <div style={{ display: 'flex', gap: 12, marginTop: 12, fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', justifyContent: isMobile ? 'center' : 'flex-start' }}>
                <a href="https://www.instagram.com/artefacto.feria?igsh=MTNrcWwwajIycjh6dg%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" style={{ color: COLORS.cream, textDecoration: 'none' }}>IG</a>
                <a href="https://wa.me/525578363207?text=Hola%2C%20me%20gustar%C3%ADa%20obtener%20m%C3%A1s%20informaci%C3%B3n%20sobre%20ARTEFACTO" target="_blank" rel="noopener noreferrer" style={{ color: COLORS.cream, textDecoration: 'none' }}>WA</a>
              </div>
            </div>
          </div>
        </div>
        <div style={footerBarStyle}>
          <span>© {new Date().getFullYear()} Todos los derechos reservados</span>
          <div style={{ display: 'flex', gap: 16 }}>
            <a href="/terms" style={{ color: 'rgba(244,237,228,0.6)', textDecoration: 'none', fontSize: 11 }}>Términos y condiciones</a>
            <a href="/privacy-policy" style={{ color: 'rgba(244,237,228,0.6)', textDecoration: 'none', fontSize: 11 }}>Política de privacidad</a>
          </div>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>Hecho en México <img src="/assets/star-red.svg" alt="" style={{ width: 10, height: 10 }} /></span>
        </div>
      </div>
    </footer>
  );
}
