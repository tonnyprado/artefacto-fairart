export const TOTAL_PASOS = 12;
export const PASO_ENVIADO = 13;

export const ETIQUETAS_PASO = [
  'Bienvenida', 'Obra en consignación', 'Tarifa de participación', 'Recepción, montaje y devolución',
  'Responsabilidades', 'Venta y comisión', 'Pagos, facturación e IVA', 'Curaduría, imagen y catálogo',
  'Resolución de conflictos', 'Situación fiscal', 'Tus obras', 'Aceptación y firma', 'Revisar y enviar',
];

/**
 * @typedef {Object} EstadoConsigna
 * @property {number} paso
 * @property {number} maxPaso
 * @property {any} estadoFiscal
 * @property {any} constancia
 * @property {number | null} descuentoMax
 * @property {Record<string, number>} ganancias
 * @property {boolean} acepto
 * @property {string | null} firma - dataURL PNG — NO se guarda en borrador
 * @property {boolean} enviado
 */

/**
 * @typedef {Object} Accion
 */

/**
 * @param {any} ctx
 * @returns {EstadoConsigna}
 */
export function estadoInicial(ctx) {
  const b = ctx.borrador;
  const ganancias = Object.fromEntries(ctx.obras.map(o => [o.id, b?.ganancias?.[o.id] ?? o.gananciaRegistrada]));
  if (ctx.enviado) {
    return { paso: 12, maxPaso: 12, estadoFiscal: b?.estadoFiscal ?? null, constancia: b?.constancia ?? null,
      descuentoMax: b?.descuentoMax ?? null, ganancias, acepto: true, firma: null, enviado: true };
  }
  // Si regresa con borrador, lo devolvemos como máximo al paso 11 (debe volver a firmar).
  return {
    paso: b ? Math.min(b.paso, 11) : 0, maxPaso: b ? Math.min(b.maxPaso, 11) : 0,
    estadoFiscal: b?.estadoFiscal ?? null, constancia: b?.constancia ?? null,
    descuentoMax: b?.descuentoMax ?? null, ganancias, acepto: b?.acepto ?? false, firma: null, enviado: false,
  };
}

/**
 * @param {EstadoConsigna} s
 * @param {Accion} a
 * @returns {EstadoConsigna}
 */
export function consignaReducer(s, a) {
  switch (a.tipo) {
    case 'IR_A': {
      const paso = Math.max(0, Math.min(PASO_ENVIADO, a.paso));
      return { ...s, paso, maxPaso: Math.max(s.maxPaso, Math.min(paso, TOTAL_PASOS)) };
    }
    case 'FISCAL': return { ...s, estadoFiscal: a.valor };
    case 'CONSTANCIA': return { ...s, constancia: a.valor, estadoFiscal: 'cargada' };
    case 'DESCUENTO': return { ...s, descuentoMax: a.valor };
    case 'GANANCIA': return { ...s, ganancias: { ...s.ganancias, [a.obraId]: Math.max(0, a.valor) } };
    case 'ACEPTO': return { ...s, acepto: a.valor };
    case 'FIRMA': return { ...s, firma: a.valor };
    case 'ENVIADO': return { ...s, enviado: true, paso: PASO_ENVIADO };
  }
}

/**
 * Reglas para avanzar con "Siguiente". La navegación hacia atrás SIEMPRE está permitida.
 * @param {EstadoConsigna} s
 * @returns {boolean}
 */
export function puedeAvanzar(s) {
  if (s.paso === 9) return s.estadoFiscal !== null && (s.estadoFiscal !== 'cargada' || !!s.constancia);
  if (s.paso === 10) return s.descuentoMax !== null;
  if (s.paso === 11) return s.acepto && !!s.firma;
  return true;
}

/**
 * @param {EstadoConsigna} s
 * @returns {any}
 */
export function aBorrador(s) {
  return { paso: Math.min(s.paso, 12), maxPaso: s.maxPaso, estadoFiscal: s.estadoFiscal, constancia: s.constancia,
    descuentoMax: s.descuentoMax, ganancias: s.ganancias, acepto: s.acepto };
}
