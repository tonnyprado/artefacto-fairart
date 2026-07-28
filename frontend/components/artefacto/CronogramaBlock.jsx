'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FONTS, COLORS, container } from './theme';

gsap.registerPlugin(ScrollTrigger);

/**
 * Componente para el bloque de cronograma y fechas
 */
export default function CronogramaBlock() {
  const blockRef = useRef(null);
  const titleRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    const title = titleRef.current;
    const image = imageRef.current;

    // Resetear estados iniciales
    if (title) gsap.set(title, { opacity: 0, y: 60, scale: 0.95 });
    if (image) gsap.set(image, { opacity: 0, y: 80, scale: 0.95 });

    // Limpiar ScrollTriggers anteriores
    ScrollTrigger.getAll().forEach((trigger) => {
      if (trigger.vars.trigger === blockRef.current ||
          trigger.vars.trigger === title ||
          trigger.vars.trigger === image) {
        trigger.kill();
      }
    });

    // Animación del título
    if (title) {
      gsap.fromTo(
        title,
        { opacity: 0, y: 60, scale: 0.95 },
        {
          scrollTrigger: {
            trigger: title,
            start: 'top bottom-=100',
            end: 'top center',
            scrub: true,
          },
          opacity: 1,
          y: 0,
          scale: 1,
          ease: 'power2.out',
        }
      );
    }

    // Animación de la imagen del cronograma
    if (image) {
      gsap.fromTo(
        image,
        { opacity: 0, y: 80, scale: 0.95 },
        {
          scrollTrigger: {
            trigger: image,
            start: 'top bottom-=80',
            end: 'top center+=50',
            scrub: true,
          },
          opacity: 1,
          y: 0,
          scale: 1,
          ease: 'power2.out',
        }
      );
    }

    // Refrescar ScrollTrigger
    ScrollTrigger.refresh();

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.trigger === blockRef.current ||
            trigger.vars.trigger === title ||
            trigger.vars.trigger === image) {
          trigger.kill();
        }
      });
    };
  }, []);

  return (
    <div
      ref={blockRef}
      style={{
        minHeight: '100vh',
        background: COLORS.cream,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '120px 24px',
      }}
    >
      <div style={{ ...container, maxWidth: 1200 }}>
        {/* Título */}
        <div
          ref={titleRef}
          style={{
            textAlign: 'center',
            marginBottom: 80,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontFamily: FONTS.display,
              fontWeight: FONTS.displayWeight,
              fontStyle: FONTS.displayStyle,
              fontSize: 'clamp(40px, 6vw, 72px)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: COLORS.black,
            }}
          >
            CRONOGRAMA Y FECHAS
          </h2>
        </div>

        {/* Imagen del cronograma - Aquí se colocará la imagen cuando esté disponible */}
        <div
          ref={imageRef}
          style={{
            maxWidth: 1000,
            margin: '0 auto',
            border: `3px solid ${COLORS.black}`,
            background: COLORS.creamDark,
            padding: 60,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 40,
            }}
          >
            {[
              { fase: 'Fase 1', fecha: 'Agosto 2027', actividad: 'Registro abierto' },
              { fase: 'Fase 2', fecha: 'Septiembre 2027', actividad: 'Selección y curaduría' },
              { fase: 'Fase 3', fecha: 'Octubre - Noviembre 2027', actividad: 'Preparación final' },
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: 24,
                  border: `2px solid ${COLORS.red}`,
                  background: COLORS.cream,
                }}
              >
                <div
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: '50%',
                    background: COLORS.red,
                    color: COLORS.cream,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: FONTS.display,
                    fontWeight: FONTS.displayWeight,
                    fontSize: 20,
                    margin: '0 auto 16px',
                  }}
                >
                  {idx + 1}
                </div>
                <h4
                  style={{
                    margin: '0 0 8px',
                    fontFamily: FONTS.subtitle,
                    fontWeight: FONTS.subtitleWeight,
                    fontStyle: FONTS.subtitleStyle,
                    fontSize: 18,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    color: COLORS.red,
                  }}
                >
                  {item.fase}
                </h4>
                <p
                  style={{
                    margin: '0 0 12px',
                    fontFamily: FONTS.body,
                    fontWeight: 600,
                    fontSize: 14,
                    color: COLORS.black,
                  }}
                >
                  {item.fecha}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontFamily: FONTS.body,
                    fontWeight: FONTS.bodyWeight,
                    fontSize: 14,
                    lineHeight: 1.5,
                    color: COLORS.gray,
                  }}
                >
                  {item.actividad}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
