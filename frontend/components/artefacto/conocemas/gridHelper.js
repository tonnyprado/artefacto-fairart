/**
 * Helper para posicionar elementos en la retícula CSS Grid
 * @param {number} c1 - Columna inicial
 * @param {number} c2 - Columna final
 * @param {number} r1 - Fila inicial
 * @param {number} r2 - Fila final
 * @returns {Object} Objeto con gridColumn y gridRow
 */
export const g = (c1, c2, r1, r2) => ({
  gridColumn: `${c1}/${c2}`,
  gridRow: `${r1}/${r2}`,
});

export default g;
