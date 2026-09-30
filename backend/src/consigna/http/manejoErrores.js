import { AppError } from '../domain/errores.js';

/**
 * Middleware de manejo de errores para el módulo de consigna.
 * Debe agregarse DESPUÉS de las rutas de consigna.
 */
export function manejoErrores(err, req, res, next) {
  // Si es un AppError conocido, enviar con su status
  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: err.code,
      message: err.message,
    });
  }

  // Log de errores no manejados
  console.error('[Consigna Error]', err);

  // Error genérico 500
  res.status(500).json({
    error: 'ERROR_INTERNO',
    message: 'Ocurrió un error inesperado',
  });
}
