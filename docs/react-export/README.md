# ARTEFACTO — Landing en React

Componentes React de la landing (hero con letras animadas + secciones), listos para Next.js o Vite.

## Estructura

```
src/components/artefacto/
├── index.js                 # barrel de exports
├── theme.js                 # COLORES y FUENTES de marca (edita aquí)
├── artefacto.css            # fuentes, keyframes, navbar, transiciones (importar 1 vez)
├── letters.js               # las 16 letras SVG del fondo (inline, no requiere red)
├── LandingArtefacto.jsx     # ⭐ ORQUESTADOR SPA: secciones + transiciones + menú + Lenis
├── HeroArtefacto.jsx        # hero: fondo de letras + flip clock + carve + nav + logo
├── Navbar.jsx               # navbar transparente: iconos-letra + logo centrado
├── TransitionOverlay.jsx    # overlay flip-clock entre secciones
├── SectionHeader.jsx        # encabezado numerado 01/02/03/04
├── AboutSection.jsx         # 01 Acerca de (fondo claro)
├── ConvocatoriaSection.jsx  # 02 Convocatoria (fondo rojo, incluye Registro)
├── CalendarSection.jsx      # 03 Calendario (fondo claro)
├── ContactSection.jsx       # 04 Contacto (fondo rojo)
└── Footer.jsx
public/assets/               # SVGs de marca → copiar a tu public/
```

## Instalación

1. Copia `src/components/artefacto/` a tu proyecto (en el repo: `artefact-web/frontend/components/artefacto/`).
2. Copia `public/assets/*.svg` a tu `public/assets/` (las rutas en los componentes son `/assets/...`).
3. Importa el CSS **una sola vez**:
   - **Next.js (App Router):** en `app/layout.js` → `import '@/components/artefacto/artefacto.css';`
   - **Vite/CRA:** en `main.jsx` → `import './components/artefacto/artefacto.css';`
4. Instala Lenis (smooth scroll): `npm install lenis` — `LandingArtefacto` lo detecta y lo inicializa solo; sin él funciona con scroll nativo.

Sin más dependencias: React 18+ y lenis. Las fuentes (Anton + Archivo) se cargan desde Google Fonts vía el CSS.

## Uso — página completa (SPA con transiciones)

```jsx
import { LandingArtefacto } from '@/components/artefacto';

export default function Page() {
  return <LandingArtefacto />;
}
```

Eso es todo: `LandingArtefacto` orquesta hero, navbar, secciones, menú móvil, overlay de transición y Lenis.

### Cómo funciona la navegación

- **Una sección a la vez** (hero → about → convocatoria → calendario → contacto).
- Cualquier `<a href="#seccion">` dentro del árbol navega con transición (hero, navbar, footer, CTAs).
- **Scroll down**: en el hero pasa a Acerca de; en las demás secciones, al llegar al final del scroll pasa a la siguiente.
- **Transición**: la sección actual hace fade-out rápido (`.fx-out`), las letras cubren con flip, el fondo hace crossfade al color de la nueva sección (si es el mismo, no cambia), las letras salen en retroceso (`flipOut`) y los componentes de la nueva sección entran con fade escalonado (`.fx-in`). Tiempos en `LandingArtefacto.jsx` (950ms + 1200ms) y delays en `artefacto.css`.
- **Navbar**: iconos-letra (A/R/C/O) con label en hover + flip del icono; logo centrado → hero. En móvil (<760px) botón estrella → menú fullscreen.

## Uso — secciones sueltas (sin SPA)

```jsx
import {
  HeroArtefacto, AboutSection, ConvocatoriaSection,
  CalendarSection, ContactSection, Footer,
} from '@/components/artefacto';

export default function Page() {
  return (
    <main>
      <HeroArtefacto />
      <AboutSection />
      <ConvocatoriaSection edicion="2027" abierta />
      <CalendarSection />
      <ContactSection onSubmit={async (data) => {
        // conecta tu API real:
        // await fetch('/api/contact', { method: 'POST', body: JSON.stringify(data) });
      }} />
      <Footer />
    </main>
  );
}
```

En Next.js App Router, `HeroArtefacto` y `ContactSection` ya llevan `'use client'`.

## Props principales

| Componente | Prop | Default | Qué hace |
|---|---|---|---|
| `HeroArtefacto` | `links` | Acerca/Contacto/Registro/Calendario | palabras de nav: `{ label, href, pos }` con `pos` = `top-left`, `top-right`, `bottom-left`, `bottom-right` |
| | `rows`, `cols` | `26`, `64` | densidad del patrón de letras |
| `AboutSection` | `mostrarMapa` | `true` | muestra/oculta el iframe de Google Maps |
| `ConvocatoriaSection` | `edicion` | `'2027'` | año de la edición |
| | `abierta` | `true` | badge + estado Fase 1 + texto del CTA |
| | `urlRegistro`, `urlConvocatoria` | `#contacto` | pon aquí tus URLs reales |
| `CalendarSection` | `eventos` | timeline 2026–2027 | array `{ fecha, tag, title, desc, kind }`; `kind`: `launch`\|`phase`\|`vote`\|`final` |
| `ContactSection` | `onSubmit(data)` | demo 1.2s | tu llamada de API; `data` = `{nombre, email, telefono, asunto, mensaje}` |

## Cómo funciona el hero (para modificarlo)

- **Letras**: `letters.js` exporta los 16 SVG como strings; el componente los convierte a data-URIs y arma `rows × cols` con delays deterministas (mismo layout en cada carga).
- **Flip clock**: keyframe `flipIn` en `artefacto.css`; el delay por letra crea la onda diagonal. El delay de las palabras/logo (2.4s–2.9s) está en `HeroArtefacto.jsx` — ajústalo si cambias la duración de la onda.
- **Huecos (carve)**: todo elemento con `data-carve` dentro del hero recorta las letras que caen sobre su texto (medido línea por línea con `Range.getClientRects`). Se recalcula en resize. Para abrir un hueco alrededor de algo nuevo, solo agrégale `data-carve="1"`.
- **Hover**: `.artefacto-letter:hover { opacity: .12 }` — la letra se desvanece y revela el rojo.

## Editar la marca

Todos los colores/fuentes viven en `theme.js` (`COLORS.red = '#b83030'`, etc.). Los componentes los importan de ahí, así que un cambio se propaga a toda la landing. Los textos de listas (valores, requisitos, beneficios, timeline, datos de contacto) están en arrays `const` arriba de cada componente — edítalos ahí.

## Pendientes reales

- URLs de redes sociales, WhatsApp y PDF de convocatoria (hoy son placeholders).
- Endpoint del formulario de contacto (`onSubmit`).
- El embed de Google Maps apunta a Centro Histórico CDMX como referencia.
