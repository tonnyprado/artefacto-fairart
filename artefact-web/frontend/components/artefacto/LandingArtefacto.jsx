'use client';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import HeroArtefacto from './HeroArtefacto';
import AboutSection from './AboutSection';
import ConvocatoriaSection from './ConvocatoriaSection';
import CalendarSection from './CalendarSection';
import ContactSection from './ContactSection';
import Footer from './Footer';
import Navbar from './Navbar';
import ScrollTransition from './ScrollTransition';
import LogoRevealLoader from './LogoRevealLoader';
import MobileMenu from './MobileMenu';
import { COLORS } from './theme';

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
  const [scrollTransition, setScrollTransition] = useState(null); // 'in' | 'out' | null (scroll)
  const [fx, setFx] = useState(null);           // 'out' | 'in' | null
  const [ovColor, setOvColor] = useState(COLORS.red);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loaderComplete, setLoaderComplete] = useState(false);
  const [heroExiting, setHeroExiting] = useState(false);
  const busy = useRef(false);
  const screenRef = useRef(screen);
  screenRef.current = screen;
  const lenis = useRef(null);
  const lastScrollTime = useRef(0);
  const scrollCooldown = 1800; // Cooldown de 1.8s entre transiciones de scroll

  const handleLoaderComplete = () => {
    setLoaderComplete(true);
  };

  const navigate = (target) => {
    if (busy.current || target === screenRef.current) return;
    busy.current = true;
    setMenuOpen(false);

    const fromColor = SCREEN_COLORS[screenRef.current];
    const toColor = SCREEN_COLORS[target];
    const fromHero = screenRef.current === 'hero';
    const toHero = target === 'hero';

    // Tiempos de transición
    const heroExitTime = 800; // Tiempo para que las letras del Hero desaparezcan
    const scrollOutTime = 550; // Preview de siguiente sección
    const scrollInTime = 700;  // Subida completa

    if (fromHero) {
      // Saliendo del Hero: animar letras hacia afuera, luego scroll transition
      setHeroExiting(true);
      setFx('out');

      setTimeout(() => {
        setOvColor(toColor);
        setScrollTransition('out');

        setTimeout(() => {
          lenis.current?.scrollTo?.(0, { immediate: true });
          window.scrollTo(0, 0);
          setScreen(target);
          setHeroExiting(false);
          setScrollTransition('in');
          setFx('in');

          setTimeout(() => {
            setScrollTransition(null);
            setFx(null);
            busy.current = false;
          }, scrollInTime);
        }, scrollOutTime);
      }, heroExitTime);

    } else if (toHero) {
      // Yendo al Hero: scroll transition, luego Hero hace flipIn automáticamente
      setOvColor(toColor);
      setScrollTransition('out');
      setFx('out');

      setTimeout(() => {
        lenis.current?.scrollTo?.(0, { immediate: true });
        window.scrollTo(0, 0);
        setScreen(target);
        setScrollTransition('in');
        setFx('in');

        setTimeout(() => {
          setScrollTransition(null);
          setFx(null);
          busy.current = false;
        }, scrollInTime);
      }, scrollOutTime);

    } else {
      // Entre otras secciones: solo scroll transition
      setOvColor(toColor);
      setScrollTransition('out');
      setFx('out');

      setTimeout(() => {
        lenis.current?.scrollTo?.(0, { immediate: true });
        window.scrollTo(0, 0);
        setScreen(target);
        setScrollTransition('in');
        setFx('in');

        setTimeout(() => {
          setScrollTransition(null);
          setFx(null);
          busy.current = false;
        }, scrollInTime);
      }, scrollOutTime);
    }
  };

  useEffect(() => {
    // Lenis smooth scroll (opcional)
    (async () => {
      try {
        const { default: Lenis } = await import('lenis');
        lenis.current = new Lenis({ autoRaf: true });
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

      // Threshold más alto para evitar activación accidental
      const scrollThreshold = 50;

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
      <LogoRevealLoader onComplete={handleLoaderComplete} />
      {screen === 'hero' && <HeroArtefacto startAnimation={loaderComplete} exitAnimation={heroExiting} />}
      {screen !== 'hero' && <Navbar screen={screen} onOpenMenu={() => setMenuOpen(true)} />}

      <div className={fxClass} style={show('about')}><AboutSection /></div>
      <div className={fxClass} style={show('calendario')}><CalendarSection /></div>
      <div className={fxClass} style={show('convocatoria')}>
        <ConvocatoriaSection />
      </div>
      <div className={fxClass} style={show('contacto')}>
        <ContactSection />
        <Footer />
      </div>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <ScrollTransition phase={scrollTransition} color={ovColor} />
    </main>
  );
}
