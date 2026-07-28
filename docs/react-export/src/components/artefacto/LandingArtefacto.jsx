'use client';
import { useEffect, useRef, useState } from 'react';
import HeroArtefacto from './HeroArtefacto';
import AboutSection from './AboutSection';
import ConvocatoriaSection from './ConvocatoriaSection';
import CalendarSection from './CalendarSection';
import ContactSection from './ContactSection';
import Footer from './Footer';
import Navbar from './Navbar';
import TransitionOverlay from './TransitionOverlay';
import { COLORS } from './theme';

/*
  Orquestador SPA: una sección visible a la vez, transición flip-clock entre secciones.
  - Click en cualquier <a href="#seccion"> (hero, navbar, footer, CTAs) navega con transición.
  - Scroll down: en el hero pasa a Acerca de; en las demás, al llegar al final pasa a la siguiente.
  - Lenis (smooth scroll) se inicializa si está instalado: `npm i lenis`.
*/
const ORDER = ['hero', 'about', 'convocatoria', 'calendario', 'contacto'];
const SCREEN_COLORS = { hero: COLORS.red, about: COLORS.cream, convocatoria: COLORS.red, calendario: COLORS.cream, contacto: COLORS.red };

export default function LandingArtefacto() {
  const [screen, setScreen] = useState('hero');
  const [overlay, setOverlay] = useState(null); // 'in' | 'out' | null
  const [fx, setFx] = useState(null);           // 'out' | 'in' | null
  const [ovColor, setOvColor] = useState(COLORS.red);
  const [menuOpen, setMenuOpen] = useState(false);
  const busy = useRef(false);
  const screenRef = useRef(screen);
  screenRef.current = screen;
  const lenis = useRef(null);

  const navigate = (target) => {
    if (busy.current || target === screenRef.current) return;
    busy.current = true;
    setMenuOpen(false);
    setOvColor(SCREEN_COLORS[screenRef.current]);
    setOverlay('in');
    setFx('out');
    setTimeout(() => {
      lenis.current?.scrollTo?.(0, { immediate: true });
      window.scrollTo(0, 0);
      setScreen(target);
      setOverlay('out');
      setFx('in');
      setOvColor(SCREEN_COLORS[target]);
      setTimeout(() => { setOverlay(null); setFx(null); busy.current = false; }, 1200);
    }, 950);
  };

  useEffect(() => {
    // Lenis smooth scroll (opcional)
    (async () => {
      try {
        const { default: Lenis } = await import('lenis');
        lenis.current = new Lenis({ autoRaf: true });
      } catch { /* lenis no instalado — scroll nativo */ }
    })();
    // Click delegado sobre anchors #seccion
    const onClick = (e) => {
      const a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a) return;
      e.preventDefault();
      const id = a.getAttribute('href').slice(1);
      if (ORDER.includes(id)) navigate(id);
    };
    // Scroll down → siguiente sección
    const onWheel = (e) => {
      if (busy.current || e.deltaY <= 30) return;
      const i = ORDER.indexOf(screenRef.current);
      if (i < 0 || i === ORDER.length - 1) return;
      const atBottom = screenRef.current === 'hero' ||
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 6;
      if (atBottom) navigate(ORDER[i + 1]);
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
      {screen === 'hero' && <HeroArtefacto />}
      {screen !== 'hero' && <Navbar screen={screen} onOpenMenu={() => setMenuOpen(true)} />}

      <div className={fxClass} style={show('about')}><AboutSection /></div>
      <div className={fxClass} style={show('convocatoria')}><ConvocatoriaSection /></div>
      <div className={fxClass} style={show('calendario')}><CalendarSection /></div>
      <div className={fxClass} style={show('contacto')}><ContactSection /></div>
      {screen !== 'hero' && <div className={fxClass}><Footer /></div>}

      {menuOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 80, background: COLORS.black, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '3.5vh', padding: 24 }}>
          <button onClick={() => setMenuOpen(false)} aria-label="Cerrar"
            style={{ position: 'absolute', top: 20, right: 24, background: 'none', border: 'none', cursor: 'pointer', color: COLORS.cream, fontSize: 32 }}>✕</button>
          <a href="#hero" style={{ display: 'block', marginBottom: '2vh' }}>
            <img src="/assets/wordmark-cream.svg" alt="ARTEFACTO" style={{ width: 'min(280px,70vw)', display: 'block' }} />
          </a>
          {[['Acerca de', '#about'], ['Convocatoria', '#convocatoria'], ['Calendario', '#calendario'], ['Contacto', '#contacto']].map(([label, href]) => (
            <a key={href} href={href} style={{ color: COLORS.cream, fontWeight: 700, fontStyle: 'italic', fontSize: '5vh', textTransform: 'uppercase', lineHeight: 1, textDecoration: 'none' }}>{label}</a>
          ))}
        </div>
      )}

      <TransitionOverlay phase={overlay} color={ovColor} />
    </main>
  );
}
