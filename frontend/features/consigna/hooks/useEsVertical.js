import { useEffect, useState } from 'react';

/**
 * true en celulares en posición vertical → el overlay de firma se rota 90°.
 * @returns {boolean}
 */
export function useEsVertical() {
  const calc = () => typeof window !== 'undefined' && window.innerHeight > window.innerWidth && window.innerWidth < 900;
  const [v, setV] = useState(calc);
  useEffect(() => {
    const f = () => setV(calc());
    window.addEventListener('resize', f);
    window.addEventListener('orientationchange', f);
    return () => { window.removeEventListener('resize', f); window.removeEventListener('orientationchange', f); };
  }, []);
  return v;
}

/**
 * true en pantallas angostas (celular) → la tabla de obras se muestra como tarjetas.
 * @param {number} [limite=720]
 * @returns {boolean}
 */
export function useEsAngosto(limite = 720) {
  const calc = () => typeof window !== 'undefined' && window.innerWidth < limite;
  const [v, setV] = useState(calc);
  useEffect(() => {
    const f = () => setV(calc());
    window.addEventListener('resize', f);
    return () => window.removeEventListener('resize', f);
  }, [limite]);
  return v;
}
