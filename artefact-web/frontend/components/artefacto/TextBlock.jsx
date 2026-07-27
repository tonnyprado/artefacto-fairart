'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FONTS, COLORS, container } from './theme';

gsap.registerPlugin(ScrollTrigger);

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*';

/**
 * Componente de texto con animaciones de scramble por palabra
 * @param {Object} props
 * @param {string} props.text - Texto a mostrar
 * @param {string} props.textAlign - Alineación del texto
 * @param {string} props.fontSize - Tamaño de fuente (ej: 'clamp(24px, 3.2vw, 42px)')
 * @param {number} props.maxWidth - Ancho máximo del contenedor
 * @param {boolean} props.enableScramble - Habilitar efecto scramble
 */
export default function TextBlock({
  text,
  textAlign = 'center',
  fontSize = 'clamp(20px, 2.5vw, 32px)',
  maxWidth = 900,
  enableScramble = true,
}) {
  const containerRef = useRef(null);
  const wordsRef = useRef([]);

  const words = text.split(' ');

  useEffect(() => {
    const wordElements = wordsRef.current.filter(Boolean);
    if (wordElements.length === 0) return;

    if (!enableScramble) {
      // Animación simple sin scramble
      wordElements.forEach((word) => {
        gsap.fromTo(
          word,
          { opacity: 0, y: 40 },
          {
            scrollTrigger: {
              trigger: word,
              start: 'top bottom-=50',
              end: 'top center',
              scrub: true,
            },
            opacity: 1,
            y: 0,
            ease: 'power2.out',
          }
        );
      });
      return;
    }

    // Animación con scramble
    wordElements.forEach((word, i) => {
      const originalText = words[i];

      gsap.fromTo(
        word,
        {
          opacity: 0,
          rotateX: -90,
          y: 100,
          scale: 0.7,
        },
        {
          opacity: 1,
          rotateX: 0,
          y: 0,
          scale: 1,
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top bottom',
            end: 'top center-=100',
            scrub: 1,
            onUpdate: (self) => {
              const progress = self.progress;

              // Blur effect
              const blur = (1 - progress) * 6;
              word.style.filter = `blur(${blur}px)`;

              // Scramble effect
              if (progress < 0.7) {
                const revealCount = Math.floor((progress / 0.7) * originalText.length);
                let scrambled = '';
                for (let j = 0; j < originalText.length; j++) {
                  if (j < revealCount) {
                    scrambled += originalText[j];
                  } else {
                    scrambled += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
                  }
                }
                word.textContent = scrambled;
              } else {
                word.textContent = originalText;
                word.style.filter = 'blur(0px)';
              }
            },
          },
          ease: 'none',
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [words, enableScramble]);

  return (
    <div ref={containerRef} style={{ ...container, maxWidth, margin: '0 auto' }}>
      <div
        style={{
          fontSize,
          lineHeight: 1.6,
          fontFamily: FONTS.body,
          fontWeight: FONTS.bodyWeight,
          letterSpacing: '-0.01em',
          textAlign,
          perspective: '1000px',
        }}
      >
        {words.map((word, idx) => (
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
  );
}
