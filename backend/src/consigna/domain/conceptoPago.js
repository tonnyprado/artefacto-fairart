/**
 * "PAQUETE MARIA RUIZ AF2" — mayúsculas, sin acentos (compatibilidad SPEI).
 * @param {string} nombrePila
 * @param {string} apellido
 * @param {string} sufijo
 * @returns {string}
 */
export function conceptoPago(nombrePila, apellido, sufijo) {
  return ['PAQUETE', nombrePila.split(' ')[0], apellido.split(' ')[0], sufijo]
    .filter(Boolean)
    .join(' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9 ]/g, '')
    .toUpperCase()
    .slice(0, 40);
}
