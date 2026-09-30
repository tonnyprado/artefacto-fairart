import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { consignaReducer, estadoInicial, aBorrador, puedeAvanzar } from '../estado/consignaReducer';

/**
 * @typedef {Object} Carga
 * @property {string} estado
 * @property {string} [mensaje]
 * @property {number} [status]
 * @property {any} [ctx]
 */

/**
 * Carga el contexto de la liga.
 * @param {any} api
 * @param {string} token
 * @returns {Carga}
 */
export function useContextoConsigna(api, token) {
  const [carga, setCarga] = useState({ estado: 'cargando' });
  useEffect(() => {
    let vivo = true;
    api.contexto(token)
      .then(ctx => vivo && setCarga({ estado: 'listo', ctx }))
      .catch(e => vivo && setCarga({ estado: 'error', mensaje: e.message, status: e.status }));
    return () => { vivo = false; };
  }, [api, token]);
  return carga;
}

/**
 * Estado del flujo + autoguardado + acciones de envío.
 * @param {any} api
 * @param {string} token
 * @param {any} ctx
 * @returns {Object}
 */
export function useFlujoConsigna(api, token, ctx) {
  const [s, dispatch] = useReducer(consignaReducer, ctx, estadoInicial);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);
  const pdfUrl = useRef(null);

  // Autoguardado (debounce 800 ms). No guarda la firma ni después de enviar.
  useEffect(() => {
    if (s.enviado) return;
    const t = setTimeout(() => api.guardarBorrador(token, aBorrador(s)).catch(() => {}), 800);
    return () => clearTimeout(t);
  }, [api, token, s.paso, s.estadoFiscal, s.constancia, s.descuentoMax, s.ganancias, s.acepto, s.enviado]);

  const ir = useCallback((paso) => { dispatch({ tipo: 'IR_A', paso }); window.scrollTo(0, 0); }, []);

  const payload = useCallback((st) => ({
    estadoFiscal: st.estadoFiscal ?? undefined,
    constanciaKey: st.constancia?.key ?? null,
    descuentoMax: st.descuentoMax ?? 0,
    obras: Object.entries(st.ganancias).map(([obraId, gananciaFinal]) => ({ obraId, gananciaFinal })),
    firmaPng: st.firma ?? undefined,
  }), []);

  const enviar = useCallback(async () => {
    if (!s.firma || !s.estadoFiscal || s.descuentoMax === null) return;
    setEnviando(true); setError(null);
    try {
      const r = await api.enviar(token, { ...payload(s), acepto: true });
      pdfUrl.current = r.pdfUrl;
      dispatch({ tipo: 'ENVIADO' });
      window.scrollTo(0, 0);
    } catch (e) {
      setError(e.message);
    } finally { setEnviando(false); }
  }, [api, token, s, payload]);

  /**
   * Antes de enviar: PDF de vista previa. Después: PDF firmado guardado en S3.
   */
  const descargar = useCallback(async () => {
    try {
      if (s.enviado) {
        const url = pdfUrl.current ?? await api.urlPdf(token);
        window.open(url, '_blank', 'noopener');
      } else {
        const blob = await api.vistaPrevia(token, payload(s));
        const url = URL.createObjectURL(blob);
        const a = Object.assign(document.createElement('a'), { href: url, download: `Acuerdo-${ctx.artista.folio}-vista-previa.pdf` });
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 5000);
      }
    } catch (e) { setError(e.message); }
  }, [api, token, s, payload, ctx.artista.folio]);

  const subirConstancia = useCallback(async (f) => {
    setError(null);
    try { dispatch({ tipo: 'CONSTANCIA', valor: await api.subirConstancia(token, f) }); }
    catch (e) { setError(e.message); }
  }, [api, token]);

  return useMemo(() => ({
    s, dispatch, ir, puedeAvanzar: puedeAvanzar(s), enviar, enviando, descargar, subirConstancia, error,
  }), [s, ir, enviar, enviando, descargar, subirConstancia, error]);
}
