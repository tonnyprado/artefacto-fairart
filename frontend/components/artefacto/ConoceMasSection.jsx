'use client';

import ConocerMas from './conocemas/ConocerMas';

/**
 * ConoceMasSection - Sección "CONOCE MÁS" de ARTE FACTO
 *
 * Layout de 3 columnas con scroll parallax:
 * - Izquierda (25vw): Logo fijo + subtemas sticky que se empujan
 * - Centro: Contenido con etimologías y manifiesto
 * - Derecha (39.5vw): Carril de fotos que se mueve 1.6× más rápido
 *
 * Características principales:
 * - Subtemas se fijan bajo el logo y se reemplazan por empuje
 * - Manifiesto se queda fijado junto al logo mientras el contenido fluye
 * - Pila de subtemas en esquina inferior izquierda como índice visual
 * - Compatible con Lenis smooth scroll
 *
 * @see conocemas/ConocerMas/index.jsx - Componente principal
 * @see conocemas/ConocerMas/content.js - Datos y contenido
 */
export default function ConoceMasSection() {
  return (
    <section id="conoce-mas">
      <ConocerMas />
    </section>
  );
}
