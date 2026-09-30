/**
 * Servicio para enviar emails específicos de consigna usando el sistema Brevo existente.
 * Integra con el email.service.js de Benito-web.
 */

import { sendEmailWithTemplate } from '../../services/email.service.js';

export class ConsignaEmailService {
  /**
   * Envía email de invitación a un artista aceptado
   * @param {Object} artista
   * @param {string} artista.nombre
   * @param {string} artista.nombrePila
   * @param {string} artista.correo
   * @param {string} artista.folio
   * @param {string} linkConsigna - URL completa con el token
   * @returns {Promise<void>}
   */
  async enviarInvitacionAceptado(artista, linkConsigna) {
    const templateId = parseInt(process.env.BREVO_TEMPLATE_CONSIGNA_INVITACION || '0', 10);

    if (!templateId) {
      throw new Error('BREVO_TEMPLATE_CONSIGNA_INVITACION no configurado');
    }

    return sendEmailWithTemplate({
      to: artista.correo,
      toName: artista.nombre,
      templateId,
      params: {
        nombre: artista.nombrePila || artista.nombre.split(' ')[0],
        folio: artista.folio,
        edicion: process.env.EDICION_SUFIJO || 'AF2',
        link_consigna: linkConsigna,
        dias_vigencia: process.env.INVITACION_DIAS_VIGENCIA || '21',
      },
    });
  }

  /**
   * Envía email de rechazo a un artista
   * @param {Object} artista
   * @param {string} artista.nombre
   * @param {string} artista.nombrePila
   * @param {string} artista.correo
   * @returns {Promise<void>}
   */
  async enviarRechazo(artista) {
    const templateId = parseInt(process.env.BREVO_TEMPLATE_CONSIGNA_RECHAZO || '0', 10);

    if (!templateId) {
      throw new Error('BREVO_TEMPLATE_CONSIGNA_RECHAZO no configurado');
    }

    return sendEmailWithTemplate({
      to: artista.correo,
      toName: artista.nombre,
      templateId,
      params: {
        nombre: artista.nombrePila || artista.nombre.split(' ')[0],
        edicion: process.env.EDICION_SUFIJO || 'AF2',
      },
    });
  }

  /**
   * Envía email con el acuerdo firmado adjunto
   * @param {Object} artista
   * @param {string} artista.nombre
   * @param {string} artista.nombrePila
   * @param {string} artista.correo
   * @param {string} pdfUrl - URL prefirmada del PDF en S3
   * @returns {Promise<void>}
   */
  async enviarAcuerdoFirmado(artista, pdfUrl) {
    const templateId = parseInt(process.env.BREVO_TEMPLATE_CONSIGNA_ACUERDO || '0', 10);

    if (!templateId) {
      throw new Error('BREVO_TEMPLATE_CONSIGNA_ACUERDO no configurado');
    }

    return sendEmailWithTemplate({
      to: artista.correo,
      toName: artista.nombre,
      templateId,
      params: {
        nombre: artista.nombrePila || artista.nombre.split(' ')[0],
        edicion: process.env.EDICION_SUFIJO || 'AF2',
        pdf_url: pdfUrl,
        concepto_pago: process.env.PAGO_CONCEPTO || '',
        clabe: process.env.PAGO_CLABE || '',
      },
    });
  }

  /**
   * Reenvía la invitación a un artista
   * @param {Object} artista
   * @param {string} linkConsigna
   * @returns {Promise<void>}
   */
  async reenviarInvitacion(artista, linkConsigna) {
    return this.enviarInvitacionAceptado(artista, linkConsigna);
  }
}
