'use client';

import { SUBTEMAS } from './content';
import { cls, NAVBAR_HEIGHT } from './classes';

/**
 * QueueIndex - Títulos de subtemas que se mueven desde la pila hacia sticky
 * Empiezan apilados abajo y suben cuando su sección entra al viewport
 * CLICKEABLES: Al hacer clic, navegan a la sección correspondiente
 *
 * Usa valores responsive con clamp() para adaptarse a todas las pantallas
 *
 * IMPORTANTE: El JS en index.jsx controla opacity y visibility de estos elementos
 * para coordinar con los sticky labels de SubtemaSection
 */
export default function QueueIndex({ labelsRef, navbarHeight = NAVBAR_HEIGHT }) {
  const totalLabels = SUBTEMAS.length;

  const handleLabelClick = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      const offset = navbarHeight + 100;
      const elementPosition = section.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
      {SUBTEMAS.map((s, i) => {
        // Invertir el orden visual: el primero (ARTIS FACTUM) arriba, el último (ÉTICAS CREATIVAS) abajo
        const visualIndex = totalLabels - 1 - i;

        return (
          <div
            key={s.id}
            data-label={i}
            data-stacked-label={s.id}
            ref={(el) => {
              if (el) labelsRef.current[i] = el;
            }}
            onClick={() => handleLabelClick(s.id)}
            className={`pointer-events-auto cursor-pointer fixed z-[11] box-border bg-crema border-b-[1.33px] border-rojo ${cls.labelW} ${cls.labelPad} hover:bg-rojo/10 transition-colors duration-300`}
            style={{
              // Posición inicial: apilados en la parte inferior
              // Usar clamp() para espaciado responsive
              bottom: `calc(clamp(24px, 3vh, 40px) + ${visualIndex} * clamp(36px, 4vh, 50px))`,
              left: 0,
              // Estado inicial: visible (el JS lo oculta cuando el sticky aparece)
              opacity: 1,
              visibility: 'visible',
              // Línea roja inferior - inline para garantizar que aparezca en todos los navegadores
              borderBottom: '1.33px solid #C8102E',
              // Transición suave para opacity controlada por JS
              transition: 'opacity 0.3s ease, transform 0.3s ease, background-color 0.3s ease',
            }}
          >
            <div className={cls.labelRow}>
              <span>{s.words[0]}</span>
              <span>{s.words[1]}</span>
            </div>
          </div>
        );
      })}
    </>
  );
}
