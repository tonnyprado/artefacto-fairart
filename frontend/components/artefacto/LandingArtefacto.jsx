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
  const busy = useRef(false);
  const screenRef = useRef(screen);
  screenRef.current = screen;
  const lenis = useRef(null);
  const lastScrollTime = useRef(0);
  const scrollCooldown = 800; // Cooldown de 0.8s entre transiciones de scroll

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
          lenis.current?.scrollTo?.(0, { immediate: true });
          window.scrollTo(0, 0);
          setScreen(target);
          setHeroExiting(false);
          setTransitionPhase('in');
          setFx('in');

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
        lenis.current?.scrollTo?.(0, { immediate: true });
        window.scrollTo(0, 0);
        setScreen(target);
        setTransitionPhase('in');
        setFx('in');

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
    // Lenis smooth scroll con configuración optimizada
    (async () => {
      try {
        const { default: Lenis } = await import('lenis');
        lenis.current = new Lenis({
          autoRaf: true,
          duration: 1.2,           // Duración estándar más responsiva
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Easing suave
          lerp: 0.15,              // Interpolación más rápida para mejor respuesta
          wheelMultiplier: 1.0,    // Velocidad normal del scroll (más responsivo)
          touchMultiplier: 1.5,    // Ajuste para touch
          smoothWheel: true,       // Suavizar scroll de rueda
          syncTouch: false,
          syncTouchLerp: 0.1,
        });
      } catch { /* lenis no instalado — scroll nativo */ }
    })();
    // Click delegado sobre anchors #seccion (no afectado por cooldown)
    const onClick = (e) => {
      const a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a) return;
      e.preventDefault();
      const id = a.getAttribute('href').slice(1);
      if (ORDER.includes(id)) {
        lastScrollTime.current = Date.now(); // Actualizar para prevenir scroll inmediato después
        navigate(id);
      }
    };
    // Scroll down → siguiente sección | Scroll up → sección anterior
    const onWheel = (e) => {
      // Verificar si está ocupado o en cooldown
      const now = Date.now();
      if (busy.current || (now - lastScrollTime.current < scrollCooldown)) {
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
          lastScrollTime.current = now; // Actualizar tiempo del último scroll
          navigate(ORDER[i + 1]);
        }
      }

      // Scroll up: sección anterior
      else if (e.deltaY < -scrollThreshold) {
        if (i === 0) return; // Ya está en la primera sección (hero)

        const atTop = window.scrollY <= 10; // Margen de 10px para detectar tope

        if (atTop) {
          lastScrollTime.current = now; // Actualizar tiempo del último scroll
          navigate(ORDER[i - 1]);
        }
      }
    };
    document.addEventListener('click', onClick);
    window.addEventListener('wheel', onWheel, { passive: true });
    return () => {
      document.removeEventListener('click', onClick);
      window.removeEventListener('wheel', onWheel);
      lenis.current?.destroy?.();
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

      <CustomCursor />
    </main>
  );
}
