'use client';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import HeroArtefacto from './HeroArtefacto';
import AboutSection from './AboutSection';
import ConvocatoriaSection from './ConvocatoriaSection';
import CalendarSection from './CalendarSection';
import ContactSection from './ContactSection';
import FooterParallax from './FooterParallax';
import Navbar from './Navbar';
import ScrollTransition from './ScrollTransition';
import CurvedWipeTransition from './CurvedWipeTransition';
import SectionWaveTransition from './SectionWaveTransition';
import LogoRevealLoader from './LogoRevealLoader';
import MobileMenu from './MobileMenu';
import CustomCursor from './CustomCursor';
import { COLORS } from './theme';
import { getTransitionType, getTransitionTimings, TRANSITION_TYPES } from './transitions';

/*
  Orquestador SPA: una sección visible a la vez, transición flip-clock entre secciones.
  - Click en cualquier <a href="#seccion"> (hero, navbar, footer, CTAs) navega con transición.
  - Scroll down: en el hero pasa a Acerca de; en las demás, al llegar al final pasa a la siguiente.
  - Lenis (smooth scroll) se inicializa si está instalado: `npm i lenis`.
*/
const ORDER = ['hero', 'about', 'calendario', 'convocatoria', 'contacto'];
const SCREEN_NAMES = { hero: 'Inicio', about: 'Conoce más', calendario: 'Calendario', convocatoria: 'Convocatoria', contacto: 'Contacto' };
const SCREEN_COLORS = { hero: COLORS.red, about: COLORS.cream, calendario: COLORS.cream, convocatoria: COLORS.red, contacto: COLORS.cream };

