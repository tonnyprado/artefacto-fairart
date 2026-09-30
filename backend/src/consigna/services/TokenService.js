import crypto from 'node:crypto';

// SRP: solo generar y hashear tokens. En BD solo se guarda el hash.
export class TokenService {
  /**
   * @returns {string}
   */
  generar() {
    return crypto.randomBytes(32).toString('base64url');   // 43 caracteres, no adivinable
  }

  /**
   * @param {string} token
   * @returns {string}
   */
  hash(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
