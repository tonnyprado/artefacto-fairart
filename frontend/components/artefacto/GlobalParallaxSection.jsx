'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { COLORS, FONTS, container } from './theme';

gsap.registerPlugin(ScrollTrigger);

// Letras finales de ARTEFACTO
const ARTEFACTO_LETTERS = [
  { letter: 'A', svg: '/assets/glyph-a-red.svg' },
  { letter: 'R', svg: '/assets/glyph-r-red.svg' },
  { letter: 'T', svg: '/assets/glyph-t-red.svg' },
  { letter: 'E', svg: '/assets/glyph-e-red.svg' },
  { letter: 'F', svg: '/assets/glyph-f-red.svg' },
  { letter: 'A', svg: '/assets/glyph-a-red.svg' },
  { letter: 'C', svg: '/assets/glyph-c-red.svg' },
  { letter: 'T', svg: '/assets/glyph-t-red.svg' },
  { letter: 'O', svg: '/assets/glyph-o-red.svg' },
];

// Todas las letras disponibles para scramble
const ALL_LETTER_SVGS = [
  '/assets/glyph-a-red.svg',
  '/assets/glyph-a-white.svg',
  '/assets/glyph-c-red.svg',
  '/assets/glyph-c-white.svg',
  '/assets/glyph-e-red.svg',
  '/assets/glyph-e-white.svg',
  '/assets/glyph-f-red.svg',
  '/assets/glyph-o-red.svg',
  '/assets/glyph-o-white.svg',
  '/assets/glyph-r-red.svg',
  '/assets/glyph-r-white.svg',
  '/assets/glyph-t-red.svg',
  '/assets/glyph-t-white.svg',
];

const DESCRIPTION_WORDS = [
  'Una', 'exposición', 'de', 'arte', 'independiente', 'que', 'reúne', 'artistas',
  'nacionales', 'e', 'internacionales', 'seleccionados', 'desde', 'curaduría',
  'específica.', 'El', 'Comité', 'Curatorial', 'define', 'la', 'selección',
  'y', 'orden', 'conceptual', 'de', 'las', 'obras.'
];

const SECONDARY_TEXT = {
  title: '¿Qué es ARTEFACTO?',
  description: 'A diferencia de las ferias tradicionales basadas en booths individuales, ARTEFACTO funciona como una exposición integral fortalecida por diseño museográfico. Las obras coexisten en un mismo entorno cuidado.',
  location: 'Centro Cultural Estación Indianilla, Col. Doctores, CDMX',
  date: '4-7 de febrero de 2027',
};

const PHILOSOPHY_POINTS = [
  {
    title: 'Catalizador Creativo',
    text: 'Proyecto filosófico que fomenta el esparcimiento de saberes técnicos, conceptuales y procesos artísticos.'
  },
  {
    title: 'Comunidad',
    text: 'Invitamos a artistas a sembrar una comunidad de creadores sensibles y apasionados por la praxis artística.'
  },
  {
    title: 'Éticas Creativas',
    text: 'Eventos y experiencias durante el año en disciplinas variadas: diseño, cine, arquitectura, joyería y más.'
  }
];

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*';

