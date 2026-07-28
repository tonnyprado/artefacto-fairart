import SectionHeader from './SectionHeader';
import { COLORS, FONTS, container } from './theme';

const h3 = { margin: '72px 0 28px', fontFamily: FONTS.display, fontSize: 30, letterSpacing: '0.04em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 14 };
const card = { border: `2px solid ${COLORS.black}`, padding: 32, background: COLORS.creamDark };

const VALORES = [
  { glyph: '/assets/glyph-c-red.svg', title: 'Calidad', text: 'Selección rigurosa de artistas a través de curadores profesionales' },
  { glyph: '/assets/glyph-a-red.svg', title: 'Inclusión', text: 'Espacio abierto para todas las disciplinas y expresiones artísticas' },
  { glyph: '/assets/glyph-f-red.svg', title: 'Profesionalismo', text: 'Estándares de calidad internacional en organización y curaduría' },
];

export default function AboutSection({ mostrarMapa = true }) {
  return (
    <section id="about" style={{ scrollMarginTop: 88, background: COLORS.cream, padding: '150px 24px 96px' }}>
      <div style={container}>
        <SectionHeader num="01" title="Acerca de ARTEFACTO" />

        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 48, marginTop: 48, alignItems: 'start' }}>
          <p style={{ margin: 0, fontSize: 22, lineHeight: 1.55, fontWeight: 500 }}>
            ARTEFACTO es una feria de arte contemporáneo que nace con el objetivo de impulsar y visibilizar el talento
            de artistas emergentes. Creamos un espacio donde el arte se encuentra con coleccionistas, galeristas y amantes del arte.
          </p>
          <div style={{ background: COLORS.black, color: COLORS.cream, padding: 36 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <img src="/assets/star-red.svg" alt="" style={{ width: 22, height: 22 }} />
              <h3 style={{ margin: 0, fontFamily: FONTS.display, fontSize: 24, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Nuestra Misión</h3>
            </div>
            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.65, color: 'rgba(244,237,228,0.85)' }}>
              Nuestra misión es crear un puente entre artistas emergentes y el mercado del arte, proporcionando una
              plataforma profesional para la exhibición y comercialización de obras contemporáneas.
            </p>
          </div>
        </div>

        <h3 style={h3}><img src="/assets/star-black.svg" alt="" style={{ width: 20, height: 20 }} />Nuestros Valores</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
          {VALORES.map((v) => (
            <div key={v.title} style={card}>
              <img src={v.glyph} alt="" style={{ height: 64, display: 'block', marginBottom: 20 }} />
              <h4 style={{ margin: '0 0 10px', fontFamily: FONTS.display, fontSize: 22, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{v.title}</h4>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: COLORS.gray }}>{v.text}</p>
            </div>
          ))}
        </div>

        <h3 style={h3}><img src="/assets/star-black.svg" alt="" style={{ width: 20, height: 20 }} />Ubicación del Evento</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: 24, alignItems: 'stretch' }}>
          <div style={{ ...card, padding: 36, display: 'flex', flexDirection: 'column', gap: 28 }}>
            <div>
              <h4 style={{ margin: '0 0 8px', fontFamily: FONTS.display, fontSize: 24, letterSpacing: '0.04em', textTransform: 'uppercase', color: COLORS.red }}>Centro de Convenciones CDMX</h4>
              <p style={{ margin: 0, fontSize: 16, lineHeight: 1.7 }}>Av. Reforma 123, Cuauhtémoc<br />Ciudad de México, CDMX<br />C.P. 06600 · México</p>
            </div>
            <div style={{ borderTop: `2px solid ${COLORS.black}`, paddingTop: 24 }}>
              <h5 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Cómo llegar</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 15, lineHeight: 1.5 }}>
                <div><strong>Metro:</strong> Línea 1 — Estación Reforma</div>
                <div><strong>Metrobús:</strong> Línea 4 — Reforma</div>
                <div><strong>Estacionamiento:</strong> Disponible en el lugar</div>
              </div>
            </div>
          </div>
          {mostrarMapa && (
            <div style={{ border: `2px solid ${COLORS.black}`, minHeight: 380, position: 'relative' }}>
              <iframe
                title="Mapa"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3762.6026394046724!2d-99.16580168509398!3d19.432607986886587!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85d1ff35f5bd1563%3A0x6c366f0e2de02ff7!2sCentro%20Hist%C3%B3rico%2C%20CDMX!5e0!3m2!1ses!2smx!4v1234567890"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
                loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
