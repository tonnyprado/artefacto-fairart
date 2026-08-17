import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { SUBTEMAS, HERO, CIERRE } from '../../data/content';
import { cls } from './classes';
import PhotoRail from './PhotoRail';
import LogoMask from './LogoMask';
import QueueIndex from './QueueIndex';
import PinnedIntro from './PinnedIntro';
import SubtemaSection from './SubtemaSection';

const PHOTO_SPEED = 1.6; // multiplicador del carril de fotos vs scroll

export default function ConocerMas() {
  const trackRef = useRef(null);
  const maskRef = useRef(null);
  const ghostRef = useRef(null);
  const pinRef = useRef(null);
  const introRef = useRef(null);
  const labelRefs = useRef([]);
  const rowsRef = useRef([]);

  useEffect(() => {
    const track = trackRef.current;
    const rail = track?.parentElement;
    const mask = maskRef.current;
    const ghost = ghostRef.current;
    const pin = pinRef.current;
    const flow = introRef.current;
    let introTop = null;
    let pinned = false;

    const setTrackY = gsap.quickSetter(track, 'y', 'px');

    const measure = () => {
      if (!flow) return;
      introTop = flow.getBoundingClientRect().top + window.scrollY;
      if (pinned) placePin();
    };
    const placePin = () => {
      const r = flow.getBoundingClientRect();
      pin.style.left = r.left + 'px';
      pin.style.width = r.width + 'px';
    };

    // Un solo frame-loop (gsap.ticker) — compatible con Lenis porque
    // Lenis anima el scroll nativo (window.scrollY siempre es la verdad).
    const frame = () => {
      const s = window.scrollY;
      const vh = window.innerHeight;
      const labels = labelRefs.current.filter(Boolean);

      // 1) Carril de fotos más rápido que el contenido
      const maxTy = Math.max(0, track.scrollHeight - rail.clientHeight);
      setTrackY(-Math.min(s * PHOTO_SPEED, maxTy));

      // 2) Empuje entre subtemas: el entrante toca al saliente y lo
      //    desliza tras el bloque del logo
      for (let i = 0; i < labels.length - 1; i++) {
        const lab = labels[i];
        const labH = lab.offsetHeight;
        const pinY = parseFloat(getComputedStyle(lab).top);
        const nextTop = labels[i + 1].getBoundingClientRect().top;
        const push = Math.max(
          -(labH + 16),
          Math.min(0, (nextTop - (pinY + labH)) * ((labH + 12) / labH))
        );
        lab.style.transform = push < 0 ? `translateY(${push}px)` : '';
      }

      // 3) "CONOCE MÁS" visible solo cuando ningún subtema está fijado
      if (ghost && mask && labels.length) {
        const maskBottom = mask.getBoundingClientRect().bottom;
        const anyPinned = labels.some((l) => l.getBoundingClientRect().top <= maskBottom + 16);
        ghost.style.opacity = anyPinned ? 0 : 1;
      }

      // 4) Manifiesto fijado junto al logo
      if (introTop != null) {
        const shouldPin = s >= introTop - 52;
        if (shouldPin && !pinned) {
          pinned = true;
          placePin();
          pin.style.display = 'block';
          flow.style.visibility = 'hidden';
        } else if (!shouldPin && pinned) {
          pinned = false;
          pin.style.display = 'none';
          flow.style.visibility = 'visible';
        }
      }

      // 5) Pila inferior: cada fila desaparece cuando su subtema real entra
      rowsRef.current.forEach((row, i) => {
        const lab = labels[i];
        if (!row || !lab) return;
        row.style.opacity = lab.getBoundingClientRect().top > vh - 10 ? 1 : 0;
      });
    };

    gsap.ticker.add(frame);
    window.addEventListener('resize', measure);
    document.fonts?.ready?.then(measure);
    measure();
    const t = setTimeout(measure, 800);

    return () => {
      gsap.ticker.remove(frame);
      window.removeEventListener('resize', measure);
      clearTimeout(t);
    };
  }, []);

  return (
    <div className="bg-crema font-inter-tight text-tinta">
      <PhotoRail trackRef={trackRef} />
      <PinnedIntro pinRef={pinRef} />
      <QueueIndex rowsRef={rowsRef} />
      <LogoMask maskRef={maskRef} ghostRef={ghostRef} />

      <main className="relative z-[2]">
        {/* Hero: foto del venue cubriendo columnas central y derecha */}
        <div className="relative z-[3] ml-[25vw] h-screen">
          <img src={HERO} alt="Centro Cultural Estación Indianilla" className="block h-full w-full object-cover" />
        </div>

        {SUBTEMAS.map((s, i) => (
          <SubtemaSection
            key={s.id}
            data={s}
            labelRef={(el) => { if (el) labelRefs.current[i] = el; }}
            introRef={i === 0 ? introRef : undefined}
            minH={i === 2 ? 'min-h-[130vh]' : i === 3 ? '' : 'min-h-[110vh]'}
          />
        ))}

        <div className="ml-[25vw] pb-[16vh] pr-[calc(39.5vw+48px)]">
          <div className={`max-w-[641px] border-t-[1.33px] border-rojo pt-[18px] italic font-black tracking-[-0.05em] text-[clamp(14px,1.05vw,20px)] text-rojo`}>
            {CIERRE}
          </div>
        </div>
      </main>
    </div>
  );
}
