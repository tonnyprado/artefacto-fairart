'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Footer from './Footer';
import { COLORS } from './theme';

gsap.registerPlugin(ScrollTrigger);

export default function FooterParallax() {
  const containerRef = useRef(null);
  const footerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const footer = footerRef.current;

    if (!container || !footer) return;

    // Footer parallax effect - el footer se revela desde abajo
    gsap.fromTo(
      footer,
      {
        y: 100,
      },
      {
        scrollTrigger: {
          trigger: container,
          start: 'top bottom',
          end: 'bottom bottom',
          scrub: true,
        },
        y: 0,
        ease: 'none',
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        minHeight: '40vh',
        display: 'flex',
        alignItems: 'flex-end',
        background: COLORS.red,
      }}
    >
      <div
        ref={footerRef}
        style={{
          width: '100%',
          willChange: 'transform',
        }}
      >
        <Footer />
      </div>
    </div>
  );
}
