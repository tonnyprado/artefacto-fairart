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
      const { datos } = req.body;

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
   * Sube constancia fiscal a S3 y devuelve la key
   */
  async subirConstancia(req, res, next) {
    try {
      const { token } = req.params;
      const { archivo, contentType, nombreArchivo } = req.body;

      validarToken(token);

      if (!archivo || !contentType) {
        return res.status(400).json({
          success: false,
          error: 'Faltan datos del archivo',
        });
      }

      const ip = extraerIP(req);
      const inv = await this.invitaciones.resolver(token, ip);

      // Validar que sea PDF
      if (contentType !== 'application/pdf') {
        return res.status(400).json({
          success: false,
          error: 'Solo se permiten archivos PDF',
        });
      }

      // El archivo viene en base64
      const buffer = Buffer.from(archivo, 'base64');

      // Validar tamaño (máximo 10MB)
      if (buffer.length > 10 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          error: 'El archivo es demasiado grande (máximo 10MB)',
        });
      }

      const key = `constancias/${inv.artistaId}/${Date.now()}-${nombreArchivo || 'constancia.pdf'}`;
      await this.consigna.archivos.subir(key, buffer, contentType);

      res.json({ success: true, data: { key } });
    } catch (error) {
      next(error);
    }
  }
}
