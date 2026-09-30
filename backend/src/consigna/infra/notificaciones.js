import { SESClient, SendRawEmailCommand } from '@aws-sdk/client-ses';

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

export class SesNotificador {
  /**
   * @param {SESClient} ses
   * @param {string} remitente
   */
  constructor(ses, remitente) {
    this.ses = ses;
    this.remitente = remitente;
  }

  /**
   * @param {Correo} c
   * @returns {Promise<void>}
   */
  async enviar(c) {
    const limite = 'af-' + Date.now().toString(36);
    const partes = [
      `From: ${this.remitente}`,
      `To: ${c.para.join(', ')}`,
      `Subject: =?UTF-8?B?${Buffer.from(c.asunto).toString('base64')}?=`,
      'MIME-Version: 1.0',
      `Content-Type: multipart/mixed; boundary="${limite}"`,
      '',
      `--${limite}`,
      'Content-Type: text/plain; charset=UTF-8',
      'Content-Transfer-Encoding: base64',
      '',
      Buffer.from(c.texto).toString('base64'),
    ];
    for (const a of c.adjuntos ?? []) {
      partes.push(
        `--${limite}`,
        `Content-Type: ${a.tipo}; name="${a.nombre}"`,
        'Content-Transfer-Encoding: base64',
        `Content-Disposition: attachment; filename="${a.nombre}"`,
        '',
        a.contenido.toString('base64')
      );
    }
    partes.push(`--${limite}--`);
    await this.ses.send(new SendRawEmailCommand({ RawMessage: { Data: Buffer.from(partes.join('\r\n')) } }));
  }
}

/** Para desarrollo local: imprime en consola en lugar de enviar. */
export class ConsolaNotificador {
  /**
   * @param {Correo} c
   * @returns {Promise<void>}
   */
  async enviar(c) {
    console.log('[correo]', c.para, c.asunto, (c.adjuntos ?? []).map(a => a.nombre));
  }
}
