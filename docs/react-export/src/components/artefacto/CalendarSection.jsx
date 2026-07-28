import SectionHeader from './SectionHeader';
import { COLORS, FONTS, container } from './theme';

// kind: 'launch' (rombo rojo) | 'phase' (rombo negro) | 'vote' (rombo outline) | 'final' (tarjeta roja)
export const EVENTOS = [
  { fecha: 'Agosto 2026', tag: 'Lanzamiento', title: 'Lanzamiento Convocatoria', desc: 'Apertura oficial de la convocatoria y Fase 1', kind: 'launch' },
  { fecha: 'Ago — Oct 2026', tag: 'Fase 1 · Inscripciones', title: 'Fase 1: Inscripciones', desc: 'Periodo de inscripción para artistas — Primera fase', kind: 'phase' },
  { fecha: 'Octubre 2026', tag: 'Votación', title: 'Votación Fase 1', desc: 'Curadores votan por artistas de la Fase 1', kind: 'vote' },
  { fecha: 'Oct — Dic 2026', tag: 'Fase 2 · Inscripciones', title: 'Fase 2: Inscripciones', desc: 'Periodo de inscripción — Segunda fase', kind: 'phase' },
  { fecha: 'Diciembre 2026', tag: 'Votación', title: 'Votación Fase 2', desc: 'Curadores votan por artistas de la Fase 2', kind: 'vote' },
  { fecha: 'Dic 2026 — Ene 2027', tag: 'Fase 3 · Inscripciones', title: 'Fase 3: Inscripciones', desc: 'Periodo de inscripción — Tercera fase', kind: 'phase' },
  { fecha: 'Enero 2027', tag: 'Votación', title: 'Votación Fase 3', desc: 'Curadores votan por artistas de la Fase 3', kind: 'vote' },
  { fecha: 'Enero 2027', tag: 'Especial', title: 'Concurso Especial', desc: 'Inscripción y votación para el concurso', kind: 'launch' },
  { fecha: 'Febrero 2027', tag: 'Evento Principal', title: 'ARTEFACTO 2027', desc: '¡Feria de Arte! Exhibición de obras seleccionadas', kind: 'final' },
];

const RESUMEN = [
  { title: 'Inscripciones', text: '3 fases de inscripción durante 6 meses' },
  { title: 'Votaciones', text: 'Curadores profesionales evalúan cada fase' },
  { title: 'Feria', text: 'Evento final en Febrero 2027' },
];

const diamond = (kind) => ({
  position: 'absolute', left: '50%', top: 28, width: 12, height: 12,
  transform: 'translateX(-50%) rotate(45deg)',
  background: kind === 'vote' ? COLORS.cream : kind === 'phase' ? COLORS.black : COLORS.red,
  border: kind === 'vote' ? `2px solid ${COLORS.red}` : 'none',
});

export default function CalendarSection({ eventos = EVENTOS }) {
  return (
    <section id="calendario" style={{ scrollMarginTop: 88, background: COLORS.cream, padding: '150px 24px 96px' }}>
      <div style={container}>
        <SectionHeader num="03" title="Calendario" />
        <p style={{ margin: '40px 0 56px', maxWidth: 640, fontSize: 20, lineHeight: 1.6 }}>Conoce las fechas importantes del proceso de selección y la feria</p>

        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
          {eventos.map((ev, i) => {
            const esFinal = ev.kind === 'final';
            const tagRojo = ['launch', 'vote', 'final'].includes(ev.kind);
            return (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '200px 40px 1fr', alignItems: 'stretch' }}>
                <div style={{ textAlign: 'right', padding: esFinal ? '28px 0' : '20px 0', fontFamily: FONTS.display, fontSize: 19, color: tagRojo ? COLORS.red : COLORS.black }}>{ev.fecha}</div>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '50%', top: 0, ...(esFinal ? { height: 28 } : { bottom: 0 }), width: 2, background: COLORS.black }} />
                  <div style={esFinal ? { ...diamond(ev.kind), top: 32, width: 16, height: 16 } : diamond(ev.kind)} />
                </div>
                {esFinal ? (
                  <div style={{ padding: '12px 0 0' }}>
                    <div style={{ background: COLORS.red, color: COLORS.cream, padding: '28px 32px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <img src="/assets/star-cream.svg" alt="" style={{ width: 18, height: 18 }} />
                        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase' }}>{ev.tag}</div>
                      </div>
                      <h4 style={{ margin: '0 0 6px', fontFamily: FONTS.display, fontSize: 28, letterSpacing: '0.03em', textTransform: 'uppercase' }}>{ev.title}</h4>
                      <p style={{ margin: 0, fontSize: 15, color: 'rgba(244,237,228,0.9)' }}>{ev.desc}</p>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '20px 0 28px' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: tagRojo ? COLORS.red : COLORS.gray, marginBottom: 6 }}>{ev.tag}</div>
                    <h4 style={{ margin: '0 0 4px', fontFamily: FONTS.display, fontSize: 20, letterSpacing: '0.03em', textTransform: 'uppercase' }}>{ev.title}</h4>
                    <p style={{ margin: 0, fontSize: 15, color: COLORS.gray }}>{ev.desc}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24, marginTop: 72 }}>
          {RESUMEN.map((r) => (
            <div key={r.title} style={{ border: `2px solid ${COLORS.black}`, padding: 28, background: COLORS.creamDark }}>
              <div style={{ fontFamily: FONTS.display, fontSize: 15, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.red, marginBottom: 8 }}>{r.title}</div>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55 }}>{r.text}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 32, borderLeft: `4px solid ${COLORS.black}`, background: COLORS.creamDark, padding: '24px 28px' }}>
          <h4 style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Nota Importante</h4>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: COLORS.gray }}>
            Las fechas están sujetas a cambios. Te notificaremos por email sobre cualquier actualización en el calendario.
            Mantente atento a tu correo electrónico registrado.
          </p>
        </div>
      </div>
    </section>
  );
}
