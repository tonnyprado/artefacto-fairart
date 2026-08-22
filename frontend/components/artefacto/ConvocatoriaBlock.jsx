'use client';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FONTS, COLORS } from './theme';

gsap.registerPlugin(ScrollTrigger);

const FASES = [
  { numero: 1, nombre: 'Fase 1', fecha: '24 Agosto – 14 Septiembre, 2026' },
  { numero: 2, nombre: 'Fase 2', fecha: '23 Septiembre – 14 Octubre, 2026' },
  { numero: 3, nombre: 'Fase 3', fecha: '23 Octubre – 13 Noviembre, 2026' },
];

/**
 * Componente para el bloque de convocatoria con animaciones de fases
 * Muestra secuencialmente: texto principal → texto secundario → título FASES → fases individuales
 */
export default function ConvocatoriaBlock() {
  const blockRef = useRef(null);
  const mainTextRef = useRef(null);
  const secondaryTextRef = useRef(null);
  const fasesTitleRef = useRef(null);
  const fasesRef = useRef([]);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const mainText = mainTextRef.current;
    const secondaryText = secondaryTextRef.current;
    const fasesTitle = fasesTitleRef.current;
    const fases = fasesRef.current.filter(Boolean);

    if (!mainText) return;

    // Resetear estados iniciales
    gsap.set(mainText, { opacity: 0, scale: 0.9, y: 60 });
    if (secondaryText) gsap.set(secondaryText, { opacity: 0, y: 40 });
    if (fasesTitle) gsap.set(fasesTitle, { opacity: 0, scale: 0.8, rotateX: -45 });
    fases.forEach(fase => gsap.set(fase, { opacity: 0, x: -60, scale: 0.9 }));

    // Limpiar ScrollTriggers anteriores
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());

    // Animación del texto principal
    gsap.fromTo(
      mainText,
      { opacity: 0, scale: 0.9, y: 60 },
      {
        scrollTrigger: {
          trigger: mainText,
          start: 'top center+=100',
          end: 'top center-=50',
          scrub: true,
          onEnter: () => setCurrentStep(1),
        },
        opacity: 1,
        scale: 1,
        y: 0,
        ease: 'power2.out',
      }
    );

    // Animación del texto secundario
    if (secondaryText) {
      gsap.fromTo(
        secondaryText,
        { opacity: 0, y: 40 },
        {
          scrollTrigger: {
            trigger: secondaryText,
            start: 'top center+=50',
            end: 'top center-=50',
            scrub: true,
            onEnter: () => setCurrentStep(2),
          },
          opacity: 1,
          y: 0,
          ease: 'power2.out',
        }
      );
    }

    // Animación del título FASES
    if (fasesTitle) {
      gsap.fromTo(
        fasesTitle,
        { opacity: 0, scale: 0.8, rotateX: -45 },
        {
          scrollTrigger: {
            trigger: fasesTitle,
            start: 'top center+=100',
            end: 'top center',
            scrub: true,
            onEnter: () => setCurrentStep(3),
          },
          opacity: 1,
          scale: 1,
          rotateX: 0,
          ease: 'power2.out',
        }
      );
    }

    // Animación de cada fase
    fases.forEach((fase, idx) => {
      gsap.fromTo(
        fase,
        { opacity: 0, x: -60, scale: 0.9 },
        {
          scrollTrigger: {
            trigger: fase,
            start: 'top center+=150',
            end: 'top center',
            scrub: true,
          },
          opacity: 1,
          x: 0,
          scale: 1,
          ease: 'power2.out',
        }
      );
    });

    // Refrescar ScrollTrigger
    ScrollTrigger.refresh();

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div
      ref={blockRef}
      style={{
        position: 'relative',
        minHeight: '300vh',
        background: `linear-gradient(135deg, #2563eb 0%, #1e40af 100%)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '100vh 24px 100px',
      }}
    >
      {/* Texto Principal */}
      <div
        ref={mainTextRef}
        style={{
          marginBottom: '60vh',
          textAlign: 'center',
          maxWidth: 900,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontFamily: FONTS.display,
            fontWeight: FONTS.displayWeight,
            fontStyle: FONTS.displayStyle,
            fontSize: 'clamp(32px, 4vw, 56px)',
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
            color: COLORS.cream,
            lineHeight: 1.3,
          }}
        >
          La convocatoria abierta de ARTE FACTO comienza en agosto y tendrá término en noviembre.
        </h2>
      </div>

      {/* Texto Secundario */}
      <div
        ref={secondaryTextRef}
        style={{
          marginBottom: '60vh',
          textAlign: 'center',
          maxWidth: 800,
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: FONTS.body,
            fontWeight: 500,
            fontSize: 'clamp(20px, 2.5vw, 32px)',
            color: COLORS.cream,
            lineHeight: 1.6,
          }}
        >
          Durante este periodo, la convocatoria se distribuirá en 3 fases de misma duración
        </p>
      </div>

      {/* Título FASES */}
      <div
        ref={fasesTitleRef}
        style={{
          marginBottom: 80,
          perspective: '1000px',
        }}
      >
        <h3
          style={{
            margin: 0,
            fontFamily: FONTS.display,
            fontWeight: FONTS.displayWeight,
            fontStyle: FONTS.displayStyle,
            fontSize: 'clamp(48px, 6vw, 80px)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: COLORS.cream,
            transformStyle: 'preserve-3d',
          }}
        >
          FASES
        </h3>
      </div>

      {/* Fases */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 40,
          maxWidth: 700,
          width: '100%',
        }}
      >
        {FASES.map((fase, idx) => (
          <div
            key={fase.numero}
            ref={(el) => (fasesRef.current[idx] = el)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 32,
              padding: 32,
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              border: `2px solid ${COLORS.cream}`,
              borderRadius: 8,
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: COLORS.cream,
                color: '#1e40af',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: FONTS.display,
                fontWeight: FONTS.displayWeight,
                fontStyle: FONTS.displayStyle,
                fontSize: 32,
                flexShrink: 0,
              }}
            >
              {fase.numero}
            </div>
            <div>
              <h4
                style={{
                  margin: '0 0 8px',
                  fontFamily: FONTS.subtitle,
                  fontWeight: FONTS.subtitleWeight,
                  fontStyle: FONTS.subtitleStyle,
                  fontSize: 'clamp(20px, 2vw, 28px)',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: COLORS.cream,
                }}
              >
                {fase.nombre}
              </h4>
              <p
                style={{
                  margin: 0,
                  fontFamily: FONTS.body,
                  fontWeight: FONTS.bodyWeight,
                  fontSize: 'clamp(14px, 1.4vw, 18px)',
                  color: COLORS.cream,
                  opacity: 0.9,
                }}
              >
                {fase.fecha}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
