import { INTRO } from '../../data/content';
import { cls } from './classes';

// Copia fija del manifiesto: se muestra cuando el párrafo en flujo alcanza
// lo alto de la pantalla; el contenido posterior desaparece por detrás.
export default function PinnedIntro({ pinRef }) {
  return (
    <div
      ref={pinRef}
      className="fixed top-0 z-[9] hidden bg-crema pt-[52px] pb-[22px] border-b border-rojo/35"
    >
      <p className={`m-0 ${cls.body}`}>{INTRO}</p>
    </div>
  );
}
