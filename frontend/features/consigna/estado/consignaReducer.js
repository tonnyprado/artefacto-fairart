export const TOTAL_PASOS = 15;
export const PASO_ENVIADO = 16;

export const ETIQUETAS_PASO = [
  'Bienvenida', 'Obra en consignación', 'Tarifa de participación', 'Recepción, montaje y devolución',
  'Responsabilidades', 'Venta y comisión', 'Pagos, facturación e IVA', 'Curaduría, imagen y catálogo',
  'Notificaciones', 'Disposiciones finales', 'Resolución de conflictos', 'Aceptación de riesgo',
  'Situación fiscal', 'Tus obras', 'Aceptación y firma', 'Revisar y enviar',
];

/**
 * @typedef {Object} EstadoConsigna
 * @property {number} paso
 * @property {number} maxPaso
 * @property {any} estadoFiscal
 * @property {any} constancia
 * @property {number | null} descuentoMax
 * @property {Record<string, number>} ganancias
 * @property {Record<string, boolean>} touched - Trackea si el artista editó manualmente cada obra
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
  const touched = Object.fromEntries(ctx.obras.map(o => [o.id, b?.touched?.[o.id] ?? false]));

  // Migración: tercero_sin_datos → pendiente (opción eliminada)
  const estadoFiscalMigrado = b?.estadoFiscal === 'tercero_sin_datos' ? 'pendiente' : b?.estadoFiscal ?? null;

  if (ctx.enviado) {
    return { paso: 15, maxPaso: 15, estadoFiscal: estadoFiscalMigrado, constancia: b?.constancia ?? null,
      descuentoMax: b?.descuentoMax ?? null, ganancias, touched, acepto: true, firma: null, enviado: true };
  }
  // Si regresa con borrador, lo devolvemos como máximo al paso 14 (debe volver a firmar).
  return {
    paso: b ? Math.min(b.paso, 14) : 0, maxPaso: b ? Math.min(b.maxPaso, 14) : 0,
    estadoFiscal: estadoFiscalMigrado, constancia: b?.constancia ?? null,
    descuentoMax: b?.descuentoMax ?? null, ganancias, touched, acepto: b?.acepto ?? false, firma: null, enviado: false,
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
    case 'GANANCIA': return {
      ...s,
      ganancias: { ...s.ganancias, [a.obraId]: Math.max(0, a.valor) },
      touched: { ...s.touched, [a.obraId]: true }
    };
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
  if (s.paso === 12) return s.estadoFiscal !== null && (s.estadoFiscal !== 'cargada' || !!s.constancia);
  if (s.paso === 13) return s.descuentoMax !== null;
  if (s.paso === 14) return s.acepto && !!s.firma;
  return true;
}

/**
 * @param {EstadoConsigna} s
 * @returns {any}
 */
export function aBorrador(s) {
  return { paso: Math.min(s.paso, 15), maxPaso: s.maxPaso, estadoFiscal: s.estadoFiscal, constancia: s.constancia,
    descuentoMax: s.descuentoMax, ganancias: s.ganancias, touched: s.touched, acepto: s.acepto };
}
