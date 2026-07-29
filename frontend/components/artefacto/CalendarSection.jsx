'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { COLORS, FONTS } from './theme';

gsap.registerPlugin(ScrollTrigger);

// Eventos del calendario actualizados según la tabla
export const EVENTOS = [
  { title: 'Apertura de convocatoria', fecha: '1 de agosto de 2026', kind: 'important', tag: 'APERTURA' },
  { title: 'Fase 1 — apertura', fecha: 'Fecha por definir', kind: 'normal', tag: 'FASE 1' },
  { title: 'Fase 1 — cierre', fecha: 'Fecha por definir', kind: 'normal', tag: 'FASE 1' },
  { title: 'Publicación de resultados (Fase 1)', fecha: 'Fecha por definir', kind: 'normal', tag: 'RESULTADOS' },
  { title: 'Fase 2 — apertura', fecha: 'Fecha por definir', kind: 'normal', tag: 'FASE 2' },
  { title: 'Fase 2 — cierre', fecha: 'Fecha por definir', kind: 'normal', tag: 'FASE 2' },
  { title: 'Publicación de resultados (Fase 2)', fecha: 'Fecha por definir', kind: 'normal', tag: 'RESULTADOS' },
  { title: 'Fase 3 — apertura', fecha: 'Fecha por definir', kind: 'normal', tag: 'FASE 3' },
  { title: 'Fase 3 — cierre', fecha: 'Fecha por definir', kind: 'normal', tag: 'FASE 3' },
  { title: 'Publicación de resultados (Fase 3)', fecha: 'Fecha por definir', kind: 'normal', tag: 'RESULTADOS' },
  { title: 'Bootcamp Cerámica', fecha: 'Fecha por definir', kind: 'important', tag: 'BOOTCAMP' },
  { title: 'Recepción de obra', fecha: '1 y 2 de febrero de 2027', kind: 'important', tag: 'RECEPCIÓN' },
  { title: 'ARTE FACTO | Éticas creativas — La feria', fecha: '4, 5, 6, 7 de febrero de 2027', kind: 'final', tag: 'LA FERIA' },
  { title: 'Desmontaje y devolución de obra', fecha: '8 de febrero de 2027', kind: 'important', tag: 'DESMONTAJE' },
  { title: 'Periodo de pagos a artistas y venta post-evento', fecha: '10 de febrero de 2027 hasta 10 de marzo 2027', kind: 'important', tag: 'PAGOS' },
];

// Componente de letra decorativa flotante
const FloatingLetter = ({ src, style = {} }) => {
  const letterRef = useRef(null);

  useEffect(() => {
    const letter = letterRef.current;
    if (!letter) return;

    gsap.to(letter, {
      rotation: '+=15',
      y: '+=20',
      duration: 3 + Math.random() * 2,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut',
    });
  }, []);

  return (
    <img
      ref={letterRef}
      src={src}
      alt=""
      style={{
        position: 'absolute',
        width: 80,
        height: 80,
        opacity: 0.08,
        pointerEvents: 'none',
        ...style,
      }}
    />
  );
};

