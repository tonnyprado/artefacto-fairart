// ⚠ Mantener IDÉNTICO en backend/src/consigna/shared y frontend/features/consigna/shared.
// El backend SIEMPRE recalcula: nunca confiar en montos enviados por el cliente.

export const ARTISTA = 0.75;        // 75% para el artista (ingreso)
export const COMISION = 0.25;       // 25% comisión ARTE FACTO
export const GESTION = 0.04;        // 4% gestión administrativa (sobre el precio base)
export const IVA = 0.16;            // 16% IVA (sobre el subtotal = base + gestión)
export const PASO = 100;            // redondeo al múltiplo de 100

/**
 * @typedef {Object} Desglose
 * @property {number} ingreso - Lo que recibe el artista (75% de la base) - YA AJUSTADO
 * @property {number} comision - 25% comisión ARTE FACTO
 * @property {number} precioBase - Base (100%) = ingreso + comisión
 * @property {number} gestion - 4% gestión administrativa sobre precio base
 * @property {number} subtotal - Base + gestión
 * @property {number} iva - 16% IVA sobre el subtotal
 * @property {number} precioPublico - Precio que ve el comprador (cerrado a múltiplo de 100)
 */

/**
 * Redondea un número a 2 decimales
 * @param {number} n - Número a redondear
 * @returns {number}
 */
const r2 = (n) => Math.round(n * 100) / 100;

/**
 * Calcula el desglose completo desde precio público (FUNCIÓN INVERSA MAESTRA)
 * Esta es la función que SIEMPRE se usa para generar el desglose final.
 * El ajuste del redondeo queda ABSORBIDO en todas las cifras.
 *
 * Orden inverso:
 * 1. publico → subtotal (quita IVA 16%)
 * 2. subtotal → base (quita gestión 4%)
 * 3. base → ingreso (75%) + comisión (25%)
 *
 * @param {number} publico - Precio público final (ya redondeado)
 * @returns {Desglose}
 */
function desglosarDesdePublicoFinal(publico) {
  const publicoFinal = Math.max(0, publico);

  // Inverso: quitar IVA 16% para obtener el subtotal
  const subtotal = publicoFinal / (1 + IVA);

  // Inverso: quitar gestión 4% para obtener el base
  const base = subtotal / (1 + GESTION);

  // Calcular componentes
  const ingreso = base * ARTISTA;           // 75%
  const comision = base * COMISION;         // 25%
  const gestion = subtotal - base;          // 4% sobre base
  const iva = publicoFinal - subtotal;      // 16% sobre subtotal

  return {
    ingreso: r2(ingreso),
    comision: r2(comision),
    precioBase: r2(base),
    gestion: r2(gestion),
    subtotal: r2(subtotal),
    iva: r2(iva),
    precioPublico: r2(publicoFinal),
  };
}

/**
 * Calcula el desglose completo a partir del ingreso del artista
 * Flujo: ingreso → base → gestión → subtotal → IVA → público bruto → redondeo → desglose inverso
 *
 * @param {number} ingreso - Ingreso deseado del artista (lo que quiere recibir, su 75%)
 * @returns {Desglose}
 */
export function desglosar(ingreso) {
  const ingresoInput = Math.max(0, ingreso);

  // 1. Calcular base desde ingreso (ingreso es 75% de la base)
  const base = ingresoInput / ARTISTA;

  // 2. Calcular precio público bruto
  // base → +gestión 4% → subtotal → +IVA 16% → público
  const publicoBruto = base * (1 + GESTION) * (1 + IVA);

  // 3. Redondear hacia arriba al múltiplo de 100
  const publicoFinal = Math.ceil(publicoBruto / PASO) * PASO;

  // 4. Recalcular TODO desde el público final (inverso)
  //    El ajuste queda absorbido en el desglose
  return desglosarDesdePublicoFinal(publicoFinal);
}

/**
 * Cuando el artista edita el precio público directamente
 * SIN aplicar redondeo - el precio público YA es el valor final que eligió
 *
 * @param {number} precioPublico - Precio público exacto que ingresó el artista
 * @returns {Desglose}
 */
export function desglosarDesdePublico(precioPublico) {
  // Simplemente usar la función inversa maestra
  // No hay redondeo porque el artista fijó el número final
  return desglosarDesdePublicoFinal(precioPublico);
}

/**
 * Calcula el ingreso del artista desde el precio público
 * Usado cuando el artista edita el precio público y necesitamos actualizar el estado
 *
 * @param {number} precioPublico - Precio público final
 * @returns {number} Ingreso calculado (con decimales para exactitud)
 */
export function ingresoDesdePublico(precioPublico) {
  const publicoFinal = Math.max(0, precioPublico);

  // Calcular subtotal desde público (inverso - quita IVA)
  const subtotal = publicoFinal / (1 + IVA);

  // Calcular base desde subtotal (inverso - quita gestión)
  const base = subtotal / (1 + GESTION);

  // El ingreso es el 75% de la base
  // ⚠️ NO redondear - mantener decimales para exactitud en recálculos
  const ingreso = base * ARTISTA;

  return ingreso;
}

// Alias para compatibilidad (algunos componentes usan gananciaDesdePublico)
export { ingresoDesdePublico as gananciaDesdePublico };

/**
 * Formatea un número como moneda MXN
 * @param {number} n - Número a formatear
 * @returns {string}
 */
export const formatoMXN = (n) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n);
