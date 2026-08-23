'use client';

import { SUBTEMAS } from './content';
import { cls, NAVBAR_HEIGHT } from './classes';

/**
 * QueueIndex - Títulos de subtemas que se mueven desde la pila hacia sticky
 * Empiezan apilados abajo y suben cuando su sección entra al viewport
 * CLICKEABLES: Al hacer clic, navegan a la sección correspondiente
 *
 * Usa valores responsive con clamp() para adaptarse a todas las pantallas
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
            ref={(el) => {
              if (el) labelsRef.current[i] = el;
            }}
            onClick={() => handleLabelClick(s.id)}
            className={`pointer-events-auto cursor-pointer fixed z-[11] box-border bg-crema ${cls.labelW} ${cls.labelPad} ${cls.rule} hover:bg-rojo/10 transition-all duration-300`}
            style={{
              // Posición inicial: apilados en la parte inferior
              // Usar clamp() para espaciado responsive
              bottom: `calc(clamp(24px, 3vh, 40px) + ${visualIndex} * clamp(36px, 4vh, 50px))`,
              left: 0,
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