// Componente de evento en el timeline
const TimelineEvent = ({ event, index }) => {
  const isTop = index % 2 === 0;
  const isFinal = event.kind === 'final';
  const isImportant = event.kind === 'important' || event.kind === 'final';

  // Tamaño del círculo
  const circleSize = isFinal ? 100 : isImportant ? 80 : 60;

  // Altura de la línea
  const lineHeight = 140;

  // Colores según tipo de evento
  const getCircleColor = () => {
    if (isFinal) return COLORS.red;
    if (isImportant) return COLORS.black;
    return COLORS.creamDark;
  };

  return (
    <div
      style={{
        position: 'relative',
        width: 320,
        height: 0, // Sin altura, solo sirve como contenedor
        flexShrink: 0,
      }}
    >
      {/* Contenido del evento */}
      <div
        style={{
          position: 'absolute',
          // Si isTop, poner el texto arriba; si !isTop, poner abajo
          top: isTop ? -(lineHeight + circleSize / 2 + 30) : (circleSize / 2 + lineHeight + 30),
          left: '50%',
          transform: 'translateX(-50%)',
          width: 260,
        }}
      >
        {/* Tag */}
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: COLORS.red,
            marginBottom: 8,
            textAlign: 'center',
          }}
        >
          {event.tag}
        </div>

        {/* Título */}
        <h4
          style={{
            margin: '0 0 8px',
            fontFamily: FONTS.subtitle,
            fontWeight: FONTS.subtitleWeight,
            fontStyle: FONTS.subtitleStyle,
            fontSize: isFinal ? 24 : isImportant ? 19 : 17,
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
            color: COLORS.black,
            lineHeight: 1.3,
            textAlign: 'center',
          }}
        >
          {event.title}
        </h4>

        {/* Fecha */}
        <p
          style={{
            margin: 0,
            fontSize: 13,
            lineHeight: 1.5,
            color: COLORS.gray,
            fontStyle: event.fecha === 'Fecha por definir' ? 'italic' : 'normal',
            textAlign: 'center',
          }}
        >
          {event.fecha}
        </p>
      </div>

      {/* Línea vertical conectando al círculo */}
      <div
        style={{
          position: 'absolute',
          top: isTop ? -lineHeight : 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 3,
          height: lineHeight,
          background: COLORS.black,
          zIndex: 1,
        }}
      />

      {/* Círculo - centrado perfectamente en la línea horizontal */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translate(-50%, -50%)', // Centrar perfectamente en la línea
          width: circleSize,
          height: circleSize,
          borderRadius: '50%',
          background: getCircleColor(),
          border: `${isFinal ? 6 : 4}px solid ${COLORS.black}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2,
          boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
        }}
      >
        {/* Solo mostrar icono en el evento final */}
        {isFinal && (
          <img
            src="/assets/star-cream.svg"
            alt=""
            style={{ width: 50, height: 50, filter: 'brightness(0) invert(1)' }}
          />
        )}
      </div>
    </div>
  );
};

export default function CalendarSection({ eventos = EVENTOS, isActive = true }) {
  const sectionRef = useRef(null);
  const timelineRef = useRef(null);
  const disclaimerRef = useRef(null);
  const scrollTriggerRef = useRef(null);
  const tweenRef = useRef(null);

  useEffect(() => {
    // Solo inicializar cuando isActive es true
    if (!isActive) {
      // Limpiar cuando no está activo
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
        scrollTriggerRef.current = null;
      }
      if (tweenRef.current) {
        tweenRef.current.kill();
        tweenRef.current = null;
      }
      if (timelineRef.current) {
        gsap.set(timelineRef.current, { clearProps: 'x' });
      }
      return;
    }

    const section = sectionRef.current;
    const timeline = timelineRef.current;

    if (!section || !timeline) return;

    // Resetear posición del timeline
    gsap.set(timeline, { x: 0 });

    const timer = setTimeout(() => {
      // Calcular el ancho total del timeline más padding para centrar el último evento
      const scrollWidth = timeline.scrollWidth - window.innerWidth / 2;

      if (scrollWidth > 0) {
        tweenRef.current = gsap.to(timeline, {
          x: -scrollWidth,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => `+=${scrollWidth * 2}`,
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        scrollTriggerRef.current = tweenRef.current.scrollTrigger;

        // Refrescar ScrollTrigger
        ScrollTrigger.refresh();
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
        scrollTriggerRef.current = null;
      }
      if (tweenRef.current) {
        tweenRef.current.kill();
        tweenRef.current = null;
      }
      gsap.set(timeline, { clearProps: 'x' });
    };
  }, [isActive]); // Re-ejecutar cuando isActive cambia

  return (
    <>
      <section
        id="calendario"
        ref={sectionRef}
        style={{
          scrollMarginTop: 0,
          background: COLORS.cream,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Letras decorativas flotantes */}
        <FloatingLetter src="/assets/glyph-x-white.svg" style={{ top: '10%', left: '5%', width: 120, height: 120 }} />
        <FloatingLetter src="/assets/glyph-t-white.svg" style={{ top: '70%', left: '15%', width: 100, height: 100 }} />
        <FloatingLetter src="/assets/glyph-e-white.svg" style={{ top: '15%', right: '10%', width: 110, height: 110 }} />
        <FloatingLetter src="/assets/glyph-a-white.svg" style={{ bottom: '15%', right: '5%', width: 90, height: 90 }} />
        <FloatingLetter src="/assets/glyph-r-white.svg" style={{ top: '50%', left: '8%', width: 85, height: 85 }} />
        <FloatingLetter src="/assets/glyph-o-white.svg" style={{ top: '30%', right: '20%', width: 95, height: 95 }} />

        <div
          style={{
            width: '100%',
            position: 'relative',
          }}
        >
          {/* Línea horizontal de puntitos */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              right: 0,
              height: 6,
              background: `repeating-linear-gradient(
                to right,
                ${COLORS.black} 0,
                ${COLORS.black} 6px,
                transparent 6px,
                transparent 18px
              )`,
              transform: 'translateY(-50%)',
              zIndex: 0,
            }}
          />

          {/* Timeline horizontal */}
          <div
            ref={timelineRef}
            style={{
              display: 'flex',
              alignItems: 'center',
              paddingLeft: '10vw',
              paddingRight: '50vw', // Padding extra para que el último evento llegue al centro
              position: 'relative',
              zIndex: 1,
            }}
          >
            {eventos.map((ev, i) => (
              <TimelineEvent key={i} event={ev} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer debajo del timeline */}
      <section
        ref={disclaimerRef}
        style={{
          background: COLORS.cream,
          padding: '80px 24px 100px',
        }}
      >
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div
            style={{
              background: COLORS.creamDark,
              padding: '32px 40px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            }}
          >
            <h4
              style={{
                margin: '0 0 16px',
                fontFamily: FONTS.subtitle,
                fontWeight: FONTS.subtitleWeight,
                fontStyle: FONTS.subtitleStyle,
                fontSize: 18,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: COLORS.red,
              }}
            >
              Nota Importante
            </h4>
            <p
              style={{
                margin: 0,
                fontSize: 16,
                lineHeight: 1.7,
                color: COLORS.gray,
              }}
            >
              Las fechas están sujetas a cambios. Te notificaremos por email sobre cualquier actualización en el calendario.
              Mantente atento a tu correo electrónico registrado. Todas las fechas y horarios se comunicarán con al menos
              dos semanas de anticipación.
            </p>
          </div>

          <div
            style={{
              marginTop: 40,
              textAlign: 'center',
              padding: '28px',
              background: 'rgba(184, 48, 48, 0.05)',
              borderRadius: 8,
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 14,
                color: COLORS.gray,
                lineHeight: 1.6,
              }}
            >
              <strong style={{ color: COLORS.red }}>Recuerda:</strong> La convocatoria se abrirá el 1 de agosto de 2026.
              Asegúrate de revisar todos los requisitos antes de aplicar. Para más información, consulta nuestra sección
              de contacto.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