export default function LandingArtefacto() {
  const [screen, setScreen] = useState('hero');
  const [transitionPhase, setTransitionPhase] = useState(null); // 'in' | 'out' | null - fase de transición actual
  const [transitionType, setTransitionType] = useState(null); // 'flip-clock' | 'scroll' | 'curved-wipe' | null
  const [fx, setFx] = useState(null);           // 'out' | 'in' | null
  const [ovColor, setOvColor] = useState(COLORS.red);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loaderComplete, setLoaderComplete] = useState(false);
  const [heroExiting, setHeroExiting] = useState(false);
  const [skipLoader, setSkipLoader] = useState(false);
  // Estados para la transición wave
  // phase: null | 'preview' | 'fullscreen'
  const [waveState, setWaveState] = useState({
    phase: null,
    direction: 'down',
    targetSection: null,
    targetColor: null,
    targetIndex: null,
  });
  const waveBlocking = useRef(false); // Bloquear scroll durante fullscreen
  const wavePhaseRef = useRef(null); // Ref para acceder a la fase desde los handlers
  const waveTargetIndexRef = useRef(null); // Ref para el índice destino

  const busy = useRef(false);
  const screenRef = useRef(screen);
  screenRef.current = screen;
  const lenis = useRef(null);
  const lastScrollTime = useRef(0);
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);
  const isMobile = useRef(false);
  const isClickNavigation = useRef(false); // Flag para distinguir clicks de scroll

  // Sistema de buffer de overscroll para espera en límites
  const overscrollBuffer = useRef(0);
  const overscrollDecay = useRef(null); // Timer para resetear el buffer

  // Configuración adaptativa móvil/desktop
  const getScrollConfig = () => {
    const mobile = isMobile.current;
    return {
      scrollCooldown: mobile ? 1000 : 800,
      previewDecayTime: mobile ? 800 : 600, // Tiempo para que desaparezca el preview si no hay más scroll
    };
  };

  // Mostrar preview de wave (primera fase)
  const showWavePreview = (direction, targetIndex) => {
    if (wavePhaseRef.current !== null) return; // Ya hay un wave activo

    const targetId = ORDER[targetIndex];
    wavePhaseRef.current = 'preview';
    waveTargetIndexRef.current = targetIndex;
    setWaveState({
      phase: 'preview',
      direction,
      targetSection: SCREEN_NAMES[targetId],
      targetColor: SCREEN_COLORS[targetId],
      targetIndex,
    });
  };

  // Expandir wave a fullscreen (segunda fase) - bloquea scroll
  const expandWaveToFullscreen = () => {
    if (wavePhaseRef.current !== 'preview') return;

    waveBlocking.current = true;
    wavePhaseRef.current = 'fullscreen';
    setWaveState(prev => ({ ...prev, phase: 'fullscreen' }));
  };

  // Callback cuando el fullscreen termina de animarse
  const handleFullscreenComplete = () => {
    // Esperar 1.5 segundos mostrando el fullscreen
    setTimeout(() => {
      // Navegar a la siguiente sección SIN transición
      const targetId = ORDER[waveState.targetIndex];
      const isNavigatingUp = waveState.targetIndex < ORDER.indexOf(screenRef.current);

      // Actualizar URL
      if (targetId === 'hero') {
        window.history.pushState(null, '', '/');
      } else {
        window.history.pushState(null, '', `#${targetId}`);
      }

      // Cambiar sección
      setScreen(targetId);

      // Posicionar scroll
      requestAnimationFrame(() => {
        if (isNavigatingUp) {
          const scrollHeight = document.documentElement.scrollHeight;
          const windowHeight = window.innerHeight;
          const scrollTo = Math.max(0, scrollHeight - windowHeight);
          lenis.current?.scrollTo?.(scrollTo, { immediate: true });
          window.scrollTo(0, scrollTo);
        } else {
          lenis.current?.scrollTo?.(0, { immediate: true });
          window.scrollTo(0, 0);
        }
      });

      // Ocultar wave y desbloquear
      wavePhaseRef.current = null;
      waveTargetIndexRef.current = null;
      setWaveState({
        phase: null,
        direction: 'down',
        targetSection: null,
        targetColor: null,
        targetIndex: null,
      });
      waveBlocking.current = false;
      lastScrollTime.current = Date.now();
    }, 1500);
  };

  // Ocultar preview de wave
  const hideWavePreview = () => {
    if (wavePhaseRef.current === 'preview') {
      wavePhaseRef.current = null;
      waveTargetIndexRef.current = null;
      setWaveState({
        phase: null,
        direction: 'down',
        targetSection: null,
        targetColor: null,
        targetIndex: null,
      });
    }
  };

  // Detectar hash en el cliente después de la hidratación
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash && ORDER.includes(hash) && hash !== 'hero') {
      setSkipLoader(true);
      setLoaderComplete(true);
      setScreen(hash);
    }
  }, []);

  const handleLoaderComplete = () => {
    setLoaderComplete(true);
  };

  const navigate = (target) => {
    if (busy.current || target === screenRef.current) return;
    busy.current = true;
    setMenuOpen(false);

    // Actualizar URL hash
    if (target === 'hero') {
      window.history.pushState(null, '', '/');
    } else {
      window.history.pushState(null, '', `#${target}`);
    }

    const fromColor = SCREEN_COLORS[screenRef.current];
    const toColor = SCREEN_COLORS[target];
    const fromHero = screenRef.current === 'hero';

    // Detectar dirección de navegación
    const currentIndex = ORDER.indexOf(screenRef.current);
    const targetIndex = ORDER.indexOf(target);
    const isNavigatingUp = targetIndex < currentIndex;

    // Determinar tipo de transición y obtener timings
    const transType = getTransitionType(screenRef.current, target);
    const timings = getTransitionTimings(transType);

    setTransitionType(transType);
    setOvColor(toColor);

    if (fromHero) {
      // Saliendo del Hero: animar letras hacia afuera primero (800ms)
      const heroExitTime = 800;
      setHeroExiting(true);
      setFx('out');

      setTimeout(() => {
        // Luego iniciar la transición normal
        setTransitionPhase('out');

        setTimeout(() => {
          setScreen(target);
          setHeroExiting(false);
          setTransitionPhase('in');
          setFx('in');

          // Siempre al inicio cuando sales del hero
          setTimeout(() => {
            lenis.current?.scrollTo?.(0, { immediate: true });
            window.scrollTo(0, 0);
          }, 0);

          setTimeout(() => {
            setTransitionPhase(null);
            setTransitionType(null);
            setFx(null);
            busy.current = false;
          }, timings.in);
        }, timings.out);
      }, heroExitTime);

    } else {
      // Para todas las demás transiciones (toHero y X → X)
      setTransitionPhase('out');
      setFx('out');

      setTimeout(() => {
        setScreen(target);
        setTransitionPhase('in');
        setFx('in');

        // Posicionar scroll según la dirección
        // Usar requestAnimationFrame para esperar a que el DOM se actualice
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (isNavigatingUp) {
              // Navegando hacia arriba: scroll al final de la página
              const scrollHeight = document.documentElement.scrollHeight;
              const windowHeight = window.innerHeight;
              const scrollTo = Math.max(0, scrollHeight - windowHeight);
              lenis.current?.scrollTo?.(scrollTo, { immediate: true });
              window.scrollTo(0, scrollTo);
            } else {
              // Navegando hacia abajo: scroll al inicio
              lenis.current?.scrollTo?.(0, { immediate: true });
              window.scrollTo(0, 0);
            }
          });
        });

        setTimeout(() => {
          setTransitionPhase(null);
          setTransitionType(null);
          setFx(null);
          busy.current = false;
        }, timings.in);
      }, timings.out);
    }
  };

  useEffect(() => {
    // Detectar si es dispositivo móvil
    const checkMobile = () => {
      isMobile.current = window.innerWidth <= 1024 || 'ontouchstart' in window;
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Lenis smooth scroll con configuración adaptativa
    (async () => {
      try {
        const { default: Lenis } = await import('lenis');
        const mobile = isMobile.current;

        lenis.current = new Lenis({
          autoRaf: true,
          duration: mobile ? 1.8 : 2.0,           // Ligeramente más rápido en móvil
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Easing suave
          lerp: mobile ? 0.1 : 0.08,              // Más rápido en móvil para menos lag
          wheelMultiplier: 0.7,                   // Velocidad reducida del scroll
          touchMultiplier: mobile ? 0.6 : 1.0,    // REDUCIDO para móvil - menos sensibilidad
          smoothWheel: true,                      // Suavizar scroll de rueda
          syncTouch: mobile,                      // ACTIVAR suavizado táctil en móvil
          syncTouchLerp: mobile ? 0.06 : 0.08,    // Más lento para sensación pesada en móvil
        });
      } catch { /* lenis no instalado — scroll nativo */ }
    })();
    // Click delegado sobre anchors #seccion (no afectado por cooldown)
    const onClick = (e) => {
      const a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a) return;
      e.preventDefault();
      e.stopPropagation(); // Prevenir propagación para evitar scroll accidental
      const id = a.getAttribute('href').slice(1);
      if (ORDER.includes(id)) {
        // Marcar como navegación por click y resetear buffer completamente
        isClickNavigation.current = true;
        overscrollBuffer.current = 0;
        if (overscrollDecay.current) {
          clearTimeout(overscrollDecay.current);
          overscrollDecay.current = null;
        }
        lastScrollTime.current = Date.now(); // Actualizar para prevenir scroll inmediato después
        navigate(id);
        // Resetear flag después de un tiempo
        setTimeout(() => {
          isClickNavigation.current = false;
        }, 500);
      }
    };
    // Scroll down → siguiente sección | Scroll up → sección anterior
    const onWheel = (e) => {
      const config = getScrollConfig();
      const now = Date.now();

      // Si el wave está bloqueando (fullscreen), ignorar todo scroll
      if (waveBlocking.current) return;

      // Verificar si está ocupado, en cooldown, o es navegación por click
      if (busy.current || isClickNavigation.current || (now - lastScrollTime.current < config.scrollCooldown)) {
        return;
      }

      const i = ORDER.indexOf(screenRef.current);
      if (i < 0) return;

      const scrollThreshold = 20;

      // Scroll down: siguiente sección
      if (e.deltaY > scrollThreshold) {
        if (i === ORDER.length - 1) return; // Ya está en la última sección

        const atBottom = screenRef.current === 'hero' ||
          window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 10;

        if (atBottom) {
          // Hero tiene su propia animación - usar transición normal
          if (screenRef.current === 'hero') {
            lastScrollTime.current = now;
            navigate(ORDER[i + 1]);
            return;
          }

          // Cancelar timer de decay anterior
          if (overscrollDecay.current) {
            clearTimeout(overscrollDecay.current);
          }

          // Lógica de dos fases para wave
          if (wavePhaseRef.current === null) {
            // Primera vez en el límite → mostrar preview
            showWavePreview('down', i + 1);
            // Timer para ocultar si no hay más scroll
            overscrollDecay.current = setTimeout(hideWavePreview, config.previewDecayTime);
          } else if (wavePhaseRef.current === 'preview') {
            // Ya hay preview → expandir a fullscreen
            expandWaveToFullscreen();
          }
        } else {
          // No estamos en el límite, ocultar preview
          hideWavePreview();
        }
      }

      // Scroll up: sección anterior
      else if (e.deltaY < -scrollThreshold) {
        if (i === 0) return; // Ya está en la primera sección (hero)

        const atTop = window.scrollY <= 10; // Margen de 10px para detectar tope

        if (atTop) {
          const targetIndex = i - 1;

          // Si vamos hacia el Hero, usar transición normal
          if (ORDER[targetIndex] === 'hero') {
            lastScrollTime.current = now;
            navigate(ORDER[targetIndex]);
            return;
          }

          // Cancelar timer de decay anterior
          if (overscrollDecay.current) {
            clearTimeout(overscrollDecay.current);
          }

          // Lógica de dos fases para wave
          if (wavePhaseRef.current === null) {
            // Primera vez en el límite → mostrar preview
            showWavePreview('up', targetIndex);
            // Timer para ocultar si no hay más scroll
            overscrollDecay.current = setTimeout(hideWavePreview, config.previewDecayTime);
          } else if (wavePhaseRef.current === 'preview') {
            // Ya hay preview → expandir a fullscreen
            expandWaveToFullscreen();
          }
        } else {
          // No estamos en el límite, ocultar preview
          hideWavePreview();
        }
      }
    };
    // Touch events para móvil - con mejor prevención de scroll accidental
    let touchStartTime = 0;

    const onTouchStart = (e) => {
      touchStartY.current = e.touches[0].clientY;
      touchStartTime = Date.now();
    };

    const onTouchMove = (e) => {
      touchEndY.current = e.touches[0].clientY;
    };

    const onTouchEnd = () => {
      const config = getScrollConfig();
      const now = Date.now();

      // Si el wave está bloqueando, ignorar
      if (waveBlocking.current) return;

      // Ignorar si es navegación por click o está en cooldown
      if (busy.current || isClickNavigation.current || (now - lastScrollTime.current < config.scrollCooldown)) {
        return;
      }

      const deltaY = touchStartY.current - touchEndY.current;
      const touchDuration = now - touchStartTime;
      const i = ORDER.indexOf(screenRef.current);
      if (i < 0) return;

      // Solo procesar si fue un swipe real (no un tap)
      const isTap = touchDuration < 200 && Math.abs(deltaY) < 30;
      if (isTap) {
        return;
      }

      const swipeThreshold = 80;

      // Swipe up (scroll down): siguiente sección
      if (deltaY > swipeThreshold) {
        if (i === ORDER.length - 1) return;

        const atBottom = screenRef.current === 'hero' ||
          window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 10;

        if (atBottom) {
          // Hero usa transición normal
          if (screenRef.current === 'hero') {
            lastScrollTime.current = now;
            navigate(ORDER[i + 1]);
            return;
          }

          // Cancelar timer de decay anterior
          if (overscrollDecay.current) {
            clearTimeout(overscrollDecay.current);
          }

          // Lógica de dos fases para wave
          if (wavePhaseRef.current === null) {
            showWavePreview('down', i + 1);
            overscrollDecay.current = setTimeout(hideWavePreview, config.previewDecayTime);
          } else if (wavePhaseRef.current === 'preview') {
            expandWaveToFullscreen();
          }
        } else {
          hideWavePreview();
        }
      }

      // Swipe down (scroll up): sección anterior
      else if (deltaY < -swipeThreshold) {
        if (i === 0) return;

        const atTop = window.scrollY <= 10;

        if (atTop) {
          const targetIndex = i - 1;

          // Si vamos hacia el Hero, usar transición normal
          if (ORDER[targetIndex] === 'hero') {
            lastScrollTime.current = now;
            navigate(ORDER[targetIndex]);
            return;
          }

          // Cancelar timer de decay anterior
          if (overscrollDecay.current) {
            clearTimeout(overscrollDecay.current);
          }

          // Lógica de dos fases para wave
          if (wavePhaseRef.current === null) {
            showWavePreview('up', targetIndex);
            overscrollDecay.current = setTimeout(hideWavePreview, config.previewDecayTime);
          } else if (wavePhaseRef.current === 'preview') {
            expandWaveToFullscreen();
          }
        } else {
          hideWavePreview();
        }
      }
    };

    document.addEventListener('click', onClick);
    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      document.removeEventListener('click', onClick);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('resize', checkMobile);
      lenis.current?.destroy?.();
      if (overscrollDecay.current) {
        clearTimeout(overscrollDecay.current);
      }
    };
  }, []);

  const fxClass = fx === 'out' ? 'fx-out' : fx === 'in' ? 'fx-in' : '';
  const show = (name) => ({ display: screen === name ? undefined : 'none' });

  return (
    <main>
      {!skipLoader && <LogoRevealLoader onComplete={handleLoaderComplete} />}
      {screen === 'hero' && <HeroArtefacto startAnimation={loaderComplete} exitAnimation={heroExiting} onOpenMenu={() => setMenuOpen(true)} />}
      {screen !== 'hero' && <Navbar screen={screen} onOpenMenu={() => setMenuOpen(true)} />}

      <div className={fxClass} style={show('about')}><AboutSection /></div>
      <div className={fxClass} style={show('calendario')}><CalendarSection isActive={screen === 'calendario'} /></div>
      <div className={fxClass} style={show('convocatoria')}>
        <ConvocatoriaSection />
      </div>
      <div className={fxClass} style={show('contacto')}>
        <ContactSection />
        <FooterParallax />
      </div>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Renderizar el componente de transición apropiado según el tipo */}
      {transitionType === TRANSITION_TYPES.SCROLL && (
        <ScrollTransition phase={transitionPhase} color={ovColor} />
      )}
      {transitionType === TRANSITION_TYPES.CURVED_WIPE && (
        <CurvedWipeTransition phase={transitionPhase} color={ovColor} />
      )}
      {transitionType === TRANSITION_TYPES.FLIP_CLOCK && (
        <ScrollTransition phase={transitionPhase} color={ovColor} />
      )}

      {/* Wave transition cuando el usuario está en el límite de una sección */}
      <SectionWaveTransition
        phase={waveState.phase}
        direction={waveState.direction}
        targetSection={waveState.targetSection}
        targetColor={waveState.targetColor}
        onFullscreenComplete={handleFullscreenComplete}
      />

      <CustomCursor />
    </main>
  );
}
