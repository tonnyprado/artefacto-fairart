// DIP: los hooks dependen de esta interfaz; en tests se inyecta un mock.
/**
 * @typedef {Object} ConsignaApi
 * @property {(token: string) => Promise<any>} contexto
 * @property {(token: string, b: any) => Promise<void>} guardarBorrador
 * @property {(token: string, archivo: File) => Promise<{key: string; nombre: string}>} subirConstancia
 * @property {(token: string, datos: any) => Promise<Blob>} vistaPrevia
 * @property {(token: string, datos: any) => Promise<any>} enviar
 * @property {(token: string) => Promise<string>} urlPdf
 */

export class ErrorApi extends Error {
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

export class HttpConsignaApi {
  /**
   * @param {string} [base]
   */
  constructor(base) {
    this.base = base || (process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL + '/consigna' : '/api/consigna');
  }

  /**
   * @private
   * @param {string} url
   * @param {RequestInit} [init]
   * @param {'json' | 'blob' | 'none'} [tipo='json']
   * @returns {Promise<any>}
   */
  async req(url, init, tipo = 'json') {
    const r = await fetch(this.base + url, {
      ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    });
    if (!r.ok) {
      const e = await r.json().catch(() => ({}));
      throw new ErrorApi(r.status, e.code ?? 'ERROR', e.message ?? 'Algo salió mal.');
    }
    if (tipo === 'none') return undefined;
    return (tipo === 'blob' ? r.blob() : r.json());
  }

  /**
   * @param {string} token
   * @returns {Promise<any>}
   */
  async contexto(token) {
    const res = await this.req(`/${encodeURIComponent(token)}/contexto`);
    return res.data;
  }

  /**
   * @param {string} token
   * @param {any} b
   * @returns {Promise<void>}
   */
  guardarBorrador(token, b) {
    return this.req(`/${encodeURIComponent(token)}/borrador`, { method: 'POST', body: JSON.stringify(b) }, 'none');
  }

  /**
   * @param {string} token
   * @param {File} archivo
   * @returns {Promise<{key: string; nombre: string}>}
   */
  async subirConstancia(token, archivo) {
    const res = await this.req(`/${encodeURIComponent(token)}/subir-constancia`, {
      method: 'POST', body: JSON.stringify({ nombre: archivo.name, tipo: archivo.type, tamano: archivo.size }),
    });
    const { uploadUrl, key } = res.data;
    const s3 = await fetch(uploadUrl, {
      method: 'PUT', body: archivo,
      headers: { 'Content-Type': archivo.type, 'x-amz-server-side-encryption': 'AES256' },
    });
    if (!s3.ok) throw new ErrorApi(s3.status, 'S3', 'No pudimos subir el archivo. Intenta de nuevo.');
    return { key, nombre: archivo.name };
  }

  /**
   * @param {string} token
   * @param {any} datos
   * @returns {Promise<Blob>}
   */
  vistaPrevia(token, datos) {
    return this.req(`/${encodeURIComponent(token)}/vista-previa`, { method: 'POST', body: JSON.stringify(datos) }, 'blob');
  }

  /**
   * @param {string} token
   * @param {any} datos
   * @returns {Promise<any>}
   */
  async enviar(token, datos) {
    const res = await this.req(`/${encodeURIComponent(token)}/enviar`, { method: 'POST', body: JSON.stringify(datos) });
    return res.data;
  }

  /**
   * @param {string} token
   * @returns {Promise<string>}
   */
  async urlPdf(token) {
    const res = await this.req(`/${encodeURIComponent(token)}/pdf-enviado`);
    return res.data.url;
  }
}
