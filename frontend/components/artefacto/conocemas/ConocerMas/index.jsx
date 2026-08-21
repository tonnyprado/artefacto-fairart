'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { SUBTEMAS, HERO, CIERRE, INTRO, LOGO, PHOTOS } from './content';
import { cls } from './classes';
import PhotoRail from './PhotoRail';
import LogoMask from './LogoMask';
import QueueIndex from './QueueIndex';
import PinnedIntro from './PinnedIntro';
import SubtemaSection from './SubtemaSection';

const PHOTO_SPEED = 1.6;
const NAVBAR_HEIGHT = 80;
const DESKTOP_BREAKPOINT = 1024;
const MOBILE_LOGO_FINAL_TOP = 16;
const MOBILE_STICKY_TOP = 10;

// Helper para obtener scroll position de forma compatible
const getScrollY = () => {
  return window.scrollY ?? window.pageYOffset ?? document.documentElement.scrollTop ?? 0;
};

// Helper para verificar si estamos en el cliente
const isClient = typeof window !== 'undefined';

/**
 * ConocerMas - Sección principal "CONOCE MÁS"
 *
 * DESKTOP (>=1024px): Layout de 3 columnas con animaciones complejas
 * MÓVIL (<1024px): Layout de 1 columna con animaciones de empuje adaptadas
 */
