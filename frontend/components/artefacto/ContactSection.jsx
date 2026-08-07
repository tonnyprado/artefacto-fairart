'use client';
import { useState } from 'react';
import { COLORS, FONTS, container } from './theme';

const DATOS = [
  { label: 'Email General', value: 'convocatoria@artefacto.mx', href: 'mailto:convocatoria@artefacto.mx' },
  { label: 'Email Curatorial', value: 'artefacto.curatorial@gmail.com', href: 'mailto:artefacto.curatorial@gmail.com' },
];

const REDES = [
  { label: 'Instagram ↗', href: 'https://instagram.com/artefacto' },
  { label: 'Facebook ↗', href: 'https://facebook.com/artefacto' },
];

const inputStyle = { border: `2px solid ${COLORS.black}`, background: COLORS.creamDark, padding: 14, fontFamily: FONTS.body, fontSize: 15, borderRadius: 16 };
const labelStyle = { display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' };

export default function ContactSection({ onSubmit }) {
  const [status, setStatus] = useState('idle'); // idle | sending | sent

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setStatus('sending');
    try {
      if (onSubmit) await onSubmit(data); // conecta aquí tu API real
      else await new Promise((r) => setTimeout(r, 1200)); // demo
      setStatus('sent');
      form.reset();
    } catch {
      setStatus('idle');
    }
  };

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .contact-grid {
            grid-template-columns: 1fr !important;
          }
          .contact-form-grid {
            grid-template-columns: 1fr !important;
          }
          .contact-data-grid {
            grid-template-columns: 1fr !important;
            gap: 8px !important;
          }
        }
      `}</style>
      <section id="contacto" style={{ background: COLORS.red, color: COLORS.black, padding: '150px 24px 96px' }}>
        <div style={container}>
          <h2 style={{
            margin: '0 0 48px',
            fontFamily: FONTS.display,
            fontWeight: FONTS.displayWeight,
            fontStyle: FONTS.displayStyle,
            fontSize: 'clamp(40px,6vw,72px)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: COLORS.cream,
            textAlign: 'center'
          }}>Contacto</h2>
          <p style={{ margin: '0 auto 56px', maxWidth: 640, fontSize: 20, lineHeight: 1.6, textAlign: 'center' }}>¿Tienes dudas? Contáctanos y con gusto te atenderemos</p>

          <div className="contact-grid" style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: 48, alignItems: 'start' }}>
          <div>
            {DATOS.map((d) => (
              <div key={d.label} className="contact-data-grid" style={{ borderTop: `2px solid ${COLORS.black}`, padding: '22px 0', display: 'grid', gridTemplateColumns: '130px 1fr', gap: 16, alignItems: 'baseline' }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: COLORS.cream }}>{d.label}</div>
                {d.href
                  ? <a href={d.href} target={d.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" style={{ fontSize: 17, fontWeight: 500, color: COLORS.black, textDecoration: 'none' }}>{d.value}</a>
                  : <div style={{ fontSize: 17, fontWeight: 500, lineHeight: 1.5 }}>{d.value}</div>}
              </div>
            ))}
            <div className="contact-data-grid" style={{ borderTop: `2px solid ${COLORS.black}`, borderBottom: `2px solid ${COLORS.black}`, padding: '22px 0', display: 'grid', gridTemplateColumns: '130px 1fr', gap: 16, alignItems: 'baseline' }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: COLORS.cream }}>Síguenos</div>
              <div style={{ display: 'flex', gap: 20, fontSize: 15, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {REDES.map((r) => <a key={r.label} href={r.href} target="_blank" rel="noopener noreferrer" style={{ color: COLORS.black, textDecoration: 'none' }}>{r.label}</a>)}
              </div>
            </div>
            <img src="/assets/monogram-a-black.svg" alt="" style={{ width: 120, marginTop: 48 }} />
          </div>

          <div style={{ border: `2px solid ${COLORS.black}`, background: COLORS.cream, padding: 40, borderRadius: 16 }}>
            <h3 style={{
              margin: '0 0 28px',
              fontFamily: FONTS.display,
              fontWeight: FONTS.displayWeight,
              fontStyle: FONTS.displayStyle,
              fontSize: 26,
              letterSpacing: '0.04em',
              textTransform: 'uppercase'
            }}>Envíanos un mensaje</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div className="contact-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                <label style={labelStyle}>Nombre completo<input name="nombre" required placeholder="Tu nombre" style={inputStyle} /></label>
                <label style={labelStyle}>Email<input name="email" type="email" required placeholder="tu@email.com" style={inputStyle} /></label>
              </div>
              <div className="contact-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                <label style={labelStyle}>Teléfono<input name="telefono" type="tel" placeholder="55 1234 5678" style={inputStyle} /></label>
                <label style={labelStyle}>Asunto<input name="asunto" required placeholder="Motivo de tu mensaje" style={inputStyle} /></label>
              </div>
              <label style={labelStyle}>Mensaje<textarea name="mensaje" required rows={5} placeholder="Escribe tu mensaje aquí..." style={{ ...inputStyle, resize: 'vertical' }} /></label>
              <button type="submit" disabled={status === 'sending'}
                style={{ background: COLORS.red, color: COLORS.cream, border: 'none', padding: 18, fontFamily: FONTS.body, fontWeight: 700, fontSize: 14, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: 16 }}>
                {status === 'sending' ? 'Enviando...' : 'Enviar Mensaje'}
              </button>
            </form>
            {status === 'sent' && (
              <div style={{ marginTop: 18, border: `2px solid ${COLORS.black}`, background: COLORS.creamDark, padding: '16px 20px', fontSize: 15, fontWeight: 600, borderRadius: 16 }}>
                ¡Mensaje enviado! Te responderemos pronto.
              </div>
            )}
          </div>
        </div>
        </div>
      </section>
    </>
  );
}
