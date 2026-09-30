/**
 * @typedef {import('../services/InvitacionService.js').InvitacionService} InvitacionService
 * @typedef {import('../services/ConsignaService.js').ConsignaService} ConsignaService
 */

import { validarToken, validarDatosBorrador, validarDatosAcuerdo, extraerIP } from './validadores.js';

/**
 * Controlador HTTP para las rutas públicas de consigna.
 * Maneja las requests de los artistas.
 */
export class ConsignaController {
  /**
   * @param {InvitacionService} invitaciones
   * @param {ConsignaService} consigna
   */
  constructor(invitaciones, consigna) {
    this.invitaciones = invitaciones;
    this.consigna = consigna;
  }

  /**
   * GET /api/consigna/:token/contexto
   * Obtiene datos iniciales: artista, obras, borrador guardado
   */
  async obtenerContexto(req, res, next) {
    try {
      const { token } = req.params;
      validarToken(token);

      const ip = extraerIP(req);
      const inv = await this.invitaciones.resolver(token, ip);
      const contexto = await this.consigna.contexto(inv);

      res.json({ success: true, data: contexto });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/consigna/:token/borrador
   * Guarda el progreso parcial del formulario
   */
  async guardarBorrador(req, res, next) {
    try {
      const { token } = req.params;
      const datos = req.body;

      validarToken(token);
      validarDatosBorrador(datos);

      const ip = extraerIP(req);
      const inv = await this.invitaciones.resolver(token, ip);
      await this.consigna.guardarBorrador(inv, datos);

      res.json({ success: true, message: 'Borrador guardado' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/consigna/:token/vista-previa
   * Genera PDF de vista previa (sin guardar)
   */
  async vistaPrevia(req, res, next) {
    try {
      const { token } = req.params;
      const datos = req.body;

      validarToken(token);

      const ip = extraerIP(req);
      const inv = await this.invitaciones.resolver(token, ip);
      const pdf = await this.consigna.vistaPrevia(inv, datos);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="Vista-Previa.pdf"');
      res.send(pdf);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/consigna/:token/enviar
   * Envía el acuerdo final firmado
   */
  async enviarAcuerdo(req, res, next) {
    try {
      const { token } = req.params;
      const datos = req.body;

      validarToken(token);
      validarDatosAcuerdo(datos);

      const ip = extraerIP(req);
      const inv = await this.invitaciones.resolver(token, ip);

      const resultado = await this.consigna.enviar(inv, datos, {
        ip,
        userAgent: req.headers['user-agent'] || null,
      });

      res.json({ success: true, data: resultado });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/consigna/:token/pdf-enviado
   * Descarga el PDF del acuerdo ya firmado
   */
  async descargarPdfEnviado(req, res, next) {
    try {
      const { token } = req.params;
      validarToken(token);

      const ip = extraerIP(req);
      const inv = await this.invitaciones.resolver(token, ip);
      const url = await this.consigna.urlPdfEnviado(inv);

      res.json({ success: true, data: { url } });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/consigna/:token/subir-constancia
   * Genera URL presignada para subir constancia fiscal a S3
   */
  async subirConstancia(req, res, next) {
    try {
      const { token } = req.params;
      const { nombre, tipo, tamano } = req.body;

      validarToken(token);

      const ip = extraerIP(req);
      const inv = await this.invitaciones.resolver(token, ip);

      const resultado = await this.consigna.urlSubidaConstancia(inv, nombre, tipo, tamano);

      res.json({ success: true, data: resultado });
    } catch (error) {
      next(error);
    }
  }
}
