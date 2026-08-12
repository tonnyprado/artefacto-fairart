'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { COLORS } from './theme';

// Importar todos los componentes de tarjetas
import LogoCard from './conocemas/LogoCard';
import FeriaCard from './conocemas/FeriaCard';
import ProyectoCard from './conocemas/ProyectoCard';
import QuererHacerCard from './conocemas/QuererHacerCard';
import ImageCard from './conocemas/ImageCard';
import DescripcionArtefactoCard from './conocemas/DescripcionArtefactoCard';
import ExpoCard from './conocemas/ExpoCard';
import { FaseOneCard, FaseTwoCard, FaseThreeCard } from './conocemas/FasesCards';
import CircuitoCard from './conocemas/CircuitoCard';
import PaquetesCard from './conocemas/PaquetesCard';
import ConvocatoriaButtonCard from './conocemas/ConvocatoriaButtonCard';
import ArteQuestionCard from './conocemas/ArteQuestionCard';
import QuoteCard from './conocemas/QuoteCard';

gsap.registerPlugin(ScrollTrigger);

/**
 * Sección CONOCE MÁS con diseño bento/masonry grid
 * Responsive: desktop usa grid de múltiples columnas, mobile usa columna única
 */
export default function ConoceMasSection() {
  const sectionRef = useRef(null);
  const gridRef = useRef(null);

  useEffect(() => {
    if (!gridRef.current) return;

    // Animación de entrada para las tarjetas
    const cards = gridRef.current.querySelectorAll('.bento-card');

    gsap.set(cards, { opacity: 0, y: 30 });

    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top 80%',
      onEnter: () => {
        gsap.to(cards, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: 'power2.out',
        });
      },
      once: true,
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <>
      <style>{`
        .bento-grid {
          display: grid;
          gap: 16px;
          padding: 40px 20px;
          max-width: 1400px;
          margin: 0 auto;
          grid-template-columns: repeat(12, 1fr);
          grid-auto-rows: minmax(140px, auto);
        }

        /* Mobile: 1 columna */
        @media (max-width: 640px) {
          .bento-grid {
            grid-template-columns: 1fr;
            gap: 12px;
            padding: 24px 16px;
          }

          .bento-grid > * {
            grid-column: 1 !important;
            grid-row: auto !important;
          }
        }

        /* Tablet: 2-3 columnas */
        @media (min-width: 641px) and (max-width: 1024px) {
          .bento-grid {
            grid-template-columns: repeat(6, 1fr);
          }
        }

        /* Desktop layout específico para cada tarjeta */
        @media (min-width: 1025px) {
          .logo-card { grid-column: span 3; grid-row: span 2; }
          .feria-card { grid-column: span 2; grid-row: span 2; }
          .proyecto-card { grid-column: span 3; grid-row: span 2; }
          .querer-hacer-card { grid-column: span 2; grid-row: span 2; }
          .image-card-1 { grid-column: span 4; grid-row: span 3; }
          .descripcion-card { grid-column: span 3; grid-row: span 2; }
          .expo-card { grid-column: span 3; grid-row: span 2; }
          .fase-card { grid-column: span 2; grid-row: span 2; }
          .image-card-2 { grid-column: span 3; grid-row: span 2; }
          .circuito-card { grid-column: span 3; grid-row: span 2; }
          .paquetes-card { grid-column: span 2; grid-row: span 2; }
          .convocatoria-button-card { grid-column: span 3; grid-row: span 2; }
          .image-card-3 { grid-column: span 4; grid-row: span 3; }
          .arte-question-card { grid-column: span 4; grid-row: span 2; }
          .quote-card { grid-column: span 4; grid-row: span 2; }
        }

        /* Tablet layout */
        @media (min-width: 641px) and (max-width: 1024px) {
          .logo-card { grid-column: span 3; }
          .feria-card { grid-column: span 3; }
          .proyecto-card { grid-column: span 6; }
          .querer-hacer-card { grid-column: span 6; }
          .image-card-1 { grid-column: span 6; grid-row: span 2; }
          .descripcion-card { grid-column: span 6; }
          .expo-card { grid-column: span 6; }
          .fase-card { grid-column: span 2; }
          .image-card-2 { grid-column: span 6; grid-row: span 2; }
          .circuito-card { grid-column: span 3; }
          .paquetes-card { grid-column: span 3; }
          .convocatoria-button-card { grid-column: span 6; }
          .image-card-3 { grid-column: span 6; grid-row: span 2; }
          .arte-question-card { grid-column: span 6; }
          .quote-card { grid-column: span 6; }
        }
      `}</style>

      <section
        id="conoce-mas"
        ref={sectionRef}
        style={{
          background: COLORS.cream,
          minHeight: '100vh',
          padding: '60px 0',
        }}
      >
        <div ref={gridRef} className="bento-grid">
          {/* Fila 1 */}
          <LogoCard />
          <FeriaCard />
          <ProyectoCard />
          <QuererHacerCard />

          {/* Fila 2 */}
          <ImageCard
            src="/assets/estacion-indianilla-bg.png"
            alt="Estación Indianilla"
            gridColumn="span 4"
            gridRow="span 3"
          />
          <DescripcionArtefactoCard />
          <ExpoCard />

          {/* Fila 3 - Fases */}
          <FaseOneCard />
          <FaseTwoCard />
          <FaseThreeCard />

          {/* Fila 4 */}
          <ImageCard
            src="/assets/estacion-indianilla-bg.png"
            alt="Espacio interior"
            gridColumn="span 3"
            gridRow="span 2"
          />
          <CircuitoCard />

          {/* Fila 5 */}
          <PaquetesCard />
          <ConvocatoriaButtonCard />

          {/* Fila 6 */}
          <ImageCard
            src="/assets/estacion-indianilla-bg.png"
            alt="Obra de arte"
            gridColumn="span 4"
            gridRow="span 3"
          />

          {/* Fila 7 */}
          <ArteQuestionCard />

          {/* Fila 8 */}
          <QuoteCard />
        </div>
      </section>
    </>
  );
}
