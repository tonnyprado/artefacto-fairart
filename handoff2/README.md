# ARTE FACTO — Sección "Conocer más" (v2)
## Guía de implementación · React + Tailwind + GSAP/Lenis

Esta versión reemplaza TODO lo anterior. Si ya tienes una implementación con
desalineaciones o problemas responsive: **borra la vieja y monta esta** — la
causa de esas desalineaciones era calcular posiciones con CSS por pantalla;
aquí toda la geometría se deriva del rect real del logo en runtime.

---

## 1. Archivos

```
src/
  components/ConocerMas/
    index.jsx              ← markup completo (rail, labels, mask, pin, secciones)
    useConocerMasScroll.js ← TODA la mecánica de scroll y geometría (hook)
    SubtemaSection.jsx     ← sección de contenido (la celda izquierda va vacía)
    classes.js             ← clases Tailwind compartidas (solo estilos estáticos)
  data/
    content.js             ← textos, orden de fotos, rutas
  styles/
    artefacto.css          ← Inter Tight + base
public/assets/conocer-mas/ ← logo-red.png (nuevo, del LOGO real) + photo-*.png
tailwind.config.example.js ← colores crema/tinta/rojo + fuente
```

## 2. Instalación

```bash
npm i lenis        # gsap opcional; el hook usa rAF nativo
```

1. Copia `src/` y `public/assets/conocer-mas/` (sobrescribe el logo viejo).
2. Fusiona `tailwind.config.example.js` en tu config (`crema #F4EDE4`,
   `tinta #2D1515`, `rojo #B93232`, fuente `inter-tight`).
3. Importa `src/styles/artefacto.css` en tu entry.
4. Renderiza `<ConocerMas />`. Con Lenis:

```jsx
useEffect(() => {
  const lenis = new Lenis({ lerp: 0.12 });
  const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
  return () => lenis.destroy();
}, []);
```

El hook lee `window.scrollY` (scroll nativo), así que Lenis funciona sin
adaptadores. Si usas ScrollTrigger en otras vistas, no interfiere.

## 3. POR QUÉ ahora sí es responsive (léelo antes de tocar nada)

`useConocerMasScroll.js` corre `measure()` en mount, resize, carga de cada
imagen y `document.fonts.ready`. `measure()` toma el **rect renderizado del
logo** (`min(232px, 17.5vw)` de ancho) y deriva TODO de él con `k = anchoLogo/232`:

| medida | valor |
|---|---|
| font de subtemas | `20.8 × k` (proporción del subtítulo del logo real) |
| gap logo→subtema | `5 × k` |
| subtema→subraya | `3 × k` |
| top de fijado `pinY` | `logo.bottom + gap` |
| línea roja compartida `lineY` | `pinY + altoLabel` |
| altura del bloque beige | `pinY − 2` |
| slots de la pila inferior | desde `vh − 30` hacia arriba, gap `14 × k` |
| spacer final | lo justo para que ÉTICAS CREATIVAS alcance `pinY` |

**Regla de oro: no fijes ninguna de estas medidas en CSS.** Cualquier
"desalineación" que veas = algo se está calculando fuera de `measure()`.
La línea del manifiesto fijado coincide al píxel con la del subtema porque
ambas usan `lineY` — no las separes.

## 4. Mecánicas (resumen de cada una)

- **Candado por contenido**: cada label espera en su slot fijo (esquina
  inferior izq.). Solo cuando el TOP de su columna de contenido alcanza la
  altura del slot, label y contenido suben juntos (`y = contentTop`), hasta
  fijarse en `pinY`.
- **Empuje**: el label entrante desliza al fijado hacia arriba, tras el bloque
  beige (`z-10` > labels `z-3`). Al quedar totalmente expulsado se le pone
  `visibility: hidden` (ni un pixel itálico asoma, en ninguna resolución).
- **Labels = botones**: click → `scrollTo` suave hasta que ese contenido queda
  en `pinY`. (Hay `role="button"`; agrega manejo de Enter si lo necesitas.)
- **CONOCE MÁS**: vive en la posición exacta de fijado; opacity 0 cuando hay
  un subtema enganchado.
- **Manifiesto**: el párrafo existe en flujo y como copia `fixed` alineada a la
  columna; se intercambian cuando su borde inferior toca la línea roja.
- **Subrayas**: cada label lleva `<i data-line>` que se extiende hasta el borde
  izquierdo de pantalla (`left: −logo.left`). CONOCE MÁS no lleva línea.
- **Fotos**: track fijo trasladado `−scrollY × 1.6`, con tope al final.

## 5. QA en cada dispositivo (PC, Mac, iPad horizontal, 4K)

- [ ] Subtemas justificados EXACTO al ancho del logo (ni un px fuera).
- [ ] ÉTICAS CREATIVAS al final queda tal cual el lockup del logo.
- [ ] Línea del manifiesto == línea del subtema fijado (mismo Y, al píxel).
- [ ] Click en cada subtema navega a su contenido.
- [ ] Al final de la página el último subtema SÍ alcanza su lugar (spacer).
- [ ] Redimensiona la ventana a mitad de scroll: todo se recoloca sin saltos.
- [ ] Cuerpo justificado a ambos lados; etimologías y numerales en bold
      itálica roja minúscula.
- Mobile/vertical: fuera de alcance de esta versión (diseño pendiente).

## 6. Datos

Textos y fotos en `src/data/content.js`. El logo nuevo (`logo-red.png`) sale
del LOGO.png real recortado al wordmark y tintado a `#B93232` — no lo cambies
por otro recorte sin re-medir las proporciones de la tabla.
