/**
 * @typedef {import('../repositories/interfaces.js').InvitacionesRepo} InvitacionesRepo
 * @typedef {import('../repositories/interfaces.js').RegistroArtistasLectura} RegistroArtistasLectura
 * @typedef {import('../repositories/interfaces.js').EventosRepo} EventosRepo
 * @typedef {import('./TokenService.js').TokenService} TokenService
 * @typedef {import('../domain/modelos.js').Invitacion} Invitacion
 */

import { NoEncontrado, Expirado } from '../domain/errores.js';

// SRP: ciclo de vida de la liga personalizada.
export class InvitacionService {
  /**
   * @param {InvitacionesRepo} invitaciones
   * @param {RegistroArtistasLectura} registro
   * @param {EventosRepo} eventos
   * @param {TokenService} tokens
   * @param {string} baseUrl
   * @param {number} diasVigencia
   */
  constructor(invitaciones, registro, eventos, tokens, baseUrl, diasVigencia) {
    this.invitaciones = invitaciones;
    this.registro = registro;
    this.eventos = eventos;
    this.tokens = tokens;
    this.baseUrl = baseUrl;
    this.diasVigencia = diasVigencia;
  }

  /**
   * @param {string} token
   * @param {string | null} ip
   * @returns {Promise<Invitacion>}
   */
  async resolver(token, ip) {
    if (!/^[A-Za-z0-9_-]{30,64}$/.test(token)) throw NoEncontrado();
    const inv = await this.invitaciones.porTokenHash(this.tokens.hash(token));
    if (!inv || inv.revocada) throw NoEncontrado();
    if (inv.expiraEn.getTime() < Date.now()) throw Expirado();
    if (!inv.abiertaEn) {
      await this.invitaciones.marcarAbierta(inv.id);
      await this.eventos.registrar(inv.id, 'abierta', null, ip);
    }
    return inv;
  }

  /**
   * Crea ligas para seleccionados que aún no tienen. Devuelve las URLs (mostrar UNA vez).
   * @param {string} edicion
   * @returns {Promise<{artistaId: string; nombre: string; correo: string; url: string}[]>}
   */
  async crearPendientes(edicion) {
    const artistas = await this.registro.seleccionadosSinInvitacion(edicion);
    const expira = new Date(Date.now() + this.diasVigencia * 86400000);
    const out = [];
    for (const a of artistas) {
      const token = this.tokens.generar();
      await this.invitaciones.crear(a.id, edicion, this.tokens.hash(token), expira);
      out.push({ artistaId: a.id, nombre: a.nombre, correo: a.correo, url: `${this.baseUrl}/${token}` });
    }
    return out;
  }
}
