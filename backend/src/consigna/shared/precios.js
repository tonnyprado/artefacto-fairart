// ⚠ Mantener IDÉNTICO en backend/src/consigna/shared y frontend/features/consigna/shared.
// El backend SIEMPRE recalcula: nunca confiar en montos enviados por el cliente.

export const COMISION = 0.25;   // 20% ARTE FACTO + 5% asesor
export const IVA = 0.16;
export const GESTION_ADMIN = 0.03; // gastos de gestión administrativa (siempre incluido)
export const REDONDEO = 500;    // precio de venta cerrado al múltiplo superior

/**
 * @typedef {Object} Desglose
 * @property {number} ganancia - Lo que recibe el artista (75%)
 * @property {number} comision - 25% sobre el bruto
 * @property {number} ajuste - Diferencia para cerrar al múltiplo de 500
 * @property {number} precioVenta - Ganancia + comisión + ajuste
 * @property {number} iva - 16% sobre precio de venta
 * @property {number} gestionAdmin - 3% gastos de gestión administrativa sobre (venta + IVA)
 * @property {number} precioPublico - Precio que ve el comprador
 */

const r2 = (n) => Math.round(n * 100) / 100;

/**
 * Calcula el desglose completo de precios a partir de la ganancia del artista
 * @param {number} ganancia - Ganancia deseada del artista
 * @returns {Desglose}
 */
export function desglosar(ganancia) {
  const g = Math.max(0, ganancia);
  const bruto = g / (1 - COMISION);
  const precioVenta = Math.ceil(bruto / REDONDEO - 1e-9) * REDONDEO;
  const iva = precioVenta * IVA;
  const gestionAdmin = (precioVenta + iva) * GESTION_ADMIN;
  return {
    ganancia: r2(g),
    comision: r2(bruto - g),
    ajuste: r2(precioVenta - bruto),
    precioVenta,
    iva: r2(iva),
    gestionAdmin: r2(gestionAdmin),
    precioPublico: r2(precioVenta + iva + gestionAdmin),
  };
}

/**
 * Cuando el artista edita el precio público, despejamos su ganancia
 * IMPORTANTE: Debe considerar el redondeo a múltiplo de 500 del precio de venta
 * para evitar que el precio público cambie al recalcular
 * @param {number} precioPublico - Precio público deseado
 * @returns {number} Ganancia calculada
 */
export function gananciaDesdePublico(precioPublico) {
  const p = Math.max(0, precioPublico);

  // Despejar precio de venta desde precio público
  // precioPublico = precioVenta * (1 + IVA) * (1 + GESTION_ADMIN)
  const precioVentaSinRedondeo = p / ((1 + IVA) * (1 + GESTION_ADMIN));

  // Redondear al múltiplo de 500 MÁS CERCANO para minimizar diferencia
  const precioVenta = Math.round(precioVentaSinRedondeo / REDONDEO) * REDONDEO;

  // Para un precioVenta dado (múltiplo de 500), la ganancia que lo produce es:
  // En desglosar: precioVenta = Math.ceil(bruto / REDONDEO) * REDONDEO
  // donde bruto = ganancia / (1 - COMISION)
  // Para que Math.ceil(bruto / 500) * 500 = precioVenta, necesitamos:
  // bruto <= precioVenta y bruto > precioVenta - 500
  // Maximizando ganancia, tomamos bruto = precioVenta
  // Entonces: ganancia = bruto * (1 - COMISION) = precioVenta * (1 - COMISION)
  const ganancia = precioVenta * (1 - COMISION);

  return Math.round(ganancia);
}

/**
 * Formatea un número como moneda MXN
 * @param {number} n - Número a formatear
 * @returns {string}
 */
export const formatoMXN = (n) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n);
