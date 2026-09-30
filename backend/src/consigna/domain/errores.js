export class AppError extends Error {
  /**
   * @param {number} status
   * @param {string} code
   * @param {string} message
   */
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

/**
 * @param {string} [m='Liga no válida']
 * @returns {AppError}
 */
export const NoEncontrado = (m = 'Liga no válida') => new AppError(404, 'NO_ENCONTRADO', m);

/**
 * @param {string} [m='Esta liga expiró. Escríbenos para generar una nueva.']
 * @returns {AppError}
 */
export const Expirado = (m = 'Esta liga expiró. Escríbenos para generar una nueva.') => new AppError(410, 'EXPIRADO', m);

/**
 * @param {string} [m='Este acuerdo ya fue enviado.']
 * @returns {AppError}
 */
export const YaEnviado = (m = 'Este acuerdo ya fue enviado.') => new AppError(409, 'YA_ENVIADO', m);

/**
 * @param {string} m
 * @returns {AppError}
 */
export const Invalido = (m) => new AppError(422, 'INVALIDO', m);
