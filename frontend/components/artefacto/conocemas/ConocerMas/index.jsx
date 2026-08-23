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
import { BREAKPOINTS } from '@/lib/breakpoints';

const PHOTO_SPEED = 1.6;
const NAVBAR_HEIGHT = 80;
// Usar breakpoint lg (1024px) para consistencia con todo el proyecto
const DESKTOP_BREAKPOINT = BREAKPOINTS.lg;
const MOBILE_LOGO_FINAL_TOP = 16;
const MOBILE_STICKY_TOP = 10;

// Helper para obtener scroll position de forma compatible
const getScrollY = () => {
  return window.scrollY ?? window.pageYOffset ?? document.documentElement.scrollTop ?? 0;
};

// Helper para verificar si estamos en el cliente
const isClient = typeof window !== 'undefined';

// Helper para detectar iPad/tablets - para reducir animaciones
const isTabletDevice = () => {
  if (!isClient) return false;
  const ua = navigator.userAgent;
  return /iPad|Android(?!.*Mobile)/i.test(ua) ||
         (navigator.maxTouchPoints > 1 && window.innerWidth >= 768 && window.innerWidth <= 1366);
};

// Helper para detectar dispositivos táctiles (incluye laptops con pantalla táctil)
const isTouchDevice = () => {
  if (!isClient) return false;
  return 'ontouchstart' in window ||
         navigator.maxTouchPoints > 0 ||
         window.matchMedia('(pointer: coarse)').matches;
};

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
  const sectionRefs = useRef([]);
  const labelsRef = useRef([]); // Labels apilados (QueueIndex)
  const stickyLabelsRef = useRef([]); // Labels sticky dentro de secciones

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
  // Coordinación entre labels apilados (QueueIndex) y labels sticky (SubtemaSection)
  // Cuando la sección entra al viewport, el label apilado se desvanece y el sticky aparece
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

    // Detectar si es dispositivo táctil (incluye laptops con pantalla táctil)
    const isTouch = isTouchDevice();
    const isTablet = isTabletDevice();

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
      const sections = sectionRefs.current.filter(Boolean);
      const stackedLabels = labelsRef.current.filter(Boolean);
      const stickyLabels = stickyLabelsRef.current.filter(Boolean);

      // 1) Carril de fotos
      if (track && rail) {
        const maxTy = Math.max(0, track.scrollHeight - rail.clientHeight);
        setTrackY(-Math.min(s * PHOTO_SPEED, maxTy));
      }

      // 2) Calcular posición del LogoMask para referencia
      let maskBottom;
      try {
        maskBottom = mask ? mask.getBoundingClientRect().bottom : NAVBAR_HEIGHT + 150;
      } catch (e) {
        maskBottom = NAVBAR_HEIGHT + 150;
      }

      // 3) Coordinación de labels: apilados vs sticky
      // El label apilado se desvanece cuando su sección entra, el sticky aparece
      // En tablets/touch, usar un trigger point más bajo para mejor UX
      const triggerPoint = isTablet ? vh * 0.9 : vh * 0.85;
      const transitionZone = isTablet ? vh * 0.25 : vh * 0.3;

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const stackedLabel = stackedLabels[i];
        const stickyLabel = stickyLabels[i];

        if (!section) continue;

        let sectionTop;
        try {
          sectionTop = section.getBoundingClientRect().top;
        } catch (e) {
          continue;
        }

        // Calcular progreso de la transición
        // 0 = sección no ha llegado, 1 = sección completamente en viewport
        let progress = 0;

        if (sectionTop < triggerPoint) {
          progress = Math.min(1, (triggerPoint - sectionTop) / transitionZone);
        }

        // Label apilado: se desvanece (1 -> 0)
        if (stackedLabel) {
          const stackedOpacity = Math.max(0, 1 - progress);
          stackedLabel.style.opacity = String(stackedOpacity);
          // También mover hacia arriba mientras se desvanece
          stackedLabel.style.transform = `translateY(${-progress * 30}px)`;
          // Ocultar completamente cuando progress >= 1 para evitar cualquier artefacto
          stackedLabel.style.visibility = progress >= 0.95 ? 'hidden' : 'visible';
        }

        // Label sticky: aparece (0 -> 1)
        if (stickyLabel) {
          const stickyOpacity = Math.min(1, progress);
          stickyLabel.style.opacity = String(stickyOpacity);
          // Mostrar solo cuando tiene opacidad significativa
          stickyLabel.style.visibility = progress >= 0.05 ? 'visible' : 'hidden';
        }
      }

      // 4) "CONOCE MÁS" visibility - se oculta cuando la primera sección llega
      const firstSection = sections[0];
      if (ghost && firstSection) {
        try {
          const firstSectionTop = firstSection.getBoundingClientRect().top;
          ghost.style.opacity = firstSectionTop <= vh * 0.8 ? '0' : '1';
        } catch (e) {
          // Ignorar errores de getBoundingClientRect
        }
      }

      // 5) Manifiesto fijado - texto INTRO sticky
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
        // El texto se fija cuando llega al navbar (con pequeño offset para smooth transition)
        const pinTrigger = NAVBAR_HEIGHT + 4;
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

    // SIEMPRE usar requestAnimationFrame para máxima compatibilidad
    // En dispositivos táctiles, GSAP ticker puede no funcionar correctamente
    let rafId = null;
    let isRunning = true;

    const loop = () => {
      if (!isRunning) return;
      frame();
      rafId = requestAnimationFrame(loop);
    };

    // Iniciar loop de animación
    rafId = requestAnimationFrame(loop);

    // También escuchar eventos de scroll como fallback para dispositivos táctiles
    const onScroll = () => {
      // El frame() ya se ejecuta en el RAF loop, pero esto asegura
      // que se actualice inmediatamente en dispositivos táctiles
      if (isTouch) {
        frame();
      }
    };

    // En tablets/touch, también escuchar touchmove para actualizaciones más frecuentes
    const onTouchMove = () => {
      frame();
    };

    window.addEventListener('resize', measure);
    window.addEventListener('scroll', onScroll, { passive: true });
    if (isTouch) {
      window.addEventListener('touchmove', onTouchMove, { passive: true });
    }

    // Esperar a que las fuentes estén listas si es posible
    if (document.fonts?.ready) {
      document.fonts.ready.then(measure).catch(() => {});
    }

    // Inicializar estado inmediatamente - CRÍTICO para evitar flash de contenido incorrecto
    const initializeState = () => {
      const stackedLabels = labelsRef.current.filter(Boolean);
      const stickyLabels = stickyLabelsRef.current.filter(Boolean);

      // Estado inicial: todos los labels apilados visibles, sticky ocultos
      stackedLabels.forEach((label) => {
        if (label) {
          label.style.opacity = '1';
          label.style.visibility = 'visible';
          label.style.transform = 'translateY(0)';
        }
      });

      stickyLabels.forEach((label) => {
        if (label) {
          label.style.opacity = '0';
          label.style.visibility = 'hidden';
        }
      });

      // Ahora ejecutar frame para ajustar según posición de scroll actual
      measure();
      frame();
    };

    // Inicializar en múltiples momentos para asegurar que los refs estén listos
    initializeState();
    const t1 = setTimeout(initializeState, 50);
    const t2 = setTimeout(initializeState, 150);
    const t3 = setTimeout(initializeState, 300);
    const t4 = setTimeout(initializeState, 600);
    const t5 = setTimeout(initializeState, 1200);

    return () => {
      isRunning = false;
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', onScroll);
      if (isTouch) {
        window.removeEventListener('touchmove', onTouchMove);
      }
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
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
          className="fixed left-0 z-20 px-5 md:px-8"
          style={{
            top: `calc(37.5vh - 40px)`, // Posición inicial: centro del hero
          }}
        >
          <img src={LOGO} alt="ARTE FACTO" className="w-40 md:w-52" />
        </div>

        {/* Hero móvil */}
        <div className="relative h-[75vh] w-full">
          <img
            src={HERO}
            alt="Centro Cultural Estación Indianilla"
            className="h-full w-full object-cover"
          />
          {/* Indicador sutil de scroll */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-white/70 animate-bounce">
            <span className="text-[10px] tracking-widest uppercase font-light">desliza</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
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
                className="sticky z-10 bg-crema px-5 md:px-8 py-3 md:py-4 border-b border-rojo/50"
                style={{ top: `${NAVBAR_HEIGHT + MOBILE_STICKY_TOP}px` }}
              >
                <div className="flex justify-between max-w-3xl mx-auto">
                  <span className="text-rojo text-2xl md:text-3xl font-black italic tracking-tight">{s.words[0]}</span>
                  <span className="text-rojo text-2xl md:text-3xl font-black italic tracking-tight">{s.words[1]}</span>
                </div>
              </div>

              {/* Contenido de la sección */}
              <div className="px-5 md:px-8 py-8 pb-16 max-w-3xl mx-auto">
                {s.isIntro ? (
                  <>
                    {/* Contenido de CONOCE MÁS */}
                    <p className="text-base md:text-lg leading-relaxed text-tinta mb-8">
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
                    <div className="grid grid-cols-2 gap-4 md:gap-8 mb-8">
                      {s.etim.map((e) => (
                        <div key={e.word}>
                          <div className="text-rojo text-base md:text-xl font-black italic">{e.word}</div>
                          <p className="text-sm md:text-base text-tinta/70 mt-1 leading-snug">{e.def}</p>
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
                    <div className="space-y-5 md:space-y-6">
                      {s.blocks.map((b, i) => {
                        if (b.type === 'intro') {
                          return (
                            <p key={i} className="text-base md:text-lg leading-relaxed">
                              {INTRO}
                            </p>
                          );
                        }
                        if (b.type === 'etimExtra') {
                          return (
                            <div key={i} className="mb-10">
                              <div className="text-rojo text-xl md:text-2xl font-black italic">{b.word}</div>
                              <p className="text-sm md:text-base text-tinta/70 mt-2 max-w-[320px]">
                                <em>(lat.)</em>{b.def.replace('(lat.)', '')}
                              </p>
                            </div>
                          );
                        }
                        if (b.type === 'h2') {
                          return (
                            <h2 key={i} className="text-2xl md:text-3xl font-bold text-tinta leading-tight pt-4">
                              {b.text}
                            </h2>
                          );
                        }
                        if (b.type === 'h3') {
                          return (
                            <h3 key={i} className="text-lg md:text-xl font-black italic text-rojo pt-2">
                              {b.text}
                            </h3>
                          );
                        }
                        if (b.type === 'kicker') {
                          return (
                            <div key={i} className="text-base md:text-lg font-black italic text-rojo pt-6">
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
                          <p key={i} className="text-base md:text-lg leading-relaxed">
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
          <div className="px-5 md:px-8 py-12 border-t border-rojo">
            <div className="text-rojo text-xl md:text-2xl font-black italic text-center max-w-3xl mx-auto">
              {CIERRE}
            </div>
          </div>

          {/* Grid de fotos final */}
          <div className="px-5 md:px-8 pb-12 max-w-3xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
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
          {/* Indicador sutil de scroll */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/70 animate-bounce">
            <span className="text-xs tracking-widest uppercase font-light">desliza</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>

        {/* Secciones de subtemas - cada una tiene su sticky label integrado */}
        {SUBTEMAS.map((s, i) => (
          <SubtemaSection
            key={s.id}
            data={s}
            sectionRef={(el) => {
              if (el) sectionRefs.current[i] = el;
            }}
            labelRef={(el) => {
              if (el) stickyLabelsRef.current[i] = el;
            }}
            introRef={i === 0 ? introRef : undefined}
            minH={i === 2 ? 'min-h-[130vh]' : i === 3 ? '' : 'min-h-[110vh]'}
            navbarHeight={NAVBAR_HEIGHT}
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
