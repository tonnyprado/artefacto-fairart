import crypto from 'node:crypto';

/**
 * @typedef {import('../repositories/interfaces.js').RegistroArtistasLectura} RegistroArtistasLectura
 * @typedef {import('../repositories/interfaces.js').BorradoresRepo} BorradoresRepo
 * @typedef {import('../repositories/interfaces.js').AcuerdosRepo} AcuerdosRepo
 * @typedef {import('../repositories/interfaces.js').EventosRepo} EventosRepo
 * @typedef {import('../infra/almacenamiento.js').Almacenamiento} Almacenamiento
 * @typedef {import('../infra/notificaciones.js').Notificador} Notificador
 * @typedef {import('../pdf/GeneradorPdf.js').GeneradorPdf} GeneradorPdf
 * @typedef {import('../domain/modelos.js').Invitacion} Invitacion
 * @typedef {import('../domain/modelos.js').ObraAcordada} ObraAcordada
 * @typedef {import('../domain/modelos.js').ArtistaRegistro} ArtistaRegistro
 * @typedef {import('../shared/contratos.js').ContextoConsignaDTO} ContextoConsignaDTO
 * @typedef {import('../shared/contratos.js').BorradorDTO} BorradorDTO
 * @typedef {import('../shared/contratos.js').EnvioAcuerdoDTO} EnvioAcuerdoDTO
 * @typedef {import('../shared/contratos.js').ResultadoEnvioDTO} ResultadoEnvioDTO
 * @typedef {import('../shared/contratos.js').DatosPagoDTO} DatosPagoDTO
 * @typedef {import('../shared/contratos.js').SubidaConstanciaDTO} SubidaConstanciaDTO
 */

import { desglosar } from '../shared/precios.js';
import { VERSION_ACUERDO } from '../shared/acuerdo.js';
import { conceptoPago } from '../domain/conceptoPago.js';
import { NoEncontrado, YaEnviado, Invalido } from '../domain/errores.js';

/**
 * @typedef {Object} ConfigConsigna
 * @property {Omit<DatosPagoDTO, 'concepto'>} pago
 * @property {string} sufijoEdicion
 * @property {{ whatsapp: string; url: string }} contacto
 * @property {string} firmaDireccionKey
 * @property {string[]} correosAdmin
 */

/**
 * @typedef {Object} Peticion
 * @property {string | null} ip
 * @property {string | null} userAgent
 */

const MAX_FIRMA_BYTES = 600_000;
const TIPOS_CONSTANCIA = ['application/pdf', 'image/jpeg', 'image/png'];

// Orquesta el caso de uso "confirmar consignación". Cada dependencia es una
// abstracción inyectada (DIP); la lógica de precios vive en shared/precios.
export class ConsignaService {
  /**
   * @param {RegistroArtistasLectura} registro
   * @param {BorradoresRepo} borradores
   * @param {AcuerdosRepo} acuerdos
   * @param {EventosRepo} eventos
   * @param {Almacenamiento} archivos
   * @param {GeneradorPdf} pdf
   * @param {Notificador} correo
   * @param {ConfigConsigna} cfg
   */
  constructor(registro, borradores, acuerdos, eventos, archivos, pdf, correo, cfg) {
    this.registro = registro;
    this.borradores = borradores;
    this.acuerdos = acuerdos;
    this.eventos = eventos;
    this.archivos = archivos;
    this.pdf = pdf;
    this.correo = correo;
    this.cfg = cfg;
  }

  /**
   * @private
   * @param {Invitacion} inv
   * @returns {Promise<ArtistaRegistro>}
   */
  async artista(inv) {
    const a = await this.registro.porId(inv.artistaId);
    if (!a) throw NoEncontrado('No encontramos tu registro. Escríbenos por WhatsApp.');
    return a;
  }

  /**
   * @private
   * @param {ArtistaRegistro} a
   * @returns {DatosPagoDTO}
   */
  datosPago(a) {
    return { ...this.cfg.pago, concepto: conceptoPago(a.nombrePila, a.apellido, this.cfg.sufijoEdicion) };
  }

