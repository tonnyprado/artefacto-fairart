// ⚠ Mantener IDÉNTICO en backend/src/consigna/shared y frontend/features/consigna/shared.
// El backend SIEMPRE recalcula: nunca confiar en montos enviados por el cliente.

export const ARTISTA = 0.75;        // 75% para el artista
export const COMISION = 0.25;       // 25% comisión ARTE FACTO
export const IVA = 0.16;            // 16% IVA
export const GESTION = 0.03;        // 3% gestión administrativa
export const PASO = 100;            // redondeo al múltiplo de 100

/**
 * @typedef {Object} Desglose
 * @property {number} ganancia - Lo que recibe el artista (75% de la base)
 * @property {number} comision - 25% comisión ARTE FACTO
 * @property {number} precioVenta - Base (100%) = ganancia + comisión
 * @property {number} iva - 16% sobre precio de venta
 * @property {number} gestionAdmin - 3% sobre precio de venta
 * @property {number} precioPublico - Precio último que ve el comprador (cerrado a múltiplo de 100)
 */

const r2 = (n) => Math.round(n * 100) / 100;

/**
 * Calcula el desglose completo de precios a partir de la ganancia del artista
 * @param {number} ganancia - Ganancia deseada del artista (lo que quiere recibir)
 * @returns {Desglose}
 */
export function desglosar(ganancia) {
  const g = Math.max(0, ganancia);

  // PASO 1: Obtener la base (precio de venta = 100%)
  const base = g / ARTISTA;  // si captura lo que quiere recibir

  // PASO 2: Total = base + IVA + gestión
  const total = base * (1 + IVA + GESTION);  // = base * 1.19

  // PASO 3: Cerrar hacia arriba → precio último
  const ultimo = PASO ? Math.ceil(total / PASO) * PASO : total;

  // DESGLOSE — SOLO PARA MOSTRAR EN PANTALLA
  // ⚠️ NO sumar estas líneas al total: ya están dentro de base * 1.19
  const parteArtista = base * ARTISTA;
  const parteArtefacto = base * COMISION;
  const iva = base * IVA;
  const gestion = base * GESTION;

  return {
    ganancia: r2(parteArtista),
    comision: r2(parteArtefacto),
    ajuste: r2(ultimo - total),  // diferencia por redondeo
    precioVenta: r2(base),
    iva: r2(iva),
    gestionAdmin: r2(gestion),
    precioPublico: r2(ultimo),
  };
}

/**
 * Cuando el artista edita el precio público, calculamos el desglose inverso
 * SIN aplicar redondeo - el precio público YA es el valor final
 * @param {number} precioPublico - Precio último deseado (exacto, sin redondear)
 * @returns {Desglose}
 */
export function desglosarDesdePublico(precioPublico) {
  const ultimo = Math.max(0, precioPublico);

  // PASO 1: Obtener la base desde el precio público (cálculo inverso)
  // Según spec: base = valor / 1.19 (si captura el precio último)
  const base = ultimo / (1 + IVA + GESTION);

  // DESGLOSE — SOLO PARA MOSTRAR EN PANTALLA
  const parteArtista = base * ARTISTA;
  const parteArtefacto = base * COMISION;
  const iva = base * IVA;
  const gestion = base * GESTION;
  const total = base * (1 + IVA + GESTION);

  // ⚠️ NO redondear el precio público - es el valor exacto que ingresó el usuario
  // El ajuste es 0 porque no estamos redondeando hacia arriba
  return {
    ganancia: r2(parteArtista),
    comision: r2(parteArtefacto),
    ajuste: 0,  // sin ajuste cuando se edita desde precio público
    precioVenta: r2(base),
    iva: r2(iva),
    gestionAdmin: r2(gestion),
    precioPublico: r2(ultimo),
  };
}

/**
 * Cuando el artista edita el precio público, despejamos su ganancia
 * @param {number} precioPublico - Precio último deseado
 * @returns {number} Ganancia calculada (CON decimales para mantener exactitud)
 */
export function gananciaDesdePublico(precioPublico) {
  const ultimo = Math.max(0, precioPublico);

  // Según spec: base = valor / 1.19 (si captura el precio último)
  const base = ultimo / (1 + IVA + GESTION);

  // La ganancia es el 75% de la base
  // ⚠️ NO redondear - mantener decimales para que al recalcular llegue al mismo precio
  const ganancia = base * ARTISTA;

  return ganancia;  // retornar con decimales, no redondear
}

/**
 * Formatea un número como moneda MXN
 * @param {number} n - Número a formatear
 * @returns {string}
 */
export const formatoMXN = (n) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n);
