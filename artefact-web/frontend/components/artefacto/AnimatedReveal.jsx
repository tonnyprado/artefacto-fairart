'use client';
import { useEffect, useRef, Children, cloneElement } from 'react';
import { gsap } from 'gsap';

/*
  AnimatedReveal — Wrapper que añade animaciones de reveal elegantes a sus hijos

  Tipos de animación disponibles:
  - "fade" (default): fade in con translateY
  - "maskText": masked text reveal (clip-path)
  - "scale": scale up con fade
  - "slideLeft": slide desde la derecha
  - "slideRight": slide desde la izquierda

  Props:
    type: string - tipo de animación
    delay: number - delay en segundos
    duration: number - duración en segundos
    stagger: number - delay entre elementos hijos (si hay múltiples)
    children: ReactNode
*/

export default function AnimatedReveal({
  children,
  type = 'fade',
  delay = 0,
  duration = 0.8,
  stagger = 0.1,
}) {
  const containerRef = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!containerRef.current || hasAnimated.current) return;

    const elements = containerRef.current.children;
    if (elements.length === 0) return;

    hasAnimated.current = true;

    // Configuraciones de animación según tipo
    const animations = {
      fade: {
        from: { opacity: 0, y: 30 },
        to: { opacity: 1, y: 0, ease: 'power3.out' },
      },
      maskText: {
        from: { opacity: 0, clipPath: 'inset(0% 100% 0% 0%)' },
        to: { opacity: 1, clipPath: 'inset(0% 0% 0% 0%)', ease: 'expo.out' },
      },
      scale: {
        from: { opacity: 0, scale: 0.9 },
        to: { opacity: 1, scale: 1, ease: 'back.out(1.4)' },
      },
      slideLeft: {
        from: { opacity: 0, x: 60 },
        to: { opacity: 1, x: 0, ease: 'power3.out' },
      },
      slideRight: {
        from: { opacity: 0, x: -60 },
        to: { opacity: 1, x: 0, ease: 'power3.out' },
      },
    };

    const config = animations[type] || animations.fade;

    // Aplicar animación
    gsap.set(elements, config.from);
    gsap.to(elements, {
      ...config.to,
      duration,
      delay,
      stagger,
    });

  }, [type, delay, duration, stagger]);

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      {children}
    </div>
  );
}

/*
  SplitText — Componente que divide texto en líneas/palabras/caracteres para animar

  Props:
    children: string - el texto a dividir
    splitBy: "lines" | "words" | "chars" - cómo dividir
    type: tipo de animación AnimatedReveal
*/

export function SplitText({
  children,
  splitBy = 'lines',
  type = 'maskText',
  delay = 0,
  stagger = 0.05,
}) {
  const containerRef = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!containerRef.current || hasAnimated.current || typeof children !== 'string') return;

    hasAnimated.current = true;

    const text = children;
    let parts = [];

    if (splitBy === 'lines') {
      // Dividir por líneas (aproximado usando palabras y ancho)
      const words = text.split(' ');
      let currentLine = [];
      let lines = [];

      words.forEach((word, i) => {
        currentLine.push(word);
        if (i % 8 === 7 || i === words.length - 1) { // ~8 palabras por línea
          lines.push(currentLine.join(' '));
          currentLine = [];
        }
      });
      parts = lines;
    } else if (splitBy === 'words') {
      parts = text.split(' ');
    } else if (splitBy === 'chars') {
      parts = text.split('');
    }

    // Crear elementos span para cada parte
    containerRef.current.innerHTML = parts
      .map((part) => `<span style="display: inline-block;">${part}${splitBy === 'words' ? '&nbsp;' : ''}</span>`)
      .join('');

    const elements = containerRef.current.children;

    // Configurar animación tipo maskText
    gsap.set(elements, {
      opacity: 0,
      clipPath: 'inset(0% 100% 0% 0%)',
    });

    gsap.to(elements, {
      opacity: 1,
      clipPath: 'inset(0% 0% 0% 0%)',
      duration: 0.8,
      delay,
      stagger,
      ease: 'expo.out',
    });

  }, [children, splitBy, delay, stagger]);

  return (
    <div
      ref={containerRef}
      style={{
        display: 'inline',
        lineHeight: 'inherit',
      }}
    >
      {children}
    </div>
  );
}