export default function ConocerMas() {
  // Inicializar como null para evitar flash de contenido incorrecto
  const [isDesktop, setIsDesktop] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  // Refs Desktop
  const trackRef = useRef(null);
  const maskRef = useRef(null);
  const ghostRef = useRef(null);
  const pinRef = useRef(null);
  const introRef = useRef(null);
  const labelsRef = useRef([]);
  const sectionRefs = useRef([]);

  // Refs Móvil
  const mobileLogoRef = useRef(null);
  const mobileHeaderBgRef = useRef(null);
  const mobileLabelRefs = useRef([]);
  const mobileContentRef = useRef(null);

  // Detectar si es desktop o móvil - con manejo robusto de SSR
  useEffect(() => {
    if (!isClient) return;

    const checkDesktop = () => {
      const width = window.innerWidth || document.documentElement.clientWidth || 0;
      setIsDesktop(width >= DESKTOP_BREAKPOINT);
    };

    // Marcar como montado y detectar tamaño inicial
    setIsMounted(true);
    checkDesktop();

    window.addEventListener('resize', checkDesktop);
    // Algunos navegadores necesitan un pequeño delay para reportar el tamaño correcto
    const initialCheck = setTimeout(checkDesktop, 100);

    return () => {
      window.removeEventListener('resize', checkDesktop);
      clearTimeout(initialCheck);
    };
  }, []);

  // ========== ANIMACIONES MÓVIL ==========
  useEffect(() => {
    if (!isMounted || isDesktop === null || isDesktop) return;

    const headerBg = mobileHeaderBgRef.current;
    const logoBlock = mobileLogoRef.current;
    const labels = mobileLabelRefs.current.filter(Boolean);

    if (!headerBg || !logoBlock || labels.length === 0) return;

    // Posición inicial del logo (centro del hero)
    const vh = window.innerHeight || document.documentElement.clientHeight || 800;
    const heroHeight = vh * 0.75;
    const logoInitialTop = (heroHeight / 2) - 40;

    const frame = () => {
      const scrollY = getScrollY();
      const stickyTop = NAVBAR_HEIGHT + MOBILE_STICKY_TOP;

      // Calcular progreso del logo basado en scroll
      const logoAnimStart = heroHeight * 0.3; // Empieza a moverse cuando scrolleamos 30% del hero
      const logoAnimEnd = heroHeight * 0.7; // Termina cuando scrolleamos 70% del hero

      let logoProgress = 0;
      if (scrollY > logoAnimStart) {
        logoProgress = Math.min(1, (scrollY - logoAnimStart) / (logoAnimEnd - logoAnimStart));
      }

      // Mover el logo desde su posición inicial hasta alinearse con el navbar
      const currentLogoTop = logoInitialTop - (logoInitialTop - MOBILE_LOGO_FINAL_TOP) * logoProgress;
      logoBlock.style.top = `${currentLogoTop}px`;

      // Escalar el logo (empieza grande, termina más pequeño)
      const scale = 1 - (logoProgress * 0.4);
      logoBlock.style.transform = `scale(${scale})`;
      logoBlock.style.transformOrigin = 'left top';

      // Mostrar fondo del header cuando el logo está casi en su posición final
      headerBg.style.opacity = logoProgress > 0.5 ? (logoProgress - 0.5) * 2 : 0;

      // Empuje entre títulos móviles
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
    };

    // Usar GSAP ticker si está disponible, sino requestAnimationFrame
    let rafId = null;
    const useRaf = !gsap?.ticker;

    if (useRaf) {
      const loop = () => {
        frame();
        rafId = requestAnimationFrame(loop);
      };
      rafId = requestAnimationFrame(loop);
    } else {
      gsap.ticker.add(frame);
    }

    return () => {
      if (useRaf && rafId) {
        cancelAnimationFrame(rafId);
      } else if (gsap?.ticker) {
        gsap.ticker.remove(frame);
      }
    };
  }, [isMounted, isDesktop]);

  // ========== ANIMACIONES DESKTOP ==========
  useEffect(() => {
    if (!isMounted || isDesktop === null || !isDesktop) return;

    const track = trackRef.current;
    const rail = track?.parentElement;
    const mask = maskRef.current;
    const ghost = ghostRef.current;
    const pin = pinRef.current;
    const flow = introRef.current;
    let introTop = null;
    let pinned = false;

    // Usar quickSetter si está disponible, sino función directa
    const setTrackY = track && gsap?.quickSetter
      ? gsap.quickSetter(track, 'y', 'px')
      : (val) => { if (track) track.style.transform = `translateY(${val}px)`; };

    const measure = () => {
      if (!flow) return;
      try {
        introTop = flow.getBoundingClientRect().top + getScrollY();
        if (pinned) placePin();
      } catch (e) {
        console.warn('ConocerMas: Error measuring intro position');
      }
    };

    const placePin = () => {
      if (!flow || !pin) return;
      try {
        const r = flow.getBoundingClientRect();
        if (r.width > 100) {
          pin.style.left = r.left + 'px';
          pin.style.width = r.width + 'px';
        }
      } catch (e) {
        console.warn('ConocerMas: Error placing pin');
      }
    };

    const frame = () => {
      const s = getScrollY();
      const vh = window.innerHeight || document.documentElement.clientHeight || 800;
      const labels = labelsRef.current.filter(Boolean);
      const sections = sectionRefs.current.filter(Boolean);

      // Verificar que tenemos elementos válidos
      if (!labels.length) return;

      // 1) Carril de fotos
      if (track && rail) {
        const maxTy = Math.max(0, track.scrollHeight - rail.clientHeight);
        setTrackY(-Math.min(s * PHOTO_SPEED, maxTy));
      }

      // 2) Títulos que se mueven desde la pila hacia posición sticky
      let maskBottom;
      try {
        maskBottom = mask ? mask.getBoundingClientRect().bottom : NAVBAR_HEIGHT + 150;
      } catch (e) {
        maskBottom = NAVBAR_HEIGHT + 150;
      }

      const stickyTop = maskBottom + 6;
      const stackBaseBottom = 32; // Posición base de la pila
      const labelSpacing = 45; // Espacio entre labels apilados
      const totalLabels = labels.length;

      for (let i = 0; i < labels.length; i++) {
        const lab = labels[i];
        const section = sections[i];
        if (!lab) continue;

        const labH = lab.offsetHeight || 45;

        // Calcular posición inicial (apilado abajo)
        // ARTIS FACTUM (i=0) arriba, ÉTICAS CREATIVAS (i=3) abajo
        const visualIndex = totalLabels - 1 - i;
        const initialBottom = stackBaseBottom + visualIndex * labelSpacing;

        // Obtener posición de la sección correspondiente
        let sectionTop = vh + 100; // Valor por defecto si no hay sección
        if (section) {
          try {
            sectionTop = section.getBoundingClientRect().top;
          } catch (e) {}
        }

        // Calcular cuándo debe empezar a moverse el label
        // El label empieza a moverse cuando su sección está a 80% del viewport
        const triggerPoint = vh * 0.8;
        const moveDistance = vh - initialBottom - stickyTop; // Distancia total a recorrer

        if (sectionTop > triggerPoint) {
          // Sección aún no ha llegado - label en posición apilada
          lab.style.top = 'auto';
          lab.style.bottom = `${initialBottom}px`;
          lab.style.transform = '';
          lab.style.opacity = '1';
        } else if (sectionTop > stickyTop) {
          // Sección está entre el trigger y la posición sticky - animando
          const progress = 1 - ((sectionTop - stickyTop) / (triggerPoint - stickyTop));
          lab.style.bottom = 'auto';
          lab.style.top = `${vh - initialBottom - labH - (progress * moveDistance)}px`;
          lab.style.transform = '';
          lab.style.opacity = '1';
        } else {
          // Sección llegó a sticky - label en posición sticky
          lab.style.bottom = 'auto';
          lab.style.top = `${stickyTop}px`;

          // Verificar si el siguiente label lo está empujando
          const nextSection = sections[i + 1];
          if (nextSection) {
            let nextSectionTop;
            try {
              nextSectionTop = nextSection.getBoundingClientRect().top;
            } catch (e) {
              nextSectionTop = vh + 100;
            }

            // pushZone más pequeño = el título se queda más tiempo en sticky
            // El empuje empieza cuando el siguiente título está muy cerca
            const pushZone = labH * 0.8;
            if (nextSectionTop < stickyTop + pushZone && nextSectionTop > stickyTop - labH) {
              // Siendo empujado - solo cuando el siguiente está casi alineado
              const pushProgress = 1 - ((nextSectionTop - stickyTop) / pushZone);
              const pushAmount = Math.max(0, pushProgress * labH);
              lab.style.transform = `translateY(${-pushAmount}px)`;
              lab.style.opacity = String(Math.max(0.2, 1 - pushProgress * 0.8));
            } else if (nextSectionTop <= stickyTop - labH) {
              // Completamente empujado (oculto)
              lab.style.transform = `translateY(${-labH}px)`;
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
      }

      // 3) "CONOCE MÁS" visibility
      const firstSection = sections[0];
      if (ghost && firstSection) {
        try {
          const firstSectionTop = firstSection.getBoundingClientRect().top;
          ghost.style.opacity = firstSectionTop <= vh * 0.8 ? '0' : '1';
        } catch (e) {
          // Ignorar errores de getBoundingClientRect
        }
      }

      // 4) Manifiesto fijado - texto INTRO sticky
      let flowRect;
      try {
        flowRect = flow?.getBoundingClientRect();
      } catch (e) {
        flowRect = null;
      }
      const hasValidFlow = flowRect && flowRect.width > 50;

      // Re-calcular introTop si no se ha calculado aún
      if (introTop === null && flow && hasValidFlow) {
        introTop = flowRect.top + s;
      }

      if (introTop != null && pin && flow && hasValidFlow) {
        // El texto se fija cuando llega al navbar
        const pinTrigger = NAVBAR_HEIGHT + 16;
        const flowTop = flowRect.top;
        const shouldPin = flowTop <= pinTrigger;

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
      } else if (pinned) {
        pinned = false;
        pin.style.display = 'none';
        if (flow) flow.style.visibility = 'visible';
      }
    };

    // Usar GSAP ticker si está disponible, sino requestAnimationFrame
    let rafId = null;
    const useRaf = !gsap?.ticker;

    if (useRaf) {
      const loop = () => {
        frame();
        rafId = requestAnimationFrame(loop);
      };
      rafId = requestAnimationFrame(loop);
    } else {
      gsap.ticker.add(frame);
    }

    window.addEventListener('resize', measure);

    // Esperar a que las fuentes estén listas si es posible
    if (document.fonts?.ready) {
      document.fonts.ready.then(measure).catch(() => {});
    }

    measure();
    const t1 = setTimeout(measure, 500);
    const t2 = setTimeout(measure, 1500);

    return () => {
      if (useRaf && rafId) {
        cancelAnimationFrame(rafId);
      } else if (gsap?.ticker) {
        gsap.ticker.remove(frame);
      }
      window.removeEventListener('resize', measure);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isMounted, isDesktop]);

  // Fotos para móvil (intercaladas)
  const mobilePhotos = PHOTOS.slice(0, 8);

  // Todas las secciones móviles (CONOCE MÁS + SUBTEMAS)
  const allMobileSections = [
    { id: 'conoce-mas', words: ['CONOCE', 'MÁS'], isIntro: true },
    ...SUBTEMAS,
  ];

  // Mostrar un placeholder mínimo mientras se determina el layout
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
        {/* Fondo del header (navbar + logo compacto) - aparece gradualmente al scrollear */}
        <div
          ref={mobileHeaderBgRef}
          className="fixed left-0 right-0 top-0 z-[5] pointer-events-none bg-crema"
          style={{
            height: `${NAVBAR_HEIGHT + MOBILE_STICKY_TOP}px`,
            opacity: 0,
          }}
        />

        {/* Logo - empieza en el centro del hero y sube al navbar */}
        <div
          ref={mobileLogoRef}
          className="fixed left-0 z-20 px-5"
          style={{
            top: `calc(37.5vh - 40px)`, // Posición inicial: centro del hero
          }}
        >
          <img src={LOGO} alt="ARTE FACTO" className="w-40" />
        </div>

        {/* Hero móvil */}
        <div className="relative h-[75vh] w-full">
          <img
            src={HERO}
            alt="Centro Cultural Estación Indianilla"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Contenido móvil */}
        <div ref={mobileContentRef} className="relative">
          {/* Todas las secciones con títulos sticky */}
          {allMobileSections.map((s, idx) => (
            <section
              key={s.id}
              className="relative min-h-[100vh]"
            >
              {/* Título sticky que se empuja */}
              <div
                ref={(el) => { if (el) mobileLabelRefs.current[idx] = el; }}
                className="sticky z-10 bg-crema px-5 py-3 border-b border-rojo/50"
                style={{ top: `${NAVBAR_HEIGHT + MOBILE_STICKY_TOP}px` }}
              >
                <div className="flex justify-between">
                  <span className="text-rojo text-2xl font-black italic tracking-tight">{s.words[0]}</span>
                  <span className="text-rojo text-2xl font-black italic tracking-tight">{s.words[1]}</span>
                </div>
              </div>

              {/* Contenido de la sección */}
              <div className="px-5 py-8 pb-16">
                {s.isIntro ? (
                  <>
                    {/* Contenido de CONOCE MÁS */}
                    <p className="text-base leading-relaxed text-tinta mb-8">
                      {INTRO}
                    </p>
                    <img
                      src={mobilePhotos[0]}
                      alt=""
                      className="w-full rounded-lg shadow-lg"
                    />
                  </>
                ) : (
                  <>
                    {/* Etimología */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      {s.etim.map((e) => (
                        <div key={e.word}>
                          <div className="text-rojo text-base font-black italic">{e.word}</div>
                          <p className="text-sm text-tinta/70 mt-1 leading-snug">{e.def}</p>
                        </div>
                      ))}
                    </div>

                    {/* Foto intercalada */}
                    {mobilePhotos[idx] && (
                      <img
                        src={mobilePhotos[idx]}
                        alt=""
                        className="w-full mb-8 rounded-lg shadow-lg"
                      />
                    )}

                    {/* Bloques de contenido */}
                    <div className="space-y-5">
                      {s.blocks.map((b, i) => {
                        if (b.type === 'intro') {
                          return (
                            <p key={i} className="text-base leading-relaxed">
                              {INTRO}
                            </p>
                          );
                        }
                        if (b.type === 'etimExtra') {
                          return (
                            <div key={i} className="mb-10">
                              <div className="text-rojo text-xl font-black italic">{b.word}</div>
                              <p className="text-sm text-tinta/70 mt-2 max-w-[280px]">
                                <em>(lat.)</em>{b.def.replace('(lat.)', '')}
                              </p>
                            </div>
                          );
                        }
                        if (b.type === 'h2') {
                          return (
                            <h2 key={i} className="text-2xl font-bold text-tinta leading-tight pt-4">
                              {b.text}
                            </h2>
                          );
                        }
                        if (b.type === 'h3') {
                          return (
                            <h3 key={i} className="text-lg font-black italic text-rojo pt-2">
                              {b.text}
                            </h3>
                          );
                        }
                        if (b.type === 'kicker') {
                          return (
                            <div key={i} className="text-base font-black italic text-rojo pt-6">
                              {b.text}
                            </div>
                          );
                        }
                        if (b.type === 'image') {
                          return (
                            <img
                              key={i}
                              src={b.src}
                              alt={b.alt || ''}
                              className="w-full rounded-2xl mt-4 mb-6"
                            />
                          );
                        }
                        return (
                          <p key={i} className="text-base leading-relaxed">
                            {b.strongLead && <strong className="font-bold">{b.strongLead}</strong>}
                            {b.text}
                          </p>
                        );
                      })}
                    </div>

                    {/* Otra foto intercalada (para secciones largas) */}
                    {idx >= 3 && mobilePhotos[idx + 2] && (
                      <img
                        src={mobilePhotos[idx + 2]}
                        alt=""
                        className="w-full mt-8 rounded-lg shadow-lg"
                      />
                    )}
                  </>
                )}
              </div>
            </section>
          ))}

          {/* Cierre */}
          <div className="px-5 py-12 border-t border-rojo">
            <div className="text-rojo text-xl font-black italic text-center">
              {CIERRE}
            </div>
          </div>

          {/* Grid de fotos final */}
          <div className="px-5 pb-12">
            <div className="grid grid-cols-2 gap-3">
              {mobilePhotos.slice(5).map((photo, i) => (
                <img
                  key={i}
                  src={photo}
                  alt=""
                  className="w-full aspect-square object-cover rounded-lg"
                />
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
      <PhotoRail trackRef={trackRef} navbarHeight={NAVBAR_HEIGHT} />
      <PinnedIntro pinRef={pinRef} navbarHeight={NAVBAR_HEIGHT} />
      <QueueIndex labelsRef={labelsRef} navbarHeight={NAVBAR_HEIGHT} />
      <LogoMask maskRef={maskRef} ghostRef={ghostRef} navbarHeight={NAVBAR_HEIGHT} />

      <main className="relative z-[2]">
        {/* Hero */}
        <div className="relative z-[3] ml-[25vw] h-screen">
          <img
            src={HERO}
            alt="Centro Cultural Estación Indianilla"
            className="block h-full w-full object-cover"
          />
        </div>

        {/* Secciones de subtemas */}
        {SUBTEMAS.map((s, i) => (
          <SubtemaSection
            key={s.id}
            data={s}
            sectionRef={(el) => {
              if (el) sectionRefs.current[i] = el;
            }}
            introRef={i === 0 ? introRef : undefined}
            minH={i === 2 ? 'min-h-[130vh]' : i === 3 ? '' : 'min-h-[110vh]'}
          />
        ))}

        {/* Cierre */}
        <div className="ml-[25vw] pb-[16vh] pr-[calc(39.5vw+48px)]">
          <div className="max-w-[641px] border-t-[1.33px] border-rojo pt-[18px] italic font-black tracking-[-0.05em] text-[clamp(14px,1.05vw,20px)] text-rojo">
            {CIERRE}
          </div>
        </div>
      </main>
    </div>
  );
}
