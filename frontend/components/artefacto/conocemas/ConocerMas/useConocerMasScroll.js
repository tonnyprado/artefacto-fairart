'use client';

import { useEffect } from 'react';

const PHOTO_SPEED = 1.6;
const LOGO_BASE = 232; // px de referencia: todos los ratios se midieron a este ancho

/**
 * Toda la mecánica de scroll de "Conocer más".
 *
 * CLAVE DE LA RESPONSIVIDAD: nada usa breakpoints ni valores por pantalla.
 * Cada medida (posición de fijado, font de subtemas, gap con el logo, altura
 * del bloque beige, slots de la pila inferior, spacer final) se deriva del
 * rect REAL renderizado del logo en measure(), que corre en mount, resize,
 * carga de imágenes y carga de fuentes. Si el logo escala (min(232px,17.5vw)),
 * todo el sistema escala con él — PC, Mac, iPad, 4K.
 *
 * refs esperados: { logo, mask, ghost, pin, flow, rail, track, labels: [], contents: [], spacer }
 */
export default function useConocerMasScroll(refs) {
  useEffect(() => {
    const e = refs.current;
    if (!e || !e.logo) return;

    let g = null; // geometría vigente
    let pinned = false;
    let raf = null;

    const measure = () => {
      if (!e.logo) return;
      const L = e.logo.getBoundingClientRect();
      if (!L.width) return;

      const k = L.width / LOGO_BASE;
      const gap = 5 * k;        // hueco logo→subtema (proporción del logo real)
      const fontSize = 20.8 * k; // subtítulo del logo ≈ 0.09 del ancho del wordmark
      const padB = 3 * k;        // subtema→subraya
      const slotGap = 14 * k;

      const styleLabel = (el) => {
        if (!el) return;
        el.style.left = L.left + 'px';
        el.style.width = L.width + 'px';
        el.style.fontSize = fontSize + 'px';
        el.style.paddingBottom = padB + 'px';
        el.style.visibility = 'visible';
        const ln = el.querySelector('[data-line]');
        if (ln) ln.style.left = -L.left + 'px';
      };

      e.labels.filter(Boolean).forEach(styleLabel);
      if (e.ghost) styleLabel(e.ghost);

      // Fit: si las dos palabras no caben con hueco mínimo, reducir SOLO ese label
      const fit = (el) => {
        if (!el) return;
        const sp = el.querySelectorAll('span');
        if (sp.length < 2) return;
        let fs = fontSize;
        const minGap = fontSize * 0.35;
        for (let t = 0; t < 12; t++) {
          if (sp[0].offsetWidth + sp[1].offsetWidth + minGap <= L.width) break;
          fs -= 0.5;
          el.style.fontSize = fs + 'px';
        }
      };

      e.labels.filter(Boolean).forEach(fit);
      if (e.ghost) fit(e.ghost);

      const labH = e.labels[0]?.offsetHeight || 30;
      const pinY = L.bottom + gap;  // top del subtema fijado bajo el logo
      const lineY = pinY + labH;    // Y exacta de la línea roja compartida

      if (e.mask) e.mask.style.height = pinY - 2 + 'px';
      if (e.ghost) e.ghost.style.transform = `translateY(${pinY}px)`;

      const vh = window.innerHeight;
      const n = e.labels.filter(Boolean).length;
      const slots = [];
      for (let i = 0; i < n; i++) {
        slots[i] = vh - 30 - (n - i) * labH - (n - 1 - i) * slotGap;
      }

      // Manifiesto fijado: misma columna que el flujo, línea clavada en lineY
      if (e.flow && e.pin) {
        const f = e.flow.getBoundingClientRect();
        e.pin.style.left = f.left + 'px';
        e.pin.style.width = f.width + 'px';
        e.pin.style.height = lineY + 'px';
        e.pin.style.paddingBottom = gap + 8 + 'px';
      }

      // Recorrido garantizado: el contenido de ÉTICAS CREATIVAS debe poder
      // llegar a pinY antes de agotar el scroll (clave en pantallas altas)
      if (e.spacer && e.contents.length > 0) {
        e.spacer.style.height = '0px';
        const lastContent = e.contents[e.contents.length - 1];
        if (lastContent) {
          const lastTop = lastContent.getBoundingClientRect().top + window.scrollY;
          const docH = document.documentElement.scrollHeight;
          e.spacer.style.height = Math.max(0, Math.ceil(lastTop - pinY - (docH - vh))) + 'px';
        }
      }

      g = { pinY, lineY, labH, slots, slotGap, gap };
      frame();
    };

    const frame = () => {
      const s = window.scrollY;

      // Carril de fotos
      if (e.track && e.rail) {
        const maxTy = Math.max(0, e.track.scrollHeight - e.rail.clientHeight);
        e.track.style.transform = `translateY(${-Math.min(s * PHOTO_SPEED, maxTy)}px)`;
      }

      if (!g) return;

      // Candado: cada subtema espera en su slot; cuando el inicio de SU
      // contenido alcanza el slot, ambos suben juntos (y = top del contenido)
      const labels = e.labels.filter(Boolean);
      const contents = e.contents.filter(Boolean);
      const n = labels.length;
      const ys = new Array(n);

      for (let i = 0; i < n; i++) {
        if (!contents[i]) {
          ys[i] = g.slots[i] || 0;
          continue;
        }
        const cTop = contents[i].getBoundingClientRect().top;
        ys[i] = Math.max(g.pinY, Math.min(g.slots[i], cTop));
      }

      // Empuje: el entrante desliza al fijado tras el bloque del logo
      for (let i = n - 2; i >= 0; i--) {
        ys[i] = Math.min(ys[i], ys[i + 1] - g.labH - g.slotGap);
      }

      for (let i = 0; i < n; i++) {
        labels[i].style.transform = `translateY(${ys[i]}px)`;
        // Expulsado del todo → ocultar (que ni un pixel itálico asome)
        labels[i].style.visibility = ys[i] <= g.pinY - g.labH - 2 ? 'hidden' : 'visible';
      }

      // Ghost "CONOCE MÁS": visible solo cuando ningún subtema está fijado
      if (e.ghost) {
        e.ghost.style.opacity = ys.some((y) => y <= g.pinY + 2) ? '0' : '1';
      }

      // Manifiesto: se fija cuando su borde inferior llega a la línea roja
      if (e.flow && e.pin) {
        const fr = e.flow.getBoundingClientRect();
        const shouldPin = fr.bottom <= g.lineY - (g.gap + 8) + 1;
        if (shouldPin && !pinned) {
          pinned = true;
          e.pin.style.display = 'flex';
          e.flow.style.visibility = 'hidden';
        } else if (!shouldPin && pinned) {
          pinned = false;
          e.pin.style.display = 'none';
          e.flow.style.visibility = 'visible';
        }
      }
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => { raf = null; frame(); });
    };

    const goTo = (i) => {
      if (!g || !e.contents[i]) return;
      const top = e.contents[i].getBoundingClientRect().top + window.scrollY - g.pinY;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    };

    e.labels.filter(Boolean).forEach((lab, i) => {
      lab.addEventListener('click', () => goTo(i));
    });

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measure);

    // Medir cuando las imágenes carguen
    document.querySelectorAll('img').forEach((img) => {
      if (!img.complete) img.addEventListener('load', measure, { once: true });
    });

    // Medir cuando las fuentes estén listas
    document.fonts?.ready?.then(measure);

    // Medidas iniciales y de respaldo
    measure();
    const t1 = setTimeout(measure, 100);
    const t2 = setTimeout(measure, 600);
    const t3 = setTimeout(measure, 2000);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', measure);
      if (raf) cancelAnimationFrame(raf);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);
}
