'use client';

import { useEffect, useRef, useState } from 'react';
import { SUBTEMAS, PHOTOS, HERO, LOGO, INTRO, CIERRE } from './content';
import { cls } from './classes';
import useConocerMasScroll from './useConocerMasScroll';
import SubtemaSection from './SubtemaSection';
import { BREAKPOINTS } from '@/lib/breakpoints';

const NAVBAR_HEIGHT = 80;
const DESKTOP_BREAKPOINT = BREAKPOINTS.lg;
const MOBILE_LOGO_FINAL_TOP = 16;
const MOBILE_STICKY_TOP = 10;

const isClient = typeof window !== 'undefined';

/**
 * ConocerMas - Sección principal "CONOCE MÁS"
 *
 * DESKTOP (>=1024px): Layout de 3 columnas con animaciones complejas
 *   - Toda la geometría se deriva del rect REAL del logo en runtime
 *   - No hay breakpoints ni valores fijos por pantalla
 *   - El hook useConocerMasScroll controla todas las animaciones
 *
 * MÓVIL (<1024px): Layout de 1 columna con animaciones simples
 */
export default function ConocerMas() {
  const [isDesktop, setIsDesktop] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  // Refs para desktop - estructura que espera useConocerMasScroll
  const refs = useRef({ labels: [], contents: [] });
  const set = (key) => (el) => { if (el) refs.current[key] = el; };
  const setArr = (key, i) => (el) => { if (el) refs.current[key][i] = el; };

  // Refs para móvil
  const mobileLogoRef = useRef(null);
  const mobileHeaderBgRef = useRef(null);
  const mobileLabelRefs = useRef([]);
  const mobileContentRef = useRef(null);

  // Detectar si es desktop o móvil
  useEffect(() => {
    if (!isClient) return;

    const checkDesktop = () => {
      const width = window.innerWidth || document.documentElement.clientWidth || 0;
      setIsDesktop(width >= DESKTOP_BREAKPOINT);
    };

    setIsMounted(true);
    checkDesktop();

    window.addEventListener('resize', checkDesktop);
    const initialCheck = setTimeout(checkDesktop, 100);

    return () => {
      window.removeEventListener('resize', checkDesktop);
      clearTimeout(initialCheck);
    };
  }, []);

  // Usar el hook de scroll solo en desktop
  useConocerMasScroll(isDesktop ? refs : { current: null });

  // ========== ANIMACIONES MÓVIL ==========
  useEffect(() => {
    if (!isMounted || isDesktop === null || isDesktop) return;

    const headerBg = mobileHeaderBgRef.current;
    const logoBlock = mobileLogoRef.current;
    const labels = mobileLabelRefs.current.filter(Boolean);

    if (!headerBg || !logoBlock || labels.length === 0) return;

    const vh = window.innerHeight || document.documentElement.clientHeight || 800;
    const heroHeight = vh * 0.75;
    const logoInitialTop = (heroHeight / 2) - 40;

    let raf = null;

    const frame = () => {
      const scrollY = window.scrollY;
      const stickyTop = NAVBAR_HEIGHT + MOBILE_STICKY_TOP;

      const logoAnimStart = heroHeight * 0.3;
      const logoAnimEnd = heroHeight * 0.7;

      let logoProgress = 0;
      if (scrollY > logoAnimStart) {
        logoProgress = Math.min(1, (scrollY - logoAnimStart) / (logoAnimEnd - logoAnimStart));
      }

      const currentLogoTop = logoInitialTop - (logoInitialTop - MOBILE_LOGO_FINAL_TOP) * logoProgress;
      logoBlock.style.top = `${currentLogoTop}px`;

      const scale = 1 - (logoProgress * 0.4);
      logoBlock.style.transform = `scale(${scale})`;
      logoBlock.style.transformOrigin = 'left top';

      headerBg.style.opacity = logoProgress > 0.5 ? (logoProgress - 0.5) * 2 : 0;

      for (let i = 0; i < labels.length; i++) {
        const lab = labels[i];
        if (!lab) continue;

        const labH = lab.offsetHeight;

        if (i < labels.length - 1) {
          const nextLab = labels[i + 1];
          if (!nextLab) continue;

          const nextTop = nextLab.getBoundingClientRect().top;
          const distanceToNext = nextTop - stickyTop;

          if (distanceToNext < labH * 1.5 && distanceToNext > -labH) {
            const pushProgress = Math.max(0, Math.min(1, 1 - (distanceToNext / (labH * 1.5))));
            const maxPush = labH + 10;
            const push = pushProgress * maxPush;
            lab.style.transform = `translateY(${-push}px)`;
            lab.style.opacity = 1 - pushProgress;
          } else if (distanceToNext <= -labH) {
            lab.style.transform = `translateY(${-(labH + 10)}px)`;
            lab.style.opacity = '0';
          } else {
            lab.style.transform = '';
            lab.style.opacity = '1';
          }
        } else {
          lab.style.transform = '';
          lab.style.opacity = '1';
        }
      }

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);

    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [isMounted, isDesktop]);

  // Fotos para móvil
  const mobilePhotos = PHOTOS.slice(0, 8);

  // Todas las secciones móviles
  const allMobileSections = [
    { id: 'conoce-mas', words: ['CONOCE', 'MÁS'], isIntro: true },
    ...SUBTEMAS,
  ];

  // Placeholder mientras se monta
  if (!isMounted || isDesktop === null) {
    return (
      <div className="bg-crema min-h-screen">
        <div className="h-screen" />
      </div>
    );
  }

  // ========== VERSIÓN MÓVIL ==========
  if (!isDesktop) {
    return (
      <div className="bg-crema font-sans text-tinta min-h-screen">
        <div
          ref={mobileHeaderBgRef}
          className="fixed left-0 right-0 top-0 z-[5] pointer-events-none bg-crema"
          style={{ height: `${NAVBAR_HEIGHT + MOBILE_STICKY_TOP}px`, opacity: 0 }}
        />

        <div
          ref={mobileLogoRef}
          className="fixed left-0 z-20 px-5 md:px-8"
          style={{ top: `calc(37.5vh - 40px)` }}
        >
          <img src={LOGO} alt="ARTE FACTO" className="w-40 md:w-52" />
        </div>

        <div className="relative h-[75vh] w-full">
          <img src={HERO} alt="Centro Cultural Estación Indianilla" className="h-full w-full object-cover" />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-white/70 animate-bounce">
            <span className="text-[10px] tracking-widest uppercase font-light">desliza</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>

        <div ref={mobileContentRef} className="relative">
          {allMobileSections.map((s, idx) => (
            <section key={s.id} className="relative min-h-[100vh]">
              <div
                ref={(el) => { if (el) mobileLabelRefs.current[idx] = el; }}
                className="sticky z-10 bg-crema px-5 md:px-8 py-3 md:py-4 border-b border-rojo/50"
                style={{ top: `${NAVBAR_HEIGHT + MOBILE_STICKY_TOP}px` }}
              >
                <div className="flex justify-between max-w-3xl mx-auto">
                  <span className="text-rojo text-2xl md:text-3xl font-black italic tracking-tight">{s.words[0]}</span>
                  <span className="text-rojo text-2xl md:text-3xl font-black italic tracking-tight">{s.words[1]}</span>
                </div>
              </div>

              <div className="px-5 md:px-8 py-8 pb-16 max-w-3xl mx-auto">
                {s.isIntro ? (
                  <>
                    <p className="text-base md:text-lg leading-relaxed text-tinta mb-8">{INTRO}</p>
                    <img src={mobilePhotos[0]} alt="" className="w-full rounded-lg shadow-lg" />
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4 md:gap-8 mb-8">
                      {s.etim.map((e) => (
                        <div key={e.word}>
                          <div className="text-rojo text-base md:text-xl font-black italic">{e.word}</div>
                          <p className="text-sm md:text-base text-tinta/70 mt-1 leading-snug">{e.def}</p>
                        </div>
                      ))}
                    </div>

                    {mobilePhotos[idx] && (
                      <img src={mobilePhotos[idx]} alt="" className="w-full mb-8 rounded-lg shadow-lg" />
                    )}

                    <div className="space-y-5 md:space-y-6">
                      {s.blocks.map((b, i) => {
                        if (b.type === 'intro') return <p key={i} className="text-base md:text-lg leading-relaxed">{INTRO}</p>;
                        if (b.type === 'etimExtra') return (
                          <div key={i} className="mb-10">
                            <div className="text-rojo text-xl md:text-2xl font-black italic">{b.word}</div>
                            <p className="text-sm md:text-base text-tinta/70 mt-2 max-w-[320px]"><em>(lat.)</em>{b.def.replace('(lat.)', '')}</p>
                          </div>
                        );
                        if (b.type === 'h2') return <h2 key={i} className="text-2xl md:text-3xl font-bold text-tinta leading-tight pt-4">{b.text}</h2>;
                        if (b.type === 'h3') return <h3 key={i} className="text-lg md:text-xl font-black italic text-rojo pt-2">{b.text}</h3>;
                        if (b.type === 'kicker') return <div key={i} className="text-base md:text-lg font-black italic text-rojo pt-6">{b.text}</div>;
                        if (b.type === 'image') return <img key={i} src={b.src} alt={b.alt || ''} className="w-full rounded-2xl mt-4 mb-6" />;
                        return (
                          <p key={i} className="text-base md:text-lg leading-relaxed">
                            {b.strongLead && <strong className="font-bold">{b.strongLead}</strong>}
                            {b.text}
                          </p>
                        );
                      })}
                    </div>

                    {idx >= 3 && mobilePhotos[idx + 2] && (
                      <img src={mobilePhotos[idx + 2]} alt="" className="w-full mt-8 rounded-lg shadow-lg" />
                    )}
                  </>
                )}
              </div>
            </section>
          ))}

          <div className="px-5 md:px-8 py-12 border-t border-rojo">
            <div className="text-rojo text-xl md:text-2xl font-black italic text-center max-w-3xl mx-auto">{CIERRE}</div>
          </div>

          <div className="px-5 md:px-8 pb-12 max-w-3xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {mobilePhotos.slice(5).map((photo, i) => (
                <img key={i} src={photo} alt="" className="w-full aspect-square object-cover rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========== VERSIÓN DESKTOP ==========
  return (
    <div className="bg-crema font-sans text-tinta">
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
        <div
          key={s.id}
          ref={setArr('labels', i)}
          className={cls.label}
          role="button"
          tabIndex={0}
          aria-label={`Ir a ${s.words.join(' ')}`}
        >
          <span>{s.words[0]}</span>
          <span>{s.words[1]}</span>
          <i data-line className={cls.line}></i>
        </div>
      ))}

      {/* Bloque beige del logo: los subtemas expulsados pasan POR DETRÁS (z-10 > z-3) */}
      <div ref={set('mask')} className="fixed top-0 left-0 z-10 w-[25vw] bg-crema">
        <img
          ref={set('logo')}
          src={LOGO}
          alt="ARTE FACTO"
          className="absolute left-[max(24px,3.75vw)] top-[min(44px,2.3vw)] w-[min(232px,17.5vw)]"
        />
      </div>

      {/* CONOCE MÁS: ocupa el lugar de fijado cuando ningún subtema está enganchado */}
      <div
        ref={set('ghost')}
        className="fixed top-0 left-0 z-[4] invisible pointer-events-none box-border flex justify-between italic font-black tracking-[-0.02em] leading-none text-rojo transition-opacity duration-300"
      >
        <span>CONOCE</span>
        <span>MÁS</span>
      </div>

      <main className="relative z-[2]">
        {/* Hero */}
        <div className="relative z-[3] ml-[25vw] h-screen">
          <img src={HERO} alt="Centro Cultural Estación Indianilla" className="block h-full w-full object-cover" />
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/70 animate-bounce">
            <span className="text-xs tracking-widest uppercase font-light">desliza</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>

        {/* Secciones de contenido */}
        {SUBTEMAS.map((s, i) => (
          <SubtemaSection
            key={s.id}
            data={s}
            contentRef={setArr('contents', i)}
            introRef={i === 0 ? set('flow') : undefined}
            minH={i === 2 ? 'min-h-[130vh]' : i === 3 ? '' : i === 0 ? 'min-h-[105vh]' : 'min-h-[110vh]'}
          />
        ))}

        {/* Cierre */}
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
