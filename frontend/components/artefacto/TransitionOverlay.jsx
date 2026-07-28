'use client';
import { useMemo } from 'react';
import { LETTERS } from './letters';

/*
  Overlay de transición flip-clock.
  phase: 'in' (letras entran cubriendo) | 'out' (letras salen en retroceso) | null (oculto)
  color: color de fondo actual del overlay (hace crossfade vía transition)
*/
export default function TransitionOverlay({ phase, color }) {
  // Reducido a 20x45 = 900 letras (antes 26x64 = 1664) para mejor performance
  const rows = useMemo(() => {
    const urls = Object.values(LETTERS).map((svg) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`);
    let seed = 31;
    const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
    return Array.from({ length: 20 }, (_, r) => ({
      offset: -Math.floor(rnd() * 60),
      letters: Array.from({ length: 45 }, (_, i) => ({
        src: urls[Math.floor(rnd() * urls.length)],
        delay: +((r * 0.4 + i * 0.5) * 0.005 + rnd() * 0.08).toFixed(2),
      })),
    }));
  }, []);

  if (!phase) return null;
  const anim = phase === 'in' ? 'flipIn' : 'flipOut';
  const bgAnim = phase === 'in' ? 'ovFadeIn 0.35s both' : 'ovFadeOut 0.35s 0.8s both';

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, overflow: 'hidden', willChange: 'opacity' }}>
      <div style={{ position: 'absolute', inset: 0, background: color, transition: 'background-color 0.5s', animation: bgAnim, willChange: 'opacity' }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '0.8vh 0', willChange: 'transform' }}>
        {rows.map((row, r) => (
          <div key={r} style={{ display: 'flex', gap: '0.35vh', height: '3.1vh', flex: 'none', marginLeft: row.offset, perspective: 600, backfaceVisibility: 'hidden', transform: 'translateZ(0)' }}>
            {row.letters.map((l, i) => (
              <img
                key={i}
                src={l.src}
                alt=""
                draggable={false}
                style={{
                  height: '100%',
                  width: 'auto',
                  flex: 'none',
                  transformOrigin: 'center bottom',
                  backfaceVisibility: 'hidden',
                  willChange: 'transform, opacity',
                  transform: 'translateZ(0)',
                  animation: `${anim} 0.35s cubic-bezier(0.3,0.8,0.4,1) ${l.delay}s both`
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
