/**
 * @typedef {Object} DatosArtista
 * @property {string} id
 * @property {string} nombre
 * @property {string} nombrePila
 * @property {string} rfc
 * @property {string} folio
 * @property {string} paquete
 * @property {string} correo
 * @property {string} telefono
 */

/**
 * @typedef {Object} ObraPdf
 * @property {string} obraId
 * @property {string} titulo
 * @property {string} tecnica
 * @property {string} medida
 * @property {number} gananciaOriginal
 * @property {Object} desglose
 * @property {number} desglose.ganancia
 * @property {number} desglose.precioVenta
 * @property {number} desglose.precioPublico
 */

/**
 * @typedef {Object} DatosPdf
 * @property {DatosArtista} artista
 * @property {ObraPdf[]} obras
 * @property {string} estadoFiscal - 'pendiente' | 'cargada' | 'verificada'
 * @property {string | null} constanciaNombre
 * @property {number} descuentoMax
 * @property {Object} datosPago
 * @property {string} datosPago.beneficiario
 * @property {string} datosPago.banco
 * @property {string} datosPago.clabe
 * @property {string} datosPago.cuenta
 * @property {string} datosPago.concepto
 * @property {string} datosPago.plazos
 * @property {Buffer | null} firmaArtistaPng
 * @property {Buffer} firmaDireccionPng
 * @property {Date} fecha
 * @property {boolean} borrador
 */

/**
 * Interfaz para generadores de PDF
 */
export class GeneradorPdf {
  /**
   * Genera un PDF del acuerdo de consignación
   * @param {DatosPdf} datos
   * @returns {Promise<Buffer>}
   */
  async generar(datos) {
    throw new Error('No implementado');
  }
}
