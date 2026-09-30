/**
 * Notificadores de email para el sistema de consignación
 * Usa Brevo (anteriormente Sendinblue) en producción
 */

/**
 * @typedef {Object} Adjunto
 * @property {string} nombre
 * @property {Buffer} contenido
 * @property {string} tipo
 */

/**
 * @typedef {Object} Correo
 * @property {string[]} para
 * @property {string} asunto
 * @property {string} texto
 * @property {Adjunto[]} [adjuntos]
 */

/**
 * @typedef {Object} Notificador
 * @property {(c: Correo) => Promise<void>} enviar
 */

/**
 * Notificador con Brevo (reemplaza SES del original)
 * Reutiliza la configuración existente de Brevo
 */
export class BrevoNotificador {
  /**
   * @param {string} brevoApiKey - API key de Brevo
   * @param {string} remitente - Email del remitente
   */
  constructor(brevoApiKey, remitente) {
    this.apiKey = brevoApiKey;
    this.remitente = remitente;
    this.apiUrl = 'https://api.brevo.com/v3/smtp/email';
  }

  /**
   * @param {Correo} correo
   * @returns {Promise<void>}
   */
  async enviar(correo) {
    const attachments = (correo.adjuntos || []).map(adj => ({
      name: adj.nombre,
      content: adj.contenido.toString('base64')
    }));

    const payload = {
      sender: { email: this.remitente },
      to: correo.para.map(email => ({ email })),
      subject: correo.asunto,
      textContent: correo.texto,
      attachment: attachments
    };

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': this.apiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Brevo error: ${error.message || 'Unknown error'}`);
    }

    console.log('✅ Email enviado:', correo.para.join(', '));
    return await response.json();
  }
}

/**
 * Para desarrollo local: imprime en consola en lugar de enviar
 */
export class ConsolaNotificador {
  /**
   * @param {Correo} c
   * @returns {Promise<void>}
   */
  async enviar(c) {
    console.log('[correo dev]', c.para, c.asunto, (c.adjuntos ?? []).map(a => a.nombre));
  }
}