  /**
   * @param {Invitacion} inv
   * @returns {Promise<ContextoConsignaDTO>}
   */
  async contexto(inv) {
    const a = await this.artista(inv);
    const [obras, borradorRecord, enviado] = await Promise.all([
      this.registro.obrasPostuladas(inv.artistaId),
      this.borradores.porInvitacion(inv.id),
      this.acuerdos.porInvitacion(inv.id),
    ]);
    const { apellido, ...artista } = a;
    return {
      artista,
      obras,
      borrador: borradorRecord?.datos ?? null,
      versionAcuerdo: VERSION_ACUERDO,
      datosPago: this.datosPago(a),
      contacto: this.cfg.contacto,
      enviado: enviado ? { acuerdoId: enviado.id, enviadoEn: enviado.firmadoEn.toISOString() } : null,
    };
  }

  /**
   * @param {Invitacion} inv
   * @param {BorradorDTO} b
   * @returns {Promise<void>}
   */
  async guardarBorrador(inv, b) {
    if (await this.acuerdos.porInvitacion(inv.id)) return; // después de enviar, solo lectura
    await this.borradores.guardar(inv.id, b);
  }

  /**
   * @param {Invitacion} inv
   * @param {string} nombre
   * @param {string} tipo
   * @param {number} tamano
   * @returns {Promise<SubidaConstanciaDTO>}
   */
  async urlSubidaConstancia(inv, nombre, tipo, tamano) {
    if (!TIPOS_CONSTANCIA.includes(tipo)) throw Invalido('Sube un PDF o una imagen (JPG/PNG).');
    if (tamano > 10 * 1024 * 1024) throw Invalido('El archivo debe pesar menos de 10 MB.');
    const ext = tipo === 'application/pdf' ? 'pdf' : tipo.split('/')[1];
    const key = `constancias/${inv.artistaId}/${crypto.randomUUID()}.${ext}`;
    await this.eventos.registrar(inv.id, 'constancia_url', { nombre, tipo, tamano });
    return { key, uploadUrl: await this.archivos.urlSubida(key, tipo) };
  }

  /**
   * Recalcula en servidor; nunca usa montos del cliente.
   * @private
   * @param {Invitacion} inv
   * @param {Pick<EnvioAcuerdoDTO, 'obras'>} dto
   * @returns {Promise<ObraAcordada[]>}
   */
  async obrasAcordadas(inv, dto) {
    const registradas = await this.registro.obrasPostuladas(inv.artistaId);
    const finales = new Map(dto.obras.map(o => [o.obraId, o.gananciaFinal]));
    return registradas.map(o => ({
      obraId: o.id,
      titulo: o.titulo,
      tecnica: o.tecnica,
      medida: o.medida,
      gananciaOriginal: o.gananciaRegistrada,
      desglose: desglosar(finales.get(o.id) ?? o.gananciaRegistrada),
    }));
  }

  /**
   * @private
   * @param {string | undefined} dataUrl
   * @returns {Buffer | null}
   */
  firmaBuffer(dataUrl) {
    if (!dataUrl) return null;
    const m = /^data:image\/png;base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
    if (!m) throw Invalido('Firma inválida.');
    const buf = Buffer.from(m[1], 'base64');
    if (buf.length > MAX_FIRMA_BYTES) throw Invalido('La firma es demasiado grande.');
    return buf;
  }

  /**
   * @private
   * @param {string | null} key
   * @returns {string | null}
   */
  constanciaNombre(key) {
    return key ? key.split('/').pop() : null;
  }

  /**
   * @param {Invitacion} inv
   * @param {Partial<EnvioAcuerdoDTO>} dto
   * @returns {Promise<Buffer>}
   */
  async vistaPrevia(inv, dto) {
    const a = await this.artista(inv);
    const { apellido, ...artista } = a;
    return this.pdf.generar({
      artista,
      obras: await this.obrasAcordadas(inv, { obras: dto.obras ?? [] }),
      estadoFiscal: dto.estadoFiscal ?? 'pendiente',
      constanciaNombre: this.constanciaNombre(dto.constanciaKey ?? null),
      descuentoMax: dto.descuentoMax ?? 0,
      datosPago: this.datosPago(a),
      firmaArtistaPng: this.firmaBuffer(dto.firmaPng),
      firmaDireccionPng: await this.archivos.leer(this.cfg.firmaDireccionKey),
      fecha: new Date(),
      borrador: true,
    });
  }

