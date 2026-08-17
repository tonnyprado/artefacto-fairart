import { LOGO } from '../../data/content';
import { cls } from './classes';

// Bloque crema superior-izquierdo: logo + "CONOCE MÁS".
// Los subtemas pasan POR DETRÁS de este bloque al salir (z-10 vs z-2 del main).
export default function LogoMask({ maskRef, ghostRef }) {
  return (
    <div ref={maskRef} className={`fixed top-0 left-0 z-10 w-[25vw] bg-crema ${cls.maskH}`}>
      <img
        src={LOGO}
        alt="ARTE FACTO"
        className="absolute left-[max(24px,3.75vw)] top-[min(44px,2.3vw)] w-[min(232px,17.5vw)]"
      />
      <div
        ref={ghostRef}
        className={`absolute left-[max(24px,3.75vw)] w-[min(232px,17.5vw)] transition-opacity duration-300 ${cls.pinTop.replace('top-', 'top-')} ${cls.labelRow}`}
        style={{ top: 'calc(min(44px,2.3vw) + min(130px,9.8vw) + 6px)' }}
      >
        <span>CONOCE</span>
        <span>MÁS</span>
      </div>
    </div>
  );
}
