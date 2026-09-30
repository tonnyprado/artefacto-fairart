import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * @typedef {Object} Punto
 * @property {number} x
 * @property {number} y
 */

/**
 * SRP: captura de trazos en <canvas> con Pointer Events (dedo, stylus, mouse).
 * @returns {Object}
 */
export function useLienzoFirma() {
  const canvas = useRef(null);
  const trazos = useRef([]);
  const dibujando = useRef(false);
  const [tieneTinta, setTieneTinta] = useState(false);

  const redibujar = useCallback(() => {
    const c = canvas.current, ctx = c?.getContext('2d');
    if (!c || !ctx) return;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.strokeStyle = '#14100c'; ctx.lineWidth = 3.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const t of trazos.current) {
      ctx.beginPath();
      t.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
      ctx.stroke();
    }
  }, []);

  const punto = (e) => {
    const c = e.currentTarget, r = c.getBoundingClientRect();
    // getBoundingClientRect considera la rotación CSS del overlay en vertical
    const vertical = r.height > r.width && c.width > c.height;
    const nx = vertical ? (e.clientY - r.top) / r.height : (e.clientX - r.left) / r.width;
    const ny = vertical ? 1 - (e.clientX - r.left) / r.width : (e.clientY - r.top) / r.height;
    return { x: nx * c.width, y: ny * c.height };
  };

  const handlers = {
    onPointerDown: (e) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      trazos.current.push([punto(e)]);
      dibujando.current = true;
    },
    onPointerMove: (e) => {
      if (!dibujando.current) return;
      trazos.current[trazos.current.length - 1].push(punto(e));
      redibujar();
      setTieneTinta(true);
    },
    onPointerUp: () => { dibujando.current = false; },
    onPointerCancel: () => { dibujando.current = false; },
  };

  const limpiar = useCallback(() => { trazos.current = []; redibujar(); setTieneTinta(false); }, [redibujar]);
  const exportarPng = useCallback(() => canvas.current?.toDataURL('image/png') ?? null, []);

  useEffect(() => { redibujar(); }, [redibujar]);

  return { canvas, handlers, limpiar, exportarPng, tieneTinta };
}
