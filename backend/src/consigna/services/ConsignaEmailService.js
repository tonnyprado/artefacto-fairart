/**
 * Servicio para enviar emails específicos de consigna usando el sistema Brevo existente.
 * Integra con el email.service.js de Benito-web.
 */

import { sendEmailWithTemplate, sendEmail } from '../../services/email.service.js';

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
    const edicion = process.env.EDICION_SUFIJO || 'AF2';
    const diasVigencia = process.env.INVITACION_DIAS_VIGENCIA || '21';
    const nombrePila = artista.nombrePila || artista.nombre.split(' ')[0];

    // Si hay template de Brevo configurado, usarlo
    if (templateId) {
      return sendEmailWithTemplate({
        to: artista.correo,
        toName: artista.nombre,
        templateId,
        params: {
          nombre: nombrePila,
          folio: artista.folio,
          edicion,
          link_consigna: linkConsigna,
          dias_vigencia: diasVigencia,
        },
      });
    }

    // Fallback: HTML por defecto
    console.log('📧 Usando template HTML por defecto (Brevo no configurado)')

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Segoe UI', Tahoma, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #B83030, #8B1E1E); color: white; padding: 40px 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 32px; font-weight: 700; letter-spacing: 1px; }
          .header p { margin: 10px 0 0; opacity: 0.95; font-size: 16px; }
          .content { padding: 40px 30px; }
          .greeting { font-size: 20px; color: #141210; margin: 0 0 20px; }
          .message { font-size: 16px; line-height: 1.8; color: #444; margin: 0 0 25px; }
          .highlight-box { background: linear-gradient(135deg, #F4EDE4, #E8DED1); border-left: 4px solid #B83030; padding: 25px; border-radius: 8px; margin: 25px 0; }
          .folio { font-family: 'Courier New', monospace; font-size: 18px; font-weight: 600; color: #B83030; }
          .cta-button { display: inline-block; background: #B83030; color: white !important; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 18px; font-weight: 600; margin: 30px 0; transition: background 0.3s; }
          .cta-button:hover { background: #8B1E1E; }
          .info-list { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 25px 0; }
          .info-item { display: flex; margin-bottom: 12px; font-size: 15px; }
          .info-item:last-child { margin-bottom: 0; }
          .info-icon { color: #B83030; margin-right: 10px; font-weight: 600; }
          .warning-box { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 20px; border-radius: 8px; margin: 25px 0; }
          .warning-box strong { color: #B45309; }
          .footer { background: #f5f5f5; padding: 25px 30px; text-align: center; font-size: 13px; color: #666; }
          .footer a { color: #B83030; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <h1>ARTE FACTO ${edicion.toUpperCase()}</h1>
            <p>Feria de Arte Contemporáneo</p>
          </div>

          <!-- Content -->
          <div class="content">
            <p class="greeting">¡Felicidades ${nombrePila}!</p>

            <p class="message">
              Tu obra ha sido <strong>seleccionada</strong> para participar en ARTE FACTO ${edicion.toUpperCase()}.
              Estamos muy emocionados de tenerte como parte de esta edición.
            </p>

            <div class="highlight-box">
              <p style="margin: 0 0 8px; font-size: 14px; color: #666;">Tu folio de registro:</p>
              <p class="folio" style="margin: 0; font-size: 24px;">${artista.folio}</p>
            </div>

            <p class="message">
              Para formalizar tu participación, necesitamos que completes tu <strong>hoja de consignación</strong>
              con la información de tus obras y datos fiscales.
            </p>

            <center>
              <a href="${linkConsigna}" class="cta-button">
                COMPLETAR HOJA DE CONSIGNACIÓN
              </a>
            </center>

            <div class="info-list">
              <div class="info-item">
                <span class="info-icon">📋</span>
                <span>Tendrás <strong>${diasVigencia} días</strong> para completar el formulario</span>
              </div>
              <div class="info-item">
                <span class="info-icon">🎨</span>
                <span>Podrás registrar tus obras y dimensiones</span>
              </div>
              <div class="info-item">
                <span class="info-icon">📄</span>
                <span>Necesitarás tu Constancia de Situación Fiscal</span>
              </div>
              <div class="info-item">
                <span class="info-icon">✍️</span>
                <span>Firmarás digitalmente tu acuerdo de consignación</span>
              </div>
            </div>

            <div class="warning-box">
              <strong>⚠️ Importante:</strong> Este enlace es único y personal.
              Guarda este correo para acceder a tu formulario en cualquier momento durante los próximos ${diasVigencia} días.
            </div>

            <p class="message" style="font-size: 14px; color: #666;">
              Si tienes alguna duda, no dudes en contactarnos a
              <a href="mailto:curatorial@arte-facto.mx" style="color: #B83030; text-decoration: none;">curatorial@arte-facto.mx</a>
            </p>
          </div>

          <!-- Footer -->
          <div class="footer">
            <p style="margin: 0 0 10px;">
              <strong>ARTE FACTO ${edicion.toUpperCase()}</strong><br>
              Feria de Arte Contemporáneo
            </p>
            <p style="margin: 0; opacity: 0.8;">
              Este es un correo automático. Por favor no respondas a este mensaje.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
¡Felicidades ${nombrePila}!

Tu obra ha sido seleccionada para participar en ARTE FACTO ${edicion.toUpperCase()}.

Folio: ${artista.folio}

Para formalizar tu participación, completa tu hoja de consignación en:
${linkConsigna}

Tienes ${diasVigencia} días para completar el formulario.

Este enlace es único y personal. Guarda este correo para acceder en cualquier momento.

¿Dudas? Escríbenos a curatorial@arte-facto.mx

---
ARTE FACTO ${edicion.toUpperCase()}
Feria de Arte Contemporáneo
    `;

    return sendEmail({
      to: artista.correo,
      toName: artista.nombre,
      subject: `🎨 ¡Felicidades! Has sido seleccionado para ARTE FACTO ${edicion.toUpperCase()} - Folio ${artista.folio}`,
      htmlContent,
      textContent
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
