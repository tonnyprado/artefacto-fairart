import { useEffect, useRef } from 'react';

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*';

/**
 * Hook personalizado para aplicar efecto de scramble a texto
 * @param {string} text - Texto final a mostrar
 * @param {Object} options - Opciones de configuración
 * @param {number} options.duration - Duración del scramble en ms (default: 800)
 * @param {number} options.delay - Delay antes de empezar en ms (default: 0)
 * @param {boolean} options.trigger - Trigger para iniciar la animación (default: true)
 * @returns {Object} - { ref, isScrambling }
 */
export function useTextScramble(text, options = {}) {
  const {
    duration = 800,
    delay = 0,
    trigger = true,
  } = options;

  const ref = useRef(null);
  const isScrambling = useRef(false);
  const frameId = useRef(null);
  const timeoutId = useRef(null);

  useEffect(() => {
    if (!ref.current || !trigger || !text) return;

    const element = ref.current;
    const originalText = text;

    // Limpiar animaciones anteriores
    if (frameId.current) {
      cancelAnimationFrame(frameId.current);
    }
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }

    const startScramble = () => {
      isScrambling.current = true;
      const startTime = Date.now();
      const fps = 30; // Limitar a 30fps para mejor performance
      const frameTime = 1000 / fps;
      let lastFrameTime = startTime;

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Throttle a 30fps
        if (currentTime - lastFrameTime < frameTime) {
          if (progress < 1) {
            frameId.current = requestAnimationFrame(animate);
          }
          return;
        }
        lastFrameTime = currentTime;

        if (progress < 1) {
          // Revelar gradualmente las letras del inicio al final con curva easing
          const easedProgress = 1 - Math.pow(1 - progress, 2); // easeOut
          const revealCount = Math.floor(easedProgress * originalText.length);
          let scrambled = '';

          for (let i = 0; i < originalText.length; i++) {
            if (i < revealCount) {
              // Letra revelada
              scrambled += originalText[i];
            } else if (originalText[i] === ' ') {
              // Mantener espacios
              scrambled += ' ';
            } else {
              // Letra scrambled
              scrambled += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
            }
          }

          element.textContent = scrambled;
          frameId.current = requestAnimationFrame(animate);
        } else {
          // Animación completa, mostrar texto final
          element.textContent = originalText;
          isScrambling.current = false;
        }
      };

      frameId.current = requestAnimationFrame(animate);
    };

    // Iniciar con delay
    if (delay > 0) {
      timeoutId.current = setTimeout(startScramble, delay);
    } else {
      startScramble();
    }

    return () => {
      if (frameId.current) {
        cancelAnimationFrame(frameId.current);
      }
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
      isScrambling.current = false;
    };
  }, [text, duration, delay, trigger]);

  return { ref, isScrambling: isScrambling.current };
}

/**
 * Hook para aplicar scramble a múltiples elementos con delays escalonados
 * @param {Array<string>} texts - Array de textos
 * @param {Object} options - Opciones de configuración
 * @param {number} options.duration - Duración del scramble en ms (default: 600)
 * @param {number} options.staggerDelay - Delay entre cada elemento en ms (default: 100)
 * @param {number} options.initialDelay - Delay inicial antes del primer elemento (default: 0)
 * @param {boolean} options.trigger - Trigger para iniciar la animación (default: true)
 * @returns {Array<Object>} - Array de { ref, isScrambling }
 */
export function useTextScrambleMultiple(texts, options = {}) {
  const {
    duration = 600,
    staggerDelay = 100,
    initialDelay = 0,
    trigger = true,
  } = options;

  const scrambleRefs = texts.map((text, index) =>
    useTextScramble(text, {
      duration,
      delay: initialDelay + (index * staggerDelay),
      trigger,
    })
  );

  return scrambleRefs;
}
