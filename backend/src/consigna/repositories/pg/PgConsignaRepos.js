/**
 * @typedef {import('pg').Pool} Pool
 * @typedef {import('../interfaces.js').InvitacionesRepo} InvitacionesRepo
 * @typedef {import('../interfaces.js').BorradoresRepo} BorradoresRepo
 * @typedef {import('../interfaces.js').AcuerdosRepo} AcuerdosRepo
 * @typedef {import('../interfaces.js').EventosRepo} EventosRepo
 * @typedef {import('../../domain/modelos.js').Invitacion} Invitacion
 * @typedef {import('../../domain/modelos.js').Borrador} Borrador
 * @typedef {import('../../domain/modelos.js').Acuerdo} Acuerdo
 * @typedef {import('../../domain/modelos.js').AcuerdoObra} AcuerdoObra
 */

/**
 * @implements {InvitacionesRepo}
 */
export class PgInvitacionesRepo {
  /**
   * @param {Pool} pool
   */
  constructor(pool) {
    this.pool = pool;
  }

  /**
   * @param {string} artistaId
   * @param {string} edicion
   * @param {string} tokenHash
   * @param {Date} expiraEn
   */
  async crear(artistaId, edicion, tokenHash, expiraEn) {
    await this.pool.query(
      `INSERT INTO consigna.invitaciones (artista_id, edicion, token_hash, expira_en)
       VALUES ($1, $2, $3, $4)`,
      [artistaId, edicion, tokenHash, expiraEn]
    );
  }

  /**
   * @param {string} tokenHash
   * @returns {Promise<Invitacion | null>}
   */
  async porTokenHash(tokenHash) {
    const r = await this.pool.query(
      'SELECT * FROM consigna.invitaciones WHERE token_hash = $1',
      [tokenHash]
    );
    if (!r.rows.length) return null;
    return this._mapear(r.rows[0]);
  }

  /**
   * @param {string} invitacionId
   */
  async marcarAbierta(invitacionId) {
    await this.pool.query(
      'UPDATE consigna.invitaciones SET abierta_en = NOW() WHERE id = $1',
      [invitacionId]
    );
  }

  /**
   * @param {string} invitacionId
   * @returns {Promise<Invitacion | null>}
   */
  async porId(invitacionId) {
    const r = await this.pool.query(
      'SELECT * FROM consigna.invitaciones WHERE id = $1',
      [invitacionId]
    );
    if (!r.rows.length) return null;
    return this._mapear(r.rows[0]);
  }

  /**
   * @private
   * @param {any} row
   * @returns {Invitacion}
   */
  _mapear(row) {
    return {
      id: row.id,
      artistaId: row.artista_id,
      edicion: row.edicion,
      creadaEn: row.creada_en,
      expiraEn: row.expira_en,
      abiertaEn: row.abierta_en,
      revocada: row.revocada,
    };
  }
}

/**
 * @implements {BorradoresRepo}
 */
export class PgBorradoresRepo {
  /**
   * @param {Pool} pool
   */
  constructor(pool) {
    this.pool = pool;
  }

  /**
   * @param {string} invitacionId
   * @returns {Promise<Borrador | null>}
   */
  async porInvitacion(invitacionId) {
    const r = await this.pool.query(
      'SELECT * FROM consigna.borradores WHERE invitacion_id = $1',
      [invitacionId]
    );
    if (!r.rows.length) return null;
    return {
      id: r.rows[0].id,
      invitacionId: r.rows[0].invitacion_id,
      datos: r.rows[0].datos,
      actualizadoEn: r.rows[0].actualizado_en,
    };
  }

  /**
   * @param {string} invitacionId
   * @param {any} datos
   */
  async guardar(invitacionId, datos) {
    await this.pool.query(
      `INSERT INTO consigna.borradores (invitacion_id, datos)
       VALUES ($1, $2)
       ON CONFLICT (invitacion_id) DO UPDATE SET datos = $2, actualizado_en = NOW()`,
      [invitacionId, datos]
    );
  }
}

