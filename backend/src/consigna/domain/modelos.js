/**
 * @typedef {import('../shared/contratos.js').ArtistaDTO} ArtistaDTO
 * @typedef {import('../shared/contratos.js').EstadoFiscal} EstadoFiscal
 * @typedef {import('../shared/contratos.js').ObraDTO} ObraDTO
 * @typedef {import('../shared/precios.js').Desglose} Desglose
 */

/**
 * @typedef {ArtistaDTO & { apellido: string }} ArtistaRegistro
 */

/**
 * @typedef {ObraDTO} ObraRegistro
 */

/**
 * @typedef {Object} Invitacion
 * @property {string} id
 * @property {string} artistaId
 * @property {string} edicion
 * @property {Date} expiraEn
 * @property {boolean} revocada
 * @property {Date | null} abiertaEn
 */

/**
 * @typedef {Object} ObraAcordada
 * @property {string} obraId
 * @property {string} titulo
 * @property {string} tecnica
 * @property {string} medida
 * @property {number} gananciaOriginal
 * @property {Desglose} desglose
 */

/**
 * @typedef {Object} AcuerdoNuevo
 * @property {string} invitacionId
 * @property {string} artistaId
 * @property {string} folio
 * @property {string} versionAcuerdo
 * @property {ArtistaDTO} snapshotArtista
 * @property {EstadoFiscal} estadoFiscal
 * @property {string | null} constanciaKey
 * @property {number} descuentoMax
 * @property {string} firmaKey
 * @property {string} pdfKey
 * @property {string} pdfSha256
 * @property {string | null} ip
 * @property {string | null} userAgent
 * @property {ObraAcordada[]} obras
 */

/**
 * @typedef {Object} AcuerdoGuardado
 * @property {string} id
 * @property {string} pdfKey
 * @property {Date} firmadoEn
 */
