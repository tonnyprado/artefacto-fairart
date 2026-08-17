import { SUBTEMAS } from '../../data/content';
import { cls } from './classes';

// Pila de subtemas en la esquina inferior izquierda (punto de arranque).
// Cada fila se oculta en cuanto su subtema real entra por el borde inferior.
export default function QueueIndex({ rowsRef }) {
  return (
    <div className="pointer-events-none fixed bottom-8 left-0 z-[2] w-[25vw]">
      {SUBTEMAS.map((s, i) => (
        <div
          key={s.id}
          data-queue={i}
          ref={(el) => { if (el) rowsRef.current[i] = el; }}
          className={`mt-3.5 box-border transition-opacity duration-300 ${cls.labelW} ${cls.labelPad} ${cls.rule}`}
        >
          <div className={cls.labelRow}>
            <span>{s.words[0]}</span>
            <span>{s.words[1]}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
