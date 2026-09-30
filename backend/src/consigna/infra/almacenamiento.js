import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// OCP/DIP: los servicios dependen de esta interfaz, no de S3.

/**
 * @typedef {Object} Almacenamiento
 * @property {(key: string, cuerpo: Buffer, contentType: string) => Promise<void>} subir
 * @property {(key: string) => Promise<Buffer>} leer
 * @property {(key: string, segundos?: number, nombreArchivo?: string) => Promise<string>} urlDescarga
 * @property {(key: string, contentType: string, segundos?: number) => Promise<string>} urlSubida
 */

export class S3Almacenamiento {
  /**
   * @param {S3Client} s3
   * @param {string} bucket
   * @param {string} [prefijo='']
   */
  constructor(s3, bucket, prefijo = '') {
    this.s3 = s3;
    this.bucket = bucket;
    this.prefijo = prefijo;
  }

  /**
   * @private
   * @param {string} key
   * @returns {string}
   */
  k(key) {
    return key.startsWith('assets/') ? key : this.prefijo + key;
  }

  /**
   * @param {string} key
   * @param {Buffer} cuerpo
   * @param {string} contentType
   * @returns {Promise<void>}
   */
  async subir(key, cuerpo, contentType) {
    await this.s3.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: this.k(key),
      Body: cuerpo,
      ContentType: contentType,
      ServerSideEncryption: 'AES256',
    }));
  }

  /**
   * @param {string} key
   * @returns {Promise<Buffer>}
   */
  async leer(key) {
    const r = await this.s3.send(new GetObjectCommand({ Bucket: this.bucket, Key: this.k(key) }));
    return Buffer.from(await r.Body.transformToByteArray());
  }

  /**
   * @param {string} key
   * @param {number} [segundos=900]
   * @param {string} [nombreArchivo]
   * @returns {Promise<string>}
   */
  urlDescarga(key, segundos = 900, nombreArchivo) {
    return getSignedUrl(this.s3, new GetObjectCommand({
      Bucket: this.bucket,
      Key: this.k(key),
      ResponseContentDisposition: nombreArchivo ? `attachment; filename="${nombreArchivo}"` : undefined,
    }), { expiresIn: segundos });
  }

  /**
   * @param {string} key
   * @param {string} contentType
   * @param {number} [segundos=600]
   * @returns {Promise<string>}
   */
  urlSubida(key, contentType, segundos = 600) {
    return getSignedUrl(this.s3, new PutObjectCommand({
      Bucket: this.bucket,
      Key: this.k(key),
      ContentType: contentType,
      ServerSideEncryption: 'AES256',
    }), { expiresIn: segundos });
  }
}
