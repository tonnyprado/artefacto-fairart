'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FONTS, COLORS } from './theme';

gsap.registerPlugin(ScrollTrigger);

/**
 * Componente para el bloque de ubicación con mapa circular y dirección
 * Bloque 7: Título con overlay gris
 * Bloque 8: Mismo fondo sin overlay + mapa circular + dirección
 */
export default function UbicacionBlock({ backgroundImage }) {
  const block7Ref = useRef(null);
  const block8Ref = useRef(null);
  const titleRef = useRef(null);
  const mapRef = useRef(null);
  const infoRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    const title = titleRef.current;
    const map = mapRef.current;
    const info = infoRef.current;
    const overlay = overlayRef.current;

    // Resetear estados iniciales
    if (title) gsap.set(title, { opacity: 0, scale: 0.9, y: 60 });
    if (overlay) gsap.set(overlay, { opacity: 0.6 });
    if (map) gsap.set(map, { opacity: 0, x: -80, scale: 0.9 });
    if (info) gsap.set(info, { opacity: 0, x: 80 });

    // Limpiar ScrollTriggers anteriores
    ScrollTrigger.getAll().forEach((trigger) => {
      if (trigger.vars.trigger === block7Ref.current ||
          trigger.vars.trigger === block8Ref.current) {
        trigger.kill();
      }
    });

    // Animación del título en Bloque 7
    if (title) {
      gsap.fromTo(
        title,
        { opacity: 0, scale: 0.9, y: 60 },
        {
          scrollTrigger: {
            trigger: block7Ref.current,
            start: 'top center',
            end: 'top top+=200',
            scrub: true,
          },
          opacity: 1,
          scale: 1,
          y: 0,
          ease: 'power2.out',
        }
      );
    }

    // Fade out del overlay al pasar de Bloque 7 a Bloque 8
    if (overlay) {
      gsap.fromTo(
        overlay,
        { opacity: 0.6 },
        {
          scrollTrigger: {
            trigger: block8Ref.current,
            start: 'top bottom',
            end: 'top center',
            scrub: true,
          },
          opacity: 0,
          ease: 'none',
        }
      );
    }

    // Animación del mapa en Bloque 8
    if (map) {
      gsap.fromTo(
        map,
        { opacity: 0, x: -80, scale: 0.9 },
        {
          scrollTrigger: {
            trigger: block8Ref.current,
            start: 'top center+=100',
            end: 'top center-=50',
            scrub: true,
          },
          opacity: 1,
          x: 0,
          scale: 1,
          ease: 'power2.out',
        }
      );
    }

    // Animación de la info en Bloque 8
    if (info) {
      gsap.fromTo(
        info,
        { opacity: 0, x: 80 },
        {
          scrollTrigger: {
            trigger: block8Ref.current,
            start: 'top center+=100',
            end: 'top center-=50',
            scrub: true,
          },
          opacity: 1,
          x: 0,
          ease: 'power2.out',
        }
      );
    }

    // Refrescar ScrollTrigger
    ScrollTrigger.refresh();

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <>
      {/* Bloque 7: Título UBICACIÓN con overlay gris */}
      <div
        ref={block7Ref}
        style={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          overflow: 'hidden',
        }}
      >
        <div
          ref={overlayRef}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(20, 18, 16, 0.6)',
            pointerEvents: 'none',
          }}
        />
        <div
          ref={titleRef}
          style={{
            position: 'relative',
            zIndex: 1,
            perspective: '1000px',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontFamily: FONTS.display,
              fontWeight: FONTS.displayWeight,
              fontStyle: FONTS.displayStyle,
              fontSize: 'clamp(48px, 8vw, 96px)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: COLORS.cream,
              transformStyle: 'preserve-3d',
            }}
          >
            UBICACIÓN
          </h2>
        </div>
      </div>

      {/* Bloque 8: Mismo fondo sin overlay + mapa circular + dirección */}
      <div
        ref={block8Ref}
        style={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          overflow: 'hidden',
          padding: '0 24px',
        }}
      >
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 80,
            maxWidth: 1200,
            width: '100%',
            alignItems: 'center',
          }}
        >
          {/* Mapa circular */}
          <div ref={mapRef}>
            <div
              style={{
                width: '100%',
                aspectRatio: '1',
                maxWidth: 350,
                borderRadius: '50%',
                overflow: 'hidden',
                border: `4px solid ${COLORS.cream}`,
                boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
                margin: '0 auto',
              }}
            >
              <iframe
                title="Mapa ubicación"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3762.868286341544!2d-99.15574682476283!3d19.414297441756697!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85d1ff3b8f2c6d89%3A0x7e5f8e3d8a6c5f0a!2sEstaci%C3%B3n%20Indianilla!5e0!3m2!1ses!2smx!4v1234567890"
                style={{
                  width: '100%',
                  height: '100%',
                  border: 0,
                }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Dirección e info */}
          <div
            ref={infoRef}
            style={{
              background: 'rgba(244, 237, 228, 0.95)',
              backdropFilter: 'blur(10px)',
              padding: 48,
              borderRadius: 16,
              border: `3px solid ${COLORS.black}`,
            }}
          >
            <h3
              style={{
                margin: '0 0 24px',
                fontFamily: FONTS.display,
                fontWeight: FONTS.displayWeight,
                fontStyle: FONTS.displayStyle,
                fontSize: 'clamp(28px, 3vw, 40px)',
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
                color: COLORS.red,
              }}
            >
              Centro Cultural Estación Indianilla
            </h3>
            <p
              style={{
                margin: '0 0 32px',
                fontFamily: FONTS.body,
                fontWeight: FONTS.bodyWeight,
                fontSize: 'clamp(16px, 1.6vw, 20px)',
                lineHeight: 1.7,
                color: COLORS.black,
              }}
            >
              Calz. de Tlalpan 1025<br />
              Col. Nativitas, Benito Juárez<br />
              Ciudad de México, CDMX<br />
              C.P. 03500 · México
            </p>
            <div
              style={{
                borderTop: `2px solid ${COLORS.black}`,
                paddingTop: 24,
                marginBottom: 32,
              }}
            >
              <h4
                style={{
                  margin: '0 0 16px',
                  fontFamily: FONTS.subtitle,
                  fontWeight: FONTS.subtitleWeight,
                  fontStyle: FONTS.subtitleStyle,
                  fontSize: 14,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: COLORS.gray,
                }}
              >
                Cómo llegar
              </h4>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  fontSize: 16,
                  lineHeight: 1.6,
                  color: COLORS.black,
                }}
              >
                <div><strong>Metro:</strong> Línea 2 — Estación Nativitas</div>
                <div><strong>Metrobús:</strong> Línea 1 — Estación Xola</div>
              </div>
            </div>
            <a
              href="https://www.google.com/maps/dir//Estaci%C3%B3n+Indianilla,+Calz.+de+Tlalpan+1025,+Nativitas,+Benito+Ju%C3%A1rez,+03500+Ciudad+de+M%C3%A9xico,+CDMX"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                padding: '14px 32px',
                background: COLORS.red,
                color: COLORS.cream,
                fontFamily: FONTS.subtitle,
                fontWeight: FONTS.subtitleWeight,
                fontStyle: FONTS.subtitleStyle,
                fontSize: 16,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                border: `2px solid ${COLORS.black}`,
                borderRadius: 16,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(184, 48, 48, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Cómo Llegar →
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
