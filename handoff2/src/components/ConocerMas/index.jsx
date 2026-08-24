import { useRef } from 'react';
import { SUBTEMAS, PHOTOS, HERO, LOGO, INTRO, CIERRE } from '../../data/content';
import { cls } from './classes';
import useConocerMasScroll from './useConocerMasScroll';
import SubtemaSection from './SubtemaSection';

export default function ConocerMas() {
  const refs = useRef({ labels: [], contents: [] });
  const set = (key) => (el) => { if (el) refs.current[key] = el; };
  const setArr = (key, i) => (el) => { if (el) refs.current[key][i] = el; };
  useConocerMasScroll(refs);

  return (
    <div className="bg-crema font-inter-tight text-tinta">
      {/* Carril derecho de fotos: fijo, su track se traslada 1.6× el scroll */}
      <div ref={set('rail')} className="fixed top-0 right-0 bottom-0 z-[1] w-[39.5vw] overflow-hidden">
        <div ref={set('track')} className="flex flex-col pt-[88vh] will-change-transform">
          {PHOTOS.map((src, i) => <img key={i} src={src} alt="" className="block w-full" />)}
        </div>
      </div>

      {/* Manifiesto fijado (posición/altura las fija el hook; línea = la del subtema) */}
      <div ref={set('pin')} className="fixed top-0 z-[9] hidden items-end bg-crema border-b-[1.33px] border-rojo box-border">
        <p className={`m-0 ${cls.body}`}>{INTRO}</p>
      </div>

      {/* Subtemas: labels fijos, también botones de navegación */}
      {SUBTEMAS.map((s, i) => (
        <div key={s.id} ref={setArr('labels', i)} className={cls.label} role="button" tabIndex={0} aria-label={`Ir a ${s.words.join(' ')}`}>
          <span>{s.words[0]}</span>
          <span>{s.words[1]}</span>
          <i data-line className={cls.line}></i>
        </div>
      ))}

      {/* Bloque beige del logo: los subtemas expulsados pasan POR DETRÁS (z-10 > z-3) */}
      <div ref={set('mask')} className="fixed top-0 left-0 z-10 w-[25vw] bg-crema">
        <img ref={set('logo')} src={LOGO} alt="ARTE FACTO" className="absolute left-[max(24px,3.75vw)] top-[min(44px,2.3vw)] w-[min(232px,17.5vw)]" />
      </div>
      {/* CONOCE MÁS: ocupa el lugar de fijado cuando ningún subtema está enganchado */}
      <div ref={set('ghost')} className="fixed top-0 left-0 z-[4] invisible pointer-events-none box-border flex justify-between italic font-black tracking-[-0.02em] leading-none text-rojo transition-opacity duration-300">
        <span>CONOCE</span>
        <span>MÁS</span>
      </div>

      <main className="relative z-[2]">
        <div className="relative z-[3] ml-[25vw] h-screen">
          <img src={HERO} alt="Centro Cultural Estación Indianilla" className="block h-full w-full object-cover" />
        </div>

        {SUBTEMAS.map((s, i) => (
          <SubtemaSection
            key={s.id}
            data={s}
            contentRef={setArr('contents', i)}
            introRef={i === 0 ? set('flow') : undefined}
            minH={i === 2 ? 'min-h-[130vh]' : i === 3 ? '' : i === 0 ? 'min-h-[105vh]' : 'min-h-[110vh]'}
          />
        ))}

        <div className="ml-[25vw] pb-[16vh] pr-[calc(39.5vw+48px)]">
          <div className="max-w-[641px] border-t border-rojo pt-[18px] italic font-medium tracking-[-0.05em] text-[clamp(14px,1.05vw,20px)] text-rojo">
            {CIERRE}
          </div>
        </div>
        {/* Spacer final: el hook lo dimensiona para que ÉTICAS CREATIVAS
            siempre alcance su lugar bajo el logo antes de agotar el scroll */}
        <div ref={set('spacer')} style={{ height: 0 }}></div>
      </main>
    </div>
  );
}