  /**
   * @param {Invitacion} inv
   * @param {EnvioAcuerdoDTO} dto
   * @param {Peticion} req
   * @returns {Promise<ResultadoEnvioDTO>}
   */
  async enviar(inv, dto, req) {
    if (await this.acuerdos.porInvitacion(inv.id)) throw YaEnviado();
    if (dto.estadoFiscal === 'cargada' && !dto.constanciaKey) throw Invalido('Falta la constancia.');
    if (dto.constanciaKey && !dto.constanciaKey.startsWith(`constancias/${inv.artistaId}/`)) {
      throw Invalido('Constancia inválida.');
    }

    const a = await this.artista(inv);
    const { apellido, ...artista } = a;
    const firma = this.firmaBuffer(dto.firmaPng);
    const obras = await this.obrasAcordadas(inv, dto);
    const pdf = await this.pdf.generar({
      artista,
      obras,
      estadoFiscal: dto.estadoFiscal,
      constanciaNombre: this.constanciaNombre(dto.constanciaKey),
      descuentoMax: dto.descuentoMax,
      datosPago: this.datosPago(a),
      firmaArtistaPng: firma,
      firmaDireccionPng: await this.archivos.leer(this.cfg.firmaDireccionKey),
      fecha: new Date(),
      borrador: false,
    });

    const base = `acuerdos/${a.folio}/${Date.now()}`;
    const firmaKey = `${base}-firma.png`;
    const pdfKey = `${base}-acuerdo.pdf`;
    await this.archivos.subir(firmaKey, firma, 'image/png');
    await this.archivos.subir(pdfKey, pdf, 'application/pdf');

    const guardado = await this.acuerdos.crear({
      invitacionId: inv.id,
      artistaId: inv.artistaId,
      folio: a.folio,
      versionAcuerdo: VERSION_ACUERDO,
      snapshotArtista: artista,
      estadoFiscal: dto.estadoFiscal,
      constanciaKey: dto.constanciaKey,
      descuentoMax: dto.descuentoMax,
      firmaKey,
      pdfKey,
      pdfSha256: crypto.createHash('sha256').update(pdf).digest('hex'),
      ip: req.ip,
      userAgent: req.userAgent,
      obras,
    });
    await this.eventos.registrar(inv.id, 'enviado', { acuerdoId: guardado.id }, req.ip);

    const nombreArchivo = `Acuerdo-Consignacion-${a.folio}.pdf`;
    const cambios = obras.filter(o => o.gananciaOriginal !== o.desglose.ganancia).length;
    // No bloquear la respuesta si el correo falla: se registra y se reintenta desde el panel.
    Promise.allSettled([
      this.correo.enviar({
        para: [a.correo],
        asunto: 'Tu acuerdo de consignación · ARTE FACTO',
        texto: `Hola ${a.nombrePila}:\n\nAdjuntamos tu acuerdo firmado. Recuerda cubrir el 50% de tu paquete en las próximas 48 horas.\n\nConcepto: ${this.datosPago(a).concepto}\nCLABE: ${this.cfg.pago.clabe}\n\nARTE FACTO`,
        adjuntos: [{ nombre: nombreArchivo, contenido: pdf, tipo: 'application/pdf' }],
      }),
      this.correo.enviar({
        para: this.cfg.correosAdmin,
        asunto: `Acuerdo firmado · ${a.folio} · ${a.nombre}`,
        texto: `Fiscal: ${dto.estadoFiscal}\nDescuento máx.: ${dto.descuentoMax}%\nPrecios modificados: ${cambios}`,
        adjuntos: [{ nombre: nombreArchivo, contenido: pdf, tipo: 'application/pdf' }],
      }),
    ]).then(r => r.forEach(x => x.status === 'rejected' && console.error('[correo]', x.reason)));

    return { acuerdoId: guardado.id, pdfUrl: await this.archivos.urlDescarga(pdfKey, 900, nombreArchivo) };
  }

  /**
   * @param {Invitacion} inv
   * @returns {Promise<string>}
   */
  async urlPdfEnviado(inv) {
    const a = await this.acuerdos.porInvitacion(inv.id);
    if (!a) throw NoEncontrado('Aún no has enviado tu acuerdo.');
    return this.archivos.urlDescarga(a.pdfKey, 900, `Acuerdo-Consignacion.pdf`);
  }
}
