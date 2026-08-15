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
const SCREEN_NAMES = { hero: 'Inicio', about: 'Acerca de', calendario: 'Calendario', convocatoria: 'Convocatoria', contacto: 'Contacto' };
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
  // Estados para la transición wave preview
  const [wavePreview, setWavePreview] = useState({
    active: false,
    direction: 'down',
    targetSection: null,
    targetColor: null,
  });
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
      scrollCooldown: mobile ? 1000 : 800, // Más cooldown en móvil
      overscrollThreshold: mobile ? 200 : 150, // Menos sensible en móvil
      touchOverscrollThreshold: 150, // Threshold para touch
      overscrollDecayTime: mobile ? 500 : 300, // Más tiempo para resetear en móvil
      maxBuffer: mobile ? 300 : 225, // Límite máximo del buffer (threshold * 1.5)
      wavePreviewThreshold: mobile ? 60 : 50, // Threshold para mostrar preview de wave
    };
  };

  // Mostrar preview de wave cuando el buffer empieza a acumularse
  const showWavePreview = (direction, targetIndex) => {
    const targetId = ORDER[targetIndex];
    setWavePreview({
      active: true,
      direction,
      targetSection: SCREEN_NAMES[targetId],
      targetColor: SCREEN_COLORS[targetId],
    });
  };

  // Ocultar preview de wave
  const hideWavePreview = () => {
    setWavePreview(prev => ({ ...prev, active: false }));
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

      // Verificar si está ocupado, en cooldown, o es navegación por click
      const now = Date.now();
      if (busy.current || isClickNavigation.current || (now - lastScrollTime.current < config.scrollCooldown)) {
        return;
      }

      const i = ORDER.indexOf(screenRef.current);
      if (i < 0) return;

      // Threshold optimizado para mejor respuesta
      const scrollThreshold = 20;

      // Scroll down: siguiente sección
      if (e.deltaY > scrollThreshold) {
        if (i === ORDER.length - 1) return; // Ya está en la última sección

        const atBottom = screenRef.current === 'hero' ||
          window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 10;

        if (atBottom) {
          // Acumular scroll en el buffer CON LÍMITE MÁXIMO
          const prevBuffer = overscrollBuffer.current;
          overscrollBuffer.current = Math.min(
            overscrollBuffer.current + Math.abs(e.deltaY),
            config.maxBuffer
          );

          // Mostrar preview de wave cuando el buffer supere el threshold de preview
          if (prevBuffer < config.wavePreviewThreshold && overscrollBuffer.current >= config.wavePreviewThreshold) {
            showWavePreview('down', i + 1);
          }

          // Resetear el timer de decay
          if (overscrollDecay.current) {
            clearTimeout(overscrollDecay.current);
          }
          overscrollDecay.current = setTimeout(() => {
            overscrollBuffer.current = 0;
            hideWavePreview();
          }, config.overscrollDecayTime);

          // Solo navegar si el buffer supera el threshold
          if (overscrollBuffer.current >= config.overscrollThreshold) {
            overscrollBuffer.current = 0;
            lastScrollTime.current = now;
            hideWavePreview();
            navigate(ORDER[i + 1]);
          }
        } else {
          // No estamos en el límite, resetear buffer
          overscrollBuffer.current = 0;
          hideWavePreview();
        }
      }

      // Scroll up: sección anterior
      else if (e.deltaY < -scrollThreshold) {
        if (i === 0) return; // Ya está en la primera sección (hero)

        const atTop = window.scrollY <= 10; // Margen de 10px para detectar tope

        if (atTop) {
          // Acumular scroll en el buffer CON LÍMITE MÁXIMO
          const prevBuffer = overscrollBuffer.current;
          overscrollBuffer.current = Math.min(
            overscrollBuffer.current + Math.abs(e.deltaY),
            config.maxBuffer
          );

          // Mostrar preview de wave cuando el buffer supere el threshold de preview
          if (prevBuffer < config.wavePreviewThreshold && overscrollBuffer.current >= config.wavePreviewThreshold) {
            showWavePreview('up', i - 1);
          }

          // Resetear el timer de decay
          if (overscrollDecay.current) {
            clearTimeout(overscrollDecay.current);
          }
          overscrollDecay.current = setTimeout(() => {
            overscrollBuffer.current = 0;
            hideWavePreview();
          }, config.overscrollDecayTime);

          // Solo navegar si el buffer supera el threshold
          if (overscrollBuffer.current >= config.overscrollThreshold) {
            overscrollBuffer.current = 0;
            lastScrollTime.current = now;
            hideWavePreview();
            navigate(ORDER[i - 1]);
          }
        } else {
          // No estamos en el límite, resetear buffer
          overscrollBuffer.current = 0;
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

      // Ignorar si es navegación por click o está en cooldown
      if (busy.current || isClickNavigation.current || (now - lastScrollTime.current < config.scrollCooldown)) {
        return;
      }

      const deltaY = touchStartY.current - touchEndY.current;
      const touchDuration = now - touchStartTime;
      const i = ORDER.indexOf(screenRef.current);
      if (i < 0) return;

      // Solo procesar si fue un swipe real (no un tap)
      // Un tap típico dura menos de 200ms y tiene poco movimiento
      const isTap = touchDuration < 200 && Math.abs(deltaY) < 30;
      if (isTap) {
        return; // Es un tap, no un swipe - no procesar
      }

      const swipeThreshold = 80; // Aumentado para evitar swipes accidentales

      // Swipe up (scroll down): siguiente sección
      if (deltaY > swipeThreshold) {
        if (i === ORDER.length - 1) return; // Ya está en la última sección

        const atBottom = screenRef.current === 'hero' ||
          window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 10;

        if (atBottom) {
          // Acumular swipe en el buffer CON LÍMITE
          const prevBuffer = overscrollBuffer.current;
          overscrollBuffer.current = Math.min(
            overscrollBuffer.current + Math.abs(deltaY),
            config.maxBuffer
          );

          // Mostrar preview de wave cuando el buffer supere el threshold de preview
          if (prevBuffer < config.wavePreviewThreshold && overscrollBuffer.current >= config.wavePreviewThreshold) {
            showWavePreview('down', i + 1);
          }

          // Resetear el timer de decay
          if (overscrollDecay.current) {
            clearTimeout(overscrollDecay.current);
          }
          overscrollDecay.current = setTimeout(() => {
            overscrollBuffer.current = 0;
            hideWavePreview();
          }, config.overscrollDecayTime);

          // Solo navegar si el buffer supera el threshold
          if (overscrollBuffer.current >= config.touchOverscrollThreshold) {
            overscrollBuffer.current = 0;
            lastScrollTime.current = now;
            hideWavePreview();
            navigate(ORDER[i + 1]);
          }
        } else {
          overscrollBuffer.current = 0;
          hideWavePreview();
        }
      }

      // Swipe down (scroll up): sección anterior
      else if (deltaY < -swipeThreshold) {
        if (i === 0) return; // Ya está en la primera sección (hero)

        const atTop = window.scrollY <= 10;

        if (atTop) {
          // Acumular swipe en el buffer CON LÍMITE
          const prevBuffer = overscrollBuffer.current;
          overscrollBuffer.current = Math.min(
            overscrollBuffer.current + Math.abs(deltaY),
            config.maxBuffer
          );

          // Mostrar preview de wave cuando el buffer supere el threshold de preview
          if (prevBuffer < config.wavePreviewThreshold && overscrollBuffer.current >= config.wavePreviewThreshold) {
            showWavePreview('up', i - 1);
          }

          // Resetear el timer de decay
          if (overscrollDecay.current) {
            clearTimeout(overscrollDecay.current);
          }
          overscrollDecay.current = setTimeout(() => {
            overscrollBuffer.current = 0;
            hideWavePreview();
          }, config.overscrollDecayTime);

          // Solo navegar si el buffer supera el threshold
          if (overscrollBuffer.current >= config.touchOverscrollThreshold) {
            overscrollBuffer.current = 0;
            lastScrollTime.current = now;
            hideWavePreview();
            navigate(ORDER[i - 1]);
          }
        } else {
          overscrollBuffer.current = 0;
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

      {/* Preview de wave transition cuando el usuario está en el límite de una sección */}
      <SectionWaveTransition
        isActive={wavePreview.active}
        direction={wavePreview.direction}
        targetSection={wavePreview.targetSection}
        targetColor={wavePreview.targetColor}
      />

      <CustomCursor />
    </main>
  );
}
