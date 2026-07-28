import SectionHeader from './SectionHeader';
import { COLORS, FONTS, container } from './theme';

const FASES = [
  { n: '1', title: 'Fase 1', fecha: 'Agosto — Octubre 2026', desc: 'Primera ronda de selección', activa: true },
  { n: '2', title: 'Fase 2', fecha: 'Octubre — Diciembre 2026', desc: 'Segunda ronda de selección' },
  { n: '3', title: 'Fase 3', fecha: 'Diciembre 2026 — Enero 2027', desc: 'Tercera ronda de selección' },
  { n: '4', title: 'Concurso', fecha: 'Enero 2027', desc: 'Concurso especial por invitación' },
];

const REQUISITOS = ['Ser mayor de 18 años', 'Obra original y de autoría propia', 'CV artístico actualizado', 'Portfolio digital (mínimo 5 obras)', 'Fotografía de identificación oficial', 'Disponibilidad para exponer en Febrero 2027'];
const BENEFICIOS = ['Espacio de exhibición profesional', 'Difusión en redes sociales y medios', 'Networking con coleccionistas y galeristas', 'Posibilidad de venta de obras', 'Certificado de participación', 'Acceso a eventos exclusivos'];

const listItem = { display: 'flex', gap: 12 };
const listUl = { margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14, fontSize: 16, lineHeight: 1.5 };
const btn = (bg, color) => ({ background: bg, color, padding: '18px 32px', fontWeight: 700, fontSize: 14, letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none' });

export default function ConvocatoriaSection({ edicion = '2027', abierta = true, urlRegistro = '#contacto', urlConvocatoria = '#contacto' }) {
  return (
    <section id="convocatoria" style={{ scrollMarginTop: 88, background: COLORS.red, color: COLORS.cream, padding: '150px 24px 96px' }}>
      <div style={container}>
        <SectionHeader num="02" title="Convocatoria" dark>
          <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10, background: COLORS.black, color: COLORS.cream, padding: '10px 18px', fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
            <span style={{ width: 8, height: 8, background: COLORS.cream, borderRadius: '50%', animation: 'pulse 2s infinite' }} />
            {abierta ? 'Inscripciones Abiertas' : 'Próximamente'}
          </span>
        </SectionHeader>

        <div style={{ marginTop: 28, display: 'inline-flex', alignItems: 'center', gap: 12, border: `2px solid ${COLORS.cream}`, padding: '12px 20px', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          <img src="/assets/star-cream.svg" alt="" style={{ width: 16, height: 16 }} />El botón de registro se encuentra más abajo ↓
        </div>

        <p style={{ margin: '40px 0 0', maxWidth: 760, fontSize: 20, lineHeight: 1.6, color: 'rgba(244,237,228,0.85)' }}>
          Invitamos a artistas emergentes a formar parte de ARTEFACTO {edicion}. Participa en nuestro proceso de
          selección por fases y comparte tu talento con coleccionistas y amantes del arte.
        </p>

        <h3 style={{ margin: '64px 0 24px', fontFamily: FONTS.display, fontSize: 28, letterSpacing: '0.04em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 14 }}>
          <img src="/assets/star-cream.svg" alt="" style={{ width: 20, height: 20 }} />Fases de Selección
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
          {FASES.map((f) => {
            const on = f.activa && abierta;
            return (
              <div key={f.n} style={{ border: on ? `2px solid ${COLORS.black}` : '2px solid rgba(244,237,228,0.35)', background: on ? COLORS.black : 'transparent', padding: 28, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontFamily: FONTS.display, fontSize: 52, lineHeight: 1, color: on ? COLORS.cream : COLORS.black }}>{f.n}</div>
                <h4 style={{ margin: '8px 0 0', fontFamily: FONTS.display, fontSize: 22, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{f.title}</h4>
                <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: on ? 'rgba(244,237,228,0.85)' : 'rgba(244,237,228,0.6)' }}>{f.fecha}</div>
                <p style={{ margin: '4px 0 12px', fontSize: 14, lineHeight: 1.5, color: on ? 'rgba(244,237,228,0.9)' : 'rgba(244,237,228,0.75)' }}>{f.desc}</p>
                <span style={{ marginTop: 'auto', alignSelf: 'flex-start', border: on ? `1px solid ${COLORS.cream}` : '1px solid rgba(244,237,228,0.4)', padding: '6px 12px', fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: on ? COLORS.cream : 'rgba(244,237,228,0.7)' }}>
                  {on ? 'Abierta' : 'Próximamente'}
                </span>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 64 }}>
          <div style={{ background: COLORS.cream, color: COLORS.black, padding: 40 }}>
            <h3 style={{ margin: '0 0 24px', fontFamily: FONTS.display, fontSize: 26, letterSpacing: '0.04em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 12 }}>
              <img src="/assets/star-black.svg" alt="" style={{ width: 18, height: 18 }} />Requisitos
            </h3>
            <ul style={listUl}>
              {REQUISITOS.map((r) => <li key={r} style={listItem}><span style={{ color: COLORS.red, fontWeight: 700 }}>→</span>{r}</li>)}
            </ul>
          </div>
          <div style={{ background: COLORS.black, color: COLORS.cream, padding: 40 }}>
            <h3 style={{ margin: '0 0 24px', fontFamily: FONTS.display, fontSize: 26, letterSpacing: '0.04em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 12 }}>
              <img src="/assets/star-cream.svg" alt="" style={{ width: 18, height: 18 }} />Beneficios
            </h3>
            <ul style={listUl}>
              {BENEFICIOS.map((b) => <li key={b} style={listItem}><span style={{ fontWeight: 700 }}>→</span>{b}</li>)}
            </ul>
          </div>
        </div>

        <div style={{ marginTop: 64, border: `2px solid ${COLORS.cream}`, padding: 48, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 32, justifyContent: 'space-between' }}>
          <div style={{ padding: '8px 0' }}>
            <h3 style={{ margin: '0 0 8px', fontFamily: FONTS.display, fontSize: 34, letterSpacing: '0.03em', textTransform: 'uppercase' }}>¿Listo para participar?</h3>
            <p style={{ margin: 0, fontSize: 16, color: 'rgba(244,237,228,0.8)', maxWidth: 480 }}>Descarga la convocatoria completa y regístrate para formar parte de ARTEFACTO {edicion}</p>
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <a href={urlConvocatoria} style={btn(COLORS.cream, COLORS.black)}>Descargar Convocatoria</a>
            <a href={urlRegistro} style={btn(COLORS.black, COLORS.cream)}>{abierta ? 'Registrarse Ahora' : 'Inscripciones Cerradas'}</a>
          </div>
        </div>

        <div style={{ marginTop: 32, borderLeft: `4px solid ${COLORS.black}`, background: 'rgba(20,18,16,0.15)', padding: '24px 28px' }}>
          <h4 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: COLORS.cream }}>Proceso de Selección</h4>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: 'rgba(244,237,228,0.8)' }}>
            Las inscripciones se revisan por un equipo de curadores profesionales. Aproximadamente el{' '}
            <strong style={{ color: COLORS.cream }}>20% de los artistas inscritos</strong> en cada fase serán seleccionados
            para participar en la feria. Los resultados se notifican por correo electrónico al finalizar el periodo de votación de cada fase.
          </p>
        </div>
      </div>
    </section>
  );
}
