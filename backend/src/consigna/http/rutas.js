import { Router } from 'express';
import { ConsignaController } from './controller.js';

/**
 * Crea las rutas Express para el módulo de consigna.
 * @param {ConsignaController} controller
 * @returns {Router}
 */
export function rutasConsigna(controller) {
  const router = Router();

  // Rate limiting básico (puede mejorarse con express-rate-limit)
  const requestCounts = new Map();
  const RATE_LIMIT = 60; // requests por minuto
  const RATE_WINDOW = 60000; // 1 minuto

  router.use((req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.connection?.remoteAddress;
    const now = Date.now();

    if (!requestCounts.has(ip)) {
      requestCounts.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
      return next();
    }

    const record = requestCounts.get(ip);
    if (now > record.resetAt) {
      record.count = 1;
      record.resetAt = now + RATE_WINDOW;
      return next();
    }

    if (record.count >= RATE_LIMIT) {
      return res.status(429).json({
        error: 'RATE_LIMIT',
        message: 'Demasiadas solicitudes. Intenta más tarde.',
      });
    }

    record.count++;
    next();
  });

  // Rutas públicas (no requieren autenticación)
  router.get('/:token/contexto', (req, res, next) =>
    controller.obtenerContexto(req, res, next)
  );

  router.post('/:token/borrador', (req, res, next) =>
    controller.guardarBorrador(req, res, next)
  );

  router.post('/:token/vista-previa', (req, res, next) =>
    controller.vistaPrevia(req, res, next)
  );

  router.post('/:token/enviar', (req, res, next) =>
    controller.enviarAcuerdo(req, res, next)
  );

  router.get('/:token/pdf-enviado', (req, res, next) =>
    controller.descargarPdfEnviado(req, res, next)
  );

  router.post('/:token/subir-constancia', (req, res, next) =>
    controller.subirConstancia(req, res, next)
  );

  // Limpiar rate limiting cada hora
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of requestCounts.entries()) {
      if (now > record.resetAt + 3600000) {
        requestCounts.delete(ip);
      }
    }
  }, 3600000);

  return router;
}
