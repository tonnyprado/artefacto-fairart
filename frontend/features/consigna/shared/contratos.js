// Contratos HTTP compartidos (DTOs). ⚠ Mantener IDÉNTICO en backend y frontend.

/**
 * @typedef {'cargada' | 'pendiente' | 'tercero_sin_datos'} EstadoFiscal
 */

/**
 * @typedef {Object} ArtistaDTO
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
 * @typedef {Object} ObraDTO
 * @property {string} id
 * @property {string} titulo
 * @property {string} tecnica - "Óleo sobre lino, 2025"
 * @property {string} medida - con marco
 * @property {number} gananciaRegistrada
 */

/**
 * @typedef {Object} DatosPagoDTO
 * @property {string} beneficiario
 * @property {string} banco
 * @property {string} clabe
 * @property {string} cuenta
 * @property {string} concepto - "PAQUETE MARIA RUIZ AF2"
 * @property {string} plazos
 */

/**
 * @typedef {Object} BorradorDTO
 * @property {number} paso
 * @property {number} maxPaso
 * @property {EstadoFiscal | null} estadoFiscal
 * @property {{key: string; nombre: string} | null} constancia
 * @property {number | null} descuentoMax
 * @property {Record<string, number>} ganancias - obraId → ganancia editada
 * @property {boolean} acepto
 */

/**
 * @typedef {Object} ContextoConsignaDTO
 * @property {ArtistaDTO} artista
 * @property {ObraDTO[]} obras
 * @property {DatosPagoDTO} datosPago
 * @property {{whatsapp: string; url: string}} contacto
 * @property {BorradorDTO | null} borrador
 * @property {{acuerdoId: string; enviadoEn: string} | null} enviado
 * @property {string} versionAcuerdo
 */

/**
 * @typedef {Object} EnvioAcuerdoDTO
 * @property {EstadoFiscal} estadoFiscal
 * @property {string | null} constanciaKey
 * @property {number} descuentoMax
 * @property {{obraId: string; gananciaFinal: number}[]} obras
 * @property {true} acepto
 * @property {string} firmaPng - data:image/png;base64,...
 */

/**
 * @typedef {Object} ResultadoEnvioDTO
 * @property {string} acuerdoId
 * @property {string} pdfUrl - URL prefirmada S3 (expira)
 */

/**
 * @typedef {Object} SubidaConstanciaDTO
 * @property {string} uploadUrl
 * @property {string} key
 */

// Exportamos un objeto dummy para que el módulo sea válido
export const __types = {};
