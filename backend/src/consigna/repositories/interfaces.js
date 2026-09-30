/**
 * @typedef {import('../domain/modelos.js').Artista} Artista
 * @typedef {import('../domain/modelos.js').Obra} Obra
 * @typedef {import('../domain/modelos.js').Invitacion} Invitacion
 * @typedef {import('../domain/modelos.js').Borrador} Borrador
 * @typedef {import('../domain/modelos.js').Acuerdo} Acuerdo
 * @typedef {import('../domain/modelos.js').AcuerdoObra} AcuerdoObra
 */

/**
 * @typedef {Object} RegistroArtistasLectura
 * @property {(edicion: string) => Promise<Array<{id: string; nombre: string; correo: string}>>} seleccionadosSinInvitacion
 * @property {(artistaId: string) => Promise<Artista | null>} porId
 * @property {(artistaId: string) => Promise<Obra[]>} obrasPostuladas
 */

/**
 * @typedef {Object} InvitacionesRepo
 * @property {(artistaId: string, edicion: string, tokenHash: string, expiraEn: Date) => Promise<void>} crear
 * @property {(tokenHash: string) => Promise<Invitacion | null>} porTokenHash
 * @property {(invitacionId: string) => Promise<void>} marcarAbierta
 * @property {(invitacionId: string) => Promise<Invitacion | null>} porId
 */

/**
 * @typedef {Object} BorradoresRepo
 * @property {(invitacionId: string) => Promise<Borrador | null>} porInvitacion
 * @property {(invitacionId: string, datos: any) => Promise<void>} guardar
 */

/**
 * @typedef {Object} AcuerdosRepo
 * @property {(invitacionId: string) => Promise<Acuerdo | null>} porInvitacion
 * @property {(invitacionId: string, artistaId: string, datos: any, pdfKey: string, firmaKey: string, datosKey: string) => Promise<string>} crear
 * @property {(acuerdoId: string) => Promise<Acuerdo | null>} porId
 * @property {(acuerdoId: string) => Promise<AcuerdoObra[]>} obrasPorAcuerdo
 */

/**
 * @typedef {Object} EventosRepo
 * @property {(invitacionId: string, tipo: string, payload: any | null, ip: string | null) => Promise<void>} registrar
 */