/**
 * @implements {AcuerdosRepo}
 */
export class PgAcuerdosRepo {
  /**
   * @param {Pool} pool
   */
  constructor(pool) {
    this.pool = pool;
  }

  /**
   * @param {string} invitacionId
   * @returns {Promise<Acuerdo | null>}
   */
  async porInvitacion(invitacionId) {
    const r = await this.pool.query(
      'SELECT * FROM consigna.acuerdos WHERE invitacion_id = $1',
      [invitacionId]
    );
    if (!r.rows.length) return null;
    return this._mapear(r.rows[0]);
  }

  /**
   * @param {string} invitacionId
   * @param {string} artistaId
   * @param {any} datos
   * @param {string} pdfKey
   * @param {string} firmaKey
   * @param {string} datosKey
   * @returns {Promise<string>}
   */
  async crear(invitacionId, artistaId, datos, pdfKey, firmaKey, datosKey) {
    const r = await this.pool.query(
      `INSERT INTO consigna.acuerdos
       (invitacion_id, artista_id, datos, pdf_key, firma_key, datos_key)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [invitacionId, artistaId, datos, pdfKey, firmaKey, datosKey]
    );
    const acuerdoId = r.rows[0].id;

    // Insertar obras
    if (datos.obras && Array.isArray(datos.obras)) {
      for (const o of datos.obras) {
        await this.pool.query(
          `INSERT INTO consigna.acuerdo_obras
           (acuerdo_id, obra_id, titulo, tecnica, medida, ganancia, precio_venta, precio_publico)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            acuerdoId,
            o.obraId,
            o.titulo,
            o.tecnica,
            o.medida,
            o.ganancia,
            o.precioVenta,
            o.precioPublico,
          ]
        );
      }
    }

    return acuerdoId;
  }

  /**
   * @param {string} acuerdoId
   * @returns {Promise<Acuerdo | null>}
   */
  async porId(acuerdoId) {
    const r = await this.pool.query(
      'SELECT * FROM consigna.acuerdos WHERE id = $1',
      [acuerdoId]
    );
    if (!r.rows.length) return null;
    return this._mapear(r.rows[0]);
  }

  /**
   * @param {string} acuerdoId
   * @returns {Promise<AcuerdoObra[]>}
   */
  async obrasPorAcuerdo(acuerdoId) {
    const r = await this.pool.query(
      'SELECT * FROM consigna.acuerdo_obras WHERE acuerdo_id = $1 ORDER BY titulo',
      [acuerdoId]
    );
    return r.rows.map(row => ({
      id: row.id,
      acuerdoId: row.acuerdo_id,
      obraId: row.obra_id,
      titulo: row.titulo,
      tecnica: row.tecnica,
      medida: row.medida,
      ganancia: parseFloat(row.ganancia),
      precioVenta: parseFloat(row.precio_venta),
      precioPublico: parseFloat(row.precio_publico),
    }));
  }

  /**
   * @private
   * @param {any} row
   * @returns {Acuerdo}
   */
  _mapear(row) {
    return {
      id: row.id,
      invitacionId: row.invitacion_id,
      artistaId: row.artista_id,
      datos: row.datos,
      pdfKey: row.pdf_key,
      firmaKey: row.firma_key,
      datosKey: row.datos_key,
      firmadoEn: row.firmado_en,
    };
  }
}

/**
 * @implements {EventosRepo}
 */
export class PgEventosRepo {
  /**
   * @param {Pool} pool
   */
  constructor(pool) {
    this.pool = pool;
  }

  /**
   * @param {string} invitacionId
   * @param {string} tipo
   * @param {any | null} detalle
   * @param {string | null} ip
   */
  async registrar(invitacionId, tipo, detalle, ip) {
    await this.pool.query(
      `INSERT INTO consigna.eventos (invitacion_id, tipo, detalle, ip)
       VALUES ($1, $2, $3, $4)`,
      [invitacionId, tipo, detalle, ip]
    );
  }
}
