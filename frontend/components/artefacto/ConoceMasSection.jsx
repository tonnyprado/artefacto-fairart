'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';
import FullScreenBlock from './FullScreenBlock';
import ImageBackgroundBlock from './ImageBackgroundBlock';
import { COLORS, FONTS, container } from './theme';

gsap.registerPlugin(ScrollTrigger, Flip);

/**
 * Nueva sección CONOCE MÁS con 5 bloques fullscreen
 */
export default function ConoceMasSection() {
  const titleRef = useRef(null);
  const logoRef = useRef(null);
  const logoContainerHeroRef = useRef(null);
  const redCardRef = useRef(null);
  const block2LeftRef = useRef(null);
  const block2RightRef = useRef(null);
  const block2CardRef = useRef(null);
  const block3LeftRef = useRef(null);
  const block3CardsRef = useRef([]);
  const block4TitleRef = useRef(null);
  const block4PhasesRef = useRef([]);
  const block4BottomRef = useRef(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    const title = titleRef.current;
    const logo = logoRef.current;
    const logoContainerHero = logoContainerHeroRef.current;
    const logoContainerNav = document.getElementById('navbar-logo-container');
    const redCard = redCardRef.current;
    const block2Left = block2LeftRef.current;
    const block2Right = block2RightRef.current;
    const block2Card = block2CardRef.current;
    const block3Left = block3LeftRef.current;
    const block3Cards = block3CardsRef.current.filter(Boolean);
    const block4Title = block4TitleRef.current;
    const block4Phases = block4PhasesRef.current.filter(Boolean);
    const block4Bottom = block4BottomRef.current;

    if (!title || !logo || !logoContainerHero || !logoContainerNav) return;

    const initAnimations = () => {
      // Resetear estados iniciales - Block 1
      gsap.set(title, { opacity: 0, scale: 0.9 });
      gsap.set(redCard, { opacity: 0, scale: 0.9 });

      // Block 2
      gsap.set(block2Left, { opacity: 0, x: -60 });
      gsap.set(block2Right, { opacity: 0, x: 60 });
      gsap.set(block2Card, { opacity: 0, scale: 0.9 });

      // Block 3
      gsap.set(block3Left, { opacity: 0, x: -60 });
      block3Cards.forEach(card => gsap.set(card, { opacity: 0, x: 60 }));

      // Block 4
      gsap.set(block4Title, { opacity: 0, y: -40 });
      block4Phases.forEach(phase => gsap.set(phase, { opacity: 0, scale: 0.9 }));
      gsap.set(block4Bottom, { opacity: 0, y: 40 });

      // Limpiar ScrollTriggers anteriores
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());

      // BLOQUE 1: Animación del logo y red card desde el centro
      gsap.fromTo(
        title,
        { opacity: 0, scale: 0.9 },
        {
          scrollTrigger: {
            trigger: title,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: 'power2.out',
        }
      );

      gsap.fromTo(
        redCard,
        { opacity: 0, scale: 0.9 },
        {
          scrollTrigger: {
            trigger: redCard,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
          opacity: 1,
          scale: 1,
          duration: 0.8,
          delay: 0.2,
          ease: 'power2.out',
        }
      );

      // Función para mover el logo entre contenedores con Flip
      const updateLogo = (moveToHero = false) => {
        const state = Flip.getState(logo, { nested: true });

        // Mover elemento físicamente
        if (moveToHero) {
          logoContainerHero.insertAdjacentElement('beforeend', logo);
          // En el hero: no clickable
          logo.style.cursor = 'default';
          logo.onclick = null;
        } else {
          logoContainerNav.insertAdjacentElement('beforeend', logo);
          // En el navbar: clickable
          logo.style.cursor = 'pointer';
          logo.onclick = (e) => {
            e.preventDefault();
            window.location.hash = '';
            window.location.hash = 'hero';
          };
        }

        // Animar transición
        Flip.from(state, {
          absolute: true,
          duration: 0.8,
          ease: 'power1.inOut',
        });
      };

      // Inicializar logo en el hero
      updateLogo(true);

      // Crear ScrollTrigger para mover el logo - cuando scrolleamos pasando el primer bloque
      gsap.timeline({
        scrollTrigger: {
          id: 'conocemas-logo-trigger',
          trigger: titleRef.current,
          start: 'bottom top+=100',
          end: 'bottom top',
          scrub: false,
          onEnter: () => {
            updateLogo(false); // Mover al navbar
          },
          onLeaveBack: () => {
            updateLogo(true); // Mover de vuelta al hero
          },
        },
      });

      // BLOQUE 2: Animaciones de textos y card
      gsap.fromTo(
        block2Left,
        { opacity: 0, x: -60 },
        {
          scrollTrigger: {
            trigger: block2Left,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: 'power2.out',
        }
      );

      gsap.fromTo(
        block2Right,
        { opacity: 0, x: 60 },
        {
          scrollTrigger: {
            trigger: block2Right,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
          opacity: 1,
          x: 0,
          duration: 0.8,
          delay: 0.3,
          ease: 'power2.out',
        }
      );

      gsap.fromTo(
        block2Card,
        { opacity: 0, scale: 0.9 },
        {
          scrollTrigger: {
            trigger: block2Card,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
          opacity: 1,
          scale: 1,
          duration: 0.8,
          delay: 0.6,
          ease: 'power2.out',
        }
      );

      // BLOQUE 3: Animación del texto izquierdo y cards pequeñas
      gsap.fromTo(
        block3Left,
        { opacity: 0, x: -60 },
        {
          scrollTrigger: {
            trigger: block3Left,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: 'power2.out',
        }
      );

      // Cards aparecen una por una
      block3Cards.forEach((card, idx) => {
        gsap.fromTo(
          card,
          { opacity: 0, x: 60 },
          {
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
            opacity: 1,
            x: 0,
            duration: 0.6,
            delay: idx * 0.2,
            ease: 'power2.out',
          }
        );
      });

      // BLOQUE 4: Animaciones del título, fases y texto inferior
      gsap.fromTo(
        block4Title,
        { opacity: 0, y: -40 },
        {
          scrollTrigger: {
            trigger: block4Title,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
        }
      );

      // Fases horizontales aparecen una por una
      block4Phases.forEach((phase, idx) => {
        gsap.fromTo(
          phase,
          { opacity: 0, scale: 0.9, y: 20 },
          {
            scrollTrigger: {
              trigger: phase,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.6,
            delay: idx * 0.15,
            ease: 'power2.out',
          }
        );
      });

      gsap.fromTo(
        block4Bottom,
        { opacity: 0, y: 40 },
        {
          scrollTrigger: {
            trigger: block4Bottom,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: 0.5,
          ease: 'power2.out',
        }
      );

      // Refrescar ScrollTrigger
      ScrollTrigger.refresh();
    };

    // Observador de visibilidad para detectar cuando la sección se vuelve visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0) {
            // Pequeño delay para asegurar que el DOM esté listo
            setTimeout(() => {
              initAnimations();
            }, 100);
          }
        });
      },
      { threshold: 0.01 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    // Inicializar inmediatamente también
    initAnimations();

    return () => {
      observer.disconnect();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      // Resetear el logo al limpiar - moverlo de vuelta al hero
      if (logo && logoContainerHero) {
        logoContainerHero.insertAdjacentElement('beforeend', logo);
        gsap.set(logo, { clearProps: 'all' });
      }
    };
  }, []);

  return (
    <>
      <style>{`
        /* Estilos para el logo cuando está en el navbar */
        #navbar-logo-container > div {
          display: block;
        }
        #navbar-logo-container > div img {
          height: 36px !important;
          width: auto !important;
        }
      `}</style>
      <section
        id="conoce-mas"
        ref={sectionRef}
        style={{
          background: COLORS.cream,
        }}
      >
      {/* BLOQUE 1: Logo ARTEFACTO + Red Card con información del evento */}
      <FullScreenBlock backgroundColor={COLORS.cream} animate={false}>
        <div
          ref={titleRef}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '60px',
            flexWrap: 'wrap',
            padding: '0 24px',
          }}
        >
          {/* Contenedor del logo en el hero */}
          <div ref={logoContainerHeroRef}>
            <div
              ref={logoRef}
              style={{
                cursor: 'default',
                display: 'block',
                textDecoration: 'none',
                transformOrigin: 'center center',
                willChange: 'transform',
              }}
            >
              <img
                src="/assets/wordmark-black.svg"
                alt="ARTEFACTO"
                style={{
                  width: 'min(500px, 70vw)',
                  height: 'auto',
                  display: 'block',
                  pointerEvents: 'none',
                }}
              />
            </div>
          </div>

          {/* Red Card con información del evento */}
          <div
            ref={redCardRef}
            style={{
              background: '#b83030',
              borderRadius: '24px',
              padding: 'clamp(24px, 4vw, 48px)',
              textAlign: 'center',
              minWidth: 'min(280px, 85vw)',
              maxWidth: '350px',
            }}
          >
            <p
              style={{
                margin: 0,
                fontFamily: FONTS.display,
                fontWeight: FONTS.displayWeight,
                fontStyle: FONTS.displayStyle,
                fontSize: 'clamp(18px, 2.5vw, 28px)',
                lineHeight: 1.2,
                color: COLORS.cream,
                textTransform: 'uppercase',
              }}
            >
              Feria de arte
              <br />
              <span style={{ fontStyle: 'normal', fontWeight: 500 }}>Edición II</span>
              <br />
              Semana
              <br />
              del arte
              <br />
              <span style={{ fontFamily: FONTS.highlight, fontStyle: 'italic', fontWeight: 400, fontSize: 'clamp(16px, 2vw, 24px)' }}>
                Ciudad de
                <br />
                México
              </span>
              <br />
              <span style={{ fontSize: 'clamp(20px, 3vw, 32px)', display: 'block', marginTop: '12px' }}>
                4 - 7
                <br />
                febrero 2027
              </span>
            </p>
          </div>
        </div>
      </FullScreenBlock>

      {/* BLOQUE 2: Textos descriptivos + Blue Card */}
      <FullScreenBlock backgroundColor={COLORS.cream} minHeight="100vh" animate={false}>
        <div style={{ ...container, padding: '60px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100vh' }}>
          {/* Texto izquierdo */}
          <div ref={block2LeftRef} style={{ marginBottom: '60px' }}>
            <h2
              style={{
                margin: 0,
                fontFamily: FONTS.display,
                fontWeight: FONTS.displayWeight,
                fontStyle: FONTS.displayStyle,
                fontSize: 'clamp(28px, 4vw, 56px)',
                lineHeight: 1.2,
                color: COLORS.black,
                textTransform: 'uppercase',
                maxWidth: '700px',
              }}
            >
              ARTE FACTO
              <br />
              ES UN ESPACIO DE EXPOSICION DE
              <br />
              ARTE INDEPENDIENTE
            </h2>
          </div>

          {/* Texto derecho */}
          <div ref={block2RightRef} style={{ marginBottom: '60px', display: 'flex', justifyContent: 'flex-end' }}>
            <h3
              style={{
                margin: 0,
                fontFamily: FONTS.display,
                fontWeight: FONTS.displayWeight,
                fontStyle: FONTS.displayStyle,
                fontSize: 'clamp(24px, 3.5vw, 48px)',
                lineHeight: 1.2,
                color: COLORS.black,
                textTransform: 'uppercase',
                maxWidth: '700px',
              }}
            >
              UN ESPACIO DONDE LOS CONCEPTOS ARTISTICOS
              <br />
              Y LAS EJECUCIONES TECNICAS
              <br />
              PONDERAN EN UN MISMO NIVEL
            </h3>
          </div>

          {/* Blue Card - izquierda */}
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div
              ref={block2CardRef}
              style={{
                background: '#4169e1',
                borderRadius: '24px',
                padding: 'clamp(32px, 5vw, 60px)',
                textAlign: 'center',
                minWidth: 'min(320px, 85vw)',
                maxWidth: '400px',
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontFamily: FONTS.display,
                  fontWeight: 900,
                  fontSize: 'clamp(24px, 3.5vw, 48px)',
                  lineHeight: 1.2,
                  color: COLORS.cream,
                }}
              >
                +50
                <br />
                <span style={{ fontWeight: 500, fontStyle: 'italic', fontSize: 'clamp(16px, 2vw, 24px)' }}>
                  artistas
                </span>
              </p>
              <p
                style={{
                  margin: '12px 0 0',
                  fontFamily: FONTS.highlight,
                  fontStyle: 'italic',
                  fontSize: 'clamp(14px, 1.8vw, 22px)',
                  color: COLORS.cream,
                }}
              >
                nacionales e<br />internacionales
              </p>
              <p
                style={{
                  margin: '24px 0 0',
                  fontFamily: FONTS.display,
                  fontWeight: 900,
                  fontSize: 'clamp(24px, 3.5vw, 48px)',
                  lineHeight: 1.2,
                  color: COLORS.cream,
                }}
              >
                +250
              </p>
              <p
                style={{
                  margin: '8px 0 0',
                  fontFamily: FONTS.display,
                  fontWeight: 900,
                  fontSize: 'clamp(18px, 2.5vw, 32px)',
                  lineHeight: 1.2,
                  color: COLORS.black,
                }}
              >
                obras de
              </p>
              <p
                style={{
                  margin: '4px 0 0',
                  fontFamily: FONTS.highlight,
                  fontStyle: 'italic',
                  fontSize: 'clamp(20px, 3vw, 40px)',
                  color: COLORS.cream,
                }}
              >
                arte
              </p>
            </div>
          </div>
        </div>
      </FullScreenBlock>

      {/* BLOQUE 3: Background imagen + texto izquierdo + 3 cards pequeñas derecha */}
      <ImageBackgroundBlock
        backgroundImage="/assets/estacion-indianilla-bg.png"
        hasOverlay={true}
        overlayOpacity={0.65}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', alignItems: 'center' }}>
          {/* Texto izquierdo */}
          <div ref={block3LeftRef}>
            <h2
              style={{
                margin: 0,
                fontFamily: FONTS.display,
                fontWeight: FONTS.displayWeight,
                fontStyle: FONTS.displayStyle,
                fontSize: 'clamp(32px, 4.5vw, 56px)',
                lineHeight: 1.2,
                color: COLORS.cream,
              }}
            >
              Exposición con curaduría &<br />museografía cuidada.
            </h2>
          </div>

          {/* Cards pequeñas derecha */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div
              ref={(el) => (block3CardsRef.current[0] = el)}
              style={{
                background: 'rgba(244, 237, 228, 0.2)',
                backdropFilter: 'blur(10px)',
                borderRadius: '24px',
                padding: '24px 32px',
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontFamily: FONTS.body,
                  fontWeight: 500,
                  fontSize: 'clamp(18px, 2vw, 24px)',
                  color: COLORS.cream,
                }}
              >
                Experiencias<br />gastronómicas
              </p>
            </div>

            <div
              ref={(el) => (block3CardsRef.current[1] = el)}
              style={{
                background: 'rgba(244, 237, 228, 0.2)',
                backdropFilter: 'blur(10px)',
                borderRadius: '24px',
                padding: '24px 32px',
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontFamily: FONTS.body,
                  fontWeight: 500,
                  fontSize: 'clamp(18px, 2vw, 24px)',
                  color: COLORS.cream,
                }}
              >
                Talleres de arte, música en vivo, ponencias y más
              </p>
            </div>

            <div
              ref={(el) => (block3CardsRef.current[2] = el)}
              style={{
                background: 'rgba(244, 237, 228, 0.2)',
                backdropFilter: 'blur(10px)',
                borderRadius: '24px',
                padding: '24px 32px',
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontFamily: FONTS.body,
                  fontWeight: 500,
                  fontSize: 'clamp(18px, 2vw, 24px)',
                  color: COLORS.cream,
                }}
              >
                Venta de arte original, prints, merch y más
              </p>
            </div>
          </div>
        </div>
      </ImageBackgroundBlock>

      {/* BLOQUE 4: Mismo background + CONVOCATORIA DIVIDIDA EN 3 FASES */}
      <ImageBackgroundBlock
        backgroundImage="/assets/estacion-indianilla-bg.png"
        hasOverlay={true}
        overlayOpacity={0.65}
      >
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <h2
            ref={block4TitleRef}
            style={{
              margin: '0 0 60px',
              fontFamily: FONTS.display,
              fontWeight: FONTS.displayWeight,
              fontStyle: FONTS.displayStyle,
              fontSize: 'clamp(32px, 5vw, 64px)',
              lineHeight: 1.2,
              color: COLORS.cream,
              textTransform: 'uppercase',
            }}
          >
            CONVOCATORIA DIVIDIDA EN 3 FASES
          </h2>

          {/* Fases horizontales */}
          <div
            style={{
              display: 'flex',
              gap: '24px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: '80px',
            }}
          >
            <div
              ref={(el) => (block4PhasesRef.current[0] = el)}
              style={{
                background: 'rgba(244, 237, 228, 0.2)',
                backdropFilter: 'blur(10px)',
                borderRadius: '24px',
                padding: '32px 40px',
                minWidth: '200px',
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontFamily: FONTS.display,
                  fontWeight: FONTS.displayWeight,
                  fontStyle: FONTS.displayStyle,
                  fontSize: 'clamp(24px, 3vw, 36px)',
                  color: COLORS.cream,
                  textTransform: 'uppercase',
                }}
              >
                FASE 1
              </p>
              <p
                style={{
                  margin: '8px 0 0',
                  fontFamily: FONTS.body,
                  fontSize: 'clamp(14px, 1.5vw, 18px)',
                  color: COLORS.cream,
                  opacity: 0.9,
                }}
              >
                Agosto - Septiembre
              </p>
            </div>

            <div
              ref={(el) => (block4PhasesRef.current[1] = el)}
              style={{
                background: 'rgba(244, 237, 228, 0.2)',
                backdropFilter: 'blur(10px)',
                borderRadius: '24px',
                padding: '32px 40px',
                minWidth: '200px',
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontFamily: FONTS.display,
                  fontWeight: FONTS.displayWeight,
                  fontStyle: FONTS.displayStyle,
                  fontSize: 'clamp(24px, 3vw, 36px)',
                  color: COLORS.cream,
                  textTransform: 'uppercase',
                }}
              >
                FASE 2
              </p>
              <p
                style={{
                  margin: '8px 0 0',
                  fontFamily: FONTS.body,
                  fontSize: 'clamp(14px, 1.5vw, 18px)',
                  color: COLORS.cream,
                  opacity: 0.9,
                }}
              >
                Septiembre - Octubre
              </p>
            </div>

            <div
              ref={(el) => (block4PhasesRef.current[2] = el)}
              style={{
                background: 'rgba(244, 237, 228, 0.2)',
                backdropFilter: 'blur(10px)',
                borderRadius: '24px',
                padding: '32px 40px',
                minWidth: '200px',
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontFamily: FONTS.display,
                  fontWeight: FONTS.displayWeight,
                  fontStyle: FONTS.displayStyle,
                  fontSize: 'clamp(24px, 3vw, 36px)',
                  color: COLORS.cream,
                  textTransform: 'uppercase',
                }}
              >
                FASE 3
              </p>
              <p
                style={{
                  margin: '8px 0 0',
                  fontFamily: FONTS.body,
                  fontSize: 'clamp(14px, 1.5vw, 18px)',
                  color: COLORS.cream,
                  opacity: 0.9,
                }}
              >
                Octubre - Noviembre
              </p>
            </div>
          </div>

          {/* Texto inferior */}
          <div
            ref={block4BottomRef}
            style={{
              background: 'rgba(244, 237, 228, 0.15)',
              backdropFilter: 'blur(10px)',
              borderRadius: '24px',
              padding: '32px 48px',
              maxWidth: '900px',
              margin: '0 auto',
            }}
          >
            <p
              style={{
                margin: 0,
                fontFamily: FONTS.body,
                fontWeight: 500,
                fontSize: 'clamp(18px, 2vw, 24px)',
                color: COLORS.cream,
                letterSpacing: '0.02em',
              }}
            >
              SIGUE DESLIZANDO PARA LEER LA CONVOCATORIA Y REALIZAR TU REGISTRO
            </p>
          </div>
        </div>
      </ImageBackgroundBlock>

    </section>
    </>
  );
}
