// ⚠ Mantener IDÉNTICO en backend/src/consigna/shared y frontend/features/consigna/shared.
// El backend SIEMPRE recalcula: nunca confiar en montos enviados por el cliente.

export const ARTISTA = 0.75;        // 75% para el artista
export const COMISION = 0.25;       // 25% comisión ARTE FACTO
export const IVA = 0.16;            // 16% IVA (se aplica sobre la base)
export const GESTION = 0.03;        // 3% gestión administrativa (se aplica sobre base + IVA)
export const PASO = 100;            // redondeo al múltiplo de 100

/**
 * @typedef {Object} Desglose
 * @property {number} ganancia - Lo que recibe el artista (75% de la base) - YA AJUSTADO
 * @property {number} comision - 25% comisión ARTE FACTO
 * @property {number} precioBase - Base (100%) = ganancia + comisión
 * @property {number} iva - 16% sobre precio base
 * @property {number} gestionAdmin - 3% sobre (precio base + IVA)
 * @property {number} precioPublico - Precio que ve el comprador (cerrado a múltiplo de 100)
 */

/**
 * Redondea un número a 2 decimales
 * @param {number} n - Número a redondear
 * @returns {number}
 */
const r2 = (n) => Math.round(n * 100) / 100;

/**
 * Calcula precio público desde precio base (forward direction)
 * ORDEN: base → +IVA (sobre base) → +gestión (sobre base+IVA)
 *
 * @param {number} base - Precio base (100%)
 * @returns {number} Precio público bruto (antes de redondear)
 */
function calcularPrecioPublicoBruto(base) {
  const baseConIva = base * (1 + IVA);           // base + 16%
  const publico = baseConIva * (1 + GESTION);    // (base + IVA) + 3%
  return publico;
}

/**
 * Calcula precio base desde precio público (inverse direction)
 * Invierte el cálculo: publico → base
 *
 * @param {number} publico - Precio público final
 * @returns {number} Precio base calculado
 */
function calcularBaseDesdePublico(publico) {
  const baseConIva = publico / (1 + GESTION);    // quitar gestión 3%
  const base = baseConIva / (1 + IVA);           // quitar IVA 16%
  return base;
}

/**
 * Redondea precio público al múltiplo de PASO superior
 *
 * @param {number} publico - Precio público bruto
 * @returns {number} Precio redondeado hacia arriba
 */
function redondearPrecioPublico(publico) {
  if (!PASO) return publico;
  return Math.ceil(publico / PASO) * PASO;
}

/**
 * Calcula el desglose completo desde precio público (FUNCIÓN INVERSA MAESTRA)
 * Esta es la función que SIEMPRE se usa para generar el desglose final.
 * El ajuste del redondeo queda ABSORBIDO en todas las cifras.
 *
 * @param {number} publico - Precio público final (ya redondeado)
 * @returns {Desglose}
 */
function desglosarDesdePublicoFinal(publico) {
  const publicoFinal = Math.max(0, publico);

  // Calcular base desde público (inverso)
  const base = calcularBaseDesdePublico(publicoFinal);

  // Calcular componentes
  const baseConIva = base * (1 + IVA);
  const gananciaArtista = base * ARTISTA;      // 75% - YA incluye ajuste distribuido
  const comision = base * COMISION;             // 25%
  const iva = base * IVA;                       // 16% sobre base
  const gestion = baseConIva * GESTION;         // 3% sobre (base + IVA)

  return {
    ganancia: r2(gananciaArtista),
    comision: r2(comision),
    precioBase: r2(base),
    iva: r2(iva),
    gestionAdmin: r2(gestion),
    precioPublico: r2(publicoFinal),
  };
}

/**
 * Calcula el desglose completo a partir de la ganancia del artista
 * Flujo: ganancia → base → público bruto → redondeo → desglose inverso
 *
 * @param {number} ganancia - Ganancia deseada del artista (lo que quiere recibir)
 * @returns {Desglose}
 */
export function desglosar(ganancia) {
  const gananciaInput = Math.max(0, ganancia);

  // 1. Calcular base desde ganancia
  const base = gananciaInput / ARTISTA;

  // 2. Calcular precio público bruto
  const publicoBruto = calcularPrecioPublicoBruto(base);

  // 3. Redondear hacia arriba
  const publicoFinal = redondearPrecioPublico(publicoBruto);

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
 * Calcula la ganancia del artista desde el precio público
 * Usado cuando el artista edita el precio público y necesitamos actualizar el estado
 *
 * @param {number} precioPublico - Precio público final
 * @returns {number} Ganancia calculada (con decimales para exactitud)
 */
export function gananciaDesdePublico(precioPublico) {
  const publicoFinal = Math.max(0, precioPublico);

  // Calcular base desde público (inverso)
  const base = calcularBaseDesdePublico(publicoFinal);

  // La ganancia es el 75% de la base
  // ⚠️ NO redondear - mantener decimales para exactitud en recálculos
  const ganancia = base * ARTISTA;

  return ganancia;
}

/**
 * Formatea un número como moneda MXN
 * @param {number} n - Número a formatear
 * @returns {string}
 */
export const formatoMXN = (n) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n);
