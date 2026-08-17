# ARTE FACTO — Sección "Conocer más"
## Guía de implementación (React + Tailwind + GSAP + Lenis)

Réplica exacta del prototipo aprobado: 3 columnas (subtemas / contenido / fotos),
carril de fotos más rápido que el scroll, subtemas que arrancan en la esquina
inferior izquierda, se fijan bajo el logo y se reemplazan por empuje, y el
manifiesto que se queda fijado junto al logo mientras el resto del contenido
desaparece por detrás.

---

## 1. Archivos del paquete

```
src/
  components/ConocerMas/
    index.jsx          ← componente principal + toda la lógica de scroll (gsap.ticker)
    SubtemaSection.jsx ← una sección: subtema sticky + etimología + bloques
    PhotoRail.jsx      ← columna derecha de fotos (fija, track acelerado)
    LogoMask.jsx       ← bloque crema con el logo + "CONOCE MÁS"
    QueueIndex.jsx     ← pila de subtemas de la esquina inferior izquierda
    PinnedIntro.jsx    ← copia fija del manifiesto
    classes.js         ← clases Tailwind compartidas (tipografía + geometría)
  data/
    content.js         ← TODOS los textos, orden de fotos y rutas de assets
  styles/
    artefacto.css      ← import de Inter Tight + base (fondo, selección, links)
public/assets/conocer-mas/
  logo-red.png, photo-2.png … photo-9.png
tailwind.config.example.js ← colores (crema/tinta/rojo) y fuente para fusionar
```

## 2. Instalación

```bash
npm i gsap lenis
```

1. Copia `src/` y `public/assets/conocer-mas/` a tu proyecto.
2. Fusiona `tailwind.config.example.js` en tu `tailwind.config.js`
   (colores `crema`, `tinta`, `rojo` y fuente `inter-tight`).
3. Importa `src/styles/artefacto.css` en tu entry (o añade el `@import`
   de Inter Tight a tu CSS global).

## 3. Uso con Lenis

La lógica lee `window.scrollY` en un `gsap.ticker`, así que funciona con
Lenis sin adaptadores (Lenis anima el scroll nativo). Setup típico:

```jsx
import Lenis from 'lenis';
import gsap from 'gsap';
import ConocerMas from './components/ConocerMas';

function App() {
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.12 });
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    return () => { lenis.destroy(); };
  }, []);
  return <ConocerMas />;
}
```

Si además usas ScrollTrigger en otras partes: `lenis.on('scroll', ScrollTrigger.update)`.

## 4. Cómo funciona (para ajustar sin romper)

- **Carril de fotos** — `PhotoRail` es `fixed` (39.5vw, borde derecho). Su track
  se traslada `-scrollY * PHOTO_SPEED` (constante en `index.jsx`, default 1.6),
  con tope al final del track. Las fotos van pegadas (gap 0) y el track arranca
  con `pt-[88vh]` para que entren después del hero. Para más recorrido, añade
  fotos al array `PHOTOS` de `content.js`.
- **Subtemas (columna izquierda)** — cada label es `position: sticky` con
  `top = alto del bloque del logo + 6px`. Entra por el borde inferior junto con
  su contenido (misma fila de grid), se fija bajo el logo y ahí se queda: la
  celda que lo contiene se extiende `+25vh + 250px` más allá de su sección para
  que NO se suelte antes de tiempo. El reemplazo lo hace el frame-loop: cuando
  el subtema entrante toca al saliente, lo empuja con `translateY` hasta
  esconderlo tras el bloque crema del logo (`LogoMask`, z-10 > main z-2).
- **CONOCE MÁS** — vive dentro de `LogoMask` en la posición exacta de fijado;
  se oculta cuando cualquier subtema está fijado y reaparece al volver arriba.
- **Manifiesto fijado** — el primer párrafo de ARTIS FACTUM existe dos veces:
  en flujo (`introRef`) y como copia `fixed` (`PinnedIntro`). Cuando el de flujo
  alcanza lo alto de la pantalla, se oculta y se muestra la copia fija (misma
  x/anchura, fondo crema, z-9): el contenido posterior desaparece por detrás.
- **Pila inferior** — `QueueIndex` (fixed, esquina inferior izquierda) muestra
  los 4 subtemas al entrar; cada fila se desvanece en cuanto su subtema real
  cruza el borde inferior del viewport (el arranque se ve continuo).

## 5. Geometría compartida (¡mantener sincronizada!)

El alto del bloque del logo y la posición de fijado se definen con el MISMO
calc en `classes.js` (`maskH`, `pinTop`, `labelW`, `labelPad`):

```
alto bloque  = min(44px, 2.3vw) + min(130px, 9.8vw) + 2px
top de fijado = … + 6px   (4px por debajo del borde del bloque)
```

Si cambias el tamaño del logo (`w-[min(232px,17.5vw)]`), ajusta `min(130px,9.8vw)`
a la nueva altura del logo (alto = ancho × 0.552).

## 6. Checklist de QA

- [ ] Al entrar: hero del venue + logo rojo + CONOCE MÁS + pila de 4 subtemas abajo-izquierda.
- [ ] Las fotos fluyen ~1.6× más rápido que el texto y nunca dejan hueco al final.
- [ ] Cada subtema se engancha bajo el logo y solo sube cuando el siguiente lo alcanza.
- [ ] El saliente desaparece POR DETRÁS del bloque crema (nunca sobre el logo).
- [ ] El manifiesto queda fijo junto al logo desde ARTIS FACTUM hasta el final.
- [ ] `prefers-reduced-motion`: considera desactivar Lenis y dejar scroll nativo.
- [ ] Mobile: el layout es desktop-first; define el breakpoint donde colapsa a 1 columna (pendiente de diseño).

## 7. Notas

- Fotos actuales = placeholders extraídos del boceto; sustitúyelas en
  `public/assets/conocer-mas/` manteniendo los nombres o edita `content.js`.
- Tipografía: Inter Tight — subtemas y numerales en **Black Italic (900)**,
  encabezados grandes en SemiBold Italic, cuerpo Regular.
- Colores: crema `#F4EDE4` · tinta `#2D1515` · rojo `#B93232`.
