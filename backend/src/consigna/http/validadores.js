import { Invalido } from '../domain/errores.js';

/**
 * Valida que el token tenga el formato correcto
 * @param {string} token
 */
export function validarToken(token) {
  if (!token || typeof token !== 'string') {
    throw Invalido('Token inválido');
  }
  if (!/^[A-Za-z0-9_-]{30,64}$/.test(token)) {
    throw Invalido('Formato de token inválido');
  }
}

/**
 * Valida los datos del borrador
 * @param {any} datos
 */
export function validarDatosBorrador(datos) {
  if (!datos || typeof datos !== 'object') {
    throw Invalido('Datos de borrador inválidos');
  }
}

/**
 * Valida los datos del acuerdo antes de enviar
 * @param {any} datos
 */
export function validarDatosAcuerdo(datos) {
  if (!datos || typeof datos !== 'object') {
    throw Invalido('Datos de acuerdo inválidos');
  }

  if (!datos.artista || !datos.artista.nombre) {
    throw Invalido('Faltan datos del artista');
  }

  if (!Array.isArray(datos.obras) || datos.obras.length === 0) {
    throw Invalido('Debe incluir al menos una obra');
  }

  if (!datos.firma || !datos.firma.dataUrl) {
    throw Invalido('Falta la firma digital');
  }

  if (!datos.aceptaTerminos) {
    throw Invalido('Debe aceptar los términos y condiciones');
  }
}

/**
 * Valida los datos de una obra en el acuerdo
 * @param {any} obra
 * @param {number} index
 */
export function validarObra(obra, index) {
  if (!obra.titulo || typeof obra.titulo !== 'string') {
    throw Invalido(`Obra ${index + 1}: Falta el título`);
  }

  if (typeof obra.ganancia !== 'number' || obra.ganancia < 0) {
    throw Invalido(`Obra ${index + 1}: Ganancia inválida`);
  }
}

/**
 * Extrae la IP del request
 * @param {any} req
 * @returns {string | null}
 */
export function extraerIP(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    null
  );
}
