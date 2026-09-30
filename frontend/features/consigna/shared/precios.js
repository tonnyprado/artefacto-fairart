// ⚠ Mantener IDÉNTICO en backend/src/shared y frontend/src/features/consigna/shared.
// El backend SIEMPRE recalcula: nunca confiar en montos enviados por el cliente.

export const COMISION = 0.25;   // 20% ARTE FACTO + 5% asesor
export const IVA = 0.16;
export const TARJETA = 0.03;    // siempre incluido en el precio público
export const REDONDEO = 500;    // precio de venta cerrado al múltiplo superior

/**
 * @typedef {Object} Desglose
 * @property {number} ganancia - lo que recibe el artista (75%)
 * @property {number} comision - 25% sobre el bruto
 * @property {number} ajuste - diferencia para cerrar al múltiplo de 500
 * @property {number} precioVenta - ganancia + comisión + ajuste
 * @property {number} iva - 16% sobre precio de venta
 * @property {number} tarjeta - 3% sobre (venta + IVA)
 * @property {number} precioPublico - precio que ve el comprador
 */

const r2 = (n) => Math.round(n * 100) / 100;

/**
 * @param {number} ganancia
 * @returns {Desglose}
 */
export function desglosar(ganancia) {
  const g = Math.max(0, ganancia);
  const bruto = g / (1 - COMISION);
  const precioVenta = Math.ceil(bruto / REDONDEO - 1e-9) * REDONDEO;
  const iva = precioVenta * IVA;
  const tarjeta = (precioVenta + iva) * TARJETA;
  return {
    ganancia: r2(g),
    comision: r2(bruto - g),
    ajuste: r2(precioVenta - bruto),
    precioVenta,
    iva: r2(iva),
    tarjeta: r2(tarjeta),
    precioPublico: r2(precioVenta + iva + tarjeta),
  };
}

/**
 * Cuando el artista edita el precio público, despejamos su ganancia.
 * @param {number} precioPublico
 * @returns {number}
 */
export function gananciaDesdePublico(precioPublico) {
  return Math.round((Math.max(0, precioPublico) / ((1 + IVA) * (1 + TARJETA))) * (1 - COMISION));
}

export const formatoMXN = (n) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n);
