'use client';

import { SUBTEMAS } from './content';
import { cls } from './classes';

/**
 * QueueIndex - Títulos de subtemas que se mueven desde la pila hacia sticky
 * Empiezan apilados abajo y suben cuando su sección entra al viewport
 */
export default function QueueIndex({ labelsRef, navbarHeight = 80 }) {
  const totalLabels = SUBTEMAS.length;

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
            className={`pointer-events-none fixed z-[10] box-border bg-crema ${cls.labelW} ${cls.labelPad} ${cls.rule}`}
            style={{
              // Posición inicial: apilados en la parte inferior
              // ARTIS FACTUM (i=0) arriba, ÉTICAS CREATIVAS (i=3) abajo
              bottom: `${32 + visualIndex * 45}px`,
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