export default function GlobalParallaxSection() {
  const titleRef = useRef(null);
  const containerRef = useRef(null);
  const letterImgsRef = useRef([]);
  const wordsRef = useRef([]);
  const secondaryRef = useRef(null);
  const imageRef = useRef(null);
  const philosophyRef = useRef([]);
  const elementsRef = useRef([]);

  useEffect(() => {
    const title = titleRef.current;
    const letterImgs = letterImgsRef.current.filter(Boolean);
    const words = wordsRef.current.filter(Boolean);
    const elements = elementsRef.current.filter(Boolean);
    const secondary = secondaryRef.current;
    const image = imageRef.current;
    const philosophyCards = philosophyRef.current.filter(Boolean);

    if (!title || words.length === 0 || letterImgs.length === 0) return;

    let scrambleInterval = null;
    let hasScrambled = false;

    // Animación del título con SVG scramble integrado
    gsap.fromTo(
      title,
      { opacity: 0, y: 40 },
      {
        scrollTrigger: {
          trigger: title,
          start: 'top bottom-=100',
          end: 'top center',
          scrub: true,
          onUpdate: (self) => {
            const progress = self.progress;

            // Iniciar scramble solo una vez cuando entra
            if (progress > 0 && !hasScrambled && !scrambleInterval) {
              hasScrambled = true;
              let scrambleDuration = 0;
              const maxDuration = 1500;

              scrambleInterval = setInterval(() => {
                scrambleDuration += 60;
                const scrambleProgress = Math.min(scrambleDuration / maxDuration, 1);

                letterImgs.forEach((img, index) => {
                  const finalSvg = ARTEFACTO_LETTERS[index].svg;

                  if (scrambleProgress < 1) {
                    if (Math.random() > scrambleProgress) {
                      const randomSvg = ALL_LETTER_SVGS[Math.floor(Math.random() * ALL_LETTER_SVGS.length)];
                      img.src = randomSvg;
                    } else {
                      img.src = finalSvg;
                    }
                  } else {
                    img.src = finalSvg;
                    clearInterval(scrambleInterval);
                    scrambleInterval = null;
                  }
                });
              }, 60);
            }
          },
        },
        opacity: 1,
        y: 0,
        ease: 'none',
      }
    );

    // ANIMACIÓN DRAMÁTICA POR PALABRA
    words.forEach((word, i) => {
      const originalText = DESCRIPTION_WORDS[i];

      gsap.fromTo(
        word,
        {
          opacity: 0,
          rotateX: -120,
          y: 150,
          scale: 0.6,
        },
        {
          opacity: 1,
          rotateX: 0,
          y: 0,
          scale: 1,
          scrollTrigger: {
            trigger: word,
            start: 'top bottom-=50',
            end: 'top center-=50',
            scrub: 1,
            onUpdate: (self) => {
              const progress = self.progress;

              // Blur effect
              const blur = (1 - progress) * 8;
              word.style.filter = `blur(${blur}px)`;

              // Scramble effect MÁS LARGO
              if (progress < 0.75) {
                const revealCount = Math.floor((progress / 0.75) * originalText.length);
                let scrambled = '';
                for (let j = 0; j < originalText.length; j++) {
                  if (j < revealCount) {
                    scrambled += originalText[j];
                  } else if (originalText[j] === ' ') {
                    scrambled += ' ';
                  } else {
                    scrambled += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
                  }
                }
                word.textContent = scrambled;
                word.classList.add('scrambling');
              } else {
                word.textContent = originalText;
                word.classList.remove('scrambling');
              }
            },
          },
          ease: 'none',
        }
      );
    });

    // Elementos reveal
    elements.forEach((element) => {
      gsap.fromTo(
        element,
        { opacity: 0, y: 60 },
        {
          scrollTrigger: {
            trigger: element,
            start: 'top bottom-=100',
            end: 'top center+=100',
            scrub: true,
          },
          opacity: 1,
          y: 0,
          ease: 'power2.out',
        }
      );
    });

    // Animación del texto secundario
    if (secondary) {
      gsap.fromTo(
        secondary,
        { opacity: 0, x: -60 },
        {
          scrollTrigger: {
            trigger: secondary,
            start: 'top bottom-=100',
            end: 'top center',
            scrub: true,
          },
          opacity: 1,
          x: 0,
          ease: 'power2.out',
        }
      );
    }

    // Animación de la imagen
    if (image) {
      gsap.fromTo(
        image,
        { opacity: 0, scale: 0.9, x: 60 },
        {
          scrollTrigger: {
            trigger: image,
            start: 'top bottom-=100',
            end: 'top center',
            scrub: true,
          },
          opacity: 1,
          scale: 1,
          x: 0,
          ease: 'power2.out',
        }
      );
    }

    // Animación de las tarjetas de filosofía
    philosophyCards.forEach((card, idx) => {
      gsap.fromTo(
        card,
        { opacity: 0, y: 80, scale: 0.95 },
        {
          scrollTrigger: {
            trigger: card,
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
    });

    return () => {
      if (scrambleInterval) clearInterval(scrambleInterval);
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <section
      id="conoce-mas"
      style={{
        scrollMarginTop: 88,
        background: COLORS.cream,
        position: 'relative',
      }}
    >
      {/* Pantalla 1: Título ARTEFACTO fullscreen */}
      <div
        ref={titleRef}
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'clamp(6px, 1vw, 16px)',
            flexWrap: 'nowrap',
          }}
        >
          {ARTEFACTO_LETTERS.map((item, idx) => (
            <img
              key={`${item.letter}-${idx}`}
              ref={(el) => (letterImgsRef.current[idx] = el)}
              src={item.svg}
              alt={item.letter}
              style={{
                height: 'clamp(50px, 8vw, 100px)',
                width: 'auto',
                objectFit: 'contain',
              }}
            />
          ))}
        </div>
      </div>

      {/* Pantalla 2: Párrafo con efectos */}
      <div
        ref={containerRef}
        style={{
          minHeight: '200vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '100vh 24px',
        }}
      >
        <div style={{ ...container, maxWidth: 900 }}>
          <div
            style={{
              margin: '0 auto',
              fontSize: 'clamp(24px, 3.2vw, 42px)',
              lineHeight: 1.6,
              fontFamily: FONTS.body,
              fontWeight: FONTS.bodyWeight,
              letterSpacing: '-0.01em',
              textAlign: 'center',
              perspective: '1000px',
            }}
          >
            {DESCRIPTION_WORDS.map((word, idx) => (
              <span
                key={idx}
                ref={(el) => (wordsRef.current[idx] = el)}
                style={{
                  display: 'inline-block',
                  margin: '0 clamp(6px, 0.6vw, 10px)',
                  transformStyle: 'preserve-3d',
                  transformOrigin: 'center bottom',
                }}
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Decoración - Estrella divisora */}
      <div
        ref={(el) => (elementsRef.current[0] = el)}
        style={{
          textAlign: 'center',
          padding: '80px 0',
        }}
      >
        <img
          src="/assets/star-red.svg"
          alt=""
          style={{ width: 40, height: 40 }}
        />
      </div>

      {/* Pantalla 3: Descripción secundaria + Imagen */}
      <div style={{ ...container, maxWidth: 1200, padding: '100px 24px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 60,
            alignItems: 'center',
          }}
        >
          <div ref={secondaryRef}>
            <h3
              style={{
                margin: '0 0 24px',
                fontFamily: FONTS.display,
                fontWeight: FONTS.displayWeight,
                fontStyle: FONTS.displayStyle,
                fontSize: 'clamp(28px, 3vw, 42px)',
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
                color: COLORS.red,
              }}
            >
              {SECONDARY_TEXT.title}
            </h3>
            <p
              style={{
                margin: '0 0 32px',
                fontFamily: FONTS.body,
                fontWeight: FONTS.bodyWeight,
                fontSize: 'clamp(16px, 1.6vw, 20px)',
                lineHeight: 1.6,
                color: COLORS.black,
              }}
            >
              {SECONDARY_TEXT.description}
            </p>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                fontSize: 'clamp(14px, 1.4vw, 17px)',
                fontFamily: FONTS.body,
                fontWeight: 500,
              }}
            >
              <div>
                <strong style={{ fontWeight: 900 }}>Ubicación:</strong>{' '}
                {SECONDARY_TEXT.location}
              </div>
              <div>
                <strong style={{ fontWeight: 900 }}>Fechas:</strong>{' '}
                {SECONDARY_TEXT.date}
              </div>
            </div>
          </div>
          <div ref={imageRef}>
            <img
              src="/assets/conoce-mas-1.png"
              alt="ARTEFACTO"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                border: `3px solid ${COLORS.black}`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Decoración - Estrella divisora */}
      <div
        ref={(el) => (elementsRef.current[1] = el)}
        style={{
          textAlign: 'center',
          padding: '80px 0',
        }}
      >
        <img
          src="/assets/star-red.svg"
          alt=""
          style={{ width: 40, height: 40 }}
        />
      </div>

      {/* Pantalla 4: Puntos de filosofía */}
      <div style={{ ...container, maxWidth: 1200, padding: '100px 24px 150px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 48,
          }}
        >
          {PHILOSOPHY_POINTS.map((point, idx) => (
            <div
              key={idx}
              ref={(el) => (philosophyRef.current[idx] = el)}
              style={{
                border: `3px solid ${COLORS.red}`,
                padding: 32,
                background: COLORS.creamDark,
              }}
            >
              <h4
                style={{
                  margin: '0 0 16px',
                  fontFamily: FONTS.display,
                  fontWeight: FONTS.displayWeight,
                  fontStyle: FONTS.displayStyle,
                  fontSize: 'clamp(20px, 2vw, 26px)',
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase',
                  color: COLORS.red,
                }}
              >
                {point.title}
              </h4>
              <p
                style={{
                  margin: 0,
                  fontFamily: FONTS.body,
                  fontWeight: FONTS.bodyWeight,
                  fontSize: 'clamp(14px, 1.4vw, 17px)',
                  lineHeight: 1.6,
                  color: COLORS.black,
                }}
              >
                {point.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
