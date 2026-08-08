'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';
import FullScreenBlock from './FullScreenBlock';
import ImageBackgroundBlock from './ImageBackgroundBlock';
import ConvocatoriaBlock from './ConvocatoriaBlock';
import { COLORS, FONTS, container } from './theme';

gsap.registerPlugin(ScrollTrigger, Flip);

/**
 * Nueva sección CONOCE MÁS con 5 bloques fullscreen
 */
export default function ConoceMasSection() {
  const titleRef = useRef(null);
  const logoRef = useRef(null);
  const logoContainerHeroRef = useRef(null);
  const block2Ref = useRef(null);
  const block3Ref = useRef(null);
  const block4Ref = useRef(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    const title = titleRef.current;
    const logo = logoRef.current;
    const logoContainerHero = logoContainerHeroRef.current;
    const logoContainerNav = document.getElementById('navbar-logo-container');
    const block2 = block2Ref.current;
    const block3 = block3Ref.current;
    const block4 = block4Ref.current;

    if (!title || !logo || !logoContainerHero || !logoContainerNav) return;

    const initAnimations = () => {
      // Resetear estados iniciales
      gsap.set(title, { opacity: 0, scale: 0.8, y: 40 });
      gsap.set([block2, block3, block4].filter(Boolean), { opacity: 0, y: 60 });

      // Limpiar ScrollTriggers anteriores
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.id === 'conocemas-logo' ||
            trigger.vars.trigger === title ||
            trigger.vars.trigger === block2 ||
            trigger.vars.trigger === block3 ||
            trigger.vars.trigger === block4) {
          trigger.kill();
        }
      });

      // Animación del logo ARTEFACTO (entrada)
      gsap.fromTo(
        title,
        { opacity: 0, scale: 0.8, y: 40 },
        {
          scrollTrigger: {
            trigger: title,
            start: 'top bottom-=100',
            end: 'top center',
            scrub: true,
          },
          opacity: 1,
          scale: 1,
          y: 0,
          ease: 'power2.out',
        }
      );

      // Función para mover el logo entre contenedores con Flip
      const updateLogo = (moveToHero = false) => {
        const state = Flip.getState(logo, { nested: true });

        // Mover elemento físicamente
        if (moveToHero) {
          logoContainerHero.insertAdjacentElement('beforeend', logo);
        } else {
          logoContainerNav.insertAdjacentElement('beforeend', logo);
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

      // Crear ScrollTrigger para mover el logo
      gsap.timeline({
        scrollTrigger: {
          id: 'conocemas-logo-trigger',
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom 100%',
          scrub: false,
          onEnter: () => {
            updateLogo(false); // Mover al navbar
          },
          onEnterBack: () => {
            updateLogo(true); // Mover de vuelta al hero
          },
        },
      });

      // Animaciones de bloques de texto
      [block2, block3, block4].forEach((block) => {
        if (!block) return;
        gsap.fromTo(
          block,
          { opacity: 0, y: 60 },
          {
            scrollTrigger: {
              trigger: block,
              start: 'top bottom-=100',
              end: 'top center',
              scrub: true,
            },
            opacity: 1,
            y: 0,
            ease: 'power2.out',
          }
        );
      });

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
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.id === 'conocemas-logo-trigger' ||
            trigger.vars.trigger === title ||
            trigger.vars.trigger === block2 ||
            trigger.vars.trigger === block3 ||
            trigger.vars.trigger === block4) {
          trigger.kill();
        }
      });
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
        #navbar-logo-container a {
          display: block;
        }
        #navbar-logo-container a img {
          height: 46px !important;
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
      {/* BLOQUE 1: Logo ARTEFACTO grande */}
      <FullScreenBlock backgroundColor={COLORS.cream} animate={false}>
        <div
          ref={titleRef}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Contenedor del logo en el hero */}
          <div ref={logoContainerHeroRef}>
            <a
              ref={logoRef}
              href="#hero"
              style={{
                cursor: 'pointer',
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
                  width: 'min(800px, 80vw)',
                  height: 'auto',
                  display: 'block',
                  pointerEvents: 'none',
                }}
              />
            </a>
          </div>
        </div>
      </FullScreenBlock>

      {/* BLOQUE 2: Descripción ARTE FACTO La Feria */}
      <FullScreenBlock backgroundColor={COLORS.cream} minHeight="100vh" animate={false}>
        <div ref={block2Ref} style={{ ...container, maxWidth: 1000, margin: '0 auto' }}>
          <p
            style={{
              margin: 0,
              fontSize: 'clamp(20px, 2.5vw, 32px)',
              lineHeight: 1.6,
              fontFamily: FONTS.body,
              fontWeight: FONTS.bodyWeight,
              letterSpacing: '-0.01em',
              textAlign: 'center',
              color: COLORS.black,
            }}
          >
            ARTE FACTO La Feria es una exposición de arte independiente que reúne alrededor de 50 artistas
            nacionales e internacionales seleccionados desde curaduría específica. A diferencia de las ferias
            tradicionales basadas en booths individuales, ARTE FACTO funciona como una exposición integral:
            el Comité Curatorial define la selección y el orden conceptual de las obras, fortalecido por el
            diseño museográfico.
          </p>
        </div>
      </FullScreenBlock>

      {/* BLOQUE 3: Background imagen + texto filosofía (con overlay) */}
      <ImageBackgroundBlock
        backgroundImage="/assets/estacion-indianilla-bg.png"
        hasOverlay={true}
        overlayOpacity={0.65}
      >
        <div ref={block3Ref} style={{ textAlign: 'center' }}>
          <p
            style={{
              margin: 0,
              fontFamily: FONTS.body,
              fontWeight: 500,
              fontSize: 'clamp(18px, 2vw, 28px)',
              lineHeight: 1.7,
              color: COLORS.cream,
            }}
          >
            Como proyecto filosófico a largo plazo, ARTE FACTO se posiciona como un catalizador
            que fomenta el esparcimiento de los saberes técnicos, conceptuales, los procesos
            y el valor de ser un agente creativo en el contexto contemporáneo.
          </p>
        </div>
      </ImageBackgroundBlock>

      {/* BLOQUE 4: Mismo background + texto sostenibilidad (con overlay) */}
      <ImageBackgroundBlock
        backgroundImage="/assets/estacion-indianilla-bg.png"
        hasOverlay={true}
        overlayOpacity={0.65}
      >
        <div ref={block4Ref} style={{ textAlign: 'center' }}>
          <p
            style={{
              margin: 0,
              fontFamily: FONTS.body,
              fontWeight: 500,
              fontSize: 'clamp(18px, 2vw, 28px)',
              lineHeight: 1.7,
              color: COLORS.cream,
            }}
          >
            Como desarrollo y sostenibilidad de las éticas creativas, el proyecto generará eventos,
            convocatorias y experiencias satélite a lo largo del año. Estas iniciativas buscan fomentar
            disciplinas creativas variadas —desde diseño industrial, cine y arquitectura hasta joyería,
            entre otras— según el ímpetu y deseo de la comunidad.
          </p>
        </div>
      </ImageBackgroundBlock>

      {/* BLOQUE 5: Convocatoria (fondo azul) */}
      <ConvocatoriaBlock />
    </section>
    </>
  );
}
